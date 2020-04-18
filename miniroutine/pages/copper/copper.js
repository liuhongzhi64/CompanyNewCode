// pages/personal/edit/edit.js
const app = getApp()
Page({

  /**
   * Page initial data
   */
  data: {
    src: '',
    width: 250,//宽度
    height: 250,//高度
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    //获取到image-cropper对象
    this.cropper = this.selectComponent("#image-cropper");
    //开始裁剪
    this.setData({
      src: options.path,
    });
    wx.showLoading({
      title: '加载中'
    })
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {

  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

  },
  cropperload(e) {
  },
  loadimage(e) {
    let image = this.data.src;
    let that = this;
    wx.getImageInfo({
      src: image,
      success: function (res) {
        let { width, height } = res;
        let centerBoxWidth = that.data.width;
        let centerBoxHeight = that.data.height;
        if (width < centerBoxWidth){
          that.setData({
            imgWidth: centerBoxWidth,
            imgHeight: centerBoxWidth * height / width
          })
        } else if (height < centerBoxHeight){
          that.setData({
            imgWidth: centerBoxWidth * width / height,
            imgHeight: centerBoxHeight
          })
        }
        that.cropper.imgReset();
        wx.hideLoading();
      }
    })
    // wx.hideLoading();
    //重置图片角度、缩放、位置
    //this.cropper.imgReset();
  },
  clickcut(e) {
    //点击裁剪框阅览图片
    // wx.previewImage({
    //   current: e.detail.url, // 当前显示图片的http链接
    //   urls: [e.detail.url] // 需要预览的图片http链接列表
    // })
  },
  commit() {
    wx.showLoading({
      title: '正在裁剪',
    })
    this.cropper.getImg(res => {
      app.globalData['cropperImage'] = res.url
      wx.navigateBack()
    })
  }
})