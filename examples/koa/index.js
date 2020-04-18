const xrayWell = require("../../");
const Koa = require("koa");
const app = new Koa();

xrayWell.setConfig({ debug: true, name: "api.tago.io" });

app.use(xrayWell.middleware.koa());

app.use((ctx) => {
  ctx.body = "Hello Koa";
});

app.listen(3030, () => console.log(`Listening at http://localhost:3030`));
