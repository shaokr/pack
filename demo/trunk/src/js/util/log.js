import param from 'util/param';

const getDLog = () => {
    let DLog = document.getElementById('DLog');
    if (!DLog) {
            // $('<div style="word-wrap:break-word;"></div>');
        DLog = document.createElement('div');
        DLog.setAttribute('style', `
            word-wrap: break-word;
            position: fixed;
            height: 0;
            width: 0;
            top:0;
            left:0;
            background: rgba(255, 255, 255, 1);
            overflow: hidden;
            z-index:1000000;
        `);
        DLog.setAttribute('id', 'DLog');
        document.body.appendChild(DLog);

        const Fixed = document.createElement('div');
        Fixed.setAttribute('style', `
            position: fixed;
            right: 5%;
            top: 5%;
            height: 50px;
            width: 50px;
            background: rgba(253, 189, 0, 0.4);
            border-radius: 50%;
            z-index:1000001;
            border: 1px solid #fff;
        `);

        Fixed.addEventListener('click', () => {
            if (DLog.style.overflow === 'hidden') {
                DLog.style.overflow = 'auto';
                DLog.style.height = '100%';
                DLog.style.width = '100%';
            } else {
                DLog.style.overflow = 'hidden';
                DLog.style.height = '0';
                DLog.style.width = '0';
            }
        });
        document.body.appendChild(Fixed);
    }
    return DLog;
};

const getLogGroup = (id, group) => {
    let LogGroup = document.getElementById(id);
    if (!LogGroup) {
        LogGroup = document.createElement('div');
        LogGroup.setAttribute('style', `
            margin: -30px 10px 10px;
            padding: 30px 10px 10px;
            border: 1px solid #000;
        `);
        LogGroup.id = id;

        const DQc = document.createElement('button');
        DQc.setAttribute('style', `
            margin: 10px;
        `);
        DQc.innerHTML = `清除'${group}'组内容信息`;
        DQc.onclick = function () {
            LogGroup.innerHTML = '';
        };
        //
        getDLog().appendChild(DQc);
        getDLog().appendChild(LogGroup);
    }
    return LogGroup;
};
/**
 * [打印数据]
 * @param  {[type]} str   [需要打印的数据]
 * @param  {Number} group [打印数据分组默认为 0]
 * @return {[type]}       [毛都木有返回]
 */
const logGroup = {};
const log = (str, group = 0, show = false) => {
    if (param.debug == 10086 || param.debug == group || show) {
        console.trace(str);
        logGroup[group] = logGroup[group] >> 0; // 当前编号
        const _group = ++logGroup[group];
        const DLogGroup = getLogGroup(`Log-${group}`, group);
        const _p = document.createElement('p');
        _p.innerHTML = `${_group}----${JSON.stringify(str)}<hr>`;
        DLogGroup.appendChild(_p);
    }
};

log.group = (name) => {
    if (param.debug) {
        console.group(name);
    }
};

log.groupEnd = () => {
    if (param.debug) {
        console.groupEnd();
    }
};

export default log;
