function addAnnotationFunction(segment: Segment) {
  return (key: string, value: string | number | boolean) => {
    segment.annotations = {
      ...segment.annotations,
      [key]: value,
    };
  };
}

function addMetadataFunction(segment: Segment) {
  return (namespace: string, key: string, value: string | number | boolean) => {
    segment.metadata = {
      ...segment.metadata,
      [namespace]: {
        ...(segment.metadata ? segment.metadata[namespace] : undefined),
        [key]: value,
      },
    };
  };
}

function setUserFunction(segment: Segment) {
  return (user: string) => {
    segment.user = user;
  };
}

export { addAnnotationFunction, addMetadataFunction, setUserFunction };
