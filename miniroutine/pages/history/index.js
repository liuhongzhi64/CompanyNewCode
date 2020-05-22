import remote from '../../service/remote.js';
import constants from '../../common/constants.js';
import { image } from '../../request/index.js';
import { getSystem, getCurrentDate, lessDate } from '../../utils/util.js';
Page({
  data: {
    uniqueKey: -1,
    listData: [],
    more: true,
    page: {
      currentPage: 1,
      pageSize: 10,
      sort: 'desc'
    }
  },
  onLoad: function (options) {
    let query = JSON.parse(options.query);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey,
      query: query
    }, () =>{
      this.getHistoryItems();
      this.initVip();
    })
  },
  onReady: function () {
  },
  onReachBottom() {
    let that = this;
    // console.log(this.data.more)
    if (this.data.more) {
      let page = this.data.page;
      page.currentPage += 1;
      this.setData({
        page: page,
        loadingmore: true
      }, () => {
        this.getHistoryItems();
        let timeset = setTimeout((callback) => {
          that.setData({
            loadingmore: false
          })
        }, 1000, () => {
          clearTimeout(timeset);
        })
      })
    }
  },
  back() {
    wx.navigateBack({});
  },
  // 获取历史记录
  getHistoryItems() {
    let more = this.data.more;
    if (!more) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return;
    }
    let that = this;
    let listData = this.data.listData;
    let page = that.data.page;
    let query = that.data.query;
    
    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在71引用
    // remote.getMyRecords(query.userSysNo, query.touserSysNo, query.times, query.timesFinish, 1, page).then(res => {
    remote.getMyRecords(query.userSysNo, query.touserSysNo, '2019-11-01', query.timesFinish, 1, merchantSysNo, page).then(res => {
      // let result = res.data;
      let more = that.data.more
      // console.log(result)
      // console.log(page.currentPage)
      if (page.currentPage * page.pageSize > res.data.totalCount) {
        more = false;//以前代码,没有else
        // more = true;//以前代码
      }
      // else{
      //   more = false;
      // }
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].HeadPortraitUrl = image(res.data[i].HeadPortraitUrl);
        // result[i].VisitTime = result[i].VisitTime.split('T')[0] + " " + result[i].VisitTime.split('T')[1];
      }
      that.setData({
        more: more,
        page: page,
        listData: listData.concat(res.data),
        historyItemsCount: res.sumCount
      })

      let list = that.data.listData
      // console.log(list)
      for (let i = 0; i < list.length; i++) {
        let url = list[i].HeadPortraitUrl.split("https://")[1]
        // console.log(url)
        if (url == 'www.xintui.xin:8058') {
          url = list[i].HeadPortraitUrl.split("www.xintui.xin:8058")[1]
          list[i].HeadPortraitUrl = list[i].HeadPortraitUrl.split("www.xintui.xin:8058")[1]
        }
        that.setData({
          listData: list
        })
      }
    })
  },
  // initVip() {
  //   let that = this;
  //   remote.vipCheck(this.data.uniqueKey).then(res => {
  //     that.setData({
  //       vip: res.data
  //     })
  //   })
  // },
  initVip() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getUserPackage(this.data.uniqueKey, merchantSysNo).then(res => {
      that.setData({
        vip: res.data.AIData
      })
    })
  },
  showInfo(event) {
    // let index = event.currentTarget.dataset.index;
    // let historyItems = this.data.listData;
    // let item = historyItems[index];
    // wx.navigateTo({
    //   url: `../zone/customers/info/index?targetId=${item.InUserSysNo}`
    // })
    let vip = this.data.vip;
    // console.log(vip)
    wx.showLoading({
      title: '加载中',
    })
    let index = event.currentTarget.dataset.index;
    
    let historyItems = this.data.listData;
    let item = historyItems[index];
    // let now = new Date()
    // let y = now.getFullYear()
    // let m = now.getMonth() + 1
    // let d = now.getDate()
    // m = m < 10 ? "0" + m : m
    // d = d < 10 ? "0" + d : d
    // let today = y + "-" + m + "-" + d;
    // vip.EndTime = (vip.EndTime.split('T'))[0];
    if (vip>0) {
      wx.navigateTo({
        url: `../zone/customers/info/index?targetId=${item.InUserSysNo}`,
        success: function () {
          wx.hideLoading();
        }
      })
    } else {
      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
      remote.isPass(this.data.uniqueKey, merchantSysNo).then(res => {
        // console.log(res)
        wx.navigateTo({
          url: `../zone/radar/check?hadSend=${res.success}&suggestPerson=${res.data}`,
          success() {
            wx.hideLoading()
          }
        })
      })
    }
  }
})