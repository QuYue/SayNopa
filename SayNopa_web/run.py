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

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/register')
def register_page():
    return render_template('register.html')

@app.route('/user_agreement')
def user_agreement():
    return render_template('user_agreement.html')

@app.route('/diagnose')
def diagnose_page():
    return render_template('diagnose.html')

@app.route('/body_guide')
def body_guide_page():
    return render_template('body_guide.html')

@app.route('/handbook')
def handbook_page():
    return render_template('handbook.html')

@app.route('/about_us')
def about_us_page():
    return render_template('about_us.html')

@app.route('/change_username')
def change_username_page():
    return render_template('change_username.html')

@app.route('/change_password')
def change_password_page():
    return render_template('change_password.html')

@app.route('/diagnose_audio')
def record_audio_page():
    return render_template('record_audio.html')
            
@app.route('/diagnose_video')
def record_video_page():
    return render_template('record_video.html')

#%%
if __name__ == "__main__":
    print("""SayNopa Server -- Version 0.0
本产品的版权归大连理工大学Goldminer实验室所有，
欢迎使用不帕服务端。
    """)
    app.run(host='::',port=8848,debug=True)


