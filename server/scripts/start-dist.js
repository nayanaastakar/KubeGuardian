const path = require('path');
const tsConfigPaths = require('tsconfig-paths');

// Register TypeScript path aliases pointing to compiled dist directory
tsConfigPaths.register({
  baseUrl: path.resolve(__dirname, '..', 'dist'),
  paths: {
    '@/*': ['*']
  }
});

// Launch the compiled server
require('../dist/index.js');
