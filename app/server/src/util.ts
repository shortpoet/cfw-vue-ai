import http from "http";
import chalk from "chalk";
import { ExecutionContext } from "@cloudflare/workers-types";
export { mapHttpHeaders, parseFormData, serverLogStart, serverLogEnd, ctx };

interface MappedHeaders {
  [key: string]: any;
  mappedHeaders: HeadersInit;
  contentType: string | undefined;
}

const mapHttpHeaders = (headers: http.IncomingHttpHeaders): MappedHeaders => {
  const mappedHeaders: HeadersInit = {};
  let contentType: string | undefined;
  for (const key in headers) {
    if (headers.hasOwnProperty(key)) {
      const value = headers[key];
      if (typeof value === "string") {
        if (key === "content-type") {
          contentType = value;
        }
        mappedHeaders[key] = value;
      } else if (Array.isArray(value)) {
        if (key === "content-type") {
          contentType = value.join(",");
        }
        mappedHeaders[key] = value.join(",");
      }
    }
  }
  return { mappedHeaders, contentType };
};

const ctx: ExecutionContext = {
  waitUntil: async (promise: Promise<any>) => {
    await promise;
  },
  passThroughOnException: () => true,
};

const serverLogStart = (req: http.IncomingMessage, contentType: string) => {
  console.log(
    chalk.green(`
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
[server] [${new Date().toLocaleTimeString()}] main.fetch ->`),
    chalk.magenta(`
         -> ${req.method} -> ${req.url} -> 
        content-type: ${contentType}
        Api Version -> ${process.env.API_VERSION}\n`)
  );
};

const serverLogEnd = (req: http.IncomingMessage, res: http.ServerResponse) => {
  console.log(
    chalk.blueBright(`
         -> END STATUS -> ${res.statusCode} -> ${req.url}
        MSG ${JSON.stringify(res.statusMessage, null, 2)}
[server] [${new Date().toLocaleTimeString()}] main.fetch
XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
  );
};
function parseFormData(data: string): { [key: string]: string } {
  const formData: { [key: string]: string } = {};
  const keyValuePairs = data.split("&");

  for (const pair of keyValuePairs) {
    const [key, value] = pair.split("=");
    formData[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return formData;
}
