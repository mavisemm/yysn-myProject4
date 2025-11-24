import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //获取听音器
        getList: function(params) {
            return http.post(`${url}/soundDetector/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        // 查询听音器
        querySoundDetector: function (params) {
            return http.post(`${url}/soundDetector/setting/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        // 开始听音
        batchStartListen: function (params) {
            return http.post(`${url}/calculate/batchStartListen`, {
                body: JSON.stringify(params),
            });
        },
        // 自动开始听音
        run: function (params) {
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
        // plc
        getplc: function (params) {
            return http.get(`${url}/calculate/plc`, {
                body: params,
            });
        },
        // 查询听音器是否为全部输出Ng状态
        findNg: function (params) {
            return http.post(`${url}/calculate/find-ng-status`, {
                body:JSON.stringify(params),
            });
        },
        // 将听音器状态设置为输出Ng或正常
        ngStatus: function (params) {
            return http.get(`${url}/calculate/ng-status`, {
                body: params,
            });
        },
        // 发送邮件
        sendMail: function (params) {
            return http.post(`${url}/calculate/sendMail`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级组
        getMode: function (params) {
            return http.post(`${url}/soundDetector/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
        // 故障类型
        getFaultList: function (params) {
            return http.get(`${url}/soundDetector/setting/fault/find`, {
                body: params,
            });
        },

    };
})(`/jiepai/hardware/device/type/config`);

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
        // 根据听音器组查询统计状态
        statisticsDetectorGroup: function (params) {
            return http.post(`${url}/statistics/statistics-point`, {
                body: JSON.stringify(params),
            });
        },
        // 生产设备质量统计
        statisticsRank: function (params) {
            return http.post(`${url}/statistics/statistics-rank`, {
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
        getCode: function(params) {
            return http.get(`${url}/sound-wechat/queryWechatQrCode`, {
                body: params,
            });
        },
        // 打标签
        saveTag: function(params) {
            return http.post(`${url}/tag/save-detail`, {
                body: JSON.stringify(params),
            });
        },

    };
})(`/hardware/device`);