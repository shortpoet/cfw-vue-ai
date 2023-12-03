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
