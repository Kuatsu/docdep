import { i18n } from 'i18next';
import { Config, Dependency } from '../types';

export const generateMarkdown = async (dependencies: Dependency[], config: Config, i18next: i18n): Promise<Buffer> => {
  let markdown = `# ${i18next.t('title')}\n\n`;
  markdown += `${i18next.t('description')}\n\n`;
  markdown += `## ${i18next.t('dependencies.title', { count: dependencies.filter((d) => !d.dev).length })}\n\n`;
  markdown += `| ${i18next.t('dependencies.name')} | ${i18next.t('dependencies.version')} | ${i18next.t(
    'dependencies.license'
  )} | ${i18next.t('dependencies.description')} |\n`;
  markdown += `| ---- | ------- | ------- | ----------- |\n`;
  dependencies
    .filter((d) => !d.dev)
    .forEach((dependency) => {
      markdown += `| ${dependency.name} | ${dependency.version} | ${dependency.license} | ${
        dependency.description ?? ''
      } |\n`;
    });

  if (config.includeDev) {
    markdown += `\n## ${i18next.t('dependencies.devTitle', { count: dependencies.filter((d) => d.dev).length })}\n\n`;
    markdown += `_${i18next.t('dependencies.devTitleHelper')}_\n\n`;
    markdown += `| ${i18next.t('dependencies.name')} | ${i18next.t('dependencies.version')} | ${i18next.t(
      'dependencies.license'
    )} | ${i18next.t('dependencies.description')} |\n`;
    markdown += `| ---- | ------- | ------- | ----------- |\n`;
    dependencies
      .filter((d) => d.dev)
      .forEach((dependency) => {
        markdown += `| ${dependency.name} | ${dependency.version} | ${dependency.license} | ${
          dependency.description ?? ''
        } |\n`;
      });
  }

  return Buffer.from(markdown);
};
