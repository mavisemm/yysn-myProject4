import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/query`, {
                body: JSON.stringify(params),
            });
        },
        //保存
        editSave: function(params) {
            return http.post(`${url}/edit`, {
                body: JSON.stringify(params),
            });
        },
        //新增
        addSave: function (params) {
            return http.post(`${url}/add`, {
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
})(`/shanggang/hardware/device`);