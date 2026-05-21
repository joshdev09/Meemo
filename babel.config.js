module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel", // <-- Moved to presets!
    ],
    plugins: [
      "react-native-reanimated/plugin", // <-- Reanimated stays in plugins
    ],
  };
};