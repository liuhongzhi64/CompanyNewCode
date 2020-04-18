import { image } from '../../../request/index.js';
import remote from '../../../service/remote.js';
import constants from '../../../common/constants.js';
import TIM from 'tim-wx-sdk';
import { messageList, createMessage, sendText } from '../../../utils/imUtils.js';
const app = getApp();
Page({
  data: {
    cards: [],
    conversationList:[]
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    app.watch('messageList', this.feedback);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey
    }, () => {
      this._getConversationList();
    })
  },
  feedback(value) {
    this.setData({
      conversationList: value
    })
  },
  onReady: function () {
    this.initData();
  },
  onShow: function () {

  },
  onReachBottom() {
    
  },
  search(event) {
    let value = event.detail;
    this.getCollectionList(this.data.uniqueKey, value);
  },
  back(event) {
    wx.navigateBack({});
  },
  initData() {
    let uniqueKey = this.data.uniqueKey;
    this.getCollectionList(uniqueKey, "");
  },
  getCollectionList(id,name) {
    let that = this;
    remote.getCollectionList(id, name).then(res => {
      let list = res.data;
      for (let i = 0; i < list.length; i++) {
        list[i].HeadPortraitUrl = image(list[i].HeadPortraitUrl);
      }
      for (let j = 0; j < list.length; j++) {
        for (let k = j; k > 0 && k < list.length; k--) {
          if (list[k].collectionSysNo > list[k - 1].collectionSysNo) {
            let temp = list[k];
            list[k] = list[k - 1];
            list[k - 1] = temp;
          }
        }
      }
      that.setData({
        cards: list
      })
    })
  },
  detailtap(event) {
    let index = event.currentTarget.dataset.index;
    let cards = this.data.cards;
    let item = cards[index];
    let that = this;
    wx.showActionSheet({
      itemList: ['删除名片', '进入名片'],
      success: function (res) {
        let tapIndex = res.tapIndex;
        if (tapIndex == 0) {
          // 删除名片
          remote.deleteCollection(item.collectionSysNo).then(res => {
            wx.showToast({
              title: '删除成功',
              icon: 'none',
              success: function () {
                cards.splice(index, 1);
                that.setData({
                  cards: cards
                })
              }
            })
          })
        } else {
          // 进入名片
          wx.reLaunch({
            url: `../../index?targetKey=${item.UserSysNo}`,
          })
        }
      }
    })
  },
  callmeMaybe(event) {
    let phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function () {},
      fail: function() {}
    })
  },
  _getConversationList() {
    let that = this;
    messageList().then(res => {
      that.setData({
        conversationList: res.messageList
      }, () => { wx.hideLoading(); })
    })
  },
  sendMessage(event) {
    let conversationId = event.currentTarget.dataset.id;
    let sysno = event.currentTarget.dataset.no;
    let conversationList = this.data.conversationList;
    let temp = null;
    for (let i = 0; i < conversationList.length; i++) {
      if (conversationList[i].userProfile.userID == sysno.toString()) {
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
      let that = this;
      sendText(createMessage({
        to: sysno.toString(),
        conversationType: TIM.TYPES.CONV_C2C,
        payload: {
          text: '您好！'
        }
      })).then(res => {
        if (that.targetId == sysno) {
          wx.showToast({
            title: '用户不存在',
            icon: 'none'
          })
          return;
        }
        if (res.success) {
          that.targetId = sysno;
          that.sendMessage(event); // 回调
          
        }
      })
    }
  }
})