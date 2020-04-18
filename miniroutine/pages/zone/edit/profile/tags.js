import remote from '../../../../service/remote.js';
import constants from '../../../../common/constants.js';
Page({
  data: {
    normal: [{ text: '营销' }, { text: '冒险' }, { text: '80后' }, { text: '90后' }, { text: '土味情话' }, { text: '本地人' }, { text: '家居' }, { text: '产品' }, { text: '旅行' }, { text: '运动' }, { text: '看电影' }],
    personal: [{ text: '自我驱动' }, { text: '责任心' }, { text: '抗压能力' }, { text: '谈判能力' }, { text: '适应能力' }, { text: '沟通协调能力' }, { text: '执行力' }, { text: '计划管理' }, { text: '时间管理' }, { text: '想象力' }, { text: '演讲能力' }, { text: '学习能力' }, { text: '联想能力' }],
    language: [{ text: '英语' }, { text: '日语' }, { text: '俄语' }, { text: '法语' }, { text: '西班牙语' }, { text: '韩语' }, { text: '德语' }, { text: '阿拉伯语' }, { text: '粤语' }, { text: '小语种' }],
    allround: [{ text: '观察能力' }, { text: '人际交往能力' }, { text: '思维能力' }, { text: '实践能力' }, { text: '资源整合能力' }],
    apps: [{ text: 'CRM系统' }, { text: 'OA系统' }, { text: 'Word' }, { text: '数据库软件' }, { text: 'GTD工具' }, { text: 'PowerPoint' }, { text: 'PhotoShop' }, { text: 'Excel' }, { text: '思维导图' }, { text: 'Adobe全家桶' }],
    labels: [],
    deletedArray: [],
    show: true,
    text: ''
  },
  onLoad: function (options) {
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      uniqueKey: uniqueKey
    })
  },
  onReady: function () {
    this.initData();
  },
  onShow: function () {

  },
  back() {
    wx.navigateBack({});
  },
  formSubmit(event) {
    let uniqueKey = this.data.uniqueKey;
    let text = event.detail.value.text;
    let labels = this.data.labels;
    labels.push({
      CustomType: 1,
      InUserSysNo: uniqueKey,
      LableName: text,
      Priority: 0,
      UserSysNo: uniqueKey,
    });
    this.setData({
      labels: labels,
      text: '',
      show: true
    })
  },
  showButton() {
    this.setData({
      show: false
    })
  },
  hideButton(event) {
    let text = event.detail.value.text;
    if (text || text.length == 0) {
      this.setData({
        show: true
      })
    }
  },
  removeSelected(event) {
    let labels = this.data.labels;
    let { index, field } = event.currentTarget.dataset;
    labels[index]['deleted'] = true;
    let temp = this.data.deletedArray;
    temp.push({ sysno: field});
    this.setData({
      labels: labels,
      deletedArray: temp
    })
  },
  choose(event) {
    let labels = this.data.labels;
    let deletedArray = this.data.deletedArray;
    let { index, rank } = event.currentTarget.dataset;
    let uniqueKey = this.data.uniqueKey;
    let temp = this.data[rank];
    let selected = temp[index];
    if (selected['selected']) {
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].LableName == selected.text) {
          labels[i]['deleted'] = true;
          deletedArray.push({
            sysno: 0
          })
        }
      }
    } else {
      if (labels.length - deletedArray.length >= 10) {
        wx.showToast({
          title: '已达上限',
          icon: 'none'
        })
        return false;
      }
      labels.push({
        CustomType: 1,
        InUserSysNo: uniqueKey,
        LableName: selected.text,
        Priority: 0,
        UserSysNo: uniqueKey,
      });
    }
    this.setData({
      labels: labels,
      deletedArray: deletedArray
    })
    selected['selected'] = !selected['selected'];
    temp[index] = selected;
    switch(rank) {
      case "normal":
        this.setData({
          normal: temp
        })
        break;
      case "personal":
        this.setData({
          personal: temp
        })
        break;
      case "language":
        this.setData({
          language: temp
        })
        break;
      case "allround":
        this.setData({
          allround: temp
        })
        break;
      case "apps":
        this.setData({
          apps: temp
        })
        break;
    }
  },
  initData() {
    let uniqueKey = this.data.uniqueKey;
    let that = this;
    remote.getCurrentUserLabel(uniqueKey).then(res => {
      that.setData({
        labels: res.data
      })
    })
  },
  save() {
    wx.showLoading({
      title: '正在保存',
      icon: 'none'
    })
    let labels = this.data.labels;
    let deleted = this.data.deletedArray;
    let create = [];
    for (let i = 0; i < labels.length; i++) {
      if (!labels[i]['SysNo'] && !labels[i]['deleted']) {
        create.push(labels[i]);
      }
    }
    remote.createTags(create).then(res => {
      Promise.all(deleted.map((item, index) => {
        if (item.sysno != 0) {
          remote.deleteCurrentUserLabel(item.sysno);
        }
      })).then(res => {
        wx.showToast({
          title: '保存成功',
          icon: 'none',
          success: function () {
            wx.navigateBack({});
          }
        })
      })
    })
  }
})