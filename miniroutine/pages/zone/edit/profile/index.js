// pages/zone/edit/profile/index.js
import constants from '../../../../common/constants.js';
import WxValidate from '../../../../utils/WxValidate.js';
import remote from '../../../../service/remote.js';
import { uploadFiles } from '../../../../service/upload.js';
import { image } from '../../../../request/index.js';
import { updateProfile } from '../../../../utils/imUtils.js';
import { userSetting, login, session, version } from '../../../../common/version.js';
const app = getApp();
Page({
  data: {
    region: [],
    showAction: false,
    groups: [
      { text: '查看大图', value: 1 },
      { text: '从相册中选择', value: 2 }
    ],
    form: {
      name: "",
      phone: "",
      school: "",
      desc: "",
      wechat: "",
      email: ""
    },
    boardHeight: 0,
    noCard: false,
    wxUserInfo: {}
  },
  onLoad: function (options) {
    app.watch('cropperImage', this.feedback);
    let noCard = options['noCard'];
    if (noCard) {
      let { avatar, name } = options;
      this.setData({
        noCard: noCard,
        avatar: avatar,
        nick: name,
        noCard: noCard
      })
    }
    this.initData();
  },
  onReady: function () {
    this.initValidate();
  },
  feedback(value) {
    this.setData({
      avatar: value
    })
  },
  onShow: function () {
    // let avatar = app.globalData['cropperImage'];
    // if (avatar) {
    //   this.setData({
    //     avatar: avatar
    //   })
    // }
  },
  onHide: function () {

  },
  onUnload: function () {

  },
  board(event) {
    this.setData({
      boardHeight: 132
    })
  },
  cancleBoard () {
    this.setData({
      boardHeight: 0
    })
  },
  back(event) {
    wx.navigateBack({});
  },
  submit(event) {
  },
  showAction(event) {
    let that = this;
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      count: 1,
      success: function (res) {
        let avatar = res.tempFilePaths[0];
        app.globalData['cropperImage'] = avatar;
        wx.navigateTo({
          url: `../../../copper/copper?path=${avatar}`,
          success: function () {
            that.setData({
              showAction: false,
              actionImage: true
            })
          }
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '未选择',
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
  showLgAvatar() {
    let that = this;
    wx.previewImage({
      urls: [that.data.avatar],
      current: that.data.avatar
    })
  },
  initData:function() {
    let noCard = this.data.noCard;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let form = this.data.form;
    let avatar = "";

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在129引用

    remote.getOriginWxInfo(uniqueKey, merchantSysNo).then(res => {
      let wxUserInfo = res.data;
      console.log(wxUserInfo , uniqueKey)
      if (noCard) {
        avatar = this.data.avatar;
        form = {
          name: this.data.nick,
          phone: "",
          school: "",
          desc: "",
          wechat: "",
          email: ""
        }
        wxUserInfo.HeadPortraitUrl = avatar;
      } else {
        avatar = wxUserInfo.HeadPortraitUrl;
        let {
          Name: name,
          Phone: phone,
          PersonalProfile: desc,
          WX: wechat,
          School: school,
          Hometown: hometown,
          Email: email
        } = wxUserInfo;
        form = {
          name: name,
          phone: phone,
          school: school,
          desc: desc,
          wechat: wechat,
          email: email
        };
        this.setData({
          wxUserInfo: wxUserInfo,
          hometown: hometown,
          uniqueKey: uniqueKey
        })
      }
      this.setData({
        avatar: image(avatar),
        form: form,
        uniqueKey: uniqueKey
      })
    })
  },
  // 初始化验证规则
  initValidate: function() {
    const rules = {
      name: {
        required: true,
        minlength: 2
      },
      phone: {
        required: true,
        minlength: 11,
        tel: true
      }
    }
    const messages = {
      name: {
        required: '请填写姓名',
        minlength: '姓名至少两个字'
      },
      phone: {
        required: '请填写手机号码',
        tel: '请正确填写手机号码'
      },
      email: {
        email: ''
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },
  formSubmit: function (e) {
    let that = this;
    wx.showLoading({
      title: '正在上传',
    })
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
    this.setData({
      loading: true
    }, () => {
      let noCard = this.data.noCard;
      if (noCard) {
        let uniqueKey = this.data.uniqueKey;

        // 从本地取企业编号然后在登录接口里传值
        let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在224引用

        this.createCard(uniqueKey, this.data.avatar, params.name, params.phone,merchantSysNo).then(res => {

          // 从本地取企业编号然后再登录接口里传值
          let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

          // remote.getCardInfo(uniqueKey).then(res => {
          remote.getCardInfo(uniqueKey, merchantSysNo).then(res => {
            wx.setStorageSync(constants.USERINFO, res.data);
            wx.showToast({
              title: '名片已创建',
              icon: 'none',
              success: function (res) {
                setTimeout(() => {
                  wx.reLaunch({
                    url: '../../../index',
                  }, 1000)
                })
              }
            })
          })
        })
      } else {
        this.updateInfo(params);
      }
    })
  },
  createCard(uniqueKey, avatar, name, phone, merchantSysNo) {
    return remote.createBusinessCard({
      HeadPortrait: avatar,
      BusinessCardName: name,
      Telephone: phone,
      SysNo: uniqueKey,
      CompanyName: '',
      MerchantSysNo: merchantSysNo//新加的
    });
  },
  updateInfo: function(form) {
    let that = this;
    let wxUserInfo = this.data.wxUserInfo;
    wxUserInfo.Name = form.name;
    wxUserInfo.Phone = form.phone;
    wxUserInfo.WX = form.wechat;
    wxUserInfo.Hometown = this.data.hometown;
    wxUserInfo.School = form.school;
    wxUserInfo.PersonalProfile = form.desc;
    wxUserInfo.Email = form.email;
    let noCard = this.data.noCard;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);

    // 从本地取企业编号然后再登录接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在278引用

    if (this.data.actionImage) {
      uploadFiles(uniqueKey, 1, [{ path: this.data.avatar }]).then(res => {
        wxUserInfo.HeadPortraitUrl = res[0].path;
        remote.updateWxUser(wxUserInfo).then(res => {
          wx.setStorageSync(constants.WX_USER_INFO, wxUserInfo);

          // remote.getCardInfo(uniqueKey).then(res => {
          remote.getCardInfo(uniqueKey, merchantSysNo).then(res => {
            wx.setStorageSync(constants.USERINFO, res.data);
            wx.showToast({
              title: '保存成功',
              icon: 'none',
              success: function () {
                that.setData({
                  loading: false
                })
                if (noCard) {
                  wx.reLaunch({
                    url: '../../../index',
                  })
                } else {
                  updateProfile();
                  wx.navigateBack({});
                }
              }
            })
          })
        })
      })
    } else {
      remote.updateWxUser(wxUserInfo).then(res => {
        // 从本地取企业编号然后再登录接口里传值
        let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

        // remote.getCardInfo(this.data.uniqueKey).then(res => {
        remote.getCardInfo(this.data.uniqueKey, merchantSysNo).then(res => {
          wx.setStorageSync(constants.USERINFO, res.data);
          wx.showToast({
            title: '保存成功',
            icon: 'none',
            success: function () {
              that.setData({
                loading: false
              })
              if (noCard) {
                wx.reLaunch({
                  url: '../../../index',
                })
              } else {
                updateProfile();
                wx.navigateBack({});
              }
            }
          })
        })
      })
    }
  },
  bindRegionChange: function (event) {
    let hometown = event.detail.value;
    this.setData({
      hometown: hometown[0] + " " + hometown[1] + " " + hometown[2]
    })
  },
  getPhoneNumber(res) {
    let sessionData = res
    let that = this
    let userInfo = that.data.wxUserInfo
    if (res.detail.errMsg.split(':')[1] == 'ok') {
      that.checkSession(sessionData).then(res => {
        let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);

        // 从本地取企业编号然后在接口里传值
        let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在144引用

        remote.getPhone(res.encryptedData, res.iV, uniqueKey, merchantSysNo).then(res => {
          let phone = JSON.parse(res.data).purePhoneNumber;
          let form = that.data.form;
          form.phone = phone;
          that.setData({
            form: form
          })
        })
      })
    } else {
      wx.showToast({
        title: '未授权',
        icon: 'none'
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
          // 这是以前的代码
          // let userInfo = that.data.wxUserInfo
          // login(userInfo).then(res => {
          //   remote.login(res).then(res => {
          //     resolve(res.data)
          //   })
          // })
          let userInfo = that.data.wxUserInfo
          // 从本地取企业编号然后再登录接口里传值
          let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)
          userInfo.MerchantSysNo = merchantSysNo
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