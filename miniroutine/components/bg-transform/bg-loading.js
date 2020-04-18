// components/bg-transform/bg-loading.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showLoading: {
      type: Boolean,
      value: false,
      observer: '__changed'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    __changed: function (newValue, oldValue) {
      if (newValue) {
        
      }
    }
  },
  ready: function () {
    let system = wx.getSystemInfoSync();
    let height = system.screenHeight - 68;
    let width = system.screenWidth;
    this.setData({
      height: height,
      width: width
    })
  }
})
