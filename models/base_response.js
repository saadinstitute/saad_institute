class baseResponse {
    constructor({data = {}, success, msg = "", status, pagination}) {
      this.data = data;
      this.success = success;
      this.message = msg;
      if(status === undefined) status = success ? 200 : 400;
      this.status = status;
      if(typeof pagination !== undefined) this.pagination = pagination;
    }
}

module.exports = baseResponse;