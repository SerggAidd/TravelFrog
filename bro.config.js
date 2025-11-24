const path = require('node:path');
const pkg = require('./package.json');

const getCleanName = (name) => name.replace(/^@[-\w]+\//, '');
const cleanName = getCleanName(pkg.name || 'budget-compass');
const version = pkg.version || '1.0.0';
const appRoute = `/${cleanName}`;
const baseUrl = '/static';
const publicPath = `${baseUrl}${appRoute}/${version}/`;

const config = {
  entryPoint: './src/index.tsx',
  pageTitle: 'Budget Compass',
  apiPath: './stubs/api',
  apps: {
    [appRoute]: {
      name: cleanName,
      version,
    },
  },
  config: {
    baseUrl,
    appName: 'Budget Compass',
  },
  navigations: {
    home: appRoute,
    results: `${appRoute}/results`,
    saved: `${appRoute}/saved`,
  },
  webpackConfig: {
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src'),
      },
    },
    output: {
      publicPath,
      filename: 'index.js',
    },
  },
};

module.exports = config;
module.exports.default = config;

