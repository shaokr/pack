/**
 * 数据,操作,计算 整合文件
 */
import { useStrict } from 'mobx';
// 数据
import { Title, Tab } from 'mobx/store';
// 操作
import { AppAction } from 'mobx/action';
// 计算
import { AppComputed } from 'mobx/computed';

useStrict(true);

const store = {
    title: new Title(),
    tab: new Tab()
};

const action = {
    title: new AppAction(store)
};

const computed = {
    title: new AppComputed(store)
};

export default {
    store,
    action,
    computed
};
