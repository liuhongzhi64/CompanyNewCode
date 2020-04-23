import TIM from 'tim-wx-sdk';
import COS from "cos-wx-sdk-v5";
import { getSign } from '../service/im.js';
import constants from '../common/constants.js';
import { parseTime } from '../utils/util.js';

let options = {
  SDKAppID: 1400271370 // 接入时需要将0替换为您的即时通信 IM 应用的 SDKAppID
};
// 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
let tim = TIM.create(options); // SDK 实例通常用 tim 表示
// 设置 SDK 日志输出级别，详细分级请参见 setLogLevel 接口的说明
tim.setLogLevel(0); // 普通级别，日志量较多，接入时建议使用
// tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用

// 注册 COS SDK 插件
tim.registerPlugin({ 'cos-wx-sdk': COS });

const securityKey = '064667f38f6030742ee19508c56666a1181477f9f1cc9423e003fb8b97c25b83';
// 消息列表
/**
 * {conversationID: 'C2Ctest', nextReqMessageID, count: 15}
 */
export function messages(params) {
  let promise = new Promise((resolve, reject) => {
    tim.getMessageList(params).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err)
    })
  })
  return promise;
}
export function setMessageRead(conversationID) {
  // 将某会话下所有未读消息已读上报
  return tim.setMessageRead({ conversationID: conversationID });
}
// 更新资料
export function updateProfile () {
  let userInfo = wx.getStorageSync(constants.USERINFO);
  // 修改个人标配资料
  let promise = tim.updateMyProfile({
    nick: userInfo.Name,
    avatar: userInfo.HeadPortraitUrl,
    selfSignature: userInfo.CompanyName || "",
  });
  promise.then(function (imResponse) {
  }).catch(function (imError) {
    console.warn('updateMyProfile error:', imError); // 更新资料失败的相关信息
  });
}
function sortMessageList(list) {
  // 以最新联系时间排序
  // 初次获取未读消息个数
  if (list.length == 0 || list == null) {
    return ;
  }
  let unreadcount = 0;
  for (let i = 0; i < list.length; i++) {
    unreadcount += list[i].unreadCount;
    for (let j = i; j > 0 && less(list[j - 1], list[j]); j--) {
      exchange(list, j - 1, j);
    }
  }
  for (let z = 0; z < list.length; z++) {
    if (!isNaN(Number(list[z].lastMessage.lastTime))) {
      list[z].lastMessage.lastTime = parseTime(list[z].lastMessage.lastTime);
    }
  }
  return unreadcount;
}

function exchange(array, preIndex, sufIndex) {
  if (array && array.length > 0) {
    let temp = array[preIndex];
    array[preIndex] = array[sufIndex];
    array[sufIndex] = temp;
  }
}

function less(prefix, suffix) {
  if (prefix && suffix) {
    return prefix.lastMessage.lastTime < suffix.lastMessage.lastTime;
  }
  return false;
}
export function removeConversation(conversationID) {
  let promise = tim.deleteConversation(conversationID);
  promise.then(function (imResponse) {
    //删除成功。
    const { conversationID } = imResponse.data;// 被删除的会话 ID
  }).catch(function (imError) {
    console.warn('deleteConversation error:', imError); // 删除会话失败的相关信息
  });
}
export function addblockList(userIdList) {
  let promise = tim.addToBlacklist({ userIDList: userIdList }); // 请注意：即使只添加一个用户帐号到黑名单，也需要用数组类型，例如：userIDList: ['user1']
  promise.then(function (imResponse) {
    //console.log(imResponse.data); // 成功添加到黑名单的账号信息，结构为包含用户 userID 的数组 - [userID]
  }).catch(function (imError) {
    //console.warn('addToBlacklist error:', imError); // 添加用户到黑名单列表失败的相关信息
  });
}
// 获取消息列表
export function messageList() {
  // 拉取会话列表
  let promise = new Promise((resolve, reject) => {
    tim.getConversationList().then(function (imResponse) {
      const conversationList = imResponse.data.conversationList; // 会话列表，用该列表覆盖原有的会话列表
      let unreadcount = sortMessageList(conversationList);
      resolve({
        unreadcount: unreadcount,
        messageList: conversationList
      })
    }).catch(function (imError) {
      reject(imError)
      console.warn('getConversationList error:', imError); // 获取会话列表失败的相关信息
    });
  })
  console.log(promise)
  return promise;
}

