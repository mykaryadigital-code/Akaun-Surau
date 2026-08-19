import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '*.config.js']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
