class Observer {
  constructor(data) {
    this.data = data;
    this.filterObj(data);
  }
  static isObject(obj) {
    if (Object.prototype.toString.call(obj) === "[object Object]") {
      return true;
    }
    return false;

  }
  filterObj(data) {
    if (!Observer.isObject(data)) return;
    for (const key in data) {
      // 过滤原型链上的属性。
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (Observer.isObject(data[key])) {
          new Observer(data[key]);
        };
        this.watch(key, value);
      }
    }
  }
  watch(k, v) {
    Object.defineProperty(this.data, k, {
      enumerable: true,
      configurable: true,
      get: function () {
        console.log(`${k}，被访问。`)
        return v;
      },
      set: function (newV) {
        console.log(`${k}，属性值发生变化。`)
        console.log(`新的值为：${JSON.stringify(newV)}。`)
        if (Observer.isObject(newV)) {
          new Observer(newV);
        }
        v = newV;
      },
    })
  }
}