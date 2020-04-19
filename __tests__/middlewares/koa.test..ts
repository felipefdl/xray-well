import * as xray from "../../src/xray";
import * as xrayWell from "../../src";
import Koa from "koa";
import supertest from "supertest";

// @ts-ignore
xray.sendData = jest.fn();

describe("Koa Middleware", () => {
  let app;
  let service;
  const request = supertest("http://localhost:3000");
  beforeEach((done) => {
    const startServer = () => {
      app = new Koa();
      service = app.listen(3000);
      done();
    };

    if (service) {
      service.close(startServer);
    } else {
      startServer();
    }

    (xray.sendData as jest.Mock).mockClear();
  });

  afterAll((done) => {
    service.close(done);
  });

  test("Normal Operation", async (done) => {
    app.use(xrayWell.middleware.koa({ name: "mytest" }));
    app.use((ctx) => (ctx.body = "ok"));

    await request.get("/success");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [[inprogressSegment], [doneSegment]] = xrayData.mock.calls;

    expect(inprogressSegment.name).toBe("mytest");
    expect(inprogressSegment.id).toHaveLength(16);
    expect(inprogressSegment.trace_id).toHaveLength(35);
    expect(inprogressSegment.in_progress).toBeTruthy();
    expect(inprogressSegment.http.request.url).toBe("/success");
    expect(inprogressSegment.http.request.method).toBe("GET");
    expect(inprogressSegment.http.request.x_forwarded_for).toBeFalsy();
    expect(inprogressSegment.http.request.client_ip).toBeTruthy();
    expect(inprogressSegment.http.request.user_agent).toBeTruthy();

    expect(doneSegment.name).toBe("mytest");
    expect(doneSegment.id).toHaveLength(16);
    expect(doneSegment.trace_id).not.toBe(inprogressSegment.id);
    expect(doneSegment.trace_id).toBe(inprogressSegment.trace_id);
    expect(doneSegment.in_progress).toBeFalsy();
    expect(doneSegment.error).toBeFalsy();
    expect(doneSegment.fault).toBeFalsy();
    expect(doneSegment.throttle).toBeFalsy();
    expect(doneSegment.in_progress).toBeFalsy();
    expect(doneSegment.http.request).toStrictEqual(inprogressSegment.http.request);
    expect(doneSegment.http.response).toStrictEqual({ status: 200, content_length: "2" });

    done();
  });

  test("Error flag", async (done) => {
    app.use(xrayWell.middleware.koa({ name: "mytest" }));
    await request.get("/404");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [, [doneSegment]] = xrayData.mock.calls;

    expect(doneSegment.http.response.status).toBe(404);
    expect(doneSegment.error).toBeTruthy();
    done();
  });

  test("Throttle flag", async (done) => {
    app.use(xrayWell.middleware.koa({ name: "mytest", throttleSeconds: 1.9 }));
    app.use(async (ctx) => {
      await new Promise((r) => setTimeout(r, 2000));
      ctx.body = "ok";
    });

    await request.get("/slow");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [, [doneSegment]] = xrayData.mock.calls;

    expect(doneSegment.throttle).toBeTruthy();
    done();
  });

  test("Fault flag", async (done) => {
    app.use(xrayWell.middleware.koa({ name: "mytest" }));
    app.use((ctx) => {
      ctx.status = 502;
      ctx.body = "ok";
    });

    await request.get("/serverError");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [, [doneSegment]] = xrayData.mock.calls;

    expect(doneSegment.fault).toBeTruthy();
    done();
  });
});
