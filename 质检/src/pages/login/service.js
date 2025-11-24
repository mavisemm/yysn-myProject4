import http from '@src/utils/request';

export const service = (function(url) {
    return {
        login: function(params) {
            return http.post(`${url}/login`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/cas`);
