import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}`, {
                body: JSON.stringify(params),
            });
        },
        //新增
        save: function(params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        //编辑
        newsave: function (params) {
            return http.post(`${url}/edit-useCount`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/check-point/delete/point`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/oauth-client-details`);

