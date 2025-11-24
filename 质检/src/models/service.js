import http from '@src/utils/request';

export const service = (function (url) {
    return {
        //获取听音器
        getList: function (params) {
            return http.post(`${url}/type/config/soundDetector/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        //获取机型
        queryMachine: function (params) {
            return http.post(`${url}/type/config/soundDetector/queryMachine`, {
                body: JSON.stringify(params),
            });
        },
        // 听音器组列表
        getSoundGroupList: function (params) {
            return http.post(`${url}/type/config/soundDetector/findDetectorGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级划分依据
        queryTypeFind: function (params) {
            return http.get(`${url}/type/config/soundDetector/setting/quality-type/find`, {
                body: params,
            });
        },
        // 查询听音器
        querySoundDetector: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        // 点位列表
        getPointList: function (params) {
            return http.post(`${url}/check-point/find/point`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device`);

export const service1 = (function (url) {
    return {
        //统计总数
        queryTotal: function (params) {
            return http.post(`${url}/statistics/total-count`, {
                body: JSON.stringify(params),
            });
        },
        // 听音器统计
        statisticsDetector: function (params) {
            return http.post(`${url}/statistics/statistics-detector`, {
                body: JSON.stringify(params),
            });
        },
        // 生产设备质量统计
        statisticsRank: function (params) {
            return http.post(`${url}/statistics/statistics-rank`, {
                body: JSON.stringify(params),
            });
        },
        statisticsPoint: function (params) {
            return http.post(`${url}/statistics/statistics-point`, {
                body: JSON.stringify(params),
            });
        },

        // 预警信息
        getWarnList: function (params) {
            return http.get(`${url}/forewarning/find`, {
                body: params,
            });
        },
        saveWarn: function (params) {
            return http.post(`${url}/forewarning/save`, {
                body: JSON.stringify(params),
            });
        },
        unbindWarn: function (params) {
            return http.post(`${url}/forewarning/unbind`, {
                body: JSON.stringify(params),
            });
        },
        getCode: function (params) {
            return http.get(`${url}/sound-wechat/queryWechatQrCode`, {
                body: params,
            });
        },
        // 标签列表
        getTagList: function(params) {
            return http.get(`${url}/tag/find-tag`, {
                body: params,
            });
        },

    };
})(`/hardware/device`);