/**
 * API 相关配置文件
 * API URL Dict api 字典
 */

const urlDict = {
  'Life': {
    'FocusList': 'user/personalize'
  }
};

const getUrl = (biz, UrlName) => {
  try {
    if (!biz || !UrlName) {
      throw new Error('getUrl Must input Biz And UrlName');
    }
    let bizKeys = Object.keys(urlDict);
    if (bizKeys.indexOf(biz) < 0) {
      throw new Error('getUrl biz Not in Dict');
    }
    if (!urlDict[biz][UrlName]) {
      throw new Error('getUrl the url name not in Dict');
    }
    return urlDict[biz][UrlName];
  } catch (err) {
    console.error(err);
  }
};

export default {
  getUrl
};
