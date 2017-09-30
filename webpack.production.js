
const webpack = require('webpack');

const _ = require('lodash');
const glob = require('glob');
const paths = require('path');
const fs = require('fs');
// const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const userConfig = require('./gulp-config');
const autoprefixer = require('autoprefixer')({ browsers: userConfig.browsers });

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const md5File = require('md5-file');
// const AppCachePlugin = require('appcache-webpack-plugin');
const {sep} = paths;
/**
 * 共用打包配置构造函数
 */
class WebpackGe {
    constructor({ path }) {
        
        const entryArr = glob.sync(`${path}/${userConfig.src.js}/**/*.js`);
        const _entry = {};
        for (const item of entryArr) {
            const _name = item.match(/entry[\/\\](.+).js/)[1];
            _entry[_name] = item;
        }

        this.entry = _entry;
        this.output = {
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
            'mobx-react-devtools': 'mobxDevtools',
            'mock': 'Mock',
            'fed-const': 'fedConst'
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
        // this.stats = 'normal';
    }
}


/**
 * 打包配置
 */
class Wkcf extends WebpackGe {
    constructor(props){
        super(props);
        const { path } = props;

        this.module = {
            rules: [
                {
                    test: /\.(js|jsx)$/i,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                // 'es2017',
                                ['env', {
                                    'targets': {
                                        ie: 10,
                                        'browsers': userConfig.browsers
                                    }
                                }],
                                'react',
                                'stage-0'
                            ],
                            plugins: [
                                'lodash',
                                'transform-decorators-legacy',
                                'transform-class-properties',
                                'transform-runtime',
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
                    test: /\.(jpe?g|png|gif|svg|ico)$/i,
                    use: [`url-loader?limit=1&name=${userConfig.dist.img}/[hash].[ext]`]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    use: [`url-loader?name=font/[hash].[ext]`]
                }
            ]
        };

        this.devtool = 'inline-source-map';

        _.assign(this.output,{
            filename: '[name].js',
            path: paths.resolve(path, '../dist')
        });

        this.plugins = [
            ...this.plugins,
            // new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                __DEV__: true,
                __PRE__: false,
                __BUILD_EXT__: '""'
            }),
            new ExtractTextPlugin('[name].css'),
            ...generateHtml(path, {
                configJs: './config.js',
                minName: ''
            })
        ]
    }
}

class WkcfBuild extends WebpackGe{
    constructor(props){
        super(props);

        const { path } = props;
        this.module = {
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
                            {
                                loader: 'css-loader',
                                options:{
                                    minimize: true //css压缩
                                }
                            },
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
                    test: /\.(jpe?g|png|gif|svg|ico)$/i,
                    use: [
                        `url-loader?limit=10000&name=${userConfig.dist.img}/[hash].[ext]`,
                        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=true'
                    ]
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    use: [`url-loader?limit=500000&name=font/[hash].[ext]`]
                }
            ]
        }

        _.assign(this.output,{
            filename: '[name].min.js',
            path: paths.resolve(path, '../dist/min')
        });

        this.plugins = [
            ...this.plugins,

            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),

            new webpack.DefinePlugin({
                __DEV__: false,
                __PRE__: true,
                __BUILD_EXT__: '".min"'
            }),

            new webpack.optimize.UglifyJsPlugin({
                mangle: {
                    except: ['jQuery']
                }
            }),

            new webpack.optimize.DedupePlugin(),
            // new webpack.optimize.OccurenceOrderPlugin(),
            new ExtractTextPlugin('[name].min.css'),
            ...generateHtml(path, {
                configJs: './config.min.js',
                minName: '.min'
            },true)
        ]
    }
}
/**
 * 生成html
 */
const oldHtmlMd5 = {};
const generateHtml = (path, data={}, build) => {
    let lists = glob.sync(`${path}/${userConfig.src.js}/**/*.html`);
    if(build){
        if(!lists.length){
            lists = glob.sync(`${path}/${userConfig.src.html}/**/*.html`);
        }
    } else {
        lists = _.concat([], glob.sync(`${path}/${userConfig.src.html}/**/*.html`), lists)
    }

    return lists.map((item) => {
        const itemData = paths.resolve(item);
        const jsPath = paths.resolve(path, userConfig.src.js);
        let name = itemData.split(jsPath)[1];
        if(!name){
            const htmlPath = paths.resolve(path, userConfig.src.html);
            name = itemData.split(htmlPath)[1];
        }

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
                // excludeChunks: ['config'],
                
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

function function_name(env) {
    let { path = '', dev = false } = env;
    if (path){
        if (!path.match(/src[\/\\]?$/)) {
            path = glob.sync(`${path}/**{!node_modules,/${userConfig.src.path}}`)[0];
        }

        if (path) {
            const data = {
                path
            }
            let ThisWebpack;
            if(dev){
                ThisWebpack = Wkcf;
            } else {
                ThisWebpack = WkcfBuild;
            }
            let _webpackConfig;
            _.forEach(userConfig.src.packconf, (item) => {
                const ItemConfigName = `${path}/${item}`;
                if (fs.existsSync(ItemConfigName)) {
                    const ItemConfig = require(ItemConfigName);
                    delete require.cache[require.resolve(ItemConfigName)];
                    _webpackConfig = ItemConfig({
                        data: new ThisWebpack(data),
                        build: true,
                        path: data.path,
                        userConfig,
                        packPath: paths.resolve()
                    });
                    return false;
                }
            });

            return _webpackConfig || new ThisWebpack(data);
        }
    }
    console.log('编译地址错误');
}
/**
 * 查询打包配置
 */
function_name.getPackPlugins = (data) => new Wkcf(data);
/**
 * 查询build配置
 */
function_name.getPackPluginsBuild = (data) => new WkcfBuild(data);
module.exports = function_name;
