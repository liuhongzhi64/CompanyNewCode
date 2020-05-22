import { userSetting, login, session, version } from '../common/version.js';
import constants from '../common/constants.js';
import remote from '../service/remote.js';
import { image } from '../request/index.js';
import product from '../service/product.js';
import { imLogin, imLoginOut } from '../utils/imUtils.js';
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
    // targetUserId: 79,
    targetUserId: 295,
    groups: [
      { text: '分享到微信', value: 1, openType: 'share' },
      { text: '下载二维码', value: 2 },
      { text: '名片海报', value: 3 },
      {text: '现场扫码', value: 4}
    ],
    unreadcount: 0,
    tabList: [{ name: '名片', url:'index' }, { name: '商城', url: 'official' }, { name: '官网', url: 'store' }]
  },
  onLoad: function (options) {
    app.watch('unreadcount',this.feedback);
    let width = wx.getSystemInfoSync().screenWidth;
    // 浏览他人名片
    let targetUserId = options.targetKey
    if (targetUserId) {
      console.log('初始化名片')
    }
    let myInfo = wx.getStorageSync(constants.USERINFO);
    console.log(myInfo)
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    console.log(uniqueKey)
    app.globalData.userInfo = myInfo || {};
    app.globalData.uniqueKey = uniqueKey || -1;
    this.setData({
      myInfo: myInfo,
      avatar: myInfo.HeadPortraitUrl || constants.defaultLogo,
      title: myInfo.Name,
      uniqueKey: uniqueKey || -1,
      navTitle: myInfo ? '个人中心' : '创建名片',
      screenWidth: width
    })
  },
  onReady: function () {
    this.initPage()
  },
  onShow: function () {
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
  feedback(value) {
    console.log(value)
    this.setData({
      unreadcount: value
    })
  },
  loading() {
    let loading = this.data.homeLoading;
    this.setData({
      homeLoading: !loading
    })
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
        navTitle: '个人中心',
        uniqueKey: uniqueKey
      }, () => {
        wx.setStorageSync(constants.USERINFO, that.data.myInfo);
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
        that.setData({
          translentAnimation: false
        })
      })
    })
  },
  // 获取用户权限
  // 在需要授权位置，授权完成后，没有名片的用户会被跳转去创建名片
  getUserInfo(res) {
    console.log(res);
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
          console.log(res);
          // 微信登录
          login(res.userInfo).then(res => {
            console.log(res);
            let avatar = res.HeadPortraitUrl,
                  name = res.WX;
            // 后台登录
            remote.login(res).then(res => {
              console.log(res);
              wx.setStorageSync(constants.UNIQUE_KEY, res.data);
              let uniqueKey = res.data
              let app = getApp();
              app.globalData.uniqueKey = uniqueKey;
              // 验证用户是否有名片
              remote.checkCard(res.data).then(res => {
                console.log(res)
                if (res.success) {
                  that.remotegetInfo(uniqueKey);
                } else {
                  console.log('创建名片')
                  let iscreated = that.data.iscreated;
                  if (!iscreated) {
                    that.createCard(uniqueKey, avatar, name).then(res => {
                      if (res.success) {
                        that.remotegetInfo(uniqueKey);
                      }
                    });
                  }
                }
              })
            })
          })
        }).catch(err => {
          console.log(err)
          this.loading();
        })
      })
      return promise;
    }
    return -1;
  },
  navgateToZone(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      wx.navigateTo({
        url: './zone/index',
      })
    }
  },
  // 浏览历史名片
  scanCards(res) {
    let result = this.getUserInfo(res)
    if (result == -1) {
      let that = this;
      console.log('浏览名片')
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
      console.log('分享名片')
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
          console.log(res)
          wx.addPhoneContact({
            firstName: userInfo.Name,
            mobilePhoneNumber: userInfo.Telephone
          })
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
    console.log(data)
    let promise = new Promise((resolve, reject) => {
      wx.checkSession({
        success: function () {
          console.log('session 未过期')
          resolve({
            encryptedData: data.detail.encryptedData,
            iV: data.detail.iv
          })
        },
        fail: function () {
          let userInfo = that.data.userInfo
          login(userInfo).then(res => {
            remote.login(res).then(res => {
              console.log(res)
              resolve(res.data)
            })
          })
        }
      })
    })
    return promise;
  },
  // 打电话
  callme(res) {
    console.log(res)
    let result = this.getUserInfo(res);
    console.log(result)
    if (result == -1) {
      wx.makePhoneCall({
        phoneNumber: res.currentTarget.dataset.phone,
      })
    }
  },
  // 加微信
  beMyWechatFriend(res) {
    console.log(res)
    let result = this.getUserInfo(res);
    if (result == -1) {
      wx.setClipboardData({
        data: res.currentTarget.dataset.weichat,
        success: function () {
          wx.showToast({
            title: '已复制',
            icon: 'none'
          })
        }
      })
    }
  },
  // 定位
  useAddress(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      console.log('获取定位')
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
      console.log('点赞')
      let doAppreciate = this.data.doAppreciate;
      console.log(doAppreciate)
      if (!doAppreciate) {
        console.log('点赞')
        that.loading();
        remote.doAppreciateCard(this.data.targetUserId, this.data.uniqueKey, 0).then(res => {
          if (res.success) {
            let userInfo = that.data.userInfo;
            userInfo.PointRatio = userInfo.PointRatio + 1;
            that.loading();
            that.setData({
              doAppreciate: true, // true 不能点赞 false 可以点赞
              userInfo: userInfo
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
      console.log(res)
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
  // 查询是否已经对当前名片点过赞
  appreciateDetails() {
    let that = this
    remote.appreciateUserStatus(this.data.uniqueKey, this.data.targetUserId, 0).then(res => {
      console.log(res.success)
      that.setData({
        doAppreciate: res.success
      })
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
        console.log('是同乡')
        let homemate = this.data.homemate;
        console.log(homemate)
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
              homeBanner: ''
            })
          })
        }
      }
      if (flag == 'schoolmate') {
        console.log('是校友')
        let schoolmate = this.data.schoolmate;
        console.log(schoolmate)
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
              homeBanner: ''
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
    console.log(event)
    // 记录查看了照片
    let cur = event.currentTarget.dataset.index
    let images = this.data.userInfo.PictureList
    let temp = []
    for (let index = 0; index < images.length; index++) {
      temp.push(images[index].Url)
    }
    wx.previewImage({
      current: temp[cur],
      urls: temp,
    })
  },
  // 刷新
  refresh(event) {
    console.log(event);
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
  // 发送消息
  sendMessage(event) {
    console.log('发送消息');
    wx.showToast({
      title: '发送消息',
      icon: 'none'
    })
  },
  // 留言点赞
  likeCurComment(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      console.log('留言点赞');
      let index = res.currentTarget.dataset.index;
      let comments = this.data.comments;
      let cur = comments[index];
      if (cur.PointRatioStatus != 1 && !this.data.homeLoading) {
        let that = this;
        that.loading()
        remote.updateLiked(this.data.uniqueKey, this.data.targetUserId, cur.SysNo).then(res => {
          if (res.success) {
            cur.PointRatio += 1;
            cur.PointRatioStatus = 1;
            comments[index] = cur;
            that.setData({
              comments: comments
            }, () => {
              that.loading();
            })
          }
        })
      } else {
        wx.showToast({
          title: '已点赞',
          icon: 'none'
        }, () => {
          that.loading();
        })
      }
    }
  },
  // 更多评论
  moreComments(res) {
    let result = this.getUserInfo(res);
    if (result == -1) {
      let targetUserId = this.data.targetUserId;
      console.log('更多留言');
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
      console.log('我要留言');
      wx.navigateTo({
        url: `./words/index?targetUserId=${targetUserId}`,
      })
    }
  },
  // 商品详情
  goodsDetails(res) {
    console.log(res);
    let result = this.getUserInfo(res);
    if (result == -1) {
      console.log('查看商品');
      let index = res.currentTarget.dataset.index;
      wx.navigateTo({
        url: `./zone/goods/details/index?goodsId=${index}`,
      })
    }
  },
  // 更多的商品
  moreProduct(res) {
    console.log(res);
    let result = this.getUserInfo(res);
    if (result == -1) {
      console.log('更多商品');
      wx.navigateTo({
        url: `./products/index?targetUserId=${this.data.targetUserId}`,
      })
    }
  },
  // 获取标签
  getLabels() {
    console.log('获取标签')
    let that = this;
    if (this.data.uniqueKey != -1) {
      remote.getLabels(this.data.uniqueKey, this.data.targetUserId).then(res => {
        console.log(res);
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
      console.log('点赞标签');
      let index = res.currentTarget.dataset.index;
      console.log(res)
      let labels = this.data.labels;
      console.log(labels);
      let cur = labels[index];
      console.log(cur)
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
      console.log(result)
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
    console.log('存入手机')
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
          console.log(res)
        })
        reject(false)
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    })
  },
  actiontapClick(event) {
    console.log(event);
    let { value } = event.detail;
    let that = this;
    switch (value) {
      case 1:
        this.setData({
          showAction: false
        })
        wx.showToast({
          title: '分享成功',
          icon: 'none'
        })
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
            console.log(res)
            that.setData({
              showAction: false
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
        wx.showToast({
          title: '名片 海报',
          icon: 'none'
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
    console.log(event)
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
    remote.getCardInfo(targetUserId).then(res => {
      if (res.success) {
        console.log(res.data)
        let videoList = res.data.VideoList;
        let picList = res.data.PictureList;
        for (let i =0; i < videoList.length; i++) {
          videoList[i].Url = image(videoList[i].Url);
        }
        for (let j = 0; j < picList.length; j++ ) {
          picList[j].Url = image(picList[j].Url);
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
        })
      }
    })
  },
})