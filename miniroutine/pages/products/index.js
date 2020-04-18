import remote from '../../service/remote.js';
import { image } from '../../request/index.js';
import constants from '../../common/constants.js';
import product from '../../service/product.js';
Page({
  data: {
    targetUserId: 79,
    products: [],
    page: {
      pageSize: 12,
      currentPage: 1,
      sort: 'desc'
    },
    more: true,
    loading: false
  },
  onLoad: function (options) {
    let targetUserId = options.targetUserId;
    if (targetUserId) {
      this.setData({
        targetUserId: targetUserId
      })
    }
  },
  onReady: function () {
    this.getProducts();
  },
  onShow: function () {

  },
  back(event) {
    wx.navigateBack();
  },
  getProducts() {
    let that = this;
    let page = this.data.page;
    let products = this.data.products;
    return product.getProductList(this.data.targetUserId, 10, 1, "", page).then(res => {
      let result = res.data;
      if (result.length > 0) {
        page.currentPage += 1;
        for (let i = 0; i < result.length; i++) {
          result[i].DefaultImage = image(result[i].DefaultImage);
          products.push(result[i]);
        }
        that.setData({
          products: products,
          page: page
        })
      } else {
        wx.showToast({
          title: '没有了',
          icon: 'none',
          success: function () {
            that.setData({
              more: false
            })
          }
        })
      }
    })
  },
  onReachBottom: function () {
    let that = this;
    if (this.data.more) {
      this.setData({
        loadingmore: true
      }, () => {
        this.getProducts().then(res => {
          that.setData({
            loadingmore: false
          })
        })
      })
    }
  },
  goodsDetails(event) {
    let index = event.currentTarget.dataset.index;
    wx.navigateTo({
      url: `../zone/goods/details/index?goodsId=${index}`,
    })
  }
})