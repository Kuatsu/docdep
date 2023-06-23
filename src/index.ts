import { Command, Option } from '@commander-js/extra-typings';
import fs from 'fs';
import fetchPackageJson from 'package-json';
import { Config, Dependency } from './types';
import Printer from './utils/printer';
import * as deepl from 'deepl-node';
import { parseConfigJson } from './utils/helpers';
import i18next from 'i18next';
import de from './locales/de';
import en from './locales/en';
import { generatePdf } from './generators/pdf';
import { generateMarkdown } from './generators/markdown';

// Parse command line arguments
const program = new Command()
  .addHelpText(
    'after',
    `\nExamples:
  $ docdep # will read all dependencies from package.json in current directory and generate a dependency documentation in markdown format in the current directory (DEPENDENCIES.md)
  $ docdep -o /path/to/output.md # writes the generated markdown documentation to the specified path
  $ docdep -i /path/to/input/package.json -d # will read the dependencies from the package.json at the specified path and also include devDependencies
  $ docdep -i /path/to/input/package.json -o /path/to/output.md -d # combines the two previous examples
  $ docdep --pdf # generates a pdf file instead of markdown
  $ docdep -c /path/to/config.json # uses a config file for the generation process – when using a config file, all other options other than verbose will be ignored; refer to README for more information`
  )
  .addOption(new Option('-o, --output <output>', 'output file path').default('./DEPENDENCIES.md'))
  .addOption(new Option('-i, --input <input>', 'input file path').default('./package.json'))
  .addOption(new Option('-d, --dev', 'include devDependencies'))
  .addOption(
    new Option(
      '-c, --config <config>',
      'config file path (overrides all other options except verbose) – refer to README for more information'
    )
  )
  .addOption(new Option('--pdf', 'generate pdf instead of markdown'))
  .option('-v, --verbose', 'print verbose output');

program.parse();

const options = program.opts();
const { config: configFile } = options;

let config: Config;
if (configFile) {
  const validatedConfig = parseConfigJson(configFile);
  if (!validatedConfig) {
    console.error(`Could not parse config file at ${configFile}.`);
    process.exit(1);
  }
  config = validatedConfig;
} else {
  const { verbose, input, output, dev, pdf } = options;
  config = {
    inputFile: input,
    outputFile: output,
    includeDev: dev ?? false,
    fileFormat: pdf ? 'pdf' : 'markdown',
    verbose: verbose ?? false,
    language: 'en',
    deeplCacheFile: './.docdep-deepl-cache.json',
  };
}

let rawPackageJson: string;
try {
  rawPackageJson = fs.readFileSync(config.inputFile, 'utf8');
} catch (e) {
  console.error(`Could not read package.json at ${config.inputFile}.`);
  process.exit(1);
}
const packageJson = JSON.parse(rawPackageJson) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const dependencyCount =
  Object.keys(packageJson.dependencies ?? {}).length +
  (config.includeDev ? Object.keys(packageJson.devDependencies ?? {}).length : 0);
const printer = new Printer(dependencyCount, config.verbose);

(async () => {
  let dependencies: Dependency[] = await Promise.all(
    Object.entries(packageJson.dependencies || {}).map(async ([name, version]) => {
      const packageInfo = await fetchPackageJson(name, {
        version,
        fullMetadata: true,
      });

      const dependency: Dependency = {
        name,
        version,
        license: packageInfo.license ?? '⚠️ No license found',
        description: packageInfo.description?.length ? packageInfo.description : null,
        dev: false,
      };

      printer.addDependency(dependency);
      return dependency;
    })
  );

  if (config.includeDev) {
    const devDependencies: Dependency[] = await Promise.all(
      Object.entries(packageJson.devDependencies || {}).map(async ([name, version]) => {
        const packageInfo = await fetchPackageJson(name, {
          version,
          fullMetadata: true,
        });

        const dependency: Dependency = {
          name,
          version,
          license: packageInfo.license ?? '⚠️ No license found',
          description: packageInfo.description?.length ? packageInfo.description : null,
          dev: true,
        };

        printer.addDependency(dependency);
        return dependency;
      })
    );
    dependencies.push(...devDependencies);
  }

  printer.log('Pulled information for all dependencies', 'info');

  if (config.language !== 'en') {
    let globalTranslationCache: Record<string, Record<string, string>> = {};
    let translationCache: Record<string, string> = {};
    try {
      const rawCache = fs.readFileSync(config.deeplCacheFile, 'utf8');
      globalTranslationCache = JSON.parse(rawCache) as Record<string, Record<string, string>>;
      if (globalTranslationCache[config.language]) {
        translationCache = globalTranslationCache[config.language];
      }
    } catch (e) {
      // ignore
    }

    const translatables = dependencies
      .filter((d) => !Object.keys(translationCache).includes(d.name))
      .filter((d) => d.description !== null && d.description.length > 0);
    printer.log(
      `Using ${dependencies.length - translatables.length} cached translations, getting ${
        translatables.length
      } translations from DeepL`,
      'info'
    );
    const translator = new deepl.Translator(config.deeplApiKey ?? '');
    const translationResults =
      translatables.length > 0
        ? Object.fromEntries(
            (
              await translator.translateText(
                translatables.map((d) => d.description as string),
                'en',
                config.language
              )
            ).map((translation, idx) => [translatables[idx].name, translation.text])
          )
        : {};

    printer.log(JSON.stringify(translationResults), 'debug');

    // add missing translations from cache
    Object.entries(translationCache).forEach(([name, translation]) => {
      if (!translationResults[name]) {
        translationResults[name] = translation;
      }
    });

    // write cache
    globalTranslationCache[config.language] = translationResults;
    fs.writeFileSync(config.deeplCacheFile, JSON.stringify(globalTranslationCache));

    printer.log(JSON.stringify(translationResults), 'debug');

    dependencies = dependencies.map((d) => {
      if (d.description === null || d.description.length === 0) {
        return d;
      }
      return {
        ...d,
        description: translationResults[d.name],
      };
    });
  }

  dependencies = dependencies.map((d) => ({
    ...d,
    description: config.overrideDescriptions?.[d.name] ?? d.description?.replace(/\n/g, ' ') ?? null,
  }));

  i18next.init({
    lng: config.language,
    resources: {
      en: { translation: en },
      de: { translation: de },
    },
  });

  let output: Buffer;
  if (config.fileFormat === 'pdf') output = await generatePdf(dependencies, config, i18next);
  else output = await generateMarkdown(dependencies, config, i18next);

  try {
    fs.writeFileSync(config.outputFile, output);
    printer.log(`Wrote dependency documentation to ${config.outputFile}`, 'info');
  } catch (e) {
    printer.log(`Could not write dependency documentation to ${config.outputFile}: ${e.message}`, 'error');
    process.exit(1);
  }
})();
