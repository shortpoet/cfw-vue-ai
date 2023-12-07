import { Database } from '.';

export type AccessControlKind = 'r2';

const forwards: { [key in AccessControlKind]: number } = { r2: 1 };
const backwards: { [key: number]: AccessControlKind } = { 1: 'r2' };

export const castKindToInt = (kind: AccessControlKind): number => forwards[kind];
export const castIntToKind = (kind: number): AccessControlKind =>
  backwards[kind] as AccessControlKind;

export const castBoolToInt = (val: boolean) => (val ? 1 : 0);
export const castIntToBool = (val: number) => val === 1;

export const propertiesToFormat: (keyof Database['User'])[] = [
  'id',
  'emailVerified',
  'created_at',
  'updated_at'
];

export const format = {
  /**
   * Helper function to return the passed in object and its specified prop
   * as an ISO string if SQLite is being used.
   */
  from<T extends Partial<Record<K, Date | null>>, K extends keyof T>(
    data: T,
    key: K,
    isSqlite: boolean
  ) {
    const value = data[key];
    return {
      ...data,
      [key]: value && isSqlite ? value.toISOString() : value
    };
  },
  to
};

type ReturnData<T = never> = Record<string, Date | string | T>;

/**
 * Helper function to return the passed in object and its specified prop as a date.
 * Necessary because SQLite has no date type so we store dates as ISO strings.
 */
function to<T extends Partial<ReturnData>, K extends keyof T>(
  data: T,
  key: K
): Omit<T, K> & Record<K, Date>;
function to<T extends Partial<ReturnData<null>>, K extends keyof T>(
  data: T,
  key: K
): Omit<T, K> & Record<K, Date | null>;
function to<T extends Partial<ReturnData<null>>, K extends keyof T>(data: T, key: K) {
  const value = data[key];
  return Object.assign(data, {
    [key]: value && typeof value === 'string' ? new Date(value) : value
  });
}

type ReplaceValues<T, K extends keyof T, V> = Omit<T, K> & { [key in K]: V };

const castKeysToBool = <T extends { [key: string]: unknown }, K extends keyof T>(
  obj: T,
  keys: K[]
) => {
  for (const key of keys) {
    const oldVal = obj[key];
    if (typeof oldVal === 'number') {
      // eslint-disable-next-line no-param-reassign
      obj[key] = castIntToBool(oldVal) as T[K];
    }
  }
  return obj as ReplaceValues<T, K, boolean>;
};
