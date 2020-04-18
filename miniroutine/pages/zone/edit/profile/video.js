// pages/zone/edit/profile/pic.js
import constants from '../../../../common/constants.js';
import { uploadFiles } from '../../../../service/upload.js';
import { image } from '../../../../request/index.js';
import remote from '../../../../service/remote.js';
import WxValidate from '../../../../utils/WxValidate.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAction: false,
    groups: [
      { text: '从相册中选择', value: 1 }
    ],
    form: {
      username: '',
      userTelephone: ''
    },
    count: 0,
    cur: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
    this.initValidate();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  back(event) {
    wx.navigateBack({});
  },
  loadVideo() {
    let count = this.data.count;
    let cur = this.data.cur;
    if (cur == count) {
      this.setData({
        translentAnimation: false
      })
    } else {
      cur += 1;
      this.setData({
        cur: cur
      })
    }
  },
  /**
 * update
 * CoustomerSysNo: 156
Description: ""
EditUserSysNo: 156
MediaType: 3
Priority: 0
SysNo: 763
Url: "https://www.xintui.xin:8058/xintui/156/myimage/2536227d-0.jpg"
 */
  initData() {
    let that = this;
    that.setData({
      translentAnimation: true
    })
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    if (uniqueKey) {
      remote.getMedia(uniqueKey, 4).then(res => {
        let cur = res.data;
        that.sort(cur);
        let temp = [];
        for (let i = 0; i < cur.length; i++) {
          cur[i].Url = image(cur[i].Url);
          temp.push({
            CoustomerSysNo: cur[i].CoustomerSysNo,
            Description: cur[i].Description,
            EditUserSysNo: cur[i].EditUserSysNo,
            MediaType: cur[i].MediaType,
            Priority: cur[i].Priority,
            SysNo: cur[i].SysNo,
            Url: cur[i].Url
          })
        }
        that.checkPicCountAvalibale(uniqueKey);
        that.setData({
          picList: temp,
          uniqueKey: uniqueKey,
          count: temp.length - 1
        })
      })

    }
  },
  sort(array) {
    if (array && array.length > 0) {
      for (let i = 0; i < array.length; i++) {
        for (let j = i; j > 0 && array[j].Priority < array[j - 1].Priority; j--) {
          let temp = array[j];
          array[j] = array[j - 1];
          array[j - 1] = temp;
        }
      }
    }
  },
  checkPicCountAvalibale(id) {
    let that = this;
    remote.getUserPackage(id).then(res => {
      that.setData({
        imageAvalible: res.data.VideoNumber - that.data.picList.length > 0 ? res.data.VideoNumber - that.data.picList.length : 0
      })
    })
  },
  actiontapClick(event) {
    let imageAvalible = this.data.imageAvalible;
    if (imageAvalible > 0) {
      this.index = event.currentTarget.dataset.index;
      this.setData({
        showAction: true
      })
    } else {
      this.setData({
        show: true
      })
    }
    
  },
  chooseImage(event) {
    let that = this;
    let index = this.index;
    let imageAvalible = that.data.imageAvalible;
    let picList = that.data.picList;
    wx.chooseVideo({
      sourceType: ['album', 'camera'],
      success: function (res) {
        if (res.size > 12582912) {
          wx.showToast({
            title: '超出大小',
            icon: 'none'
          })
        } else {
          let paths = [];
          paths.push(res.tempFilePath);
          let temp = that.insertImageToArray(paths, index, picList);
          that.setData({
            picList: temp,
            showAction: false,
            imageAvalible: imageAvalible - 1
          })
        }
      },
      fail: function (err) {
        wx.showToast({
          title: '拍照失败',
          icon: 'none',
          success: function () {
            that.setData({
              showAction: false
            })
          }
        })
      }
    })
  },

  /**
   * create
   * CoustomerSysNo: 156
Description: ""
InUserSysNo: 156
MediaType: 3
Priority: 5
Url: "/xintui/156/myimage/a17e79d1-a.jpg"
   */
  insertImageToArray(paths, index, picList) {
    let uniqueKey = this.data.uniqueKey;
    let cur = []; // 临时数组
    if (paths && paths.length > 0) {
      for (let i = 0; i < picList.length; i++) {
        if (i == index) {
          for (let j = 0; j < paths.length; j++) {
            cur.push({
              MediaType: 4,
              Url: paths[j],
              Description: '',
              Priority: 0,
              CoustomerSysNo: uniqueKey,
              InUserSysNo: uniqueKey
            });
          }
        }
        cur.push(picList[i]);
      }
      if (index == -1) {
        for (let j = 0; j < paths.length; j++) {
          cur.push({
            MediaType: 4,
            Url: paths[j],
            Description: '',
            Priority: 0,
            CoustomerSysNo: uniqueKey,
            InUserSysNo: uniqueKey
          });
        }
      }
      return cur;
    } else {
      return picList;
    }
  },
  // 暂时先这样做，后期改为form表单的形式，这样可以不这么频繁的setData，避免性能较差的手机出现闪动的问题
  inputDescription(event) {
    let index = event.currentTarget.dataset.index;
    let value = event.detail.value;
    let picList = this.data.picList;
    picList[index].Description = value;
    this.setData({
      picList: picList
    })
  },
  splitNeedUpdatedItems(picList) {
    // 不需要上传的item有EditCustomer字段
    let temp = [[], [], []];
    if (picList && picList.length > 0) {
      for (let i = 0; i < picList.length; i++) {
        if (picList[i]['deleted'] && picList[i]['SysNo']) {
          //  删除照片 2
          temp[2].push({
            SysNo: picList[i].SysNo
          });
        } else {
          picList[i].Priority = i;
          if (picList[i]['InUserSysNo']) {
            // 上传数组
            temp[0].push(picList[i]);
          } else {
            temp[1].push(picList[i]);
          }
        }
      }
    }
    return temp;
  },
  deleteIndexImage(event) {
    let index = event.currentTarget.dataset.index;
    let imageAvalible = this.data.imageAvalible;
    let picList = this.data.picList;
    picList[index]['deleted'] = true;
    this.setData({
      picList: picList,
      imageAvalible: imageAvalible + 1
    })
  },
  upperPosition(event) {
    let index = event.currentTarget.dataset.index;
    let picList = this.data.picList;
    let temp = picList[index];
    picList[index] = picList[index - 1];
    picList[index - 1] = temp;
    this.setData({
      picList: picList
    })
  },
  lowerPosition(event) {
    let index = event.currentTarget.dataset.index;
    let picList = this.data.picList;
    let temp = picList[index];
    picList[index] = picList[index + 1];
    picList[index + 1] = temp;
    this.setData({
      picList: picList
    })
  },
  submit() {
    let picList = this.data.picList;
    let uniqueKey = this.data.uniqueKey;
    wx.showLoading({
      title: '正在上传',
    })
    let temp = this.splitNeedUpdatedItems(picList);
    new Promise((resolve, reject) => {
      if (temp[0].length > 0) {
        // 上传图片
        uploadFiles(uniqueKey, 4, temp[0]).then(res => {
          remote.createImages(temp[0]).then(res => {
            resolve(() => {
              wx.showToast({
                title: '上传成功',
              })
            })
          })
        })
      }
      if (temp[1].length > 0) {
        // 修改我的照片内容
        remote.updateImages(temp[1]).then(res => {
          resolve(() => {
            wx.showToast({
              title: '上传成功',
              icon: 'none'
            })
          })
        })
      }
      if (temp[2].length > 0) {
        // 删除
        remote.deleteImages(temp[2]).then(res => {
          resolve(() => {
            wx.showToast({
              title: '上传成功',
            })
          })
        })
      }
    }).then(res => {
      res();
      wx.navigateBack({});
    })
  },
  showRegister() {
    this.setData({
      show: true
    })
  },
  // 初始化验证规则
  initValidate: function () {
    const rules = {
      username: {
        required: true,
        minlength: 2
      },
      userTelephone: {
        required: true,
        minlength: 11,
        tel: true
      }
    }
    const messages = {
      username: {
        required: '请填写姓名',
        minlength: '姓名至少两个字'
      },
      userTelephone: {
        required: '请填写手机号码',
        tel: '请正确填写手机号码'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },
  formSubmit: function (e) {
    let uniqueKey = this.data.uniqueKey;
    const params = e.detail.value
    //校验表单
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
      return false
    }
    let that = this;
    remote.insertRelationship({
      Name: params.username,
      UserTelPhone: params.userTelephone,
      Status: 0,
      Type: 2,
      VipTelPhone: "",
      InUserSysNo: uniqueKey
    }).then(res => {
      if (res.success) {
        wx.showToast({
          title: '申请成功',
          icon: 'none',
          success() {
            let timeSet = setTimeout((callback) => {
              that.setData({
                show: false
              })
              callback()
            }, 1000, () => {
              clearTimeout(timeSet)
            })
          }
        })
      }
    })
  },
  callmeMaybe() {
    let that = this;
    wx.makePhoneCall({
      phoneNumber: constants.SERVICE_PHONE,
      success: function () {
        that.setData({
          show: false
        })
      }
    })
  },
  cancleSalerToast() {
    this.setData({
      show: false
    })
  },
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
  }
})