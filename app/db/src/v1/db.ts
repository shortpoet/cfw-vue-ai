import type { GeneratedAlways } from 'kysely';
import { UserRole, UserType } from '@cfw-vue-ai/types';

type AccountId = string;
type UserId = string;
type RoleId = string;
type SessionId = string;

export interface Database {
  User: {
    id: GeneratedAlways<string>;
    name: string | null;
    email: string;
    emailVerified: Date | string | null;
    created_at: Date;
    updated_at: Date;
    userType: UserType;
    image?: string | null;
    username?: string | null;
    password?: string | null;
    sub?: string;
  };
  UserRole: {
    id: GeneratedAlways<string>;
    role: UserRole;
  };
  UserRoleAssignment: {
    id: GeneratedAlways<string>;
    userId: UserId;
    roleId: RoleId;
    created_at: Date;
    updated_at: Date;
  };
  Account: {
    id: GeneratedAlways<string>;
    userId: string;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    token_type: string | null;
    scope: string | null;
    id_token: string | null;
    session_state: string | null;
    created_at: Date;
    updated_at: Date;
  };
  Session: {
    id: GeneratedAlways<string>;
    userId: string;
    sessionToken: string;
    expires: Date | string;
    access_token?: string;
    created_at: Date;
    updated_at: Date;
  };
  VerificationToken: {
    id: GeneratedAlways<string>;
    identifier: string;
    token: string;
    expires: Date | string;
    created_at: Date;
    updated_at: Date;
  };
}
