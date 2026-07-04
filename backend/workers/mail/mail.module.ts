import { resolve } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RendererService } from './services/renderer.service';
import { SenderService } from './services/sender.service';

/**
 * Self-contained NestJS application context for the mail worker.
 * Provides only what is needed to render and send emails.
 * Zero imports from src/ — the worker is an independent process.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../../../.env'),
      load: [
        () => ({
          app: {
            frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
          },
          mail: {
            driver: process.env.MAIL_DRIVER ?? 'smtp',
            host: process.env.MAIL_HOST ?? 'localhost',
            port: parseInt(process.env.MAIL_PORT ?? '587', 10),
            secure: process.env.MAIL_SECURE === 'true',
            username: process.env.MAIL_USERNAME ?? '',
            password: process.env.MAIL_PASSWORD ?? '',
            fromEmail:
              process.env.MAIL_FROM_EMAIL ?? 'noreply@reponarrator.com',
            fromName: process.env.MAIL_FROM_NAME ?? 'RepoNarrator',
            templatesPath: process.env.MAIL_TEMPLATES_PATH ?? '',
          },
        }),
      ],
    }),
  ],
  providers: [RendererService, SenderService],
  exports: [RendererService, SenderService],
})
export class MailWorkerModule {}
