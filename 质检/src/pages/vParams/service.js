import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/queryDetectCondition`, {
                body: JSON.stringify(params),
            });
        },
        //保存
        save: function(params) {
            return http.post(`${url}/editDetectCondition`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/delete`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector/setting`);
