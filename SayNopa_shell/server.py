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
from flask import Flask, request, render_template, jsonify

#%%
app = Flask(__name__)
# 设置开启web服务后，如果更新html文件，可以使更新立即生效
# app.jinjia_env.auto_reload = True
# app.config['TEMPLATES_AUTO_RELOAD'] = True
def time_in_detail(input_time):
    return time.strftime('%Y年%m月%d日 %H时%M分%S秒', time.localtime(input_time))

@app.route('/connect', methods=['POST'])
def connect():
    data = request.get_json()
    if data:
        pass
    else:
        data = request.get_data()
        data = json.loads(data)
    receive_time = time.time()
    receive_time_d = time.strftime('%Y年%m月%d日 %H时%M分%S秒', time.localtime(time.time()))
    send_time = data['send_time']
    print(f'于{time_in_detail(receive_time)}连接成功')
    return json.dumps({'status': 'success', 'TimeDelay':receive_time-send_time})

@app.route('/diagnose', methods=['POST'])
def diagnose():
    start_time = time.time()
    received_file = request.files['file']
    file_name = received_file.filename
    if received_file:
        received_dirPath = './resources/received_file'
        if not os.path.isdir(received_dirPath):
            os.makedirs(received_dirPath)
        file_path = os.path.join(received_dirPath, file_name)
        try:
            received_file.save(file_path)
            message = f'文件保存到{file_path}'
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
    app.run(host='::',port=5000,debug=True)
# %%
