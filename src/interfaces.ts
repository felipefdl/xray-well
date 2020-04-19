/**
 * All Interfaces of XRay Well
 * @packageDocumentation
 */

interface Request {
  /** The request method. For example, GET. */
  method: string;
  /** The user agent string from the requester's client. */
  user_agent?: string;
  /** The IP address of the requester. */
  client_ip?: string;
  /** The full URL of the request, compiled from the protocol, hostname, and path of the request. */
  url: string;
  /** Indicating that the client_ip was read from an X-Forwarded-For header and is not reliable as it could have been forged. */
  x_forwarded_for?: boolean;
}

interface Response {
  /** Indicating the HTTP status of the response. */
  status: number;
  /** Indicating the length of the response body in bytes. */
  content_length: number;
}

interface Http {
  /** Information about a request. */
  request?: Request;
  /** Information about a response. */
  response?: Response;
}

interface TagValue {
  [key: string]: string | number | boolean;
}

interface Metadata {
  [namespace: string]: TagValue;
}

interface SQL {
  /** For SQL Server or other database connections that don't use URL connection strings, record the connection string, excluding passwords. */
  connection_string?: string;
  /** For a database connection that uses a URL connection string, record the URL, excluding passwords. */
  url?: string;
  /** call if the query used a PreparedCall; statement if the query used a PreparedStatement. */
  preparation?: string;
  /** The name of the database engine. */
  database_type?: string;
  /** The version number of the database engine. */
  database_version?: string;
  /** The name and version number of the database engine driver that your application uses. */
  driver_version?: string;
  /** The database username. */
  user?: string;
  /** The database query, with any user provided values removed or replaced by a placeholder. */
  sanitized_query?: string;
}

/**
 * Segment Document.
 *
 * Object follows [AWS Documention]{@link https://docs.aws.amazon.com/xray/latest/devguide/xray-api-segmentdocuments.html#api-segmentdocuments-fields}
 */
interface Segment {
  /** The logical name of the service that handled the request, up to 200 characters.
   * For example, your application's name or domain name.
   * Names can contain Unicode letters, numbers, and whitespace,
   * and the following symbols: _, ., :, /, %, &, #, =, +, \, -, @
   */
  name: string;
  /** A 64-bit identifier for the segment, unique among segments in the same trace, in 16 hexadecimal digits. */
  id: string;
  /** A unique identifier that connects all segments and subsegments originating from a single client request. Trace ID Format */
  trace_id: string;
  /** Segment ID of the subsegment's parent segment. Required only if sending a subsegment separately. */
  parent_id?: string;
  /** That is the time the segment was created, in floating point seconds in epoch time. */
  start_time: number;
  /** That is the time the segment was closed, in floating point seconds in epoch time. */
  end_time?: number;
  /** Required only if sending a subsegment separately. */
  type?: string;
  /** That is set to true instead of specifying an end_time to record that a subsegment is started, but is not complete. */
  in_progress: boolean;
  /** Indicating that a client error occurred. */
  error?: boolean;
  /** Indicating that a request was throttled. */
  throttle?: boolean;
  /** Indicating that a server error occurred. */
  fault?: boolean;
  /** Object with key-value pairs that you want X-Ray to index for search. */
  annotations?: TagValue;
  /** A string that identifies the user who sent the request. */
  user?: string;
  /** Object with any additional data that you want to store in the segment. */
  metadata?: Metadata;
  /** Object with information about an outgoing HTTP call. */
  http?: Http;
  /** Object with information about SQL call. */
  sql?: SQL;
}

interface DaemonSegment extends Segment {
  /** AWS resource data. */
  aws: Metadata;
}

interface Config {
  /** The logical name of the service that handled the request, up to 200 characters.
   * For example, your application's name or domain name.
   * Names can contain Unicode letters, numbers, and whitespace,
   * and the following symbols: _, ., :, /, %, &, #, =, +, \, -, @
   */
  name: string;
  /** X-Ray Daemon Address. */
  server: string;
  /** X-Ray Daemon UDP Port */
  port: number;
  /** Active X-Ray Well Debug Log */
  debug?: boolean;
}

interface MiddlewareConfig {
  /** The logical name of the service that handled the request. */
  name?: string;
  /** Seconds to set segment as trottle. */
  throttleSeconds?: number;
  /** Array of Status Code to not set as error. from 400 to 499. */
  ignoreStatusCodeError?: number[];
  /** Array of Status Code to not set as fault. from 500 to 599. */
  ignoreStatusCodeFault?: number[];
  /** Array of methods to not send to aws. e.g. ["OPTIONS"]  */
  ignoreMethods?: string[];
  /** Array of paths to not send to aws. e.g. ["/healhcheck"] */
  ignorePaths?: string[];
}
