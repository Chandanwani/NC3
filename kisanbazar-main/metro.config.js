const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude kisanbazaar and api folders from Metro bundler
config.resolver.blacklistRE = [
    /kisanbazaar\/.*/,
    /api\/.*/,
    /node_modules\/.*\/node_modules\/react-native\/.*/,
];

module.exports = config;
