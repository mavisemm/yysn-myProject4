import http from '@src/utils/request';

export const service = (function(url) {
    return {
        getCode: function(params) {
            return http.get(`${url}/sound-wechat/queryWechatQrCode`, {
                body: params,
            });
        },
        login: function (params) {
            return http.get(`${url}/sound-user/checkLogin`, {
                body: params,
            });
        },
        // 获取userid
        getUser: function (params) {
            return http.get(`${url}/sound-user`, {
                body: params,
            });
        },
        getUserLogin: function (params) {
            return http.post(`${url}/sound-user/login`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device`);
