const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const argv = require('minimist')(process.argv.slice(0))
const mockServer = require('./mock/server')
const proxyConfig = require('./mock/config.js')

const production = argv.mode === 'production'
const proxy = argv.env === 'proxy'

// 联调时，数据从代理远端接口来
let proxyTable = {};
Object.keys(proxyConfig).forEach((key) => {
  proxyTable[proxyConfig[key].remote] = {
    // 远端服务器域名
    target: 'http://xxx.com',
    changeOrigin: true,
    headers: {
      // 防 referrer 检查
      referrer: 'http://xxx.com'
    }
  }
});

module.exports = {
  // 让 webpack 知道以哪个模块为入口，做依赖收集
  // 具体参考 https://webpack.js.org/concepts/#entry
  entry: {
    index: './src/pages/index.js',
    //about: './src/pages/about.js'
  },
  // 告诉 webpack 打包好的文件存放在哪里，以及怎么命名
  // 具体参考 https://webpack.js.org/concepts/#output
  output: {
    path: path.join(__dirname, '/dist'),
    filename: production ? 'js/[name].[chunkhash:8].js' : 'js/[name].js',
    publicPath: production ? '//static.360buyimg.com/' : '/'
  },
  resolve: {
    extensions: ['.js', '.jsx', '.mjs', '.ts', '.tsx'],
    alias: {
      // 别名方便引入资源，如：background: url('@/static/img/logo.svg')
      '@': path.resolve(__dirname, 'src'),
    }
  },
  plugins: [
    // 这里我们通常想要指定自己的 html 文件模板，也可以指定生成的 html 的文件名
    // 如果不传参数，会有一个默认的模板文件
    // 具体参考 https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      template: './src/pages/index.html',
      chunks: ['commons', 'index']
    }),
    new HtmlWebpackPlugin({
      template: './src/pages/about.html',
      filename: 'about.html',
      chunks: ['commons', 'about']
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: production ? 'css/[name].[hash:8].css' : '[name].css',
      chunkFilename: production ? 'css/[id].[hash:8].css' : '[id].css',
    })
  ],
  module: {
    rules: [
      // 内置 eslint
      {
        enforce: "pre", // 强制在 babel 之前执行
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            useEslintrc: false,
            ignore: false,
            eslintPath: require.resolve('eslint'),
            resolvePluginsRelativeTo: __dirname,
            baseConfig: {
              // 同时需要安装：
              // babel-eslint eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react
              // @typescript-eslint/eslint-plugin @typescript-eslint/parser
              extends: [require.resolve('eslint-config-react-app')]
            }
          }
        }
      },
      // 使用 babel-loader 编译 es6/7/8、ts 和 jsx 语法
      // 注意：这里没有配置 preset，而是在 babel.config.js 文件里面配置
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /.(png|jpg|svg)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: production ? 'img/[name].[hash:8].[ext]' : 'img/[name].[ext]'
          }
        }
      },
      {
        test: /.css$/,
        use: [
          production ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: production,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            comparisons: false,
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            ascii_only: true,
          },
        },
        parallel: true,
        cache: true,
        sourceMap: true,
      }),
      new OptimizeCSSAssetsPlugin({})
    ],
    // 具体参考：https://webpack.js.org/plugins/split-chunks-plugin/
    splitChunks: {
      cacheGroups: {
        // 创建一个 commons 块，用于包含所有入口模块共用的代码
        commons: {
          name: "commons",
          chunks: "initial",
          minChunks: 2
        }
      }
    }
  },
  // 具体参考：https://webpack.js.org/configuration/dev-server/
  devServer: {
    // 代理模式
    proxy: proxy ? proxyTable : {},
    after: (app) => {
      // 不在代理模式时才开启本地数据模拟
      !proxy && mockServer(app)
    }
  }
}
