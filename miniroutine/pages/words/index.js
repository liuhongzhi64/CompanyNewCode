import remote from '../../service/remote.js';
import { image } from '../../request/index.js';
import constants from '../../common/constants.js';
const app = getApp();
Page({
  data: {
    uniqueKey: -1,
    page: {
      currentPage: 1,
      pageSize: 12,
      sort:'desc'
    },
    targetUserId: 79,
    form: {
      text: ''
    },
    comments: [],
    more: true,
    bottomHeight: 0
  },
  onLoad: function (options) {
    let width = wx.getSystemInfoSync().screenWidth;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let targetUserId = options.targetUserId;
    if (uniqueKey) {
      this.setData({
        uniqueKey: uniqueKey,
        targetUserId: targetUserId,
        screenWidth: width
      })
    }
  },
  onReady: function () {
    this.getComments();
  },
  onShow: function () {

  },
  showButton(event) {
    this.setData({
      bottomHeight: event.detail.height
    })
  },
  loseFocus() {
    this.setData({
      bottomHeight: 0
    })
  },
  back(event) {
    wx.navigateBack();
  },
  onReachBottom() {
    let that = this;
    if (this.data.more) {
      this.setData({
        loadingmore: true
      }, () => {
        this.getComments();
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
  getComments() {
    let key = this.data.uniqueKey == -1 ? 0 : this.data.uniqueKey;
    let that = this;
    let page = this.data.page;
    let comments = this.data.comments;
    return remote.getCommentsList(this.data.targetUserId, key, page).then(res => {
      let result = res.data.commentPointRatioList;
      if (result.length > 0) {
        page.currentPage += 1;
        for (let j = 0; j < result.length; j++) {
          for (let k = j; k > 0 && k < result.length; k--) {
            if (result[k].SysNo > result[k - 1].SysNo){
              let temp = result[k];
              result[k] = result[k - 1];
              result[k - 1] = temp;
            }
          }
        }
        let promise = Promise.all(result.map((item, index) => {
          // 看到这段是不是想笑，评论只给内容，不给用户基本信息的
          return new Promise((resolve, reject) => {
            remote.getOriginWxInfo(item.UserSysNo).then(res => {
              let info = res.data;
              if (info) {
                item['avatar'] = image(info.HeadPortraitUrl);
                item['name'] = info.Name;
                resolve(item)
              }
            })
          })
        }))
        promise.then(res => {
          that.setData({
            comments: comments.concat(res),
            page: page,
            more: true
          })
        })
      } else {
        that.setData({
          comments: comments,
          more: false
        })
      }
    })
  },
  likeCurComment(res) {
    let index = res.currentTarget.dataset.index;
    let comments = this.data.comments;
    let cur = comments[index];
    if (cur.PointRatioStatus != 1 && !this.data.homeLoading) {
      let that = this;
      remote.updateLiked(this.data.uniqueKey, this.data.targetUserId, cur.SysNo).then(res => {
        if (res.success) {
          cur.PointRatio += 1;
          cur.PointRatioStatus = 1;
          comments[index] = cur;
          that.setData({
            comments: comments
          }, () => {
            that.loading();
          })
        }
      })
    } else {
      wx.showToast({
        title: '已点赞',
        icon: 'none'
      })
    }
  },
  formSubmit(event) {
    let that = this;
    let text = event.detail.value.text;
    if (text == null || text== '') {
      wx.showToast({
        title: '请填写留言',
        icon: 'none'
      })
      return;
    }
    let uniqueKey = this.data.uniqueKey;
    let targetUserId = this.data.targetUserId;
    remote.insertComment({
      Content: text,
      InUserSysNo: uniqueKey,
      TouserSysNo: targetUserId,
      UserSysNo: uniqueKey
    }).then(res => {
      wx.showToast({
        title: '留言成功,审核后显示',
        icon: 'none',
        success: function () {
          that.setData({
            text: ''
          })
        }
      })
    })
  },
  onReachBottom: function () {
    let that = this;
    if (!this.data.more) {
      return;
    }
    if (!this.data.loading) {
      this.setData({
        loading: true
      }, () => {
        this.getComments().then(res => {
          that.setData({
            loading: false
          })
        })
      })
      
    }
  }
})