#!/usr/bin/env python
# -*-coding:utf-8 -*-
'''
@File    :   run.py
@Time    :   2021/10/11 14:50:32
@Author  :   QuYue 
@Email   :   quyue1541@gmail.com
@Desc    :   Run the server (shell).
'''
#%% Import Packages
import os
import time
import json
import requests
import datetime
from flask import Flask, request, render_template, jsonify
import mysql


#%%
app = Flask(__name__)
mc = mysql.mysql_connecter()
# 设置开启web服务后，如果更新html文件，可以使更新立即生效
# app.jinjia_env.auto_reload = True
# app.config['TEMPLATES_AUTO_RELOAD'] = True
def time_in_detail(input_time):
    return time.strftime('%Y年%m月%d日 %H时%M分%S秒', time.localtime(input_time))

@app.route('/')
def home():
    return "Hello world"

@app.route('/connect', methods=['POST'])
def connect():
    data = request.get_json()
    if data:
        pass
    else:
        data = request.get_data()
        data = json.loads(data)
    print(data)
    receive_time = time.time()
    receive_time_d = time.strftime('%Y年%m月%d日 %H时%M分%S秒', time.localtime(time.time()))
    send_time = float(data['send_time'])
    print(f'于{time_in_detail(receive_time)}连接成功')
    return json.dumps({'status': 'success', 'TimeDelay':receive_time-send_time, 'receive_time': receive_time})

@app.route('/connect2', methods=['POST'])
def connect2():
    data = request.get_json()
    if data:
        pass
    else:
        data = request.get_data()
        data = json.loads(data)
    receive_time = time.time()
    get = data['get']
    get = get[1:-1]
    response = requests.get(get)
    data = json.loads(response.content)
    open_id = data['openid']
    print(f'open_id: {open_id} 请求登录')
    result = mc.find_user_openid(open_id)
    if result[0] == 'exist':
        result[1]['ifnew'] = False
        result[1]['error'] = False
    else:
        result[1]['ifnew'] = True
        d = mc.add_user_openid(open_id)
        if d == 'success':
            result = mc.find_user_openid(open_id)
            result[1]['error'] = False
        else:
            result = [0, {'error':True, 'open_id':open_id}]
    return json.dumps(result[1])

@app.route('/alter_username', methods=['POST'])
def alter_username():
    data = request.get_json()
    if data:
        pass
    else:
        data = request.get_data()
        data = json.loads(data)
    open_id = data['open_id'][1:-1]
    user_name = data['user_name'][1:-1]
    user_name = user_name.strip()
    if len(user_name) == 0:
        result = {'status': 'empty'}
    else:
        result = mc.alter_username_openid(open_id, user_name)
        result['user_name'] = user_name
    return json.dumps(result)

@app.route('/speech/<open_id>', methods=['POST'])
def get_speech(open_id):
    received_file = request.files['file']
    received_file_name = received_file.filename
    file_type = received_file_name.split('.')[-1]
    if received_file: 
        received_dirPath = f'./resources/received_file/{open_id}/'
        if not os.path.isdir(received_dirPath):
            os.makedirs(received_dirPath)
        save_time = datetime.datetime.now()
        file_name = save_time.strftime("%Y-%m-%d_%H-%M-%S")+'.'+file_type
        file_path = os.path.join(received_dirPath, file_name)
        try:
            received_file.save(file_path)
            message = f'文件成功保存到{file_path}'
        except:
            message = '文件保存出错'

        if message[2] == '成':
            status = mc.add_file_openid(open_id, file_path, save_time)
            status = status['status']
        else:
            status = 'error'
    else:
        message = '未接收到文件'
    print({'status': status, 'message': message})
    return json.dumps({'status': status, 'message': message})

@app.route('/diagnose', methods=['POST'])
def diagnose():
    start_time = time.time()
    received_file = request.files['file']
    image_name = received_file.filename
    if received_file:
        received_dirPath = './resources/received_file'
        if not os.path.isdir(received_dirPath):
            os.makedirs(received_dirPath)
        image_path = os.path.join(received_dirPath, image_name)
        try:
            received_file.save(image_path)
            message = f'文件保存到{image_path}'
        except:
            message = '文件保存出错'
    else:
        message = '未接收到文件'
    end_time = time.time()
    print(f'{message} 用时{end_time-start_time :.2f}s')
    end_time = time.time()
    return message



if __name__ == '__main__':
    print("""SayNopa Server -- Version 0.0
本产品的版权归大连理工大学Goldminer实验室所有，
欢迎使用不帕服务端。
    """)
    app.run(host='::', port=5000, debug=True)
# %%
