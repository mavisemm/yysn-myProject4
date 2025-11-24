import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.get(`${url}/findByReceiverId`, {
                body: params,
            });
        },
        //保存听筒点位
        save: function(params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        //删除听筒点位
        delete: function(params) {
            return http.post(`${url}/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 根据机型查询多个点位
        findByMachineId: function (params) {
            return http.get(`${url}/findByMachineId`, {
                body: params,
            });
        },
    };
})(`/taicang/hardware/receiver/layout`);

export const service1 = (function (url) {
    return {
        //听音器列表
        getSoundList: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        // 机型列表
        getMachineList: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/index`, {
                body: JSON.stringify(params),
            });
        },
        //更新点位图片
        updateMachinePoint: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/updateMachinePoint`, {
                body: JSON.stringify(params),
            });
        },
        // 点位列表
        getPointList: function(params) {
            return http.post(`${url}/check-point/find/point`, {
                body: JSON.stringify(params),
            });
        },

      
    };
})(`/jiepai/hardware/device`);
