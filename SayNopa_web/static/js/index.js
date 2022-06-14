import { net_url, ajax } from './utils.js';

$(function () {
  // 测试按钮
  const testButton = $('.test');
  //   主页按钮
  const home = $('.home');
  // 点击测试按钮
  testButton.click(() => {
    //   utc时间戳 秒
    const now = Date.now();
    //目前跨域
    ajax(JSON.stringify({ send_time: now / 1000 }), '/connect').then((res) => {
      const { status } = JSON.parse(res);
      if (status === 'success') {
        const delay = (Date.now() - now) / 1000;
        alert(`连接成功，延迟${delay}秒`);
        home.attr('disabled', false);
      } else {
        alert(`连接失败，请重新连接`);
      }
    });
  });
  // 点击主页按钮
  home.click(() => {
    window.location.replace(net_url + '/login');
  });
});
