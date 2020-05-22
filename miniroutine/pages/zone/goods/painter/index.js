import Card from '../../../../utils/productPainter.js';
import remote from '../../../../service/remote.js';
import { image } from '../../../../request/index.js';
import constants from '../../../../common/constants.js';
import { today } from '../../../../utils/util.js';
import { getSystem } from '../../../../utils/util.js';
import { userSetting } from '../../../../common/version.js';
Page({
  data: {
    template: {},
    item: {},
    defualtImageWidth: 340,
    curIndex: 1,//以前是选择的0
    loading: true,
    currentSwiperIndex: 0,
    swiperHeight: 0
  },
  onLoad(options) {
    wx.showLoading({
      title: '加载中',
    })
    let detail = options['detail'];
    if (detail) {
      detail = JSON.parse(detail);
    }
    let userInfo = wx.getStorageSync(constants.USERINFO);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      userInfo: userInfo,
      uniqueKey: uniqueKey,
      detail: detail,
      loading: true
    })
  },
  back() {
    wx.navigateBack({});
  },
  onImgOK(e) {
    wx.showToast({
      title: '生成成功',
    })
    let imagePath = e.detail.path;
    let that = this;
    console.log(imagePath)
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: function () {
        wx.showToast({
          title: '保存成功',
          icon: 'none'
        })
        if (that.data.uniqueKey == that.data.detail.MerchantSysNo) {
          return;
        }

        // 从本地取企业编号然后再登录接口里传值
        let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在69引用

        remote.insertRecords({
          CustomerSubject: that.data.detail.MerchantSysNo,
          VisitTime: today(),
          NumberOfVisits: 1,
          VisitType: 15,
          ResidenceTime: 0,
          InUserSysNo: that.data.uniqueKey,
          Description: `${that.data.userInfo.Name}保存了您商品${that.data.detail.ProductName}的海报到相册。`,
          TimeSysNo: 0,
          Phone: that.data.detail.SysNo,
          MerchantSysNo:merchantSysNo
        })
      }
    })
  },
  switchTabSwiper(event) {
    let index = event.detail.current;
    this.setData({
      curIndex: index
    })
  },
  saveImage() {
    wx.showLoading({
      title: '正在生成',
    })
    let curIndex = this.data.curIndex;
    if (curIndex == 0) {
      this.setData({
        template: new Card().paletteColumn(this.data.item)
      })
    } else if (curIndex == 1) {
      this.setData({
        template: new Card().paletteFixed(this.data.item)
      })
    } else if (curIndex == 2) {
      this.setData({
        template: new Card().paletteRow(this.data.item)
      })
    }
    console.log(this.data.item,this.data.template)
  },
  onReady: function () {
    let that = this;
    let userInfo = this.data.userInfo;
    let detail = this.data.detail;
    remote.createQr(detail.SysNo, 2, {
      path: `/pages/zone/goods/details/index?goodsId=${detail.SysNo}`,
      width: 430,
      auto_color: false,
      line_color: { r: 1, g: 1, b: 1 },
      is_hyaline: false
    }).then(res => {
      let avatar = userInfo['HeadPortraitUrl'] || constants.defaultLogo;
      let name = userInfo['Name'] || '新推名片';
      let companyName = userInfo['CompanyName'] || '成都太平园信息科技有限公公司';
      let deafaultImageWidth = this.data.deafaultImageWidth;
      let that = this;
      // console.log(avatar,"图片的地址")
      let imgUrl = avatar.substr(0,1)
      if (imgUrl == '/'){
        imgUrl = 'http://app-svc.lixiantuce.com:8054' + avatar
        avatar = imgUrl
      }
      // console.log(avatar, "修改后的图片的地址")
      wx.getImageInfo({
        src: image(detail.DefaultImage),
        success: function (result) {
          let height = 340 * result.height / result.width;
          let item = {
            avatar: avatar,
            name: name,
            image: image(detail.DefaultImage),
            companyName: companyName,
            productName: detail.ProductName,
            productQuality: detail.Material,
            productModel: detail.SKUModel,
            productPrice: detail.RetailPrice,
            qrImage: image(res.data),
            imageHeight: height
          }
          wx.getImageInfo({
            src: item.image,
            success: function (res) {
              console.log(res)
              that.setData({
                swiperHeight: (285 * res.height / res.width ) + 400
              })
            }
          })
          that.setData({
            item: item,
            loading: false
          }, () => {
            wx.hideLoading();
          })
        }
      })
    })
  },
  switchtap(event) {
    let index = event.currentTarget.dataset.index;
    this.setData({
      curIndex: index
    })
  }
});