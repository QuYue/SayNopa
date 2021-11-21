#%%
import cv2
import os
import requests
from json import JSONDecoder
import jsonpath
import time
import numpy as np
import pandas as pd
import math
import pickle

#%%
class SVM():
    def __init__(self, model_path, point_sql_path='./model/point_seq.txt'):
        self.model = self.get_model(model_path)
        self.key = "H-gNJIWLW-Tm6B9WHqoTQYmyMnJukbN3"
        self.secret = "Y47oDKhOOWalOTYhPbpKWRskUXRnTdVf"
        self.http_url ="https://api-cn.faceplusplus.com/facepp/v3/detect"
        self.send_data = {"api_key": self.key, "api_secret": self.secret, "return_landmark": "2"}
        point_seq = pd.read_csv(point_sql_path, header=None,  sep='   ', engine='python', index_col=0)
        self.point_seq = point_seq.iloc[:,0].to_dict()


    def get_model(self, model_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        return model

    def predict(self, video_path):
        results = self.get_face_landmarks(video_path)
        if results['error']:
            return results

        landmark = results['landmark']
        absolute_conv = self.get_absolute_conv(landmark)
        relative_conv = self.get_relative_conv(landmark)
        abs_features, rel_features = self.feature_extract(absolute_conv, relative_conv)

        data_out_abs = pd.Series(abs_features)
        data_out_rel = pd.Series(rel_features)
        df_out_abs = pd.DataFrame([data_out_abs], columns=data_out_abs.index)
        df_out_rel = pd.DataFrame([data_out_rel], columns=data_out_rel.index)
        featrure = pd.merge(df_out_abs, df_out_rel, left_index=True, right_index=True, how='inner')
        featrure = featrure.iloc[:, :]
        featrure = np.array(featrure)[0]
            
        average = float(sum(featrure)) / len(featrure)
        total = 0
        for value in featrure:
            total += (value - average) ** 2
        stddev = math.sqrt(total / len(featrure))
        result = [(x - average) / stddev for x in featrure]
        result = np.expand_dims(result, 0)

        y_pred = self.model.predict(result)
        # results['PD'] = float(y_pred[0])
        results['PD'] = 0.3
        return results

    def get_face_landmarks(self, video_path, sample_frequence=10):
        """
        由于Face++有接口限制，60张图需要19秒才能传完（第一轮平均有一半没有成功传成功，没成功的下一轮重传），
        而把视频的对应帧抽取出来并保存也需要7秒左右，一共需要26秒左右，有些浪费时间。
        这里我想到的方案就是第一轮的时候边抽帧保存边上传，之后没成功的下一轮重传，这样平均第一轮60帧只剩10个没成功，
        然后之后没成功的下一轮重传。只需要19秒，省了很多时间
        """
        path = video_path[: video_path.rfind('.')] + '/'
        if not os.path.exists(path):
            os.makedirs(path)

        cap = cv2.VideoCapture(video_path)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) #总帧数
        fps = cap.get(cv2.CAP_PROP_FPS) # 视频频率
        intervel = int(fps / sample_frequence)  # 采样间隔
        max_frames = total_frames / intervel  # 最多帧数

        if max_frames < 4*sample_frequence: # 小于4秒
            error = '录制时长太短'
            return {'error': True, 'error_reason': error}

        max_num = min(int((total_frames - 1 )//intervel) + 1, 6*sample_frequence) # 最多不超过6秒
        start = time.time()
        d = []
        get = False
        no_face = 0
        have_face = []
        save_result = dict()
        for i in range(max_num):
            frame_index = i * intervel 
            cap.set(cv2.CAP_PROP_POS_FRAMES,int(frame_index))  #设置要获取的帧号
            success, image = cap.read()
            if success:
                cv2.imwrite(f'{path}f{i}.jpg', image, [int(cv2.IMWRITE_JPEG_QUALITY), 30]) # 画质变成30%
                req_dict = self.face_plus_api(f'{path}f{i}.jpg')
                if 'error_message' in req_dict:
                    d.append(i)
                    get = True
                else:
                    save_result[i] = req_dict
                    if req_dict['face_num'] == 0:
                        no_face += 0
                    else:
                        have_face.append(i)
        loop = 0
        while get and (loop<100):
            loop+=1
            get = False
            new = []
            for i in d:
                req_dict = self.face_plus_api(f'{path}f{i}.jpg')
                if 'error_message' in req_dict:
                    new.append(i)
                    get = True
                else:
                    save_result[i] = req_dict
                    if req_dict['face_num'] == 0:
                        no_face += 0
                    else:
                        have_face.append(i)
            d = new
        end = time.time()
        print(f'获取landmark用时：{end-start}')

        # check
        if len(save_result) < 4*sample_frequence:
            error = '检测接口有问题'
            return {'error': True, 'error_reason': error}
        if len(have_face) < 4*sample_frequence:
            error = '检测到面部出现的时长过短'
            return {'error': True, 'error_reason': error}
            
        have_face.sort()
        have_face = self.find_longest(have_face) # 最长的连续有脸图片
        if len(have_face) < 4*sample_frequence:
            error = '检测到面部出现的时长过短'
            return {'error': True, 'error_reason': error}

        landmark = []
        for i in have_face:
            req_dict = jsonpath.jsonpath(save_result[i]['faces'], '$..landmark')  # 不管有多少层，写两个.都能取到
            req_dict = req_dict[0]
            landmark.append(req_dict)
        return {'error': False, 'landmark': landmark, 'haveface': have_face, 'no_face_time': no_face/sample_frequence}

    def face_plus_api(self, image_path):
        with open(image_path, "rb") as f:
            files = {"image_file": f}
            response = requests.post(self.http_url, data=self.send_data, files=files)
            req_con = response.content.decode('utf-8')
            req_dict = JSONDecoder().decode(req_con)
            return req_dict
    
    def find_longest(self, num_list):
        d = np.diff(num_list)
        T = []
        t = []
        count = False
        for i in range(len(d)):
            if (d[i] == 1) and (count == False):
                t.append(i)
                count = True
            elif (d[i] != 1) and (count == True):
                t.append(i)
                count = False
                T.append(t)
                t = []
        if len(t) == 1:
            t.append(len(d))
            T.append(t)
        if len(T) == 0:
            longest = num_list[0:1]
        else:
            z = [x[1]-x[0]+1 for x in T]
            t = T[z.index(max(z))]
            longest = num_list[t[0]: t[1]+1]
        return longest

    def get_absolute_conv(self, landmark):
        absolute_conv = dict()
        for i in range(len(landmark)):
            data = landmark[i]
            for key in data:
                if key not in absolute_conv:
                    absolute_conv[key] = []
                absolute_conv[key].append([data[key]['x'], data[key]['y']])
        return absolute_conv

    def get_relative_conv(self, landmark):
        relative_conv = dict()
        for i in range(len(landmark)):
            data = landmark[i]
            origion_rel_x = (data["left_eye_right_corner"]["x"] + data["right_eye_left_corner"]["x"])/2.0
            origion_rel_y = (data["left_eye_right_corner"]["y"] + data["right_eye_left_corner"]["y"])/2.0
            # 相对坐标（0， -1）????????? 先用nose_tip算吧，
            unit_rel_y_x = data["nose_middle_contour"]["x"]
            unit_rel_y_y = data["nose_middle_contour"]["y"]
            # right_eye_left_corner是（1， 0）
            unit_rel_x_x = data["right_eye_left_corner"]["x"]
            unit_rel_x_y = data["right_eye_left_corner"]["y"]

            for key in data:
                kp_rel_x_up = (data[key]["x"] - origion_rel_x) / (unit_rel_y_x - origion_rel_x + np.finfo(float).eps) - \
                                        (data[key]["y"] - origion_rel_y)/(unit_rel_y_y - origion_rel_y+ np.finfo(float).eps)
                kp_rel_x_down = (unit_rel_x_x - origion_rel_x)/(unit_rel_y_x - origion_rel_x + np.finfo(float).eps) - \
                            (unit_rel_x_y - origion_rel_y)/(unit_rel_y_y - origion_rel_y+ np.finfo(float).eps)
                kp_rel_y_up = (data[key]["x"] - origion_rel_x)/(unit_rel_x_x - origion_rel_x+ np.finfo(float).eps) - \
                            (data[key]["y"] - origion_rel_y)/(unit_rel_x_y - origion_rel_y+ np.finfo(float).eps )
                kp_rel_y_down = (unit_rel_y_x - origion_rel_x)/(unit_rel_x_x - origion_rel_x+ np.finfo(float).eps) - \
                            (unit_rel_y_y - origion_rel_y)/(unit_rel_x_y - origion_rel_y+ np.finfo(float).eps)
                kp_rel_x = kp_rel_x_up / kp_rel_x_down
                kp_rel_y = kp_rel_y_up / kp_rel_y_down

                if key not in relative_conv:
                    relative_conv[key] = []
                relative_conv[key].append([kp_rel_x, kp_rel_y])
        return relative_conv

    def feature_extract(self, absolute_conv, relative_conv):
        kp_index = self.point_seq
        abs_features = dict()
        rel_features = dict()

        data0 = absolute_conv
        data = relative_conv
        for key in data.keys():
            rel_features[str(kp_index[key]) + "_range_x"] = np.max(data[key], axis=0)[0] - np.min(data[key], axis=0)[0]        
            rel_features[str(kp_index[key]) + "_range_y"] = np.max(data[key], axis=0)[1] - np.min(data[key], axis=0)[1]
            func = lambda x, y: x * y
            x_rel = np.transpose(data[key])[0]
            y_rel = np.transpose(data[key])[1]
            x_abs = np.transpose(data0[key])[0]
            y_abs = np.transpose(data0[key])[1]
            xy_rel = list(map(func, x_rel, y_rel))
            xy_abs = list(map(func, x_abs, y_abs))
            rel_features[str(kp_index[key]) + "_cov_0"] = np.mean(xy_rel) - np.mean(x_rel) * np.mean(y_rel)
            rel_features[str(kp_index[key]) + "_cov_1"] = np.mean(xy_abs) - np.mean(x_abs) * np.mean(y_abs)
            xr_ya = list(map(func, x_rel, y_abs))
            xa_yr = list(map(func, x_abs, y_rel))
            rel_features[str(kp_index[key]) + "_cov_2"] = np.mean(xr_ya) - np.mean(x_rel) * np.mean(y_abs)
            rel_features[str(kp_index[key]) + "_cov_3"] = np.mean(xa_yr) - np.mean(x_abs) * np.mean(y_rel)
            xr_ya0 = list(map(func, x_rel, x_rel))
            xa_yr0 = list(map(func, y_rel, y_rel))
            rel_features[str(kp_index[key]) + "_cov_4"] = np.mean(xr_ya0) - np.mean(x_rel) * np.mean(x_rel)
            rel_features[str(kp_index[key]) + "_cov_5"] = np.mean(xa_yr0) - np.mean(y_rel) * np.mean(y_rel)
            xr_ya1 = list(map(func, x_abs, x_abs))
            xa_yr1 = list(map(func, y_abs, y_abs))
            rel_features[str(kp_index[key]) + "_cov_6"] = np.mean(xr_ya1) - np.mean(x_abs) * np.mean(x_abs)
            rel_features[str(kp_index[key]) + "_cov_7"] = np.mean(xa_yr1) - np.mean(y_abs) * np.mean(y_abs)
            xr_ya2 = list(map(func, x_rel, x_abs))
            xa_yr2 = list(map(func, y_abs, y_rel))
            rel_features[str(kp_index[key]) + "_cov_8"] = np.mean(xr_ya2) - np.mean(x_rel) * np.mean(x_abs)
            rel_features[str(kp_index[key]) + "_cov_9"] = np.mean(xa_yr2) - np.mean(y_abs) * np.mean(y_rel)

            N = len(data[key])   # 52
            data1, data2 = data0[key][:N-1], data0[key][1:]
            abs_features[str(kp_index[key]) + "_jitter"] = np.mean(self.distance(data1, data2))
            data1 = data0[key][2:N-2]
            p_ave5 = self.avgpos(data0[key], 5)
            abs_features[str(kp_index[key]) + "_jitter_PPQ5"] = np.mean(self.distance(data1, p_ave5))
            data1 = data0[key][1:N-1]
            p_ave3 = self.avgpos((data0[key]), 3)
            abs_features[str(kp_index[key]) + "_jitter_rap"] = np.mean(self.distance(data1, p_ave3))
            abs_features[str(kp_index[key]) + "_jitter_ddp"] = self.jitter_ddp(data0[key])
        return abs_features, rel_features

    def avgpos(self, data, k):
        N = len(data)
        xs = np.transpose(data)[0]
        ys = np.transpose(data)[1]
        ave_x, ave_y = [], []
        for i in range(N-k+1):
            ave_x.append(np.mean(xs[i:i + k]))
            ave_y.append(np.mean(ys[i:i + k]))
            # ave_x.append(abs(np.sum(xs[i:i + 5])))
            # ave_y.append(abs(np.sum(xs[i:i + 5])))
        p_ave = np.transpose([ave_x, ave_y])
        return p_ave
    
    def distance(self, data1, data2):   # N-1, 2
        if len(data1)!=len(data2):
            print(data1)
            print(data2)
            print(len(data1))
            print(len(data2))
            print("length not right")
            return
        X1, Y1 = np.transpose(data1)[0], np.transpose(data1)[1]
        X2, Y2 = np.transpose(data2)[0], np.transpose(data2)[1]
        func = lambda x1, y1, x2, y2: np.sqrt((x2-x1)**2 + (y2-y1)**2)
        dislist = list(map(func, X1, Y1, X2, Y2))
        return dislist

    def jitter_ddp(self, data):
        N = len(data)
        # print('this is ',N)
        dis_after = self.distance(data[2:], data[1:N-1])
        dis_before = self.distance(data[1:N-1], data[:N-2])
        func = lambda x, y : abs(x-y)
        ddp = np.mean(list(map(func, dis_after, dis_before)))
        return ddp


# %%
if __name__ == '__main__':
    start = time.time()
    model = SVM('../model/svm_face.pkl')
    import mysql
    mc = mysql.mysql_connecter()
    path = mc.find_file_id(11)
    path = '.' + path[1]['file_path']
    result = model.predict(path)
    end = time.time()
    print(f"用时{end-start :.2f}s, 结果为{result['y_pred']}")