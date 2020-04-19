import { addAnnotationFunction, addMetadataFunction, setUserFunction, parserUserAgent } from "./_middlewareHelpers";
import { createSegment, submitSegmentPart, submitSegment } from "../segment";
import "../interfaces";

const defaultConfig: MiddlewareConfig = {
  name: "koa-middleware",
  throttleSeconds: 10,
  ignoreStatusCodeError: [],
  ignoreStatusCodeFault: [],
  ignoreMethods: [],
  ignorePaths: [],
};

function koaXRayMiddleware(middlewareConfig: MiddlewareConfig = defaultConfig) {
  const config = { ...defaultConfig, ...middlewareConfig };

  const allowSend = (path: string, method: string) => {
    if (config.ignoreMethods.includes(method) || config.ignorePaths.includes(path)) {
      return false;
    } else {
      return true;
    }
  };

  return async (ctx: any, next: () => Promise<void>) => {
    const segment = createSegment(config.name);

    segment.http = {
      request: {
        client_ip: ctx.header["x-forwarded-for"] || ctx.ip,
        url: ctx.path,
        method: ctx.method,
        user_agent: parserUserAgent(ctx.header["user-agent"]),
        x_forwarded_for: !!ctx.header["x-forwarded-for"],
      },
    };

    if (allowSend(ctx.path, ctx.method)) {
      submitSegmentPart(segment);
    }

    ctx.xray = {};
    ctx.xray.requestSegment = segment;
    ctx.xray.addAnnotation = addAnnotationFunction(segment);
    ctx.xray.addMetadata = addMetadataFunction(segment);
    ctx.xray.setUser = setUserFunction(segment);

    await next();

    const endSegment: Segment = {
      ...segment,
      http: {
        ...segment.http,
        response: {
          status: ctx.status,
          content_length: ctx.response.header["content-length"],
        },
      },
    };

    if (ctx.status >= 400 && ctx.status < 500 && !config.ignoreStatusCodeError.includes(ctx.status)) {
      endSegment.error = true;
    }

    if (ctx.status >= 500 && ctx.status < 600 && !config.ignoreStatusCodeFault.includes(ctx.status)) {
      endSegment.fault = true;
    }

    if (Date.now() / 1000 - segment.start_time > config.throttleSeconds) {
      endSegment.throttle = true;
    }

    if (allowSend(ctx.path, ctx.method)) {
      submitSegment(endSegment);
    }
  };
}

export { koaXRayMiddleware };
