import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/queryList`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/shanggang/hardware/device/calculate`);
