import { mdToPdf } from 'md-to-pdf';
import { Generator } from '../types';
import { generateMarkdown } from './markdown';

export const generatePdf: Generator = async (dependencies, config, i18next) => {
  const markdown = await generateMarkdown(dependencies, config, i18next);

  return (await mdToPdf({ content: markdown.toString() })).content;
};
