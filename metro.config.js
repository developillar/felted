const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Ship compressed fonts on web while retaining the original native font files.
config.resolver.assetExts = [...new Set([...config.resolver.assetExts, "woff2"])];

module.exports = config;
