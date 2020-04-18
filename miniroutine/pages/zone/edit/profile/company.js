// pages/zone/edit/profile/company.js
import constants from '../../../../common/constants.js';
import WxValidate from '../../../../utils/WxValidate.js';
import remote from '../../../../service/remote.js';
import { userSetting } from '../../../../common/version.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: [],
    form: {
      company: '',
      address: '',
      desc: ''
    },
    categoriesArray: [],
    multiIndex: [0, 0],
    positionList: [],
    positionLastLevel: [],
    multiIndex2: [0, 0]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
    this.initPositions();
    this.initCompanyCategory();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initValidate();
  },
  inputAddress(event) {
    let value = event.detail.value;
    let data = this.data.renderData;
    data.Address = value;
    this.setData({
      renderData: data
    })
  },
  locationSet() {
    let data = this.data.renderData;
    let _this = this
    let form = _this.data.form;
    let area = data.ProvinceName + data.CityName + data.DistrictName;
    let address = data.Address;
    if (area && address) {
      app.globalData.qqMapSDK.geocoder({
        address: area + address,
        success: (res) => {
          let location = res.result.location;
          wx.authorize({
            scope: "scope.userLocation",
            success: function (res) {
              wx.chooseLocation({
                latitude: location.lat,
                longitude: location.lng,
                success: function (res) {
                  data.Latitude = res.latitude;
                  data.Longitude = res.longitude;
                  _this.setData({
                    renderData: data
                  })
                }
              })
            }
          })
        },
        fail(err) {
          if (err.status == 310) {
           wx.showToast({
             title: '定位失败',
             icon: 'none'
           })
          }
        }
      })
    } else {
      wx.showToast({
        title: '请选择/填写地址',
        icon: 'none'
      })
    }
  },
  initData() {
    let that =this;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    // 获取公司信息
    remote.getCompanyInfo(uniqueKey).then(res => {
      let region = that.data.region;
      let info = res.data;
      let form = that.data.form;
      if (info != null) {
        region[0] = info.ProvinceName;
        region[1] = info.CityName;
        region[2] = info.DistrictName;
        form.company = info.CompanyName;
        form.address = info.Address;
        form.desc = info.CompanyProfile;
        form.industryTypeName = info.IndustryTypeName;
        form.positionName = info.PositionName;
      }
      that.setData({
        region: region,
        renderData: info,
        uniqueKey: uniqueKey,
        form: form
      })
    });
  },
  initCompanyCategory() {
    let categoriesArray = []
    let _this = this
    remote.getCompanyCategory().then(res => {
      let firstLevel = []
      let result = res.data;
      let lastLevel = []
      for (let index = 0; index < result.length; index++) {
        firstLevel.push({
          id: result[index].SysNo,
          value: result[index].IndustryTypeName
        })
        let item = []
        let resultItems = result[index].IndustryTypeChildList
        for (let inner = 0; inner < resultItems.length; inner++) {
          item.push({
            id: resultItems[inner].SysNo,
            value: resultItems[inner].IndustryTypeChildName
          })
        }
        lastLevel.push(item)
      }
      categoriesArray.push(firstLevel)
      categoriesArray.push(lastLevel[0])
      _this.setData({
        categoriesArray: categoriesArray,
        lastLevel: lastLevel
      })
    })
  },
  initPositions() {
    let _this = this
    let positionList = []
    remote.getPositions().then(res => {
      let list = res.data;
      let firstLevel = []
      let lastLevel = []
      for (let index = 0; index < list.length; index++) {
        firstLevel.push({
          id: list[index].SysNo,
          value: list[index].PositionName
        })
        let item = []
        let resultItems = list[index].PositionChildList
        for (let inner = 0; inner < resultItems.length; inner++) {
          item.push({
            id: resultItems[inner].SysNo,
            value: resultItems[inner].PositionChildName
          })
        }
        lastLevel.push(item)
      }
      positionList.push(firstLevel)
      positionList.push(lastLevel[0])
      _this.setData({
        positionList: positionList,
        positionLastLevel: lastLevel
      })
    })
  },
  bindMultiPickerColumnChange2(event) {
    let data = {
      categoriesArray: this.data.categoriesArray,
      multiIndex: this.data.multiIndex
    }
    data.multiIndex[event.detail.column] = event.detail.value
    let column = event.detail.column
    let value = event.detail.value
    let lastLevel = this.data.lastLevel
    if (column == 1) {
      data.multiIndex[1] = value
    } else {
      data.categoriesArray[1] = lastLevel[value]
      data.multiIndex[1] = 0
    }
    this.setData(data)
  },
  bindRegionChange(event) {
    let region = this.data.region
    region = event.detail.value
    let info = this.data.renderData
    info.ProvinceName = region[0]
    info.CityName = region[1]
    info.DistrictName = region[2]
    this.setData({
      region: region,
      renderData: info
    })
  },
  bindMultiPickerChange2: function (e) {
    let lastLevel = this.data.lastLevel
    let currentIndex = e.detail.value
    let renderData = this.data.renderData
    renderData.IndustryTypeName = lastLevel[currentIndex[0]][currentIndex[1]].value
    renderData.IndustrySysNo = lastLevel[currentIndex[0]][currentIndex[1]].id
    this.setData({
      renderData: renderData
    })
  },
  bindMultiPickerChange1(event) {
    let positionLastLevel = this.data.positionLastLevel
    let currentIndex = event.detail.value
    let renderData = this.data.renderData
    renderData.positionName = positionLastLevel[currentIndex[0]][currentIndex[1]].value
    renderData.PositionSysNo = positionLastLevel[currentIndex[0]][currentIndex[1]].id
    this.setData({
      renderData: renderData
    })
  },
  bindMultiPickerColumnChange1(event) {
    let data = {
      positionList: this.data.positionList,
      multiIndex2: this.data.multiIndex2
    }
    data.multiIndex2[event.detail.column] = event.detail.value
    let column = event.detail.column
    let value = event.detail.value
    let lastLevel = this.data.positionLastLevel
    if (column == 1) {
      data.multiIndex2[1] = value
    } else {
      data.positionList[1] = lastLevel[value]
      data.multiIndex2[1] = 0
    }
    this.setData(data)
  },
  // 初始化验证规则
  initValidate: function () {
    const rules = {
      company: {
        required: true,
        minlength: 2
      },
      address: {
        required: true,
        minlength: 1,
      },
      industryTypeName: {
        required: true,
        minlength: 2
      },
      positionName: {
        required: true,
        minlength: 2
      }
    }
    const messages = {
      company: {
        required: '请填写品牌名称',
        minlength: '名称至少两个字'
      },
      address:{
        required: '请填写公司地址',
        minlength: '地址至少1个字'
      },
      industryTypeName: {
        required: '请填写公司行业',
        minlength: '行业至少两个字'
      },
      positionName: {
        required: '请填写职位',
        minlength: '职位至少两个字'
      }
    }
    this.WxValidate = new WxValidate(rules, messages)
  },
  formSubmit: function (e) {
    const params = e.detail.value
    //校验表单
    const info = this.data.renderData;
    const uniqueKey = this.data.uniqueKey;
    if (!this.WxValidate.checkForm(params)) {
      const error = this.WxValidate.errorList[0]
      wx.showToast({
        title: error.msg,
        icon: 'none'
      })
      return false
    }
    let temp = {
      CompanyName: params.company,
      IndustryTypeName: params.industryTypeName,
      PositionName: params.positionName,
      Area: 3,
      Address: params.address,
      VRLink: info.VRLink,
      CompanyProfile: params.desc,
      InUserSysNo: uniqueKey,
      ProvinceName: info.ProvinceName,
      CityName: info.CityName,
      DistrictName: info.DistrictName,
      EditUserSysNo: uniqueKey,
      Latitude: info.Latitude,
      Longitude: info.Longitude
    }
    if (info.SysNo) {
      temp['SysNo'] = info.SysNo
      remote.updateCompany(temp).then(res => {
        wx.showToast({
          title: '修改成功',
        })
        wx.navigateBack()
      })
    } else {
      remote.insertCompany(temp).then(res => {
        wx.showToast({
          title: '新增成功',
        })
        wx.navigateBack()
      })
    }
  },
  back() {
    wx.navigateBack()
  }
})