const errList = {
    0: {
        err_code: '0',
        err_msg: '成功'
    },
    500: {
        err_code: '500',
        err_msg: '服务器500错误'
    },
    '-1': {
        err_msg: '未知错误'
    },
    '-2': {
        err_code: '-2',
        err_msg: '设置失败'
    },
    '-3': {
        err_code: '-3',
        err_msg: '网络错误'
    },
    '-4': {
        err_code: '-4',
        err_msg: 'webSocket链接失败'
    },
    '-5': {
        err_code: '-5',
        err_msg: '请求超时'
    },
    '-6': {
        err_code: '-6',
        err_msg: '请求中断'
    }
};

export default function err(id) {
    let _err = errList[id];
    if (!_err) {
        _err = errList['-1'];
    }
    return _err;
}
err.res = function (data) {
    if (data.res) {
        return data;
    }
    return {
        ...data,
        res: {
            err_code: data.err_code,
            err_msg: data.err_msg,
            trans_id: data.trans_id
        }
    };
};
