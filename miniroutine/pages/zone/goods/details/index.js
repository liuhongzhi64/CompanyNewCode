import product from '../../../../service/product.js';
import { image } from '../../../../request/index.js';
import constants from '../../../../common/constants.js';
import { userSetting } from '../../../../common/version.js';
import remote from '../../../../service/remote.js';
import { today } from '../../../../utils/util.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dotStyle: true,
    cardCur: 0,
    goodsId: 1402095,
    swipers: [],
    images: [],
    video: '',
    info: {},
    count: 0,
    cur: 0,
    autoHeight: 0,
    AName: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let goodsId = options.goodsId;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let userInfo = wx.getStorageSync(constants.USERINFO);
    this.setData({
      goodsId: goodsId,
      uniqueKey: uniqueKey,
      userInfo: userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initData();
  },
  onShareAppMessage: function () {
    let unique = this.data.uniqueKey;

    // 从本地取企业编号在登录接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在66、58引用

    if (unique) {
      console.log(unique)
      // // 这是后面加的获取用户的信息的查询
      remote.getUserInformation(unique, merchantSysNo).then(res => {
        // console.log(res.data.Name)
        this.setData({
          AName: res.data.Name
        })
        console.log(this.data.AName)
        let desc = `${this.data.userInfo.Name || this.data.AName}分享了您的商品${this.data.info.ProductName}，快去看看吧！`;
        // this.addRecords(15, this.data.goodsId, desc);
        this.addRecords(15, this.data.goodsId, desc, merchantSysNo);
      })
      // console.log(this.data.AName)

      // let desc = `${this.data.userInfo.Name||this.data.AName}分享了您的商品${this.data.info.ProductName}，快去看看吧！`;
      // this.addRecords(15, this.data.goodsId, desc);
    }
    return {
      title: `${this.data.info.ProductName}`,
      desc: `${this.data.info.ProductName},材质:${this.data.info.Material},风格: ${this.data.info.SKUModel}`,
      path: `/pages/zone/goods/details/index?goodsId=${this.data.goodsId}`
    };
  },
  autoHeight(event) {
    let autoHeight = this.data.autoHeight;
    const screenWidth = wx.getSystemInfoSync().windowWidth;
    const imageHeight = event.detail.height;
    const imageWidth = event.detail.width;
    const swiperHeight = (screenWidth * imageHeight / imageWidth) > autoHeight ? (screenWidth * imageHeight / imageWidth) : autoHeight;
    this.setData({
      autoHeight: swiperHeight
    })
  },
  navigateToEdit() {
    let info = JSON.stringify(this.data.info);
    wx.navigateTo({
      url: `../edit/index?item=${info }`,
    })
  },
  back(event) {
    let page = getCurrentPages();
    if (page.length <= 1) {
      let info = this.data.info;
      let targetUserId = info.MerchantSysNo;
      wx.redirectTo({
        url: `../../../index?targetKey=${targetUserId}`,
      })
    } else {
      wx.navigateBack({});
    }
  },
  cardSwiper(e) {
    let cardCur = e.detail.current;
    this.setData({
      cardCur: cardCur
    })
  },
  initData() {
    this.setData({
      loading: true
    })
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let configurationSysNo = wx.getStorageSync(constants.MerchantSysNo)

    product.getDetail(this.data.goodsId, configurationSysNo).then(res => {
      if (res.ProductStatus == 20 && uniqueKey != res.MerchantSysNo) {
        wx.showToast({
          title: '产品已下架',
          icon: 'none',
          success: function () {
            let setTime = setTimeout((callback) => {
              wx.redirectTo({
                url: `../../../index?targetKey=${res.MerchantSysNo}`,
                success: function() {
                  callback();
                }
              })
            }, 1000, () => {
              wx.hideLoading();
              clearTimeout(setTime);
            })
          }
        })
        return;
      }
      let images = res.data.DefaultImageList;
      let video = image(res.data.VideoImage);
      let swipers = [], detailImage = [], details = [];
      for (let i = 0; i < images.length; i++) {
        if (images[i].ShufflingfigureType == 1) {
          swipers.push(image(images[i].ImagePath));
        } else {
          details.push(image(images[i].ImagePath));
          detailImage.push({
            path: image(image(images[i].ImagePath)),
            desc: images[i].ImageTips
          })
        }
      }
      that.setData({
        info: res.data,
        swipers: swipers,
        images: detailImage,
        video: video,
        count: images.length - 1,
        details: details,
        loading: false
      }, () => {
        if (that.data.uniqueKey) {

          // 从本地取企业编号然后再登录接口里传值
          let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在175、168引用

          // // 这是后面加的获取用户的信息的查询
          remote.getUserInformation(that.data.uniqueKey, merchantSysNo).then(res => {
            // console.log(res.data.Name)
            this.setData({
              AName: res.data.Name
            })
            let desc = `${that.data.userInfo.Name || that.data.userInfo.WX || that.data.AName}浏览了您的商品<${that.data.info.ProductName}>,他可能对您很感兴趣，快去看看他吧！`;
            // that.addRecords(2, that.data.goodsId, desc);
            that.addRecords(2, that.data.goodsId, desc, merchantSysNo);
          })  
            
          // let desc = `${that.data.userInfo.Name || that.data.userInfo.WX}浏览了您的商品<${that.data.info.ProductName}>,他可能对您很感兴趣，快去看看他吧！`;
          // that.addRecords(2, that.data.goodsId, desc);
        }
        wx.hideLoading();
      })
    })
  },
  previewSwiper() {
    let cardCur = this.data.cardCur;
    let swipers = this.data.swipers;
    wx.previewImage({
      urls: swipers,
      current: swipers[cardCur]
    })
  },
  previewDetails(event) {
    let index = event.currentTarget.dataset.index;
    let details = this.data.details;
    wx.previewImage({
      urls: details,
      current: details[index]
    })
  },
  share(res) {
    let userInfoWechat = res;
    let that = this;
    if (this.data.uniqueKey == -1) {
      // 用户授权
      userSetting('scope.userInfo', true).then(res => {
        // 微信登录
        login(res.userInfo).then(res => {
          let avatar = res.HeadPortraitUrl,
            name = res.WX;

          // 从本地取企业编号然后在登录接口里传值
          let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在480引用
          res.MerchantSysNo = merchantSysNo//新加需求，要添加企业编号

          // 后台登录
          remote.login(res).then(res => {
            wx.setStorageSync(constants.UNIQUE_KEY, res.data);
            let uniqueKey = res.data
            let app = getApp();
            app.globalData.uniqueKey = uniqueKey;
            // 验证用户是否有名片

            // 从本地取企业编号然后再登录接口里传值
            let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
            res.data.merchantSysNo = merchantSysNo

            remote.checkCard(res.data).then(res => {
              if (res.success) {
                that.remotegetInfo(uniqueKey);
              } else {
                let iscreated = that.data.iscreated;
                if (!iscreated) {
                  that.createCard(uniqueKey, avatar, name).then(res => {
                    if (res.success) {
                      wx.showToast({
                        title: '登录成功',
                        icon: 'none'
                      })
                    }
                  });
                }
              }
            })
          })
        })
      }).catch(err => {
      })
    } else {
      let detail = JSON.stringify(this.data.info);
      wx.navigateTo({
        url: `../painter/index?detail=${detail}`,
      })
    }
  },
  addRecords(type, sysno, desc, merchantSysNo) {
    if (this.data.uniqueKey == this.data.info.MerchantSysNo) {
      return ;
    }
    remote.insertRecords({
      CustomerSubject: this.data.info.MerchantSysNo,
      VisitTime: today(),
      NumberOfVisits: 1,
      VisitType: type,
      ResidenceTime: 0,
      InUserSysNo: this.data.uniqueKey,
      Description: desc,
      TimeSysNo: sysno,
      Phone: 0,
      MerchantSysNo: merchantSysNo//新加的
    })
  }
})