module.exports = {
    env: {
            "browser": true,
            "es2020": true
        }
    ,
    extends: [
      // add more generic rule sets here, such as:
      // 'eslint:recommended',
      "plugin:svelte/recommended",
    ],
    parserOptions: {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    rules: {
      // override/add rules settings here, such as:
      // 'svelte/rule-name': 'error'
    },
  }
