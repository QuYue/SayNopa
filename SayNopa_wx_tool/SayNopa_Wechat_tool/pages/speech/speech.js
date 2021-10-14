// pages/speech.js

const app = getApp();

let windowHeight = wx.getSystemInfoSync().windowHeight // 屏幕的高度
let screenWidth = wx.getSystemInfoSync().screenWidth
let screenHeight = wx.getSystemInfoSync().screenHeight
let contentHeight = ((windowHeight / screenWidth) * 750 - 184 - 166) + "rpx";
const recorderManager = wx.getRecorderManager()
const backgroundAudioManager = wx.getBackgroundAudioManager()

var url_f = "https://nopa.datahys.com:8000/file_save"
var url_ds = "https://nopa.datahys.com:8000/diagnose_speech"
var now = 0;

function gettime() {
    var d = new Date();
    return d.getTime()/1000;
  }

Page({
    data: {
        startClick:false,
        start_button_text: '开始',
        upload_butten_text: '上传中',
        diagnose_button_text: '进行诊断',
        already_diagnose: false,
        result_text: '',
        open_id: '',
        file_id: 0,
        contentHeight: contentHeight,
        voiceState:false,
        tempFilePath:'',
        recordingTimeqwe:0,//录音计时
        setInter:"",//录音名称
        isplay:true, //播放状态 true--播放中 false--暂停播放
        uploadState:false,
        uploadSuccess: false,
        showhandle1:true,
        showhandle2:false,
        showWaveView:false,
        currentLeft:10,
        currentTime:'00'
    },

    onLoad: function (options) {
        this.setData({user_name: options.user_name, open_id: options.open_id, upload_butten_text: '上传中', diagnose_button_text: '进行诊断',already_diagnose: false, result_text: ''}),
        this.initRecord()
    },
    
    
    /** * 生命周期函数--监听页面初次渲染完成 */
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
        this.data.setInter = setInterval(function () {
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
            })}
        , 1000); 
    },

    startRecord:function(){
        if(this.data.startClick){
            return
        }
        this.setData({startClick: true})
        const options = {
            duration: 10000,
            sampleRate: 44100,
            numberOfChannels: 1,
            encodeBitRate: 192000,
            // format: 'aac',
            format: 'mp3',
            frameSize: 50
        }
        // 开始倒计时
        this.recordingTimer()
        // 开始录音
        recorderManager.start(options)
        this.setData({start_button_text: '录制中'})
    },

    shutRecord:function(){
        recorderManager.stop()
        this.setData({showhandle1:false,showhandle2:true,currentTime:'00',start_button_text: '开始'})
    },

    listenRecord:function(e){
        // 试听
        let isplay = e.currentTarget.dataset.isplay;
        backgroundAudioManager.title = '不帕录音'
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
            this.setData({currentLeft:10, showWaveView:false, currentTime:'00'})
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
            diagnose_button_text: '进行诊断',
            already_diagnose: false,
            uploadState:false,
            uploadSuccess: false,
            upload_butten_text: '上传中',
            showhandle1:true,
            showhandle2:false,
            voiceState:false,
            tempFilePath:'',
            showWaveView:false,
            startClick:false,
            currentLeft:10,
            recordingTimeqwe:0,
            currentTime:'00',
            result_text: '',
        })
    },

    uploadVoice:function(){
        let that = this
        this.setData({uploadState:true, uploadSuccess: false, file_id: 0})
        wx.uploadFile({
            url: url_f+'/'+that.data.open_id, //仅为示例，非真实的接口地址
            filePath: this.data.tempFilePath,
            name: 'file',
            header:{
                "Content-type":"multiply/form-data"
            },
            formData: {
                'time': this.data.recordingTimeqwe
            },
            success (res){
                var result_re = JSON.parse(res.data)
                console.log('上传成功')
                that.setData({upload_butten_text: '成功', uploadSuccess: true, file_id: result_re.file_id})
            },
            fail (res){
                console.log('上传失败')
                that.setData({uploadState:false, upload_butten_text: '成功', uploadSuccess: false})
        }
        })
    },

    diagnose_speech: function() {
        if (this.data.already_diagnose)
            {return }
        const that = this;
        this.setData({diagnose_button_text: '诊断中', already_diagnose: false});
        if (this.data.file_id == 0)
        {console.log('出错了')}
        else{
            now = gettime();
            wx.request({
                url : url_ds,
                method: "POST",
                data: {
                    send_time : JSON.stringify(now),
                    file_id : this.data.file_id
                },
                success (res){
                    if (res.data.status=='success'){
                        if (res.data.PD < 0.5) {
                            var d = res.data.PD * 100
                            that.setData({diagnose_button_text: '恭喜你，你很健康', already_diagnose: true, result_text: '有'+d.toFixed(0)+'%患病风险'})
                        }
                        else
                        {   that.setData({diagnose_button_text: '有帕金森病的风险', already_diagnose: true, result_text: '有'+d.toFixed(0)+'%患病风险'})
                        }}
                    else
                    {that.setData({diagnose_button_text: '诊断失败', already_diagnose: false})}
                },
                fail (res){
                    that.setData({uploadState:false, upload_butten_text: '成功', already_diagnose: false, result_text:''})
                }
            })
        }
    }
})

