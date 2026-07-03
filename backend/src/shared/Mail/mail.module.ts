import { Global, Module } from '@nestjs/common';
import { TemplateRenderer } from './template-renderer.service';
import { MailService } from './mail.service';

/**
 * Global module — import once in AppModule; MailService is then available
 * everywhere without re-importing.
 */
@Global()
@Module({
  providers: [TemplateRenderer, MailService],
  exports: [MailService],
})
export class MailModule {}
