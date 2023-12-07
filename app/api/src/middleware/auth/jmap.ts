import { Env } from "types";

export { sendMail };

interface AuthParams {
  headers: {
    "Content-Type": string;
    Authorization: string;
  };
  authUrl: string;
  username: string;
}

const getAuthParams = async (env: Env): Promise<AuthParams> => ({
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${env.JMAP_TOKEN}`,
  },
  authUrl: `https://api.fastmail.com/.well-known/jmap`,
  // authUrl: `https://${env.JMAP_HOSTNAME}/.well-known/jmap`,
  username: env.EMAIL_SERVER_USER,
});

const getSession = async (
  authUrl: string,
  headers: Record<string, string>
): Promise<any> => {
  const response = await fetch(authUrl, {
    method: "GET",
    headers,
  });
  return response.json();
};

const mailboxQuery = async (
  apiUrl: string,
  accountId: string,
  headers: Record<string, string>
): Promise<any> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: ["urn:ietf:params:jmap:core", "urn:ietf:params:jmap:mail"],
      methodCalls: [
        ["Mailbox/query", { accountId, filter: { name: "Drafts" } }, "a"],
      ],
    }),
  });
  const data: any = await response.json();

  return await data["methodResponses"][0][1].ids[0];
};

const identityQuery = async (
  apiUrl: string,
  accountId: string,
  username: string,
  headers: Record<string, string>
): Promise<any> => {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [["Identity/get", { accountId, ids: null }, "a"]],
    }),
  });
  const data: any = await response.json();

  return await data["methodResponses"][0][1].list.filter(
    (identity: any) => identity.email === username
  )[0].id;
};

interface DraftParams {
  apiUrl: string;
  accountId: string;
  draftId: string;
  identityId: string;
  username: string;
  headers: Record<string, string>;
  messageBody?: string;
  from?: string;
  to?: string;
  subject?: string;
}

const draftResponse = async ({
  apiUrl,
  accountId,
  draftId,
  identityId,
  username,
  headers,
  messageBody = "Hi! \n\n" +
    "This email may not look like much, but I sent it with JMAP, a protocol \n" +
    "designed to make it easier to manage email, contacts, calendars, and more of \n" +
    "your digital life in general. \n\n" +
    "Pretty cool, right? \n\n" +
    "-- \n" +
    "This email sent from my next-generation email system at Fastmail. \n",
  from = username,
  to = username,
  subject = "Hello, world!",
}: DraftParams): Promise<any> => {
  const draftObject = {
    from: [{ email: from }],
    to: [{ email: to }],
    subject,
    keywords: { $draft: true },
    mailboxIds: { [draftId]: true },
    bodyValues: { body: { value: messageBody, charset: "utf-8" } },
    textBody: [{ partId: "body", type: "text/plain" }],
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      using: [
        "urn:ietf:params:jmap:core",
        "urn:ietf:params:jmap:mail",
        "urn:ietf:params:jmap:submission",
      ],
      methodCalls: [
        ["Email/set", { accountId, create: { draft: draftObject } }, "a"],
        [
          "EmailSubmission/set",
          {
            accountId,
            onSuccessDestroyEmail: ["#sendIt"],
            create: { sendIt: { emailId: "#draft", identityId } },
          },
          "b",
        ],
      ],
    }),
  });

  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
};

const sendMail = async ({
  env,
  messageBody,
  from,
  to,
  subject,
}: {
  env: Env;
  messageBody?: string;
  from?: string;
  to?: string;
  subject?: string;
}): Promise<any> => {
  const { headers, authUrl, username } = await getAuthParams(env);
  const session = await getSession(authUrl, headers);
  const apiUrl = session.apiUrl;
  const accountId = session.primaryAccounts["urn:ietf:params:jmap:mail"];
  const draftId = await mailboxQuery(apiUrl, accountId, headers);
  const identityId = await identityQuery(apiUrl, accountId, username, headers);
  return await draftResponse({
    apiUrl,
    accountId,
    draftId,
    identityId,
    username,
    headers,
    messageBody,
    from,
    to,
    subject,
  });
};
