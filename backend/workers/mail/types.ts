/** Serialised payload enqueued by MailFactory and consumed by the mail worker. */
export interface EmailJobPayload {
  envelope: {
    toEmail: string;
    toName: string;
    subject: string;
  };
  content: {
    view: string;
    template?: string;
  };
  data: Record<string, unknown>;
}
