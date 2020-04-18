const app = getApp();
Page({
  data: {
    listData: []
  },
  onLoad: function (options) {
    this.setData({
      listData: app.globalData.images
    })
  },
  onReady: function () {
    
  },
  onShow: function () {
    
  },
  onHide: function () {
    
  },
  save() {
    let listData = this.data.listData;
    app.globalData.images = listData;
    wx.navigateBack({});
  },
  back() {
    wx.navigateBack({});
  },
  upperPosition(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let temp = listData[index];
    listData[index] = listData[index - 1];
    listData[index - 1] = temp;
    this.setData({
      listData: listData
    })
  },
  lowerPosition(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let temp = listData[index];
    listData[index] = listData[index + 1];
    listData[index + 1] = temp;
    this.setData({
      listData: listData
    })
  },
  deleteIndexImage(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    listData.splice(index, 1);
    this.setData({
      listData: listData
    })
  },
  inputDescription(event) {
    let target = event.currentTarget.dataset.index;
    let text = event.detail.value;
    let listData = this.data.listData;
    listData[target].description = text;
    this.setData({
      listData: listData
    })
  },
  chooseImage(event) {
    let target = event.currentTarget.dataset.target;
    let listData = this.data.listData;
    let that = this;
    wx.chooseImage({
      count: 1,
      success: function (res) {
        let image = res.tempFilePaths;
        listData[target].path = image[0];
        that.setData({
          listData: listData
        })
      }
    })
  }
})