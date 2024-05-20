const capybara = require("../capybara")();

(async () => {
  try {
    await capybara.start({
      before: ({ server }) => {
        return () => {
          server.get("/hello", (req, res) => {
            res.send("hello world");
          });
        };
      },
      after: ({ server, params }) => {
        return () => {
          console.log(
            `[openplatform-dingtalk-proxy-server]: server is listening on: ${params.port}`
          );
        };
      },
    });
  } catch (error) {
    console.log(error);
  }
})();
