/**
 * store:数据
 */
import { observable } from 'mobx';
/**
 * 测试
 */
export class Title {
    @observable name = '我是标题哦-点击我看变化'
    @observable data = 1
}

export class Tab {
    @observable list = [1, 2, 4]
    @observable data = 2
}
