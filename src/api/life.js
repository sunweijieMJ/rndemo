import Abstract from './Abstract.js';

class Life extends Abstract {

  constructor() {
    super();
  }

  /**
   * 首页动态tab
   * @param {number/string} created_at
   * @param {number} feed_type
   */
  getFocusList(data) {
    return this.getReq('Life.FocusList', data);
  }

}

// 单列模式返回对象
let instance;
export default () => {
  if (instance) return instance;
  instance = new Life();
  return instance;
};
