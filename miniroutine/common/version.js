export function version() {
  if (wx.canIUse('getUpdateManager')) {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      if (res.hasUpdate) {
        updateManager.onUpdateReady(function () {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
        updateManager.onUpdateFailed(function () {
          wx.showModal({
            title: '已经有新版本了哟~',
            content: '新版本已经上线啦~，请您删除当前小程序，重新搜索打开哟~'
          })
        })
      }
    })
  } else {
    wx.showModal({
      title: '提示',
      content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
    })
  }
}
export function userSetting(scope, selfOperation) {
  let promise = new Promise((resolve, reject) => {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting[scope]) {
          wx.getUserInfo({
            success: function (res) {
              resolve(res)
            },
            fail: function (err) {
              reject(err)
            }
          })
        } else {
          if (selfOperation) {
            wx.showModal({
              title: '提示！',
              confirmText: '去设置',
              showCancel: false,
              content: "请授权",
              success: function (res) {
                if (res.confirm) {
                  // wx.navigateTo({
                  //   url: '../setting/setting',
                  // })
                  wx.openSetting({})
                }
              }
            })
          }
        }
      }
    })
  })
  return promise;
}

export function login(data) {
  let promise = new Promise((resolve, reject) => {
    wx.login({
      success: function (res) {
        const temp = {}
        temp.HeadPortraitUrl = data.avatarUrl;
        temp.WX = data.nickName;
        temp.Province = data.province;
        temp.City = data.city;
        temp.json_code = res.code;
        resolve(temp)
      },
      fail: function (err) {
        reject(err)
      }
    })
  })
  return promise;
}

export function seesion() {
  let promise = new Promise((resolv, reject) => {
    wx.checkSession({
      success: function () {
        resolve(true)
      },
      fail: function () {
        reject(false)
      }
    })
  })
  return promise;
}