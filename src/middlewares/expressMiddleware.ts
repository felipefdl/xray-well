import { addAnnotationFunction, addMetadataFunction, setUserFunction, parserUserAgent } from "./_middlewareHelpers";
import { createSegment, submitSegmentPart, submitSegment } from "../segment";
import "../interfaces";

const defaultConfig: MiddlewareConfig = {
  name: "express-middleware",
  throttleSeconds: 10,
  ignoreStatusCodeError: [],
  ignoreStatusCodeFault: [],
};

function expressXRayMiddleware(middlewareConfig: MiddlewareConfig = defaultConfig) {
  const config = { ...defaultConfig, ...middlewareConfig };

  return (req: any, res: any, next: () => void) => {
    const segment = createSegment(config.name);

    segment.http = {
      request: {
        client_ip: req.get("x-forwarded-for") || req.ip,
        url: req.path,
        method: req.method,
        user_agent: parserUserAgent(req.get("user-agent")),
        x_forwarded_for: !!req.get("x-forwarded-for"),
      },
    };

    submitSegmentPart(segment);

    req.xray = {};
    req.xray.requestSegment = segment;
    req.xray.addAnnotation = addAnnotationFunction(segment);
    req.xray.addMetadata = addMetadataFunction(segment);
    req.xray.setUser = setUserFunction(segment);

    res.on("finish", function () {
      const endSegment: Segment = {
        ...segment,
        http: {
          ...segment.http,
          response: {
            status: res.statusCode,
            content_length: res.get("content-length"),
          },
        },
      };

      if (res.statusCode >= 400 && res.statusCode < 500 && !config.ignoreStatusCodeError.includes(res.statusCode)) {
        endSegment.error = true;
      }

      if (res.statusCode >= 500 && res.statusCode < 600 && !config.ignoreStatusCodeFault.includes(res.statusCode)) {
        endSegment.fault = true;
      }

      if (endSegment.end_time - segment.start_time > config.throttleSeconds) {
        endSegment.throttle = true;
      }

      submitSegment(endSegment);
    });

    next();
  };
}

export { expressXRayMiddleware };
