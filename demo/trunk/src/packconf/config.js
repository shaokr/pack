const _ = require('lodash');
const fs = require('fs');
const paths = require('path');

const itemWebConfig = {
    go: paths.resolve(__dirname, 'webpackConfig.js'),
    build: paths.resolve(__dirname, 'webpackConfig-build.js'),
};

const CopyWebpackPlugin = require('copy-webpack-plugin');
/**
 * 拷贝的目录
 */
function Copy(path, build) {
    const _data = [];
    const _pa = paths.resolve(path, `../dist${build ? '/min' : ''}/systemjs`);

    if (!fs.existsSync(_pa)) {
        _data.push({ context: 'node_modules/systemjs/dist', from: '*', to: 'systemjs' });
    }
    _data.push({ context: `${path}/js/lang/data`, from: '**', to: 'lang' });

    return new CopyWebpackPlugin(_data);
}
/**
 * 最后配置
 */
function Last({ data, build, path, userConfig, packPath }) {
    // 判断是否存在当前项目配置
    if (!build && fs.existsSync(itemWebConfig.go)) {
        return require(itemWebConfig.go);
    } else if (fs.existsSync(itemWebConfig.build)) {
        return require(itemWebConfig.build);
    }
    /**
     * 多项目情况-----------------------------------------
     * */
    // const entry = {};
    // _.forEach([
    //     'main',
    //     'config'
    // ], (item) => entry[item] = data.entry[item]);
    // data.entry = entry;

    // data.resolve.modules.push(...userConfig.modules)
    /**
     * ------------------------------------------------
     * */

    // data.externals[] = '';
    // 添加目录拷贝
    const _copyList = Copy(path, build);
    if (_copyList) {
        data.plugins.push(_copyList);
    }

    // data.output.library = '[name]'; // 输出到全局的名称
    // data.output.libraryTarget = 'umd'; // 输出方式
    return data;
}


module.exports = Last;
