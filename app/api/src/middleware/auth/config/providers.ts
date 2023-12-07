import { CredentialsConfig, OAuthConfig, Provider } from '@auth/core/providers';

import { Env, UserRole } from 'types/index';
import chalk from 'chalk';
import { sendMail } from '../jmap';
import Credentials from '@auth/core/providers/credentials';
import GitHub, { GitHubProfile } from '@auth/core/providers/github';
import { authorize, fromDate } from '../credentials/authorize';
import { SESSION_MAX_AGE } from './config';
import { logger } from '@/ai-maps-util';
const FILE_LOG_LEVEL = 'debug';

export const deriveAuthProviders = (env: Env) => {
  const log = logger(FILE_LOG_LEVEL, env);
  const providers = [];

  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHub({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        profile(profile) {
          log(`[worker] auth.config -> GitHub -> profile -> \n`);
          // console.log(profile);
          return {
            id: profile.id.toString(),
            name: profile.name,
            email: profile.email,
            image: profile.avatar_url
            // role: profile.role ?? UserRole.User
          };
        }
      }) as OAuthConfig<GitHubProfile>
    );
  }

  providers.push({
    id: 'email',
    type: 'email',
    server: {},
    from: env.EMAIL_FROM,
    maxAge: 24 * 60 * 60,
    name: 'Email',
    options: {},
    async sendVerificationRequest({
      identifier,
      url
    }: {
      identifier: string;
      url: string;
    }) {
      let recipient = '';
      if (identifier && identifier.includes('@')) {
        recipient = identifier.match(/[^@]+/)![0];
      }
      const messageBody = `
    <p>Hi, ${recipient}!</p>
    <p>Please click the link below to verify your email address:</p>
    <p><a href="${url}">${url}</a></p>
    <p>Thanks,</p>
    <p>Your AI Maps Team</p>
  `;
      const subject = 'Verify your email address';
      log(`[worker] auth.config -> sendVerificationRequest -> \n`);
      const response = await sendMail({
        env,
        messageBody,
        from: env.EMAIL_FROM,
        to: identifier,
        subject
      });
      console.log(response);
      if (!response) {
        const errors = response;
        throw new Error(JSON.stringify(errors, null, 2));
      }
    }
  });

  // providers.push(
  //   Credentials({
  //     name: 'Credentials',
  //     credentials: {
  //       email: {
  //         label: 'Email',
  //         type: 'text',
  //         placeholder: 'example@email.com'
  //       },
  //       password: {
  //         label: 'Password',
  //         type: 'password',
  //         placeholder: 'supersecret'
  //       }
  //     },
  //     // TODO fix this
  //     async authorize({ email, password }, request) {
  //       return authorize({ email, password }, request, env, SESSION_MAX_AGE);
  //     }
  //   }) as CredentialsConfig
  // );

  return providers;
};
