
const webpack = require('webpack');

const _ = require('lodash');
const glob = require('glob');
const paths = require('path');

const userConfig = require('./gulp-config');
const autoprefixer = require('autoprefixer')({ browsers: userConfig.browsers });

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const md5File = require('md5-file');

/**
 * 共用打包配置构造函数
 */
class WebpackGe {
    constructor({ path }) {
        this.entry = {};
        this.output = {
            filename: '[name].js',
            // path: `${__dirname}/${userConfig.dist.build}`
            publicPath: './'
        };
        this.externals = {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react-router': 'ReactRouter',
            zepto: '$',
            jquery: '$',
            systemjs: 'SystemJS',
            antd: 'antd',
            mobx: 'mobx',
            'mobx-react': 'mobxReact',
            'mobx-react-devtools': 'mobxDevtools'
        };
        this.resolve = {
            modules: [
                paths.resolve(__dirname, 'node_modules'),
                path,
                ..._.map(userConfig.modules, item => paths.join(path, item))
            ]
        };
        this.plugins = [
            new webpack.DefinePlugin({
                __BUILD_PATH__: '"./"'
            })
            // require('precss'),
            // autoprefixer({ browsers: ['> 1%', 'last 5 versions'] })
        ];
    }
}
/**
 * 打包配置
 */
const wkcf = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/i,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            'es2015',
                            'stage-0',
                            'react'
                        ],
                        plugins: [
                            // 'react-hot-loader/babel',
                            'transform-runtime',
                            'transform-es2015-typeof-symbol',
                            'transform-decorators-legacy',
                            'lodash'
                        ]
                    }
                }
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader?sourceMap',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    autoprefixer
                                ]
                            }
                        },
                        'less-loader?sourceMap'
                    ],
                    allChunks: true
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [`url-loader?limit=10000&name=${userConfig.dist.img}/[hash].[ext]`]
            }
        ]
    },
    devtool: 'inline-source-map',
    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            __DEV__: true,
            __PRE__: false,
            __BUILD_EXT__: '""'
        }),
        new ExtractTextPlugin('[name].css')

    ]
};

/**
 * build打包配置
 */
const wkcfBuild = {
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/i,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            'es2015',
                            'stage-0',
                            'react'
                        ],
                        plugins: [
                            // "react-hot-loader/babel",
                            'transform-runtime',
                            'transform-es2015-typeof-symbol',
                            'transform-decorators-legacy',
                            'lodash'
                        ]
                    }
                }
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: [
                                    autoprefixer
                                ]
                            }
                        },
                        'less-loader'
                    ],
                    allChunks: true
                })
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    `url-loader?limit=10000&name=${userConfig.dist.img}/[hash].[ext]`,
                    'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=true'
                ]
            }
        ]
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new webpack.DefinePlugin({
            __DEV__: false,
            __PRE__: true,
            __BUILD_EXT__: '".min"'
        }),
        new webpack.optimize.DedupePlugin(),
        // new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            mangle: {
                except: ['jQuery']
            }
        }),
        new ExtractTextPlugin('[name].min.css')
    ]
};
/**
 * 生成html
 */
const oldHtmlMd5 = {};
const generateHtml = (path, data={}) => {
    let lists = glob.sync(`${path }/${userConfig.src.html }/*.html`);
    // 过滤掉没有改变的html
    lists = _.filter(lists, (item) => {
        const htmlMd5 = md5File(item);
        if (oldHtmlMd5[item] != htmlMd5) {
            oldHtmlMd5[item] = htmlMd5;
            return true;
        }
    });

    return lists.map((item) => {
        const name = item.split(userConfig.src.html)[1];
        return new HtmlWebpackPlugin(
            _.assign({
                // 根据模板插入css/js等生成最终HTML
                filename: `.${name}`,    // 生成的html存放路径，相对于 path
                template: item,    // html模板路径
                inject: false,    // 允许插件修改哪些内容，包括head与body
                hash: false,    // 为静态资源生成hash值
                minify: {    // 压缩HTML文件
                    removeComments: true,    // 移除HTML中的注释
                    collapseWhitespace: false    // 删除空白符与换行符
                },
                excludeChunks: ['config'],
                
            }, data));
    });
};
/**
 * 递归整合对象
 */
const assignRecursion = (object, ...sources) => {
    for (const item of sources) {
        _.assignWith(object, item, (a, b) => {
            if (typeof b !== 'object') {
                return b;
            }
            return assignRecursion(a, b);
        });
    }
    return object;
};
/**
 * 查询打包配置
 */
const getPackPlugins = ({ path, entry }) => {
    let _webpack = new WebpackGe({ path });
    _webpack = assignRecursion(_webpack, wkcf, {
        entry,
        // entry: _.mapValues(entry, item => [
        //     item
        //         // 'webpack-hot-middleware/client?reload=true'
        // ]),
        output: {
            path: paths.resolve(path, '../dist')
        },
        plugins: [
            ...wkcf.plugins,
            ...generateHtml(path, {
                configJs: './config.js',
                minName: ''
            })
        ]

    });
    return _webpack;
};
/**
 * 查询build配置
 */
const getPackPluginsBuild = ({ path, entry }) => {
    let _webpack = new WebpackGe({ path });
    _webpack = assignRecursion(_webpack, wkcfBuild, {
        entry,
        output: {
            filename: '[name].min.js'
        },
        plugins: [
            ...wkcfBuild.plugins,
            ...generateHtml(path, {
                configJs: './config.min.js',
                minName: '.min'
            })
        ]
    });
    return _webpack;
};
module.exports = {
    getPackPlugins,
    getPackPluginsBuild
};
 