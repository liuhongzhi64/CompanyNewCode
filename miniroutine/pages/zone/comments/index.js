import { getSystem } from '../../../utils/util.js';
import remote from '../../../service/remote.js';
import constants from '../../../common/constants.js';
import { image } from '../../../request/index.js';
Page({
  data: {
    more: true,
    page: {
      currentPage: 1,
      pageSize: 12,
      sort: 'desc'
    },
    listData: [],
    status: 3, // 3代表所有
    showActionsheet1: false,
    groups: [
      { text: '未审核', value: 0 },
      { text: '已审核', value: 1 },
      { text: '未通过审核', value: 2 }
    ],
    title: ''
  },
  onLoad: function (options) {
    let userInfo = wx.getStorageSync(constants.USERINFO);
    let screenHeight = getSystem.getScreenHeightRpx();
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      userInfo: userInfo,
      screenHeight: screenHeight,
      uniqueKey: uniqueKey
    }, () => {
      this.loadComments();
    })
  },
  onReady: function () {
    
  },
  onShow: function () {

  },
  onShareAppMessage(res) {
    let userInfo = this.data.userInfo;
    let uniqueKey = this.data.uniqueKey;
    let avatar = image(userInfo.HeadPortraitUrl) || constants.defaultLogo;
    return {
      title: '我开通了新推名片，快来给我留言助力!',
      path: `/pages/index?targetKey=${uniqueKey}`,
      imageUrl: avatar
    };
  },
  renchBottom(){
    let that = this;
    if (this.data.more) {
      let page = this.data.page;
      page.currentPage += 1;
      this.setData({
        page: page,
        loadingmore: true
      }, () => {
        this.loadComments();
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
  back(event) {
    wx.navigateBack({});
  },
  choose(event) {
    let that = this;
    let list = ['未审核', '已通过审核', '未通过审核']
    wx.showActionSheet({
      itemList: list,
      success: function(res) {
        let page = that.data.page;
        page.currentPage = 1;
        that.setData({
          title: list[res.tapIndex],
          listData: [],
          page: page,
          status: res.tapIndex,
          more: true,
          showActionsheet1: false
        }, () => {
          that.loadComments();
        })
      }
    })
  },
  loadComments() {
    let more = this.data.more;
    if (!more) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return;
    }
    let listData = this.data.listData;
    let that =this;
    let page = this.data.page;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在111引用

    remote.getComments(this.data.uniqueKey, this.data.status, page, merchantSysNo).then(res => {
      let cur = res.data;
        for (let j = 0; j < cur.length; j++) {
          for (let k = j; k > 0 && k < cur.length; k--) {
            if (cur[k].SysNo > cur[k - 1].SysNo) {
              let temp = cur[k];
              cur[k] = cur[k - 1];
              cur[k - 1] = temp;
          }
        }
      }
      for (let i = 0; i < cur.length; i++) {
        cur[i].HeadPortraitUrl = image(cur[i].HeadPortraitUrl);
      }
      if (res.data.length < page.pageSize) {
        more = false;
      }
      page.currentPage += 1;
      that.setData({
        listData: listData.concat(cur),
        more: more,
        page: page
      })
    })
  },
  deleteData(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let that = this;
    wx.showModal({
      title: '删除留言',
      content: '确定删除吗？',
      success: function(res) {
        if (res.confirm) {
          remote.deleteComment(listData[index].SysNo).then(res => {
            if (res.success) {
              listData.splice(index, 1);
              wx.showToast({
                title: '删除成功',
                icon: 'none'
              })
              that.setData({
                listData: listData
              })
            }
          });
        } else if(res.cancel) {
        }
      }
    })
    if (!id) {
      return false;
    }
    remote.deleteComment(id).then(res => {
      if (res.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'none'
        })
      }
    })
  },
  setStatus(event) {
    let index = event.currentTarget.dataset.index;
    let listData = this.data.listData;
    let that = this;
    wx.showActionSheet({
      itemList: ['通过', '不通过'],
      success: function (res) {
        let tapIndex = res.tapIndex + 1;
        remote.updateCommentStatus(listData[index].SysNo, tapIndex).then(res => {
          if (res.success) {
            wx.showToast({
              title: '操作成功',
              icon: 'none'
            })
            listData[index].Status = tapIndex;
            that.setData({
              listData: listData
            })
          }
        })
      }
    })
  }
})