// components/tips/mover.js
const app = getApp()
Component({
  /**
   * Component properties
   */
  properties: {
    positionTab: {
      type: Object,
      value: {
        width: '',
        height: '',
        top: 954,
        left: 668
      }
    },
    imageSrc: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: '咨询'
    }
  },

  /**
   * Component initial data
   */
  data: {

  },

  /**
   * Component methods
   */
  methods: {
    viewProps() {
      let system = wx.getSystemInfoSync();
      const height = system.screenHeight - 68;
      this.setData({
        positionTab: {
          width: system.screenWidth,
          height: height,
          top: 68,
          left: 0
        }
      })
    },
    questServer(event) {
      // 后期进行统一封装传递的事件内容，统一的消息处理函数进行解析
      this.triggerEvent('drapMoveBarPressDown')
    }
  },
  attached() {
    this.viewProps()
  }
})
