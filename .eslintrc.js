module.exports = {
  'plugins': ['node'],
  'extends': ['eslint:recommended', 'plugin:node/recommended', 'google'],
  'env': {
    'es6': true,
  },
  'parserOptions': {
    'ecmaVersion': 2017,
    'sourceType': 'module',
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
    },
  },
  'rules': {
    'indent': ['error', 2],
    'object-curly-spacing': ['error', 'always'],
    'node/exports-style': ['error', 'module.exports'],
    'max-len': ['error', { 'code': 120 }],
    'no-invalid-this': 'off',
  },
};
