const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const parseTime = (timestamp) => {
  function zeroize(num) {
    return (String(num).length == 1 ? '0' : '') + num;
  }

  var curTimestamp = parseInt(new Date().getTime() / 1000); //当前时间戳
  var timestampDiff = curTimestamp - timestamp; // 参数时间戳与当前时间戳相差秒数

  var curDate = new Date(curTimestamp * 1000); // 当前时间日期对象
  var tmDate = new Date(timestamp * 1000);  // 参数时间戳转换成的日期对象

  var Y = tmDate.getFullYear(), m = tmDate.getMonth() + 1, d = tmDate.getDate();
  var H = tmDate.getHours(), i = tmDate.getMinutes(), s = tmDate.getSeconds();

  if (timestampDiff < 60) { // 一分钟以内
    return "刚刚";
  } else if (timestampDiff < 3600) { // 一小时前之内
    return Math.floor(timestampDiff / 60) + "分钟前";
  } else if (curDate.getFullYear() == Y && curDate.getMonth() + 1 == m && curDate.getDate() == d) {
    return '今天' + zeroize(H) + ':' + zeroize(i);
  } else {
    var newDate = new Date((curTimestamp - 86400) * 1000); // 参数中的时间戳加一天转换成的日期对象
    if (newDate.getFullYear() == Y && newDate.getMonth() + 1 == m && newDate.getDate() == d) {
      return '昨天' + zeroize(H) + ':' + zeroize(i);
    } else if (curDate.getFullYear() == Y) {
      return zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
    } else {
      return Y + '年' + zeroize(m) + '月' + zeroize(d) + '日 ' + zeroize(H) + ':' + zeroize(i);
    }
  }
}
const system = wx.getSystemInfoSync();
const getSystem = {
  getScreenWidthPx: function() {
    return system.screenWidth;
  },
  getScreenHeightPx: function () {
    return system.screenHeight;
  },
  getScreenHeightRpx: function() {
    let windowHeight = (system.windowHeight * (750 / system.windowWidth));
    return windowHeight;
  },
  getPx(rpx) {
    return rpx / 750 * system.windowWidth;
  },
  getRpx(px) {
    return px / 750 * system.windowWidth;
  }
}
const getCurrentDate = () => {
  let date = new Date();
  let item = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDay();
  return item;
}
const today = () => {
  let now = new Date()
  let y = now.getFullYear()
  let m = now.getMonth() + 1
  let d = now.getDate()
  m = m < 10 ? "0" + m : m
  d = d < 10 ? "0" + d : d
  return y + "-" + m + "-" + d;
}
const lessDate = (date1, date2) => {
  let pre = new Date(date1)
  let suf = new Date(date2)
  return pre.getTime() < suf.getTime()
}
module.exports = {
  formatTime: formatTime,
  parseTime: parseTime,
  getSystem: getSystem,
  getCurrentDate: getCurrentDate,
  lessDate: lessDate,
  today: today
}
