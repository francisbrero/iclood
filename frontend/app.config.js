module.exports = {
  name: "iclood",
  slug: "iclood",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  splash: {
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.iclood.app"
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#ffffff"
    },
    package: "com.iclood.app"
  },
  web: {
  },
  sdkVersion: "52.0.0",
  // Enable New Architecture
  experiments: {
    tsconfigPaths: true
  },
  // This is required for the new architecture
  newArchEnabled: true
}; 