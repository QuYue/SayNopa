$(function () {
  const agreeBtn = $('#panel .agree-btn ');
  agreeBtn.click(() => {
    alert('点击确定跳转到注册页。');
    window.location.assign('../html/register.html');
  });
});
