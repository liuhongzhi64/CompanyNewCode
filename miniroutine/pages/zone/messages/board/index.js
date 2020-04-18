import constants from '../../../../common/constants.js';
import { messages, createMessage, sendText, setMessageRead, createImageMessage, createAudioMessage } from '../../../../utils/imUtils.js';
import { parseTime, getSystem, today } from '../../../../utils/util.js';
import { image } from '../../../../request/index.js';
import remote from '../../../../service/remote.js';
import TIM from 'tim-wx-sdk';
import { login } from '../../../../common/version.js';
const app = getApp();
const recorderManager = wx.getRecorderManager();
const audioContext = wx.createInnerAudioContext();
// 录音部分参数
const recordOptions = {
  duration: 60000, // 录音的时长，单位 ms，最大值 600000（10 分钟）
  sampleRate: 44100, // 采样率
  numberOfChannels: 1, // 录音通道数
  encodeBitRate: 192000, // 编码码率
  format: 'aac' // 音频格式，选择此格式创建的音频消息，可以在即时通信 IM 全平台（Android、iOS、微信小程序和 Web）互通
};
Page({
  data: {
    uniqueKey: -1,
    conversation: {},
    userInfo: {},
    messageList: [],
    text: '',
    hadMore: true,
    InputBottom: 0,
    longPress: false,
    msgType: false,
    normals: [
      '您好', '我们公司诚信为本，请您绝对放心！', '我们的产品质量绝对不错！', '您的建议很中肯。', '谢谢您！', '您能选择我们的产品，您的眼光真好！', '货到付款', '诚信为本', '您可以定个时间我们见面聊', '价格实惠，质量过硬。','请问您的地址是？', '很高心能认识您。'
    ],
    currentIndex: 0
  },
  onLoad: function (options) {
    app.watch('newMessages', this.feedback);
    let conversation = JSON.parse(options.conversation);
    this.getHeight();
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let userInfo = wx.getStorageSync(constants.USERINFO);
    this.setData({
      conversation: conversation,
      uniqueKey: uniqueKey,
      userInfo: userInfo
    }, () => {
      // this.hadRead();
      this.getMessages();
      this.getCardInfo();
    })
  },
  onReady: function () {
    this._getRelationship();
    let that = this;
    audioContext.onPlay(() => {
      that.setData({
        sounding: true
      })
    });
    audioContext.onPause(() => {
      that.setData({
        sounding: false,
        currentIndex: 0
      })
    });
    audioContext.onStop(() => {
      that.setData({
        sounding: false,
        currentIndex: 0
      })
    });
    recorderManager.onError(function (errMsg) {
      console.warn('recorder error:', errMsg);
    });
    recorderManager.onStop(function (res) {
      let messageList = that.data.messageList;
      let userInfo = that.data.userInfo;
      let conversation = that.data.conversation;
      console.log('recorder stop', res);
      const message = createAudioMessage({
        to: conversation.userProfile.userID,
        conversationType: TIM.TYPES.CONV_C2C,
        payload: {
          file: res
        }
      });
      let promise = sendText(message);
      promise.then(function (imResponse) {
        let msg = imResponse.data.message;
        if (!(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(msg.time))) {
          msg.time = parseTime(msg.time);
        }
        msg['avatar'] = userInfo.HeadPortraitUrl;
        messageList.push(msg);
        that.setData({
          messageList: messageList,
          scrollBottom: messageList.length - 1
        })
        // 发送成功
        console.log(imResponse);
      }).catch(function (imError) {
        // 发送失败
        console.warn('sendMessage error:', imError);
      });
    });
  },
  loadmore() {
    let that = this;
    if (this.data.hadMore) {
      this.setData({
        loadingmore: true
      }, () => {
        this.getMessages();
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
  back(event) {
    wx.navigateBack({});
  },
  feedback(messages) {
    if (messages && messages.length == 0) {
      return;
    }
    let conversation = this.data.conversation;
    let messageList = this.data.messageList;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].conversationID == conversation.conversationID) {
        if (!(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(messages[i].time))) {
          messages[i].time = parseTime(messages[i].time);
        }
        messages[i]['avatar'] = conversation.userProfile.avatar;
        messageList.push(messages[i]);
      }
    }
    this.setData({
      messageList: messageList,
      scrollBottom: messageList.length - 1
    })
  },
  hadRead() {
    let conversation = this.data.conversation;
    if (conversation.unreadCount > 0) {
      setMessageRead(conversation.conversationID).then(res => {
        app.globalData.unreadcount = app.globalData.unreadcount - conversation.unreadCount;
      }).catch(err => {
      });
    }
  },
  getHeight() {
    let res = wx.getSystemInfoSync();
    let windowHeight = (res.windowHeight * (750 / res.windowWidth));
    this.setData({
      scrollDefault: windowHeight - 350,
      scrollHeight: windowHeight - 350
    })
  },
  getMessages() {
    let hadMore = this.data.hadMore;
    if (!hadMore) {
      wx.showToast({
        title: '到顶了',
        icon: 'none'
      })
      return;
    }
    let that = this;
    let next = this.data.next;
    let conversation = this.data.conversation;
    let userInfo = this.data.userInfo;
    messages({
      conversationID: conversation.conversationID,
      nextReqMessageID: next,
      count: 15
    }).then(res => {
      let oldList = that.data.messageList;
      let response = res.data;
      let isComplated = response.isCompleted;
      let list = response.messageList;
      if (list.length < 15) {
        hadMore = false
      }
      let nextReqMessageID = response.nextReqMessageID;
      for (let i = 0; i < list.length;  i++) {
        if (!(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(list[i].time))) {
          list[i].time = parseTime(list[i].time);
        }
        if (list[i].flow == 'in') {
          list[i]['avatar'] = image(conversation.userProfile.avatar);
        } else {
          list[i]['avatar'] = image(userInfo.HeadPortraitUrl);
        }
      }
      list = list.concat(oldList);
      that.setData({
        messageList: list,
        next: nextReqMessageID,
        isComplated: isComplated,
        hadMore: hadMore,
        scrollBottom: next ? 0 : list.length - 1
      })
    })
  },
  inputText(event) {
    let text = event.detail.value;
    this.setData({
      inputText: text
    })
  },
  send(event) {
    let text = this.data.inputText;
    let conversation = this.data.conversation;
    let message = createMessage({
      to: conversation.userProfile.userID,
      conversationType: TIM.TYPES.CONV_C2C,
      payload: {
        text: text
      }
    });
    let messageList = this.data.messageList;
    let userInfo = this.data.userInfo;
    let that = this;
    sendText(message).then(res => {
      console.log(res)
      let msg = res.data.message;
      if (!(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(msg.time))) {
        msg.time = parseTime(msg.time);
      }
      msg['avatar'] = userInfo.HeadPortraitUrl;
      messageList.push(msg);
      that.setData({
        messageList: messageList,
        scrollBottom: messageList.length - 1,
        inputText: ''
      })
    })
  },
  pullRefresh(event) {
    this.setData({
      scrollBottom: 0
    })
    this.getMessages();
  },
  showDetail(event) {
    let alreadyBeCustomer = this.data.alreadyBeCustomer;
    let title = [];
    if (alreadyBeCustomer) {
      title[0] = "删除客户";
    } else {
      title[0] = "转为客户";
    }
    let that = this;
    wx.showActionSheet({
      itemList: title,
      success: function(res) {
        if (res.tapIndex == 0) {
          if (alreadyBeCustomer) {
            remote.deleteCustomer(alreadyBeCustomer).then(res =>  {
              wx.showToast({
                title: '删除客户',
                icon: 'none',
                success: function() {
                  that.setData({
                    alreadyBeCustomer: null
                  })
                }
              })
            })
          } else {
            remote.addCusteomer({
              CustomerSysNo: parseInt(that.data.conversation.userProfile.userID),
              InUserSysNo: that.data.uniqueKey,
              IntentionLevel: 22,
              Remarks: "",
              Source: 1
            }).then(res => {
              wx.showToast({
                title: '添加成功',
                icon: 'none',
                success: function () {
                  that.setData({
                    alreadyBeCustomer: res.data
                  })
                }
              })
            })
          }
        }
      }
    })
  },
  InputFocus(event) {
    let boardHeight = event.detail.height;
    let boardRpx = getSystem.getRpx(boardHeight);
    this.setData({
      InputBottom: boardHeight,
      scrollHeight: this.data.scrollHeight - boardRpx + 100,
      underBox: boardHeight
    })
  },
  InputBlur() {
    this.setData({
      InputBottom: 0,
      scrollHeight: this.data.scrollDefault
    })
  },
  _getRelationship() {
    let that = this;
    remote.getUserExsitCustomer(parseInt(this.data.conversation.userProfile.userID), this.data.uniqueKey).then(res => {
      that.setData({
        alreadyBeCustomer: res.data
      })
    })
  },
  longPress(event) {
    recorderManager.start(recordOptions);
    this.setData({
      longPress: true
    })
  },
  touchend(event) {
    recorderManager.stop();
    this.setData({
      longPress: false
    })
  },
  setMsgType(event) {
    this.setData({
      msgType: !this.data.msgType,
      InputBottom: 0
    })
  },
  pickNormalText(event) {
    let value = event.detail.value;
    let normals = this.data.normals;
    this.setData({
      inputText: normals[parseInt(value)]
    })
  },
  chooseImage() {
    let messageList = this.data.messageList;
    let userInfo = this.data.userInfo;
    let conversation = this.data.conversation;
    let that = this;
    wx.chooseImage({
      count: 1,
      success: function(res) {
        let imageMessage = createImageMessage({
          to: conversation.userProfile.userID,
          conversationType: TIM.TYPES.CONV_C2C,
          payload: {
            file: res
          },
          onProgress: function(event) {
            console.log(event)
          }
        })
        sendText(imageMessage).then(res => {
          let msg = res.data.message;
          if (!(/[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi.exec(msg.time))) {
            msg.time = parseTime(msg.time);
          }
          msg['avatar'] = userInfo.HeadPortraitUrl;
          messageList.push(msg);
          that.setData({
            messageList: messageList,
            scrollBottom: messageList.length - 1
          })
        })
      },
    })
  },
  preview(event) {
    let temp = [];
    let image = event.currentTarget.dataset.image;
    temp[0] = image;
    wx.previewImage({
      urls: temp,
      current: image
    })
  },
  playSound(event) {
    let sound = event.currentTarget.dataset.sound;
    let index = event.currentTarget.dataset.index;
    let cur = this.data.currentIndex;
    let that = this;
    let sounding = this.data.sounding;
    if (sounding) {
      audioContext.stop();
      let setTime = setTimeout(() => {
        if (cur != index) {
          audioContext.src = sound;
          this.setData({
            currentIndex: index
          }, () => {
            audioContext.play();
          })
        }
      }, 200)
    } else {
      audioContext.src = sound;
      this.setData({
        currentIndex: index
      }, () => {
        audioContext.play();
      })
    }
  },
  onHide() {
    audioContext.stop();
  },
  getCardInfo() {
    let that = this;
    remote.getCardInfo(this.data.conversation.userProfile.userID).then(res => {
      that.setData({
        targetUserInfo: res.data
      })
    })
  },
  redirectToIndex() {
    wx.reLaunch({
      url: `../../../index?targetKey=${this.data.conversation.userProfile.userID}`,
    })
  },
  call() {
    let targetUserInfo = this.data.targetUserInfo;
    let myInfo = this.data.userInfo;
    let that = this;
    if (targetUserInfo.Telephone) {
      wx.makePhoneCall({
        phoneNumber: targetUserInfo.Telephone,
        success: function() {
          let desc = "";
          if (myInfo.Telephone) {
            desc = `${myInfo.Name || myInfo.WX}拨打了你的电话，他的电话是--->${ myInfo.Telephone }<,快回拨过去，促成交易!`;
          } else {
            desc = `${myInfo.Name || myInfo.WX}拨打了你的电话,注意接听。`;
          }
          that.addRecord(today(), 8, desc, myInfo.Telephone ? 1 : 0);
        }
      })
    } else {
      wx.showToast({
        title: '对方电话保密了',
        icon: 'none'
      })
    }
  },
  copyWechat() {
    let targetUserInfo = this.data.targetUserInfo;
    let myInfo = this.data.userInfo;
    let that = this;
    wx.setClipboardData({
      data: targetUserInfo.WX,
      success: function() {
        wx.showToast({
          title: '微信已复制'
        })
        let desc = `${myInfo.Name || myInfo.WX}复制了您的微信号码。`
        that.addRecord(today(), 11, desc, 0);
      }
    })
  },
  addRecord(time, type, desc, phone) {
    let targetUserInfo = this.data.targetUserInfo;
    remote.insertRecords({
      CustomerSubject: parseInt(this.data.conversation.userProfile.userID),
      VisitTime: time,
      NumberOfVisits: 1,
      VisitType: type,
      ResidenceTime: 0,
      InUserSysNo: this.data.uniqueKey,
      Description: desc,
      TimeSysNo: 0,
      Phone: phone
    });
  },
  saveToConcact(res) {
    let sessionData = res
    let that = this
    let userInfo = that.data.userInfo;
    let targetUserInfo = that.data.targetUserInfo;
    if (res.detail.errMsg.split(':')[1] == 'ok') {
      that.checkSession(sessionData).then(res => {
        remote.getPhone(res.encryptedData, res.iV, that.data.uniqueKey).then(res => {
          wx.addPhoneContact({
            firstName: targetUserInfo.Name,
            mobilePhoneNumber: targetUserInfo.Telephone
          })
          let desc = desc = `${userInfo.Name || userInfo.WX}保存了您的号码，他的电话是--->${JSON.parse(res.data).purePhoneNumber}<,快回拨过去，促成交易!`;
          that.addRecord(today(), 9, desc, 1);
        })
      })
    }
  },
  // 检查session
  checkSession(data) {
    let that = this
    let promise = new Promise((resolve, reject) => {
      wx.checkSession({
        success: function () {
          resolve({
            encryptedData: data.detail.encryptedData,
            iV: data.detail.iv
          })
        },
        fail: function () {
          let userInfo = that.data.myInfo
          login(userInfo).then(res => {
            remote.login(res).then(res => {
              resolve(res.data)
            })
          })
        }
      })
    })
    return promise;
  },
})