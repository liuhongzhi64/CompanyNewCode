import { get, post } from '../request/index.js';
// 接口文档
const remote = {
  // 登录（在pages/idnex.js 、pages/zone/messages/board/index.js）
  login(params) {
    return post('/WX_SmallProcedures/Login', params);
  },
  // 检查卡片是否存在
  checkCard(uniqueKey, merchantSysNo) {
    // return post(`/WX_SmallProcedures/ExistBusinesscard?userSysNo=${uniqueKey}`);//以前的
    return post(`/WX_SmallProcedures/ExistBusinesscard?userSysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`);
  },
  // 获取名片信息
  // getCardInfo(uniqueKey) {
  //   return get(`/WX_SmallProcedures/GetBusinessCardInfo?sysNo=${uniqueKey}`)
  // },
  getCardInfo(uniqueKey, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetBusinessCardInfo?sysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`)
  },
  // 获取客户详情的查看信息
  // getUserInformation(uniqueKey) {
  //   return get(`/WX_SmallProcedures/GetWXUserBySysNo?sysNo=${uniqueKey}`)
  // },
  getUserInformation(uniqueKey, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetWXUserBySysNo?sysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`)
  },
  // 创建二维码
  /**
   * @type 类型 1 个人 2商品
   */
  createQr(uniqueKey, type, data) {
    return post(`/WX_SmallProcedures/CardApp_GetPageQRCodeUrl?sysNo=${uniqueKey}&type=${type}`, data);
  },
  // 获取电话 （merchantSysNo是新加的值）
  getPhone(encryptedData, iV, userSysNo, merchantSysNo ) {
    return post('/WX_SmallProcedures/GetPhoneNumber', {
      encryptedData: encryptedData,
      iV: iV,
      userSysNo: userSysNo,
      merchantSysNo: merchantSysNo
    })
  },
  // 获取浏览记录
  historyItems(uniqueKey, page) {
    return post(`/WX_SmallProcedures/GetCustomerRecordsHomePage?userSysNo=${uniqueKey}`, page);
  },
  // 获取名片点赞情况
  // appreciateUserStatus(uniqueKey, targetUserId, type) {
  //   return post(`/WX_SmallProcedures/ExistPointPraise?visitorSysNo=${uniqueKey}&businessCardSysNo=${targetUserId}&type=${type}`);
  // },
  appreciateUserStatus(uniqueKey, targetUserId, type, merchantSysNo ) {
    return post(`/WX_SmallProcedures/ExistPointPraise?visitorSysNo=${uniqueKey}&businessCardSysNo=${targetUserId}&type=${type}&merchantSysNo=${merchantSysNo}`);
  },
  // 名片点赞
  // doAppreciateCard(targetUserId, uniqueKey, type) {
  //   return post(`/WX_SmallProcedures/UpdatePointRatio?touserSysNo=${targetUserId}&userSysNo=${uniqueKey}&type=${type}`);
  // },
  doAppreciateCard(targetUserId, uniqueKey, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/UpdatePointRatio?touserSysNo=${targetUserId}&userSysNo=${uniqueKey}&type=${type}&merchantSysNo=${merchantSysNo}`);
  },
  // 是否收藏名片
  // doCollectionStatus(targetUserId, uniqueKey, cardSysNo) {
  //   return post(`/WX_SmallProcedures/ExitsCollection?userSysNo=${targetUserId}&inUserSysNo=${uniqueKey}&cardSysNo=${cardSysNo}`)
  // },
  doCollectionStatus(targetUserId, uniqueKey, cardSysNo, merchantSysNo) {
    return post(`/WX_SmallProcedures/ExitsCollection?userSysNo=${targetUserId}&inUserSysNo=${uniqueKey}&cardSysNo=${cardSysNo}&merchantSysNo=${merchantSysNo}`)
  },
  // 收藏名片
  /**
   * UserSysNo: targetUserId,
      InUserSysNo: uniqueKey,
      BusinessCardSysNo: info.SysNo
   */
  doCollecteCard(data) {
    return post('/WX_SmallProcedures/InsertCollection', data);
  },
  // 获取原始微信的用户信息
  // getOriginWxInfo(uniqueKey) {
  //   return get(`/WX_SmallProcedures/GetWXUserInfo?userSysNo=${uniqueKey}`);
  // },
  getOriginWxInfo(uniqueKey, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetWXUserInfo?userSysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`);
  },
  // 查看是否为同乡
  // checkSamePlace(targetUserId, uniqueKey, type) {
  //   return get(`/WX_SmallProcedures/getFriend?UserSysNo=${targetUserId}&InUserSysNo=${uniqueKey}&Type=${type}`);
  // },
  checkSamePlace(targetUserId, uniqueKey, type, merchantSysNo) {
    return get(`/WX_SmallProcedures/getFriend?UserSysNo=${targetUserId}&InUserSysNo=${uniqueKey}&Type=${type}&merchantSysNo=${merchantSysNo}`);
  },
  // 添加是同乡/是校友
  createFrinds(data) {
    return post(`/WX_SmallProcedures/CreatFriend`, data);
  },
  // 删除是校友/是同乡
  // deleteFriends(uniqueKey, targetUserId, type) {
  //   return post(`/WX_SmallProcedures/CancelFriend?userSysNo=${uniqueKey}&cardUserSysNo=${targetUserId}&type=${type}`);
  // },
  deleteFriends(uniqueKey, targetUserId, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/CancelFriend?userSysNo=${uniqueKey}&cardUserSysNo=${targetUserId}&type=${type}&merchantSysNo=${merchantSysNo}`);
  },
  // 获取当前名片的标签
  // getLabels(uniqueKey, targetUserInfo) {
  //   return get(`/WX_SmallProcedures/GetLablesByUserSysNo?userSysNo=${uniqueKey}&cardUserSysNo=${targetUserInfo}`);
  // },
  getLabels(uniqueKey, targetUserInfo, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetLablesByUserSysNo?userSysNo=${uniqueKey}&cardUserSysNo=${targetUserInfo}&merchantSysNo=${merchantSysNo}`);
  },
  // 点赞标签
  likeLabel(data) {
    return post(`/WX_SmallProcedures/CreatLabelsandcompliments`, data);
  },
  // 获取留言列表
  // getCommentsList(targetUserId, uniqueKey, page) {
  //   return post(`/WX_SmallProcedures/SelectCommentPointRatioList?userSysNo=${targetUserId}&touserSysNo=${uniqueKey}`, page)
  // },
  getCommentsList(targetUserId, uniqueKey, page, merchantSysNo) {
    return post(`/WX_SmallProcedures/SelectCommentPointRatioList?userSysNo=${targetUserId}&touserSysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 获取评论管理
  // getComments(key, status, data) {
  //   return post(`/WX_SmallProcedures/GetComments?touserSysNo=${key}&status=${status}`, data);
  // },
  getComments(key, status, data, merchantSysNo) {
    return post(`/WX_SmallProcedures/GetComments?touserSysNo=${key}&status=${status}&merchantSysNo=${merchantSysNo}`, data);
  },
  // 评论点赞或者取消点赞
  // type: 0 点赞 1 取消
  // updateLiked(uniqueKey, targetUserId, type) {
  //   return post(`/WX_SmallProcedures/UpdateCommentPointRatio?userSysNo=${uniqueKey}&touserSysNo=${targetUserId}&sysNo=${type}`);
  // },
  updateLiked(uniqueKey, targetUserId, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/UpdateCommentPointRatio?userSysNo=${uniqueKey}&touserSysNo=${targetUserId}&sysNo=${type}&merchantSysNo=${merchantSysNo}`);
  },
  // 浏览过的名片
  // getSelfHistory(uniqueKey, page) {
  //   return post(`/WX_SmallProcedures/GetCustomerRecordsOthers?userSysNo=${uniqueKey}`, page)
  // },
  getSelfHistory(uniqueKey, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetCustomerRecordsOthers?userSysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 访客记录
  // getMyRecords(userSysNo, touserSysNo, times, timesFinish, sortType, page) {
  //   return post(`/WX_SmallProcedures/GetCustomerRecords?userSysNo=${userSysNo}&touserSysNo=${touserSysNo}&times=${times}&timesFinish=${timesFinish}&sortType=${sortType}`, page)
  // },
  getMyRecords(userSysNo, touserSysNo, times, timesFinish, sortType, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetCustomerRecords?userSysNo=${userSysNo}&touserSysNo=${touserSysNo}&times=${times}&timesFinish=${timesFinish}&sortType=${sortType}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 修改用户
  updateWxUser(data) {
    return post('/WX_SmallProcedures/UpdateWXUser', data);
  },
  // 获取用户商品包
  // getUserPackage(uniqueKey) {
  //   return get(`/WX_SmallProcedures/GetUserPackage?userSysNo=${uniqueKey}`)
  // },
  getUserPackage(uniqueKey, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetUserPackage?userSysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`)
  },
  // 创建照片
  createImages(data) {
    return post('/WX_SmallProcedures/CreatCoustomermedia', data);
  },
  // 删除照片
  deleteImages(data) {
    return post('/WX_SmallProcedures/DeleteCoustomermedia', data);
  },
  // 修改照片
  updateImages(data) {
    return post('/WX_SmallProcedures/UpdateCoustomermedia', data);
  },
  // 获取媒体
  // getMedia(key, type) {
  //   return get('/WX_SmallProcedures/GetCoustomermedia', {
  //     coustomerSysNo: key,
  //     type: type
  //   });
  // },
  getMedia(key, type, merchantSysNo) {
    return get('/WX_SmallProcedures/GetCoustomermedia', {
      coustomerSysNo: key,
      type: type,
      merchantSysNo: merchantSysNo
    });
  },
  // 新增批发商与使用用户关系联系
  insertRelationship(data) {
    return post(`/WX_SmallProcedures/InsertRelationship`, data);
  },
  // 获取公司信息
  // getCompanyInfo(uniqueKey) {
  //   return get(`/WX_SmallProcedures/GetCompanyInformation?userSysNo=${uniqueKey}`);
  // },
  getCompanyInfo(uniqueKey, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetCompanyInformation?userSysNo=${uniqueKey}&merchantSysNo=${merchantSysNo}`);
  },
  // 修改公司信息
  updateCompany(data) {
    return post('/WX_SmallProcedures/UpdateCompanyInformation', data);
  },
  // 获取公司分类
  getCompanyCategory() {
    return get('/WX_SmallProcedures/GetIndustryType')
  },
  // 获取职位
  getPositions() {
    return get('/WX_SmallProcedures/GetPositon')
  },
  // 添加公司信息
  insertCompany(data) {
    return post(`/WX_SmallProcedures/InsertCompanyInformation`, data);
  },
  // 获取当前用户自己的标签
  // getCurrentUserLabel(key) {
  //   return get(`/WX_SmallProcedures/GetCurrentUserLabelByUserSysNo?userSysNo=${key}`);
  // },
  getCurrentUserLabel(key, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetCurrentUserLabelByUserSysNo?userSysNo=${key}&merchantSysNo=${merchantSysNo}`);
  },
  // 删除当前用户自己的标签
  deleteCurrentUserLabel(key) {
    return post(`/WX_SmallProcedures/DeleteCurrentUserLabelByUserSysNo?sysNo=${key}`);
  },
  // 添加标签
  createTags(data) {
    return post('/WX_SmallProcedures/InsertLables', data)
  },
  /**
   * 创建名片
   */
  createBusinessCard(data) {
    return post('/WX_SmallProcedures/CreatBusinesscard', data);
  },
  // 获取收藏列表
  // getCollectionList(key, name) {
  //   return get('/WX_SmallProcedures/GetCollectionList', {
  //     userSysNo: key,
  //     name: name
  //   });
  // },
  getCollectionList(key, name, merchantSysNo) {
    return get('/WX_SmallProcedures/GetCollectionList', {
      userSysNo: key,
      name: name,
      merchantSysNo: merchantSysNo
    });
  },
  // 添加留言
  insertComment(data) {
    return post('/WX_SmallProcedures/CreatComment', data)
  },
  // 删除评论
  deleteComment(sysNo) {
    return post(`/WX_SmallProcedures/DeleteCommentsSysNo?sysNo=${sysNo}`)
  },
  updateCommentStatus(key, status) {
    return post(`/WX_SmallProcedures/UpdateCommentStstus?sysNo=${key}&status=${status}`);
  },
  // 获取当前用户的客户列表
  // getCustomerList(key, source, times, timesFinish, type, levelName, page) {
  //   return post(`/WX_SmallProcedures/GetSmCustomerList?userSysNo=${key}&source=${source}&times=${times}&timesFinish=${timesFinish}&type=${type}&levelName=${levelName}`, page);
  // },
  getCustomerList(key, source, times, timesFinish, type, levelName, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetSmCustomerList?userSysNo=${key}&source=${source}&times=${times}&timesFinish=${timesFinish}&type=${type}&levelName=${levelName}&merchantSysNo=${merchantSysNo}`, page);
  },
  //获取某位客户的意向等级
  // getIntentionLevel(userSysNo, inUserSysNo) {
  //   return get(`/WX_SmallProcedures/GetIntentionLevel?userSysNo=${userSysNo}&inUserSysNo=${inUserSysNo}`)
  // },
  getIntentionLevel(userSysNo, inUserSysNo, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetIntentionLevel?userSysNo=${userSysNo}&inUserSysNo=${inUserSysNo}&merchantSysNo=${merchantSysNo}`)
  },
  // 获取目标客户对当前用户的浏览记录
  /**
   * query {
   *  userSysNo: 目标用户
   *  touserSysNo: 当前用户
   *  times: 开始时间
   *  timesFinish: 结束时间
   * }
   */
  // getCustomerHistory(query, page) {
  //   return post(`/WX_SmallProcedures/GetTimeTrajectory?userSysNo=${query.userSysNo}&touserSysNo=${query.touserSysNo}&times=${query.times}&timesFinish=${query.timesFinish}`, page)
  // },
  getCustomerHistory(query, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetTimeTrajectory?userSysNo=${query.userSysNo}&touserSysNo=${query.touserSysNo}&times=${query.times}&timesFinish=${query.timesFinish}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 获取跟进
  // getFollowUpRecords(userSysNo, touserSysNo) {
  //   return get(`/WX_SmallProcedures/GetFollowupCustomer?userSysNo=${userSysNo}&touserSysNo=${touserSysNo}`)
  // },
  getFollowUpRecords(userSysNo, touserSysNo, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetFollowupCustomer?userSysNo=${userSysNo}&touserSysNo=${touserSysNo}&merchantSysNo=${merchantSysNo}`)
  },
  // 获取兴趣数据
  // getCustomerTypeCount(userSysNo, vistorSysNo, visitType) {
  //   return get(`/WX_SmallProcedures/GetCustomerTypeCount?userSysNo=${userSysNo}&visitorSysNo=${vistorSysNo}&visitType=${visitType}`)
  // },
  getCustomerTypeCount(userSysNo, vistorSysNo, visitType, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetCustomerTypeCount?userSysNo=${userSysNo}&visitorSysNo=${vistorSysNo}&visitType=${visitType}&merchantSysNo=${merchantSysNo}`)
  },
  // AI 客户折线图
  // getAvtive(userSysNo, visitorSysNo, timesType) {
  //   return get(`/WX_SmallProcedures/GetCustomerActivity?userSysNo=${userSysNo}&visitorSysNo=${visitorSysNo}&timesType=${timesType}`)
  // },
  getAvtive(userSysNo, visitorSysNo, timesType, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetCustomerActivity?userSysNo=${userSysNo}&visitorSysNo=${visitorSysNo}&timesType=${timesType}&merchantSysNo=${merchantSysNo}`)
  },
  // 添加跟进
  insertRecord(data) {
    return post('/WX_SmallProcedures/InsterFollowupCustomer', data)
  },
  // 添加意向等级
  insertIntentionLevel(data) {
    return post(`/WX_SmallProcedures/InsertIntentionLevel`, data)
  },
  // 修改意向等级
  updateIntentionLevel(data) {
    return post(`/WX_SmallProcedures/updateIntentionLevel`, data)
  },
  // 删除当前用户自己的标签
  deleteCurrentUserLabel(key) {
    return post(`/WX_SmallProcedures/DeleteCurrentUserLabelByUserSysNo?sysNo=${key}`);
  },
  // 添加标签
  createTags(data) {
    return post('/WX_SmallProcedures/InsertLables', data)
  },
  // 累计客户(人)
  // getCustomerCount(userId, type) {
  //   return post(`/WX_SmallProcedures/GetCustomerCountByOne?userSysNo=${userId}&type=${type}`)
  // },
  getCustomerCount(userId, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/GetCustomerCountByOne?userSysNo=${userId}&type=${type}&merchantSysNo=${merchantSysNo}`)
  },
  // 累计客户(人) 详情
  // getCustomerInfoBySysNo(userId, type, sortType, page) {
  //   return post(`/WX_SmallProcedures/GetCustomerInfoBySysNo?userSysNo=${userId}&type=${type}&sortType=${sortType}`, page)
  // },
  getCustomerInfoBySysNo(userId, type, sortType, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetCustomerInfoBySysNo?userSysNo=${userId}&type=${type}&sortType=${sortType}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 累计访问量(次)
  // getCustomerRecords(userId, type) {
  //   return post(`/WX_SmallProcedures/GetCustomerRecordsCount?userSysNo=${userId}&type=${type}`)
  // },
  getCustomerRecords(userId, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/GetCustomerRecordsCount?userSysNo=${userId}&type=${type}&merchantSysNo=${merchantSysNo}`)
  },
  // 累计访问量(次) 详情
  // getCustomerRecordsBySysNo(userId, type, sortType, page) {
  //   return post(`/WX_SmallProcedures/GetCustomerRecordsBySysNo?userSysNo=${userId}&type=${type}&sortType=${sortType}`, page)
  // },
  getCustomerRecordsBySysNo(userId, type, sortType, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetCustomerRecordsBySysNo?userSysNo=${userId}&type=${type}&sortType=${sortType}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 累计咨询(次)
  getConsultationCount(userId, type) {
    return get(`/WX_SmallProcedures/GetConsultationCount?userSysNo=${userId}&type=${type}`)
  },
  // 累计咨询(次) 详情
  getConsultationBySysNo(userId, type) {
    return post(`/WX_SmallProcedures/GetConsultationBySysNo?userSysNo=${userId}&type=${type}`)
  },
  // 累计跟进客户(次)
  // getFollowupCustomerCount(userId, type) {
  //   return post(`/WX_SmallProcedures/GetfollowupcustomerCount?userSysNo=${userId}&type=${type}`)
  // },
  getFollowupCustomerCount(userId, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/GetfollowupcustomerCount?userSysNo=${userId}&type=${type}&merchantSysNo=${merchantSysNo}`)
  },
  // 累计跟进客户(次) 详情
  // getFollowupCustomerBySysNo(userId, type, sortType, page) {
  //   return post(`/WX_SmallProcedures/GetfollowupcustomerBySysNo?userSysNo=${userId}&type=${type}&sortType=${sortType}`, page)
  // },
  getFollowupCustomerBySysNo(userId, type, sortType, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetfollowupcustomerBySysNo?userSysNo=${userId}&type=${type}&sortType=${sortType}&merchantSysNo=${merchantSysNo}`, page)
  },
  //AI雷达累计电话、微信复制、名片被转发(次)、名片被点赞、名片被保存、商品浏览、商品被转发、VR720(浏览)
  // getRadarRecordCount(userId, radarType, type) {
  //   return post(`/WX_SmallProcedures/GetRadarRecordCount?userSysNo=${userId}&radarType=${radarType}&type=${type}`)
  // },
  getRadarRecordCount(userId, radarType, type, merchantSysNo) {
    return post(`/WX_SmallProcedures/GetRadarRecordCount?userSysNo=${userId}&radarType=${radarType}&type=${type}&merchantSysNo=${merchantSysNo}`)
  },
  // AI雷达累计电话、微信复制、名片被转发(次)、名片被点赞、名片被保存、商品浏览、商品被转发、VR720(浏览) 详情
  // getRadarRecordBySysNo(userId, radarType, type, sortType, page) {
  //   return post(`/WX_SmallProcedures/GetRadarRecordBySysNo?userSysNo=${userId}&radarType=${radarType}&type=${type}&sortType=${sortType}`, page)
  // },
  getRadarRecordBySysNo(userId, radarType, type, sortType, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetRadarRecordBySysNo?userSysNo=${userId}&radarType=${radarType}&type=${type}&sortType=${sortType}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 获取电话号码：
  // getPhones(userSysNo,type){
  //   return get(`/WX_SmallProcedures/GetPhoneCountByUserSysNo?userSysNo=${userSysNo}&type=${type}`)
  // },
  // getPhones(userSysNo,type){
  //   return get(`/WX_SmallProcedures/GetPhoneAndExchangePhone?userSysNo=${userSysNo}&type=${type}`)
  // },
  getPhones(userSysNo, type, merchantSysNo){
    return get(`/WX_SmallProcedures/GetPhoneAndExchangePhone?userSysNo=${userSysNo}&type=${type}&merchantSysNo=${merchantSysNo}`)
  },
  // 获取电话号码详情
  // (这是以前的)
  // getUserPhone(userId, radarType, type, sortType, page) {
  //   return post(`/WX_SmallProcedures/GetTelephoneByUserSysNo?userSysNo=${userId}&radarType=${radarType}&type=${type}&sortType=${sortType}`, page)
  // 这是修改后的
  // getUserPhone(userId, type, phoneType, page) {
  //   return post(`/WX_SmallProcedures/GetPhoneByUserSysNo?userSysNo=${userId}&type=${type}&phoneType=${phoneType}`, page)
  // },
  getUserPhone(userId, type, phoneType, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetPhoneByUserSysNo?userSysNo=${userId}&type=${type}&phoneType=${phoneType}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 兴趣占比
  // getRadarRecordInterested(userSysNo) {
  //   return get(`/WX_SmallProcedures/GetRadarRecordInterested?userSysNo=${userSysNo}`);
  // },
  getRadarRecordInterested(userSysNo, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetRadarRecordInterested?userSysNo=${userSysNo}&merchantSysNo=${merchantSysNo}`);
  },
  // AI 雷达折线图
  // getAIActive(userSysNo, customersType, timesType) {
  //   return get(`/WX_SmallProcedures/GetDataStatistics?userSysNo=${userSysNo}&customersType=${customersType}&timesType=${timesType}`)
  // },
  getAIActive(userSysNo, customersType, timesType, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetDataStatistics?userSysNo=${userSysNo}&customersType=${customersType}&timesType=${timesType}&merchantSysNo=${merchantSysNo}`)
  },
  // 获取审核列表
  // getRelationShip(userSysNo, status, page) {
  //   return post(`/WX_SmallProcedures/GetRelationShip?userSysNo=${userSysNo}&status=${status}`, page)
  // },
  getRelationShip(userSysNo, status, merchantSysNo, page) {
    return post(`/WX_SmallProcedures/GetRelationShip?userSysNo=${userSysNo}&status=${status}&merchantSysNo=${merchantSysNo}`, page)
  },
  // 审核
  // updateAudit(sysno, status) {
  //   return post(`/WX_SmallProcedures/UpdateAudit?sysNo=${sysno}&status=${status}`)
  // },
  updateAudit(sysno, status, merchantSysNo) {
    return post(`/WX_SmallProcedures/UpdateAudit?sysNo=${sysno}&status=${status}&merchantSysNo=${merchantSysNo}`)
  },
  // vip查询
  // vipCheck(sysNo) {
  //   return get(`/WX_SmallProcedures/GetUserVIPInfo?userSysNo=${sysNo}`)
  // },
  vipCheck(sysNo, merchantSysNo) {
    return get(`/WX_SmallProcedures/GetUserVIPInfo?userSysNo=${sysNo}&merchantSysNo=${merchantSysNo}`)
  },
  // isPass(userSysNo) {
  //   return post(`/WX_SmallProcedures/SelectAudit?userSysNo=${userSysNo}`)
  // },
  isPass(userSysNo, merchantSysNo) {
    return post(`/WX_SmallProcedures/SelectAudit?userSysNo=${userSysNo}&merchantSysNo=${merchantSysNo}`)
  },
  // 转为客户或者添加备注
  /**
   * CustomerSysNo: 156
      InUserSysNo: 79
      IntentionLevel: 22
      Remarks: ""
      Source: 1
   */
  addCusteomer(data) {
    return post('/WX_SmallProcedures/InsterCustomer', data)
  },
  // 获取用户是否存在某位客户
  // getUserExsitCustomer(CustomerSysNo, UserSysNo) {
  //   return post(`/WX_SmallProcedures/QuerySMCustomer?CustomerSysNo=${CustomerSysNo}&UserSysNo=${UserSysNo}`)
  // },
  getUserExsitCustomer(CustomerSysNo, UserSysNo, merchantSysNo) {
    return post(`/WX_SmallProcedures/QuerySMCustomer?CustomerSysNo=${CustomerSysNo}&UserSysNo=${UserSysNo}&merchantSysNo=${merchantSysNo}`)
  },
  deleteCustomer(sysNo) {
    return post(`/WX_SmallProcedures/DeleterCustomer?sysNo=${sysNo}`);
  },
  insertRecords(data) {
    return post(`/WX_SmallProcedures/InsertCustomerrecords`, data)
  },
  // 删除名片夹
  deleteCollection(sysNo) {
    return post(`/WX_SmallProcedures/DeleteCollection?sysNo=${sysNo}`);
  },
  // 更新模板
  updateTemplate(data) {
    return post('/WX_SmallProcedures/UpdateTemplateSysNo', data);
  },
}

export default remote;