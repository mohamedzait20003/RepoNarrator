/**
 * Describes which template a mailer renders.
 *
 * `view`     – template name without extension, e.g. "verify-email".
 *              The renderer first checks the filesystem at MAIL_TEMPLATES_PATH,
 *              then falls back to the inline `template` string if provided.
 * `template` – optional inline Handlebars source; lets each mailer ship its
 *              own template co-located in the source file, equivalent to
 *              embedded resources in .NET.
 */
export interface MailContent {
  view: string;
  template?: string;
}
