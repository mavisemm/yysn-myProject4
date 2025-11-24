import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.get(`${url}/find-tag`, {
                body: params,
            });
        },
        //新增
        save: function(params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/delete`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/tag`);