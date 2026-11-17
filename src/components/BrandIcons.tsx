/**
 * Brand marks, drawn inline so the site carries no icon-font or third-party
 * script for them. They inherit currentColor like the rest of the icon set.
 */

type IconProps = {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

export function WhatsAppIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.4-4.2A8.5 8.5 0 1 1 20.5 11.6Z" />
      <path d="M9 8.4c.3-.6.8-.5 1.1 0l.8 1.5c.2.4.1.7-.2 1l-.5.5c.6 1.2 1.5 2 2.7 2.5l.5-.6c.3-.3.6-.3.9-.2l1.6.8c.5.3.5.7.2 1.1-.6.9-1.7 1.3-2.7 1-2.2-.6-4.1-2.4-4.7-4.6-.3-1 .1-2.1.8-3Z" />
    </svg>
  );
}

export function TelegramIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M21 4 3.4 11.2l5.1 1.7L21 4Z" />
      <path d="m8.5 12.9.4 4.6 2.4-2.6 4.2 2.9L21 4" />
    </svg>
  );
}

export function FacebookIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...rest}
    >
      <path d="M13.5 21v-7.2h2.5l.4-2.9h-2.9V9.1c0-.8.3-1.4 1.5-1.4h1.5V5.1c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H8v2.9h2.6V21h2.9Z" />
    </svg>
  );
}

export function YouTubeIcon({ className, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <rect x="2.5" y="6" width="19" height="12" rx="3.2" />
      <path d="m10.4 9.6 4.4 2.4-4.4 2.4V9.6Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
