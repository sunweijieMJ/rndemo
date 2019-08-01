import md5 from 'js-md5';
import globalConf from '../config/global';

// 参数排序
function objKeySort(arys) {
  let newkey = Object.keys(arys).sort();
  let newObj = {};
  for (let i = 0, LEN = newkey.length; i < LEN; i++) {
    newObj[newkey[i]] = arys[newkey[i]];
  }
  return newObj;
}

// get签名
function getSign(url, oldparams) {
  let _oldparams = JSON.parse(JSON.stringify(oldparams));
  _oldparams.sign = '';

  let params = objKeySort(_oldparams);
  let arr = [];
  let _params = '';
  let locks = '';
  for (let key in params) {
    _params = params[key];
    if (Array.isArray(_params)) {
      let a = _params.reduce((l, r) => {
        return JSON.stringify(l) + JSON.stringify(r);
      });
      arr.push(a);
    } else {
      arr.push(_params);
    }
  }
  locks = arr.join('') + globalConf.sign_key;
  return md5(locks);
}

// post签名
function postSign(url, data) {
  // url解析
  url = decodeURIComponent(url);
  let response = {};
  if (url.indexOf('?') !== -1) {
    url = url.split('?')[1];
    const strs = url.split('&');
    for (let i = 0, LEN = strs.length; i < LEN; i++) {
      response[strs[i].split('=')[0]] = strs[i].split('=')[1];
    }
  }
  // url排序
  let params = objKeySort(response);
  let arr = [];
  let _params = '';
  for (let key in params) {
    _params = params[key];
    if (Array.isArray(_params)) {
      let a = _params.reduce((l, r) => {
        return JSON.stringify(l) + JSON.stringify(r);
      });
      arr.push(a);
    } else {
      arr.push(_params);
    }
  }

  let locks = JSON.stringify(data) + arr.join('') + globalConf.sign_key;
  return md5(locks);
}

export default {
  getSign,
  postSign
};
