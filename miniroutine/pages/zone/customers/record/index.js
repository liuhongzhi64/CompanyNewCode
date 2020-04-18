import remote from '../../../../service/remote.js';
import constants from '../../../../common/constants.js';
Page({
  data: {
    text: '',
    targetUserId: -1,
    uniqueKey: -1
  },
  onLoad: function (options) {
    let targetUserId = options.targetId;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      targetUserId: targetUserId,
      uniqueKey: uniqueKey
    })
  },
  back() {
    wx.navigateBack();
  },
  input(event) {
    this.setData({
      text: event.detail.value
    })
  },
  save() {
    let that = this;
    remote.insertRecord({
      CustomSysNo: this.data.targetUserId,
      Description: this.data.text,
      InUserSysNo: this.data.uniqueKey
    }).then(res => {
      if (res.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'none',
          success: function () {
            that.back();
          }
        })
      }
    })
  }
})