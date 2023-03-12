module.exports = {
    env: {
        es6: true,
        browser: true,
        node: true,
    },
    globals: {
        chrome: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:import/typescript', 'plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
        },
    },
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        'comma-dangle': ['error', 'only-multiline'],
        'no-multiple-empty-lines': 'error',
        'array-bracket-newline': ['error', 'consistent'],
        'no-eval': 'error',
        'no-multi-spaces': ['error'],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'always', prev: '*', next: 'function' },
        ],
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        'no-unused-vars': 'off',
        'array-bracket-spacing': ['error', 'never'],
        'computed-property-spacing': ['error', 'never'],
        '@typescript-eslint/no-unused-vars': 'error',
    },
}
