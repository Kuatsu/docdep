# docdep

Generates a documentation file (Markdown or PDF) based on the dependencies of a project (`package.json`). It pulls relevant information from the NPM registry and optionally translates descriptions using DeepL.

## Install

Either install it globally:

```bash
npm install -g docdep
docdep -c ./docdep.config.json
```

... or install it locally and run it via `npx`:

```bash
npm install docdep
npx docdep -c ./docdep.config.json
```

## Example

The dependencies of `docdep` itself are documented using `docdep`! The example documentation can be found in [DEPENDENCIES.md](./DEPENDENCIES.md).

## Configuration

While some options can be set via command line arguments, most of the configuration can only be done via a configuration file, which is therefore favored. The configuration file is a JSON file with the following structure:

```jsonc
{
  "input": "./package.json", // Path to the input file (package.json)
  "output": "./DEPENDENCIES.md", // Path to the output file
  "overrideDescriptions": { "uuid": "Generates some juicy UUIDs" }, // Overrides the descriptions of the given packages, optional
  "includeDev": true, // Whether to include devDependencies, optional (default: false)
  "fileFormat": "markdown", // Output file format, optional (default: markdown)
  "language": "de", // Language for descriptions, optional (default: en)
  "deeplApiKey": "secret" // API key for DeepL, required if language is not "en"
}
```

### Supported Languages

While the given language code can be any language supported by DeepL and the dependencies' descriptions are translated accordingly, the titles and descriptions of the documentation itself only support the following languages:

- English (`en`)
- German (`de`)

If you want to add support for another language, feel free to open a pull request!

## Usage

If you're using a config file, you only need to provide the path to this file as an argument to the CLI:

```bash
docdep -c ./docdep.config.json
```

For all available command line arguments, see the help page:

```bash
docdep --help
```
