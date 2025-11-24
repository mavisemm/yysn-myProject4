import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/querySoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        //保存
        save: function(params) {
            return http.post(`${url}/editSoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        //新增
        newsave: function (params) {
            return http.post(`${url}/addSoundDetector`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/deleteSoundDetector`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/jiepai/hardware/device/type/config/soundDetector/setting`);