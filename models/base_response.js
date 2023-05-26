class baseResponse {
    constructor({data = {}, success = true, msg = "", status, pagination}) {
      this.data = data;
      this.success = success;
      this.message = msg;
      this.status = status ?? success?200:400;
      if(typeof pagination !== undefined) this.pagination = pagination;
    }
}

module.exports = baseResponse;