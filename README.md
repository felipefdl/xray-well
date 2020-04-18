# AWS X-Ray Well - A Unofficial SDK for Node.js
> Simple way to use AWS X-Ray. This is a jerry-rig free X-Ray SDK.

## Why?

The Official AWS SDK X-Ray wraps the native node modules to try to make it like magic, but it's a bad idea when trying to use it in complex systems. I tried to use the official SDK for more than 5 times in the past and it always not work to me, sometimes the problem is because I use it in a framework not supported as Koa, some times even on express (supported framework by AWS SDK) it not work well.

So, I created this lib well done, this lib will never auto attach on Node.js native modules, it does not work like magic, but you can do your magic using it.

## How to install it?

```bash
$ npm install xray-well --save
```

> Set the configuration on main file of your application. You still need the AWS X-Ray Daemon
```javascript
const xrayWell = require("xray-well");
xrayWell.setConfig({ server: "localhost", port: 2000 });
```

## How to use on Express Framework?

```javascript
const xrayWell = require("xray-well");
const express  = require("express");
const app      = express();

app.use(xrayWell.middleware.express({ name: "my.awesome.domain.com" })); // Add it before any another middleware

app.get("/", (req, res) => {
  req.xray.setUser("user@email.com");
  req.xray.addAnnotation("user_id", "44232123");
  req.xray.addAnnotation("company", "acme");
  req.xray.addMetadata("myNamespace", "any", "value");
  req.xray.addMetadata("myNamespace", "another", true);
  req.xray.addMetadata("mySecondsNamespace", "foo", "bar");

  res.send("Hi AWS, I'm not using your SDK! =)");
});

app.listen(3030, () => console.log("Listening at http://localhost:3030"));

```

## How to use on Koa Framework?

```javascript
const xrayWell = require("xray-well");
const Koa      = require("koa");
const app      = new Koa();

app.use(xrayWell.middleware.koa({ name: "my.awesome.domain.com" })); // Add it before any another middleware

app.use((ctx) => {
  ctx.xray.setUser("user@email.com");
  ctx.xray.addAnnotation("user_id", "44232123");
  ctx.xray.addAnnotation("company", "acme");
  ctx.xray.addMetadata("myNamespace", "any", "value");
  ctx.xray.addMetadata("myNamespace", "another", true);
  ctx.xray.addMetadata("mySecondsNamespace", "foo", "bar");

  ctx.body = "Hi AWS, I'm not using your SDK! =)";
});

app.listen(3030, () => console.log("Listening at http://localhost:3030"));

```

## How to use without any web framework

> You can change any aspect of your segment any time.
```javascript
const xrayWell = require("xray-well");
const sleep    = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function init() {
  // Create a main segment.
  const segment = xrayWell.segment.createSegment("my-own-function");
  segment.annotations = {
    function: "init",
  };

  // Submit main segment, in process yet.
  xrayWell.segment.submitSegmentPart(segment);

  await sleep(1000);

  // Create a nested segment forked from main.
  const nestedSegment = xrayWell.segment.forkSegment("nestedSegment", segment);
  nestedSegment.annotations = {
    function2: "doing something",
  };

  // Submit my nested segment, in process yet.
  xrayWell.segment.submitSegmentPart(nestedSegment);

  await sleep(1000);

  nestedSegment.annotations = {
    function2: "done of doing something",
  };

  // Submit by nested segment already done.
  xrayWell.segment.submitSegment(nestedSegment);

  await sleep(1000);

  // Submit my main segment to finish the flow.
  xrayWell.segment.submitSegment(segment);
}
```

## TO-DO
- [x] Create Koa and Express Framework;
- [ ] Create an easy way to add SQL Segments;
- [ ] Implement exceptions segments;
- [ ] Create better documentation;
- [ ] Improve unit tests;

## License

  [MIT](LICENSE)
