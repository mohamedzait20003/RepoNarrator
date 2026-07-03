import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';

import type { ITemplateRenderer } from './interfaces/template-renderer.interface';

/**
 * Renders Handlebars (`.hbs`) email templates.
 *
 * Resolution order (mirrors the .NET embedded-resource strategy):
 *   1. Filesystem at `MAIL_TEMPLATES_PATH/{view}.hbs`  (runtime override)
 *   2. Inline template string passed by the mailer       (co-located source)
 *
 * Compiled templates are cached by view name.
 */
@Injectable()
export class TemplateRenderer implements ITemplateRenderer {
  private readonly logger = new Logger(TemplateRenderer.name);
  private readonly templatesPath: string;
  private readonly cache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private readonly config: ConfigService) {
    this.templatesPath = this.config.get<string>('mail.templatesPath') ?? '';
  }

  render(
    viewName: string,
    data: Record<string, unknown>,
    inlineTemplate?: string,
  ): string {
    const compiled = this.compile(viewName, inlineTemplate);
    return compiled(data);
  }

  private compile(
    viewName: string,
    inlineTemplate?: string,
  ): HandlebarsTemplateDelegate {
    const cached = this.cache.get(viewName);
    if (cached) return cached;

    const source = this.resolveSource(viewName, inlineTemplate);
    const compiled = Handlebars.compile(source);
    this.cache.set(viewName, compiled);
    this.logger.debug(`Template '${viewName}' compiled and cached.`);
    return compiled;
  }

  private resolveSource(viewName: string, inlineTemplate?: string): string {
    // 1 — Filesystem override
    if (this.templatesPath) {
      const fsPath = join(this.templatesPath, `${viewName}.hbs`);
      if (existsSync(fsPath)) {
        this.logger.debug(
          `Loading template '${viewName}' from filesystem: ${fsPath}`,
        );
        return readFileSync(fsPath, 'utf-8');
      }
    }

    // 2 — Inline template shipped with the mailer
    if (inlineTemplate) {
      this.logger.debug(`Using inline template for '${viewName}'.`);
      return inlineTemplate;
    }

    throw new InternalServerErrorException(
      `Email template '${viewName}' not found ` +
        `(no filesystem override at '${this.templatesPath}' and no inline template provided).`,
    );
  }
}
