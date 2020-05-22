import remote from '../../../service/remote.js';
import { image } from '../../../request/index.js';
import { today, lessDate } from '../../../utils/util.js';
import constants from '../../../common/constants.js';
const app = getApp();
Page({
  data: {
    checkBox: [
      { key: 0, text: '今日访客', count: 0, data: [], query: 'max' },
      { key: 0, text: '今日浏览量', count: 0, data: [], query: 'max' },
      { key: 0, text: '总访客量', count: 0, data: [], query: 'max' }
    ],
    selected: 0,
    headerBox: [
      {
        key: 0,
        text: '访问次数'
      },
      {
        key: 1,
        text: '时间轨迹'
      },
      {
        key: 2,
        text: '意向等级'
      },
    ],
    headerSelected: 1,
    key: -1,
    userGroup: [],
    page: {
      sort: 'desc',
      pageSize: 10,
      currentPage: 1
    },
    more: true,
    complate: false,
    merchantSysNo:0
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let key = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      key: key
    }, () => {
      this.init(2, this.data.page);
      this.initRecords();
      this.initVip();
    })
  },
  onReachBottom: function () {
    let more = this.data.more
    if (more) {
      let page = this.data.page
      let headerSelected = this.data.headerSelected
      let totalCount = this.data.totalCount
      if (page.currentPage * page.pageSize > totalCount) {
        more = false
        wx.showToast({
          title: '已经完啦！',
        })
        this.setData({
          more: more
        })
        return;
      } else {
        page.currentPage += 1
        this.setData({
          page: page
        })
        this.init(headerSelected + 1, page)
      }
    }
  },
  boxClick(event) {
    let index = event.currentTarget.dataset.index;
    let userGroup = this.data.userGroup;
    let item = userGroup[index];
    let vip = this.data.vip;
    if (vip == null) {
      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
      remote.isPass(this.data.key, merchantSysNo).then(res => {
        wx.navigateTo({
          url: `../radar/check?hadSend=${res.success}&suggestPerson=${res.data}`,
          success() {
            wx.hideLoading()
          }
        })
      })
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    let historyItems = this.data.historyItems;
    let now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth() + 1
    let d = now.getDate()
    m = m < 10 ? "0" + m : m
    d = d < 10 ? "0" + d : d
    let today = y + "-" + m + "-" + d;
    // if (vip && vip.AIData > 0 && lessDate(today, vip.EditDateStr)) {
    if (vip && vip.AIData > 0) {
      // wx.navigateTo({
      //   url: `./customers/info/index?targetId=${item.UserSysNo}`,
        // success: function () {
        //   wx.hideLoading();
        // }
      // })
      
      wx.navigateTo({
        url: `../customers/info/index?targetId=${item.InUserSysNo}`,
        success: function () {
          wx.hideLoading();
        }
      })
    } 
    else {
      // console.log(this.data)
      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
      remote.isPass(this.data.key, merchantSysNo).then(res => {
        wx.navigateTo({
          url: `../radar/check?hadSend=${res.success}&suggestPerson=${res.data}`,
          success() {
            wx.hideLoading()
          }
        })
      })
    }
  },
  back() {
    wx.navigateBack({});
  },
  selectedClick(event) {
    let index = event.currentTarget.dataset.index
    this.setData({
      selected: index
    })
    switch (index) {
      case 0:
        let data = {
          userSysNo: 0,
          touserSysNo: this.data.key,
          times: today(),
          timesFinish: today(),
          title: '今日访客'
        }
        wx.navigateTo({
          url: `../../history/index?query=${JSON.stringify(data)}`,
        })
        break;
      case 1:
        let data1 = {
          userSysNo: 0,
          touserSysNo: this.data.key,
          times: today(),
          timesFinish: today(),
          title: '今日浏览量'
        }
        wx.navigateTo({
          url: `../../history/index?query=${JSON.stringify(data1)}`,
        })
        break;
      case 2:
        let data2 = {
          userSysNo: 0,
          touserSysNo: this.data.key,
          times: '2011-11-01',
          timesFinish: today(),
          title: '总浏览量'
        }
        wx.navigateTo({
          url: `../../history/index?query=${JSON.stringify(data2)}`,
        })
        break;
    }
  },
  headerClick(event) {
    let index = event.currentTarget.dataset.index
    let page = this.data.page
    page.currentPage = 1
    this.setData({
      headerSelected: index,
      page: page,
      userGroup: [],
      more: true
    })
    this.setData({
      complate: false
    },() => {
      this.init(index + 1, page);
    })
  },
  
  init(index, page) {
    let key = this.data.key
    let _this = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在202引用
    this.setData({
      merchantSysNo: wx.getStorageSync(constants.MerchantSysNo)
    })

    // remote.getMyRecords(0, key, '2019-11-01', today(), index, page).then(res => {
    remote.getMyRecords(0, key, '2019-11-01', today(), index, this.data.merchantSysNo, page).then(res => {
      let data = res.data
      for (let index = 0; index < data.length; index++) {
        if (data[index].HeadPortraitUrl.indexOf('https') == -1) {
          data[index].HeadPortraitUrl = image(data[index].HeadPortraitUrl)
        }
      }
      let more = _this.data.more
      if (page.currentPage * page.pageSize > res.data.totalCount) {
        more = false
      }
      let userGroup = _this.data.userGroup
      _this.setData({
        userGroup: userGroup.concat(data),
        more: more,
        totalCount: res.data.totalCount,
        complate: true
      }, () => {
        wx.hideLoading()
      })
    }).catch(err => {
      console.log(err)
    })
  },
  initRecords() {
    let key = this.data.key
    let _this = this;
    let array = this.data.checkBox
    
    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在236引用
    this.setData({
      merchantSysNo: wx.getStorageSync(constants.MerchantSysNo)
    })
    // console.log(_this.data.merchantSysNo)
    // remote.getMyRecords(0, _this.data.key, today(), today(), 1, {
    remote.getMyRecords(0, _this.data.key, today(), today(), 1, _this.data.merchantSysNo, {
      pageSize: 100,
      currentPage: 1,
      sort: 'desc'
    }).then(res => {
      console.log(res)
      array[0]['count'] = res.totalCount
      array[1]['count'] = res.browsetotalCount
      remote.getMyRecords(0, _this.data.key, '2019-11-01', today(), 1, _this.data.merchantSysNo, {
        pageSize: 100,
        currentPage: 1,
        sort: 'desc'
      }).then(res => {
        array[2]['count'] = res.totalCount
        _this.setData({
          checkBox: array
        })
      })
    })
  },
  initVip() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getUserPackage(this.data.key, merchantSysNo).then(res => {
      that.setData({
        vip: res.data
      })
    })
  },
})