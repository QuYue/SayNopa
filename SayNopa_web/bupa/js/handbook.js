import { getUserInfo } from './hooks.js';
$(function () {
  // 判断是否有用户名和id,有则在导航输出用户名,没有返回登录页面
  getUserInfo($('#bp-user'));
  const listNav = $('.info .info-nav li ');
  const pages = $('.info .info-content .page');
  const infoContent = $('#content .info .info-content');
  for (let i = 0; i < listNav.length; i++) {
    $(listNav[i]).click(function () {
      listNav.removeClass();
      //   切换元素
      $(this).addClass('active');
      pages.attr('style', 'display:none');
      $(pages[i]).attr('style', 'display:block');
      // 滚动条初始化
      infoContent.scrollTop(0);
    });
  }
});
