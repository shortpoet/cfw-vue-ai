/* eslint-env node */
/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.eslint.json',
      './api/tsconfig.json',
      './scripts/tsconfig.json',
      './types/tsconfig.json',
      './ui/tsconfig.json',
      './utils/tsconfig.json',
    ],
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/ban-ts-comment': ['error', { 'ts-ignore': 'allow' }],
    indent: ['error', 2, { SwitchCase: 1 }],
    'max-len': [
      'error',
      {
        code: 120,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      },
    ],
    'linebreak-style': 0,
    curly: ['error', 'all'],
    semi: ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 1 }],
    'no-trailing-spaces': 'error',
    // "comma-dangle": ["error", "always-multiline"],
    // "arrow-parens": [2, "as-needed", { requireForBlockBody: true }],
    // 'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'no-console': 'off',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    // "import/extensions": "off",
    // "no-promise-executor-return": "off",
    // "no-param-reassign": "off",
    // "no-continue": "off",
    // "no-restricted-syntax": "off",
    'no-unused-vars': ['error', { varsIgnorePattern: '^_' }],
    // quotes: ["error", "backtick"],
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
      rules: {
        'no-unused-vars': 'off', // off because it conflicts with '@typescript-eslint/no-unused-vars'
        'react/display-name': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
      },
    },
    {
      files: ['rollup.config.js', 'eslintrc.cjs', 'jest.config.js', 'prettier.config.mjs'],
      env: {
        node: true,
      },
    },
    {
      files: [
        '**/*.test.js',
        '**/*.test.jsx',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.js',
        '**/*.spec.jsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        'setupTests.js',
      ],
      env: {
        jest: true,
        node: true,
      },
      rules: {},
    },
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      plugins: ['@typescript-eslint/eslint-plugin', 'jest'],
      extends: [
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
      ],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
      },
    },
    // {
    //   files: './packages/data-provider/**/*.ts',
    //   overrides: [
    //     {
    //       files: '**/*.ts',
    //       parser: '@typescript-eslint/parser',
    //       parserOptions: {
    //         project: './packages/data-provider/tsconfig.json',
    //       },
    //     },
    //   ],
    // },
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx', '.vue'],
    },
    'import/resolver': {
      typescript: {
        project: [
          './tsconfig.eslint.json',
          './api/tsconfig.json',
          './scripts/tsconfig.json',
          './types/tsconfig.json',
          './ui/tsconfig.json',
          './utils/tsconfig.json',
        ],
      },
    },
  },
};
