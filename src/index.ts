import { expressXRayMiddleware as express } from "./middlewares/expressMiddleware";
import { koaXRayMiddleware as koa } from "./middlewares/koaMiddleware";

export { generateID, generateTime, generateTraceID, sendData, setConfig } from "./xray";

export const middleware = { express, koa };
