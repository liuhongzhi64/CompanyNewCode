//app.js
import { version } from './common/version.js';
import QQMapWX from './utils/qqmap-wx-jssdk.min.js';
import constants from './common/constants.js';
import { imLogin, imLoginOut } from './utils/imUtils.js';
App({
  onLaunch: function () {
    version();
    let qqMapSDK = new QQMapWX({
      key: 'X3CBZ-SU4OW-KRSRM-RIIEN-SA3R3-H5BOZ'
    });
    this.globalData.qqMapSDK = qqMapSDK;
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    if (uniqueKey && !this.globalData.hadLogin) {
      imLogin(uniqueKey);
    }
  },
  globalData: {
    uniqueKey: -1,
    qqMapSDK: {},
    hadLogin: false,
    messageList: [],
    unreadcount: 0,
    images: [],
    cropperImage: '',
    newMessages: []
  },
  watch(key,callback) {
    let global = this.globalData;
    Object.defineProperty(global, key, {
      set(value) {
        let newKey = '_' + key;
        this[newKey] = value;
        callback(value)
      },
      get() {
        let newKey = '_' + key;
        return this[newKey];
      }
    })
  }
})