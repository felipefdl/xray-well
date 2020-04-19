/**
 * This file is exported when you require("xray-well")
 * @packageDocumentation
 */

import { expressXRayMiddleware as express } from "./middlewares/expressMiddleware";
import { koaXRayMiddleware as koa } from "./middlewares/koaMiddleware";
import { generateID, generateTime, generateTraceID, sendData, setConfig, activeUptime } from "./xray";
import { createSegment, forkSegment, submitSegment, submitSegmentPart } from "./segment";

export { activeUptime, setConfig };

/**
 * Daemon function, useful to create own segments.
 */
export const daemon = { generateID, generateTime, generateTraceID, sendData };

/**
 * Middlewares for Web Frameworks and others solutions.
 */
export const middleware = { express, koa };

/**
 * Segments functions.
 */
export const segment = { createSegment, forkSegment, submitSegment, submitSegmentPart };
