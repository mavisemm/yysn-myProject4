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
        // 按时间周期管理列表
       timeparts: function (params) {
           return http.post(`${url}/type/config/soundDetector/type/manageByCycle`, {
               body: JSON.stringify(params),
           });
       },
        // 新增按时间周期管理
       addCycle: function (params) {
           return http.post(`${url}/type/config/soundDetector/type/addCycle`, {
               body: JSON.stringify(params),
           });
       },
        // 编辑按时间周期管理列表
       updateCycle: function (params) {
           return http.post(`${url}/type/config/soundDetector/type/updateCycle`, {
               body: JSON.stringify(params),
           });
       },
        // 删除按时间周期管理列表
        deleteCycle: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/deleteCycle`, {
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