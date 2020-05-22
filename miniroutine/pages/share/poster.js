import Card from '../../utils/productPainter.js';
import remote from '../../service/remote.js';
import { image } from '../../request/index.js';
import constants from '../../common/constants.js';
import { today } from '../../utils/util.js';
Page({
  data: {
    details: {}
  },
  onLoad: function (options) {
    let info = options.details;
    let targetId = options.targetId;
    if (info && targetId) {
      this.setData({
        details: JSON.parse(info),
        targetId: targetId
      })
    }
  },
  reset() {
    let item = this.data.item;
    let info = this.data.details;
    item.name = info.Name;
    item.companyName = info.CompanyName;
    item.avatar = info.HeadPortraitUrl;
    this.setData({
      item: item
    })
  },
  choosePic() {
    let item = this.data.item;
    let that = this;
    wx.chooseImage({
      count: 1,
      success: function(res) {
        item.avatar = res.tempFilePaths[0];
        that.setData({
          item: item
        })
      },
    })
  },
  back() {
    wx.navigateBack({});
  },
  onImgOK(e) {
    let that = this;
    wx.hideLoading();
    let imagePath = e.detail.path;
    this.setData({
      image: imagePath
    })
    // console.log(imagePath)
    wx.saveImageToPhotosAlbum({
      filePath: imagePath,
      success: function () {
        wx.showToast({
          title: '保存成功',
          icon: 'none',
          success: function () {
            that.setData({
              disabled: false
            })
          }
        })
      }
    });
  },

  saveImage() {
    wx.showLoading({
      title: '正在生成',
    })
    let that = this;
    let item = this.data.item;
    wx.getImageInfo({
      src: item.avatar,
      success: function(res) {
        let w = res.width;
        let h = res.height;
        let defaultWidth = 343;
        item['imageHeight'] = defaultWidth * h / w;
        that.setData({
          disabled: true,
          template: new Card().callingcard(item)
        })
      }
    })
  },
  inputTitle(event) {
    let item = this.data.item;
    item.name = event.detail.value;
    this.setData({
      item: item
    })
  },
  inputDesc(event) {
    let item = this.data.item;
    item.companyName = event.detail.value;
    this.setData({
      item: item
    })
  },
  onReady: function () {
    let that = this;
    let userInfo = this.data.details;
    console.log(that.data.targetId)
    remote.createQr(this.data.targetId, 1, {
      path: `/pages/index?targetId=${that.data.targetId}`,
      width: 430,
      auto_color: false,
      line_color: { r: 1, g: 1, b: 1 },
      is_hyaline: false
    }).then(res => {
      let avatar = userInfo['HeadPortraitUrl'] || constants.defaultLogo;
      let name = userInfo['Name'] || '新推名片';
      let companyName = userInfo['CompanyName'] || '';
      let item = {
        avatar: avatar,
        name: name,
        companyName: companyName,
        qrImage: image(res.data)
      }
      that.setData({
        item: item
      });
    })
  },
})