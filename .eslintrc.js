module.exports = {
  "env": {
    "es6": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2016,
    "sourceType": "module"
  },
  "rules": {
    "indent": [2, 2, { "VariableDeclarator": 1, "SwitchCase": 1 }],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "no-console": "off",
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ]
  }
};
