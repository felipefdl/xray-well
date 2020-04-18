import { generateTraceID, generateID, generateTime, _handleMessage } from "../src/xray";

describe("X-Ray", () => {
  test("Generate TraceID", () => {
    const traceID = generateTraceID();

    expect(traceID.startsWith("1-")).toBeTruthy();
    expect(traceID).toHaveLength(35);
    expect(traceID.split("-")).toHaveLength(3);
  });

  test("Generate Segment ID", () => {
    const id = generateID();

    expect(id).toHaveLength(16);
  });

  test("Generate Time", () => {
    const time = generateTime();
    expect(time % 1 !== 0).toBeTruthy();
  });

  test("Handle message to daemon", () => {
    const message = _handleMessage({
      name: "test",
      id: generateID(),
      trace_id: generateTraceID(),
      start_time: generateTime(),
      in_progress: false,
      aws: { test: { testv: true } },
    });

    expect(Buffer.isBuffer(message)).toBeTruthy();
    expect(message.toString()).toContain('{"format": "json", "version": 1}\n{');
  });
});
