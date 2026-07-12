import { Module } from '@nestjs/common';

import { RendererService } from './services/renderer.service';
import { SenderService } from './services/sender.service';

/**
 * Mail worker providers. Config + Redis are supplied by the parent
 * {@link WorkersModule}, which runs this alongside the narration worker.
 */
@Module({
  providers: [RendererService, SenderService],
  exports: [RendererService, SenderService],
})
export class MailWorkerModule {}
