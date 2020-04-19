/**
 * XRay Generators and Communication
 * @packageDocumentation
 */

import dgram from "dgram";
import crypto from "crypto";
import fs from "fs";
import ms from "ms";
import os from "os";
import "./interfaces";

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
  system: {
    nodejs: process.version,
    platform: `${process.platform} - ${os.arch()}`,
    pid: process.pid,
    hostname: os.hostname(),
  },
};

if (softwarePackageJson) {
  awsField.software = {
    name: softwarePackageJson.name,
    version: softwarePackageJson.version,
  };
}

/**
 * Handle message before send to XRay Daemon.
 * @internal
 * @hidden
 */
function _handleMessage(segment: DaemonSegment): Buffer {
  return Buffer.from(`${HEADER}\n${JSON.stringify(segment)}`);
}

/**
 * Prepare segment and send segment to XRay Daemon.
 * @param segment Segment
 */
function sendData(segment: Segment): void {
  const daemonMessage = { name: _config.name, ...segment, aws: awsField } as DaemonSegment;

  client.send(_handleMessage(daemonMessage), _config.port, _config.server, (err) => {
    if (_config.debug) {
      if (err) {
        console.debug("[X-Ray] Error on send data to X-Ray Daemon", err);
      } else {
        console.debug("[X-Ray] Data sent");
      }
    }
  });
}

/**
 * Generate time in epoch (xray service format).
 *
 * [Segment Specification]{@link https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields}
 * @param date Date Object
 */
function generateTime(date: Date = new Date()) {
  return date.getTime() / 1000;
}

/**
 * Generate unique ID for segments.
 *
 * [Segment Specification]{@link https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields}
 */
function generateID() {
  return crypto.randomBytes(8).toString("hex");
}

/**
 * Generate TraceID in XRay service format.
 *
 * [Segment Specification]{@link https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields}
 */
function generateTraceID() {
  return `1-${Math.round(new Date().getTime() / 1000).toString(16)}-${crypto.randomBytes(12).toString("hex")}`;
}

/**
 * Set XRayWell global configuration.
 * @param config Config
 */
function setConfig(config: Config) {
  _config = { ..._config, ...config };
}

let uptime;
/**
 * Collect and send process uptime in evert segment.
 * @param active boolean
 * @param secondsUpdate interval to read uptime in seconds
 */
function activeUptime(active: boolean = true, secondsUpdate: number = 30) {
  clearInterval(uptime);
  delete awsField.system.uptime;
  if (!active) return;

  awsField.system.uptime = "--";
  uptime = setInterval(() => {
    awsField.system.uptime = ms(process.uptime() * 1000);
  }, secondsUpdate * 1000);
}

export { sendData, generateID, generateTraceID, generateTime, setConfig, activeUptime, _handleMessage };
