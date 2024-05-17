const $OpenApi = require("@alicloud/openapi-client");
const { link_1_0: $dingtalklink_1_0 } = require("@alicloud/dingtalk/dist");
const $Util = require("@alicloud/tea-util");

module.exports = {
  createClient() {
    const config = new $OpenApi.Config({});
    config.protocol = "https";
    config.regionId = "central";
    return new $dingtalklink_1_0.default(config);
  },

  $dingtalklink_1_0,
  $Util,
};
