import "./interfaces";
import { generateID, generateTraceID, generateTime, sendData } from "./xray";

function createSegment(segmentName: string, traceID?: string, parentSegmentID?: string) {
  const segment: Segment = {
    name: segmentName,
    id: generateID(),
    trace_id: traceID || generateTraceID(),
    start_time: generateTime(),
    in_progress: true,
  };

  if (parentSegmentID) {
    segment.parent_id = parentSegmentID;
    segment.type = "subsegment";
  }

  return segment;
}

function forkSegment(segmentName: string, segment: Segment) {
  return createSegment(segmentName, segment.trace_id, segment.id);
}

function submitSegmentPart(segment: Segment) {
  sendData(segment);
  return segment.id;
}

function submitSegment(segment: Segment) {
  segment.in_progress = false;
  segment.end_time = generateTime();
  sendData(segment);

  return segment.id;
}

export { createSegment, submitSegment, submitSegmentPart, forkSegment };
