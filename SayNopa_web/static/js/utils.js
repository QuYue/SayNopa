// ajax请求

function ajax(data, url) {
  // const base_url = 'https://nopa.datahys.com:8000';
  const base_url = 'https://saynopa.datahys.com:8850';
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: `${base_url}${url}`,
      data: data,
      processData: false,
      contentType: false,
      success: (res) => {
        resolve(res);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}

// 本地存储
class MyCache {
  constructor(isLocal = true) {
    this.cache = isLocal ? localStorage : sessionStorage;
  }
  setItem(key, value) {
    if (!value) throw new Error('seconed argument  is undefined');
    this.cache.setItem(key, JSON.stringify(value));
  }
  getItem(key, isObj) {
    let value = this.cache.getItem(key);
    if (value) {
      return isObj ? JSON.parse(value) : value;
    }
  }
  remove(key) {
    this.cache.removeItem(key);
  }
  clear() {
    this.cache.clear();
  }
  key(index) {
    return this.cache.key(index);
  }
  length() {
    return this.cache.length;
  }
}
 
const localCache = new MyCache();
const sessionCache = new MyCache(false);
// const net_url = "https://nopa.datahys.com";
// const api_url = "http://nopa.datahys.com:5000";
const net_url = 'https://saynopa.datahys.com';
const api_url = 'https://saynopa.datahys.com:8850';

//设置输入框只能为字母和数字
function setInputNumberOrWord(el) {
  el.keyup(function () {
    $(this).val(
      $(this)
        .val()
        .replace(/[^a-zA-Z0-9]/g, '')
    );
  });
}
export { localCache, sessionCache, net_url, api_url, ajax, setInputNumberOrWord };
