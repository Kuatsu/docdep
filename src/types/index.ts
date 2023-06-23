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
