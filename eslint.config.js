module.exports = {
    env: {
            "browser": true,
            "es2021": true
        }
    ,
    extends: [
      // add more generic rule sets here, such as:
      // 'eslint:recommended',
      "plugin:svelte/recommended",
    ],
    parserOptions: {
        "sourceType": "module"
    },
    rules: {
      // override/add rules settings here, such as:
      // 'svelte/rule-name': 'error'
      "svelte/no-at-html-tags": "warn"
    },
}
