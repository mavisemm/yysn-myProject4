import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //获取听音器
        getList: function(params) {
            return http.post(`${url}/soundDetector/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        //获取机型
        queryMachine: function (params) {
            return http.post(`${url}/soundDetector/queryMachine`, {
                body: JSON.stringify(params),
            });
        },
        // 开始听音
        startListen: function (params) {
            return http.post(`${url}/knock/startListen`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音检测结果
        queryDetectorRecord: function (params) {
            return http.post(`${url}/knock/queryDetectorRecord`, {
                body: JSON.stringify(params),
            });
        },
        // 取消听音
        cancelListen: function (params) {
            return http.post(`${url}/knock/cancelListen`, {
                body: JSON.stringify(params),
            });
        },
        // 导出数据
        exportFile: function (params) {
            return http.post(`${url}/knock/export`, {
                body: JSON.stringify(params),
            });
        },
        
    };
})(`/jiepai/hardware/device/type/config`);
