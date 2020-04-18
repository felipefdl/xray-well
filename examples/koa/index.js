const xrayWell = require("../../");
const Koa = require("koa");
const app = new Koa();

xrayWell.activeUptime();

app.use(xrayWell.middleware.koa({ name: "koa-test" }));

app.use((ctx) => {
  ctx.xray.setUser("user@email.com");
  ctx.xray.addAnnotation("user_id", "44232123");
  ctx.xray.addAnnotation("company", "acme");
  ctx.xray.addMetadata("myNamespace", "any", "value");
  ctx.xray.addMetadata("myNamespace", "another", true);
  ctx.xray.addMetadata("mySecondsNamespace", "foo", "bar");

  ctx.body = "Hello Koa";
});

app.listen(3030, () => console.log(`Listening at http://localhost:3030`));
