import { userSetting, login, session, version } from '../common/version.js';
import constants from '../common/constants.js';
import remote from '../service/remote.js';
import { image } from '../request/index.js';
import product from '../service/product.js';
import { imLogin, imLoginOut, messageList, createMessage, sendText } from '../utils/imUtils.js';
import { today, lessDate } from '../utils/util.js';
import TIM from 'tim-wx-sdk';
const app = getApp();

Page({
  data: {
    userInfo: {},
    myInfo: {},
    uniqueKey: -1,
    avatar: constants.defaultLogo,
    title: '',
    homeLoading: false,
    navTitle: '创建名片',
    targetUserId: 295,
    groups: [
      { text: '分享到微信', value: 1, openType: 'share' },
      { text: '名片海报', value: 3 },
      {text: '现场扫码', value: 4}
    ],
    unreadcount: 0,
    versionNum: constants.VERSION
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    app.watch('unreadcount',this.feedback);
    app.watch('messageList', this.messageBack);
    let width = wx.getSystemInfoSync().screenWidth;
    // 浏览他人名片
    let targetUserId = options.targetKey
    console.log(targetUserId)
    if (targetUserId) {
      this.setData({
        targetUserId: targetUserId
      })
    }
    let myInfo = wx.getStorageSync(constants.USERINFO);
    // wx.setStorageSync(constants.UNIQUE_KEY, 307);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    app.globalData.userInfo = myInfo || {};
    app.globalData.uniqueKey = uniqueKey || -1;
    if (uniqueKey && !app.globalData.hadLogin) {
      imLogin(uniqueKey);
    }
    this.setData({
      myInfo: myInfo,
      avatar: myInfo.HeadPortraitUrl || constants.defaultLogo,
      title: myInfo.Name,
      uniqueKey: uniqueKey || -1,
      navTitle: myInfo ? '' : '创建名片',
      screenWidth: width
    })
  },
  onReady: function () {
    this.initPage();
  },
  onShow: function () {
    let unreadcount = app.globalData.unreadcount;
    this.feedback(unreadcount);
    let wxUserInfo = wx.getStorageSync(constants.WX_USER_INFO);
    if (wxUserInfo) {
      this.setData({
        avatar: image(wxUserInfo.HeadPortraitUrl)
      })
    }
  },
  onHide: function () {
    this.setData({
      homeLoading: false
    })
  },
  onPullDownRefresh() {
    this.initPage();
    let timeSet = setTimeout( (callback) => {
      wx.stopPullDownRefresh();
    }, 1000, () => {
      clearTimeout(timeSet);
    } )
  },
  feedback(value) {
    this.setData({
      unreadcount: value
    })
  },
  messageBack(value) {
    this.setData({
      conversationList: value
    })
  },
  loading() {
    let loading = this.data.homeLoading;
    this.setData({
      homeLoading: !loading
    })
  },
  addRecords(time, type, desc, phone) {
    if (this.data.uniqueKey == this.data.targetUserId) {
      return;
    }
    remote.insertRecords({
      CustomerSubject: this.data.targetUserId,
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
  createCard(uniqueKey, avatar, name) {
    return remote.createBusinessCard({
      HeadPortrait: avatar,
      BusinessCardName: name,
      Telephone: '',
      SysNo: uniqueKey,
      CompanyName: ''
    });
  },
  remotegetInfo(uniqueKey) {
    let that = this;
    remote.getCardInfo(uniqueKey).then(res => {
      app.globalData.userInfo = res.data;
      res.data.HeadPortraitUrl = image(res.data.HeadPortraitUrl)
      that.setData({
        myInfo: res.data,
        title: res.data.Name,
        avatar: res.data.HeadPortraitUrl,
        navTitle: '我的名片',
        uniqueKey: uniqueKey
      }, () => {
        wx.setStorageSync(constants.USERINFO, that.data.myInfo);
        console.log("登录IM")
        // 登录im
        // 一定要先保存用户信息到缓存，然后再登录，因为im登录中要更新用户信息，
        // 没办法，后面啥都没有做，只能出此下策，后期思考更好的解决方式；
        imLogin(uniqueKey);
        that.appreciateDetails(); // 重新获取点赞详情
        that.doCollectionDetails(); // 重新获取收藏
        that.checkSamePlace(); // 检查是否是同乡/校友
        that.getLabels(); // 重新获取标签
        that.getComments(); //重新获取评论,
        that.getWxUserInfo(that.data.uniqueKey);
        that.loading();
        wx.hideLoading();
        that.setData({
          translentAnimation: false
        })
      })
    })
  },
  // 获取用户权限
  // 在需要授权位置，授权完成后，没有名片的用户会被跳转去创建名片
  getUserInfo(res) {
    wx.showLoading({
      title: '加载中',
    })
    let userInfoWechat = res;
    let that = this;
    if (this.data.uniqueKey == -1) {
      let that = this
      this.loading();
      this.setData({
        translentAnimation: true
      });
      let promise = new Promise((resolve, reject) => {
        // 用户授权
        userSetting('scope.userInfo', true).then(res => {
          // 微信登录
          login(res.userInfo).then(res => {
            console.log("微信登录", res)
            let avatar = res.HeadPortraitUrl,
                  name = res.WX;
            // 后台登录
            remote.login(res).then(res => {
              console.log("后台登录", res)
              wx.setStorageSync(constants.UNIQUE_KEY, res.data);
              let uniqueKey = res.data
              let app = getApp();
              app.globalData.uniqueKey = uniqueKey;
              // 验证用户是否有名片
              remote.checkCard(res.data).then(res => {
                if (res.success) {
                  that.remotegetInfo(uniqueKey);
                } else {
                  wx.navigateTo({
                    url: `./zone/edit/profile/index?noCard=true&avatar=${avatar}&name=${name}`,
                  })
                  // that.createCard(uniqueKey, avatar, name).then(res => {
                  //   if (res.success) {
                  //     that.remotegetInfo(uniqueKey);
                  //   }
                  // });
                }
              })
            })
          })
        }).catch(err => {
          this.loading();
        })
      })
      return promise;
    }
    wx.hideLoading();
    return -1;
  },
  navgateToZone(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let uniqueKey = this.data.uniqueKey;
      let targetUserId = this.data.targetUserId;
      if (uniqueKey != targetUserId) {
        this.setData({
          targetUserId: uniqueKey
        }, () => {
          if (!this.data.myInfo) {
            remote.getOriginWxInfo(this.data.uniqueKey).then(res => {
              wx.navigateTo({
                url: `./zone/edit/profile/index?noCard=true&avatar=${res.data.HeadPortraitUrl}&name=${res.data.WX}`,
              })
            })
          } else {
            this.initPage();
          }
        })
      } else {
        wx.navigateTo({
          url: './zone/index',
        })
      }
    }
  },
  // 浏览历史名片
  scanCards(res) {
    let result = this.getUserInfo(res)
    if (result == -1) {
      let that = this;
      this.setData({
        showHistoryModal: true
      }, () => {
        that.getSelfHistory();
      })
    }
  },
  // 分享名片
  shareCard(res) {
    let result = this.getUserInfo(res)
    if (result == -1) {
      this.setData({
        showAction: true
      })
    }
  },
  // 保存电话到通讯录
  savePhone(res) {
    this.loading()
    let sessionData = res
    let that = this
    let userInfo = that.data.userInfo
    if (res.detail.errMsg.split(':')[1] == 'ok') {
      that.checkSession(sessionData).then(res => {
        remote.getPhone(res.encryptedData, res.iV, that.data.uniqueKey).then(res => {
          wx.addPhoneContact({
            firstName: userInfo.Name,
            mobilePhoneNumber: userInfo.Telephone,
            organization: userInfo.CompanyName || "",
            title: userInfo.PositionName,
            workAddressState: userInfo.ProvinceName,
            workAddressCity: userInfo.CityName,
            workAddressStreet: userInfo.DistrictName,
            email: userInfo.Email
          })
          let desc = `${that.data.myInfo.Name || that.data.myInfo.WX}保存了您的号码，他的电话是--->${JSON.parse(res.data).purePhoneNumber}<,快回拨过去，促成交易!`;
          that.addRecords(today(), 9, desc, 1);
          that.loading()
        })
      })
    } else {
      this.loading();
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
          let userInfo = that.data.userInfo
          login(userInfo).then(res => {
            remote.login(res).then(res => {
              resolve({
                encryptedData: data.detail.encryptedData,
                iV: data.detail.iv
              })
            })
          })
        }
      })
    })
    return promise;
  },
  // 打电话
  callme(res) {
    let result = this.getUserInfo(res);
    let that = this;
    if (result == -1) {
      wx.makePhoneCall({
        phoneNumber: res.currentTarget.dataset.phone,
        success: function () {
          let myPhone = that.data.myInfo.Telephone;
          let desc = '';
          if (myPhone) {
            desc = `${that.data.myInfo.Name || that.data.myInfo.WX}拨打了你的电话，他的电话是--->${myPhone}<,快回拨过去，促成交易!`;
          } else {
            desc = `${that.data.myInfo.Name || that.data.myInfo.WX}拨打了你的电话，注意保存TA的号码。`
          }
          that.addRecords(today(), 8, desc, myPhone ? 1 : 0);
        }
      })
    }
  },
  // 加微信
  beMyWechatFriend(res) {
    let result = this.getUserInfo(res);
    let that = this;
    if (result == -1) {
      wx.setClipboardData({
        data: res.currentTarget.dataset.weichat,
        success: function () {
          wx.showToast({
            title: '已复制',
            icon: 'none',
            success: function() {
              let desc = `${that.data.myInfo.Name || that.data.myInfo.WX}已经复制了您的微信号码,请注意通过TA的好友请求哟！`;
              that.addRecords(today(), 11, desc, 0);
            }
          })
        }
      })
    }
  },
  // 定位
  useAddress(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let userInfo = this.data.userInfo;
      if (userInfo.Latitude && userInfo.Longitude) {
        wx.openLocation({
          latitude: parseFloat(userInfo.Latitude),
          longitude: parseFloat(userInfo.Longitude),
          address: userInfo.Address
        })
      } else {
        wx.showToast({
          title: '未定位',
          icon: 'none'
        })
      }
    }
  },
  // 跳转到名片转盘
  navigateToShare() {
    let userInfo = this.data.userInfo;
    let params = {
      avatar: userInfo.HeadPortraitUrl,
      name: userInfo.Name,
      position: userInfo.PositionName,
      company: userInfo.CompanyName,
      uniqueKey: this.data.targetUserId
    }
    params = JSON.stringify(params)
    wx.navigateTo({
      url: `./share/share?details=${ params }`,
    })
  },
  // 给名片点赞
  appreciateIt(res) {
    let result = this.getUserInfo(res);
    let that = this;
    if (result == -1) {
      let doAppreciate = this.data.doAppreciate;
      if (!doAppreciate) {
        that.loading();
        remote.doAppreciateCard(this.data.targetUserId, this.data.uniqueKey, 0).then(res => {
          if (res.success) {
            let userInfo = that.data.userInfo;
            userInfo.PointRatio = userInfo.PointRatio + 1;
            that.loading();
            that.setData({
              doAppreciate: true, // true 不能点赞 false 可以点赞
              userInfo: userInfo
            }, () => {
              let desc = `${that.data.myInfo.Name || that.data.myInfo.WX}给您的名片点了赞，快去瞧瞧吧！`;
              that.addRecords(today(), 14, desc, 0);
            })
          }
        })
      } else {
        wx.showToast({
          title: '已点赞',
          icon: 'none'
        })
      }
    }
    // 动画
  },
  // 收藏
  collectionIt(res) {
    let result = this.getUserInfo(res);
    let that = this;
    if (result == -1) {
      if (this.data.uniqueKey != this.data.targetUserId && !this.data.doCollecte) {
        let userInfo = this.data.userInfo;
        remote.doCollecteCard({
          UserSysNo: this.data.targetUserId,
          InUserSysNo: this.data.uniqueKey,
          BusinessCardSysNo: userInfo.SysNo
        }).then( res => {
          if (res.success) {
            that.setData({
              doCollecte: true,
              collectionId: res.data
            }, () => {
              let desc = `${that.data.myInfo.Name || that.data.myInfo.WX}已经收藏了您的名片,哇，一单大的生意快要上门啦！`;
              that.addRecords(today(), 12, desc, 0);
            })
          } else {
            wx.showToast({
              title: '已收藏',
              icon: 'none'
            })
            that.setData({
              doCollecte: true
            })
          }
        })
      } else {
        wx.showToast({
          title: '已收藏',
          icon: 'none'
        })
        that.setData({
          doCollecte: true
        })
      }
    }
  }, 
  // 查看是否收藏
  doCollectionDetails() {
    let that = this;
    remote.doCollectionStatus(this.data.targetUserId, this.data.uniqueKey, this.data.userInfo.SysNo).then(res => {
      that.setData({
        doCollecte: res.success,
        collectionId: res.data
      })
    })
  },
  // 获取历史记录
  getHistoryItems() {
    let that = this;
    that.loading();
    remote.historyItems(that.data.targetUserId, {
      currentPage: 1,
      pageSize: 5,
      sort: "desc"
    }).then(res => {
      let result = res.data;
      for (let i = 0; i < result.length; i++) {
        result[i].HeadPortraitUrl = image(result[i].HeadPortraitUrl);
      }
      that.loading();
      that.setData({
        historyItems: result,
        historyItemsCount: res.sumCount
      })
    })
  },
  navigateToHistory() {
    wx.navigateTo({
      url: './zone/records/index',
    })
  },
  // 查询是否已经对当前名片点过赞
  appreciateDetails() {
    let that = this
    remote.appreciateUserStatus(this.data.uniqueKey, this.data.targetUserId, 0).then(res => {
      that.setData({
        doAppreciate: res.success
      })
    })
  },
  __touchmove() {},
  hiddenImageModal() {
    this.setData({
      showMateBanner: false
    })
  },
  // 是同乡/是校友
  doHomemate(res) {
    let that = this;
    let result = this.getUserInfo(res);
    if (result == -1) {
      that.loading()
      let flag = res.currentTarget.dataset.same;
      if (flag == 'homemate') {
        let homemate = this.data.homemate;
        if (homemate) {
          remote.deleteFriends(this.data.uniqueKey, this.data.targetUserId, 1).then(res => {
            that.setData({
              homemate: false,
              showMateBanner: false,
            })
            that.loading();
          })
        } else {
          remote.createFrinds({
            UserSysNo: this.data.targetUserId,
            Type: 1,
            InUserSysNo: this.data.uniqueKey
          }).then(res => {
            that.loading();
            that.setData({
              homemate: true,
              showMateBanner: true,
              mateText: '老乡您好，很高兴遇见你，我们聊聊吧！',
              homeBanner: 'https://www.xintui.xin:8058/wx/icon/e0cfb70a-a.png'
            })
          })
        }
      }
      if (flag == 'schoolmate') {
        let schoolmate = this.data.schoolmate;
        if (schoolmate) {
          remote.deleteFriends(this.data.uniqueKey, this.data.targetUserId, 2).then(res => {
            that.setData({
              schoolmate: false,
              showMateBanner: false,
            }, () => {
              that.loading();
            })
          })
        } else {
          remote.createFrinds({
            UserSysNo: this.data.targetUserId,
            Type: 2,
            InUserSysNo: this.data.uniqueKey
          }).then(res => {
            that.setData({
              schoolmate: true,
              showMateBanner: true,
              mateText: '我们是校友耶，来聊聊吧！',
              homeBanner: 'https://www.xintui.xin:8058/wx/icon/e5b3eebb-6.png'
            }, () => {
              that.loading();
            })
          })
        }
      }
    }
  },
  // 是否已经点过是同乡/是校友
  checkSamePlace() {
    let that = this;
    remote.checkSamePlace(that.data.targetUserId, that.data.uniqueKey, 1).then(res => {
      that.setData({
        homemate: res.data != null
      })
    })
    remote.checkSamePlace(that.data.targetUserId, that.data.uniqueKey, 2).then(res => {
      that.setData({
        schoolmate: res.data != null
      })
    })
  },
  // 获取微信用户信息
  getWxUserInfo(id) {
    let that = this;
    remote.getOriginWxInfo(id).then(res => {
      that.setData({
        wxUserInfo: res.data
      }, () => {
        if (that.data.uniqueKey != -1 && id != that.data.targetUserId) {
          wx.setStorageSync(constants.WX_USER_INFO, res.data)
          that.checkSamePlace();
        }
      })
    })
  },
  // 视频播放
  videoPlay(event) {
    let curId = this.data.currentVideoId
    const id = event.currentTarget.id // 确认是否已经正在播放视频
    if (!curId) {
      this.setData({
        currentVideoId: id
      })
      let currentVideoContext = wx.createVideoContext(id, this)
      currentVideoContext.play()
      if (this.data.uniqueKey != -1 && this.data.uniqueKey != this.data.targetUserId) {
        let desc = `${this.data.myInfo.Name || this.data.myInfo.WX}播放了您的视频`
        this.addRecords(today(), 3, desc, 0);
      }
    } else {
      let currentVideoContextPrev = wx.createVideoContext(curId, this)
      if (curId != id) { // 确认是不是当前的播放视频Id
        currentVideoContextPrev.pause()
        this.setData({
          currentVideoId: id
        })
        let currentVideoSuff = wx.createVideoContext(id, this)
        currentVideoSuff.play()
      }
    }
  },
  // 预览我的照片
  myImagePreview(event) {
    // 记录查看了照片
    let cur = event.currentTarget.dataset.index;
    let images = this.data.userInfo.PictureList;
    let temp = [];
    for (let index = 0; index < images.length; index++) {
      temp.push(images[index].Url);
    }
    wx.previewImage({
      current: temp[cur],
      urls: temp,
    })
  },
  // 刷新
  refresh(event) {
    let that = this;
    that.setData({
      refreshing: true
    }, () => {
      that.initPage();
    })
  },
  // 刷新复位
  refresherRestore(event) {
    this.setData({
      refreshing: true
    })
  },
  // 回到顶部
  backTop(event) {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0,
      })
    } else {
      version();
    }
  },
  // 回到首页
  backHome(event) {
    let uniqueKey = this.data.uniqueKey;
    let targetUserId = this.data.targetUserId;
    let that = this;
    if (uniqueKey != -1) {
      this.setData({
        targetUserId: uniqueKey,
        translentAnimation: true
      }, () => {
        that.initPage();
        that.backTop();
      })
    } else {
      that.backTop();
    }
  },
  _getConversationTemp() {
    let conversationList = this.data.conversationList;
    let temp = null;
    let that = this;
    for (let i = 0; i < conversationList.length; i++) {
      if (conversationList[i].userProfile.userID == this.data.targetUserId.toString()) {
        temp = JSON.stringify(conversationList[i]);
        break;
      }
    }
    return temp;
  },
  // 发送消息
  sendMessage(event) {
    if (this.data.uniqueKey == this.data.targetUserId) {
      return ;
    }
    let desc = `${this.data.myInfo.Name || this.data.myInfo.WX}咨询了您！`;
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    let temp = this._getConversationTemp();
    if (temp) {
      wx.navigateTo({
        url: `./zone/messages/board/index?conversation=${temp}`,
        success: function () {
          that.setData({
            showMateBanner: false
          })
          that.addRecords(today(), 10, desc, 0);
          wx.hideLoading();
        }
      })
    } else {
      let uniqueKey = this.data.uniqueKey;
      sendText(createMessage({
        to: this.data.targetUserId.toString(),
        conversationType: TIM.TYPES.CONV_C2C,
        payload: {
          text: '您好！'
        }
      })).then(res => {
        temp = that._getConversationTemp();
        wx.navigateTo({
          url: `./zone/messages/board/index?conversation=${temp}`,
          success: function () {
            that.setData({
              showMateBanner: false
            })
            that.addRecords(today(), 10, desc, 0);
            wx.hideLoading();
          }
        })
      }).catch(err => {
        console.log(err)
      });
    }
  },
  _getConversationList() {
    let that = this;
    messageList().then(res => {
      that.setData({
        conversationList: res.messageList
      })
    })
  },
  // 留言点赞
  likeCurComment(res) {
    let that = this;
    let result = this.getUserInfo(res);
    if (result == -1) {
      let index = res.currentTarget.dataset.index;
      let comments = this.data.comments;
      let cur = comments[index];
      if (cur.PointRatioStatus != 1 && !this.data.homeLoading) {
        remote.updateLiked(this.data.uniqueKey, this.data.targetUserId, cur.SysNo).then(res => {
          if (res.success) {
            cur.PointRatio += 1;
            cur.PointRatioStatus = 1;
            comments[index] = cur;
            that.setData({
              comments: comments
            })
          }
        })
      } else {
        wx.showToast({
          title: '已点赞',
          icon: 'none'
        })
      }
    }
  },
  // 更多评论
  moreComments(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let targetUserId = this.data.targetUserId;
      wx.navigateTo({
        url: `./words/index?targetUserId=${targetUserId}`,
      })
    }
  },
  // 留言
  sendComment(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let targetUserId = this.data.targetUserId;
      wx.navigateTo({
        url: `./words/index?targetUserId=${targetUserId}`,
      })
    }
  },
  // 商品详情
  goodsDetails(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let index = res.currentTarget.dataset.index;
      wx.navigateTo({
        url: `./zone/goods/details/index?goodsId=${index}`,
      })
    }
  },
  // 更多的商品
  moreProduct(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      wx.navigateTo({
        url: `./products/index?targetUserId=${this.data.targetUserId}`,
      })
    }
  },
  // 获取标签
  getLabels() {
    let that = this;
    if (this.data.uniqueKey != -1) {
      remote.getLabels(this.data.uniqueKey, this.data.targetUserId).then(res => {
        that.setData({
          labels: res.data
        });
      })
    }
  },
  // 点赞标签
  labelLiked(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let index = res.currentTarget.dataset.index;
      let labels = this.data.labels;
      let cur = labels[index];
      if (cur.Status == 0 && !this.data.homeLoading) {
        this.loading();
        let that = this;
        remote.likeLabel({
          CardUserSysNo: this.data.targetUserId,
          InUserSysNo: this.data.uniqueKey,
          LablesSysNo: cur.LablesSysNo
        }).then(res => {
          cur.Status = 1;
          cur.count += 1;
          labels[index] = cur;
          that.setData({
            labels: labels
          }, () => {
            that.loading();
          })
        })
      } else {
        wx.showToast({
          title: '已点赞',
          icon: 'none'
        })
      }
    }
  },
  // 获取评论
  getComments() {
    let key = this.data.uniqueKey == -1 ? 0 : this.data.uniqueKey;
    let that = this;
    remote.getCommentsList(this.data.targetUserId, key, {
      pageSize: 3,
      currentPage: 1,
      sort: 'desc'
    }).then(res => {
      let result = res.data.commentPointRatioList;
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          // 看到这段是不是想笑，评论只给内容，不给用户基本信息的
          remote.getOriginWxInfo(result[i].UserSysNo).then(res => {
            let info = res.data;
            if (info) {
              result[i]['avatar'] = image(info.HeadPortraitUrl);
              result[i]['name'] = info.Name;
            }
            that.setData({
              comments: result
            })
          })
        }
      } else {
        that.setData({
          comments: []
        })
      }
    })
  },
  getProducts() {
    let that = this;
    product.getProductList(this.data.targetUserId, 10, 1, "", {
      pageSize: 6,
      currentPage: 1,
      sort: "desc"
    }).then(res => {
      let result = res.data;
      for (let i = 0; i < result.length; i++) {
        result[i].DefaultImage = image(result[i].DefaultImage);
      }
      that.setData({
        products: result
      })
    })
  },
  getQRImage(data) {
    let that = this
    let promise = new Promise((resolve, reject) => {
      remote.createQr(this.data.uniqueKey, 1, data).then(res => {
        wx.getImageInfo({
          src: image(res.data),
          success: function (res) {
            that.saveToAlbum(res.path, resolve);
          }
        })
      })
    })
    return promise;
  },
  saveToAlbum(path, resolve, reject) {
    wx.saveImageToPhotosAlbum({
      filePath: path,
      success: function () {
        resolve(true)
        wx.showToast({
          title: '保存成功',
          icon: 'none'
        })
      },
      fail: function () {
        userSetting('scope.writePhotosAlbum', true).then(res => {
        })
        reject(false)
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },
  onShareAppMessage() {
    let desc = `${this.data.myInfo.Name || this.data.myInfo.WX}将您的名片转发到TA的朋友中了，注意联系！`;
    this.addRecords(today(), 7, desc, 0);
    return {
      title: '我开通了新推名片，快来围观！',
      desc: '新零售，用心推！',
      path: `/pages/index?targetKey=${this.data.targetUserId}`
    }
  },
  actiontapClick(event) {
    let { value } = event.detail;
    let that = this;
    let desc = '';
    switch (value) {
      case 1:
        this.setData({
          showAction: false
        })
        desc = `${that.data.myInfo.Name || that.data.myInfo.WX}将您的名片转发到TA的朋友中了，注意联系！`;
        that.addRecords(today(), 7, desc, 0);
        break;
      case 2:
        this.getQRImage({
            path: `/pages/index?targetKey=${this.data.uniqueKey}`,
            width: 430,
            auto_color: false,
            line_color: { r: 1, g: 1, b: 1 },
            is_hyaline: false
        }).then(res => {
          if (res) {
            that.setData({
              showAction: false
            }, () => {
              desc = `${that.data.myInfo.Name || that.data.myInfo.WX}将您的名片二维码下载到手机上了，恭喜生意上门。`;
              that.addRecords(today(), 7, desc, 0);
            })
          }
        }).catch(err =>{
          that.setData({
            showAction: false
          })
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        })
        break;
      case 3:
        this.setData({
          showAction: false
        })
        wx.navigateTo({
          url: `./share/poster?targetId=${this.data.targetUserId}&details=${JSON.stringify(this.data.userInfo)}`,
        })
        break;
      case 4:
        let userInfo = this.data.userInfo;
        let params = {
          avatar: userInfo.HeadPortraitUrl,
          name: userInfo.Name,
          position: userInfo.PositionName,
          company: userInfo.CompanyName,
          uniqueKey: this.data.targetUserId
        }
        params = JSON.stringify(params)
        wx.navigateTo({
          url: `./share/share?details=${ params }`,
          success: function () {
            that.setData({
              showAction: false
            }, () => {
              desc = `${that.data.myInfo.Name || that.data.myInfo.WX}打开现场扫码，也许在帮你推广哟！`;
              that.addRecords(today(), 7, desc, 0);
            })
          }
        })
        break;
      default:
        this.setData({
          showAction: false
        })
    }
  },
  // 获取浏览过的名片
  getSelfHistory() {
    let that = this;
    remote.getSelfHistory(this.data.uniqueKey, {
      pageSize: 20,
      currentPage: 1,
      sort: "desc"
    }).then(res => {
      let result = res.data;
      let targetUserId = that.data.targetUserId;
      if (result) {
        for (let i = 0; i < result.length; i++) {
          result[i].HeadPortraitUrl = image(result[i].HeadPortraitUrl);
          let time = result[i].VisitTime;
          if (time) {
            let t = time.split('T');
            time = t[0] + ' ' + t[1];
            result[i].VisitTime = time;
          }
          if (targetUserId == result[i].UserSysNo) {
            result[i]['current'] = true;
            let temp = result[0];
            result[0] = result[i];
            result[i] = temp;
          }
        }
        // 跳过第一个
        for (let j = 2; j < result.length; j++) {
          if (!lessDate(result[j].VisitTime, result[j - 1].VisitTime)) {
            let temp = result[j];
            result[j] = result[j - 1];
            result[j - 1] = temp;
          }
        }
        that.setData({
          historyList: result,
          noHistory: false
        })
      } else {
        that.setData({
          noHistory: true
        })
      }
    })
  },
  historytap(event) {
    let index = event.currentTarget.dataset.index;
    let that = this;
    this.setData({
      targetUserId: index,
      showHistoryModal: false
    }, () => {
      that.initPage();
    }) 
  },
  // 初始化
  initPage() {
    wx.showLoading({
      title: '加载中',
    })
    let that = this;
    that.loading();
    that.setData({
      translentAnimation: true
    })
    wx.pageScrollTo({
      scrollTop: 0,
    })
    let uniqueKey = this.data.uniqueKey;
    let targetUserId = this.data.targetUserId;
    if (uniqueKey == -1) {
      this.setData({
        navTitle: '创建名片'
      })
    } else if (uniqueKey != targetUserId) {
      this.setData({
        navTitle: '我的名片'
      })
    } else if (uniqueKey == targetUserId) {
      this.setData({
        navTitle: '个人中心'
      })
    }
    remote.getCardInfo(targetUserId).then(res => {
      if (res.success) {
        let videoList = res.data.VideoList;
        let picList = res.data.PictureList;
        for (let i =0; i < videoList.length; i++) {
          videoList[i].Url = image(videoList[i].Url);
        }
        for (let j = 0; j < picList.length; j++ ) {
          picList[j].Url = image(picList[j].Url);
        }
        // 排序照片
        for (let k = 0; k < picList.length; k++) {
          for (let z = k; z > 0 && z < picList.length; z--) {
            if (picList[z - 1].Priority > picList[z].Priority) {
              let temp = picList[z];
              picList[z] = picList[z - 1];
              picList[z - 1] = temp;
            }
          }
        }
        // 排序视频
        for (let k = 0; k < videoList.length; k++) {
          for (let z = k; z > 0 && z < videoList.length; z--) {
            if (videoList[z - 1].Priority > videoList[z].Priority) {
              let temp = videoList[z];
              videoList[z] = videoList[z - 1];
              videoList[z - 1] = temp;
            }
          }
        }
        let result = res.data;
        result.VideoList = videoList;
        result.PictureList = picList;
        result.HeadPortraitUrl = image(result.HeadPortraitUrl);
        wx.getImageInfo({
          src: result.HeadPortraitUrl,
          fail: function (err) {
            result.HeadPortraitUrl = constants.defaultLogo
          }
        })
        that.setData({
          userInfo: result,
          labels: result.LabelList
        }, () => {
          that.getHistoryItems(); // 获取历史记录
          that.appreciateDetails(); // 获取名片点赞
          that.getWxUserInfo(that.data.targetUserId); // 获取微信用户信息
          that.getLabels(); // 获取标签
          that.getComments(); // 获取评论
          that.getProducts(); // 获取商品列表
          that.doCollectionDetails();
          that.loading();
          that.setData({
            refreshing: false,
            translentAnimation: false
          })
          let desc = `${that.data.myInfo.Name || that.data.myInfo.WX}浏览了您的名片。`;
          that.addRecords(today(), 1, desc, 0);
          wx.hideLoading();
        })
      }
    })
  },
})