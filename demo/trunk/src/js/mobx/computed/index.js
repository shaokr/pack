/**
 * computed:计算
 */
import { computed } from 'mobx';

export class AppComputed {
    constructor({ title, tab }) {
        this.title = title;
        this.tab = tab;
    }
    // 创建计算
    @computed get total() {
        return this.title.data * this.title.data;
    }
}
