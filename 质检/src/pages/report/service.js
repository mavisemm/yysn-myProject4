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
        // 保存标准曲线
        submitFrequency: function (params) {
            return http.post(`${url}/standard-frequency/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存标准周期
        submitCycle: function (params) {
            return http.post(`${url}/standard-cycle/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存标准声音
        submitDeviation: function (params) {
            return http.post(`${url}/standard-deviation/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存突发声音
        submitSudden: function (params) {
            return http.post(`${url}/standard-sudden/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存分区声音
        submitPartition: function (params) {
            return http.post(`${url}/standard-partition/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存点位周期
        submitPointCycle: function (params) {
            return http.post(`${url}/standard-cycle-same/save`, {
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
        // 查询多条听音记录，优化版本
        findSimpleFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findSimpleFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询最大值最小值
        findMaxMinFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findMaxMinFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级
        getMode: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级划分依据
        queryTypeFind: function (params) {
            return http.get(`${url}/type/config/soundDetector/setting/quality-type/find`, {
                body: params,
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