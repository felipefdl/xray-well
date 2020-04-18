interface Request {
  method: string;
  user_agent?: string;
  client_ip?: string;
  url: string;
  x_forwarded_for?: string;
}

interface Response {
  status: number;
  content_length: number;
}

interface Http {
  request?: Request;
  response?: Response;
}

interface TagValue {
  [key: string]: string | number;
}

interface Metadata {
  [namespace: string]: TagValue;
}

interface Message {
  id: string;
  trace_id: string;
  parent_id?: string;
  start_time: number;
  end_time?: number;
  in_progress: boolean;
  error?: boolean;
  throttle?: boolean;
  fault?: boolean;
  annotations?: TagValue;
  user?: string;
  metadata?: Metadata;
  http?: Http;
}

interface DaemonMessage extends Message {
  aws: Metadata;
  name: string;
}

interface Config {
  name: string;
  server: string;
  port: number;
  debug?: boolean;
}

interface MiddlewareConfig {
  throttleSeconds: number;
  ignoreStatusCodeError: number[];
  ignoreStatusCodeFault: number[];
}
