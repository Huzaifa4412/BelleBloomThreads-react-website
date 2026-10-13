import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['archive/**', 'dist/**', 'node_modules/**', 'app.js', 'server.js'] },
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}', 'scripts/**/*.mjs', '*.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', parserOptions: { ecmaFeatures: { jsx: true } }, globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': hooks, 'react-refresh': refresh },
    rules: {
      ...hooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['error', { varsIgnorePattern: '^([A-Z]|motion$)', argsIgnorePattern: '^_' }],
    },
  },
];
