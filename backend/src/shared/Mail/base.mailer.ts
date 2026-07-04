import type { Envelope } from './envelope';
import type { MailContent } from './mail-content';

/**
 * Base class for all mailers (Laravel / .NET Mailable pattern).
 *
 * Generic parameter `T` is the exact shape of template variables the mailer
 * provides. TypeScript enforces at compile time that `templateData()` returns
 * all required fields — no silent typo failures at render time.
 *
 * @example
 * interface WelcomeData { name: string; url: string }
 *
 * export class WelcomeMailer extends BaseMailer<WelcomeData> {
 *   templateData(): WelcomeData { return { name: this.name, url: this.url }; }
 *   envelope(): Envelope { ... }
 *   content():  MailContent { ... }
 * }
 */
export abstract class BaseMailer<T extends object> {
  /** Destination and subject of the email. */
  abstract envelope(): Envelope;

  /** Which template to render (view name + optional inline source). */
  abstract content(): MailContent;

  /**
   * Returns the typed template variables for this mailer.
   * Replaces the old mutable `with()` accumulator — fields are now defined
   * as a plain return value, which TypeScript can fully type-check.
   */
  abstract templateData(): T;

  /** Called by MailService and MailFactory to retrieve the resolved data. */
  getData(): T {
    return this.templateData();
  }
}
