import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../src/shared/Configuration/configuration';
import { TemplateRenderer } from '../src/shared/Services/template-renderer.service';
import { MailService } from '../src/shared/Services/mail.service';

/**
 * Minimal NestJS application context for the email worker process.
 * Provides only what MailService needs — no HTTP, no TypeORM, no feature modules.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      // .env lives at the repo root, one level above /backend
      envFilePath: resolve(__dirname, '../../.env'),
    }),
  ],
  providers: [TemplateRenderer, MailService],
  exports: [MailService],
})
export class WorkerModule {}
