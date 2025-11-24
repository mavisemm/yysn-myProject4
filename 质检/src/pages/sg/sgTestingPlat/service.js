import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/findPlatform`, {
                body: JSON.stringify(params),
            });
        },
        //保存
        save: function (params) {
            return http.post(`${url}/savePlatform`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/deletePlatform`, {
                body: JSON.stringify(params),
            });
        },
        // 检测设备列表
        getEquipmentList: function (params) {
            return http.post(`${url}/query`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/shanggang/hardware/device`);