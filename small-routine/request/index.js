const dev = "http://app-svc.lixiantuce.com:8054";
const pro = "https://www.xintui.xin:8058";
const envParams = "dev";
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

//封装异步api
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}

const getLocationPromisified = wxPromisify(wx.getLocation);//获取经纬度
const showModalPromisified = wxPromisify(wx.showModal);//弹窗
// 在此引用的getApp()对象，不能在app.js再次引用此js文件，会出现重复引用的问题，导致应用不能启动
function env() {
  let baseEnv = envParams;
  if (baseEnv == 'pro') {
    return pro;
  } else {
    return dev;
  }
}

// 封装post请求
const post = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: env() + url,
      data: data,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: function (res) {//服务器返回数据
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {//返回错误提示信息
          reject(res.data);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}
// 封装get请求
const get = (url, data) => {
  var promise = new Promise((resolve, reject) => {
    //网络请求
    wx.request({
      url: env() + url,
      data: data,
      header: {
        'content-type': 'application/json',
        'token': wx.getStorageSync('token')
      },
      success: function (res) {//服务器返回数据
        if (res.statusCode == 200) {
          resolve(res.data);
        } else {//返回错误提示信息
          reject(res.data);
        }
      },
      error: function (e) {
        reject('网络出错');
      }
    })
  });
  return promise;
}

const image = (url) => {
  if (!url) {
    return '';
  }
  if (url.indexOf('http') == -1) {
    let firstLetter = url.substring(0, 1);
    if (firstLetter == '/') {
      return env() + url;
    } else {
      return env() + '/' + url;
    }
  }
  return url;
}
const upload = (url, tempFilePaths) => {
  console.log(tempFilePaths)
  let promise = Promise.all(tempFilePaths.map((tempFilePath, index) => {
    console.log(tempFilePath)
    return new Promise((resolve, reject) => {
      console.log(env() + url)
      console.log(tempFilePath.path)
      wx.uploadFile({
        url: env() + url,
        name: 'file',
        filePath: tempFilePath.path || tempFilePath.Url,
        success: function (res) {
          console.log(res)
          let data = JSON.parse(res.data);
          if (tempFilePath.path) {
            tempFilePath.path = data.data[0];
          } else {
            tempFilePath.Url = data.data[0];
          }
          resolve(tempFilePath);
        },
        fail: function (err) {
          reject(new Error('failed to upload file'));
        }
      });
    });
  }));
  return promise;
}
module.exports = {
  post,
  get,
  getLocationPromisified,
  showModalPromisified,
  image: image,
  upload: upload
}
