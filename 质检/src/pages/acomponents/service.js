import http from '@src/utils/request';

export const service = (function (url) {
    return {
        // 获取生产设备列表
        getDeviceList: function (params) {
            return http.post(`${url}/production/equipment/getList`, {
                body: JSON.stringify(params),
            });
        },
        // 生产设备列表子部件
        getDeviceId: function (params) {
            return http.post(`${url}/production/equipment/getById`, {
                body: JSON.stringify(params),
            });
        },
        // 测距下拉列表
        getRangeList: function (params) {
            return http.get(`${url}/device/range/name/getDropdownList`, {
                body: params,
            });
        },
    };
})(`/taicang/hardware`);

export const service1 = (function (url) {
    return {
        //点位组列表
        getPointGroup: function (params) {
            return http.post(`${url}/check-point/find/point-group`, {
                body: JSON.stringify(params),
            });
        },
        // 机型列表
        getMachineList: function (params) {
            return http.post(`${url}//type/config/soundDetector/type/index`, {
                body: JSON.stringify(params),
            });
        },

    };
})(`/jiepai/hardware/device`);


export const service2 = (function (url) {
    return {
        // 新增品质等级模式
        addMode: function (params) {
            return http.post(`${url}/setting/addQualityGradeGroup`, {
                body: JSON.stringify(params),
            });
        },
        //编辑质等级模式
        editMode: function (params) {
            return http.post(`${url}/setting/editQualityGradeGroupName`, {
                body: JSON.stringify(params),
            });
        },
        // 删除品质等级组
        deleteMode: function (params) {
            return http.post(`${url}/setting/deleteQualityGradeGroup`, {
                body: JSON.stringify(params),
            });
        },
        //设置默认品质等级组
        defaultMode: function (params) {
            return http.post(`${url}/setting/setDefaultQualityGradeGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级组
        getMode: function (params) {
            return http.post(`${url}/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级组ID对应详情
        getQuality: function (params) {
            return http.get(`${url}/setting/queryQuality`, {
                body: params,
            });
        },
        // 机型列表
        getMachine: function (params) {
            return http.post(`${url}/type/index`, {
                body: JSON.stringify(params),
            });
        },
        // 机型绑定品质等级模式
        bindMode: function (params) {
            return http.post(`${url}/setting/bindQualityGradeDetail`, {
                body: JSON.stringify(params),
            });
        },
        // 品质等级组查询
        getTemplateQuality: function (params) {
            return http.post(`${url}/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },
        // 品质等级组新增
        saveTemplateQuality: function (params) {
            return http.post(`${url}/setting/template/save`, {
                body: JSON.stringify(params),
            });
        },

        // 新版
        // 更新品质等级
        saveQuality: function (params) {
            return http.post(`${url}/setting/saveQuality`, {
                body: JSON.stringify(params),
            });
        },
        // 删除周期明细
        deleteQualityCycleDetail: function (params) {
            return http.post(`${url}/setting/deleteQualityCycleDetail`, {
                body: JSON.stringify(params),
            });
        },
        // 删除周期组
        deleteQualityCycleGroup: function (params) {
            return http.post(`${url}/setting/deleteQualityCycleGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 删除频率明细
        deleteQualityFreqDetail: function (params) {
            return http.post(`${url}/setting/deleteQualityFreqDetail`, {
                body: JSON.stringify(params),
            });
        },
        // 删除频率组
        deleteQualityFreqGroup: function (params) {
            return http.post(`${url}/setting/deleteQualityFreqGroup`, {
                body: JSON.stringify(params),
            });
        },
        // 删除偏离度
        deleteQualityGradeStandard: function (params) {
            return http.post(`${url}/setting/deleteQualityGradeStandard`, {
                body: JSON.stringify(params),
            });
        },


    };
})(`/jiepai/hardware/device/type/config/soundDetector`);


export const service3 = (function (url) {
    return {
        //分页
        getDeviationList: function (params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/standard-condition`);