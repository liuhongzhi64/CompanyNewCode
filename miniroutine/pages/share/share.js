// pages/share/share.js
import remote from '../../service/remote.js';
import { image } from '../../request/index.js';
import {userSetting } from '../../common/version.js';
import Card from '../../utils/productPainter.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    duration: 500,
    timingFunction: 'linear',
    _animation: {},
    details: {},
    imagePath: '',
    template: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '正在生成',
    })
    let info = options.details;
    if (info && info.uniqueKey != -1) {
      this.setData({
        details: JSON.parse(info)
      })
    }
    this._rotate = wx.createAnimation({
      duration: this.data.duration,
      timingFunction: this.data.timingFunction
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getQRImage({
      path: `/pages/index?targetKey=${this.data.details.uniqueKey}`,
      width: 430,
      auto_color: false,
      line_color: { r: 1, g: 1, b: 1 },
      is_hyaline: false
    })
  },
  onImgOK(event) {
    let that = this;
    let imagePath = event.detail.path;
    this.setData({
      imagePath: imagePath
    }, () => {
      wx.hideLoading();
      that.startRotate();
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  back(res) {
    wx.navigateBack()
  },
  startRotate() {
    this._rotate.rotate(180).step();
    this.setData({
      _animation: this._rotate
    })
  },
  getQRImage(data) {
    let that = this
    remote.createQr(this.data.details.uniqueKey, 1, data).then(res => {
      wx.getImageInfo({
        src: image(res.data),
        success: function (res) {
          that.initPainter({
            image: res.path,
            avatar: that.data.details.avatar
          })
          that.setData({
            qrPath: res.path
          })
        } 
      })
    })
  },
  initPainter(params) {
    this.setData({
      template: new Card().shareQr(params)
    })
  },
  // saveToAlbum() {
  //   let that = this;
  //   wx.showActionSheet({
  //     itemList: ['保存到手机'],
  //     success: function (res) {
  //       let tapIndex = res.tapIndex;
  //       if (tapIndex == 0) {
  //         wx.saveImageToPhotosAlbum({
  //           filePath: that.data.qrPath,
  //           success: function () {
  //             wx.showToast({
  //               title: '保存成功',
  //               icon: 'none'
  //             })
  //           },
  //           fail: function () {
  //             userSetting('scope.writePhotosAlbum', true).then(res => {
  //             })
  //             wx.showToast({
  //               title: '保存失败',
  //               icon: 'none'
  //             })
  //           }
  //         })
  //       }
  //     }
  //   })
  // }
  preview() {
    let temp  = [];
    temp[0] = this.data.imagePath;
    wx.previewImage({
      urls: temp,
      current: this.data.imagePath
    })
  }
})