import http from '@src/utils/request';

export const service = (function(url) {
    return {
        // 故障类型分页
        getFaultList: function (params) {
            return http.get(`${url}/find`, {
                body: params,
            });
        },
        // 故障类型保存
        save: function (params) {
            return http.post(`${url}/save`, {
                body: JSON.stringify(params),
            });
        },
        // 故障类型删除
        delete: function (params) {
            return http.post(`${url}/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 故障类型机型绑定
        bindMachine: function (params) {
            return http.post(`${url}/bind-machine`, {
                body: JSON.stringify(params),
            });
        },
        // 故障类型品质等级绑定
        bindTemplate: function (params) {
            return http.post(`${url}/bind-template`, {
                body: JSON.stringify(params),
            });
        },
        // 故障类型品质等级绑定删除
        deletebindTemplate: function (params) {
            return http.get(`${url}/delete-bind-template`, {
                body:params
            });
        },
 

    };
})(`/jiepai/hardware/device/type/config/soundDetector/setting/fault`);


export const service1 = (function (url) {
    return {
        //机型分页
        getList: function (params) {
            return http.post(`${url}/type/index`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级
        getMode: function (params) {
            return http.post(`${url}/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector`);