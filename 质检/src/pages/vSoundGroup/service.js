import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/findDetectorGroup`, {
                body: JSON.stringify(params),
            });
        },
        //保存
        save: function(params) {
            return http.post(`${url}/saveDetectorGroup`, {
                body: JSON.stringify(params),
            });
        },
        //删除
        delete: function(params) {
            return http.post(`${url}/deleteDetectorGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 听音器列表
       querySoundDetector: function (params) {
           return http.post(`${url}/setting/querySoundDetector`, {
               body: JSON.stringify(params),
           });
       },
    };
})(`/jiepai/hardware/device/type/config/soundDetector`);