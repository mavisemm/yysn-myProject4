import http from '@src/utils/request';

export const service = (function (url) {
    return {
        //获取听音器
        getList: function (params) {
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
            return http.post(`${url}/calculate/run`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音检测结果
        queryDetectorRecord: function (params) {
            return http.post(`${url}/calculate/queryBatchDetectorRecord`, {
                body: JSON.stringify(params),
            });
        },
        // 取消听音
        cancelListen: function (params) {
            return http.post(`${url}/calculate/batchCancelListen`, {
                body: JSON.stringify(params),
            });
        },
        // 修改听音时间
        editSpecialListenTime: function (params) {
            return http.post(`${url}/soundDetector/setting/editSpecialListenTime`, {
                body: JSON.stringify(params),
            });
        },
        // 听音器组列表
        getSoundGroupList: function (params) {
            return http.post(`${url}/soundDetector/findDetectorGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 上传图片
        saveEchart: function (params) {
            return http.post(`${url}/calculate/saveEchart`, {
                body: JSON.stringify(params),
            });
        },
        // 下载质检报告
        exportBatch: function (params) {
            return http.post(`${url}/calculate/exportBatch`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级划分依据
        queryTypeFind: function (params) {
            return http.get(`${url}/soundDetector/setting/quality-type/find`, {
                body: params,
            });
        },
        // 查询听音器
        querySoundDetector: function (params) {
            return http.post(`${url}/soundDetector/setting/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        // plc
        getplc: function (params) {
            return http.get(`${url}/calculate/plc`, {
                body: params,
            });
        },
    };
})(`/jiepai/hardware/device/type/config`);

export const service1 = (function (url) {
    return {
        statisticsPoint: function (params) {
            return http.post(`${url}/statistics-point`, {
                body: JSON.stringify(params),
            });
        },
        //统计总数
        queryTotal: function (params) {
            return http.post(`${url}/total-count`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/statistics`);