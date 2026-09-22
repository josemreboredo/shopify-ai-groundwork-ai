import js from '@eslint/js';

export default [
  {
    ignores: ['**/node_modules/**', '**/build/**', '**/.vercel/**', 'clients/**', '.gaia/**'],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        fetch: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        AbortSignal: 'readonly',
        crypto: 'readonly',
        setInterval: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        // Frontend (browser)
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      // Gaia's own convention: default to no comments, only a "why" note when
      // one is warranted — nothing here should force a particular comment
      // style, only catch real mistakes (unused vars, undefined names).
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
    },
  },
];
