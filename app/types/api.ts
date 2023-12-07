import type { Commit } from 'git-last-commit';
import { User, UserUnion } from './auth';

export interface ListOptions {
  indexKey?: string;
  limit?: number;
  cursor?: string;
}

export interface ListOptionsRequest extends Request {
  listOptions: ListOptions;
}

export interface JsonData {
  [key: string]: unknown;
}

export type HealthCheck = {
  status: string;
  version: string;
  uptime: string;
  worker_env: string;
  timestamp: Date;
  gitInfo: Commit;
};

export interface Image {
  id: string;
  title: string;
  url: string;
}

export interface Joke {
  id: string;
  message: string;
  tags: string[];
}

export interface RequestOptions {
  method: string;
  headers: Headers;
  body?: string;
}

export interface ResponseOptions extends ResponseInit {
  status: number;
  headers: Headers;
  body?: string;
}

export interface BodyContext {
  user: UserUnion;
  data: any;
}

export interface ListOptions {
  indexKey?: string;
  limit?: number;
  cursor?: string;
}

export interface ListOptionsRequest extends Request {
  listOptions: ListOptions;
}
