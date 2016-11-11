// 引入 gulp
// 俺就是任性就是不写注释
let gulp = require('gulp')
let _ = require('lodash')
let paths = require('path')
let glob = require('glob')
let connect = require('gulp-connect')

let webpack = require('gulp-webpack')


let md5File = require('md5-file')

let fs = require('fs')

// 引入配置
let userConfig = require('./gulp-config')

// 配置目录
let web = ({path, name, build = false}) => {
    console.log(`开始编项目${path}`)
    glob(path + '/' + userConfig.src.js + '/*.*', function (er, files) {
        let _entry = {}
        for (let item of files) {
            let _name = item.split(userConfig.src.js + '/')[1].split('.')[0]
            _entry[_name] = item
        }
        
        // 获取共用配置
        let {getPackPlugins, getPackPluginsBuild} = require('./webpack.production')
        delete require.cache[require.resolve('./webpack.production')]
        // 判断使用配置数据
        let plugins = build ? getPackPluginsBuild({ path }) : getPackPlugins({ path })
        let _webpackConfig = _.assign(plugins , { entry: _entry })

        // 项目配置
        let ItemConfigName = `${path}/packconf/config.js`
        if(fs.existsSync(ItemConfigName)){
            let ItemConfig = require(ItemConfigName)
            delete require.cache[require.resolve(`${path}/packconf/config`)]
            _webpackConfig = ItemConfig({
                data:_webpackConfig,
                build,
                path
            })
        }

        gulp.src(path)
            .pipe(webpack(_webpackConfig))
            .pipe(gulp.dest(`${path}/../${userConfig.dist.path}/${userConfig.dist.build}`))
            .pipe(connect.reload())
    })
}

gulp.task('connect', () => {
    connect.server({
        root: userConfig.path,
        livereload: true
    })
})
let _change = ({event, build = false}) => {
    let [_path, _name] = paths.resolve(event.path).split('\\' + userConfig.src.path + '\\')
    _path += '/' + userConfig.src.path

    _name = _name.split('\\')
    _name = _name[_name.length - 1]
    web({
        path: _path,
        name: _name,
        build
    })
}

gulp.task('go', ['connect'], () => {
    let _watch = gulp.watch(`${userConfig.path}/**/${userConfig.src.path}/**/*.*`)

    _watch.on('change', (event) => {
        _change({ event })
    })
})

gulp.task('build', ['connect'], () => {
    let _watch = gulp.watch(`${userConfig.path}/**/${userConfig.src.path}/**/*.*`)

    _watch.on('change', (event) => {
        _change({ event, build: true })
    })
})



// 监听文件变化
gulp.task('default', ['connect', 'go'])

