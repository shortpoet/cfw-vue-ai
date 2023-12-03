/* eslint-disable indent */
import { LogLevel, LOG_LOVELS } from "../../../types";
import { isAssetURL } from "./request";

export { logger, logLevel, logWorkerStart, logWorkerEnd, logObjs };

const logLevel = (level: LogLevel, env?: Env): boolean => {
  const envLevel = env?.LOG_LEVEL || "debug";
  const currentIndex = LOG_LOVELS.indexOf(env?.LOG_LEVEL) || 0;
  const targetIndex = LOG_LOVELS.indexOf(level);
  const out = currentIndex >= targetIndex;
  // console.log("logLevel", { level, envLevel, currentIndex, targetIndex, out });
  return out;
};

const logger = (level: LogLevel, env?: Env) => (msg: string | object) => {
  if (logLevel(level, env)) {
    typeof msg === "string"
      ? console.log(msg)
      : console.log(
          ...Object.entries(msg).map(([key, val]) =>
            typeof val === "string" ? val : `${key}: ${JSON.stringify(val)}`,
          ),
        );
  }
};

const logObjs = (objs: string | object[]) => {
  for (const obj of objs) {
    console.log(obj);
  }
};

const logWorkerStart = (request: Request) => {
  const url = new URL(request.url);
  const { cf, headers } = request;
  if (!isAssetURL(url)) {
    console.log(`
        \nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        \n[worker] START main.fetch ->
        \n[${new Date().toLocaleTimeString()}] -> ${
          request.method
        } -> ${url} -> content-type: ${headers.get("Content-Type")}\n
    `);
    if (cf) {
      const { city, region, country, colo, clientTcpRtt } = cf;
      const location = [city, region, country].filter(Boolean).join(", ");
      console.log(`[worker] main.fetch -> detected location: ${location}`);
      if (clientTcpRtt) {
        console.log(
          `[worker] main.fetch -> round trip time from client to edge colo ${colo} is ${clientTcpRtt} ms
           [worker] main.fetch -> headers:
          `,
          // headers
        );
      }
    }
  }
};

const logWorkerEnd = (request: Request, response: Response) => {
  const url = new URL(request.url);
  if (!isAssetURL(url)) {
    console.log(`
        \n[worker] END main.fetch ->
        \n[${new Date().toLocaleTimeString()}] -> ${request.method} -> ${
          url.pathname
        } -> ${response.status} -> ${response.statusText}\n
      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    `);
  }
};
