const express = require("express");
const path = require("path");
const {
  HTTP_CLIENT,
  CACHE_KEYS,
  APP_KEY,
  APP_SECRET,
} = require("../constants");
const Cache = require("../utils/cache");
const dayjs = require("dayjs");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const cache = Cache();
const AJS = require("xajs");

// 宜搭相关
const yida = require("../modules/yida");

// 开放平台
const crm = require("../modules/crm");

// link
const link = require("../modules/link");

const ProxyServer = ({ port = 9000 } = {}) => {
  const server = express();

  server.set("view engine", "ejs");
  server.set("views", path.join(__dirname, "./ui"));
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  const defaultIntercepter = () => () => void 0;

  const getAccessToken = (cb, error = () => void 0) => {
    console.log("[openplatform-dingtalk-proxy-server]: request access token.");
    HTTP_CLIENT.get(`/gettoken?appkey=${APP_KEY}&appsecret=${APP_SECRET}`)
      .then(({ data }) => {
        cb(data);
      })
      .catch((e) => {
        error(e);
      });
  };

  const ready = (cb) => {
    const fallback = () => {
      console.log(
        "[openplatform-dingtalk-proxy-server]: fallback to get access token."
      );
      getAccessToken((data) => {
        const { expires_in } = data;
        cache.put(
          CACHE_KEYS.ACCESS_TOKEN,
          JSON.stringify({
            // 计算过期时间
            expiration_time: dayjs().add(expires_in, "second"),
            ...data,
          })
        );

        console.log("[openplatform-dingtalk-proxy-server]: token get.");

        try {
          // 这个时候肯定还没过期，先直接拿过去用
          cb(data);
        } catch (error) {
          console.log(error);
        }
      });
    };

    cache
      .get(CACHE_KEYS.ACCESS_TOKEN)
      .then(({ data }) => {
        const cacheResult = JSON.parse(data.toString());
        const { expiration_time } = cacheResult;
        const exp = dayjs(expiration_time).valueOf();
        const now = dayjs().valueOf();

        // now >= exp
        if (now >= exp) {
          console.log("[openplatform-dingtalk-proxy-server]: cache expired.");

          // 直接废弃，节省磁盘空间
          // 确保清理干净后再降级
          cache.clear().then(() => {
            console.log("[openplatform-dingtalk-proxy-server]: clear cache.");
            fallback();
          });
        } else {
          console.log("[openplatform-dingtalk-proxy-server]: cache get.");

          try {
            cb(cacheResult);
          } catch (error) {
            console.log(error);
          }
        }
      })
      .catch((e) => {
        console.log("[openplatform-dingtalk-proxy-server]: no this key.");
        fallback();
      });
  };

  const proxy = (path) => {
    return {
      post(data = {}, config = {}) {
        return new Promise((resolve, reject) => {
          ready(({ access_token: at }) => {
            HTTP_CLIENT.post(`${path}?access_token=${at}`, data, config)
              .then(resolve)
              .catch(reject);
          });
        });
      },
    };
  };

  // 旧版本 sdk 的 http 请求封装
  const dingtalk$old$sdk = {
    sendMassMessage(payload = {}) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          axios
            .post(
              `https://oapi.dingtalk.com/topapi/message/mass/send?access_token=${at}`,
              payload
            )
            .then((data) => {
              resolve(data["data"]);
            })
            .catch((err) => {
              reject(err);
            });
        });
      });
    },
  };

  // link 能力封装
  const dingtalk$link$core = {
    // 获取组织下的服务窗列表
    listAccountWithOptions() {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = link.createClient();
          let listAccountHeaders =
            new link.$dingtalklink_1_0.ListAccountHeaders({});
          listAccountHeaders.xAcsDingtalkAccessToken = at;

          client
            .listAccountWithOptions(
              listAccountHeaders,
              new link.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },
  };

  // 开放平台能力封装
  const dingtalk$crm$core = {
    // 发送服务窗 markdown 消息
    sendOfficialAccountOTOMessageWithOptions({
      detail,
      bizId = "",
      accountId = "",
    } = {}) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = crm.createClient();
          let sendOfficialAccountOTOMessageHeaders =
            new crm.$dingtalkcrm_1_0.SendOfficialAccountOTOMessageHeaders({});
          sendOfficialAccountOTOMessageHeaders.xAcsDingtalkAccessToken = at;

          const requestPayload = {
            detail,
            bizId,
            accountId,
          };

          let sendOfficialAccountOTOMessageRequest =
            new crm.$dingtalkcrm_1_0.SendOfficialAccountOTOMessageRequest(
              requestPayload
            );

          client
            .sendOfficialAccountOTOMessageWithOptions(
              sendOfficialAccountOTOMessageRequest,
              sendOfficialAccountOTOMessageHeaders,
              new crm.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },
  };

  // 宜搭能力封装
  // 表单搜索示例
  const dingtalk$yida$forms = {
    // 查询表单实例 id
    getFormDataByIDWithOptions({
      formInsId = "",
      userId = "",
      appType = "",
      systemToken = "",
    } = {}) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = yida.createClient();
          let getFormDataByIDHeaders =
            new yida.$dingtalkyida_1_0.GetFormDataByIDHeaders({});
          getFormDataByIDHeaders.xAcsDingtalkAccessToken = at;

          const requestPayload = {
            appType,
            systemToken,
            userId,
            language: "zh_CN",
          };

          let getFormDataByIDRequest =
            new yida.$dingtalkyida_1_0.GetFormDataByIDRequest(requestPayload);

          client
            .getFormDataByIDWithOptions(
              formInsId,
              getFormDataByIDRequest,
              getFormDataByIDHeaders,
              new yida.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },

    search({ idx = 1, uid = "" } = {}) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = yida.createClient();
          let searchFormDataSecondGenerationNoTableFieldHeaders =
            new yida.$dingtalkyida_1_0.SearchFormDataSecondGenerationNoTableFieldHeaders(
              {}
            );
          searchFormDataSecondGenerationNoTableFieldHeaders.xAcsDingtalkAccessToken =
            at;

          const requestPayload = {
            formUuid: "FORM-JK866XA1LG97THA8BW6O55AMKCOB3RZ5MFRCLZ7",
            systemToken: "US766P71P79720CGCIXS2B9DOZOT2DY5MFRCLZBC",
            appType: "APP_U26KKYQAK5FCJGM55W6N",

            // 拥有该表单数据权限的用户 id
            userId: "10107948",
            pageSize: 1,
            pageNumber: idx,
            searchCondition: `[{"key": "textField_aki1cc4","value": "${uid}","type": "TEXT","operator": "eq","componentName": "TextField"}]`,
          };

          let searchFormDataSecondGenerationNoTableFieldRequest =
            new yida.$dingtalkyida_1_0.SearchFormDataSecondGenerationNoTableFieldRequest(
              requestPayload
            );

          client
            .searchFormDataSecondGenerationNoTableFieldWithOptions(
              searchFormDataSecondGenerationNoTableFieldRequest,
              searchFormDataSecondGenerationNoTableFieldHeaders,
              new yida.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },

    // 获取子表单数据
    listTableDataByFormInstance(
      formInstanceId = "",
      {
        formUuid = "",
        pageNumber = "",
        appType = "",
        systemToken = "",
        pageSize = "",
        tableFieldId = "",
        userId = "",
      } = {}
    ) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = yida.createClient();
          let listTableDataByFormInstanceIdTableIdHeaders =
            new yida.$dingtalkyida_1_0.ListTableDataByFormInstanceIdTableIdHeaders(
              {}
            );
          listTableDataByFormInstanceIdTableIdHeaders.xAcsDingtalkAccessToken =
            at;

          const requestPayload = {
            formUuid,
            pageNumber,
            appType,
            systemToken,
            pageSize,
            tableFieldId,
            userId,
          };

          let listTableDataByFormInstanceIdTableIdRequest =
            new yida.$dingtalkyida_1_0.ListTableDataByFormInstanceIdTableIdRequest(
              requestPayload
            );

          client
            .listTableDataByFormInstanceIdTableIdWithOptions(
              formInstanceId,
              listTableDataByFormInstanceIdTableIdRequest,
              listTableDataByFormInstanceIdTableIdHeaders,
              new yida.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },

    // 获取表单实例详情
    getFormDataById(
      id = "",
      { appType = "", systemToken = "", userId = "", language = "zh_CN" } = {}
    ) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = yida.createClient();
          let getFormDataByIDHeaders =
            new yida.$dingtalkyida_1_0.GetFormDataByIDHeaders({});
          getFormDataByIDHeaders.xAcsDingtalkAccessToken = at;

          const requestPayload = {
            appType,
            systemToken,
            userId,
            language,
          };

          let getFormDataByIDRequest =
            new yida.$dingtalkyida_1_0.GetFormDataByIDRequest(requestPayload);

          client
            .getFormDataByIDWithOptions(
              id,
              getFormDataByIDRequest,
              getFormDataByIDHeaders,
              new yida.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },

    // 发起流程表单审批
    startInstance({
      appType = "",
      systemToken = "",
      userId = "",
      language = "zh_CN",
      formUuid = "",
      formDataJson = "",
      processCode = "",
      departmentId = "",
    } = {}) {
      return new Promise((resolve, reject) => {
        ready(({ access_token: at }) => {
          let client = yida.createClient();
          let startInstanceHeaders =
            new yida.$dingtalkyida_1_0.StartInstanceHeaders({});
          startInstanceHeaders.xAcsDingtalkAccessToken = at;

          const requestPayload = {
            appType,
            systemToken,
            userId,
            language,
            formUuid,
            formDataJson,
            processCode,
            departmentId,
          };

          let startInstanceRequest =
            new yida.$dingtalkyida_1_0.StartInstanceRequest(requestPayload);

          client
            .startInstanceWithOptions(
              startInstanceRequest,
              startInstanceHeaders,
              new yida.$Util.RuntimeOptions({})
            )
            .then(resolve)
            .catch(reject);
        });
      });
    },

    // TODO: 其他 API 封装
  };

  return {
    start: ({ before = defaultIntercepter, after = defaultIntercepter } = {}) =>
      new Promise((resolve, reject) => {
        let _listen = () =>
          new Promise((resolve, reject) => {
            try {
              server.listen(port, resolve);
            } catch (error) {
              reject(error);
            }
          });

        const _start = AJS.functional.helper
          .intercepter(_listen)
          .before(before(server))
          .after(after(server)).$asyncRunner;

        // start intercepter container
        _start().then(resolve).catch(reject);
      }),
  };
};

module.exports = ProxyServer;
