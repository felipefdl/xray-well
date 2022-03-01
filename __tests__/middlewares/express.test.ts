import * as xray from "../../src/xray";
import * as xrayWell from "../../src";
import express from "express";
import supertest from "supertest";

// @ts-ignore
xray.sendData = jest.fn();

describe("Express Middleware", () => {
  let app;
  let service;
  let request;
  beforeEach((done) => {
    const startServer = () => {
      app = express();
      service = app.listen(2000);
      request = supertest(app);
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

  test("Normal Operation", async () => {
    app.use(xrayWell.middleware.express({ name: "mytest" }));
    app.get("/success", (req, res) => res.send("ok"));

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

    return Promise.resolve();
  });

  test("Error flag", async () => {
    jest.setTimeout(10000);
    app.use(xrayWell.middleware.express({ name: "mytest" }));

    await request.get("/404");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [, [doneSegment]] = xrayData.mock.calls;

    expect(doneSegment.http.response.status).toBe(404);
    expect(doneSegment.error).toBeTruthy();

    return Promise.resolve();
  });

  test("Throttle flag", async () => {
    app.use(xrayWell.middleware.express({ name: "mytest", throttleSeconds: 1.9 }));
    app.get("/slow", (req, res) => setTimeout(() => res.send("ok"), 2000));

    await request.get("/slow");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [, [doneSegment]] = xrayData.mock.calls;

    expect(doneSegment.throttle).toBeTruthy();

    return Promise.resolve();
  });

  test("Fault flag", async () => {
    app.use(xrayWell.middleware.express({ name: "mytest" }));
    app.get("/serverError", (req, res) => res.status(502).send("error"));

    await request.get("/serverError");
    const xrayData = xray.sendData as jest.Mock;

    expect(xrayData.mock.calls).toHaveLength(2);

    const [, [doneSegment]] = xrayData.mock.calls;

    expect(doneSegment.fault).toBeTruthy();

    return Promise.resolve();
  });
});
