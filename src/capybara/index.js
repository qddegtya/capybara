// default options
const PROXY_SERVER_DEFAULT_PORT = 9000;

// Base proxy server which name is capybara.
const Capybara = ({ port = PROXY_SERVER_DEFAULT_PORT } = {}) => {
  const AJS = require("xajs");
  const express = require("express");
  const bodyParser = require("body-parser");

  const server = express();

  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  const defaultIntercepter = () => () => void 0;

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

        const serverContext = {
          server,
          params: {
            port,
          },
        };

        const _start = AJS.functional.helper
          .intercepter(_listen)
          .before(before(serverContext))
          .after(after(serverContext)).$asyncRunner;

        // start intercepter container
        _start().then(resolve).catch(reject);
      }),
  };
};

module.exports = Capybara;
