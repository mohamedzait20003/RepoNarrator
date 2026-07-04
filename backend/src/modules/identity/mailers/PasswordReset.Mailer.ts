import { BaseMailer } from '../../../shared/Mail/base.mailer';
import type { Envelope } from '../../../shared/Mail/envelope';
import type { MailContent } from '../../../shared/Mail/mail-content';

export interface PasswordResetData {
  url: string;
  subject: string;
}

/** Body fragment rendered inside BaseMail.hbs. */
const TEMPLATE = /* html */ `
<h2>Reset your password</h2>
<p>
  We received a request to reset the password for your RepoNarrator account.
  Click the button below to choose a new one.
  The link expires in <strong>1 hour</strong>.
</p>

<div class="email-cta">
  <a href="{{url}}" class="btn">Reset Password</a>
</div>

<hr class="divider" />

<p class="fallback-link">
  Button not working? Paste this link into your browser:<br>
  <a href="{{url}}">{{url}}</a>
</p>

<p style="color:#9AA1AD;font-size:13px;margin-top:24px">
  If you didn't request a password reset you can safely ignore this email —
  your password will not change.
</p>
`;

export class PasswordResetMailer extends BaseMailer<PasswordResetData> {
  constructor(
    private readonly toEmail: string,
    private readonly toName: string | null,
    private readonly resetUrl: string,
  ) {
    super();
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

  templateData(): PasswordResetData {
    return {
      url: this.resetUrl,
      subject: 'Reset your RepoNarrator password',
    };
  }
}
