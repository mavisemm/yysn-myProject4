import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //统计总数
        queryTotal: function (params) {
            return http.post(`${url}/total-count`, {
                body: JSON.stringify(params),
            });
        },
        // 听音器统计
        statisticsDetector: function (params) {
            return http.post(`${url}/statistics-detector`, {
                body: JSON.stringify(params),
            });
        },
        // 生产设备质量统计
        statisticsRank: function (params) {
            return http.post(`${url}/statistics-rank`, {
                body: JSON.stringify(params),
            });
        },

    };
})(`/hardware/device/statistics`);

export const service1 = (function (url) {
    return {
        // 查询品质等级
        getMode: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
       
    };
})(`/jiepai/hardware/device`);