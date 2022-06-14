import { net_url, ajax, localCache, setInputNumberOrWord } from './utils.js';
$(function () {
  const username = $('.username input');
  const repUsername = $('.rep-username input');
  const notarizeBtn = $(' .notarize-btn');
  const describe = $('.content .describe');
  //   账号必须为字符和数字
  setInputNumberOrWord(username);
  setInputNumberOrWord(repUsername);

  notarizeBtn.click(function () {
    const usernameVal = username.val();
    const repUsernameVal = repUsername.val();
    if (usernameVal !== repUsernameVal) {
      setErrHint(describe, '两次用户名输入的不一致');
    } else if (usernameVal.length > 10) {
      setErrHint(describe, '用户名长度不可以超出10个字符');
    } else {
      const openId = localCache.getItem('bpOpenId').replace(/"/g, '');
      const json = JSON.stringify({
        open_id: openId,
        user_name: usernameVal,
      });
      ajax(json, '/alter_username_wb').then(function (res) {
        console.log(res);
        const { status } = JSON.parse(res);
        //   验证
        if (status === 'success') {
          alert(`用户名已修改为 ${usernameVal},请重新登录`);
          window.location.replace(net_url + '/login');
        } else if (status === 'exist') {
          setErrHint(describe, '用户名已存在');
        } else if (status === 'long') {
          setErrHint(describe, '用户名长度不可以超出10个字符');
        } else if (status === 'empty') {
          setErrHint(describe, '用户名不能为空');
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
