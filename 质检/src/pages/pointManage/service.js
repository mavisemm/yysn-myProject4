import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/check-point/find/point`, {
                body: JSON.stringify(params),
            });
        },
        // 听音器列表
        getSoundList: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        //新增
        save: function(params) {
            return http.post(`${url}/check-point/batchInsert/point`, {
                body: JSON.stringify(params),
            });
        },
        //编辑
        newsave: function (params) {
            return http.post(`${url}/check-point/update/point`, {
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
})(`/jiepai/hardware/device`);