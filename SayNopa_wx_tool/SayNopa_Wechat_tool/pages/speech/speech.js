// pages/speech.js

const app = getApp();

// pages/face/face.js
let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
let screenWidth = wx.getSystemInfoSync().screenWidth
let screenHeight = wx.getSystemInfoSync().screenHeight
let contentHeight = ((windowHeight / screenWidth) * 750 - 184 - 166) + "rpx";
const recorderManager = wx.getRecorderManager()
const backgroundAudioManager = wx.getBackgroundAudioManager()

var url_s = "https://nopa.datahys.com:8000/speech"

Page({
 /*** 页面的初始数据*/
    data: {
        user_name: '',
        open_id: '',
        startClick:false,
        contentHeight: contentHeight,
        voiceState:false,
        tempFilePath:'',
        recordingTimeqwe:0,//录音计时
        setInter:"",//录音名称
        isplay:true, //播放状态 true--播放中 false--暂停播放
        uploadState:false,
        showhandle1:true,
        showhandle2:false,
        showWaveView:false,
        currentLeft:10,
        currentTime:'00'
        },

    /*** 生命周期函数--监听页面加载*/
    onLoad: function (options) {
        this.setData({user_name: options.user_name, open_id: options.open_id})
        this.initRecord()
        },

    /*** 生命周期函数--监听页面初次渲染完成*/
    onReady: function () {
    },

    initRecord:function(){
        recorderManager.onStart(() => {
            console.log('开始录音')
            })
        recorderManager.onPause(() => {
            console.log('暂停录音')
            })
        recorderManager.onStop((res) => {
            clearInterval(this.data.setInter);
            this.setData({voiceState:true,currentLeft:10})
            console.log('结束录音', res)
            const { tempFilePath } = res
            this.data.tempFilePath = tempFilePath
            })
        recorderManager.onFrameRecorded((res) => {
            const { frameBuffer } = res
            console.log('frameBuffer.byteLength', frameBuffer.byteLength)
            })
        },

    recordingTimer:function(){
        var that = this;
        //将计时器赋值给setInter
        this.data.setInter = setInterval(
        function () {
            let time = that.data.recordingTimeqwe + 1;
            if(time>10){
            wx.showToast({
            title: '录音时长最多10s',
            duration:1500,
            mask:true
            })
            clearInterval(that.data.setInter);
            that.shutRecord();
            return;
            }
            // console.log(time);
            let currentTime = time < 10 ? '0'+time : time;
            that.setData({
            recordingTimeqwe: time,
            currentTime:currentTime,
            currentLeft:that.data.currentLeft + 65
            })
        }
        , 1000); 
        },

    startRecord:function(){
        if (this.data.startClick){
            return
            }
        this.data.startClick = true
        const options = {
            duration: 10000,
            sampleRate: 44100,
            numberOfChannels: 1,
            encodeBitRate: 192000,
            format: 'aac',
            frameSize: 50
        }
        // 开始倒计时
        this.recordingTimer()
        // 开始录音
        recorderManager.start(options)
        },

    shutRecord:function(){
        recorderManager.stop()
        this.setData({showhandle1:false,showhandle2:true,currentTime:'00'})
    },

    listenRecord:function(e){
        // 试听
        let isplay = e.currentTarget.dataset.isplay;
        backgroundAudioManager.title = '试听欢迎语'
        backgroundAudioManager.src = this.data.tempFilePath
        this.setData({
            showWaveView:true,
            currentLeft:10,
            currentTime:'00'
            })
        backgroundAudioManager.onPlay(() => {
            console.log("音乐播放开始")
            })
        backgroundAudioManager.onEnded(() => {
            console.log("音乐播放结束")
            clearInterval(this.data.setInter1)
            this.setData({currentLeft:10,showWaveView:false,currentTime:'00'})
            })
        backgroundAudioManager.play()
        this.data.setInter1 = setInterval(() => {
            let time = parseInt(this.data.currentTime) + 1
            let currentTime = time < 10 ? '0'+time : time;
            // console.log(currentTime)
            this.setData({
                currentLeft:this.data.currentLeft + 65,
                currentTime:currentTime
            })
            }, 1000); 
        },

    reRecord:function(){
        clearInterval(this.data.setInter1)
        this.setData({
            showhandle1:true,
            showhandle2:false,
            voiceState:false,
            tempFilePath:'',
            showWaveView:false,
            startClick:false,
            currentLeft:10,
            recordingTimeqwe:0,
            currentTime:'00'
            })
        },

    uploadVoice:function(){
        let that = this
        this.setData({uploadState:true})
        wx.uploadFile({
            url: url_s+'/'+that.data.open_id,
            filePath: this.data.tempFilePath,
            name: 'file',
            header:{
                "Content-type":"multiply/form-data"
            },
            formData: {
                'time': this.data.recordingTimeqwe
            },
            success (res){
                console.log('上传成功')
            },
            fail (res){
                console.log('上传失败')
                that.setData({uploadState:false})
            }
            })
        } 
})



