/**
 * 主要输出js
 */
import 'less/pages/index.less';
import { Component } from 'react';
import { observer } from 'mobx-react';
import DevTools from 'util/devtools'; // 详情

import AppA from './a'; // 列表

// 头部
const Header = ({ title }) => (
    <div className="main">
        <header className="header">
            <div className="header-left">
                <i className="icon-chevron-thin-left" />
            </div>
            <h1>{title}</h1>
        </header>
    </div>
);
// 主
@observer
export default class NoticeMain extends Component {
    constructor(props) {
        super(props);

        this._toggleLang = this._toggleLang.bind(this);
    }
    _toggleLang() {
        const { lang, action } = this.props;
        lang.setLang(lang.Language == 'en' ? 'cn' : 'en');
        action.title.add();
    }
    render() {
        const { store, lang, computed } = this.props;
        const { title, tab } = store;
        return (
            <div onClick={this._toggleLang}>
                <Header title={`${title.name}---${computed.title.total}`} />

					当前语言:{lang.Language}------{lang.data.hi}

                <AppA data={tab.list} />

                {DevTools && <DevTools />}
            </div>
        );
    }

}
