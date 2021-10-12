#!/usr/bin/env python
# -*-coding:utf-8 -*-
'''
@File    :   server.py
@Time    :   2021/10/12 01:42:38
@Author  :   QuYue 
@Email   :   quyue1541@gmail.com
@Desc    :   
'''
#%% Import Packages
import os
import time
import json
from flask import Flask, render_template, request, jsonify

#%% 
app = Flask(__name__)
# 设置开启web服务后，如果更新html文件，可以使更新立即生效
app.jinja_env.auto_reload = True
app.config['TEMPLATES_AUTO_RELOAD'] = True

#%%
def time_in_detail(input_time):
    return time.strftime('%Y年%m月%d日 %H时%M分%S秒', time.localtime(input_time))
#%%
@app.route('/')
def index_page():
    return render_template('index.html')

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

#%%
@app.route('/diagnose_sound', methods=['POST'])
def diagnose_sound():
    start_time = time.time()
            

#%%
if __name__ == "__main__":
    print("""SayNopa Server -- Version 0.0
本产品的版权归大连理工大学Goldminer实验室所有，
欢迎使用不帕服务端。
    """)
    app.run(host='::',port=5000,debug=True)


