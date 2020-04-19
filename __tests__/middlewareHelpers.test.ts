import "../src/interfaces";
import {
  parserUserAgent,
  addAnnotationFunction,
  addMetadataFunction,
  setUserFunction,
} from "../src/middlewares/_middlewareHelpers";
import { createSegment } from "../out/segment";

describe("Middleware Helpers", () => {
  test("parserUserAgent", () => {
    const agentChrome = parserUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.113 Safari/537.36"
    );

    expect(agentChrome).toBe("chrome v81.0.4044 [Mac OS]");

    const agentFirefox = parserUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:75.0) Gecko/20100101 Firefox/75.0"
    );

    expect(agentFirefox).toBe("firefox v75.0.0 [Mac OS]");

    const agentNotParsed = parserUserAgent("HTTPie/2.1.0");

    expect(agentNotParsed).toBe("HTTPie/2.1.0");

    const agentUndefined = parserUserAgent(undefined);

    expect(agentUndefined).toBe("Unknown");
  });

  test("addAnnotationFunction", () => {
    const segment = createSegment("test");
    addAnnotationFunction(segment)("test", 123);
    addAnnotationFunction(segment)("test2", "321");

    expect(segment.annotations.test).toBe(123);
    expect(segment.annotations.test2).toBe("321");
  });

  test("addMetadataFunction", () => {
    const segment = createSegment("test");
    addMetadataFunction(segment)("testNamespace", "testKey", "testValue");
    addMetadataFunction(segment)("testNamespace", "testKey2", "testValue2");
    addMetadataFunction(segment)("anotherTestNameSpace", "testKey3", "testValue3");

    expect(segment.metadata["testNamespace"].testKey).toBe("testValue");
    expect(segment.metadata["testNamespace"].testKey2).toBe("testValue2");
    expect(segment.metadata["anotherTestNameSpace"].testKey3).toBe("testValue3");
  });

  test("setUserFunction", () => {
    const segment = createSegment("test");
    setUserFunction(segment)("test@xraywell.com");

    expect(segment.user).toBe("test@xraywell.com");
  });
});
