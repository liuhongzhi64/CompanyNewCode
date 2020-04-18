import constants from '../../../../common/constants.js';
import remote from '../../../../service/remote.js';
Page({
  data: {
    uniqueKey: -1,
    userInfo: {},
    labels: [],
    level: '',
    levelGroup: ['有意向', '已成交', '无意向', '未分类'],
    selected: -1,
    deleted: [],
    newLabels: [],
    show: true
  },
  onLoad: function (options) {
    let userInfo = JSON.parse(options.item);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    let selectedIndex = this.getSelectedIndex(userInfo.LevelName);
    this.setData({
      labels: userInfo.currentUserLabel,
      level: userInfo.LevelName,
      userInfo: userInfo,
      uniqueKey: uniqueKey,
      selected: selectedIndex,
      hadLevel: userInfo.LevelName
    })
  },
  back() {
    wx.navigateBack({});
  },
  showButton() {
    this.setData({
      show: false
    })
  },
  getSelectedIndex(level) {
    let levelGroup = this.data.levelGroup;
    for (let i = 0; i < levelGroup.length; i++) {
      if (levelGroup[i] == level) {
        return i;
      }
    }
  },
  removeSelected(event) {
    let { index, field } = event.currentTarget.dataset;
    let labels = this.data.labels;
    labels[index]['hidden'] = true;
    let deleted = this.data.deleted;
    deleted.push(field);
    this.setData({
      deleted: deleted,
      labels: labels
    })
  },
  formSubmit(event) {
    let value = event.detail.value.text;
    let newLabels = this.data.newLabels;
    let labels = this.data.labels;
    let count = 0;
    for (let i = 0; i < labels.length; i++) {
      if (!labels[i]['hidden']) {
        count++;
      }
    }
    if (count > 10) {
      wx.showToast({
        title: '已达上限',
        icon: 'none'
      })
      return ;
    }
    labels.push({
      LableName: value
    });
    newLabels.push({
      CustomType: 2,
      InUserSysNo: this.data.uniqueKey,
      LableName: value,
      Priority: 1,
      UserSysNo: this.data.userInfo.CustomerSysNo,
    })
    this.setData({
      labels: labels,
      newLabels: newLabels,
      text: '',
      show: true
    })
  },
  chooseLevel(event) {
    let index = event.currentTarget.dataset.index;
    let levelGroup = this.data.levelGroup;
    this.setData({
      level: levelGroup[index],
      selected: index
    })
  },
  save() {
    let deleted = this.data.deleted;
    let newLabels = this.data.newLabels;
    let selected = this.data.selected;
    let level = this.data.level;
    if (deleted.length > 0) {
      deleted.map(item => {
        remote.deleteCurrentUserLabel(item);
        return 0;
      })
    }
    if (newLabels.length > 0) {
      remote.createTags(newLabels);
    }
    if (this.data.hadLevel) {
      remote.updateIntentionLevel({
        EditUserSysNo: this.data.uniqueKey,
        LevelName: level,
        Priority: 10 - selected, // 有意向10 已成交 9 无意向 8 未分类8
        UsersysNo: this.data.userInfo.CustomerSysNo
      })
    } else {
      if (level) {
        remote.insertIntentionLevel({
          InUserSysNo: this.data.uniqueKey,
          LevelName: level,
          Priority: 10 - selected,
          UsersysNo: this.data.userInfo.CustomerSysNo
        })
      }
    }
    let that = this;
    wx.showToast({
      title: '修改成功',
      icon: 'none',
      success: function () {
        let time = setTimeout( (callback) => {
          that.back();
          callback();
        }, 1000, () => {
          clearTimeout(time);
        })
      }
    })
  }
})