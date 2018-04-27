const chalk = require('chalk')
const webpack = require('webpack')
const { log } = require('../utils')
const WebpackDevServer = require('webpack-dev-server')
const openBrowser = require('../utils/openBrowser')
const getServerConfig = require('../config/webpack/server')
const getBuildConfig = require('../config/webpack/build')
const { config, protocol, getRealPath, useYarn } = require('../env')
const { choosePort, prepareUrls, createCompiler, prepareProxy } = require('../utils/WebpackDevServerUtils')

const runServer = opts => {
  const { publicPath, publicDir, proxyTable, buildServerPort, autoOpenBrowser, callback} = opts

  const SET_HOST = process.env.HOST || '0.0.0.0'
  const SET_PORT = parseInt(process.env.PORT, 10) || buildServerPort

  const buildConfig = getBuildConfig(opts)

  choosePort(SET_HOST, SET_PORT)
    .then(port => {
      if (!port) {
        log.yellow('We have not found a port!')
        return
      }
      const urls = prepareUrls(protocol, SET_HOST, port)
      const compiler = createCompiler(webpack, buildConfig, config.app.packageJson.name, urls, useYarn)

      compiler.plugin('done', stats => {
        callback && callback(stats)
      })

      if (publicPath !== '/') {
        const proxyKey = publicPath.substring(0, publicPath.length - 1)

        let rerite = {}
        rerite[`^${proxyKey}`] = ''

        let proxy = {}
        proxy['pathRewrite'] = rerite
        proxy['target'] = `${protocol}://localhost:${port}`
        proxyTable[proxyKey] = proxy
      }

      const proxyConfig = prepareProxy(proxyTable, getRealPath(publicDir))
      const devServer = new WebpackDevServer(compiler, getServerConfig(
        false,
        proxyConfig,
        urls.lanUrlForConfig,
        publicDir,
        publicPath
      ))

      devServer.listen(port, SET_HOST, err => {
        if (err) {
          return log.red(err)
        }
        log.cyan('Starting the production server...\n')
        autoOpenBrowser && openBrowser(urls.localUrlForBrowser + publicPath.substr(1))
      })

      ;['SIGINT', 'SIGTERM'].forEach(signal => {
        process.on(signal, () => {
          devServer.close(() => {
            process.exit(0)
          })
        })
      })
    })
    .catch(err => {
      if (err && err.message) {
        log.red(err.message)
      }
      process.exit(1)
    })
}

module.exports = runServer
