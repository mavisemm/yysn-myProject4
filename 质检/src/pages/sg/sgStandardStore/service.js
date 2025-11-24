import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
        //保存
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
})(`/shanggang/hardware/standard-library`);

export const service1 = (function (url) {
    return {
        // 获取等比数列
        getGeometric: function (params) {
            return http.post(`${url}/setting/geometric`, {
                body: JSON.stringify(params),
            });
        },
        //机型列表
        getMachineList: function(params) {
            return http.post(`${url}/type/index`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector`);