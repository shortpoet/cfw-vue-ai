import http from 'http';
import dotenv from 'dotenv';
import { error, json } from 'itty-router';
import path from 'node:path';
import { corsify, Api } from '@cfw-vue-ai/api/src/router';
import { mapHttpHeaders, serverLogStart, ctx, serverLogEnd } from './util';
import { root } from '.';

const envDir = path.resolve(process.cwd(), '.');
const conf = dotenv.config({ path: `${envDir}/.env` });
const parsed = conf.parsed;
const vars = dotenv.config({ path: `${root}/.dev.vars` });
const parsedDev = vars.parsed;
if (!parsed || !parsedDev) {
  const which = [!parsed, !parsedDev];
  throw new Error(`[server] missing env vars -> \n\t\t[.env, .dev.vars] -> ${which}]`);
}
const HOST: string = process.env.HOST || 'localhost';
const PORT: number = parseInt(process.env.PORT || '3333');
const SECRET: string = process.env.NEXTAUTH_SECRET || '';
const GITHUB_CLIENT_ID: string = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET: string = process.env.GITHUB_CLIENT_SECRET || '';
if (!SECRET || !GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  const which = [!SECRET, !GITHUB_CLIENT_ID, !GITHUB_CLIENT_SECRET]
    .map((b) => b.toString())
    .filter(Boolean)
    .join(', ');
  throw new Error(
    `[server] auth.config -> missing secret or env vars -> \n\t\t[NEXTAUTH_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET] -> ${which}]`
  );
}

const server = http.createServer(async (req, res) => {
  res.on('error', (err) => {
    console.error(err);
    res.statusCode = 500;
    res.end(err);
  });

  if (req.url) {
    const { mappedHeaders, contentType } = mapHttpHeaders(req.headers);
    serverLogStart(req, contentType ?? '');
    // console.log(req);
    const apiReq = new Request(new URL(req.url, 'http://' + req.headers.host), {
      method: req.method,
      headers: mappedHeaders,
      // body: req.read(),
    });
    const response = new Response();
    // const response = new Response("", { cf: req.cf });
    const resp = await Api.handle(apiReq, response, process.env, ctx)
      .then(json)
      .catch(error)
      .then(corsify);

    if (!resp) {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }

    const incomingHeaders = Array.from(resp.headers.entries()) as any;
    console.log('[server] incomingHeaders', incomingHeaders);

    res.writeHead(resp.status, resp.statusText, incomingHeaders);

    res.end((await resp.text()) + '\n');

    res.on('finish', () => {
      serverLogEnd(req, res);
    });
  }
});

server.on('error', (e: NodeJS.ErrnoException) => {
  if (e.code === 'EADDRINUSE') {
    console.log('Address in use, retrying...');
    setTimeout(() => {
      server.close();
      server.listen(PORT, HOST);
    }, 1000);
  }
  console.error(e);
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
