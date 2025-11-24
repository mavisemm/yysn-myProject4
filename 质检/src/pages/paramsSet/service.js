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
            return http.post(`${url}/standard-frequency/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 根据数据得到标准线
        getAvgData: function (params) {
            return http.post(`${url}/standard-frequency/avgData`, {
                body: JSON.stringify(params),
            });
        },
        // 查询具体听音记录的曲线图
        getSingleDataLine: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 重新计算
        calculateAgain: function (params) {
            return http.post(`${url}/type/config/calculate/calculate-again`, {
                body: JSON.stringify(params),
            });
        },
        // 分区声音对比
        comparePartition: function (params) {
            return http.get(`${url}/standard-partition/compare`, {
                body: params,
            });
        },
        // 查询多条听音数据频率
        findFrequencyListByList: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyListByList`, {
                body: JSON.stringify(params),
            });
        },
        //编辑保存机型
        updateMachine: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/updateMachine`, {
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