import remote from '../../../service/remote.js';
import { image } from '../../../request/index.js';
import constants from '../../../common/constants.js';
import { getSystem } from '../../../utils/util.js';
Page({
  data: {
    sortItems: ['按时间顺序', '按浏览次数'],
    page: {
      currentPage: 1,
      pageSize: 12,
      sort: 'desc'
    },
    more: true,
    listData: [],
    sortType: 1,
    complate: false
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let { index, title, type, radarType } = options;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let screenHeight = getSystem.getScreenHeightRpx();
    this.setData({
      screenHeight: screenHeight,
      uniqueKey: uniqueKey,
      index: index,
      title: title,
      type: type,
      radarType: radarType
    }, () => {
      this.initData(index, type, 1);
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  back() {
    wx.navigateBack({});
  },
  loadmore() {
    let that = this;
    if (this.data.more) {
      this.setData({
        loadingmore: true
      }, () => {
        this.initData(this.data.index, this.data.type, this.data.sortType);
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
  sort(event) {
    let tapIndex = event.currentTarget.dataset.index;
    let page = this.data.page;
    let index = this.data.index;
    let type = this.data.type;
    let that = this;
    page.currentPage = 1;
    that.setData({
      more: true,
      listData: [],
      page: page,
      sortType: tapIndex
    }, () => {
      that.initData(index, type, tapIndex);
    })
    // wx.showActionSheet({
    //   itemList: sortItems,
    //   success: function (res) {
    //     let tapIndex = res.tapIndex + 1;
        
    //   }
    // })
  },
  initData(index, type, sortType) {
    let more = this.data.more;
    if (!more) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return;
    }
    let uniqueKey = this.data.uniqueKey;
    let page = this.data.page;
    let listData = this.data.listData;
    let that = this;
    if (index == 0) {
      // 累计客户

      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在104引用

      remote.getCustomerInfoBySysNo(uniqueKey, type, sortType, merchantSysNo, page).then(res => {
        if (res.success) {
          let temp = res.data;
          for (let i = 0; i < temp.length; i++) {
            temp[i].HeadPortraitUrl = image(temp[i].HeadPortraitUrl);
            temp[i].VisitTime = that.splitString(temp[i].VisitTime, 'T');
          }
          if (temp.length < page.pageSize) {
            more = false;
          }
          page.currentPage += 1;
          that.setData({
            listData: listData.concat(temp),
            page: page,
            more: more,
            complate: true
          }, () => {wx.hideLoading();})
        }
      })
    } else if (index == 1) {

      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在129引用

      // 累计访问
      remote.getCustomerRecordsBySysNo(uniqueKey, type, sortType, merchantSysNo, page).then(res => {
        if (res.success) {
          let temp = res.data;
          for (let i = 0; i < temp.length; i++) {
            temp[i].HeadPortraitUrl = image(temp[i].HeadPortraitUrl);
            temp[i].VisitTime = that.splitString(temp[i].VisitTime, 'T');
          }
          if (temp.length < page.pageSize) {
            more = false;
          }
          page.currentPage += 1;
          that.setData({
            listData: listData.concat(temp),
            page: page,
            more: more,
            complate: true
          },() => {wx.hideLoading();})
        }
      })
    } else if (index == 2) {
      // console.log("累计跟进")  
      // 累计跟进

      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在155引用

      remote.getFollowupCustomerBySysNo(uniqueKey, type, sortType, merchantSysNo, page).then(res => {
        if (res.success) {
          let temp = res.data;
          for (let i = 0; i < temp.length; i++) {
            temp[i].HeadPortraitUrl = image(temp[i].HeadPortraitUrl);
            temp[i].VisitTime = that.splitString(temp[i].VisitTime, 'T');
          }
          if (temp.length < page.pageSize) {
            more = false;
          }
          page.currentPage += 1;
          that.setData({
            listData: listData.concat(temp),
            page: page,
            more: more,
            complate: true
          }, () => {wx.hideLoading();})
        }
      })
    } else if (index == 11) {
      // console.log("获取电话")
      let phoneType = sortType
      console.log(phoneType)

      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在182引用

      remote.getUserPhone(uniqueKey, type, phoneType, merchantSysNo, page).then(res => {
        if (res.success) {
          let temp = res.data;
          // console.log(temp)
          for (let i = 0; i < temp.length; i++) {
            temp[i].HeadPortraitUrl = image(temp[i].HeadPortraitUrl);
            temp[i].VisitTime = that.splitString(temp[i].VisitTime, 'T');
          }
          if (temp.length < page.pageSize) {
            more = false;
          }
          page.currentPage += 1;
          that.setData({
            listData: listData.concat(temp),
            page: page,
            more: more,
            complate: true
          }, () => { wx.hideLoading(); })
        }
      })
    }
    else {
      // 剩余发送请求，获取参数

      // 从本地取企业编号然后在接口里传值
      let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在205引用

      remote.getRadarRecordBySysNo(uniqueKey, this.data.radarType, type, sortType, merchantSysNo, page).then(res => {
        if (res.success) {
          let temp = res.data;
          for (let i = 0; i < temp.length; i++) {
            temp[i].HeadPortraitUrl = image(temp[i].HeadPortraitUrl);
            temp[i].VisitTime = that.splitString(temp[i].VisitTime, 'T');
          }
          if (temp.length < page.pageSize) {
            more = false;
          }
          page.currentPage += 1;
          that.setData({
            listData: listData.concat(temp),
            page: page,
            more: more,
            complate: true
          }, () => { wx.hideLoading(); })
        }
      })
    }
  },
  splitString(string, char) {
    if (string && string.length > 0) {
      let temp = string.split(char);
      let st = '';
      for (let i = 0; i < temp.length; i++) {
        st += temp[i] + ' ';
      }
      return st;
    } else {
      return string;
    }
  },
  // callIt(event) {
  //   let index = event.currentTarget.dataset.index;
  //   let listData = this.data.listData;
  //   console.log(listData[index].Phone)
  //   wx.makePhoneCall({
  //     phoneNumber: listData[index].Phone,
  //     fail() {
  //     }
  //   })
  // },
  clickItem(event) {
    let index = event.currentTarget.dataset.index;
    // console.log(111)
    let listData = this.data.listData;
    let tapIndex = this.data.index;
    let item = listData[index];
    // 原代码是tapIndex!=11,表示如果它不等于11，那么久跳转到另外一个页面
    if (tapIndex != 11) {
      wx.navigateTo({
        url: `../customers/info/index?targetId=${item.UserSysNo}`,
      })
    } 
    else {
      // console.log(item)
      wx.makePhoneCall({
        phoneNumber: listData[index].Phone,
        fail() {
        }
      })
      // if (item['Description']) {
      //   let pre = item['Description'].split('>');
      //   let phone = pre[1].split('<')[0];
        
      //   wx.makePhoneCall({
      //     phoneNumber: phone,
      //   })
      // }
    }
  }
})