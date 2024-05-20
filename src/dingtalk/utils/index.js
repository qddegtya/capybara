exports.Cache = require("./cache");
const cache = exports.Cache();

const {
  HTTP_CLIENT,
  CACHE_KEYS,
  APP_KEY,
  APP_SECRET,
} = require("../constants");
const dayjs = require("dayjs");

exports.getAccessToken = (cb, error = () => void 0) => {
  console.log("[openplatform-dingtalk-proxy-server]: request access token.");
  HTTP_CLIENT.get(`/gettoken?appkey=${APP_KEY}&appsecret=${APP_SECRET}`)
    .then(({ data }) => {
      cb(data);
    })
    .catch((e) => {
      error(e);
    });
};

exports.ready = (cb) => {
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

exports.proxy = (path) => {
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
