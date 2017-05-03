/**
 * 入口文件
 */


import ReactDOM from 'react-dom';

import AppMain from 'component';

import store from 'mobx/store-main';
import lang from 'mobx/lang';

ReactDOM.render(<AppMain {...store} lang={lang} />, document.getElementById('app-main'));
