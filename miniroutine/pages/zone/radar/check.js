// pages/zone/AiCheck/AiCheck.js
import constants from '../../../common/constants.js';
import remote from '../../../service/remote.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    userTelphone: '',
    recommandTelphone: '',
    hadSend: true,
    hadComplate: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let key = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: key
    })
    let hadSend = options.hadSend
    if (hadSend == 'true') {
      this.setData({
        hadSend: true
      })
    } else {
      this.setData({
        hadSend: false
      })
    }
    if (options.suggestPerson) {
      this.setData({
        suggestPerson: options.suggestPerson
      })
    }
  },
  inputUserName(event) {
    this.setData({
      username: event.detail.value
    })
  },
  inputUserTelphone(event) {
    this.setData({
      userTelphone: event.detail.value
    })
  },
  inputCommandTelphone(event) {
    this.setData({
      recommandTelphone: event.detail.value
    })
  },
  commit() {
    let that = this;
    let username = this.data.username
    let userTelphone = this.data.userTelphone
    let recommandTelphone = this.data.recommandTelphone
    if (!username) {
      wx.showToast({
        title: '请填写姓名',
        icon: 'none'
      })
      return;
    }
    if (!(/^1[3456789]\d{9}$/.test(userTelphone))) {//以前的电话号码正则表达式
    // if (!(/^1[0-9]\d{9}$/.test(userTelphone))) {
      wx.showToast({
        title: '请正确填写号码',
        icon: 'none'
      })
      return;
    }
    if (!(/^1[3456789]\d{9}$/.test(recommandTelphone))) {//以前的电话号码正则表达式
    // if (!(/^1[0-9]\d{9}$/.test(recommandTelphone))) {
      wx.showToast({
        title: '请正确填写推荐人号码',
        icon: 'none'
      })
      return;
    }
    this.setData({
      sendRequest: true
    }, () => {

      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

      remote.insertRelationship({
        Name: username,
        UserTelPhone: userTelphone,
        Status: 0,
        Type: 1,
        VipTelPhone: recommandTelphone,
        InUserSysNo: this.data.uniqueKey,
        MerchantSysNo: merchantSysNo
      }).then(res => {
        that.setData({
          hadComplate: true,
          suggestPerson: recommandTelphone || ""
        })
      })
    })
  },
  callme() {
    wx.makePhoneCall({
      phoneNumber: this.data.suggestPerson ? this.data.suggestPerson : constants.SERVICE_PHONE,
      fail(err) {
      }
    })
  },
  back() {
    wx.navigateBack({});
  }
})