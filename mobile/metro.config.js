const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add shared folder to watchFolders
config.watchFolders = [path.resolve(__dirname, '../shared')];

// Configure resolver to handle @shared alias
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@shared': path.resolve(__dirname, '../shared'),
  },
};

module.exports = config;
