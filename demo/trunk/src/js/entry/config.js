/**
* systemjs加载配置
*/

import Systemjs from 'systemjs';
import cdnHost from 'config/cdn-host';

const { SystemJSConfigMain } = window;

const mapListObj = { // 自定义map和依赖关系,可覆盖cdn中的配置(注释的是例子
    map: {
        // 'ReactDom': 'host/js/react/15.4.0/react-dom.min.js',
    },
    meta: { // map的依赖关系
        // 'ReactDom': {
        //     deps: ['React']
        // }
    }
};


const mainListObj = { // 载入文件的配置
    '_main': { // 入口文件 签名
        ToLoad: true, // 是否马上加载
         // 依赖库
        deps: ['React', 'ReactRouter', 'mobx', 'mobxReact']
    }
};
for (const key in mainListObj) {
    const _key = key.slice(1);
    if (SystemJSConfigMain[_key]) {
        mainListObj[key].deps = mainListObj[key].deps.concat(SystemJSConfigMain[_key].css);
    }
}
Systemjs.import(`${cdnHost}/config/1.0.6/config.js`).then((res) => {
    // res中的map查看cdn目录下config.js文件
    Systemjs.config(res(cdnHost));
    Systemjs.config(mapListObj);
    Systemjs.config({
        meta: mainListObj
    });

    for (const key in mainListObj) {
        const item = mainListObj[key];
        if (item.ToLoad) {
            Systemjs.import(key);
        }
    }
});
