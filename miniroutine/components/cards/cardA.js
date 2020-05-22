// components/cards/cardA.js
// 后期加入切换样式的动画，左右滑动缓冲，提升用户体验
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    avatar: {
      type: String,
      value: 'https://www.xintui.xin:8058/xintui/28/headImage/2abb34b9-4.png'
    },
    topTitle: {
      type: String,
      value: '新推名片'
    },
    mainTitle: {
      type: String,
      value: '新推名片'
    },
    positionTitle: {
      type: String,
      value: '新零售用新推'
    },
    phone: {
      type: String,
      value: '0000000000'
    },
    email: {
      type: String,
      value: 'yunjiaju@dingding.com'
    },
    address: {
      type: String,
      value: '四川省成都市新都区香江全球家居CBD2馆',
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
    checkImage() {
      let img = this.data.avatar
      console.log(img.substring(img.length - 3))
      let newImg = img.substring(0, img.lastIndexOf('132'))
      console.log(newImg)
      if (newImg) {
        img = newImg + '0'
      }
      // img = newImg + '0'
      // console.log(img)
      let imgs = []
      imgs[0] = img
      if (img) {
        wx.previewImage({
          urls: imgs,
          current: img
        })
      }
    }
  }
})
