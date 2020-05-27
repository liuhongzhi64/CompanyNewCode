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
    targetUserId: 295,//测试ID用这个
    // targetUserId: 79,//线上用这个默认的ID
    groups: [
      { text: '分享到微信', value: 1, openType: 'share' },
      { text: '名片海报', value: 3 },
      {text: '现场扫码', value: 4}
    ],
    unreadcount: 0,
    versionNum: constants.VERSION,
    authorizationShow : false,//是否开启客户新进入新推的定时器的弹窗提示
    AName : '',//在客户没有自己的名片时，默认的获取的微信名称
    userPhone:'',//用户的电话号码
    buttonOpenTypeGetUserInfoShow:true,
    buttonOpenTypeGetPhoneNumberShow:false,
    buttonOpenTypeDefaultShow:false,
    // merchantSysNo:1431,//配置企业编号线上
    merchantSysNo:1394,//配置企业编号测试
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    app.watch('unreadcount',this.feedback);
    app.watch('messageList', this.messageBack);
    let width = wx.getSystemInfoSync().screenWidth;

    console.log(wx.getStorageSync(constants.MerchantSysNo))

    // 浏览他人名片
    let targetUserId = options.targetKey
    let key = wx.getStorageSync(constants.UNIQUE_KEY);//这是用户自己的ID
    let Info = wx.getStorageSync(constants.USERINFO);//用户的基本信息表
    console.log(targetUserId)//undefined
    // console.log(Info)
    if (targetUserId) {
      this.setData({
        targetUserId: targetUserId,
      })
    }
    
    // 这是后面新加的判定，如果自己有账号，并且自己的资料已经完善，进来的时候就直接进入自己的界面
    else{
      if (Info){
        this.setData({
          targetUserId: key,
          buttonOpenTypeGetUserInfoShow: false,
          buttonOpenTypeGetPhoneNumberShow: false,
          buttonOpenTypeDefaultShow: true,
        })
      }
    }

    let myInfo = wx.getStorageSync(constants.USERINFO);
    // wx.setStorageSync(constants.UNIQUE_KEY, 307);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);

    // 这是后面加的获取用户的信息的查询
    if (uniqueKey != ''){
      // remote.getUserInformation(uniqueKey).then(res => {
      remote.getUserInformation(uniqueKey, this.data.merchantSysNo).then(res => {
        // console.log(res.data.HeadPortraitUrl)
        let leftPortrait = res.data.HeadPortraitUrl
        leftPortrait = leftPortrait.split('//')[1]
        if (leftPortrait){
          leftPortrait = leftPortrait.split('/')[0]
          if (leftPortrait == 'wx.qlogo.cn') {
            this.setData({
              avatar: res.data.HeadPortraitUrl,  //这是左上角的头像
            })
          } else {
            this.setData({
              avatar: 'https://www.xintui.xin:8058' + res.data.HeadPortraitUrl,  //这是没有前缀的头像设置左上角的头像
            })
          }
        }

        this.setData({
          AName: res.data.Name,                    
        })

        // 新加的判定新用户在初次授权后的头像是否和默认创建名片的头像一致，不一致就是已经授权，然后改变按钮为获取电话号码
        if (this.data.avatar != constants.defaultLogo && res.data.TelePhone != null ) {
          // console.log(333333)
          this.setData({
            buttonOpenTypeGetPhoneNumberShow: false,
            buttonOpenTypeGetUserInfoShow: false,
            buttonOpenTypeDefaultShow: true,
          })
        }
        else{
          // console.log(44444, res.data.TelePhone ,this.data)
          this.setData({
            buttonOpenTypeGetPhoneNumberShow: true,
            buttonOpenTypeGetUserInfoShow: false,
            buttonOpenTypeDefaultShow: false,
          })       
        }
      })
    }

    app.globalData.userInfo = myInfo || {};
    app.globalData.uniqueKey = uniqueKey || -1;

    if (uniqueKey && !app.globalData.hadLogin) {
      imLogin(uniqueKey);
    }

    // console.log(options, this.data.targetUserId)
    this.setData({
      myInfo: myInfo,
      avatar: myInfo.HeadPortraitUrl || constants.defaultLogo,
      title: myInfo.Name,
      uniqueKey: uniqueKey || -1,
      navTitle: myInfo ? '' : '创建名片',
      screenWidth: width,
      targetUserId:  options.targetUserId || this.data.targetUserId,//新加的浏览别人的名片
    }) 
  },
  onReady: function (e) {
    this.initPage();

    if (this.data.navTitle == '创建名片') {
      let msgSet = setTimeout((callback) => {
        let that = this
        that.setData({
          authorizationShow: true,
        })
      }, 3000, () => {//在进入名片的时候触发这个定时器
        clearTimeout(msgSet);
      })
    }

  },
  // 是否开启授权弹窗
  isAuthorizationShow:function(e){
    this.setData({
      authorizationShow: false,
    })
  },

  onShow: function () {
    let unreadcount = app.globalData.unreadcount;
    this.feedback(unreadcount);
    // console.log(unreadcount)
    let wxUserInfo = wx.getStorageSync(constants.WX_USER_INFO);
    // console.log(wxUserInfo)
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
  addRecords(time, type, desc, phone, merchantSysNo) {
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
      Phone: phone,
      MerchantSysNo: this.data.merchantSysNo//新加的
    });
  },
  // 以前的代码
    // createCard(uniqueKey, avatar, name) {
    //   return remote.createBusinessCard({
    //     HeadPortrait: avatar,
    //     BusinessCardName: name,
    //     Telephone: '',
    //     SysNo: uniqueKey,
    //     CompanyName: ''
    //   });
    // },
  createCard(uniqueKey, avatar, name, merchantSysNo) {
    return remote.createBusinessCard({
      HeadPortrait: avatar,
      BusinessCardName: name,
      Telephone: '',
      SysNo: uniqueKey,
      CompanyName: '',
      MerchantSysNo: merchantSysNo
    });
  },
  remotegetInfo(uniqueKey) {
    let that = this;
    console.log(uniqueKey,"这是我想要的ID吗？")
    // remote.getCardInfo(uniqueKey).then(res => {
    remote.getCardInfo(uniqueKey, that.data.merchantSysNo).then(res => {
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
          translentAnimation: false,
          buttonOpenTypeGetPhoneNumberShow: true,
          buttonOpenTypeGetUserInfoShow: false,
          buttonOpenTypeDefaultShow: false,
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
        translentAnimation: true,
      });
      // console.log(this.data.merchantSysNo)
      let promise = new Promise((resolve, reject) => {
        // 用户授权
        userSetting('scope.userInfo', true).then(res => {
          // 微信登录
          login(res.userInfo).then(res => {
            console.log("微信登录", res)
            // 新加的企业编号
            res.MerchantSysNo = that.data.merchantSysNo //新加需求，要添加企业编号
            wx.setStorageSync(constants.MerchantSysNo, res.MerchantSysNo)//新加需求，要添加企业编号,将企业编号存在本地存储中
            // console.log(res)
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
              let merchantSysNo = that.data.merchantSysNo //新加需求，要添加企业编号


              remote.checkCard(res.data, merchantSysNo).then(res => {
                if (res.success) {
                  // 查询成功有名片就让按钮直接变为默认情况，可以直接触发事件
                  that.setData({
                    AName: res.data.Name,
                  })
                  that.remotegetInfo(uniqueKey);
                } 
                else {
                  // 如果查询到没有名片，就改变按钮为获取电话号码类型，让用户在操作其他的时候就创建默认名片
                  wx.navigateTo({

                    // url: `./zone/edit/profile/index?noCard=true&avatar=${avatar}&name=${name}`,//这个是跳转到创建名片页（这是以前的路由导航）                
                    url: `./index?avatar=${avatar}?targetId=${that.data.targetId}`,

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
    // console.log(res)
    let result = this.getUserInfo(res);
    if (result == -1) {
      let uniqueKey = this.data.uniqueKey;
      let targetUserId = this.data.targetUserId;
      // 这是以前的代码，是点击左上角的创建名片的原始跳转和路径配置
      // if (uniqueKey != targetUserId) {
        //   this.setData({
        //     targetUserId: uniqueKey
        //   }, () => {
        //     if (!this.data.myInfo) {
        //       remote.getOriginWxInfo(this.data.uniqueKey).then(res => {
        //         wx.navigateTo({
        //           url: `./zone/edit/profile/index?noCard=true&avatar=${res.data.HeadPortraitUrl}&name=${res.data.WX}`,
        //         })
        //       })
        //     } else {
        //       this.initPage();
        //     }
        //   })
        // } else 
      if (uniqueKey != targetUserId){
        this.setData({
          targetUserId: uniqueKey
        });
        if (!this.data.myInfo) {
          // remote.getOriginWxInfo(this.data.uniqueKey).then(res => {
          remote.getOriginWxInfo(this.data.uniqueKey,this.data.merchantSysNo).then(res => {
            wx.navigateTo({
              url: `./zone/edit/profile/index?noCard=true&avatar=${res.data.HeadPortraitUrl}&name=${res.data.WX}`,
            })
          })
        } else {
          this.initPage();
        }
        // console.log(uniqueKey)
      }
      else{
        wx.navigateTo({
          url: './zone/index',
        })
      }
    }
  },
  // 浏览历史名片
  scanCards(res) {
    let result = this.getUserInfo(res)
    // console.log(res, result)
    if (result == -1) {
      let that = this;
      this.setData({
        showHistoryModal: true
      }, () => {
        that.getSelfHistory();
      })
    }else{
      console.log(111)

      // wx.authorize({ scope: "scope.userInfo" })
      // this.getUserInfo(res)
    }
  },
  // 分享名片
  shareCard(res) {
    let that = this;
    // that.setData({
    //   buttonOpenTypeDefaultShow: true,
    //   buttonOpenTypeGetPhoneNumberShow: false,
    //   buttonOpenTypeGetUserInfoShow: false,
    // })
    let result = this.getUserInfo(res)
    // console.log(result)
    console.log(res)
    if (result == -1) {
      // // 在用户只授权了获取自己的头像和微信名的时候点击分享名片要先进行一次获取电话号码的权限，用来创建初始化名片
      that.storagePhone(res)
      console.log(that.data.buttonOpenTypeGetPhoneNumberShow)
      if (!that.data.buttonOpenTypeGetPhoneNumberShow){
        this.setData({
          showAction: true
        })
      }

      
      // this.setData({
      //   showAction: true
      // })
    }
  },
  shareCards(res) {
    this.setData({
      showAction: true
    })
  },
  // 保存电话到通讯录
  savePhone(res) {
    this.loading()
    let sessionData = res
    let that = this
    let userInfo = that.data.userInfo
    // console.log(userInfo, sessionData, that.data.uniqueKey, that.data.userPhone)
    if (res.detail.errMsg.split(':')[1] == 'ok') {
      that.checkSession(sessionData).then(res => {
         // 这是后面加的获取用户的信息的查询
        // remote.getUserInformation(that.data.uniqueKey).then(res => {
        remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
          that.setData({
            AName: res.data.Name,
          })
        })
        // , that.data.merchantSysNo是新加的商品编号
        remote.getPhone(res.encryptedData, res.iV, that.data.uniqueKey, that.data.merchantSysNo).then(res => {
          wx.addPhoneContact({
            firstName: userInfo.Name,
            mobilePhoneNumber: userInfo.Telephone,
            organization: userInfo.CompanyName || "",
            title: userInfo.PositionName || "",
            workAddressState: userInfo.ProvinceName || "",
            workAddressCity: userInfo.CityName || "",
            workAddressStreet: userInfo.DistrictName || "",
            email: userInfo.Email || ""
          })
          that.setData({
            userPhone: JSON.parse(res.data).purePhoneNumber,
          })
          // console.log(that.data.userPhone, that.data.targetUserId)
          // 这是后面加的把电话存入到后台
          this.createCard(that.data.uniqueKey, this.data.avatar, this.data.AName, that.data.userPhone, that.data.merchantSysNo).then(res => {
            // console.log(res)
            if (res.message == '名片已经存在！'){
              // console.log(9999999)
              that.setData({
                buttonOpenTypeGetPhoneNumberShow: false,
                buttonOpenTypeGetUserInfoShow: false,
                buttonOpenTypeDefaultShow: true,
              })
            }
            // remote.getCardInfo(that.data.uniqueKey).then(res => {
            remote.getCardInfo(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
              wx.setStorageSync(constants.USERINFO, res.data);
              console.log(that.data.targetUserId)
              wx.navigateTo({
                url: `./index?targetUserId=${that.data.targetUserId}`,
              })
              // wx.showToast({
              //   success: function (res) {
              //     setTimeout(() => {
              //       wx.navigateTo({
              //         url: './index',
              //       }, 1000)
              //     })
              //   }
              // })
            })

          })

          let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}保存了您的号码，他的电话是--->${JSON.parse(res.data).purePhoneNumber}<,快回拨过去，促成交易!`;
          // that.addRecords(today(), 9, desc, 1);
          that.addRecords(today(), 9, desc, 1, that.data.merchantSysNo);
          that.loading()
        })
      })
    } else {
      this.loading();
    }
  },
  // 有名片存入通讯录
  addSavePhone(res){
    // console.log(res)
    this.loading()
    let sessionData = res
    let that = this
    let userInfo = that.data.userInfo
    that.checkSession(sessionData).then(res => {
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
      // 这里要在本地缓存中找到用户自己的电话号码，不然就会出现没有电话号码的情况
      // console.log(wx.getStorageSync(constants.USERINFO))
      // console.log(that.data.myInfo.Telephone)
      let myPhone = that.data.myInfo.Telephone;
      let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}保存了您的号码，他的电话是--->${myPhone}<,快回拨过去，促成交易!`;
      // that.addRecords(today(), 9, desc, 1);
      that.addRecords(today(), 9, desc, 1, that.data.merchantSysNo);
      that.loading()
    })
  },
  // 创建名片
  createCard(uniqueKey, avatar, name, phone, merchantSysNo) {
    return remote.createBusinessCard({
      HeadPortrait: avatar,
      BusinessCardName: name,
      Telephone: phone,
      SysNo: uniqueKey,
      CompanyName: '',
      MerchantSysNo: merchantSysNo
    });
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
          // 新加的企业编号
          userInfo.MerchantSysNo = that.data.merchantSysNo //新加需求，要添加企业编号

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
  // 向后台存用户的电话号码
  storagePhone(res){
    let sessionData = res
    let that = this
    // console.log(sessionData)
    if (res.detail.errMsg.split(':')[1] == 'ok') {
      that.checkSession(sessionData).then(res => {
        // 这是后面加的获取用户的信息的查询
        // remote.getUserInformation(that.data.uniqueKey).then(res => {
        remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
          that.setData({
            AName: res.data.Name,
          })
        })

        // that.data.merchantSysNo是新加的商品编号
        remote.getPhone(res.encryptedData, res.iV, that.data.uniqueKey, that.data.merchantSysNo).then(res => {
          // console.log(res)
          if (res.message == "获取成功！"){
            that.setData({
              userPhone: JSON.parse(res.data).purePhoneNumber,
              buttonOpenTypeDefaultShow: true,
              buttonOpenTypeGetPhoneNumberShow: false,
              buttonOpenTypeGetUserInfoShow: false,
            })
          }
          // console.log(that.data.userPhone)
          // 这是后面加的把电话存入到后台
          // this.createCard(that.data.uniqueKey, this.data.avatar, this.data.AName, that.data.userPhone).then(res => {
          this.createCard(that.data.uniqueKey, this.data.avatar, this.data.AName, that.data.userPhone, that.data.merchantSysNo).then(res => {
            // console.log(res)
            remote.getCardInfo(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
              wx.setStorageSync(constants.USERINFO, res.data);
              this.refresh()//刷新页面
              // wx.navigateTo({
              //   url: `./index?targetId=${that.data.targetId}`,
              // })
            })
          })
        })
      })
    }else{
      that.setData({
        buttonOpenTypeDefaultShow: false,
        buttonOpenTypeGetPhoneNumberShow: true,
        buttonOpenTypeGetUserInfoShow: false,
      })
    }
  },
  // 打电话
  callme(res) {
    // console.log(res.type)

    let result = this.getUserInfo(res);
    let that = this;
    that.storagePhone(res)
    if (!that.data.buttonOpenTypeGetPhoneNumberShow){
      if (result == -1) {
        wx.makePhoneCall({
          phoneNumber: res.currentTarget.dataset.phone,
          success: function () {
            // 这是后面加的获取用户的信息的查询
            // remote.getUserInformation(that.data.uniqueKey).then(res => {
            remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
              that.setData({
                AName: res.data.Name,
              })
            })

            let myPhone = that.data.myInfo.Telephone;
            let desc = '';
            if (myPhone) {
              desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}拨打了你的电话，他的电话是--->${myPhone}<,快回拨过去，促成交易!`;
            } else {
              desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}拨打了你的电话，注意保存TA的号码。`
            }
            // that.addRecords(today(), 8, desc, myPhone ? 1 : 0);
            that.addRecords(today(), 8, desc, myPhone ? 1 : 0, that.data.merchantSysNo);
          },
          fail: function () {
            console.log("打电话失败")
          }
        })
      }
    }

    // if (result == -1) {
    //   wx.makePhoneCall({
    //     phoneNumber: res.currentTarget.dataset.phone,
    //     success: function () {
    //       // 这是后面加的获取用户的信息的查询
    //       // remote.getUserInformation(that.data.uniqueKey).then(res => {
    //       remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
    //         that.setData({
    //           AName: res.data.Name,
    //         })
    //       })

    //       let myPhone = that.data.myInfo.Telephone;
    //       let desc = '';
    //       if (myPhone) {
    //         desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}拨打了你的电话，他的电话是--->${myPhone}<,快回拨过去，促成交易!`;
    //       } else {
    //         desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}拨打了你的电话，注意保存TA的号码。`
    //       }
    //       // that.addRecords(today(), 8, desc, myPhone ? 1 : 0);
    //       that.addRecords(today(), 8, desc, myPhone ? 1 : 0, that.data.merchantSysNo);
    //     },
    //     fail:function(){
    //       console.log("打电话失败")
    //     }
    //   })
    // }
  },
  // 有名片拨打电话
  callPhone(res){
    // console.log(res)
    let that =this
    wx.makePhoneCall({
      phoneNumber: res.currentTarget.dataset.phone,
      success: function () {
        // 这是后面加的获取用户的信息的查询
        // remote.getUserInformation(that.data.uniqueKey).then(res => {
        remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
          that.setData({
            AName: res.data.Name
          })
        })

        let myPhone = that.data.myInfo.Telephone;
        let desc = '';
        if (myPhone) {
          desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}拨打了你的电话，他的电话是--->${myPhone}<,快回拨过去，促成交易!`;
        } else {
          desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}拨打了你的电话，注意保存TA的号码。`
        }
        // that.addRecords(today(), 8, desc, myPhone ? 1 : 0);
        that.addRecords(today(), 8, desc, myPhone ? 1 : 0, that.data.merchantSysNo);
      }
    })
  },
  // 加微信
  beMyWechatFriend(res) {
    let result = this.getUserInfo(res);
    let that = this;
    // that.setData({
    //   buttonOpenTypeDefaultShow: true,
    //   buttonOpenTypeGetPhoneNumberShow: false,
    //   buttonOpenTypeGetUserInfoShow: false,
    // })
    that.storagePhone(res) 
    if (!that.data.buttonOpenTypeGetPhoneNumberShow) {
      if (result == -1) {
        wx.setClipboardData({
          data: res.currentTarget.dataset.weichat,
          success: function () {
            wx.showToast({
              title: '已复制',
              icon: 'none',
              success: function () {

                // 这是后面加的获取用户的信息的查询
                // remote.getUserInformation(that.data.uniqueKey).then(res => {
                remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
                  // console.log(res.data.Name)
                  that.setData({
                    AName: res.data.Name,
                  })
                })

                let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}已经复制了您的微信号码,请注意通过TA的好友请求哟！`;
                // that.addRecords(today(), 11, desc, 0);
                that.addRecords(today(), 11, desc, 0, that.data.merchantSysNo);
              }
            })
          }
        })
      }
    }


  },
  // 有名片添加微信好友
  addBeMyWechatFriend(res){
    // console.log(res)
    let that = this;
    wx.setClipboardData({
      data: res.currentTarget.dataset.weichat,
      success: function () {
        wx.showToast({
          title: '已复制',
          icon: 'none',
          success: function () {
            // 这是后面加的获取用户的信息的查询
            // remote.getUserInformation(that.data.uniqueKey).then(res => {
            remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
              // console.log(res.data.Name)
              that.setData({
                AName: res.data.Name
              })
            })
            let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}已经复制了您的微信号码,请注意通过TA的好友请求哟！`;
            // that.addRecords(today(), 11, desc, 0);
            that.addRecords(today(), 11, desc, 0, that.data.merchantSysNo);
          }
        })
      }
    })
  },
  // 定位
  useAddress(res) {
    let that = this
    // that.setData({
    //   buttonOpenTypeDefaultShow: true,
    //   buttonOpenTypeGetPhoneNumberShow: false,
    //   buttonOpenTypeGetUserInfoShow: false,
    // })
    let result = this.getUserInfo(res);
    that.storagePhone(res)
    if (!that.data.buttonOpenTypeGetPhoneNumberShow){
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
    }


  },
  // 有名片定位
  addUseAddress(res) {
    let that = this
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

    console.log(params)
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
        // remote.doAppreciateCard(this.data.targetUserId, this.data.uniqueKey, 0).then(res => {//, that.data.merchantSysNo新加的商品编号
        remote.doAppreciateCard(this.data.targetUserId, this.data.uniqueKey, 0, this.data.merchantSysNo).then(res => {
          if (res.success) {
            let userInfo = that.data.userInfo;
            userInfo.PointRatio = userInfo.PointRatio + 1;
            that.loading();
            that.setData({
              doAppreciate: true, // true 不能点赞 false 可以点赞
              userInfo: userInfo
            }, () => {
              // 这是后面加的获取用户的信息的查询
              // remote.getUserInformation(that.data.uniqueKey).then(res => {
              remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
                // console.log(res.data.Name)
                that.setData({
                  AName: res.data.Name
                })
                // console.log(this.data.userInfo)
              })

              let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}给您的名片点了赞，快去瞧瞧吧！`;
              // that.addRecords(today(), 14, desc, 0);
              that.addRecords(today(), 14, desc, 0, that.data.merchantSysNo);
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
          BusinessCardSysNo: userInfo.SysNo,
          MerchantSysNo: this.data.merchantSysNo //新加的企业编号
        }).then( res => {
          console.log(res)
          if (res.success) {
            that.setData({
              doCollecte: true,
              collectionId: res.data
            }, () => {

              // 这是后面加的获取用户的信息的查询
              // remote.getUserInformation(that.data.uniqueKey).then(res => {
              remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
                that.setData({
                  AName: res.data.Name
                })
              })

              let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}已经收藏了您的名片,哇，一单大的生意快要上门啦！`;
              // that.addRecords(today(), 12, desc, 0);
              that.addRecords(today(), 12, desc, 0, that.data.merchantSysNo);
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
    // , this.data.merchantSysNo是新加的企业编号
    remote.doCollectionStatus(this.data.targetUserId, this.data.uniqueKey, this.data.userInfo.SysNo, this.data.merchantSysNo).then(res => {
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
    // remote.appreciateUserStatus(this.data.uniqueKey, this.data.targetUserId, 0).then(res => {
    remote.appreciateUserStatus(this.data.uniqueKey, this.data.targetUserId, 0, this.data.merchantSysNo).then(res => {
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
          remote.deleteFriends(this.data.uniqueKey, this.data.targetUserId, 1, this.data.merchantSysNo).then(res => {
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
            InUserSysNo: this.data.uniqueKey,
            MerchantSysNo:this.data.merchantSysNo//新加的商页编号
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
          remote.deleteFriends(this.data.uniqueKey, this.data.targetUserId, 2, this.data.merchantSysNo).then(res => {
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
            InUserSysNo: this.data.uniqueKey,
            MerchantSysNo: this.data.merchantSysNo//新加的商页编号
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
    remote.checkSamePlace(that.data.targetUserId, that.data.uniqueKey, 1,that.data.merchantSysNo).then(res => {
      that.setData({
        homemate: res.data != null
      })
    })
    remote.checkSamePlace(that.data.targetUserId, that.data.uniqueKey, 2,that.data.merchantSysNo).then(res => {
      that.setData({
        schoolmate: res.data != null
      })
    })
  },
  // 获取微信用户信息
  getWxUserInfo(id) {
    let that = this;
    // remote.getOriginWxInfo(id).then(res => {
    remote.getOriginWxInfo(id, this.data.merchantSysNo).then(res => {
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

        // 这是后面加的获取用户的信息的查询
        // remote.getUserInformation(this.data.uniqueKey).then(res => {
        remote.getUserInformation(this.data.uniqueKey, this.data.merchantSysNo).then(res => {
          this.setData({
            AName: res.data.Name
          })
        })

        let desc = `${this.data.myInfo.Name || this.data.myInfo.WX ||this.data.AName}播放了您的视频`
        // this.addRecords(today(), 3, desc, 0);
        this.addRecords(today(), 3, desc, 0, this.data.merchantSysNo);
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

    // 这是后面加的获取用户的信息的查询
    // remote.getUserInformation(this.data.uniqueKey).then(res => {
    remote.getUserInformation(this.data.uniqueKey, this.data.merchantSysNo).then(res => {
      that.setData({
        AName: res.data.Name
      })
    })

    let desc = `${this.data.myInfo.Name || this.data.myInfo.WX||this.data.AName}咨询了您！`;
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
          // that.addRecords(today(), 10, desc, 0);
          that.addRecords(today(), 10, desc, 0, that.data.merchantSysNo);
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
            // that.addRecords(today(), 10, desc, 0);
            that.addRecords(today(), 10, desc, 0, that.data.merchantSysNo);
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
        remote.updateLiked(this.data.uniqueKey, this.data.targetUserId, cur.SysNo, this.data.merchantSysNo).then(res => {
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
    let that = this
    // that.setData({
    //   buttonOpenTypeDefaultShow: true,
    //   buttonOpenTypeGetPhoneNumberShow: false,
    //   buttonOpenTypeGetUserInfoShow: false,
    // })
    let result = this.getUserInfo(res);
    that.storagePhone(res)
    if (!that.data.buttonOpenTypeGetPhoneNumberShow) {
      if (result == -1) {
        let targetUserId = this.data.targetUserId;
        wx.navigateTo({
          url: `./words/index?targetUserId=${targetUserId}`,
        })
      }
    }

  },
  // 有名片留言
  sendComments(res) {
    let targetUserId = this.data.targetUserId;
    wx.navigateTo({
      url: `./words/index?targetUserId=${targetUserId}`,
    })
  },
  // 没有名片商品详情
  goodsDetails(res) {
    let that = this
    // that.setData({
    //   buttonOpenTypeDefaultShow: true,
    //   buttonOpenTypeGetPhoneNumberShow: false,
    //   buttonOpenTypeGetUserInfoShow: false,
    // })
    let result = this.getUserInfo(res);
    that.storagePhone(res)
    if (!that.data.buttonOpenTypeGetPhoneNumberShow) {
      if (result == -1) {
        let index = res.currentTarget.dataset.index;
        wx.navigateTo({
          url: `./zone/goods/details/index?goodsId=${index}`,
        })
      }
    }


  },
  // 有名片商品详情
  addGoodsDetails(res) {
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
      // remote.getLabels(this.data.uniqueKey, this.data.targetUserId).then(res => {
      remote.getLabels(this.data.uniqueKey, this.data.targetUserId, this.data.merchantSysNo).then(res => {
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
          LablesSysNo: cur.LablesSysNo,
          MerchantSysNo: this.data.merchantSysNo  //新加的
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
    }, that.data.merchantSysNo).then(res => {
      let result = res.data.commentPointRatioList;
      if (result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          // 看到这段是不是想笑，评论只给内容，不给用户基本信息的
          // remote.getOriginWxInfo(result[i].UserSysNo).then(res => {
          remote.getOriginWxInfo(result[i].UserSysNo, that.data.merchantSysNo).then(res => {
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
    product.getProductList(this.data.targetUserId, 10, 1, "", that.data.merchantSysNo, {
      pageSize: 6,
      currentPage: 1,
      sort: "desc"
    }).then(res => {
      let result = res.data;
      // console.log(res)

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

    let desc = `${this.data.myInfo.Name || this.data.myInfo.WX ||this.data.AName}将您的名片转发到TA的朋友中了，注意联系！`;
    // this.addRecords(today(), 7, desc, 0);
    this.addRecords(today(), 7, desc, 0, this.data.merchantSysNo);
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

        // // 这是后面加的获取用户的信息的查询
        // remote.getUserInformation(that.data.uniqueKey).then(res => {
        remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
          that.setData({
            AName: res.data.Name
          })
        })

        desc = `${that.data.myInfo.Name || that.data.myInfo.WX ||that.data.AName}将您的名片转发到TA的朋友中了，注意联系！`;
        // that.addRecords(today(), 7, desc, 0);
        that.addRecords(today(), 7, desc, 0, that.data.merchantSysNo);
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

              // // 这是后面加的获取用户的信息的查询
              // remote.getUserInformation(that.data.uniqueKey).then(res => {
              remote.getUserInformation(that.data.uniqueKey, that.data.merchantSysNo).then(res => {
                that.setData({
                  AName: res.data.Name
                })
              })

              desc = `${that.data.myInfo.Name || that.data.myInfo.WX||that.data>AName}将您的名片二维码下载到手机上了，恭喜生意上门。`;
              // that.addRecords(today(), 7, desc, 0);
              that.addRecords(today(), 7, desc, 0, that.data.merchantSysNo);
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

              // // 这是后面加的获取用户的信息的查询
              // remote.getUserInformation(this.data.uniqueKey).then(res => {
              remote.getUserInformation(this.data.uniqueKey, this.data.merchantSysNo).then(res => {
                that.setData({
                  AName: res.data.Name
                })
              })

              desc = `${that.data.myInfo.Name || that.data.myInfo.WX||that.data.AName}打开现场扫码，也许在帮你推广哟！`;
              // that.addRecords(today(), 7, desc, 0);
              that.addRecords(today(), 7, desc, 0, that.data.merchantSysNo);
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
    // remote.getSelfHistory(this.data.uniqueKey, {
    remote.getSelfHistory(this.data.uniqueKey, this.data.merchantSysNo,{
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
            // 因为苹果的兼容性问题时间的"-""会产生乱排序的问题，所以要将'-',全部改变为'/'
            time = time.replace(/-/g,'/')
            // time = time.replace('-','/')
            // console.log(time)
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
        // console.log(that.data.historyList)
        let list = that.data.historyList
        for (let i = 0; i < list.length;i++){
          let url = list[i].HeadPortraitUrl.split("https://")[1]
          // console.log(url)
          if (url == 'www.xintui.xin:8058'){
            url = list[i].HeadPortraitUrl.split("www.xintui.xin:8058")[1]
            list[i].HeadPortraitUrl = list[i].HeadPortraitUrl.split("www.xintui.xin:8058")[1]
            // console.log(url)
            // console.log(list[i].HeadPortraitUrl)
          }
          that.setData({
            historyList: that.data.historyList
          })
          // url = url.substring(0, url.lastIndexOf('/'))
          // console.log(url)
        }
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
    console.log(index)
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
    // remote.getCardInfo(targetUserId).then(res => {
    remote.getCardInfo(targetUserId, that.data.merchantSysNo).then(res => {
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
        let url = result.HeadPortraitUrl.split("https://www.xintui.xin:8058")[1]
        if(url){
          let newUrl = url.split('//')[0]
          // let newUrl = url.substring(0, result.HeadPortraitUrl.lastIndexOf('//'))
          // console.log(newUrl)
          // console.log(url)
          if (newUrl == 'https:') {
            result.HeadPortraitUrl = url
          }
        }

        // console.log(result.HeadPortraitUrl)
        let newImg = result.HeadPortraitUrl.substring(0, result.HeadPortraitUrl.lastIndexOf('132'))
        if (newImg) {
          result.HeadPortraitUrl = newImg + '0'
        }
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
          let desc = `${that.data.myInfo.Name || that.data.myInfo.WX || that.data.AName}浏览了您的名片。`;
          // that.addRecords(today(), 1, desc, 0);
          that.addRecords(today(), 1, desc, 0, that.data.merchantSysNo);
          wx.hideLoading();
        })
      }
    })
  },
})