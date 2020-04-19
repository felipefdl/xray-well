import { addAnnotationFunction, addMetadataFunction, setUserFunction, parserUserAgent } from "./_middlewareHelpers";
import { createSegment, submitSegmentPart, submitSegment } from "../segment";

const defaultConfig: MiddlewareConfig = {
  name: "koa-middleware",
  throttleSeconds: 10,
  ignoreStatusCodeError: [],
  ignoreStatusCodeFault: [],
};

function koaXRayMiddleware(middlewareConfig: MiddlewareConfig = defaultConfig) {
  const config = { ...defaultConfig, ...middlewareConfig };

  return async (ctx: any, next: () => Promise<void>) => {
    const segment = createSegment(config.name);

    segment.http = {
      request: {
        client_ip: ctx.req.connection.remoteAddress,
        url: ctx.path,
        method: ctx.method,
        user_agent: parserUserAgent(ctx.header["user-agent"]),
        x_forwarded_for: ctx.header["x-forwarded-for"],
      },
    };

    submitSegmentPart(segment);

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

    if (endSegment.end_time - segment.start_time > config.throttleSeconds) {
      endSegment.throttle = true;
    }

    submitSegment(endSegment);
  };
}

export { koaXRayMiddleware };
