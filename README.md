# AWS X-Ray Well - A Unofficial SDK for Node.js
> Simple way to use AWS X-Ray. This is a jerry-rig free X-Ray SDK.

## Why?

The Official AWS SDK X-Ray wraps the native node modules to try to make it like magic, but it's a bad idea when trying to use it in complex systems. I tried to use the official SDK for more than 5 times in the past and it always not work to me, sometimes the problem is because I use it in a framework not supported as Koa, some times even on express (supported framework by AWS SDK) it not work well.

So, I created this lib well done, this lib will never auto attach on your native modules, it does not work like magic, but you can do your magic using it.

## How to install it?

```bash
$ npm install xray-well --save
```

> Set the configuration on main file of your application
> You still need the AWS X-Ray Daemon
```javascript
const xrayWell = require("xray-well");
xrayWell.setConfig({ name: "my.awesome.domain.com", server: "localhost", port: 2000 });
```

## How to use on Express Framework?

```javascript
const xrayWell = require("xray-well");
const express  = require("express");
const app      = express();

xrayWell.setConfig({ name: "my.awesome.domain.com" });

app.use(xrayWell.middleware.express());

app.get("/", (req, res) => {
  res.send("Hi AWS, I'm not using your SDK! =)");
});

app.listen(3030, () => console.log(`Listening at http://localhost:3030`));

```

## How to use on Koa Framework?

```javascript
const xrayWell = require("xray-well");
const Koa      = require('koa');
const app      = new Koa();

xrayWell.setConfig({ name: "my.awesome.domain.com" });

app.use(xrayWell.middleware.koa());

app.use((ctx) => {
  ctx.body = "Hi AWS, I'm not using your SDK! =)";
});

app.listen(3030, () => console.log(`Listening at http://localhost:3030`));

```

## License

  [MIT](LICENSE)
