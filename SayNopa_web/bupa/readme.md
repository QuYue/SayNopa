# 不帕 - web前端

<!-- ## 语音诊断

## 面部诊断 -->


## 使用说明


### 本地调试
- 复制本项目到本地电脑，在根目录下，在控制台里运行 ```npx live-server```
- 浏览器中打开 ```http://localhost:8080```

### 产品环境
- 在以下两个文件中找到并修改```apihost```值，以匹配真是的api endpoints。 默认值为： ```http://www.yueming.top:8010```
  - ```record_audio/js/app.js```
  - ```record_camera/app.js```
- 将当前项目部署到静态文件服务器指定目录，
- 在浏览器内访问相应路径



---

## Trouble Shooting

### 网页上无法使用录音或录像功能
- 确认电脑上有可用的摄像头和麦克风；
- 确认所使用的浏览器支持WebRTC(即支持浏览器访问本机麦克风和摄像头的功能)，推荐使用Chrome浏览器；
- 确认当前页面拥有麦克风和摄像头的使用权限：
  - 初次访问页面将询问是否允许麦克风摄像头，选择"允许"
  - 若禁止了权限，可通过点击浏览器地址栏左侧图标，打开"网站设置"，在"权限"设置中允许摄像头和麦克风。
- 若在产品环境中无法设置麦克风和摄像头权限，请确认前端页面是否通过https访问的 (Chrome浏览器要求只有https网站才能设置麦克风摄像头使用权限)。


### 页面访问api时报错
- 确认服务端使用https发布；
- 若提示CORS错误，请确认服务端提供了相应的跨域支持；


### 页面录制的音频上传后无法编码为可解析的mp3

- 方案1： 后端使用音频文件时使用ffmpeg将文件转换成mp3，参见[此文](https://medium.com/jeremy-gottfrieds-tech-blog/javascript-tutorial-record-audio-and-encode-it-to-mp3-2eedcd466e78)

- 方案2：在前端将音频的binary blob 文件转换为mp3后再上传，使用了一个前端库：WebAudioRecorder.js。 参见[此文](https://blog.addpipe.com/using-webaudiorecorder-js-to-record-audio-on-your-website/) 及相关[demo](https://addpipe.com/simple-web-audio-recorder-demo/)


### 视频上传和诊断后，返回错误结果，提示"录像时长太短"
- do not know how, yet.



## TODOS
- 异常处理