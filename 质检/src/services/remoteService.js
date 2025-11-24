
import http from '@src/utils/request';

export const eventService = (function(url) {
    return {
        //查询
        getEvent: function (params) {
            return http.get(`${url}/hardware/device/assemblyLine/index`, {
                body: params,
            });
        },
    }
}(`/jiepai`));


