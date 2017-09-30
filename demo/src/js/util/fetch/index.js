
import Systemjs from 'systemjs';
import _ from 'lodash';
import createUrl from 'util/create-url-params';
import utilLog from 'util/log';

import errCode from './err-code';

if (!window.fetch) {
    Systemjs.import('fetch');
}

const scheme = window.location.protocol === 'file:' ? 'http:' : window.location.protocol;

// 转换变量
export function toFetch(params, pkey, objectList = {}) {
    _.forEach(params, (val, key) => {
        let _key = key;
        if (pkey) _key = `${pkey}[${key}]`;
        if (typeof val !== 'undefined' && (val.constructor === window.File || val.constructor === window.Blob || typeof val !== 'object')) {
            objectList[_key] = val;
        } else {
            toFetch(val, _key, objectList);
        }
    });
    return objectList;
}

// 判断参数类型是否含文件
const isBodyFile = (params) => {
    let result = false;
    const twoforEachObj = [];
    _.forEach(params, (val) => {
        if (typeof val !== 'undefined' && (val.constructor === window.File || val.constructor === window.Blob)) {
            result = true;
            return false;
        } else if (typeof val === 'object') {
            twoforEachObj.push(val);
        }
    });
    if (!result) {
        _.forEach(twoforEachObj, (val) => {
            result = isBodyFile(val);
            return !result;
        });
    }
    return result;
};

let i = 0;
const log = a => utilLog(a, 'fetch请求');
export async function fetchParam({ host, url, param, explain = '' }) {
    if (!window.fetch) {
        await Systemjs.import('fetch');
    }
    const { body } = param;
    if (param.method === 'POST') {
        let _form;
        if (isBodyFile(body)) {
            _form = new FormData();
            _.forEach(toFetch(body), (v, k) => {
                _form.append(k, v);
            });
        } else {
            param.headers = {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
            };
            _form = createUrl(body);
        }
        param.body = _form;
    } else {
        url = createUrl(body, url);
        delete param.body;
    }

    // param.timeout = param.timeout;

    let fetchApiUrl = '';
    if (host.match(/^((http(|s):\/\/)|(\/\/))/)) {
        fetchApiUrl = `${host}/${url}`;
    } else {
        fetchApiUrl = `${scheme}//${host}/${url}`;
    }

    const _i = i++;
    log([_i, '请求', explain, fetchApiUrl, param, ['请求参数:', body]]);
    const fetchPromise = (() => {
        let _resolve;
        let _reject;
        const _promise = new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });
        // 超时处理
        let timeoutId = 0;
        if (!(param.timeout === false)) {
            timeoutId = setTimeout(() => {
                log([_i, '超时', param.timeout, ['请求参数:', body]]);
                _resolve(errCode(-5));
            }, param.timeout);
        }
        const _fetch = window.fetch;
        _fetch(fetchApiUrl, param)
            .then((res) => {
                let _res = '';
                if (res.ok) {
                    try {
                        _res = res.json();
                    } catch (err) {
                        _res = res.text();
                    }
                }
                if (!_res) {
                    _res = Promise.resolve(errCode(res.status));
                }
                _resolve(_res);
            }).catch((e) => {
                log([_i, '错误', e.toString(), e, ['请求参数:', body]]);
                _resolve(errCode(-3));
            });
        _promise.then((res) => {
            clearTimeout(timeoutId);
            if (res.err_code != '-5') log([_i, '回调', res, ['请求参数:', body]]);
        });
        _promise.abort = function (msg) {
            log([_i, 'abort中断', msg, ['请求参数:', body]]);
            _reject(errCode(-6));
        };
        return _promise;
    })();

    return fetchPromise;
}
