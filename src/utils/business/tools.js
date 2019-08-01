// js顺序执行
const loadScript = (container, url, callback) => {
  let script = document.createElement('script');
  if (script.readyState) {
    script.onreadystatechange = () => {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        callback && callback();
      }
    };
  } else {
    script.onload = () => {
      callback && callback();
    };
  }
  script.src = url;
  container.appendChild(script);
};

// 解析queryString
const parseUrl = (query = window.location.search) => {
  if (!query) return {};
  query = decodeURIComponent(query);
  let strs = query.split('?')[1];
  strs = strs.split('&');
  const response = {};
  for (let i = 0, LEN = strs.length; i < LEN; i++) {
    response[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1]);
  }
  return response;
};

// urlConcat
const urlConcat = (data) => {
  let url = '';
  for (let k in data) {
    let value = data[k] !== undefined ? data[k] : '';
    url += '&' + k + '=' + encodeURIComponent(value);
  }
  return url ? url.substring(1) : '';
};

// uuid
const uuid = (len, radix) => {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    let r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    /*
     * Fill in random data.  At i==19 set the high bits of clock sequence as
     * per rfc4122, sec. 4.1.5
     */
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('').toLowerCase();
};

// 手机号隐藏
const phoneFilter = phone => {
  if(!phone) return '';
  return phone.substr(0, 3) + '****' + phone.substr(7);
};

// 校准时区
const adjustTime = (time = new Date(), timezone = -8) => {
  // 目标时区
  let targetTimezone = timezone;
  // 当前时区与中时区时差,以min为维度
  let diff = new Date().getTimezoneOffset();
  // 目标时区 = 本地时区时间 + 本地时区时差 - 目标时区时差
  let targetTime = new Date(time).getTime() + (diff * 60 * 1000) - (targetTimezone * 60 * 60 * 1000);

  return targetTime;
};

// 倒计时
import fillZero from '../filters/fillZero';
const countDown = (time, type) => {
  // 时间戳转number
  if (!isNaN(+time)) time = +time;
  // 兼容safari
  if (typeof time === 'string') {
    time = time.split('-').join('/');
    time = time.split('.').join('/');
  }

  let delta;
  if(type === 'ING') {
    delta = time;
  } else {
    delta = new Date(adjustTime(time)).getTime() - new Date(adjustTime()).getTime();
  }
  if(delta <= 0) delta = 0;

  // 常量表示几个常数
  const DAY_MS = 24 * 60 * 60 * 1000;
  const HOUR_MS = 60 * 60 * 1000;
  const MINUTE_MS = 60 * 1000;
  const SECOND_MS = 1000;

  let days, hours, mins, secs;
  switch (type) {
    case 'DD:HH:MM:SS':
      // 计算天数
      days = Math.floor(delta / DAY_MS);
      // 计算小时数
      hours = Math.floor((delta - (days * DAY_MS)) / HOUR_MS);
      // 计算分钟数
      mins = Math.floor((delta - (days * DAY_MS) - (hours * HOUR_MS)) / MINUTE_MS);
      // 计算秒数
      secs = Math.floor((delta - (days * DAY_MS) - (hours * HOUR_MS) - (mins * MINUTE_MS)) / SECOND_MS);
      break;
    case 'HH:MM:SS':
      hours = Math.floor(delta / HOUR_MS);
      mins = Math.floor((delta - (hours * HOUR_MS)) / MINUTE_MS);
      secs = Math.floor((delta - (hours * HOUR_MS) - (mins * MINUTE_MS)) / SECOND_MS);
      break;
    case 'MM:SS':
      mins = Math.floor(delta / MINUTE_MS);
      secs = Math.floor((delta - (mins * MINUTE_MS)) / SECOND_MS);
      break;
    case 'SS':
      secs = Math.floor(delta / SECOND_MS);
      break;
    default:
      hours = Math.floor(delta / HOUR_MS);
      mins = Math.floor((delta - (hours * HOUR_MS)) / MINUTE_MS);
      secs = Math.floor((delta - (hours * HOUR_MS) - (mins * MINUTE_MS)) / SECOND_MS);
      break;
  }

  // 拼接要显示的字符串
  return {
    days, hours: fillZero(hours), mins: fillZero(mins), secs: fillZero(secs)
  };
};

// 字符串进行加密
const compileStr = (str, pwd = 8) => {
  if (!str) return;
  str = str + '';
  if (pwd === null || pwd.length <= 0) {
    console.warn('Please enter a password with which to encrypt the message.');
    return null;
  }
  let prand = '';
  for (let i = 0; i < pwd.length; i++) {
    prand += pwd.charCodeAt(i).toString();
  }
  let sPos = Math.floor(prand.length / 5);
  let mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5), 10);
  let incr = Math.ceil(pwd.length / 2);
  let modu = Math.pow(2, 31) - 1;
  if (mult < 2) {
    console.warn('Algorithm cannot find a suitable hash. Please choose a different password. \nPossible considerations are to choose a more complex or longer password.');
    return null;
  }
  let salt = Math.round(Math.random() * 1000000000) % 100000000;
  prand += salt;
  while (prand.length > 10) {
    prand = (parseInt(prand.substring(0, 10), 10) + parseInt(prand.substring(10, prand.length), 10)).toString();
  }
  prand = ((mult * prand) + incr) % modu;
  let enc_chr = '';
  let enc_str = '';
  for (let i = 0; i < str.length; i++) {
    enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255), 10);
    if (enc_chr < 16) {
      enc_str += '0' + enc_chr.toString(16);
    } else enc_str += enc_chr.toString(16);
    prand = ((mult * prand) + incr) % modu;
  }
  salt = salt.toString(16);
  while (salt.length < 8) salt = '0' + salt;
  enc_str += salt;
  return enc_str;
};

// 字符串进行解密
const uncompileStr = (str, pwd = 8) => {
  if(!str) return;
  if (str === null || str.length < 8) {
    console.warn('A salt value could not be extracted from the encrypted message because it\'s length is too short. The message cannot be decrypted.');
    return;
  }
  if (pwd === null || pwd.length <= 0) {
    console.warn('Please enter a password with which to decrypt the message.');
    return;
  }
  let prand = '';
  for (let i = 0; i < pwd.length; i++) {
    prand += pwd.charCodeAt(i).toString();
  }
  let sPos = Math.floor(prand.length / 5);
  let mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) + prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5), 10);
  let incr = Math.round(pwd.length / 2);
  let modu = Math.pow(2, 31) - 1;
  let salt = parseInt(str.substring(str.length - 8, str.length), 16);
  str = str.substring(0, str.length - 8);
  prand += salt;
  while (prand.length > 10) {
    prand = (parseInt(prand.substring(0, 10), 10) + parseInt(prand.substring(10, prand.length), 10)).toString();
  }
  prand = ((mult * prand) + incr) % modu;
  let enc_chr = '';
  let enc_str = '';
  for (let i = 0; i < str.length; i += 2) {
    enc_chr = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255), 10);
    enc_str += String.fromCharCode(enc_chr);
    prand = ((mult * prand) + incr) % modu;
  }
  return enc_str;
};


export {
  loadScript, parseUrl, urlConcat, uuid, phoneFilter, countDown, compileStr, uncompileStr
};
