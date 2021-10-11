#!/usr/bin/env python
# -*-coding:utf-8 -*-
'''
@File    :   client.py
@Time    :   2021/10/11 15:21:10
@Author  :   QuYue 
@Email   :   quyue1541@gmail.com
@Desc    :   Client. 
'''
#%% Import Packages
import requests
import time
import os
import json

# %%
if __name__ == '__main__':
    url_c = r'http://pd.goldminer.top:8000/connect'
    url = r'http://pd.goldminer.top:8000/diagnose'
    
    print("""SayNopa Client -- Version 0.0
本产品的版权归大连理工大学Goldminer实验室所有，
欢迎使用不帕客户端。
    """)
    print('\r连接中...', end='', flush=True)
    start_time = time.time()
    try:
        connect_result = requests.post(url_c, data=json.dumps({'send_time': start_time}))
    except:
        pass
    if connect_result.status_code != 200:
        print(f'\r连接失败, Status Code: {connect_result.status_code}', flush=True)
        print('退出客户端')
    else:
        end_time = time.time()
        print(f"\r连接成功，延迟：{end_time-start_time :.2}s, 与服务端时钟差：{connect_result.json()['TimeDelay'] :.2}s\n", flush=True)

        while True:
            input_content = input("输入图片路径，输入'exit'退出：")
            input_content = input_content.strip()
            if input_content == '':
                continue
            elif input_content == 'exit':
                print('退出客户端')
                break
            else:
                image_path = input_content
                image_name = os.path.split(image_path)[-1]
                file_message = {'file':(image_name, open(image_path, 'rb'), 'image/jpeg')}
                result = requests.post(url, files=file_message)
                print(result.text)
                print()
