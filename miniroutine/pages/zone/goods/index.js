import product from '../../../service/product.js';
import remote from '../../../service/remote.js';
import constants from '../../../common/constants.js';
import { image } from '../../../request/index.js';
import WxValidate from '../../../utils/WxValidate.js';
let pageStart = 0;
Page({
  data: {
    setting: false,
    products: [],
    more: true,
    page: {
      pageSize: 100,
      currentPage: 1,
      sort: 'desc'
    },
    saling: 10,
    checked: [], // 选择数组
    sales: [], // 上下架数组
    deleted: [], // 删除数组
    hadChecked: 0,
    ranks: [],
    loading: false,
    checkall: false,
    value: "",
    show: false,
    // authorizationShow: false,//是否确定弹窗提示
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    this.getHeight();
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey,
      loading: true
    })
    this.initProducts(this.data.saling, this.data.value, this.data.page);
    this.initVip();
    this.initValidate();
  },
  onReady: function () {

  },
  onShow: function () {
    if (!this.data.loading) {
      let page = this.data.page;
      page.currentPage = 1;
      this.setData({
        page: page,
        products: [],
        more: true
      }, () => {
        this.initProducts(this.data.saling,"", this.data.page);
      })
    }
  },
  onHide: function () {

  },
  loadmore(e) {
    let that = this;
    if (this.data.more) {
      let page = this.data.page;
      page.currentPage += 1;
      this.setData({
        page: page,
        loadingmore: true
      }, () => {
        this.initProducts(this.data.saling, this.data.value, this.data.page);
        let timeset = setTimeout((callback) => {
          that.setData({
            loadingmore: false
          })
        }, 1000, () => {
          clearTimeout(timeset);
        })
      })
    }
  },
  getHeight() {
    let res = wx.getSystemInfoSync();
    let windowHeight = (res.windowHeight * (750 / res.windowWidth));
    this.setData({
      screenHeight: windowHeight
    })
  },
  back(event) {
    wx.navigateBack({});
  },
  search(event) {
    let value = event.detail;
    let page = this.data.page;
    page.currentPage = 1;
    this.setData({
      page: page,
      products: [],
      value: value,
      more: true
    }, () => {
      this.initProducts(this.data.saling, value, page);
    })
  },
  initVip() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getUserPackage(this.data.uniqueKey, merchantSysNo).then(res => {
      that.setData({
        vip: res.data
      })
    })
  },
  manage() {
    let setting = this.data.setting;
    let products  = this.data.products;
    for (let i = 0; i < products.length; i++) {
      products[i]['checked'] = false;
      products[i]['hidden'] = false;
    }
    this.setData({
      setting: !setting,
      checked: [],
      deleted: [],
      sales: [],
      checkall: false,
      products: products
    })
  },
  setRank(event) {
    let sysno = event.currentTarget.dataset.index;
    let value = event.detail.value;
    if (parseInt(value) > 0) {
      let ranks = this.data.ranks;
      let flag = false; // 确定是否已经添加到排序数组中
      for (let i = 0; i < ranks.length; i++) {
        if (ranks[i].sysNo == sysno) {
          ranks[i].Priority = value;
          flag = true
        }
      }
      if (!flag) {
        ranks.push({
          sysNo: sysno,
          Priority: value
        })
      }
      this.setData({
        ranks: ranks
      })
    } else {
      wx.showToast({
        title: '不能为负数',
        icon: 'none'
      })
    }
  },
  // 展示中的产品方法
  initProducts(saling, name, page) {
    let uniqueKey = this.data.uniqueKey;
    let more = this.data.more;
    if (!more) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return ;
    }
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let configurationSysNo = wx.getStorageSync(constants.MerchantSysNo)
    console.log(configurationSysNo)
    product.getProductList(this.data.uniqueKey, saling, 2, name, configurationSysNo, page).then(res => {
      console.log(res)
      let products = that.data.products;
      let newList = res.data;
      for (let i = 0; i < newList.length; i++) {
        newList[i].DefaultImage = image(newList[i].DefaultImage);
      }
      if (newList.length < page.pageSize) {
        more = false;
      }
      page.currentPage += 1;
      // console.log(that.data.page.currentPage)
      that.setData({
        products: products.concat(newList),
        more: newList.length < page.pageSize,
        page: page,
        loading: false,
        more: false,
        complate: true
      },()=> {
        wx.hideLoading();
      })
    })
  },
  navigateToDetails(event) {
    let index = event.currentTarget.dataset.index;
    let products = this.data.products;
    let item = products[index];
    wx.navigateTo({
      url: `./details/index?goodsId=${item.SysNo}`,
    })
  },
  // 编辑商品
  edit(event) {
    let vip = this.data.vip;
    let products = this.data.products;
    if (vip && parseInt(vip.ProductNumber) < products.length) {
      this.showRegister();
      return;
    }
    if (event.currentTarget.dataset.index != undefined) {
      let index = event.currentTarget.dataset.index;
      let item = JSON.stringify(products[index]);
      console.log(index,item)
      wx.navigateTo({
        url: `./edit/index?item=${item}`,
      })
    } else {
      wx.navigateTo({
        url: './edit/index',
      })
    }
    
  },
  //置顶
  setTop(event) {
    let index = event.currentTarget.dataset.index;
    let products = this.data.products;
    let that = this;
    products[index].IsDisplayWebsite = (products[index].IsDisplayWebsite == 0 ? 1 : 0);
    product.updateIsTopic(products[index].SysNo, products[index].IsDisplayWebsite).then(res => {
      if (res.success) {
        that.setData({
          products: products
        }, () => {
          wx.showToast({
            title: '操作成功',
            icon: 'none'
          })
        })
      } else {
        wx.showToast({
          title: '置顶失败',
          icon: 'none'
        })
      }
      
    })
  },
  // 初始化下架商品
  initOffSale(event) {
    let that = this;
    let saling = that.data.saling == 10 ? 20 : 10;
    that.setData({
      loading: true,
      saling: saling,
      products: [],
      deleted: [],
      hadChecked: 0,
      more: true,
      setting: false
    }, () => {
      let page = that.data.page;
      page.currentPage = 1;
      that.initProducts(saling,"", page);
    })
  },
  // 是否确定
  // isAuthorizationShow: function (e) {
  //   this.setData({
  //     authorizationShow: false
  //   })
  // },
  // 下架/上架/删除
  // 确定后再进行下架
  offsale(event) {
    let products = this.data.products;
    let checked = this.data.checked;
    let sales = this.data.sales;
    let deleted = this.data.deleted;
    let target = event.currentTarget.dataset.target;
    for (let i = 0; i < checked.length; i++) {
      for (let j = 0; j < products.length; j++) {
        if (products[j].SysNo == parseInt(checked[i])) {
          products[j]['hidden'] = true;
          if (target == 'sale') {
            // 上下架
            sales.push(checked[i]);
            console.log(111)
            this.submit(event)
            // this.setData({
            //   authorizationShow: true
            // })
          } else {
            // 删除
            deleted.push(checked[i]);
          }
        }
      }
    }
    this.setData({
      products: products,
      checked: [],
      deleted: deleted,
      sales: sales,
      hadChecked: 0
    })
  },
  // 提交
  submit(event) {
    let ranks = this.data.ranks;
    let deleted = this.data.deleted;
    let sales = this.data.sales;
    if (ranks.length == 0 && deleted.length == 0 && sales.length == 0) {
      this.setData({
        setting: false
      })
      return ;
    }
    this.setData({
      loading: true
    })
    let saling = ( this.data.saling == 10 ? 20 : 10 );
    let that = this;
    new Promise((resolve, reject) => {
      // 不管现在处于什么状态，都调用所有方法进行操作；
      // 上下架
      let title = '';
      if (saling == 20) {
        title = "确定商品下架吗？"
        // this.setData({
        //   authorizationShow: false
        // })
      } else {
        title = "确定商品上架吗？"
        // this.setData({
        //   authorizationShow: false
        // })
      }
      if (sales.length > 0) {
        wx.showModal({
          title: "",
          content: title,
          success: function (res) {
            if (res.confirm) {
              let temp = [];
              for (let i = 0; i < sales.length; i++) {
                temp.push({
                  SysNo: sales[i],
                  ProductStatus: saling
                })
              }
              product.offSale(temp).then(res => {
                resolve(res)
              })
            }
          }
        })
      }
      if (deleted.length > 0) {
        wx.showModal({
          title: '',
          content: '确定删除商品吗？',
          success: function (res) {
            if (res.confirm) {
              let deletetemp = [];
              for (let i = 0; i < deleted.length; i++) {
                deletetemp.push({
                  SysNo: parseInt(deleted[i])
                })
              }
              product.deleteProductList(deletetemp).then(res => {
                resolve(res)
              });
            }
          }
        })
      }
      if (ranks.length > 0) {
        product.updateRank(ranks).then(res => {
          resolve(res)
        });
      }
    }).then(res => {
      wx.showToast({
        title: '修改成功',
        icon: 'none'
      })
      let page = that.data.page;
      page.currentPage = 1;
      that.setData({
        ranks: [],
        checked: [],
        deleted: [],
        sales: [],
        setting: false,
        loading: false,
        hadChecked: 0,
        page: page,
        more: true,
        products: []
      }, () => {
        that.initProducts(that.data.saling, that.data.value, that.data.page);
      })
    })
  },
  // checkbox 
  checkboxChange(event) {
    let checked = event.detail.value;
    let products = this.data.products;
     this.setData({
       checked: checked,
       checkall: products.length == checked.length,
       hadChecked: checked.length
     })
  },
  // 全选
  checkAll(event) {
    let checkall = !this.data.checkall;
    let products = this.data.products;
    let temp = [];
    for (let i = 0; i < products.length; i++) {
      products[i]['checked'] = checkall; // 注意，这里仅仅适用于全选，后续操作中会出现不一致的情况，使用id来确认更准确
      if (checkall) {
        temp.push(products[i].SysNo.toString());
      }
    }
    this.setData({
      products: products,
      checkall: checkall,
      checked: temp,
      hadChecked: temp.length
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

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.insertRelationship({
      Name: params.username,
      UserTelPhone: params.userTelephone,
      Status: 0,
      Type: 2,
      VipTelPhone: "",
      InUserSysNo: uniqueKey,
      MerchantSysNo: merchantSysNo
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
  }
})