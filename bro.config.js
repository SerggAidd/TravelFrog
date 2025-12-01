const pkg = require("./package");

module.exports = {
  apiPath: "stubs/api",
  webpackConfig: {
    output: {
      publicPath: `/static/${pkg.name}/${process.env.VERSION || pkg.version}/`,
    },
  },
  /* use https://admin.bro-js.ru/ to create config, navigations and features */
  navigations: {
    "budget-compass-mfe.main": "/budget-compass-mfe",
  },
  features: {
    "budget-compass-mfe": {
      // add your features here in the format [featureName]: { value: string }
    },
  },
  config: {
    "budget-compass-mfe.api": "/api",
  },
  // Укажите путь к кастомному HTML-шаблону для prom-режима или оставьте undefined
  htmlTemplatePath: undefined,
};
