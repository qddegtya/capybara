const { DingtalkProxyServer } = require("../../src");

(async () => {
  try {
    await DingtalkProxyServer().start({
      before: ({ server }) => {
        return () => {
          server.get("/hello", (req, res) => {
            res.send("hello world");
          });
        };
      },
      after: ({ server, params }) => {
        return () => {
          console.log(`Server is listening on: ${params.port}`);
        };
      },
    });
  } catch (error) {
    console.log(error);
  }
})();
