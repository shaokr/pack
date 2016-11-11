
let _ = require('lodash')
let glob = require('glob')
// let paths = require('path')
let webpack = require('webpack')
let userConfig = require('./gulp-config')
let autoprefixer = require('autoprefixer')

let ExtractTextPlugin = require('extract-text-webpack-plugin')
let HtmlWebpackPlugin = require('html-webpack-plugin')

let cssExtractor = new ExtractTextPlugin('[name].css')

// var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
// var ImageminPlugin = require('imagemin-webpack-plugin').default

/**
 * 共用打包配置构造函数
 */
class WebpackGe {
    constructor () {
        this.entry = {}
        this.output = {
            filename: '[name].js',
            publicPath: './'
        }
        this.externals = {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'react-router': 'ReactRouter',
            'zepto': '$',
            'jquery': '$',
            'systemjs': 'SystemJS',
            'kook-ui': 'kookUi',
        }
        this.resolve = {
            modulesDirectories: [
                'js', 'node_modules', 'src', 'less'
            ]
        }
        this.postcss = [autoprefixer({ browsers: ['> 1%', 'last 5 versions'] })]
    }

}
/**
 * 打包配置
 */
let wkcf = {
    module: {
        loaders: [
            {
                test: /[\.js|\.jsx]$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: [
                        'es2015',
                        'react',
                        'stage-0'
                        // 'stage-2',
                    ],
                    plugins: ['transform-runtime', 'transform-es2015-typeof-symbol', 'transform-decorators-legacy']
                }

            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loaders: [
                    'style',
                    'css?sourceMap!less?sourceMap!postcss'
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    `url?limit=10000&name=${userConfig.dist.img}/[name].[ext]`
                ]
            }
        ]
    },
    devtool: 'inline-source-map',
    plugins: [

    ]
}

/**
 * build打包配置
 */
let wkcfBuild = {
    module: {
        loaders: [
            {
                test: /[\.js|\.jsx]$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: [
                        'es2015',
                        'react',
                        'stage-0'
                        // 'stage-2',
                    ],
                    plugins: ['transform-runtime', 'transform-es2015-typeof-symbol', 'transform-decorators-legacy']
                }
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: cssExtractor.extract(
                    'style',
                    'css!less!postcss'
                )
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    `url?limit=10000&name=${userConfig.dist.img}/[name].[ext]`,
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=true'
                ]
            }
        ]
    },
    plugins: [

    ]
}
/**
 * 生成html
 */
let generateHtml = (path) => {
    let lists = glob.sync(path + '/' + userConfig.src.html + '/*.html')
    return lists.map((item) => {
        let name = item.split(userConfig.src.html)[1]
        return new HtmlWebpackPlugin({                        // 根据模板插入css/js等生成最终HTML
            filename: userConfig.dist.html + name,    // 生成的html存放路径，相对于 path
            template: item,    // html模板路径
            inject: false,    // 允许插件修改哪些内容，包括head与body
            hash: false,    // 为静态资源生成hash值
            minify: {    // 压缩HTML文件
                removeComments: true,    // 移除HTML中的注释
                collapseWhitespace: false    // 删除空白符与换行符
            },
            excludeChunks: ['config']
        })
    })
}
/**
 * 递归整合对象
 */
let assignRecursion = (object, ...sources) => {
    for (let item of sources) {
        _.assignWith(object, item, (a, b) => {
            if (typeof b !== 'object') {
                return b
            } else {
                return assignRecursion(a, b)
            }
        })
    }
    return object
}
/**
 * 查询打包配置
 */
let getPackPlugins = ({path}) => {
    let _webpack = {}
    _webpack = assignRecursion(new WebpackGe(), wkcf, {
        plugins: [
            // cssExtractor,
            new webpack.DefinePlugin({
                __DEV__: true,
                __PRE__: false
            }),
            ...generateHtml(path)
        ]

    })
    return _webpack
}
/**
 * 查询build配置
 */
let getPackPluginsBuild = ({path}) => {
    let _webpack = {}
    _webpack = assignRecursion(new WebpackGe(), wkcfBuild, {
        plugins: [
            cssExtractor,
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.UglifyJsPlugin({
                mangle: {
                    except: ['jQuery']
                }
            }),
            new webpack.DefinePlugin({
                __DEV__: false,
                __PRE__: true
            }),
            ...generateHtml(path)
        ]
    })
    return _webpack
}
module.exports = {
    getPackPlugins,
    getPackPluginsBuild
}
