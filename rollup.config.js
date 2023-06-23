import typescript from '@rollup/plugin-typescript';

const shebang = () => ({
  name: 'shebang',
  renderChunk(code) {
    return {
      code: `#!/usr/bin/env node\n${code}`,
      map: null,
    };
  },
});

export default {
  input: 'src/index.ts',
  output: {
    file: 'lib/bundle.cjs',
    format: 'cjs',
  },
  plugins: [typescript(), shebang()],
};
