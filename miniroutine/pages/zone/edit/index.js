// pages/zone/edit/index.js
import constants from '../../../common/constants.js';
import { image } from '../../../request/index.js';
import remote from '../../../service/remote.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    customItems: [
      { index: 0, name: '基本信息', icon: 'profilefill', badge: 0, url: './profile/index' },
      { index: 1, name: '我的照片', icon: 'picfill', badge: 0, url: './profile/pic' },
      { index: 2, name: '我的视频', icon: 'videofill', badge: 0, url: './profile/video' },
      { index: 3, name: '我的标签', icon: 'tagfill', badge: 0, url: './profile/tags' },
      { index: 4, name: '我的公司', icon: 'servicefill', badge: 0, url: './profile/company' },
    ],
    originIndex: 0,
    current: 0,
    myInfo: {},
    dotStyle: true,
    swiperHeight: 580,
    address: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let myInfo = wx.getStorageSync(constants.USERINFO);
    let avatar = image(myInfo.HeadPortraitUrl);
    if (myInfo) {
      this.setData({
        myInfo: myInfo,
        avatar: avatar,
        current: myInfo.TemplateSysNo,
        originIndex: myInfo.TemplateSysNo,
        address: myInfo.ProvinceName + myInfo.CityName + myInfo.DistrictName + myInfo.Address
      })
    }
  },
  update() {
    let myInfo = this.data.myInfo;
    let current = this.data.current;
    let originIndex = this.data.originIndex;
    let that = this;
    if (current != originIndex) {
      remote.updateTemplate({
        SysNo: myInfo.SysNo,
        TemplateSysNo: myInfo.TemplateSysNo.toString()
      }).then(res => {
        wx.setStorageSync(constants.USERINFO, that.data.myInfo);
      })
    }
  },
  onHide: function () {
    this.update();
  },
  onUnload() {
    this.update();
  },
  back() {
    wx.navigateBack({});
  },
  cardSwiper(event) {
    let current = event.detail.current;
    if (current == 0) {
      this.setData({
        swiperHeight: 580,
        curIndex: current
      })
    } else {
      this.setData({
        swiperHeight: 950,
        curIndex: current
      })
    }
  },
  setTemplateBySwiper(event) {
    let current = event.currentTarget.dataset.current;
    let myInfo = this.data.myInfo;
    myInfo.TemplateSysNo = current;
    this.setData({
      myInfo: myInfo,
      current: current
    })
  }
})