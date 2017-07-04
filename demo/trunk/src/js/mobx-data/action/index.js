/**
 * action:操作
 */
import { action, runInAction } from 'mobx';

export class AppAction {
    constructor({ title }) {
        this.title = title;
    }

    // 创建动作
    @action('加加') add() {
        this.title.data++;
    }
}
