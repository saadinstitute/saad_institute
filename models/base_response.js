const arMsg = require("../localization/ar_msg.json");
const enMsg = require("../localization/en_msg.json");

class baseResponse {
  constructor({ data = {}, success, msg = "", lang = "en", status, pagination }) {
    this.data = data;
    this.success = success;
    if (!success) msg = handleErrorMessgae(msg);
    this.message = {
      ar: arMsg[msg] ?? msg,
      en: enMsg[msg] ?? msg
    }[lang];
    if (status === undefined) status = success ? 200 : 400;
    this.status = status;
    if (typeof pagination !== undefined) this.pagination = pagination;
  }
}

function handleErrorMessgae(msg) {
  try {
    let error;
    if (msg.name === "SequelizeUniqueConstraintError") {
      error = msg.errors[0].message;
    }
    return error ?? msg.message ?? msg;
  } catch (e) {
    return msg;
  }
}

module.exports = baseResponse;