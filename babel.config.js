module.exports = function(api) {
  api.cache(true);

  // 具体参考：https://babeljs.io/docs/en/presets
  const presets = ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'];

  // 具体参考：https://babeljs.io/docs/en/plugins
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
  ];

  return {
    presets,
    plugins,
  };
};
