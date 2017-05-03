// 引入 gulp
// 俺就是任性就是不写注释
const gulp = require('gulp');
const _ = require('lodash');
const paths = require('path');
const glob = require('glob');
const connect = require('gulp-connect');

const webpackStream = require('webpack-stream');
const webpack = require('webpack');

// let md5File = require('md5-file');
const userConfig = require('./gulp-config'); // 配置
const fs = require('fs');

const { sep } = paths;


const { getPackPlugins, getPackPluginsBuild } = require(userConfig.webpackConfig);

// 配置目录
const web = ({ path, name, build = false }) => {
    console.log(`开始编项目${path}`);
    glob(`${path}/${userConfig.src.js}/*.*`, (er, files) => {
        const _entry = {};
        for (const item of files) {
            const _name = item.split(`${userConfig.src.js}/`)[1].split('.')[0];
            _entry[_name] = item;
        }

        // 判断使用配置数据
        let _webpackConfig = build ? getPackPluginsBuild({ path, entry: _entry }) : getPackPlugins({ path, entry: _entry });
        // 项目配置
        const ItemConfigName = `${path}/${userConfig.src.packconf}`;
        if (fs.existsSync(ItemConfigName)) {
            const ItemConfig = require(ItemConfigName);
            delete require.cache[require.resolve(ItemConfigName)];
            _webpackConfig = ItemConfig({
                data: _webpackConfig,
                build,
                path,
                userConfig,
                packPath: paths.resolve()
            });
        }

        // webpack(_webpackConfig);
        // appExpress.use(webpackDevMiddleware(webpack(_webpackConfig), {
        //     publicPath: '/'
        // }));

        gulp.src(path)
            .pipe(webpackStream(_webpackConfig, webpack))
            .pipe(gulp.dest(`${path}/../${userConfig.dist.path}${build ? '/min' : ''}`))
            .pipe(connect.reload());
    });
};
// 本地服务
gulp.task('connect', () => {
    connect.server({
        root: userConfig.path,
        livereload: true,
        middleware(connect, options, next) {
            return [
                function (req, res, next) {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                    return next();
                }
            ];
        }
    });
});

// 系统文件变化事件
const timeoutList = {}; // 防止多次保持按键和git更新时
const _change = ({ event, build = false }) => {
    let [_path, _name] = paths.resolve(event.path).split(sep + userConfig.src.path + sep);
    _path += sep + userConfig.src.path;

    clearTimeout(timeoutList[`${build}${_path}`]);
    timeoutList[`${build}${_path}`] = setTimeout(() => {
        _name = _name.split(sep);
        _name = _name[_name.length - 1];
        web({
            path: _path,
            name: _name,
            build
        });
    }, 500);
};
// 开始监听
gulp.task('go', ['connect'], () => {
    const _watch = gulp.watch(`${userConfig.path}/**/${userConfig.src.path}/**/*.*`);
    _watch.on('change', (event) => {
        _change({ event });
    });
});
// 开始监听（压缩
gulp.task('build', ['connect'], () => {
    const _watch = gulp.watch(`${userConfig.path}/**/${userConfig.src.path}/**/*.*`);

    _watch.on('change', (event) => {
        _change({ event, build: true });
    });
});

// 开始监听 (压缩和非压缩)
gulp.task('all', ['go','build']);

// 监听文件变化
gulp.task('default', ['go']);

