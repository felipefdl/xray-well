import * as daemon from "../xray";
import { addAnnotationFunction, addMetadataFunction, setUserFunction } from "../applicationFunctions";

const defaultConfig: MiddlewareConfig = {
  throttleSeconds: 10,
  ignoreStatusCodeError: [],
  ignoreStatusCodeFault: [],
};

function expressXRayMiddleware(config: MiddlewareConfig = defaultConfig) {
  return (req: any, res: any, next: () => void) => {
    const traceID = daemon.generateTraceID();
    const requestID = daemon.generateID();

    const message: Message = {
      trace_id: traceID,
      id: requestID,
      start_time: daemon.generateTime(),
      in_progress: true,
      http: {
        request: {
          client_ip: req.ip,
          url: req.path,
          method: req.method,
          x_forwarded_for: req.get("x-forwarded-for"),
        },
      },
    };

    daemon.sendData(message);
    req.xray = { trace_id: traceID, parent_id: requestID };
    req.xray.addAnnotation = addAnnotationFunction(message);
    req.xray.addMetadata = addMetadataFunction(message);
    req.xray.setUser = setUserFunction(message);

    res.on("finish", function () {
      const endMessage: Message = {
        ...message,
        end_time: daemon.generateTime(),
        in_progress: false,
        http: {
          ...message.http,
          response: {
            status: res.statusCode,
            content_length: res.get("content-length"),
          },
        },
      };

      if (res.statusCode >= 400 && res.statusCode < 500 && !config.ignoreStatusCodeError.includes(res.statusCode)) {
        endMessage.error = true;
      }

      if (res.statusCode >= 500 && res.statusCode < 600 && !config.ignoreStatusCodeFault.includes(res.statusCode)) {
        endMessage.fault = true;
      }

      if (endMessage.end_time - message.start_time > config.throttleSeconds) {
        endMessage.throttle = true;
      }

      daemon.sendData(endMessage);
    });

    next();
  };
}

export { expressXRayMiddleware };
