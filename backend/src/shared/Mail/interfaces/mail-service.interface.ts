import type { BaseMailer } from '../base.mailer';

export const MAIL_SERVICE = Symbol('MAIL_SERVICE');

export interface IMailService {
  send(mailer: BaseMailer): Promise<void>;
}
