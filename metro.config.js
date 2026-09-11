const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest(context, moduleName, platform) {
      // RN 0.87: @react-native/virtualized-lists still deep-imports feature flags
      // via an unexported subpath. Resolve explicitly until upstream fixes land.
      if (
        moduleName ===
        'react-native/src/private/featureflags/ReactNativeFeatureFlags'
      ) {
        return {
          type: 'sourceFile',
          filePath: path.resolve(
            __dirname,
            'node_modules/react-native/src/private/featureflags/ReactNativeFeatureFlags.js',
          ),
        };
      }

      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
