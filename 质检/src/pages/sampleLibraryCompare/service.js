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
        // 查询具体听音记录的曲线图
        getSingleDataLine: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
       
    };
})(`/jiepai/hardware/device`);

export const service1 = (function (url) {
    return {
        // 查询听音记录
        findList: function (params) {
            return http.post(`${url}/findList`, {
                body: JSON.stringify(params),
            });
        },
        compare: function (params) {
            return http.get(`${url}/compare`, {
                body: params,
            });
        },


    };
})(`/hardware/device/typical-sample`);