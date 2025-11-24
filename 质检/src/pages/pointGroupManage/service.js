import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/check-point/find/point-group`, {
                body: JSON.stringify(params),
            });
        },
        // 点位列表
        getPointList: function (params) {
            return http.post(`${url}/check-point/find/point`, {
                body: JSON.stringify(params),
            });
        },
        //新增
        save: function(params) {
            return http.post(`${url}/check-point/insert/point-group`, {
                body: JSON.stringify(params),
            });
        },
        //编辑
        newsave: function (params) {
            return http.post(`${url}/check-point/update/point-group`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/check-point/delete/point-group`, {
                body: JSON.stringify(params),
            });
        },
        // 机型列表
        getMachineList: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/index`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device`);