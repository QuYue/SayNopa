#!/usr/bin/env python
# -*-coding:utf-8 -*-
'''
@File    :   run.py
@Time    :   2021/10/11 14:50:32
@Author  :   QuYue 
@Email   :   quyue1541@gmail.com
@Desc    :   Run the server.
'''
#%% Import Packages
from flask import Flask, request
import os
import time

#%%
app = Flask(__name__)

@app.route('/test')
def hello_world():
    return '丘山🧡 日月'

# @app.route('/connect')
# def connect():
#     start_time = time.time()
#     received_file = request.files['file']
#     image_name = received_file.filename
#     if received_file:
#         received_dirPath = './resources/received_images'
#         if not os.path.isdir(received_file):
#             os.os.makedirs(received_dirPath)
#         image_path = os.path.join(received_file, image_name)
#         try:
#             received_file.save(image_path)
#             message = f'图片保存到{image_path}'
#         except:
#             message = '图片保存出错'
#     else:
#         message = '未接收到图片'
#     print(message)
#     end_time = time.time()
#     return f'{message}\n用时{end_time-start_time :.2f}s'

@app.route('/diagnose', methods=['POST'])
def diagnose():
    start_time = time.time()
    received_file = request.files['file']
    image_name = received_file.filename
    if received_file:
        received_dirPath = './resources/received_images'
        if not os.path.isdir(received_dirPath):
            os.makedirs(received_dirPath)
        image_path = os.path.join(received_dirPath, image_name)
        try:
            received_file.save(image_path)
            message = f'图片保存到{image_path}'
        except:
            message = '图片保存出错'
    else:
        message = '未接收到图片'
    print(message)
    end_time = time.time()
    return f'{message}\n用时{end_time-start_time :.2f}s'


if __name__ == '__main__':
    print("""SayNopa Server -- Version 0.0
本产品的版权归大连理工大学Goldminer实验室所有，
欢迎使用不帕服务端。
    """)
    app.run(host='::',port=8000,debug=True)