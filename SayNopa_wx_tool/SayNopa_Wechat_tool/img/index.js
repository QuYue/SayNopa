// index.js
// 获取应用实例
const app = getApp()

var flag = true

Page({
  data: {
    wording: "boy",
  },

  onClick: function() {
    if (this.data.wording=="boy"){
    this.setData({
      wording: 'girl',
    })}
    else{
      this.setData({
        wording: 'boy',
      })}
  }
})
