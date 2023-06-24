import { i18n } from 'i18next';

export interface Dependency {
  name: string;
  version: string;
  license: string;
  description: string | null;
  dev: boolean;
}

export interface Config {
  overrideDescriptions?: Record<string, string>;
  inputFile: string;
  outputFile: string;
  includeDev: boolean;
  fileFormat: 'markdown' | 'pdf';
  verbose: boolean;
  language: 'en' | 'de';
  deeplApiKey?: string;
  deeplCacheFile: string;
}

export type Generator = (dependencies: Dependency[], config: Config, i18next: i18n) => Promise<Buffer>;
