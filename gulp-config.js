let path = require('path');
module.exports = {
    path: path.resolve(__dirname, 'demo'), // 项目目录
    webpackConfig: path.resolve(__dirname, 'webpack.production.js'), // 共用webpack配置
    browsers: ['> 1%', 'last 5 versions'],
    modules: ['js', 'less', 'img'], // 查找资源的目录相对于 src中的path地址
    src: {
        path: 'src', // 目录地址(与src同级
        js: 'js/entry', // 需要编译的js目录
        css: 'less/pages', // 需要编译的样式目录
        html: 'pages', // 需要编译的html目录
        packconf: 'packconf/config.js' // 项目独立webpack配置
    },    // 源码目录名
    dist: { // 产出配置
        path: 'dist', // 目录地址(与src同级
        // build: 'build', // htmljs和css目录
        // html: '.',
        img: 'img' // img目录
    }
};
