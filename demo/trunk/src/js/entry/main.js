/**
 * 入口文件
 */


import ReactDOM from 'react-dom';

import AppMain from 'component';

import store from 'mobx-data';
import lang from 'config/lang';

ReactDOM.render(<AppMain {...store} lang={lang} />, document.getElementById('app-main'));
