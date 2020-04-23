import remote from '../../../service/remote.js';
import constants from '../../../common/constants.js';
import { pie, line } from 'fundcharts';
import { getSystem, getCurrentDate } from '../../../utils/util.js';
let piechart,  linechart;
const linectx = wx.createCanvasContext('linechart', this);
const piectx = wx.createCanvasContext('piechart', this);
Page({
  data: {
    cuIconList: [
      { cuIcon: 'friendadd', color: 'orange', badge: 0, name: '累计客户' },
      { cuIcon: 'footprint', color: 'yellow', badge: 0, name: '累计访问量' },
      { cuIcon: 'sort', color: 'olive', badge: 0, name: '累计跟进客户' },
      { cuIcon: 'community', color: 'cyan', badge: 0, name: '累计咨询' },
      { cuIcon: 'phone', color: 'blue', badge: 0, name: '累计拨打电话' },
      { cuIcon: 'copy', color: 'purple', badge: 0, name: '微信复制' },
      { cuIcon: 'subscription', color: 'mauve', badge: 0, name: '名片被转发' },
      { cuIcon: 'we', color: 'purple', badge: 0, name: '名片被点赞' },
      { cuIcon: 'peoplelist', color: 'purple', badge: 0, name: '名片被收藏' },
      { cuIcon: 'goodsnew', color: 'purple', badge: 0, name: '商品浏览' },
      { cuIcon: 'share', color: 'purple', badge: 0, name: '商品被转发' },
      { cuIcon: 'same', color: 'purple', badge: 0, name: '获取电话号码' }
    ],
    gridCol: 3,
    dataItems: [0, 0, 0, 10, 8, 11, 7, 14, 12, 2, 15, 9],
    dataGroup: [],
    uniqueKey: -1,
    defaultType: 12,
    dataTimes: ['全部', '今天', '近两天', '最近7天', '最近15天'],
    dataIndexGroup: [12, 11, 5, 1, 6],
    pieItems: ['对我感兴趣', '对商品感兴趣'],
    multiArray: [['新增客户', '跟进客户', '客户活跃度'], ['近七天', '近一个月', '近三月', '近六月']],
    multiObjectArray: [
      [
        { id: 1, text: '新增客户'}, { id: 2, text: '新增客户'}, { id: 3, text: '客户活跃度'}
      ],
      [
        { id: 1, text: '近七天' }, { id: 2, text: '近一个月'}, { id: 3, text: '近三月' }, { id: 7, text: '近六月'}
      ]
    ],
    multiIndex: [0, 0],
    lineStatus: true,
    type: 12,
    complate: false
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    let defaultLineWidth = getSystem.getPx(678);
    let defaultLineHeight = getSystem.getPx(300);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      defaultLineHeight: defaultLineHeight,
      defaultLineWidth: defaultLineWidth,
      uniqueKey: uniqueKey
    }, () =>{
      this.initData(this.data.defaultType);
      this.initPieData();
      this.initLineData(1, 1);
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
  bindMultiPickerChange(event) {
    let currentMultiIndex = event.detail.value;
    let multiObjectArray = this.data.multiObjectArray;
    this.initLineData(multiObjectArray[0][currentMultiIndex[0]].id, multiObjectArray[1][currentMultiIndex[1]].id);
  },
  initData(type) {
    let dataItems = this.data.dataItems;
    let uniqueKey = this.data.uniqueKey;
    let promise = Promise.all(dataItems.map((item, index) => {
      let promise = new Promise((resolve, reject) => {
        if (index == 0) {
          // 累计客户
          remote.getCustomerCount(uniqueKey, type).then(res => {
            resolve(res.data);
          })
        } else if (index == 1) {
          // 累计访问量
          remote.getCustomerRecords(uniqueKey, type).then(res => {
            resolve(res.data);
          })
        } else if (index == 2) {
          // 累计跟进客户
          remote.getFollowupCustomerCount(uniqueKey, type).then(res => {
            resolve(res.data);
          })
        }
        else if (index == 11) {
          //获取电话号码
          remote.getPhones(uniqueKey, type).then(res => {
            resolve(res.data);
          })
        }
         else {
          // 剩下的数据
          // 我tm也不知道为什么要这样写接口，真的，你看到别气
          remote.getRadarRecordCount(uniqueKey, item, type).then(res => {
            resolve(res.data);
          })
        }
      })
      return promise;s
    }))
    let that = this;
    wx.hideLoading();
    promise.then(res => {
      this.setData({
        dataGroup: res,
        type: type,
        complate: true
      })
    })
  },
  initPieData() {
    let that = this;
    remote.getRadarRecordInterested(this.data.uniqueKey).then(res => {
      let item = res.data;
      let temp = [];
      temp.push(item.InterestedMePercentage);
      temp.push(item.InterestedProductPercentage);
      that.pie(temp);
    })
  },
  clicktap(event) {
    let index = event.currentTarget.dataset.index;
    let cuIconList = this.data.cuIconList;
    let type = this.data.type
    wx.navigateTo({
      url: `./detail?index=${index}&title=${cuIconList[index].name}&type=${type}&radarType=${this.data.dataItems[index]}`,
    })
  },
  initLineData(customersType, timesType) {
    let lineStatus = this.data.lineStatus;
    let xaxis = [], data = [];
    let _this = this;
    remote.getAIActive(this.data.uniqueKey, customersType, timesType).then(res => {
      let temp = res.data
      let cur = []
      switch (timesType) {
        case 1:
          for (let index = temp.length - 1; index >= 0; index--) {
            switch (temp[index].week) {
              case 1:
                cur.push(temp[index].totalCount)
                xaxis.push('星期一')
                break;
              case 2:
                cur.push(temp[index].totalCount)
                xaxis.push('星期二')
                break;
              case 3:
                cur.push(temp[index].totalCount)
                xaxis.push('星期三')
                break;
              case 4:
                cur.push(temp[index].totalCount)
                xaxis.push('星期四')
                break;
              case 5:
                cur.push(temp[index].totalCount)
                xaxis.push('星期五')
                break;
              case 6:
                cur.push(temp[index].totalCount)
                xaxis.push('星期六')
                break;
              case 7:
                cur.push(temp[index].totalCount)
                xaxis.push('星期日')
                break;
            }
          }
          data[0] = cur
          break;
        case 2:
          xaxis.push("起始")
          cur[0] = 0
          xaxis.push("近一月")
          cur[1] = temp[0].totalCount
          data[0] = cur
          break;
        case 3:
          xaxis.push('起始')
          cur[0] = 0
          xaxis.push("近三月")
          cur[1] = temp[0].totalCount
          xaxis.push('结束')
          cur[2] = 0
          data[0] = cur
          break;
        case 7:
          xaxis.push('起始')
          cur[0] = 0
          for (let index = temp.length - 1; index >= 0; --index) {
            switch (temp[index].month) {
              case 1:
                xaxis.push("近一月")
                cur[1] = temp[index].totalCount
                break;
              case 3:
                xaxis.push("近三月")
                cur[2] = temp[index].totalCount
                break;
              case 6:
                xaxis.push("近6月")
                cur[3] = temp[index].totalCount
                break;
            }
          }
          xaxis.push("结束")
          cur[4] = 0
          data[0] = cur
      }
      if (lineStatus) {
        _this.line(xaxis, data)
        _this.setData({
          lineStatus: false
        })
      } else {
        linechart.update({
          xaxis: xaxis, datas: data
        })
      }
    })
  },
  chooseTime() {
    wx.showLoading({
      title: '加载中',
    })
    let dataTimes = this.data.dataTimes;
    let dataIndexGroup = this.data.dataIndexGroup;
    let that = this;
    wx.showActionSheet({
      itemList: dataTimes,
      success: function (res) {
        let index = res.tapIndex;
        that.initData(dataIndexGroup[index]);
      }
    })
  },
  line(xaxis, datas) {
    linechart = new line({
      id: 'linechart',
      width: this.data.defaultLineWidth,
      height: this.data.defaultLineHeight,
      Ctx: linectx,
      xaxis: xaxis,
      datas: datas,
      hover: function (index, values, xaxis, _x) {
        let ctx = linechart.ctx;
        ctx.fillStyle = "#9d9d9d";
        let _rectX = _x - 32;
        _rectX = _rectX < 50 ? 50 : _rectX > 300 ? 300 : _rectX;
        ctx.fillRect(_rectX, 26, 64, 15);
        // text
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(xaxis + ':' + values, _rectX + 32, 35);
        ctx.closePath();
        ctx.stroke();
        ctx.draw(true);
      }
    });
    linechart.init();
  },
  linechartTouchstart(event) {
    if (event) {
      let e = event.touches[0];
      linechart.drawer.drawHover(e.x, e.y);        // 折线图的hover处理
    }
  },
  linechartTouchmove(event) {
    if (event) {
      let e = event.touches[0];
      linechart.drawer.drawHover(e.x, e.y);
    }
  },
  pie(res) {
    let that = this;
    let sum = 0;
    for (let i = 0; i < res.length; i++) {
      sum += res[i];
    }
    let temp = [];
    for (let i = 0; i < res.length; i++) {
      temp[i] = res[i] / sum;
    }
    piechart = new pie({
      id: 'piechart',
      datas: temp,
      colors: ['#ff8b90', '#e89ffd', '#92dcfd', '#b4ffc0', '#fee188'],
      width: that.data.defaultLineWidth - 100,
      height: that.data.defaultLineHeight
    })
    that.setData({
      pieDatas: res,
      colors: piechart.opts.colors
    })
    piechart.init();
  }
})