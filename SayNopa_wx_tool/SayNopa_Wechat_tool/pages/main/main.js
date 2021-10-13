// index.js
// 获取应用实例
const app = getApp()
var url_c = "https://pd.goldminer.top:8000/connect2"

Page({
  data: {
    out: '未连接',
    className: 'comment',
    button2: 'button2_0',
    name: '未登录',
    hiddenmodalput: true,
    myclick: 'onClick',
    log: '登录',
    out_in:''
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
              that.setData({myclick: 'modalinput', log: '信息修改'});
            }
            else
            {user_name= '未登录' };
            that.setData({name: user_name})
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
  this.setData({
  hiddenmodalput: true
  });
  if (this.data.username == undefined)
  {this.setData({out_in: '输入为空'})}
  else
  {
  console.log(this.data.username);
  this.setData({name:this.data.username, out_in:''});}
  },

  usernameInput:function(e){
    var content=e.detail.value;
    this.setData({
      username: content,
    })

  },
})



 


 



