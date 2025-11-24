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
        // 按下级部件管理列表
        nextgear: function (params) {
            return http.post(`${url}/type/manageByGearing`, {
                body: JSON.stringify(params),
            });
        },
        // 新增根部件
        addRoot: function (params) {
            return http.post(`${url}/type/addRootGearing`, {
                body: JSON.stringify(params),
            });
        },
        // 编辑根部件
        updateRoot: function (params) {
            return http.post(`${url}/type/updateRootGearing`, {
                body: JSON.stringify(params),
            });
        },
        // 新增下级部件
        addgear: function (params) {
            return http.post(`${url}/type/addGearing`, {
                body: JSON.stringify(params),
            });
        },
        // 编辑下级部件
        updategear: function (params) {
            return http.post(`${url}/type/updateGearing`, {
                body: JSON.stringify(params),
            });
        },
        // 删除下级部件
        deleteparts: function (params) {
            return http.post(`${url}/type/deleteGearing`, {
                body: JSON.stringify(params),
            });
        },
        // 按时间周期管理列表
       timeparts: function (params) {
           return http.post(`${url}/type/manageByCycle`, {
               body: JSON.stringify(params),
           });
       },
        // 新增按时间周期管理
       addCycle: function (params) {
           return http.post(`${url}/type/addCycle`, {
               body: JSON.stringify(params),
           });
       },
        // 编辑按时间周期管理列表
       updateCycle: function (params) {
           return http.post(`${url}/type/updateCycle`, {
               body: JSON.stringify(params),
           });
       },
        // 删除按时间周期管理列表
        deleteCycle: function (params) {
            return http.post(`${url}/type/deleteCycle`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级组
        getMode: function (params) {
            return http.post(`${url}/setting/queryQualityGradeGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 周期管理绑定品质等级组
        bindQuality:function (params) {
            return http.post(`${url}/setting/cycleBindQualityGradeDetail`, {
                body: JSON.stringify(params),
            });
        },
        // 新增多级子部件
        addMultistage: function (params) {
            return http.post(`${url}/type/addMultistage`, {
                body: JSON.stringify(params),
            });
        },
        // 编辑多级子部件
        updateMultistage: function (params) {
            return http.post(`${url}/type/updateMultistage`, {
                body: JSON.stringify(params),
            });
        },
        // 计算周期
        calMultistageCycle: function (params) {
            return http.post(`${url}/type/calMultistageCycle`, {
                body: JSON.stringify(params),
            });
        },
        // 按多级子部件管理
        manageByMultistage: function (params) {
            return http.post(`${url}/type/manageByMultistage`, {
                body: JSON.stringify(params),
            });
        },

    };
})(`/jiepai/hardware/device/type/config/soundDetector`);
