import * as daemon from "../xray";
import { addAnnotationFunction, addMetadataFunction, setUserFunction } from "../applicationFunctions";

const defaultConfig: MiddlewareConfig = {
  throttleSeconds: 10,
  ignoreStatusCodeError: [],
  ignoreStatusCodeFault: [],
};

function koaXRayMiddleware(config: MiddlewareConfig = defaultConfig) {
  return async (ctx: any, next: () => Promise<void>) => {
    const traceID = daemon.generateTraceID();
    const requestID = daemon.generateID();

    const message: Message = {
      trace_id: traceID,
      id: requestID,
      start_time: daemon.generateTime(),
      in_progress: true,
      http: {
        request: {
          client_ip: ctx.ip,
          url: ctx.path,
          method: ctx.method,
          x_forwarded_for: ctx.header["x-forwarded-for"],
        },
      },
    };

    daemon.sendData(message);
    ctx.xray = { trace_id: traceID, parent_id: requestID };
    ctx.xray.addAnnotation = addAnnotationFunction(message);
    ctx.xray.addMetadata = addMetadataFunction(message);
    ctx.xray.setUser = setUserFunction(message);

    await next();

    const endMessage: Message = {
      ...message,
      end_time: daemon.generateTime(),
      in_progress: false,
      http: {
        ...message.http,
        response: {
          status: ctx.status,
          content_length: ctx.response.header["content-length"],
        },
      },
    };

    if (ctx.status >= 400 && ctx.status < 500 && !config.ignoreStatusCodeError.includes(ctx.status)) {
      endMessage.error = true;
    }

    if (ctx.status >= 500 && ctx.status < 600 && !config.ignoreStatusCodeFault.includes(ctx.status)) {
      endMessage.fault = true;
    }

    if (endMessage.end_time - message.start_time > config.throttleSeconds) {
      endMessage.throttle = true;
    }

    daemon.sendData(endMessage);
  };
}

export { koaXRayMiddleware };
