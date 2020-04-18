import constants from '../../../common/constants.js';
import { messageList, addblockList, removeConversation, setMessageRead } from '../../../utils/imUtils.js';
import { parseTime } from '../../../utils/util.js';
const app = getApp();

Page({
  data: {
    modalName: null,
    listTouchStart: 0,
    listTouchDirection: null,
    messageList: []
  },
  onLoad: function (options) {
    app.watch('messageList', this.feedback);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let that = this;
    messageList().then(res => {
      that.setData({
        messageList: res.messageList
      })
    })
    this.setData({
      uniqueKey: uniqueKey
    })
  },
  feedback(list) {
    for (let i = 0; i < list.length; i++) {
      if (!(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(list[i].lastMessage.laastTime))) {
        list[i].lastMessage.laastTime = parseTime(list[i].lastMessage.laastTime);
      }
    }
    this.setData({
      messageList: list
    })
  },
  back(event) {
    wx.navigateBack({});
  },
  ListTouchStart(e) {
    this.setData({
      listTouchStartX: e.touches[0].pageX,
      listTouchStartY: e.touches[0].pageY
    })
  },
  // ListTouch计算方向，
  ListTouchMove(e) {
    this.setData({
      listTouchDirection: e.touches[0].pageX - this.data.listTouchStartX > 0 ? 'right' : 'left'
    })
  },
  // ListTouch计算滚动
  ListTouchEnd(e) {
    let startX = this.data.listTouchStartX;
    let startY = this.data.listTouchStartY;
    let pageX = e.changedTouches[0].pageX;
    let pageY = e.changedTouches[0].pageY;
    if ((startX - pageX) < 100) {
      this.setData({
        modalName: null
      })
    } else {
      if (this.data.listTouchDirection == 'left') {
        this.setData({
          modalName: e.currentTarget.dataset.target
        })
      }
    }
    this.setData({
      listTouchDirection: null
    })
  },
  // 跳转到聊天界面
  navigateToBoard(event) {
    let that = this;
    let target = event.currentTarget.dataset.target;
    let messageList = this.data.messageList;
    let item = messageList[target];
    if (item.unreadCount > 0) {
      app.globalData.unreadcount = app.globalData.unreadcount - item.unreadCount;
      setMessageRead(item.conversationID).then(res => {
      })
    }
    wx.navigateTo({
      url: `./board/index?conversation=${JSON.stringify(item)}`,
      success: function() {
        item.unreadCount = 0;
        messageList[target] = item;
        that.setData({
          messageList: messageList
        })
      }
    })
  },
  // 加入黑名单
  addBlock(event) {
    let index = event.currentTarget.dataset.index;
    let messageList = this.data.messageList;
    let item = messageList[index];
    addblockList([item.userProfile.userID]);
    this.deleteConversation(event);
  },
  // 删除会话
  deleteConversation(event) {
    let index = event.currentTarget.dataset.index;
    let messageList = this.data.messageList;
    let item = messageList[index];
    app.globalData.unreadCount = app.globalData.unreadCount - item.unreadCount;
    removeConversation(item.conversationID);
  }
})