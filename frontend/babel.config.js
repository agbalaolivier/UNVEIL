module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Requis par Reanimated 4 : le plugin doit être en dernier
    plugins: ['react-native-worklets/plugin'],
  };
};
