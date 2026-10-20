module.exports = (api) => {
  const isJest = api.caller(
    (caller) => caller?.name === "metro" && caller?.bundler === "jest",
  );

  return {
    presets: [
      isJest ? "babel-preset-expo" : "module:@react-native/babel-preset",
    ],
  };
};
