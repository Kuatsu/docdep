import { Config } from '../types';
import fs from 'fs';
import path from 'path';

export const getEnv = (key: string): string | undefined => {
  if (process.env[key]) return process.env[key];
  // recursively check for .env file in parent directories
  let dir = process.cwd();
  while (dir !== '/') {
    const envFile = path.join(dir, '.env');
    if (fs.existsSync(envFile)) {
      const envContent = fs.readFileSync(envFile, 'utf8');
      const envLines = envContent.split('\n');
      for (const line of envLines) {
        const [envKey, envValue] = line.split('=');
        if (envKey === key) return envValue;
      }
    }
    dir = path.dirname(dir);
  }
  return undefined;
};

export const parseConfigJson = (configFilePath: string): Config | false => {
  let fileContent: string;
  try {
    fileContent = fs.readFileSync(configFilePath, 'utf8');
  } catch (e) {
    return false;
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(fileContent);
  } catch (e) {
    return false;
  }

  if (typeof parsed !== 'object') return false;
  if (parsed === null) return false;

  if (typeof parsed.inputFile !== 'string') return false;
  if (typeof parsed.outputFile !== 'string') return false;
  if (typeof parsed.includeDev !== 'boolean' && parsed.includeDev !== undefined) return false;
  if (typeof parsed.fileFormat !== 'string' && parsed.fileFormat !== undefined) return false;
  if (typeof parsed.verbose !== 'boolean' && parsed.verbose !== undefined) return false;
  if (typeof parsed.language !== 'string' && parsed.language !== undefined) return false;
  if (typeof parsed.deeplApiKey !== 'string' && parsed.deeplApiKey !== undefined) return false;
  if (typeof parsed.deeplCacheFile !== 'string' && parsed.deeplCacheFile !== undefined) return false;

  // if inputFile / outputFile is a relative path, make it absolute using config file path
  if (!parsed.inputFile.startsWith('/')) {
    parsed.inputFile = path.join(path.dirname(configFilePath), parsed.inputFile);
  }
  if (!parsed.outputFile.startsWith('/')) {
    parsed.outputFile = path.join(path.dirname(configFilePath), parsed.outputFile);
  }
  if (parsed.deeplCacheFile && !(parsed.deeplCacheFile as string).startsWith('/')) {
    parsed.deeplCacheFile = path.join(path.dirname(configFilePath), parsed.deeplCacheFile as string);
  }

  if (parsed.deeplApiKey === 'env') {
    parsed.deeplApiKey = getEnv('DEEPL_API_KEY');
  }
  if (parsed.language !== 'en' && !(parsed.deeplApiKey as string)?.length) return false;

  return {
    inputFile: parsed.inputFile as string,
    outputFile: parsed.outputFile as string,
    overrideDescriptions: parsed.overrideDescriptions as Record<string, string> | undefined,
    includeDev: (parsed.includeDev as boolean | undefined) ?? false,
    fileFormat: (parsed.fileFormat as 'markdown' | 'pdf' | undefined) ?? 'markdown',
    verbose: (parsed.verbose as boolean | undefined) ?? false,
    language: (parsed.language as 'en' | 'de' | undefined) ?? 'en',
    deeplApiKey: parsed.deeplApiKey as string | undefined,
    deeplCacheFile:
      (parsed.deeplCacheFile as string | undefined) ??
      path.join(path.dirname(configFilePath), './.docdep-deepl-cache.json'),
  };
};
