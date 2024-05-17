const $OpenApi = require("@alicloud/openapi-client");
const { yida_1_0: $dingtalkyida_1_0 } = require("@alicloud/dingtalk/dist");
const $Util = require("@alicloud/tea-util");

module.exports = {
  createClient() {
    const config = new $OpenApi.Config({});
    config.protocol = "https";
    config.regionId = "central";
    return new $dingtalkyida_1_0.default(config);
  },

  $dingtalkyida_1_0,
  $Util,
};
