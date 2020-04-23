Page({
  data: {
    userInfo: {}
  },
  onLoad: function (options) {
    console.log(options)
    let item = JSON.parse(options.item);
    this.setData({
      userInfo: item
    })
  },
  back() {
    wx.navigateBack({});
  },
  call() {
    let userInfo = this.data.userInfo;
    wx.makePhoneCall({
      phoneNumber: userInfo.Phone,
    })
  }
})