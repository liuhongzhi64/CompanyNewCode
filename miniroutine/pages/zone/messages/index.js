import constants from '../../../common/constants.js';
import {
  messageList,
  addblockList,
  removeConversation,
  setMessageRead
} from '../../../utils/imUtils.js';
import {
  parseTime
} from '../../../utils/util.js';
import remote from '../../../service/remote.js';
const app = getApp();

Page({
  data: {
    modalName: null,
    listTouchStart: 0,
    listTouchDirection: null,
    messageList: []
  },
  onLoad: function(options) {
    app.watch('messageList', this.feedback);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
    let that = this;
    let list = []
    messageList().then(res => {
      that.setData({
        messageList: res.messageList
      })
      list = this.data.messageList
      for (let i = 0; i < this.data.messageList.length; i++) {
        remote.getUserInformation(list[i].userProfile.userID, merchantSysNo).then(res => {
          let headUrl = res.data.HeadPortraitUrl
          let name = res.data.Name
          // console.log(res.data)    
          list[i].userProfile.avatar = headUrl
          list[i].userProfile.nick = name
          let url = list[i].userProfile.avatar
          // console.log(url)
          let imgUrl = url.substr(0, 1)
          if (imgUrl == '/') {
            // console.log(url)
            imgUrl = 'https://www.xintui.xin:8058' + url
            // console.log(imgUrl)
            url = imgUrl
            list[i].userProfile.avatar = imgUrl
          
          }
        })  
        let url = list[i].userProfile.avatar
        let imgUrl = url.substr(0, 1)
        if (imgUrl == '/') {
          imgUrl = 'https://www.xintui.xin:8058' + url
          url = imgUrl
          list[i].userProfile.avatar = url
        } 
      }
      that.setData({
        messageList: list
      })
      
    })

    this.setData({
      uniqueKey: uniqueKey
    })
  },
  onShow:function(){
    if (this.data.messageList.length ==0 ){
      let msgSet = setTimeout((callback) => {
        this.setData({
          messageList: this.data.messageList
        })
      }, 1000, () => {
        clearTimeout(msgSet);
      })
    }

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
      app.globalData.unreadcount = app.globalData.unreadcount - item.unreadCount; //这是以前的代码
      setMessageRead(item.conversationID).then(res => {})
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