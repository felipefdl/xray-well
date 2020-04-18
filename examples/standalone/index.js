const xrayWell = require("../../");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function init() {
  // Create a main segment.
  const segment = xrayWell.segment.createSegment("my-own-function");
  segment.annotations = {
    function: "init",
  };

  // Submit main segment, in process yet.
  xrayWell.segment.submitSegmentPart(segment);

  await sleep(1000);

  // Create a nested segment forked from main.
  const nestedSegment = xrayWell.segment.forkSegment("nestedSegment", segment);
  nestedSegment.annotations = {
    function2: "doing something",
  };

  // Submit my nested segment, in process yet.
  xrayWell.segment.submitSegmentPart(nestedSegment);

  await sleep(1000);

  nestedSegment.annotations = {
    function2: "done of doing something",
  };

  // Submit by nested segment already done.
  xrayWell.segment.submitSegment(nestedSegment);

  await sleep(1000);

  // Submit my main segment to finish the flow.
  xrayWell.segment.submitSegment(segment);
}

setInterval(() => {
  init();
}, 6000);
