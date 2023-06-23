import { i18n } from 'i18next';
import { mdToPdf } from 'md-to-pdf';
import { Config, Dependency } from '../types';
import { generateMarkdown } from './markdown';

export const generatePdf = async (dependencies: Dependency[], config: Config, i18next: i18n): Promise<Buffer> => {
  const markdown = await generateMarkdown(dependencies, config, i18next);

  return (await mdToPdf({ content: markdown.toString() })).content;
};
