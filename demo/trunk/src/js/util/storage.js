/**
* h5 本地存储
*/
const { localStorage, sessionStorage, location } = window;
const KEY = location.pathname;
const getKEY = key => `${KEY}${key}`;

class Storage {
    constructor(props) {
        this.storage = props;
    }
    // 获取长度
    get longth() {
        return this.storage.length;
    }
    // 获取
    get(key) {
        return JSON.parse(this.storage.getItem(getKEY(key)));
    }
    // 设置
    set(key, val) {
        this.storage.setItem(getKEY(key), JSON.stringify(val));
    }
    // 删除项
    remove(key) {
        this.storage.removeItem(getKEY(key));
    }
    // 清除全部
    clear() {
        for (const key in this.storage) {
            if (key.indexOf(KEY) === 0) this.remove(key.replace(KEY,''));
        }
    }
    has(key) {
        return this.storage.hasOwnProperty(getKEY(key));
    }
}

export const local = new Storage(localStorage);
export const session = new Storage(sessionStorage);

export default {
    local, session
};