// 登录im即时通讯
export function imLogin(userId) {
  getSign(1400271370, '064667f38f6030742ee19508c56666a1181477f9f1cc9423e003fb8b97c25b83', userId).then(res => {
    tim.login({
      userID: userId.toString(),
      userSig: res.userSign
    }).then(res => {
      const app = getApp();
      // 如果后期改动需要在全局引入getApp()对象，请在函数或者对象内引用，防止在app.js里面
      // 引入js文件后出现重复引用的错误，导致应用无法启动;
      app.globalData.hadLogin = true;
    })
  })
}

// 登出
export function imLoginOut(userId) {
  let promise = tim.logout();
  promise.then(function (imResponse) {
    console.log("IM即时通讯登出成功  =====>  " + imResponse.data); // 登出成功
  }).catch(function (imError) {
    console.warn('logout error:', imError);
  });
}
export function createMessage(params) {
  // 发送文本消息，Web 端与小程序端相同
  // 1. 创建消息实例，接口返回的实例可以上屏
  return tim.createTextMessage(params);
}

export function createImageMessage(params) {
  return tim.createImageMessage(params);
}
export function createAudioMessage(params) {
  return tim.createAudioMessage(params);
}
export function sendText(message) {
  let promise = new Promise((resolve, reject) => {
    tim.sendMessage(message).then(function (imResponse) {
      // 发送成功
      resolve(imResponse)
    }).catch(function (imError) {
      // 发送失败
      reject({success: false})
      console.warn('sendMessage error:', imError);
    });
  })
  return promise;
}
// 监听事件
// 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
tim.on(TIM.EVENT.SDK_READY, function (event) {
  updateProfile();
  messageList().then(res => {
    const app = getApp();
    app.globalData.messageList = res.messageList;
    app.globalData.unreadcount = res.unreadcount;
  });
});

// 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
// 绑定app的golbalData的meesage_list字段，通过遍历原集合来确定
tim.on(TIM.EVENT.MESSAGE_RECEIVED, function (event) {
  console.log('收到消息')
  console.log(event)
  const app = getApp();
  app.globalData.newMessages = event.data;
   wx.vibrateLong();
});

// 收到消息被撤回的通知
tim.on(TIM.EVENT.MESSAGE_REVOKED, function (event) {
});
// 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
// 有新的回话会触发这个事件
tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
  // console.log(event)
  // console.log('会话更新')
  let list = event.data;
  let count = sortMessageList(list);
  const app = getApp();
  app.globalData.messageList = list;
  app.globalData.unreadcount = count;
});

// 收到自己或好友的资料变更通知
tim.on(TIM.EVENT.PROFILE_UPDATED, function (event) {
});

// 收到黑名单列表更新通知
tim.on(TIM.EVENT.BLACKLIST_UPDATED, function (event) {
});

// 收到 SDK 发生错误通知，可以获取错误码和错误信息
tim.on(TIM.EVENT.ERROR, function (event) {
});

// 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
tim.on(TIM.EVENT.SDK_NOT_READY, function (event) {
});

// 收到被踢下线通知
tim.on(TIM.EVENT.KICKED_OUT, function (event) {
  //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
  //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
  //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢
  console.log(event);
  if (event.data.type == "mutipleAccount") {
    let uniqueKey = wx.getStorageSync(constants.UNIQUE_KEY);
    if (uniqueKey) {
      imLogin(uniqueKey);
    }
  }
});