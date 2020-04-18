import { createSegment, forkSegment } from "../src/segment";

describe("Segments", () => {
  test("Create a Segment", () => {
    const segment = createSegment("test");

    expect(segment.name).toBe("test");
    expect(segment.id).toHaveLength(16);
    expect(segment.trace_id).toHaveLength(35);
    expect(segment.in_progress).toBeTruthy();
  });

  test("Create a Fork Segment", () => {
    const segment = createSegment("test");
    const segmentForked = forkSegment("testfork", segment);

    expect(segmentForked.name).toBe("testfork");
    expect(segmentForked.trace_id).toBe(segment.trace_id);
    expect(segmentForked.parent_id).toBe(segment.id);
    expect(segmentForked.type).toBe("subsegment");
    expect(segmentForked.id).not.toBe(segment.id);
    expect(segmentForked.id).toHaveLength(16);
    expect(segmentForked.trace_id).toHaveLength(35);
    expect(segmentForked.in_progress).toBeTruthy();
  });
});
