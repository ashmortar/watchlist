/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
 module.exports = {

  extends: [
    `@eyecuelab/react`,
    // "@remix-run/eslint-config",
    // "@remix-run/eslint-config/node",
    // "@remix-run/eslint-config/jest",
    // "prettier",
  ],
  // we're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but it we have to explicitly
  // set the jest version.
  settings: {
    jest: {
      version: 27,
    },
  },
  rules: {
    quotes: `off`,
    "@typescript-eslint/quotes": [
        `error`,
        `backtick`
      ],
  },
  parserOptions: {
    project: [`./tsconfig.json`, `./cypress/tsconfig.json`],
  },
}
