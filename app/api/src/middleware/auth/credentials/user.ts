import { Env } from '@/types';
import { unauthorizedResponse } from '../../response';
const FILE_LOG_LEVEL = 'debug';
import { getCookieAuthToken, logger, logObjs } from '@/ai-maps-util/index';

export interface CredsUser {
  key: string;
  username: string;
  passwordHash: string;
  createdAt: number;
}

export const sanitizeCredsser = (user: CredsUser): string => {
  const sanitizedUser = Object.assign({}, user);
  Reflect.deleteProperty(sanitizedUser, 'passwordHash');
  return JSON.stringify(sanitizedUser, null, 2);
};
