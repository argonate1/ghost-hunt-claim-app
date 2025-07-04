const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Suppress warnings for crypto module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add warning suppression for crypto modules
config.resolver.alias = {
  ...config.resolver.alias,
  // Suppress warnings for @noble/hashes crypto.js
  '@noble/hashes/crypto': '@noble/hashes/crypto.js',
  // Suppress warnings for multiformats
  'multiformats/cjs/src/basics': 'multiformats/src/basics.js',
};

module.exports = config; 