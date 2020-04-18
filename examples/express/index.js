const xrayWell = require("../../");
const express = require("express");
const app = express();

app.use(xrayWell.middleware.express({ name: "express-test" }));

app.get("/", (req, res) => {
  req.xray.setUser("user@email.com");
  req.xray.addAnnotation("user_id", "44232123");
  req.xray.addAnnotation("company", "acme");
  req.xray.addMetadata("myNamespace", "any", "value");
  req.xray.addMetadata("myNamespace", "another", true);
  req.xray.addMetadata("mySecondsNamespace", "foo", "bar");

  res.send("Hello World!");
});

app.listen(3030, () => console.log(`Example app listening at http://localhost:3030`));
