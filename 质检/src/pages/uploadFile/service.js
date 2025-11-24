import http from '@src/utils/request';

export const service = (function(url) {
    return {
        getList: function (params) {
            return http.post(`${url}/open-api/findSelf`, {
                body: JSON.stringify(params),
            });
        },
        // ====本地化部署
        // getList: function (params) {
        //     return http.post(`${url}/open-api/find`, {
        //         body: JSON.stringify(params),
        //     });
        // },
        delete: function (params) {
            return http.post(`${url}/open-api/delete`, {
                body: JSON.stringify(params),
            });
        },
        deleteAll: function (params) {
            return http.post(`${url}/open-api/deleteAll`, {
                body: JSON.stringify(params),
            });
        },
        getUser: function (params) {
            return http.get(`${url}/sound-user`, {
                body: params,
            });
        },
        //
        editUser: function (params) {
            return http.get(`${url}/sound-user/name`, {
                body: params,
            });
        },
        // 转换为wav文件下载
        convertTowav: function (params) {
            return http.post(`${url}/open-api/convert-wav`, {
                body: JSON.stringify(params),
            });
        },
        // excel导出
        exportToexcel: function (params) {
            return http.post(`${url}/open-api/export`, {
                body: JSON.stringify(params),
            });
        },
        // 获取登录信息
        getUserLogin: function (params) {
            return http.post(`${url}/sound-user/login`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device`);
