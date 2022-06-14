import { net_url, ajax, localCache } from './utils.js';
$(function () {
  const password = $('.password input');
  const repPassword = $('.rep-password input');
  const notarizeBtn = $(' .notarize-btn');
  const describe = $('.content .describe');

  notarizeBtn.click(function () {
    const passwordVal = password.val();
    const repPasswordVal = repPassword.val();
    if (passwordVal !== repPasswordVal) {
      setErrHint(describe, '两次用户名输入的不一致');
    } else if (passwordVal.length > 20 || passwordVal.length < 5) {
      setErrHint(describe, '密码长度为5-20个字符之间');
    } else {
      const openId = localCache.getItem('bpOpenId').replace(/"/g, '');
      const json = JSON.stringify({
        open_id: openId,
        password: passwordVal,
      });
      ajax(json, '/alter_password_wb').then(function (res) {
        const { status } = JSON.parse(res);
        //   验证
        if (status === 'success') {
          alert(`密码已修改为 ${passwordVal},请重新登录`);
          window.location.replace(net_url + '/login');
        } else if (status === 'password error') {
          setErrHint(describe, '密码长度为5-20个字符之间');
        } else {
          alert('登录异常，请重新登录');
          window.location.replace(net_url + '/login');
        }
      });
    }
  });
  function setErrHint(el, text) {
    el.text(`* ${text}`);
    el.addClass('err-info');
  }
});
