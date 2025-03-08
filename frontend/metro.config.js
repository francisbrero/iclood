// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any additional asset extensions here
config.resolver.assetExts.push('ttf');

module.exports = config; 