/** Serialised payload enqueued by MailFactory and consumed by the mail worker. */
export interface EmailJobPayload {
  envelope: {
    toEmail: string;
    toName: string;
    subject: string;
  };
  content: {
    view: string;
    /** Inline Handlebars body fragment shipped by the mailer. */
    template?: string;
  };
  /** Typed template variables, serialised from BaseMailer.getData(). */
  data: Record<string, unknown>;
}
