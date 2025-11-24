import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //机型列表
        getMachineList: function(params) {
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
        // 保存听音标准曲线
        saveStandardLine: function (params) {
            return http.post(`${url}/standard-frequency/save`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的标准建库信息
        findStandard: function (params) {
            return http.post(`${url}/standard-frequency/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        //根据记录id查询数据
        findListByIdList: function (params) {
            return http.post(`${url}/standard-frequency/findListByIdList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音数据频率
        findFrequencyListByList: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyListByList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级
        getMode: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
        getSecondMode: function (params) {
            return http.get(`${url}/type/config/soundDetector/setting/fault/find`, {
                body: params,
            });
        },
    };
})(`/jiepai/hardware/device`);

export const service1 = (function (url) {
    return {
        // 样本库列表
        getList: function (params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
        // 保存样本库
        save: function (params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        // 样本库启用
        use: function (params) {
            return http.get(`${url}/use`, {
                body: params,
            });
        },
        // 样本库停用
        notUse: function (params) {
            return http.get(`${url}/notUse`, {
                body: params,
            });
        },
        // 删除样本库
        delete: function (params) {
            return http.post(`${url}/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音记录
        findList: function (params) {
            return http.post(`${url}/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 保存条件阈值
        quality: function (params) {
            return http.post(`${url}/save/quality`, {
                body: JSON.stringify(params),
            });
        },
        // 删除条件阈值
        deletequalityById: function (params) {
            return http.post(`${url}/delete/quality`, {
                body: JSON.stringify(params),
            });
        },
        // 查询条件阈值
       findQuality: function (params) {
           return http.post(`${url}/find/quality`, {
               body: JSON.stringify(params),
           });
       },
    };
})(`/hardware/device/typical-sample`);


export const service2 = (function (url) {
    return {
        //样本参数组
        getDeviationList: function (params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/standard-condition`);