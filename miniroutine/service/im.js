import { get, post } from '../request/index.js';

// 获取签名
export function getSign(sdkappid, securityKey, userId) {
  let promise = new Promise((resolve, reject) => {
    post(`/WX_SmallProcedures/GenerateUserSigin?sdkappid=${sdkappid}&key=${securityKey}&userID=${userId}`).then(res => {
      resolve({ userSign: res.data });
    }).catch(err => {
      reject(err)
    })
  })
  return promise;
}

