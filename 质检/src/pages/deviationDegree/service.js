import http from '@src/utils/request';

export const service1 = (function(url) {
    return {
        //机型列表
        getMachineList: function(params) {
            return http.post(`${url}/type/index`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector`);

export const service = (function (url) {
    return {
        //分页
        getList: function (params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
        //保存
        save: function (params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function (params) {
            return http.post(`${url}/delete`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/standard-condition`);