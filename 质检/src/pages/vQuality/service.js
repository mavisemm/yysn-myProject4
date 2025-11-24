import http from '@src/utils/request';

export const service = (function (url) {
    return {
        // 品质等级查询
        find: function (params) {
            return http.post(`${url}/template/find`, {
                body: JSON.stringify(params),
            });
        },
        // 品质等级组新增
        save: function (params) {
            return http.post(`${url}/template/save`, {
                body: JSON.stringify(params),
            });
        },
        // 编辑品质等级划分依据
        qualityTypeSave: function (params) {
            return http.post(`${url}/quality-type/save`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级划分依据
        queryTypeFind: function (params) {
            return http.get(`${url}/quality-type/find`, {
                body: params,
            });
        },
        // 删除品质等级
        deleteMode: function (params) {
            return http.post(`${url}/template/delete`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector/setting`);
