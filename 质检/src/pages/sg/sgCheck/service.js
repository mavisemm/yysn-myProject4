import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //查询检测设备
        getEquipmentList: function(params) {
            return http.post(`${url}/query`, {
                body: JSON.stringify(params),
            });
        },
        //查询检测台
        getPlat: function (params) {
            return http.post(`${url}/findPlatform`, {
                body: JSON.stringify(params),
            });
        },
        // 开始听音
        startListen: function (params) {
            return http.post(`${url}/calculate/startListen`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音检测结果
        queryDetectorRecord: function (params) {
            return http.post(`${url}/calculate/queryDetectorRecord`, {
                body: JSON.stringify(params),
            });
        },
        // 取消听音
        cancelListen: function (params) {
            return http.post(`${url}/calculate/cancelListen`, {
                body: JSON.stringify(params),
            });
        },
        // 修改听音时间
        editSpecialListenTime: function (params) {
            return http.post(`${url}/calculate/listenTime`, {
                body: JSON.stringify(params),
            });
        },
        // 保存echarts图片
        saveEchart: function (params) {
            return http.post(`${url}/calculate/saveEchart`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/shanggang/hardware/device`);

export const service1 = (function(url) {
    return {
        //获取机型
        queryMachine: function (params) {
            return http.post(`${url}/soundDetector/queryMachine`, {
                body: JSON.stringify(params),
            });
        },
        // 修改听音时间
        editSpecialListenTime: function (params) {
            return http.post(`${url}/soundDetector/setting/editSpecialListenTime`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config`);