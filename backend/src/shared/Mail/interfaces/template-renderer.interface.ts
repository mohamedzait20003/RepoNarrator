export const TEMPLATE_RENDERER = Symbol('TEMPLATE_RENDERER');

export interface ITemplateRenderer {
  render(
    viewName: string,
    data: Record<string, unknown>,
    inlineTemplate?: string,
  ): string;
}
