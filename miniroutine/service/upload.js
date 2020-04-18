import { upload } from '../request/index.js';
const uploadFiles = (uniqueKey, type, paths) => {
  return upload(`/WX_SmallProcedures/UploadFile?userSysNo=${uniqueKey}&type=${type}`, paths);
}

module.exports = {
  uploadFiles: uploadFiles
}