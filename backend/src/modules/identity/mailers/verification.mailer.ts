import { BaseMailer } from '../../../shared/Mail/base.mailer';
import type { Envelope } from '../../../shared/Mail/envelope';
import type { MailContent } from '../../../shared/Mail/mail-content';

const TEMPLATE = /* html */ `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Verify your email</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
  <h2>Welcome to RepoNarrator{{#if name}}, {{name}}{{/if}}!</h2>
  <p>Click the button below to verify your email address.
     The link expires in <strong>1 hour</strong>.</p>
  <p style="text-align:center;margin:32px 0">
    <a href="{{url}}"
       style="background:#6D4AFF;color:#fff;text-decoration:none;
              padding:12px 28px;border-radius:6px;font-weight:600;display:inline-block">
      Verify Email
    </a>
  </p>
  <p style="color:#6B7280;font-size:13px">
    If you didn't create an account you can safely ignore this email.<br>
    Or paste this link into your browser: <a href="{{url}}">{{url}}</a>
  </p>
</body>
</html>
`;

export class VerificationMailer extends BaseMailer {
  constructor(
    private readonly toEmail: string,
    private readonly toName: string | null,
    verificationUrl: string,
  ) {
    super();
    this.with('name', toName ?? '').with('url', verificationUrl);
  }

  envelope(): Envelope {
    return {
      toEmail: this.toEmail,
      toName: this.toName ?? this.toEmail,
      subject: 'Verify your RepoNarrator email',
    };
  }

  content(): MailContent {
    return { view: 'verify-email', template: TEMPLATE };
  }
}
