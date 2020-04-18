import { expressXRayMiddleware as express } from "./middlewares/expressMiddleware";
import { koaXRayMiddleware as koa } from "./middlewares/koaMiddleware";
import { generateID, generateTime, generateTraceID, sendData, setConfig, activeUptime } from "./xray";
import * as segmentModule from "./segment";

export { activeUptime, setConfig };

export const daemon = { generateID, generateTime, generateTraceID, sendData };

export const middleware = { express, koa };

export const segment = { ...segmentModule };
