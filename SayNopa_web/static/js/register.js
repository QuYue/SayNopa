import { net_url, ajax, setInputNumberOrWord } from './utils.js';
$(function () {
  const username = $('.username input');
  const password = $('.password input');
  const registerBtn = $(' .register-btn');

  //   账号和密码为字符和数字
  setInputNumberOrWord(username);
  setInputNumberOrWord(password);

  registerBtn.click(function () {
    const userVal = username.val();
    const passVal = password.val();
    $('.content p').html('');
    $('.content p').eq(0).removeClass('err-info');
    $('.content p').eq(1).removeClass('err-info');
    if (!userVal || userVal.length > 10) {
      // 用户名有问题
      $('.content p').eq(0).addClass('err-info');
      $('.content p').eq(0).html('* 用户名为空或者长度超过10个字符');
    }
    if (!passVal || passVal.length > 20 || passVal.length < 5) {
      // 密码有问题
      $('.content p').eq(1).addClass('err-info');
      $('.content p').eq(1).html('* 密码为空或者长度小于5或超过20个字符');
    }
    if (userVal && passVal) {
      const json = JSON.stringify({
        user_name: userVal,
        password: passVal,
      });
      ajax(json, '/signup').then((res) => {
        const { status } = JSON.parse(res);
        if (status === 'success') {
          alert('注册成功，点击确定跳转到登录页面');
          window.location.replace(net_url+'/login');
        } else if (status === 'exist') {
          $('.content p').eq(0).addClass('err-info');
          $('.content p').eq(0).html('* 用户名已被注册,请重新输入');
        } else {
          alert('出现错误，请重新注册！');
        }
      });
    }
  });
});
