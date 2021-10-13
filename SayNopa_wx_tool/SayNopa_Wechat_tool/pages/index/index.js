// index.js
// 获取应用实例
const app = getApp()
var url_c = "https://pd.goldminer.top:8000/connect"
var out = 0
var f = 0
var now = gettime()
var status = 'none'

function gettime() {
  var d = new Date();
  return d.getTime()/1000;
}
function changered() {
  console.log('111')
}

Page({
  data: {
    out: '未连接',
    className: 'comment',
    button2: 'button2_0',
  },

  onClick: function() {
    const that = this;
    now = gettime();
    wx.request({
      url : url_c,
      method: "POST",
      data: {
        send_time : JSON.stringify(now),
      },
      success (res){
        if (res.statusCode==200) {
          status = 'connect';
          var delay = gettime() - now;
          that.setData({out: "连接成功 延迟"+delay.toFixed(3)+"s", className: 'comment_green', button2: 'button2_1'});
        }
        else
        { status = 'unconnect';
          that.setData({out: '连接失败',  className: 'comment_red', button2: 'button2_0'});
        }
      }
    })
  },

  onClick2: function() {
    const that = this;
    if (status == 'connect') {
      wx.navigateTo({
        url: '../main/main'
      })
    }
  }
  



})
