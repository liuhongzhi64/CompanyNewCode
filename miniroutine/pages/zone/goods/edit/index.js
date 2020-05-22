import product from '../../../../service/product.js';
import { uploadFiles } from '../../../../service/upload.js';
import constants from '../../../../common/constants.js';
import WxValidate from '../../../../utils/WxValidate.js';
import { image } from '../../../../request/index.js';
import remote from '../../../../service/remote.js';
const app = getApp();
Page({
  data: {
    title: '新增商品',
    size: 3,
    pageMetaScrollTop: 0,
    scrollTop: 0,
    form: {
      productName: '',
      productPrice: 0,
      productModel: '',
      productQuality: '',
      productDescription: ''
    },
    images: [],
    swipers: [],
    videoSrc: '',
    maxSize: 20971520
  },
  sortEnd(e) {
    let id = e.currentTarget.id;
    let images = this.data.images;
    let swipers = this.data.swipers;
    this.setData({
      images: id == 'drag' ? e.detail.listData : images,
      swipers: id == 'drag' ? swipers : e.detail.listData
    }, () => {
      this.drag.init();
      this.drag2.init();
    });
    
  },
  change(e) {
  },
  sizeChange(e) {
    wx.pageScrollTo({ scrollTop: 0 })
    this.setData({
      size: e.detail.value
    });
    this.drag.init();
  },
  itemClick(e) {
    let id = e.currentTarget.id;
  },
  scroll(e) {
    this.setData({
      pageMetaScrollTop: e.detail.scrollTop
    })
  },
  // 页面滚动
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    });
  },
  onLoad(options) {
    app.watch('images',this.feedback);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey
    })
    let haveItem = this.parseData(options);
    this.drag = this.selectComponent('#drag');
    this.drag2 = this.selectComponent('#drag2');
    this.drag.init();
    this.drag2.init();
  },
  parseData(options) {
    if (!options.item) {
      return false;
    }
    let item = JSON.parse(options.item);
    if (item) {
      let form = this.data.form;
      let {
        Description: productDescription,
        Material: productQuality,
        ProductName: productName,
        SKUModel: productModel,
        RetailPrice: productPrice
      } = item;
      form.productDescription = productDescription;
      form.productModel = productModel;
      form.productName = productName;
      form.productPrice = productPrice;
      form.productQuality = productQuality;
      let videoSrc = image(item.VideoImage);
      let images = [], swipers = [];
      let origin = item.DefaultImageList;
      for (let i = 0, len = origin.length; i < len; i++) {
        let temp = {
          dragId: i,
          description: origin[i].ImageTips,
          path: image(origin[i].ImagePath),
          fixed: false,
          rank: origin[i].Priority,
          sysno: origin[i].SysNo,
          shift: Number(origin[i].ShufflingfigureType)
        }
        if (origin[i].ShufflingfigureType == 1) {
          swipers.push(temp);
        } else {
          images.push(temp);
        }
      }
      this.setData({
        form: form,
        images: images,
        swipers: swipers,
        videoSrc: videoSrc,
        item: item
      })
      return true;
    } else {
      return false;
    }
  },
  feedback(value) {
    this.setData({
      images: value
    })
    this.drag.init();
  },
  back() {
    wx.navigateBack({});
  },
  addText() {
    app.globalData.images = this.data.images;
    wx.navigateTo({
      url: './text',
    })
  },
  onReady() {
    const rules = {
      productName: {
        required: true,
        minlength: 2
      },
      productPrice: {
        required: true,
        minlength: 1,
        number: true
      },
      productModel: {
        required: true,
        minlenggth: 2
      },
      productQuality: {
        required: true,
        minlength: 2
      },
      productDescription: {
        // required: true,
        minlength: 10
      }
    };
    let messages = {
      productName: {
        required: '请填写商品名',
        minlength: '商品名最短两个字'
      },
      produtPrice: {
        required: '请填写价格',
        minlength: '价格最短一个字'
      },
      productModel: {
        required: '请填写型号',
        minlength: '型号最短两个字'
      },
      productQuality: {
        required: '请填写材质',
        minlength: '材质最短两个字'
      },
      // productDescription: {
      //   required: '请填写卖点',
      //   minlength: '卖点最短10个字'
      // }
    };
    this.WxValidate = new WxValidate(rules, messages);
  },
  chooseVideo(event) {
    let maxSize = this.data.maxSize;
    let that = this;
    wx.chooseVideo({
      // maxDuration: "120",//以前的代码
      maxDuration: 60,
      success(res) {
        if (res.size > maxSize) {
          wx.showToast({
            title: '超出大小',
            icon: 'none'
          })
        } else {
          that.setData({
            videoSrc: res.tempFilePath
          })
        }
      },
      fail(err) {
        wx.showToast({
          title: '未选择视频',
          icon: 'none'
        })
      }
    })
  },
  chooseImage(event) {
    let target = event.currentTarget.dataset.target;
    let images = this.data.images;
    let swipers = this.data.swipers;
    let imagesLimit = 9,swipersLimit = 5;
    let that = this;
    wx.chooseImage({
      count: target == 0 ? imagesLimit - images.length : swipersLimit - swipers.length,
      success: function(res) {
        let tempFilePaths = res.tempFilePaths.map((item, index) => {
          return {
            dragId: target == 0 ? images.length + index : swipers.length + index,
            fixed: false,
            rank: 0,
            shift: Number(target),
            description: '',
            path: item,
          }
        })
        that.setData({
          images: target == 0 ? images.concat(tempFilePaths) : images,
          swipers: target == 0 ? swipers : swipers.concat(tempFilePaths)
        }, () => {
          that.drag.init();
          that.drag2.init();
        })
      },
    })
  },
  saveOrupdate(e) {
    wx.showLoading({
      title: '正在上传',
    })
    const params = e.detail.value
    console.log(e)
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
      return false
    }
    let uniqueKey = this.data.uniqueKey;
    let images = (this.data.images).concat(this.data.swipers);
    let videoSrc = this.data.videoSrc;
    let that = this;
    let temp = [];
    // 上传图片
    that.uplaodImage(uniqueKey, 2, images).then(result => {
     if (result) {
       for (let i = 0; i < result.length; i++) {
         temp.push({
           ImagePath: result[i].path,
           ImageTips: result[i].description,
           Priority: result[i].rank,
           ShufflingfigureType: Number(result[i].shift),
           index: i,
         })
       }
     }
     // 上传视频
      that.uplaodImage(uniqueKey, 4, [{ path: videoSrc, sysno: 0, dragId: 0 }]).then(videoResult => {
       if (videoResult) {
         videoSrc = videoResult[0].path
       }
        let data = that.reverseData(params, temp.length > 0 ? temp : images, videoSrc);
       if (data[0]['SysNo']) {
         // 更新
         product.updateProduct(data).then(res => {
           wx.showToast({
             title: '上传完成',
             success: function (res) {
               let setTime = setTimeout((callback) => {
                 wx.navigateBack({});
                 callback();
               }, 800, () => {
                 clearTimeout(setTime);
               })
             }
           })
         })
       } else {
          console.log(data)
         product.insertProduct(data).then(res => {
           wx.showToast({
             title: '上传完成',
             success: function (res) {
               let setTime = setTimeout((callback) => {
                 wx.navigateBack({});
                 callback();
               }, 800, () => {
                 clearTimeout(setTime);
               })
             }
           })
         })
       }
     })
   });
  },
  // 上传文件
  uplaodImage(uniqueKey, type, array) {
    let promise = new Promise((resolve, reject) => {
    if (array == null || array.length == 0) {
      resolve(false);
      return;
    }
    let temp = [];
    for (let i = 0; i < array.length; i++) {
      array[i].rank = i;
      array[i].dragId = i;
      // 判断是否是原本有的图
      if (array[i].path.indexOf('xintui') == -1) {
        temp.push(array[i]);
      }
    }
    if (temp.length == 0) {
      resolve(false)
    } else {
      uploadFiles(uniqueKey, type, temp).then(res => {
        for (let i = 0; i < res.length; i++) {
          if (res[i] != undefined) {
            array[res[i].dragId] = res[i]
          }
        }
        resolve(array);
      })
    }
      
    })
    return promise;
  },
  reverseData(form, images, videoSrc) {
    let item = this.data.item;
    let temp = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        temp.push({
          ImagePath: images[i].path || images[i].ImagePath,
          ImageTips: images[i].description || images[i].ImageTips,
          Priority: images[i].rank || images[i].Priority,
          ShufflingfigureType: Number(images[i].shift) || images[i].ShufflingfigureType,
          index: i,
        })
      }
    }
    // 从本地取企业编号然后在接口里传值
    let configurationSysNo = wx.getStorageSync(constants.MerchantSysNo)
    let data =  [{
      DefaultImage: temp[0]['ImagePath'] || temp[0]['path'],
      DefaultImageList: temp,
      Description: form.productDescription,
      InUserSysNo: this.data.uniqueKey,
      IsDisplayWebsite: item ? item.IsDisplayWebsite : 1,
      Material: form.productQuality,
      MerchantSysNo: this.data.uniqueKey,
      Priority: 0,
      ProductName: form.productName,
      ProductStatus: 10,
      ProductType: 1,
      RetailPrice: form.productPrice,
      SKUModel: form.productModel,
      ShowPrice: 1,
      VideoImage: videoSrc,
      ConfigurationSysNo: configurationSysNo
    }];
    if (item) {
      data[0]['SysNo'] = item.SysNo
    }
    return data;
  }
})