/**
 * axios基础构建
 * @date 2018-12-19
 */

import axios from 'axios';
import linsign from '../utils/signFun';
import ApiUrl from '../config/apiConfig';
import interceptor from '../config/global';
import {parseUrl, urlConcat} from '../utils/business/tools';

let send_flag = false;
let baseURL = 'https://api.lanehub.cn';
let commonParams = {
  terminal: 'hybrid',
  __platform: 'm',
  app: parseUrl().app || 'r-lanehub',
  lh_authinfo: decodeURIComponent(parseUrl().lh_authinfo || window.localStorage.lh_authinfo)
};

// axios 配置
const Axios = axios.create({
  timeout: 6000,
  responseType: 'json',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
  }
});

// 添加响应拦截器
Axios.interceptors.response.use((response) => {
  if (interceptor.submit_request.includes(response.config.url.split('?')[0].split(baseURL)[1])) {
    send_flag = false;
  }
  // 对响应数据做点什么
  return response;
}, (error) => {
  // 对响应错误做点什么
  return Promise.reject(error);
});

class Abstract {
  constructor() {
    this.ApiUrl = ApiUrl;
    this.linsign = linsign;
  }

  apiAxios(method, url, params) {
    let that = this;
    let _Url = url.split('.');
    url = that.ApiUrl.getUrl(_Url[0], _Url[1]);

    // 签名加密
    if (method === 'POST') {
      url = url + `${url.indexOf('?') === -1 ? '?' : '&'}${urlConcat(commonParams)}`;
      url = url + `&sign=${linsign.resignHash(url, params)}`;
    } else {
      Object.assign(params, commonParams);
      params.sign = linsign.signHash(url, params);
    }

    return new Promise((resolve, reject) => {
      // 终止重复请求
      if (interceptor.submit_request.includes(url.split('?')[0])) {
        if (send_flag) {
          resolve({status: false, message: '重复请求终止', data: null});
          return;
        }
        send_flag = true;
      }

      Axios({
        baseURL,
        method,
        url,
        params: method === 'GET' || method === 'DELETE' ? params : null,
        data: method === 'POST' || method === 'PUT' ? params : null
      }).then((res) => {
        if (res.data.code === '00006') {
          resolve({status: true, message: 'success', data: res.data.data, origin: res.data});
        } else {
          resolve({status: false, message: res.data.message, data: res.data.data, origin: res.data});
        }
      }).catch((err) => {
        if (err) console.warn(err);
        reject({status: false, message: '接口异常', data: null});
      });
    });
  }

  /**
   * GET类型的网络请求
   */
  getReq(url, params) {
    return this.apiAxios('GET', url, params);
  }

  /**
   * POST类型的网络请求
   */
  postReq(url, params) {
    return this.apiAxios('POST', url, params);
  }

}

export default Abstract;
