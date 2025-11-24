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
        // 查询听音记录
        getPointHistory: function (params) {
            return http.post(`${url}/standard-frequency/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询具体听音记录的曲线图
        getSingleDataLine: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 根据id查数据
        findListByIdListNew: function (params) {
            return http.post(`${url}/standard-frequency/findListByIdListNew`, {
                body: JSON.stringify(params),
            });
        },
        // 保存自动建标
        submit: function (params) {
            return http.post(`${url}/auto/save`, {
                body: JSON.stringify(params),
            });
        },
        // 聚类分组
        autoGroup: function (params) {
            return http.post(`${url}/auto/group`, {
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

        // 批量下载
        downloadZip: function (params) {
            return http.post(`${url}/type/config/calculate/downloadZip`, {
                body: JSON.stringify(params),
            });
        },
        // 校验数据
        check: function (params) {
            return http.post(`${url}/auto/check`, {
                body: JSON.stringify(params),
            });
        },
        // 生成阈值
        calculateError: function (params) {
            return http.post(`${url}/auto/calculate-error`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device`);
