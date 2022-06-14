#!/usr/bin/env python
# -*-coding:utf-8 -*-
'''
@File    :   api.py
@Time    :   2022/05/23 01:48:55
@Author  :   QuYue 
@Email   :   quyue1541@gmail.com
@Desc    :   api
'''

#%% Connect 
import requests
import time
import json

url = "http://www.yueming.top:8010"
url_next = "/connect"
data = json.dumps({'send_time' : time.time()})
d = requests.post(url+url_next, data =data)


#%% File save
import requests
url = "http://www.yueming.top:8010"
url_next = "/file_save/test"

with open('./a.mp3', 'rb') as file:
    files = {'file': file}
    d = requests.post(url+url_next,  files = files)

#%% Diagnose speech
import requests
import json
url = "https://nopa.datahys.com:8000"
url_next = "/diagnose_speech"

data = json.dumps({'file_id': 136})
d = requests.post(url+url_next, data =data)

#%% Diagnose face
import requests
import json
url = "http://www.yueming.top:8010/diagnose_face"
url_next = "/diagnose_face"

data = json.dumps({'file_id' : 140})
d = requests.post(url+url_next, data =data)


# %%
