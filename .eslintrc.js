module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    indent: ["warn", 2],
    "mocha/no-exclusive-tests": "error",
  },
  plugins: ["mocha"],
  globals: {
    it: true,
    describe: true,
    afterEach: true,
  }
};
