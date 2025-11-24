import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //顶部
        getList: function(params) {
            return http.post(`${url}/calculate/board`, {
                body: JSON.stringify(params),
            });
        },
        // 机型质量排名(本月)
        machineQ: function (params) {
            return http.post(`${url}/calculate/boardRank`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/shanggang/hardware/device`);
