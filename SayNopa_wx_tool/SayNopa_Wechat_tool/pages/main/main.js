// index.js
// 获取应用实例
const app = getApp()
var url_c = "https://pd.goldminer.top:8000/connect2"
var url_a = "https://pd.goldminer.top:8000/alter_username"

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
        console.log(res.data.status)  
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
  // this.setData({name:this.data.username, out_in:''});}
  },

  usernameInput:function(e){
    var content=e.detail.value;
    this.setData({
      username: content,
    })

  },
})



 


 



