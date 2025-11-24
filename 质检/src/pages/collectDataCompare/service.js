import http from '@src/utils/request';

export const service = (function (url) {
    return {
        //机型列表
        getMachineList: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/index`, {
                body: JSON.stringify(params),
            });
        },
        // 点位列表
        getPointList: function (params) {
            return http.post(`${url}/check-point/find/point`, {
                body: JSON.stringify(params),
            });
        },
        // 查询点位历史听音数据
        getPointHistory: function (params) {
            return http.post(`${url}/standard-frequency/findListByReceiverList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询具体听音记录的曲线图
        getSingleDataLine: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音数据频率
        findFrequencyListByList: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyListByList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音记录，优化版本
        findSimpleFrequencyListNew: function (params) {
            return http.post(`${url}/standard-frequency/findSimpleFrequencyListNew`, {
                body: JSON.stringify(params),
            });
        },
        // 查询最大值最小值
        findMaxMinFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findMaxMinFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 导出
        exportDist: function (params) {
            return http.post(`${url}/type/config/calculate/exportDist`, {
               body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device`);

export const service2 = (function (url) {
    return {
        //偏离度参数列表
        getList: function (params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/standard-condition`);