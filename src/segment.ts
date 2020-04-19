/**
 * Segment functions
 * @packageDocumentation
 */

import "./interfaces";
import { generateID, generateTraceID, generateTime, sendData } from "./xray";

/**
 * Create a Segment Document.
 * @param segmentName Segment name
 * @param traceID TraceID (use only on nestedSegments)
 * @param parentSegmentID Parent Segment ID (use only on nestedSegments)
 */
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

/**
 * Fork a segment to a new one for nestedSegments.
 *
 * Another way to do that is using createSegment with traceID and parentID,
 * this function is a shortcut.
 * @param segmentName Segment name
 * @param segment Segment
 */
function forkSegment(segmentName: string, segment: Segment) {
  return createSegment(segmentName, segment.trace_id, segment.id);
}

/**
 * Send to XRay Daemon Segments in progress yet.
 * @param segment Segment
 */
function submitSegmentPart(segment: Segment) {
  sendData(segment);
  return segment.id;
}

/**
 * Send to XRay Daemon Segments finalized, not in progress anymore.
 * @param segment Segment
 */
function submitSegment(segment: Segment) {
  segment.in_progress = false;
  segment.end_time = generateTime();
  sendData(segment);

  return segment.id;
}

export { createSegment, submitSegment, submitSegmentPart, forkSegment };
