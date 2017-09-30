/**
 * 多语言包
 */

import { observable, action, runInAction, useStrict } from 'mobx';
import { local } from 'util/storage';
import Systemjs from 'systemjs';

useStrict(true);
const DefLang = 'zh';
class Language {
    @observable Language = local.get('Language', true) || DefLang // 当前语言
    @observable data = {} // 当前语言数据

    constructor() {
        this.setLang();
    }

    @action('设置语言')
    setLang = async function (name = this.Language) {
        const data = await Systemjs.import(`${__webpack_public_path__}/lang/${name}.js`).catch(() => false);
        if (data) {
            runInAction(`语言成功设置为:${name}`, () => {
                local.set('Language', name, true);
                this.Language = name;
                this.data = data;
            });
        } else if (name !== DefLang) {
            const _name = name.split(/[-_]/)[0];
            if (_name !== name) {
                this.setLang(_name);
                return;
            }
            if (name !== this.Language) {
                this.setLang();
            } else {
                this.setLang(DefLang);
            }
        }
    }
}

export default new Language();
