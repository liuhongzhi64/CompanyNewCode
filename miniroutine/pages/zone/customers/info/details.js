Page({
  data: {
    userInfo: {}
  },
  onLoad: function (options) {
    // console.log(options)
    let item = JSON.parse(options.item);
    console.log(item)
    this.setData({
      userInfo: item
    })
  },
  back() {
    wx.navigateBack({});
  },
  call() {
    let userInfo = this.data.userInfo;
    // console.log(userInfo)
    wx.makePhoneCall({
      phoneNumber: userInfo.TelePhone || userInfo.Phone,
    })
  }
})