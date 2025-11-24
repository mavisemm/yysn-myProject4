import http from '@src/utils/request';

export const service = (function(url) {
    return {
        //分页
        getList: function(params) {
            return http.post(`${url}/type/index`, {
                body: JSON.stringify(params),
            });
        },
        //编辑保存组别
        updateGroup: function (params) {
            return http.post(`${url}/type/updateGroup`, {
                body: JSON.stringify(params),
            });
        },
        //新增组别
        addGroup: function (params) {
            return http.post(`${url}/type/addGroup`, {
                body: JSON.stringify(params),
            });
        },
        //删除组别
        deleteGroup: function (params) {
            return http.post(`${url}/type/deleteGroup`, {
                body: JSON.stringify(params),
            });
        },
        //编辑保存机型
        updateMachine: function (params) {
            return http.post(`${url}/type/updateMachine`, {
                body: JSON.stringify(params),
            });
        },
        //新增机型
        addMachine: function (params) {
            return http.post(`${url}/type/addMachine`, {
                body: JSON.stringify(params),
            });
        },
        //删除机型
        deleteMachine: function (params) {
            return http.post(`${url}/type/deleteMachine`, {
                body: JSON.stringify(params),
            });
        },

        // 保存机型模板
        addMachineTemplate: function (params) {
            return http.post(`${url}/machine-template/addMachine`, {
                body: JSON.stringify(params),
            });
        },
        // 删除机型模板
        deleteMachineTemplate: function (params) {
            return http.post(`${url}/machine-template/deleteMachine`, {
                body: JSON.stringify(params),
            });
        },
        // 更新机型模板
        updateMachineTemplate: function (params) {
            return http.post(`${url}/machine-template/updateMachine`, {
                body: JSON.stringify(params),
            });
        },
        // 查询机型模板
        indexTemplate: function (params) {
            return http.post(`${url}/machine-template/index`, {
                body: JSON.stringify(params),
            });
        },

       
    };
})(`/jiepai/hardware/device/type/config/soundDetector`);
