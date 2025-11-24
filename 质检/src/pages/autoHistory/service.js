import http from '@src/utils/request';

export const service = (function (url) {
    return {
        // 查询听音记录
        getPointHistory: function (params) {
            return http.post(`${url}/standard-frequency/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询详情
        findById: function (params) {
            return http.get(`${url}/auto/findById`, {
                body: params,
            });
        },
        // 查询历史库列表
        findStandardList: function (params) {
            return http.post(`${url}/auto/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 保存
        submit: function (params) {
            return http.post(`${url}/auto/save`, {
                body: JSON.stringify(params),
            });
        },
        // 删除
        deleteFrequency: function (params) {
            return http.post(`${url}/auto/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 设为使用中
        setUse: function (params) {
            return http.post(`${url}/auto/setUse`, {
                body: JSON.stringify(params),
            });
        },
        // 设为禁用
        setNotUse: function (params) {
            return http.post(`${url}/auto/setNotUse`, {
                body: JSON.stringify(params),
            });
        },
        // 聚类分组
        autoGroup: function (params) {
            return http.post(`${url}/auto/group`, {
                body: JSON.stringify(params),
            });
        },
        // 生成权重曲线
        calculateLine: function (params) {
            return http.post(`${url}/auto/calculate-line`, {
                body: JSON.stringify(params),
            });
        },
        // 校验数据
        check: function (params) {
            return http.post(`${url}/auto/check`, {
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
        //  查询多条听音记录，优化版本
        findSimpleFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findSimpleFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 新版根据记录id查询数据
        findListByIdListNew: function (params) {
            return http.post(`${url}/standard-frequency/findListByIdListNew`, {
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
        // 生成阈值
        calculateError: function (params) {
            return http.post(`${url}/auto/calculate-error`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device`);

