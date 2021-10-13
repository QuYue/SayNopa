// index.js
// 获取应用实例
const app = getApp()
var url_c = "https://nopa.datahys.com:8000/connect2"
var url_a = "https://nopa.datahys.com:8000/alter_username"

Page({
  data: {
    out: '未连接',
    className: 'comment',
    button2: 'button2_0',
    name: '未登录',
    hiddenmodalput: true,
    myclick: 'onClick',
    log: '登录',
    out_in:'',
    open_id : ''
  },
  
  onClick: function() {
    const that = this;
    wx.login({
      //获取code
      success: function (res) {
        var code = res.code; //返回code
        console.log(code);
        var appId = 'wxbd45000885647608';
        var secret = '525bfc22293b17c42b712c5332098346';
        var get = "https://api.weixin.qq.com/sns/jscode2session?appid="+appId+"&secret="+secret+"&js_code="+res.code+"&grant_type=authorization_code";
        wx.request({
          url: url_c,
          method: "POST",
          data: {
            get: JSON.stringify(get),
          },
          success: function (res) {
            var user_name = '';
            if (res.data.error == false){
              if (res.data.user_name == null){
                user_name = '用户'+res.data.user_id.toString()
              }
              else
              {user_name = res.data.user_name};
              console.log(user_name);
              that.setData({myclick: 'modalinput', log: '信息修改', open_id: res.data.open_id});
            }
            else
            {user_name= '未登录' };
            console.log(res.data.error)
            that.setData({name: user_name, out_in:''})
          }
        })
      }
    })
  },

  modalinput: function () {
    this.setData({
    hiddenmodalput: !this.data.hiddenmodalput
    })},
     
  //取消按钮
  cancel: function () {
  this.setData({
  hiddenmodalput: true
  });},
     
  //确认
  confirm: function () {
  const that = this;
  this.setData({
  hiddenmodalput: true
  });
  if (this.data.username == undefined)
  {this.setData({out_in: '输入为空'})}
  else
  { wx.request({
      url: url_a,
      method: "POST",
      data: {
        user_name: JSON.stringify(that.data.username),
        open_id: JSON.stringify(that.data.open_id),
      },
      success: function (res) {
        if (res.data.status == 'success'){
        that.setData({name:that.data.username, out_in: ''})
        }
        else if (res.data.status == 'empty'){
          that.setData({out_in: '输入不能只有空格'})
          }
        else
        {that.setData({out_in: '发生错误'})}
      }
    })
  }
  },

  usernameInput:function(e){
    var content=e.detail.value;
    this.setData({
      username: content,
    })
  },

  speech: function() {
    const that = this;
    if (this.data.open_id != '') {
      wx.navigateTo({
        url: "../speech/speech?user_name="+that.data.name+"&open_id="+that.data.open_id,
        // success: function(res) {
        //   // 通过eventChannel向被打开页面传送数据
        //   // res.eventChannel.emit('acceptDataFromOpenerPage', { ttt: 'test' })
        // }
      });
      // console.log(app.userInfo.open_id);
      // app.userInfo = {
      //   open_id: this.data.open_id,
      //   user_name: this.data.name,
      //   };
      // console.log(app.userInfo.open_id);
    }
    else
    {this.setData({out_in: '请先登录'})}
  },

  face: function() {
    if (this.data.open_id != '') {
      wx.navigateTo({
        url: "../face/face"
      })
    }
    else
    {this.setData({out_in: '请先登录'})}
  }
})



 


 



