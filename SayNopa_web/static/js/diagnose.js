import { getUserInfo } from './hooks.js';
$(function () {
  // 判断是否有用户名和id,有则在导航输出用户名,没有返回登录页面
  getUserInfo($('#bp-user'));
});
