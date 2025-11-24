import http from '@src/utils/request';

export const service = (function(url) {
    return {
        // 开始听音
        startListen: function (params) {
            return http.post(`${url}/type/config/calculate/batchStartListen`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音检测结果
        queryDetectorRecord: function (params) {
            return http.post(`${url}/type/config/calculate/queryBatchDetectorRecord`, {
                body: JSON.stringify(params),
            });
        },
        // 取消听音
        cancelListen: function (params) {
            return http.post(`${url}/type/config/calculate/batchCancelListen`, {
                body: JSON.stringify(params),
            });
        },
        // 修改听音时间
        editSpecialListenTime: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/editSpecialListenTime`, {
                body: JSON.stringify(params),
            });
        },
        // 查询点位历史听音数据
        getPointHistory: function (params) {
            return http.post(`${url}/standard-frequency/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音记录，优化版本
        findSimpleFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findSimpleFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device`);

export const service1 = (function (url) {
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