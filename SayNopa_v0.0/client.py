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
import os

# %%
if __name__ == '__main__':
    url = r'http://pd.goldminer.top:8000/diagnose'
    print("""SayNopa Client -- Version 0.0
本产品的版权归大连理工大学Goldminer实验室所有，
欢迎使用不帕客户端。
    """)
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
