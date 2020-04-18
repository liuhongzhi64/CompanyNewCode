import remote from '../../../service/remote.js';
import { image } from '../../../request/index.js';
import constants from '../../../common/constants.js';
import { getSystem } from '../../../utils/util.js';
Page({
  data: {
    status: 0,
    page: {
      currentPage: 1,
      pageSize: 12,
      sort: 'desc'
    },
    uniqueKey: -1,
    listData: [],
    more: true,
    doPass: []
  },
  onLoad: function (options) {
    let screenHeight = getSystem.getScreenHeightRpx();
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      screenHeight: screenHeight,
      uniqueKey: uniqueKey
    }, () => {
      this.initPackage();
      this.initData(this.data.status);
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  back(event) {
    wx.navigateBack({});
  },
  checkboxChange(event) {
    let doPass = this.data.doPass;
    if (doPass.length >= this.data.count) {
      wx.showToast({
        title: '没有足够名额',
        icon: 'none'
      })
      return ;
    }
    let value = event.detail.value;
    let listData = this.data.listData;
    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < listData.length; j++) {
        if (value[i] == listData[j].SysNo) {
          if (!listData[j]['checked']) {
            listData[j]['checked'] = true
          }
        } else {
          listData[j]['checked'] = false
        }
      }
    }
    this.setData({
      doPass: value,
      listData: listData
    })
  },
  loadmore() {
    let that = this;
    if (this.data.more) {
      let page = this.data.page;
      page.currentPage += 1;
      this.setData({
        page: page,
        loadingmore: true
      }, () => {
        this.initData(this.data.status);
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
  initData(status) {
    let more = this.data.more;
    if (!more) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return ;
    }
    let uniqueKey = this.data.uniqueKey;
    let listData = this.data.listData;
    let page = this.data.page;
    let that = this;
    remote.getRelationShip(uniqueKey, status, page).then(res => {
      let temp = res.data;
      for (let i = 0; i < temp.length; i++) {
        temp[i].HeadPortraitUrl = image(temp[i].HeadPortraitUrl);
      }
      page.currentPage += 1;
      that.setData({
        listData: listData.concat(temp),
        page: page,
        more: more
      })
    })
  },
  sort(event) {
    let page = this.data.page;
    let that = this;
    let tapIndex = parseInt(event.currentTarget.dataset.index);
    page.currentPage = 1;
    that.setData({
      page: page,
      listData: [],
      status: tapIndex
    }, () => {
      that.initData(tapIndex);
    })
    // wx.showActionSheet({
    //   itemList: ['未审核', '已审核'], 
    //   success: function (res) {
    //     let tapIndex = res.tapIndex;
    //     page.currentPage = 1;
    //     that.setData({
    //       page: page,
    //       listData: [],
    //       status: tapIndex
    //     }, () => {
    //       that.initData(tapIndex);
    //     })
    //   }
    // })
  },
  allPick(event) {
    let value = event.detail.value;
    let listData = this.data.listData;
    let temp = [];
    if (value.length > 0) {
      if (value.length > this.data.count) {
        wx.showToast({
          title: '没有足够名额',
          icon: 'none'
        })
        return ;
      }
      for (let i = 0; i < listData.length; i++) {
        temp.push(listData[i].SysNo);
        listData[i]['checked'] = true;
      }
      this.setData({
        listData: listData,
        doPass: temp
      })
    } else {
      for (let i = 0; i < listData.length; i++) {
        listData[i]['checked'] = false;
      }
      this.setData({
        listData: listData,
        doPass: []
      })
    }
  },
  pass(event) {
    let status = event.currentTarget.dataset.index;
    let doPass = this.data.doPass;
    let title = status == 0 ? '通过申请' : '不通过申请';
    let that = this;
    wx.showModal({
      title: '审核',
      content: title,
      success: function (res) {
        if (res.confirm) {
          let promise = Promise.all(doPass.map(item => {
            return new Promise((resolve, reject) => {
              remote.updateAudit(item, Number(status) + 1).then(res => {
                if (res.success) {
                  resolve(res.data);
                }
              })
            })
          }))
          promise.then(res => {
            if (res.length == doPass.length) {
              wx.showToast({
                title: '操作成功',
                icon: 'none',
                success: function () {
                  let page = that.data.page;
                  page.currentPage = 1;
                  that.setData({
                    page: page,
                    more: true,
                    listData: [],
                    doPass: [],
                    count: that.data.count - doPass.length
                  }, () => {
                    that.initData(that.data.uniqueKey, status, page);
                  })
                }
              })
            }
          })
        }
      }
    })
  },
  initPackage() {
    let that = this;
    remote.vipCheck(this.data.uniqueKey).then(res => {
      that.setData({
        count: res.data.AINumber
      })
    })
  },
  call(event) {
    let phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  }
})