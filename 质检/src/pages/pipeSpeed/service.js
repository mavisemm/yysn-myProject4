import http from '@src/utils/request';

export const service = (function (url) {
    return {
        getList: function (params) {
            return http.post(`${url}/correlate/query`, {
                body: JSON.stringify(params),
            });
        },
        // 开始听音
        start: function (params) {
            return http.post(`${url}/correlate/save`, {
                body: JSON.stringify(params),
            });
        },
        // 计算相关性
        getCurve: function (params) {
            return http.post(`${url}/correlate/batch-curve`, {
                body: JSON.stringify(params),
            });
        },
        // 批量计算相关性
        getBatchCurve: function (params) {
            return http.post(`${url}/correlate/batch-curve-asynchronous`, {
                body: JSON.stringify(params),
            });
        },
        // 查看曲线图
        getSingle: function (params) {
            return http.get(`${url}/correlate/query-detail`, {
                body:params,
            });
        },
        // 编辑备注
        editRemark: function (params) {
            return http.post(`${url}/correlate/edit-remark`, {
                body: JSON.stringify(params),
            });
        },
        // 删除数据
        delete: function (params) {
            return http.post(`${url}/correlate/delete`, {
                body: JSON.stringify(params),
            });
        },
        //根据设备id查询
        findByDeviceId: function (params) {
            return http.get(`${url}/findByDeviceId`, {
                body:params,
            });
        },
        // 保存增益
        saveBuff: function (params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        // 预采集

    };
})(`/taicang/hardware/device/sound`);


export const service2 = (function (url) {
    return {
        preCollect: function (params) {
            return http.post(`${url}/pre-collect`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/das/soundDetector`);
