import remote from '../../../service/remote.js';
import { image } from '../../../request/index.js';
import constants from '../../../common/constants.js';
import { messageList, createMessage, sendText } from '../../../utils/imUtils.js';
import { getSystem } from '../../../utils/util.js';
import TIM from 'tim-wx-sdk';
const app = getApp();
Page({
  data: {
    screenHeight: 0,
    uniqueKey: -1,
    labels: [],
    intentionLabel: {},
    conversationList: [],
    listData: [],
    page: {
      currentPage: 1,
      pageSize: 12,
      sort: 'desc'
    },
    more: true,
    defaultStartTime: null,
    defaultEndTime: null,
    type: 0,
    level: 0,
    chooseItems: ['有意向', '无意向', '已成交', '未分类', '全部'],
    complate: false
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    app.watch('messageList',this.feedback);
    let screenHeight = getSystem.getScreenHeightRpx();
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      screenHeight: screenHeight,
      uniqueKey: uniqueKey
    })
  },
  onReady: function () {
    let that = this;
    setTimeout(() => {
      that._getConversationList();
    },3000)
  },
  onShow: function () {
    let page = this.data.page;
    page.currentPage = 1;
    this.setData({
      date: null,
      listData: [],
      more: true,
      defaultStartTime: null,
      level: 0,
      page: page
    },() => {
      this.getList(null, null, this.data.level, this.data.page);
    })
  },
  loadmore() {
    let that = this;
    if (this.data.more) {
      let page = this.data.page;
      page.currentPage += 1;
      this.setData({
        page: page,
        loadingmore: true
      }, () => {
        this.getList(this.data.date, this.data.defaultEndTime, this.data.level, page);
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
  feedback(value) {
    this.setData({
      conversationList: value
    })
  },
  back(event) {
    wx.navigateBack({});
  },
  bindDateChange(event) {
    let date = event.detail.value;
    let page = this.data.page;
    page.currentPage = 1;
    this.setData({
      date: date,
      listData: [],
      more: true,
      defaultStartTime: date,
      level: 0,
      page: page
    }, () => {
      this.getList(date, this.data.defaultEndTime, this.data.level, this.data.page);
    })
  },
  chooseByLevel() {
    let that = this;
    let chooseItems = this.data.chooseItems;
    wx.showActionSheet({
      itemList: chooseItems,
      success: function(res) {
        let tapIndex = res.tapIndex;
        let page = that.data.page;
        page.currentPage = 1;
        that.setData({
          date: null,
          listData: [],
          more: true,
          defaultStartTime: null,
          level: tapIndex == chooseItems.length - 1 ? 0 : chooseItems[tapIndex],
          page: page
        }, () => {
          that.getList(that.data.defaultStartTime, that.data.defaultEndTime, that.data.level, that.data.page);
        })
      }
    })
  },
  getList(startTime, endTime, level, page) {
    let more = this.data.more;
    if (!more) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return false;
    }
    let uniqueKey = this.data.uniqueKey;
    let listData = this.data.listData;
    let that = this;
    // 第一个魔法值是source 具体的指向我也忘记了
    // 第二个魔法值是type 0是全部，1最后访问时间 2最后跟时间 3自定义时间

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在144引用

    remote.getCustomerList(uniqueKey, 0, startTime, endTime, this.data.type, level, merchantSysNo, page).then(res => {
      let list = res.data;
      let promise = Promise.all(list.map((item, index) => {
        return new Promise((resolve, reject) => {
          item.HeadPortraitUrl = image(item.HeadPortraitUrl);

          // 从本地取企业编号然后在接口里传值
          let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

          remote.getIntentionLevel(item.CustomerSysNo, uniqueKey, merchantSysNo).then(res => {
            if (res.success) {
              item['levelLabel'] = res.data[0];
            }
            resolve(item)
          })
        })
      }));
      promise.then(res => {
        if (res.length < page.pageSize) {
          more = false;
        }
        that.setData({
          listData: listData.concat(res),
          more: more,
          complate: true
        }, () => { wx.hideLoading(); })
      })
    })
  },
  navigateToDetail(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let targetId = listData[index].CustomerSysNo;
    let item = JSON.stringify(listData[index]);
    wx.navigateTo({
      url: `./info/index?item=${item}&targetId=${targetId}`,
    })
  },
  navigateToRecords(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let sysno = listData[index].CustomerSysNo;
    wx.navigateTo({
      url: `./record/index?targetId=${sysno}`,
    })
  },
  navigateToTags(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let item = JSON.stringify(listData[index]);
    wx.navigateTo({
      url: `./tags/index?item=${item}`,
    })
  },
  call(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let item = listData[index];
    if (item.Phone) {
      wx.makePhoneCall({
        phoneNumber: item.Phone,
      })
    } else {
      wx.showToast({
        title: '暂无电话',
        icon: 'none'
      })
    }
  },
  sendMessage(event) {
    let that = this;
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let item = listData[index];
    let conversationList = this.data.conversationList;
    let temp = null;
    for (let i = 0; i < conversationList.length; i++) {
      if (conversationList[i].userProfile.userID == item.CustomerSysNo.toString()) {
        temp = JSON.stringify(conversationList[i]);
        break;
      }
    }
    if (temp) { // 如果在会话中
      wx.navigateTo({
        url: `../messages/board/index?conversation=${temp}`,
      })
    } else { // 没有在会话中的时候，发送消息来获取会话
      let uniqueKey = this.data.uniqueKey;
      sendText(createMessage({
        to: item.CustomerSysNo.toString(),
        conversationType: TIM.TYPES.CONV_C2C,
        payload: {
          text: '您好！'
        }
      })).then(res => {
        wx.showLoading({
          title: '加载中',
        })
        setTimeout(() => {
          wx.hideLoading();
          that.sendMessage(event); // 回调
        }, 1000)
      })
    }
    
  },
  _getConversationList() {
    let that = this;
    messageList().then(res => {
      that.setData({
        conversationList: res.messageList
      })
    })
  }
})