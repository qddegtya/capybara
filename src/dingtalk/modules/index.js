const yida = require("./yida");
const crm = require("./crm");
const link = require("./link");
const axios = require("axios");

// 旧版本 sdk 的 http 请求封装
exports.dingtalk$old$sdk = {
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
exports.dingtalk$link$core = {
  // 获取组织下的服务窗列表
  listAccountWithOptions() {
    return new Promise((resolve, reject) => {
      ready(({ access_token: at }) => {
        let client = link.createClient();
        let listAccountHeaders = new link.$dingtalklink_1_0.ListAccountHeaders(
          {}
        );
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
exports.dingtalk$crm$core = {
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

// 宜搭表单
exports.dingtalk$yida$forms = {
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

  // 搜索表单数据
  search({
    formUuid = "",
    systemToken = "",
    appType = "",
    pageSize = 1,
    idx = 1,
    uid = "",
    searchCondition = "",
  } = {}) {
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
          formUuid,
          systemToken,
          appType,

          // 拥有该表单数据权限的用户 id
          userId: uid,
          pageSize,
          pageNumber: idx,
          searchCondition,
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

  // TODO: 其他模块封装
};
