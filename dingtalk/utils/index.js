const cacache = require("cacache");
const { CACHE } = require("../constants");

const Cache = () => {
  return {
    put(key, value) {
      return cacache.put(CACHE.ROOT, key, value);
    },

    get(key) {
      return cacache.get(CACHE.ROOT, key);
    },

    clear() {
      return cacache.rm.all(CACHE.ROOT);
    },
  };
};

module.exports = Cache;
