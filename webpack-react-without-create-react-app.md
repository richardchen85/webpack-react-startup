# 不用create-react-app搭建基于webpack的react项目

`create-react-app` 是由 `facebook` 官方出品的用于搭建 `react app` 项目的脚手架工具，非常强大且简单易用，无需配置就能搭建一个 `react app`。但也正是由于很多东西它都已经封装好了，而且配置文件还内置在了包里，在项目中不可见，对于很多新手而言，要理解这一套东西还是比较困难。

本人正好看了一些相关资料，这里做为笔记记录一下如何从零开始用 `webpack` 搭建一个 `react` 的项目。我默认你已经在电脑上装好了 `nodejs`，并且有基本的命令行相关知识。

> 本文的示例代码可以在 https://github.com/richard-chen-1985/webpack-react-startup 中找到

## 创建项目目录

比如我要搭建一个项目，名字叫 `webpack-react-startup`

```bash
// 创建项目目录
mkdir webpack-react-startup
cd webpack-react-startup
// npm 初始化，全用默认选项
npm init -y
```

现在的项目目录结构变成了这样

```
webpack-react-startup
└ package.json
```

## 安装依赖包

### 安装 react

作为一个 `react` 项目，最起码要依赖两个包：`react` 和 `react-dom`。 `react` 从 0.14 版本开始，将 `react-dom` 拆分出 `react` 包，所以现在需要单独安装

```bash
npm i --save react react-dom
```

### 安装 `webpack`

```bash
npm i --save-dev webpack webpack-cli webpack-dev-server
```

这里 `webpack-cli` 作为一个命令行工具，接收一些参数并用于 `webpack` 的编译器，`webpack-dev-server` 是一个基于 `express` 的开发服务器，还提供了 `live reloading` 的功能，在开发的时候使用它还是很方便的，它还有两个 `hook api` 以方便我们扩展自己想要的功能，这个后面会讲到。

### 安装编译插件

通常我们在写 `react` 应用的时候，都会用到 `es6/7/8` 和 `jsx` 的一些语法，所以我们需要安装能够编译这些语法的插件

```bash
npm i --save-dev babel-core babel-loader babel-preset-env babel-preset-react html-webpack-plugin
```

`babel-x` 插件是为了让 `webpack` 能够使用 `babel` 编译 `es6/7/8` 和 `jsx` 的语法，而 `html-webpack-plugin` 会生成一个 `html` 文件，它的内容自动引入了 `webpack` 产出的 `bundle` 文件。

依赖安装完过后，我们的项目目录下会多一个 `node_modules` 的文件夹，用于存放安装好的依赖包文件。

## 配置 webpack

### webpack.config.js

`webpakc` 的配置文件名叫 `webpack.config.js`，这个文件需要返回包含 `webpack` 配置项的对象。`webpack` 配置项中最常用到的是 `entry`、`output` 和 `rules`。

```js
// webpack.config.js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  // 让 webpack 知道以哪个模块为入口，做依赖收集
  // 具体参考 https://webpack.js.org/concepts/#entry
  entry: './src/index.js',
  // 告诉 webpack 打包好的文件存放在哪里，以及怎么命名
  // 具体参考 https://webpack.js.org/concepts/#output
  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'bundle.js'
  },
  module: {
    // 使用 babel-loader 编译 es6/7/8 和 jsx 语法
    // 注意：这里没有配置 preset，而是在 .babelrc 文件里面配置
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
    // 这里我们通常想要指定自己的 html 文件模板，也可以指定生成的 html 的文件名
    // 如果不传参数，会有一个默认的模板文件
    // 具体参考 https://github.com/jantimon/html-webpack-plugin
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
}
```

### babel preset

```
// .babelrc
{
  "presets": ["env", "react"]
}
```

好了，是时候开始写点 `react` 代码了。到了这一步，我们的项目目录现在是这样：

```
webpack-react-startup
├ src
│ ├ index.html
│ ├ App.js
│ └ index.js
├ .babelrc
├ package-lock.json
└ package.json
```

在命令行输入 `webpack-dev-server --mode development --open --hot`，该命令会自动打开浏览器预览结果，并开启了热更新，如果代码有修改，会立即反映到浏览器展现上。

开发完打包上线可以使用命令 `webpack --mode production`。

命令有点长，可以把它放在 `package.json` 的 `scripts` 块中，这样，我们可以直接运行命令 `npm start` 和 `npm run build` 来执行：

```json
// package.json
{
  "scripts": {
    "start": "webpack-dev-server --mode development --open --hot",
    "build": "webpack --mode production"
  }
}
```

## 配置 devServer

在前文提到的 `webpack-dev-server` 为我们提供了很多 `api` 可以做定制化的需求（可以参考文档：https://webpack.js.org/configuration/dev-server/ ），比如本地模拟异步请求数据。

