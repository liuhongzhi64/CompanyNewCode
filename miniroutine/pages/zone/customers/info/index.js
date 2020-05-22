import remote from '../../../../service/remote.js';
import { image } from '../../../../request/index.js';
import constants from '../../../../common/constants.js';
import { messageList, createMessage, sendText } from '../../../../utils/imUtils.js';
import { getSystem, getCurrentDate, today } from '../../../../utils/util.js';
import TIM from 'tim-wx-sdk';
import { pie, line } from 'fundcharts';
const linectx = wx.createCanvasContext('linechart', this);
const piectx = wx.createCanvasContext('piechart', this);
let linechart, piechart;
const app = getApp();
Page({
  data: {
    tabItems: ['轨迹', 'AI分析', '跟进'],
    TabCur: 0,
    transform: 0,
    query: {},
    historyPage: {
      currentPage: 1,
      pageSize: 12,
      sort: 'desc'
    },
    date: '全部',
    defaultStartTime: '2019-01-01',
    defaultEndTime: '',
    historyList: [],
    historyCount: 0,
    records: [],
    pieItems: ['查看名片', '视频播放', '查看商品', '拨打电话', '转发名片'],
    currentSwiperItem: 0,
    complate: false
  },
  feedback(value) {
    this.setData({
      conversationList: value
    })
  },
  _getConversationList() {
    let that = this;
    messageList().then(res => {
      that.setData({
        conversationList: res.messageList
      })
    })
  },
  onLoad: function (options) {
    app.watch('messageList', this.feedback);
    let item = options['item'];
    if (item) {
      this.setData({
        userInfo: JSON.parse(item)
      })
    }
    let targetId = options.targetId;
    let screenHeight = getSystem.getScreenHeightRpx();
    let defaultLineWidth = getSystem.getPx(678);
    let defaultLineHeight = getSystem.getPx(300);
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    this.setData({
      targetId: targetId,
      uniqueKey: uniqueKey,
      screenHeight: screenHeight,
      defaultLineHeight: defaultLineHeight,
      defaultLineWidth: defaultLineWidth,
      historyMore: true,
    }, () => {
      this._getConversationList();
    })
  },
  onReady() {
    let item = this.data.userInfo;
    let that = this;
    let promise = new Promise((resolve, reject) => {
      if (item)  {
        resolve(item);
      } 
      // else {
      //   remote.getCardInfo(that.data.targetId).then(res => {
      //     let userInfo = res.data;
      //     // console.log(res,userInfo)
      //     userInfo.HeadPortraitUrl = image(userInfo.HeadPortraitUrl);
      //     resolve(userInfo);
      //   })
      // }
      else {

        // 从本地取企业编号然后在接口里传值
        let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在91引用

        // remote.getUserInformation(that.data.targetId).then(res => {
        remote.getUserInformation(that.data.targetId, merchantSysNo).then(res => {
          let userInfo = res.data;
          userInfo.HeadPortraitUrl = image(userInfo.HeadPortraitUrl);
          resolve(userInfo);
        })
      }
    })
    promise.then(res => {
      let user = res;
      let currentDate = today();
      let query = {
        userSysNo: user.CustomerSysNo || that.data.targetId,
        touserSysNo: that.data.uniqueKey,
        times: that.data.defaultStartTime,
        timesFinish: currentDate
      }
      that.setData({
        userInfo: user,
        defaultEndTime: currentDate,
        query: query
      }, () => {
        that.getHistory(that.data.query, that.data.historyPage);
        that.getRecords();
        that.pie();
        that.getLineDatas();
        that.getRelationship();
      })
    })
  },
  getRelationship() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在127引用

    // remote.getUserExsitCustomer(this.data.targetId, this.data.uniqueKey).then(res => {
    remote.getUserExsitCustomer(this.data.targetId, this.data.uniqueKey, merchantSysNo).then(res => {
      that.setData({
        hasRelation: res.success,
        cusId: res.data
      })
    })
  },
  switchTab(event) {
    this.setData({
      TabCur: event.detail.current
    })
  },
  getTargetUserInfo(targetId) {
    let that = this;
    // remote.getCardInfo(targetId).then(res => {
    //   let item = res.data;
    //   item.HeadPortraitUrl = image(item.HeadPortraitUrl);
    //   let currentDate = getCurrentDate();
    // })

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在145引用

    // remote.getUserInformation(targetId).then(res => {
    remote.getUserInformation(targetId, merchantSysNo).then(res => {
      let item = res.data;
      item.HeadPortraitUrl = image(item.HeadPortraitUrl);
      let currentDate = getCurrentDate();
    })
  },
  back() {
    wx.navigateBack({});
  },
  loadmore1(e) {
    let that = this;
    if (this.data.historyMore) {
      this.setData({
        loadingmore1: true
      }, () => {
        this.getHistory(this.data.query, that.data.historyPage);
        let timeset = setTimeout((callback) => {
          that.setData({
            loadingmore1: false
          })
        }, 1000, () => {
          clearTimeout(timeset);
        })
      })
    }
  },
  tabSelect(event) {
    // let TabCur = this.data.TabCur;
    // let id = event.currentTarget.dataset.id;
    // let currentTransform = currentTransform = - id * 750;
    // console.log(currentTransform)
    // this.setData({
    //   TabCur: id,
    //   transform: currentTransform
    // })
    this.setData({
      currentSwiperItem: event.currentTarget.dataset.id
    })
  },
  line(xaxis, datas) {
    linechart = new line({
      id: 'linechart',
      width: this.data.defaultLineWidth,
      height: this.data.defaultLineHeight,
      Ctx: linectx,
      xaxis: xaxis,
      data: datas,
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
  pie(datas) {
    let that = this;
    this.getPieData().then(res => {
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
        colors: ['#DFF6FE', '#B4E7FA', '#82D5F5', '#4CC5FC', '#23B7FD'],
        width: that.data.defaultLineWidth - 100,
        height: that.data.defaultLineHeight
      })
      that.setData({
        pieDatas: res,
        colors: piechart.opts.colors
      })
      piechart.init();
    })
  },
  bindDateChange1(event) {
    let date = event.detail.value;
    this.setData({
      startdate: date
    })
  },
  bindDateChange2(event) {
    let date = event.detail.value;
    this.setData({
      enddate: date
    })
  },
  searchByDate() {
    let query = this.data.query;
    let page = this.data.historyPage;
    page.currentPage = 1;
    query.times = this.data.startdate;
    query.timesFinish = this.data.enddate;
    this.setData({
      defaultStartTime: this.data.startdate,
      defaultEndTime: this.data.enddate || this.data.defaultEndTime,
      query: query,
      historyPage: page,
      historyMore: true,
      historyList: [],
      modalName: '',
      complate: false
    }, () => {
      this.getHistory(query, page);
    })
  },
  hideModal() {
    this.setData({
      modalName: ''
    })
  },
  getHistory(query, page) {
    let historyMore = this.data.historyMore;
    if (!historyMore) {
      wx.showToast({
        title: '没有了',
        icon: 'none'
      })
      return ;
    }
    let historyList = this.data.historyList;
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在289引用

    remote.getCustomerHistory(query, merchantSysNo, page).then(res => {
      let temp = res.data;
      for (let i = 0; i < temp.length; i++) {
        temp[i]['currentDate'] = (that.splitString(temp[i].VisitTime, 'T'))[0];
        temp[i]['currentTime'] = (that.splitString(temp[i].VisitTime, 'T'))[1];
        if (parseInt(temp[i].Phone) == 1) { // 后端接口写的就这样，真的是神逻辑，用一个Phone为0确定正常描述，1表示电话，大于1表示产品编号
          let strs = temp[i].Description.split('--->');
          temp[i]['pre'] = strs[0];
          temp[i]['phoneNumber'] = strs[1].split('<')[0];
          temp[i]['suf'] = strs[1].split('<')[1]; 
        }
        if (parseInt(temp[i].TimeSysNo) > 1) {
          let pro = temp[i].Description.split('<');
          temp[i]['pre'] = pro[0];
          temp[i]['phoneNumber'] = pro[1].split('>')[0];
          temp[i]['suf'] = pro[1].split('>')[1]; 
        }
      }
      page.currentPage += 1;
      if (temp.length < page.pageSize) {
        historyMore = false;
      }
      that.setData({
        historyList: historyList.concat(temp),
        historyCount: res.totalCount,
        page: page,
        historyMore: historyMore,
        complate: true
      })
    })
  },
  productDetail(event) {
    let goodsId = event.currentTarget.dataset.proid;
    wx.navigateTo({
      url: `../../goods/details/index?goodsId=${goodsId }`,
    })
  },
  callIt(event) {
    wx.makePhoneCall({
      phoneNumber: event.currentTarget.dataset.phone,
      fail() {
      }
    })
  },
  splitString(var1, splitChar) {
    if (var1.indexOf(splitChar) != -1) {
      let temp = var1.split(splitChar);
      return temp;
    } else {
      return var1;
    }
  },
  showModal() {
    this.setData({
      modalName: 'bottomModal'
    })
  },
  navigateToInfo() {
    let userInfo = JSON.stringify(this.data.userInfo);
    console.log(userInfo)
    wx.navigateTo({
      url: `./details?item=${userInfo}`,
    })
  },
  getRecords() {
    let that = this;
    let records = this.data.records;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在375引用

    remote.getFollowUpRecords(this.data.userInfo.CustomerSysNo || this.data.targetId, this.data.uniqueKey, merchantSysNo).then(res => {
      let temp = res.data;
      for (let i = 0; i < temp.length; i++) {
        temp[i]['currentDate'] = (that.splitString(temp[i].InDateStr, ' '))[0];
        temp[i]['currentTime'] = (that.splitString(temp[i].InDateStr, ' '))[1];
      }
      that.setData({
        records: records.concat(temp)
      })
    })
  },
  getPieData() {
    let pieData = this.data.pieData;
    let ids = [1, 3, 2, 8, 7];
    let colors = this.data.colors;
    let userInfo = this.data.userInfo;
    let uniqueKey = this.data.uniqueKey;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在388引用

    let promise = Promise.all(ids.map((item, index) => {
      return new Promise((resolve, reject) => {
        remote.getCustomerTypeCount(uniqueKey, userInfo.CustomerSysNo || this.data.targetId, item, merchantSysNo).then(res => {
          resolve(res.data);
        })
      })
    }))
   return promise;
  },
  getLineDatas() {
    let that = this;

    // 从本地取企业编号然后在接口里传值
    let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)

    remote.getAvtive(that.data.uniqueKey, that.data.userInfo.CustomerSysNo || this.data.targetId, 1, merchantSysNo).then(res => {
      let temp = res.data;
      let datas = [], xaxis = [];
      for (let i = 0; i < temp.length; i++) {
        datas.push(temp[i].totalCount);
        switch (temp[i].week) {
          case 1:
            xaxis.push('星期一')
            break;
          case 2:
            xaxis.push('星期二')
            break;
          case 3:
            xaxis.push('星期三')
            break;
          case 4:
            xaxis.push('星期四')
            break;
          case 5:
            xaxis.push('星期五')
            break;
          case 6:
            xaxis.push('星期六')
            break;
          case 7:
            xaxis.push('星期日')
            break;
        }
      }
      that.line(xaxis, datas);
    })
  },
  sendMessage(event) {
    let that = this;
    let conversationList = this.data.conversationList;
    let targetId = this.data.targetId;
    let temp = null;
    for (let i = 0; i < conversationList.length; i++) {
      if (conversationList[i].userProfile.userID == targetId.toString()) {
        temp = JSON.stringify(conversationList[i]);
        break;
      }
    }
    if (temp) { // 如果在会话中
      wx.navigateTo({
        url: `../../messages/board/index?conversation=${temp}`,
      })
    } else { // 没有在会话中的时候，发送消息来获取会话
      let uniqueKey = this.data.uniqueKey;
      sendText(createMessage({
        to: that.data.targetId.toString(),
        conversationType: TIM.TYPES.CONV_C2C,
        payload: {
          text: '您好！'
        }
      })).then(res => {
        wx.showLoading({
          title: '加载中',
        })
        setTimeout(() => {
          wx.hideLoading();
          that.sendMessage(event); // 回调
        }, 1000)
      })
    }
  },
  deleteSomeone() {
    let that = this;
    let temp = [];
    let hasRelation = this.data.hasRelation;
    if (hasRelation) {
      temp[0] = '转为客户'
    } else {
      temp[0] = '删除客户'
    }
    wx.showActionSheet({
      itemList: temp,
      success: function (res) {
        let tapIndex = res.tapIndex;
        if (tapIndex == 0) {
          wx.showLoading({
            title: '加载中',
          })
          if (hasRelation) {

            // 从本地取企业编号然后在接口里传值
            let merchantSysNo = wx.getStorageSync(constants.MerchantSysNo)//在496引用

            remote.addCusteomer({
              CustomerSysNo: that.data.targetId,
              InUserSysNo: that.data.uniqueKey,
              IntentionLevel: 22,
              Remarks: "",
              Source: 1,
              MerchantSysNo: merchantSysNo
            }).then(res => {
              wx.showToast({
                title: '添加成功',
                icon: 'none'
              })
            })
          } else {
            remote.deleteCustomer(that.data.cusId).then(res => {
              wx.showToast({
                title: '删除成功',
                icon: 'none'
              })
            })
          }
        }
      }
    })
  }
})