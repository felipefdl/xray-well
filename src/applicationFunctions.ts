function addAnnotationFunction(message: Message) {
  return (key: string, value: string | number | boolean) => {
    message.annotations = {
      ...message.annotations,
      [key]: value,
    };
  };
}

function addMetadataFunction(message: Message) {
  return (namespace: string, key: string, value: string | number | boolean) => {
    message.metadata = {
      ...message.metadata,
      [namespace]: {
        ...(message.metadata ? message.metadata[namespace] : undefined),
        [key]: value,
      },
    };
  };
}

function setUserFunction(message: Message) {
  return (user: string) => {
    message.user = user;
  };
}

export { addAnnotationFunction, addMetadataFunction, setUserFunction };
