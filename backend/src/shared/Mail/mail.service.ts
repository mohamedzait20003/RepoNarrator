import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

import type { BaseMailer } from './base.mailer';
import type { IMailService } from './interfaces/mail-service.interface';
import { TemplateRenderer } from './template-renderer.service';

/**
 * Renders a mailer's Handlebars template and delivers it over SMTP via Nodemailer.
 * Equivalent to the .NET `SmtpMailService` + MailKit pair.
 */
@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly fromEmail: string;
  private readonly fromName: string;

  constructor(
    private readonly renderer: TemplateRenderer,
    private readonly config: ConfigService,
  ) {
    this.fromEmail = this.config.get<string>('mail.fromEmail')!;
    this.fromName = this.config.get<string>('mail.fromName')!;

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('mail.host'),
      port: this.config.get<number>('mail.port'),
      secure: this.config.get<boolean>('mail.secure'),
      auth: {
        user: this.config.get<string>('mail.username'),
        pass: this.config.get<string>('mail.password'),
      },
    });
  }

  async send(mailer: BaseMailer): Promise<void> {
    const envelope = mailer.envelope();
    const { view, template } = mailer.content();
    const data = mailer.getData();

    const html = this.renderer.render(view, data, template);

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to: `"${envelope.toName}" <${envelope.toEmail}>`,
      subject: envelope.subject,
      html,
    });

    this.logger.log(`Email '${envelope.subject}' sent to ${envelope.toEmail}`);
  }
}
