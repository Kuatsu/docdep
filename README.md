# docdep

Generates a documentation file (Markdown or PDF) based on the dependencies of a project (`package.json`). It pulls relevant information from the NPM registry and optionally translates descriptions using DeepL.

## Install

```bash
npm install -g docdep
```

## Example

An example output document can be found in [DEPENDENCIES.md](./DEPENDENCIES.md).

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

## Usage

If you're using a config file, you only need to provide the path to this file as an argument to the CLI:

```bash
docdep -c ./docdep.config.json
```

For all available command line arguments, see the help page:

```bash
docdep --help
```
