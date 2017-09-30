/**
* 模擬接口數據工具
* 2017-5-27 shaokr
*/
import Mock from 'mock';
import _ from 'lodash';
import params, { getParam } from 'util/param';
import { fetchParam } from 'util/fetch';
import uuid from 'uuid/v4';
import errCode from 'util/fetch/err-code';

if (__DEV__) {
    if (params.debug == 3) {
        (async () => {
            await Systemjs.import('fetch');

            const fetch = window.fetch;

            const mockList = {};
            const setMock = (key, op) => {
                mockList[key.toString()] = {
                    op,
                    key
                };
            };

            const getMock = (key) => {
                let op = false;
                _.forEach(mockList, (val) => {
                    if (key.match(val.key)) {
                        op = val.op;
                        return false;
                    }
                });
                return op;
            };

            window.fetch = (url, param) => {
                await Systemjs.import('fetch');
                const isMock = getMock(url);
                if (isMock && param.noMock !== true) {
                    return (async () => {
                        let json;
                        if (typeof isMock === 'function') {
                            json = await isMock();
                        } else {
                            json = Mock.mock(isMock);
                        }
                        return {
                            ok: true,
                            json() {
                                return json;
                            }
                        };
                    })();
                }
                return fetch(url, param);
            };
            // 單點登錄
            setMock(/v1\/getUserInfo/, async () => {
                // 登錄
                const userInfo = await fetchParam({
                    host: params.host || '192.168.1.251:82',
                    url: 'v1/getToken',
                    param: {
                        method: 'POST',
                        body: {
                            login_type: 1,
                            account: params.account,
                            password: params.password,
                            verify_code: '1.0',
                            client_ver: '0.1.0',
                            dev_type: 5,
                            trans_id: uuid()
                        }
                    }
                });

                const [webClient] = userInfo.addr_conf.web_client;
                // 獲取app列表
                // const appList = await fetchParam({
                //     host: `${webClient.host}:${webClient.port}`,
                //     url: 'im/worktable/appList',
                //     param: {
                //         method: 'POST',
                //         body: {
                //             trans_id: uuid(),
                //             access_token: userInfo.access_token,
                //             client_ver: '0.1.0',
                //             dev_type: 5,
                //             uid: userInfo.uid,
                //             cid: userInfo.cids[0]
                //         }
                //     }
                // });

                const [webOpen] = userInfo.addr_conf.web_open;
                // 請求打開app
                const open = await fetchParam({
                    host: `${webOpen.host}:${webOpen.port}`,
                    url: 'v1/sso/sign_in',
                    param: {
                        method: 'GET',
                        body: {
                            appid: '4563402963', // 打開的app-id  需要手動修改
                            trans_id: uuid(),
                            access_token: userInfo.access_token,
                            client_ver: '0.1.0',
                            dev_type: 5,
                            uid: userInfo.uid,
                            cid: userInfo.cids[0]
                        }
                    }
                });
                // open
                // adList
                const _params = getParam(open.url);
                // 單點登錄獲取用戶信息
                return fetchParam({
                    host: `${webClient.host}:${webClient.port}`,
                    url: 'v1/getUserInfo',
                    param: {
                        noMock: true,
                        method: 'POST',
                        body: {
                            trans_id: uuid(),
                            dev_type: 5,
                            msg_signature: _params.msgSignature,
                            time_stamp: _params.timeStamp,
                            nonce: _params.nonce,
                            encrypt: encodeURIComponent(_params.encrypt),
                            app_id: _params.appid
                        }
                    }
                });
            });

            // 其他接口數據模擬
            // setMock(/notice\/list/, {
            //     err_code: '0',
            //     err_msg: '成功',
            //     'count|100-500': 0,
            //     'unread|0-10': 0,                                                  // 未读数
            //     'datas|10-30': [
            //         {
            //             _id: '@id',
            //             cid: 2205,                                        // 发送人CID
            //             uid: 6407683054895759361,                         // 发送人UID
            //             name: '@cname',                                   // 发送人昵称
            //             subject: '@ctitle',                              // 主题
            //             content: '@ctitle(20)',                        // 正文
            //             sign: '@ctitle(8)',                              // 签名
            //             'attachment|0-1': [],                                   // 附件
            //             status: 1,                                        // 公告状态 1正常，0已删除，2已撤销
            //             updated_at: '@datetime("T")',
            //             created_at: '@datetime("T")',
            //             'read|0-1': 0                                           // 是否已读 1已读，0未读
            //         }
            //     ]
            // });
        })();
    }
}