一个项目往往有很多数据需要通过请求异步接口拿到，在项目开始的时候，后端还没有为我们提供这些接口，这时候我们不得不自己造一些假的接口用于调度我们的代码，这时候我们可以使用 `devServer` 的 `after` 选项来为 `devServer` 添加自己的异步接口。

首先，我们需要在项目里新建一个 `mock` 文件夹用于存放本地模拟数据相关的代码：

```
webpack-react-startup
├ mock
│ ├ server.js // express 中间件文件，为 devServer 添加接口路由及处理程序
│ ├ config.js // 路由配置项，接口 URL 地址和本地数据文件的映射
│ └ index.json // 一个接口模拟数据文件

```

在 `webpack.config.js` 中配置 `devServer` 选项

```js
const mockServer = require('./mock/server')
module.exports = {
  devServer: {
    after: (app) => {
      mockServer(app)
    }
  }
}
```

模拟数据相关的代码：

```js
// mock/config.js
module.exports = {
  '/api/index': {
    local: '/index.json'
  }
}

// mock/server.js
const fs = require('fs')
const path = require('path')
const config = require('./config')

module.exports = function (app) {
  Object.keys(config).forEach(key => {
    app.use(key, function (req, res) {
      const filename = path.join(__dirname, config[key].local)
      if (filename.match(/\.json$/)) {
        // json 文件直接读取内容返回
        res.json(JSON.parse(fs.readFileSync(filename)))
      } else {
        // js 文件被当作中间件引入
        // 引入前删除掉该文件的缓存，如果文件内容修改，不用重启 devServer
        delete require.cache[filename]
        require(filename)(req, res)
      }
    })
  })
}

// index.json
{
  "success": true,
  "data": {
    "key": "value"
  }
}
```

除了可以自己模拟接口外，`devServer` 还提供了 `proxy` 可以代理远端的接口，这个适合于后端已经准备好接口，需要进行前后端联调的时候，从本地请求远端的接口。

## 多页应用配置

如果我们的应用不止一个页面，我们需要对上面的配置进行改造，主要包括 `entry`、`output` 和 `HtmlWebpackPlugin` 等几项。比如我们增加一个 `about` 页面。

### 修改目录结构

首先来调整一下目录结构，这样看起来更清晰易懂一点：

```
webpack-react-startup
├ src
| ├ components // 放置 react 组件
│ │ ├ App.js
│ │ └ About.js
| └ pages // 放置各页面及入口模块
│   ├ about.html
│   ├ about.js
│   ├ index.html
│   └ index.js
├ .babelrc
├ package-lock.json
└ package.json
```

### 修改webpack.config.js

```js
// webpack.config.js

module.exports = {
  // 这里 entry 是一个对象，每个页面和它的入口模块是一个 key/value 对
  entry: {
    index: './src/pages/index.js',
    about: './src/pages/about.js'
  },
  output: {
    // 这里 filename 有所改变，[name] 表示 entry 里面的 key
    // 表示每个页面的 bundle 文件以自己的名称命名
    filename: '[name].js'
  },
  plugins: [
    // index 页面
    new HtmlWebpackPlugin({
      template: './src/pages/index.html',
      // 要注入的 entry 模块，如果不指定，会把所有 entry 模块都注入
      chunks: ['index']
    }),
    // about 页面
    new HtmlWebpackPlugin({
      template: './src/pages/about.html',
      // about 页面的 html 文件名
      filename: 'about.html',
      chunks: ['about']
    })
  ]
}
```

### 公共模块抽离

使用上面的配置，执行 `npm run build` 命令后，我们会在 `dist` 目录找到打包后的结果。但我们发现，`about.js` 和 `index.js` 这两个文件都很大，因为他们各自都包含了 `react` 库相关的代码。这里通常的做法是，将公共模块单独打包到一个文件，在页面中分别引用，这里我们要用到 `webpack` 的另一个插件 `SplitChunksPlugin`。

> 注：在 `webpack` 4.0 以前是用的 `CommonsChunkPlugin`，4.0过后改用了新的 `SplitChunksPlugin`，具体参考：https://webpack.js.org/plugins/split-chunks-plugin/

这是一个内置插件，我们只需要在 `webpack.config.js` 文件中写相应的配置就可以了：

```js
module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/pages/index.html',
      // 注入公共模块 commons
      chunks: ['commons', 'index']
    }),
    new HtmlWebpackPlugin({
      template: './src/pages/about.html',
      filename: 'about.html',
      // 注入公共模块 commons
      chunks: ['commons', 'about']
    })
  ],
  optimization: {
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
  }
}
```

以上就是关于如何用 `webpack` 搭建一个 `react` 应用的方法，现在就可以开心地写 `react` 代码了。

## 参考资料

* https://www.youtube.com/watch?v=deyxI-6C2u4
* https://webpack.js.org/concepts/