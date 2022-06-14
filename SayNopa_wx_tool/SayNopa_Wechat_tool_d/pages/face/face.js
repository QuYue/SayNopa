//index.js
//获取应用实例
var that
var animation = wx.createAnimation({
  duration: 300,
  timingFunction: 'ease',
})
var url_f = "https://nopa.datahys.com:8000/file_save"
var url_df = "https://nopa.datahys.com:8000/diagnose_face"
var now = 0;

function gettime() {
  var d = new Date();
  return d.getTime()/1000;
}

/**
 * [倒计时函数，有放大动画效果]
 * @param  {Number} minutes         [分钟]
 * @param  {Number} second          [秒]
 * @param  {function} TimeoutCallback [倒计时结束执行的函数]
 */
function countDown(minutes, second, TimeoutCallback)  {
    var interval = () => {
      if (minutes > 0 && second >= 0 || second > 10){
        animation.scale(1.5,1.5).step()
        animation.scale(1,1).step()
        that.setData({
          time: minutes + ':' + second--,
          animationData:animation.export()
        })
      }else if (minutes > 0){
        minutes--;
        second = 59;
        animation.scale(1.5,1.5).step()
        animation.scale(1,1).step()
        that.setData({
          time: minutes + ':' + second--,
          animationData:animation.export()
        })
      }else if (second >= 0){
        animation.scale(1.5,1.5).step()
        animation.scale(1,1).step()
        that.setData({
          time: second--,
          animationData:animation.export()
        })
      }else{
        clearInterval(timer)
        // 倒计时结束回调
        if (typeof TimeoutCallback !== 'function'){
          return 
        }
        TimeoutCallback()
      }           
    }
    // 因为定时器会延时一个间隔单位，所以先执行一次
    interval()    
    var timer = setInterval(interval,1000)
           
}
function myStopFunction() { 
}
  
//
var time = null;
var myCanvas = null;
var windowHeight, windowWidth;
var type = null;
Page({
  data: {
    device:true,
    camera: true,
    x1: '未采集',
    x2:'none',
    result_text:'',
    uploadSuccess: false,
    diagnose_button_text: '进行诊断',
    already_diagnose: false,
    showsuccess:false,
    open_id: '',
    file_id: 0,
  },

  onLoad() {
    this.setData({
      ctx: wx.createCameraContext(),
      device: this.data.device,
    })
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 屏幕宽度、高度
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
      }
    })
  },

  onLoad: function(options){
    that = this
    this.setData({user_name: options.user_name, open_id: options.open_id, uploadSuccess: false,  x1: '未采集', diagnose_button_text: '进行诊断', result_text: '', already_diagnose: false, showsuccess:false})
    countDown(0,25)
  },
  onUnload: function () {
    myStopFunction()
  },
  
  open() {
    this.setData({
      camera: true,
      uploadSuccess: false,
      diagnose_button_text: '进行诊断',
      result_text: '',
      already_diagnose: false,
      showsuccess:false,
      file_id: 0,
    })
    type = "takeRecord";
    let ctx = wx.createCameraContext(this)
    let that = this
    if (type == "takeRecord") {
      console.log("begin takeRecord")
      that.setData({
        x1:'采集中'
       })
       
      ctx.startRecord({
        success:(res) =>{
          console.log('startRecord')
        }    
      })
      //
     
    }
  
  },
  // 关闭模拟的相机界面
  close() {
    console.log("关闭相机");
    type = "endRecord" 
    let ctx = wx.createCameraContext(this)
    let that = this
    if (type="endRecord" ){
      that.setData({
        x1:'采集完毕并上传'
      })
      ctx.stopRecord({
        success:(res) =>{
          console.log(res.tempVideoPath)
          var tempVideoPath=res.tempVideoPath
          wx.uploadFile({
            url: url_f+'/'+that.data.open_id,
            filePath: tempVideoPath,
            name: 'file',
            header:{"Content-type":"multipart/form-data"},
            success:function(res){
              var result_re = JSON.parse(res.data)
              if (result_re.status == 'success')
              {that.setData({uploadSuccess: true, x1:'上传成功',file_id: result_re.file_id})}
            }
          })
        }    
      })
      // if (this.data.x1!='上传成功'){this.setData({x1: '上传失败'})}
    }
  },
  diagnose_face: function() {
    if (this.data.already_diagnose)
        {return }
    const that = this;
    this.setData({diagnose_button_text: '诊断中（约20s）', already_diagnose: false});
    if (this.data.file_id == 0)
    {console.log('出错了')}
    else{
        now = gettime();
        wx.request({
            url : url_df,
            method: "POST",
            data: {
                send_time : JSON.stringify(now),
                file_id : this.data.file_id
            },
            success (res){
              console.log(res.data)
                if (res.data.status=='success'){
                    if  (res.data.error)
                    {that.setData({diagnose_button_text: '诊断失败', already_diagnose: true, showsuccess:true, result_text: res.data.error_reason}),
                  console.log('11111111111111111111')}
                    else{
                        if (res.data.PD < 0.5) {
                            that.setData({diagnose_button_text: '恭喜你，你很健康', showsuccess:true, already_diagnose: true})
                        }
                        else
                        {   that.setData({diagnose_button_text: '有帕金森病的风险', showsuccess:true, already_diagnose: true})}
                    }}
                else
                {that.setData({diagnose_button_text: '诊断失败', already_diagnose: false})}
            }
            
        })
    }
  }
 
})


 