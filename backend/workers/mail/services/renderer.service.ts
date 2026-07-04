import { join } from 'path';
import * as Handlebars from 'handlebars';
import { existsSync, readFileSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

@Injectable()
export class RendererService implements OnModuleInit {
  private readonly logger = new Logger(RendererService.name);
  private readonly overridePath: string;
  private readonly appUrl: string;
  private readonly bodyCache = new Map<string, HandlebarsTemplateDelegate>();
  private baseTemplate!: HandlebarsTemplateDelegate;

  constructor(private readonly config: ConfigService) {
    this.overridePath = this.config.get<string>('mail.templatesPath') ?? '';
    this.appUrl = this.config.get<string>('app.frontendUrl')!;
  }

  onModuleInit(): void {
    const basePath = join(__dirname, '../templates/BaseMail.hbs');

    if (!existsSync(basePath)) {
      throw new InternalServerErrorException(
        `BaseMail.hbs not found at '${basePath}'.`,
      );
    }

    this.baseTemplate = Handlebars.compile(readFileSync(basePath, 'utf-8'));
    this.logger.log('BaseMail.hbs loaded.');
  }

  render(
    viewName: string,
    data: Record<string, unknown>,
    inlineTemplate?: string,
  ): string {
    const body = this.compileBody(viewName, inlineTemplate)(data);

    return this.baseTemplate({
      ...data,
      body,
      year: new Date().getFullYear(),
      appUrl: this.appUrl,
    });
  }

  private compileBody(
    viewName: string,
    inlineTemplate?: string,
  ): HandlebarsTemplateDelegate {
    const cached = this.bodyCache.get(viewName);
    if (cached) return cached;

    const source = this.resolveBody(viewName, inlineTemplate);
    const compiled = Handlebars.compile(source);
    this.bodyCache.set(viewName, compiled);
    return compiled;
  }

  private resolveBody(viewName: string, inlineTemplate?: string): string {
    if (this.overridePath) {
      const fsPath = join(this.overridePath, `${viewName}.hbs`);
      if (existsSync(fsPath)) return readFileSync(fsPath, 'utf-8');
    }

    if (inlineTemplate) return inlineTemplate;

    throw new InternalServerErrorException(
      `Email body template '${viewName}' not found.`,
    );
  }
}
