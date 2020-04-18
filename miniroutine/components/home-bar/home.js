// components/home-bar/home.js
Component({
  externalClasses: ['ext-class'],
  /**
   * 组件的属性列表
   */
  properties: {
    avatar: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    fontSize: {
      type: String,
      value: '12'
    },
    color: {
      type: String,
      value: '#000'
    },
    background: {
      type: String,
      value: '#FFF'
    },
    border: {
      type: String,
      value: '#E6E6E6'
    },
    startAnimation: {
      type: Boolean,
      value: false,
      observer: '_startAnimation'
    },
    badge: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    munuRect: null,
    hideText: false,
    animation: ''
  },
  attached () {
    this.getSysButtomArea()
  },
  /**
   * 组件的方法列表
   */
  methods: {
    getSysButtomArea: function() {
      let menuRect = wx.getMenuButtonBoundingClientRect();
      let buttonInner = menuRect.width - 8;
      let buttonInnerTextBox = buttonInner - 27;
      this.setData({
        menuRect: menuRect,
        buttonInner: buttonInner,
        buttonInnerTextBox: buttonInnerTextBox
      })
    },
    _startAnimation(newValue, oldValue) {
      if (newValue) {
        this.setData({
          animation: 'animation',
          hideText: true
        })
      } else {
        this.setData({
          animation: '',
          hideText: false
        })
      }
    },
    getSysUserInfo(res) {
      this.triggerEvent('getUserInfo', res)
    }
  },
  
})
