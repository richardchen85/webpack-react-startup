const fs = require('fs')
const path = require('path')
const config = require('./config')

module.exports = function (app) {
  Object.keys(config).forEach(key => {
    app.use(key, function (req, res) {
      const filename = path.join(__dirname, config[key].local)
      if (filename.match(/\.json$/)) {
        // json 文件直接读内容
        res.json(JSON.parse(fs.readFileSync(filename)))
      } else {
        // 每次删除缓存，就不重启dev-server
        delete require.cache[filename]
        require(filename)(req, res)
      }
    })
  })
}