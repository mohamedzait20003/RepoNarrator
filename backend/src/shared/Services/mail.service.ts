import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { BaseMailer } from '../Mail/base.mailer';
import type { Envelope } from '../Mail/envelope';
import type { MailContent } from '../Mail/mail-content';
import { TemplateRenderer } from './template-renderer.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly driver: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly transporter: Transporter | null;

  constructor(
    private readonly renderer: TemplateRenderer,
    private readonly config: ConfigService,
  ) {
    this.driver = this.config.get<string>('mail.driver') ?? 'smtp';
    this.fromEmail = this.config.get<string>('mail.fromEmail')!;
    this.fromName = this.config.get<string>('mail.fromName')!;

    // Don't open an SMTP connection when the driver is 'log'.
    this.transporter =
      this.driver === 'smtp'
        ? nodemailer.createTransport({
            host: this.config.get<string>('mail.host'),
            port: this.config.get<number>('mail.port'),
            secure: this.config.get<boolean>('mail.secure'),
            auth: {
              user: this.config.get<string>('mail.username'),
              pass: this.config.get<string>('mail.password'),
            },
          })
        : null;
  }

  /** Convenience method — resolves the mailer and delegates to sendRaw. */
  async send<T extends object>(mailer: BaseMailer<T>): Promise<void> {
    return this.sendRaw(
      mailer.envelope(),
      mailer.content(),
      mailer.getData() as Record<string, unknown>,
    );
  }

  /**
   * Core send method used by both send() and the email worker.
   * The worker passes a pre-serialised payload (no mailer instance needed).
   */
  async sendRaw(
    envelope: Envelope,
    content: MailContent,
    data: Record<string, unknown>,
  ): Promise<void> {
    const html = this.renderer.render(content.view, data, content.template);

    if (this.driver === 'log') {
      this.logger.log(
        `[MAIL:log] → ${envelope.toEmail} | "${envelope.subject}"`,
      );
      this.logger.verbose(`[MAIL:log] HTML body:\n${html}`);
      return;
    }

    await this.transporter!.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: `"${envelope.toName}" <${envelope.toEmail}>`,
      subject: envelope.subject,
      html,
    });

    this.logger.log(`Email "${envelope.subject}" sent to ${envelope.toEmail}`);
  }
}
