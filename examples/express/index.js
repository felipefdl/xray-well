const xrayWell = require("../../");
const express = require("express");
const app = express();

xrayWell.setConfig({ debug: true, name: "api.tago.io" });

app.use(xrayWell.middleware.express());

app.get("/", (req, res) => {
  setTimeout(() => {
    res.send("Hello World!");
  }, 4000);
});

app.listen(3030, () => console.log(`Example app listening at http://localhost:3030`));
