import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';

/**
 * Renders Handlebars email templates with a two-pass strategy:
 *   Pass 1 — render the body fragment (the view-specific template)
 *   Pass 2 — inject the rendered body into BaseMail.hbs (the branded wrapper)
 *
 * Template resolution for the body fragment:
 *   1. Filesystem at MAIL_TEMPLATES_PATH/{view}.hbs  (runtime override)
 *   2. Inline template string supplied by the mailer   (co-located source)
 *
 * BaseMail.hbs is always loaded from shared/Templates/ at startup and cached.
 */
@Injectable()
export class TemplateRenderer implements OnModuleInit {
  private readonly logger = new Logger(TemplateRenderer.name);
  private readonly overridePath: string;
  private readonly bodyCache = new Map<string, HandlebarsTemplateDelegate>();
  private baseTemplate!: HandlebarsTemplateDelegate;

  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    this.overridePath = this.config.get<string>('mail.templatesPath') ?? '';
    this.appUrl = this.config.get<string>('app.frontendUrl')!;
  }

  onModuleInit(): void {
    // BaseMail.hbs lives one level up from Services/ inside the shared/ tree.
    // In dev (ts-node) __dirname == src/shared/Services.
    // In prod (tsc)    __dirname == dist/shared/Services (assets are copied via nest-cli.json).
    const basePath = join(__dirname, '../Templates/BaseMail.hbs');

    if (!existsSync(basePath)) {
      throw new InternalServerErrorException(
        `BaseMail.hbs not found at '${basePath}'. ` +
          `Ensure nest-cli.json assets includes 'src/shared/Templates/**/*.hbs'.`,
      );
    }

    this.baseTemplate = Handlebars.compile(readFileSync(basePath, 'utf-8'));
    this.logger.log('BaseMail.hbs loaded and compiled.');
  }

  render(
    viewName: string,
    data: Record<string, unknown>,
    inlineTemplate?: string,
  ): string {
    // Pass 1 — render the body fragment
    const body = this.compileBody(viewName, inlineTemplate)(data);

    // Pass 2 — wrap in the branded base layout
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

    const source = this.resolveBodySource(viewName, inlineTemplate);
    const compiled = Handlebars.compile(source);
    this.bodyCache.set(viewName, compiled);
    this.logger.debug(`Body template '${viewName}' compiled and cached.`);
    return compiled;
  }

  private resolveBodySource(viewName: string, inlineTemplate?: string): string {
    if (this.overridePath) {
      const fsPath = join(this.overridePath, `${viewName}.hbs`);
      if (existsSync(fsPath)) {
        this.logger.debug(
          `Loading '${viewName}' body from filesystem: ${fsPath}`,
        );
        return readFileSync(fsPath, 'utf-8');
      }
    }

    if (inlineTemplate) {
      this.logger.debug(`Using inline body template for '${viewName}'.`);
      return inlineTemplate;
    }

    throw new InternalServerErrorException(
      `Email body template '${viewName}' not found.`,
    );
  }
}
