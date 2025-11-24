import http from '@src/utils/request';

export const service = (function(url) {
    return {
        // 查询点位历史听音数据
        getList: function (params) {
            return http.post(`${url}/device/calculate/compare`, {
                body: JSON.stringify(params),
            });
        },
        // 根据数据得到标准线
        getAvgData: function (params) {
            return http.post(`${url}/trend/avgData`, {
                body: JSON.stringify(params),
            });
        },
        // 查询具体听音记录的曲线图
        getSingleDataLine: function (params) {
            return http.post(`${url}/trend/findFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 保存听音标准曲线
        saveStandardLine: function (params) {
            return http.post(`${url}/trend/save`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音数据频率
        findFrequencyListByList: function (params) {
            return http.post(`${url}/trend/findFrequencyListByList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音器
        getSoundList: function (params) {
            return http.post(`${url}/device/query`, {
                body: JSON.stringify(params),
            });
        },
        
    };
})(`/shanggang/hardware`);

export const service1 = (function (url) {
    return {
         //机型列表
         getMachineList: function(params) {
            return http.post(`${url}/type/index`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector`);
