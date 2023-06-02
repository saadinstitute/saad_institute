const arMsg = require("../localization/ar_msg.json");
const enMsg = require("../localization/en_msg.json");

class baseResponse {
    constructor({data = {}, success, msg = "", lang = "en", status, pagination}) {
      this.data = data;
      this.success = success;
      this.messages = {
        ar: arMsg[msg] ?? msg,
        en: enMsg[msg] ?? msg
      }[lang];
      if(status === undefined) status = success ? 200 : 400;
      this.status = status;
      if(typeof pagination !== undefined) this.pagination = pagination;
    }
}

module.exports = baseResponse;