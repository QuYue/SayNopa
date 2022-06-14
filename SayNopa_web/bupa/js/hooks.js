import { localCache } from './utils.js';
function getUserInfo(user) {
  // 判断是否有用户名和id,有则在导航输出用户名,没有返回登录页面
  const id = localCache.getItem('bpUserId');
  const userName = localCache.getItem('bpUserName');
  const openId = localCache.getItem('bpOpenId');
  if (!id || !userName || !openId) {
    alert('登录过期，请重新登录！');
    window.location.replace('../html/login.html');
  } else {
    user.html(userName.replace(/"/g, ''));
  }
}
export { getUserInfo };
