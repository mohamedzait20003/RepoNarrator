import type { Envelope } from './envelope';
import type { MailContent } from './mail-content';

/**
 * Base class for all mailers (Laravel / .NET Mailable pattern).
 *
 * Concrete mailers declare what to send (`envelope`) and which template
 * to render (`content`), then populate template variables with `with()`.
 *
 * @example
 * export class VerificationMailer extends BaseMailer {
 *   constructor(user: User, url: string) {
 *     super();
 *     this.with('name', user.name).with('url', url);
 *   }
 *   envelope() { return { toEmail: user.email, toName: user.name, subject: 'Verify your email' }; }
 *   content()  { return { view: 'verify-email', template: VERIFY_EMAIL_TEMPLATE }; }
 * }
 */
export abstract class BaseMailer {
  protected readonly data: Record<string, unknown> = {};

  /** Destination and subject of the email. */
  abstract envelope(): Envelope;

  /** Which template to render and (optionally) its inline source. */
  abstract content(): MailContent;

  /** Fluent helper — adds a variable available inside the template as `{{key}}`. */
  protected with(key: string, value: unknown): this {
    this.data[key] = value;
    return this;
  }

  /** Returns a snapshot of the template data (called by MailService). */
  getData(): Record<string, unknown> {
    return { ...this.data };
  }
}
