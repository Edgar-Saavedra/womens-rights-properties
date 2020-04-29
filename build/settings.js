// All the folders containing our icons
// const iconFolderPaths = [
//   {
//     name: 'global',
//     folderPath: '../src/icons/global'
//   },
//   {
//     name: 'consumer',
//     folderPath: '../src/icons/consumer'
//   },
//   {
//     name: 'education',
//     folderPath: '../src/icons/education'
//   },
//   {
//     name: 'kids-action',
//     folderPath: '../src/icons/kids-action'
//   },
//   {
//     name: 'privacy',
//     folderPath: '../src/icons/privacy'
//   }
// ];
const systemFolder = 'womens-rights-properties';

const ignore = [
  '.git',
  'node_modules',
  'build',
  'vendor',
  'js',
  'WomensRightsProperties.xlsx',
  'index.php',
  '~$WomensRightsProperties.xlsx',
  'package-lock.json',
  'yarn-error.log',
  'src',
  'composer.lock',
  'composer.json',
  'package.json',
  'webpack.config.js',
  'babelrc',
  '.stylelintignore',
  '.stylelintcache',
  'yarn.lock'
]

const domains = {
  live: 'womens-rights-properties',
  qa: 'womens-rights-properties',
  // CDN_QA: '',
  // CDN_LIVE: ''
}

const invalidation = {
  LIVE_ID: 'E17RC0IZJBNWI2',
  QA_ID: 'E17RC0IZJBNWI2',
  CALLER_REFERENCE: Date.now(),
  ITEMS: '/*',
}

module.exports = {
  ignore,
  domains,
  systemFolder,
  invalidation
  // iconFolderPaths
};
