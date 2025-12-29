const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.projectRoot = __dirname;

config.resolver.sourceExts = ['jsx', 'js', 'json', 'ts', 'tsx'];

module.exports = config;
