
import Systemjs from 'systemjs';
import _ from 'lodash';
import createUrl from 'util/create-url-params';
import utilLog from 'util/log';

import errCode from './err-code';

if (!window.fetch) {
    Systemjs.import('fetch');
}

const scheme = window.location.protocol === 'file:' ? 'http:' : '';

export function toFetch(params, pkey, objectList = {}) {
    _.forEach(params, (val, key) => {
        let _key = key;
        if (pkey) _key = `${pkey}[${key}]`;
        if (val && (val.toString() === '[object File]' || val.toString() === '[object Blob]' || typeof val !== 'object')) {
            objectList[_key] = val;
        } else {
            toFetch(val, _key, objectList);
        }
    });
    return objectList;
}

let i = 0;
const log = a => utilLog(a, 'fetch请求');
export async function fetchParam({ host, url, param }) {
    if (!window.fetch) {
        await Systemjs.import('fetch');
    }
    const { body } = param;

    if (param.method === 'POST') {
        const _form = new FormData();
        _.forEach(toFetch(body), (v, k) => {
            _form.append(k, v);
        });
        param.body = _form;
    } else {
        url = createUrl(body, url);
        delete param.body;
    }
    param.timeout = param.timeout || 30000;

    let fetchApiUrl = '';
    if (host.match(/^((http(|s):\/\/)|(\/\/))/)) {
        fetchApiUrl = `${host}/${url}`;
    } else {
        fetchApiUrl = `${scheme}//${host}/${url}`;
    }
    const _i = i++;
    log([_i, '请求', fetchApiUrl, param, ['请求参数:', body]]);
    const fetchPromise = (() => {
        let _resolve;
        let _reject;
        const _promise = new Promise((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
        });
        // 超时处理
        const timeoutId = setTimeout(() => {
            log([_i, '超时', param.timeout]);
            _resolve(errCode(-5));
        }, param.timeout);

        window.fetch(fetchApiUrl, param)
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
                log([_i, '错误', e.toString(), e]);
                _resolve(errCode(-3));
            });
        _promise.then((res) => {
            clearTimeout(timeoutId);
            if (res.err_code != '-5') log([_i, '回调', res]);
        });
        _promise.abort = function (msg) {
            log([_i, 'abort中断', msg]);
            _reject(errCode(-6));
        };
        return _promise;
    })();

    return fetchPromise;
}
