import chalk from 'chalk';
import { LogLevel, LOG_LOVELS } from '@cfw-vue-ai/types';
import { isAssetURL } from '.';
export {
  logger,
  logLevel,
  logWorkerStart,
  logWorkerEnd,
  logSignin,
  logObjs,
  tryLogHeader,
  tryLogHeaders,
};

const logLevel = (level: LogLevel, env?: Env): boolean => {
  const envLevel = env?.VITE_LOG_LEVEL || 'debug';
  const currentIndex = LOG_LOVELS.indexOf(env?.VITE_LOG_LEVEL) || 0;
  const targetIndex = LOG_LOVELS.indexOf(level);
  const out = currentIndex >= targetIndex;
  // console.log("logLevel", { level, envLevel, currentIndex, targetIndex, out });
  return out;
};

const logger = (level: LogLevel, env?: Env) => (msg: any) => {
  if (logLevel(level, env)) {
    typeof msg === 'string'
      ? console.log(msg)
      : console.log(
          ...Object.entries(msg).map(([key, val]) =>
            typeof val === 'string' ? val : `${key}: ${JSON.stringify(val)}`
          )
        );
  }
};

const logObjs = (objs: any[]) => {
  for (const obj of objs) {
    console.log(obj);
  }
};

const logWorkerStart = (request: Request) => {
  const url = new URL(request.url);
  const { cf, headers } = request;
  let ct;
  if (headers) {
    // console.log(`[api] main.fetch -> headers ->`);
    // tryLogHeaders(request, 'main.fetch');
    ct = headers.get('Content-Type');
  }
  if (!isAssetURL(url)) {
    console.log(
      chalk.green(`
        \nXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
        \n[api] START main.fetch ->
        \n[${new Date().toLocaleTimeString()}] -> ${
          request.method
        } -> ${url} -> content-type: ${ct}\n
    `)
    );
    if (cf) {
      const { city, region, country, colo, clientTcpRtt } = cf;
      const location = [city, region, country].filter(Boolean).join(', ');
      console.log(`[api] main.fetch -> detected location: ${location}`);
      if (clientTcpRtt) {
        console.log(
          `[api] main.fetch -> round trip time from client to edge colo ${colo} is ${clientTcpRtt} ms
           [api] main.fetch -> headers:
          `
          // headers
        );
      }
    }
  }
};

const logWorkerEnd = (request: Request, response: Response) => {
  const url = new URL(request.url);
  if (!isAssetURL(url)) {
    console.log(
      chalk.green(`
        \n[api] END main.fetch ->
        \n[${new Date().toLocaleTimeString()}] -> ${request.method} -> ${url.pathname} -> ${
          response.status
        } -> ${response.statusText}\n
      XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    `)
    );
  }
};

const logSignin = (user: any, account: any, profile: any, email: any, credentials: any) => {
  console.log(chalk.green(`[api] auth.config -> callbacks.signIn -> START \n`));
  // user.role = profile?.role;
  console.log(chalk.green(`[api] auth.config -> callbacks.signIn -> user -> \n`));
  console.log(user);
  console.log(chalk.green(`[api] auth.config -> callbacks.signIn -> account ->\n`));
  console.log(account);
  console.log(chalk.green(`[api] auth.config -> callbacks.signIn -> profile -> \n`));
  console.log(profile);
  console.log(chalk.green(`[api] auth.config -> callbacks.signIn -> email ->\n`));
  console.log(email);
  console.log(chalk.green(`[api] auth.config -> callbacks.signIn -> credentials -> \n`));
  console.log(credentials);
};

const tryLogHeader = (key: string, req: Request, from: string) => {
  // console.log("worker.handleOptions.header.key", key);
  if (!req) return;
  if (!req.headers) return;
  const value = req.headers.get(key);
  if (value) {
    if (key === 'Authorization') {
      console.log(`[api] log header ${from} -> ${key} :: ${value.slice(0, 15)}...`);
      return;
    }
    console.log(`[api] log header ${from} -> ${key} :: ${value}`);
  }
};

const tryLogHeaders = (req: Request, from: string) => {
  if (!req) return;
  if (!req.headers) return;
  for (const [key, value] of req.headers.entries()) {
    if (key === 'Authorization') {
      console.log(`[api] log header ${from} -> ${key} :: ${value.slice(0, 15)}...`);
      return;
    }
    console.log(`[api] log header ${from} -> ${key} :: ${value}`);
  }
};
