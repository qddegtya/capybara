const $OpenApi = require("@alicloud/openapi-client");
const { crm_1_0: $dingtalkcrm_1_0 } = require("@alicloud/dingtalk/dist");
const $Util = require("@alicloud/tea-util");

module.exports = {
  createClient() {
    const config = new $OpenApi.Config({});
    config.protocol = "https";
    config.regionId = "central";
    return new $dingtalkcrm_1_0.default(config);
  },

  $dingtalkcrm_1_0,
  $Util,
};
