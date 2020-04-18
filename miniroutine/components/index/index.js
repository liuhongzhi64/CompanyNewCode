// components/index/index.js
// 组件不支持平板，仅仅支持手机客户端，使用了colorUI中的icon，默认为upx，所以在适应屏幕上不太灵活
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showIndex: {
      type: Boolean,
      value: true,
      observer: '__changed'
    },
    showBackTop: {
      type: Boolean,
      value: true
    },
    showHome: {
      type: Boolean,
      value: true
    },
    showMessage: {
      type: Boolean,
      value: true
    },
    // 目前徽章只支持红点，不支持数字
    badge: {
      type: Number,
      value: 0,
      observer: '__shaking'
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
    backTop(event) {
      this.triggerEvent('backTop');
    },
    backHome(event) {
      this.triggerEvent('backHome');
    },
    sendMessage(event) {
      this.triggerEvent('sendMessage');
    },
    __changed(newValue, oldValue) {
    },
    __shaking(newValue, oldValue) {
      console.log('来消息了，跟随我摇摆一下');
    }
  }
})
