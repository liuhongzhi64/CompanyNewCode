// pages/zone/index.js
import constants from '../../common/constants.js';
import { image } from '../../request/index.js';
import remote from '../../service/remote.js';
import { lessDate, today } from '../../utils/util.js'; 
const app = getApp();
Page({
  data: {
    cuIconList: [
      { cuIcon: 'edit', color: 'orange', badge: 0, name: '编辑' },
      { cuIcon: 'post', color: 'yellow', badge: 0, name: '留言' },
      { cuIcon: 'goods', color: 'olive', badge: 0, name: '商品' },
      { cuIcon: 'community', color: 'cyan', badge: 0, name: '消息' },
      { cuIcon: 'group', color: 'blue', badge: 0, name: '客户' },
      { cuIcon: 'news', color: 'purple', badge: 0, name: '名片夹' },
      { cuIcon: 'rank', color: 'mauve', badge: 0, name: '雷达' },
      { cuIcon: 'peoplelist', color: 'purple', badge: 0, name: '管理' }
    ],
    gridCol: 4,
    salerToast: false
  },
  historymore() {
    wx.navigateTo({
      url: './records/index',
    })
  },
  onLoad: function (options) {
    app.watch('unreadcount', this.feedback);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey
    }, () => {
      this.initData();
      this.getManageSpot();
      this.getComments();
    })
  },
  onReady: function () {
    
  },
  onShow: function () {
    let wxUserInfo = wx.getStorageSync(constants.USERINFO);
    if (wxUserInfo) {
      this.setData({
        myInfo: wxUserInfo,
        avatar: image(wxUserInfo.HeadPortraitUrl)
      })
      // console.log(app.globalData.unreadcount)
      let unreadcount = app.globalData.unreadcount;
      this.feedback(unreadcount);
    }
    this.getHistory();
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  becomeSaler() {
    this.setData({
      salerToast: false
    })
    wx.makePhoneCall({
      phoneNumber: constants.SERVICE_PHONE,
    })
  },
  feedback(value) {
    // console.log(value)
    let cuIconList = this.data.cuIconList;
    let item = cuIconList[3];
    item.badge = value;
    cuIconList[3] = item;
    this.setData({
      cuIconList: cuIconList
    })
  },
  // 后退
  back() {
    wx.navigateBack({})
  },
  // 点击tap
  clicktap(event) {
    let index = event.currentTarget.dataset.index;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
    console.log(merchantSysNo)
    switch(index) {
      case 0:
        wx.navigateTo({
          url: './edit/index',
        })
        break;
      case 1:
        wx.navigateTo({
          url: './comments/index',
        })
        break;
      case 2:
        wx.navigateTo({
          url: './goods/index',
        })
        break;
      case 3:
        wx.navigateTo({
          url: './messages/index',
        })
        break;
      case 4:
        wx.navigateTo({
          url: './customers/index',
        })
        break;
      case 5:
        wx.navigateTo({
          url: './cards/index',
        })
        break;
      case 6:
        remote.getUserPackage(this.data.uniqueKey, merchantSysNo).then(res => {
          let info = res.data;
          // console.log(info)
          if (info && info.AIData > 0 && lessDate(today(), info.EditDate)) {
            wx.navigateTo({
              url: './radar/index',
              success() {
                wx.hideLoading()
              }
            })
          } else {
            remote.isPass(this.data.uniqueKey, merchantSysNo).then(res => {
              // console.log(this.data.uniqueKey)
              wx.navigateTo({
                url: `./radar/check?hadSend=${res.success}&suggestPerson=${res.data}`,
                success() {
                  wx.hideLoading()
                }
              })
            })
          }
        })
        // let vip = this.data.vip;
        // let now = new Date();
        // let y = now.getFullYear();
        // let m = now.getMonth() + 1;
        // let d = now.getDate();
        // m = m < 10 ? "0" + m : m;
        // d = d < 10 ? "0" + d : d;
        // let today = y + "-" + m + "-" + d;
        // if (vip && vip.AIData > 0 && lessDate(today, vip.EditDateStr)) {
        //   wx.navigateTo({
        //     url: './radar/index'
        //   })
        // } else {
          // remote.isPass(this.data.uniqueKey).then(res => {
          //   wx.navigateTo({
          //     url: `./radar/check?hadSend=${res.success}&suggestPerson=${res.data}`,
          //     success() {
          //       wx.hideLoading()
          //     }
          //   })
          // })
        // }
        break;
      case 7:
        remote.vipCheck(this.data.uniqueKey, merchantSysNo).then(res => {
          let manageVip = res.data;
          if (manageVip && manageVip['AINumber'] > 0) {
            wx.navigateTo({
              url: './manage/index',
            })
          } else {
            // 提交管理员申请
            this.setData({
              salerToast: true
            })
          }
        })
        break;
    }
  },
  initManagerVip() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.vipCheck(this.data.uniqueKey, merchantSysNo).then(res => {
      that.setData({
        manageVip: res.data
      })
    })
  },
  initData() {
    let uniqueKey = this.data.uniqueKey;
    this.getCollectionList(uniqueKey);
  },
  getCollectionList(id) {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在200引用

    remote.getCollectionList(id, "", merchantSysNo).then(res => {
      let list = res.data;
      // console.log(list)==null 所以有报错
      for (let i = 0; i < list.length; i++) {
        list[i].HeadPortraitUrl = image(list[i].HeadPortraitUrl);
      }
      that.setData({
        cards: list
      })
    })
  },
  initVip() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getUserPackage(this.data.uniqueKey, merchantSysNo).then(res => {
      that.setData({
        vip: res.data
      })
    })
  },
  getHistory() {
    let that = this;
    remote.historyItems(that.data.uniqueKey, {
      currentPage: 1,
      pageSize: 10,
      sort: "desc"
    }).then(res => {
      let result = res.data;
      for (let i = 0; i < result.length; i++) {
        result[i].HeadPortraitUrl = image(result[i].HeadPortraitUrl);
        result[i].VisitTime = result[i].VisitTime.split('T')[0] + " " + result[i].VisitTime.split('T')[1];
      }
      that.setData({
        historyItems: result,
        historyItemsCount: res.sumCount
      })
    })
  },
  showInfo(event) {
    let vip = this.data.vip;
    wx.showLoading({
      title: '加载中',
    })
    let index = event.currentTarget.dataset.index;
    let historyItems = this.data.historyItems;
    let item = historyItems[index];

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getUserPackage(this.data.uniqueKey, merchantSysNo).then(res => {
      let info = res.data;
      if (info && info.AIData > 0 && lessDate(today(), info.EditDate)) {
        wx.navigateTo({
          url: `./customers/info/index?targetId=${item.UserSysNo}`,
          success: function () {
            wx.hideLoading();
          }
        })
      } else {
        remote.isPass(this.data.uniqueKey, merchantSysNo).then(res => {
          wx.navigateTo({
            url: `./radar/check?hadSend=${res.success}&suggestPerson=${res.data}`,
            success() {
              wx.hideLoading()
            }
          })
        })
      }
    })
    // vip.EndTime = (vip.EndTime.split('T'))[0];
    // if (vip && vip.AIData > 0 && lessDate(today, vip.EditDateStr)) {
      // wx.navigateTo({
      //   url: `./customers/info/index?targetId=${item.UserSysNo}`,
      //   success: function () {
      //     wx.hideLoading();
      //   }
      // })
    // } else {
    //   remote.isPass(this.data.uniqueKey).then(res => {
    //     wx.navigateTo({
    //       url: `./check?hadSend=${res.success}&suggestPerson=${res.data}`,
    //       success() {
    //         wx.hideLoading()
    //       }
    //     })
    //   })
    // }
  },
  cancleSalerToast() {
    this.setData({
      salerToast: false
    })
  },
  getManageSpot() {
    let cuIconList = this.data.cuIconList;
    let item = cuIconList[7];
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getRelationShip(this.data.uniqueKey, 0, merchantSysNo, {
      pageSize: 12,
      sort: 'desc',
      currentPage: 1
    }).then(res => {
      item.badge = res.totalCount;
      cuIconList[7] = item;
      that.setData({
        cuIconList: cuIconList
      })
    })
  },
  getComments() {
    let cuIconList = this.data.cuIconList;
    let item = cuIconList[1];
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在313引用

    remote.getComments(this.data.uniqueKey, 0, {
      pageSize: 12,
      currentPage: 1,
      sort: "desc"
    }, merchantSysNo).then(res => {
      item.badge = res.totalCount;
      cuIconList[1] = item;
      that.setData({
        cuIconList: cuIconList
      })
    })
  }
})