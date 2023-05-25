class baseResponse {
    constructor({data = {}, extra = {}, success = true, msg = "", pagination}) {
      this.data = data;
      let meta = {};
      if(extra.size !== 0) meta.extra = extra;
      meta = {success, msg};
      this.meta = meta;
      if(typeof pagination !== undefined) this.pagination = pagination;
    }
}

module.exports = baseResponse;