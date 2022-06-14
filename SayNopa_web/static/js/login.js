import { net_url, localCache, ajax } from './utils.js';
$(function () {
  const username = $('.log-in .username input');
  const password = $('.log-in .password input');
  const loginBtn = $('.log-in .login-btn');
  const err = $('.log-in .err-info');
  const errInfo = $('.log-in .err-info .info');
  //   设置用户名只能输入字母或数字
  username.keyup(function () {
    $(this).val(
      $(this)
        .val()
        .replace(/[^a-zA-Z0-9]/g, '')
    );
  });
  loginBtn.click(function () {
    //获取账号
    const userVal = username.val();
    // 获取密码
    const passVal = password.val();
    // json对象
    const json = JSON.stringify({
      user_name: userVal,
      password: passVal,
    });

    ajax(json, '/signin').then((res) => {
      console.log(res);
      const result = JSON.parse(res);
      if (result.status === 'success') {
        // 本次保存用户信息
        localCache.setItem('bpUserId', result.user_id);
        localCache.setItem('bpOpenId', result.open_id);
        localCache.setItem('bpUserName', result.user_name);
        // 页面跳转，无法后退
        window.location.replace(net_url+'/diagnose');
      } else if (result.status === 'new') {
        errInfo.html('查无此用户,请检查用户名');
        err.attr('style', 'display:block');
        initialize();
      } else {
        errInfo.html('密码错误,请重新输入');
        err.attr('style', 'display:block');
        initialize();
      }
    });
  });
  // 初始化操作
  function initialize() {
    username.val('');
    password.val('');
  }
});
