const dgram = require("dgram");
const crypto = require("crypto");
const fs = require("fs");
const packageJSON = require("../package.json");
const client = dgram.createSocket("udp4");
let softwarePackageJson: { version: string; name: string } = null;

try {
  softwarePackageJson = JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`, "utf8"));
} catch (e) {
  // ignore
}

const HEADER = '{"format": "json", "version": 1}';

let _config: Config = {
  name: "NO_NAME",
  server: "localhost",
  port: 2000,
  debug: false,
};

const awsField: Metadata = {
  xray: {
    sdk: "X-Ray Well",
    version: packageJSON.version,
  },
};

if (softwarePackageJson) {
  awsField.software = {
    name: softwarePackageJson.name,
    version: softwarePackageJson.version,
  };
}

function _handleMessage(message: DaemonMessage): Buffer {
  return Buffer.from(`${HEADER}\n${JSON.stringify(message)}`);
}

function sendData(message: Message): void {
  const daemonMessage = { ...message, name: _config.name, aws: awsField } as DaemonMessage;

  client.send(_handleMessage(daemonMessage), _config.port, _config.server, (err) => {
    if (_config.debug) {
      if (err) {
        console.debug("[X-Ray] Error on send data to X-Ray Daemon", err);
      } else {
        console.debug("[X-Ray] Data sent");
      }
    }
    // client.close();
  });
}

function generateTime(date: Date = new Date()) {
  return date.getTime() / 1000;
}

function generateID() {
  return crypto.randomBytes(8).toString("hex");
}

function generateTraceID() {
  return `1-${Math.round(new Date().getTime() / 1000).toString(16)}-${crypto.randomBytes(12).toString("hex")}`;
}

function setConfig(config: Config) {
  _config = { ..._config, ...config };
}

export { sendData, generateID, generateTraceID, generateTime, setConfig, _handleMessage };
