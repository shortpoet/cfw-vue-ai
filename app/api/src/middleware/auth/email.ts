export function html({
  url,
  email,
  host,
}: {
  url: string;
  email: string;
  host: string;
}) {
  const escapedEmail = `${email.replace(/\./g, "&#8203;.")}`;
  const escapedHost = `${host.replace(/\./g, "&#8203;.")}`;
  // Your email template here
  return `
      <body>
        <h1>Your magic link! 🪄</h1>
        <h3>Your email is ${escapedEmail}</h3>
        <p>
          <a href="${url}">Sign in to ${escapedHost}</a>
      </body>
  `;
}

// Fallback for non-HTML email clients
export function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
