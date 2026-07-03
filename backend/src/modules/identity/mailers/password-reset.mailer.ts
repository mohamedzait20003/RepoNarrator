import { BaseMailer } from '../../../shared/Mail/base.mailer';
import type { Envelope } from '../../../shared/Mail/envelope';
import type { MailContent } from '../../../shared/Mail/mail-content';

const TEMPLATE = /* html */ `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reset your password</title></head>
<body style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
  <h2>Reset your password</h2>
  <p>We received a request to reset the password for your RepoNarrator account.
     Click the button below to choose a new one.
     The link expires in <strong>1 hour</strong>.</p>
  <p style="text-align:center;margin:32px 0">
    <a href="{{url}}"
       style="background:#6D4AFF;color:#fff;text-decoration:none;
              padding:12px 28px;border-radius:6px;font-weight:600;display:inline-block">
      Reset Password
    </a>
  </p>
  <p style="color:#6B7280;font-size:13px">
    If you didn't request this, you can safely ignore this email —
    your password will not change.<br>
    Or paste this link into your browser: <a href="{{url}}">{{url}}</a>
  </p>
</body>
</html>
`;

export class PasswordResetMailer extends BaseMailer {
  constructor(
    private readonly toEmail: string,
    private readonly toName: string | null,
    resetUrl: string,
  ) {
    super();
    this.with('url', resetUrl);
  }

  envelope(): Envelope {
    return {
      toEmail: this.toEmail,
      toName: this.toName ?? this.toEmail,
      subject: 'Reset your RepoNarrator password',
    };
  }

  content(): MailContent {
    return { view: 'password-reset', template: TEMPLATE };
  }
}
