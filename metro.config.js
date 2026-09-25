const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// `three` resolves to the deprecated CommonJS shim (`build/three.cjs`) for
// `require()` callers, which calls `process.emitWarning()` — not available in
// React Native — and crashes on startup. Always serve the ESM build instead.
const threeDir = path.dirname(require.resolve('three'));
const threeEsm = path.join(threeDir, 'three.module.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'three') {
    return { type: 'sourceFile', filePath: threeEsm };
  }
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.assetExts.push('glb', 'gltf', 'bin');

module.exports = config;
