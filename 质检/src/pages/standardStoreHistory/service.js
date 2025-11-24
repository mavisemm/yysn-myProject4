import http from '@src/utils/request';

export const service = (function (url) {
    return {
        //机型列表
        getMachineList: function (params) {
            return http.post(`${url}/type/config/soundDetector/type/index`, {
                body: JSON.stringify(params),
            });
        },
        // 点位列表
        getPointList: function (params) {
            return http.post(`${url}/check-point/find/point`, {
                body: JSON.stringify(params),
            });
        },
        // 查询点位历史听音数据
        getPointHistory: function (params) {
            return http.post(`${url}/standard-frequency/findList`, {
                body: JSON.stringify(params),
            });
        },
        // 根据数据得到标准线
        getAvgData: function (params) {
            return http.post(`${url}/standard-frequency/avgData`, {
                body: JSON.stringify(params),
            });
        },
        // 查询具体听音记录的曲线图
        getSingleDataLine: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音数据频率
        findFrequencyListByList: function (params) {
            return http.post(`${url}/standard-frequency/findFrequencyListByList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询多条听音记录，优化版本
        // findSimpleFrequencyList: function (params) {
        //     return http.post(`${url}/standard-frequency/findSimpleFrequencyList`, {
        //         body: JSON.stringify(params),
        //     });
        // },
        // 新版
        findSimpleFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findSimpleFrequencyListNew`, {
                body: JSON.stringify(params),
            });
        },
        // 保存标准曲线
        submitFrequency: function (params) {
            return http.post(`${url}/standard-frequency/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存标准周期
        submitCycle: function (params) {
            return http.post(`${url}/standard-cycle/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存标准声音
        submitDeviation: function (params) {
            return http.post(`${url}/standard-deviation/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存突发声音
        submitSudden: function (params) {
            return http.post(`${url}/standard-sudden/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存分区声音
        submitPartition: function (params) {
            return http.post(`${url}/standard-partition/save`, {
                body: JSON.stringify(params),
            });
        },
        // 保存点位周期
        submitPointCycle: function (params) {
            return http.post(`${url}/standard-cycle-same/save`, {
                body: JSON.stringify(params),
            });
        },
        // 分区声音对比
        comparePartition: function (params) {
            return http.get(`${url}/standard-partition/compare`, {
                body: params,
            });
        },
        // 查询历史库列表
        findStandardList: function (params) {
            return http.post(`${url}/standard-frequency/findStandardList`, {
                body: JSON.stringify(params),
            });
        },
        // 标准频段标记为使用中
        setUseFrequency: function (params) {
            return http.post(`${url}/standard-frequency/setUse`, {
                body: JSON.stringify(params),
            });
        },
        // 标准周期标记为使用中
        setUseCycle: function (params) {
            return http.post(`${url}/standard-cycle/setUse`, {
                body: JSON.stringify(params),
            });
        },
        // 标准声音标记为使用中
        setUseDeviation: function (params) {
            return http.post(`${url}/standard-deviation/setUse`, {
                body: JSON.stringify(params),
            });
        },
        // 标准突发声音标记为使用中
        setUseSudden: function (params) {
            return http.post(`${url}/standard-sudden/setUse`, {
                body: JSON.stringify(params),
            });
        },
        // 分区声音标记为使用中
        setUsePartition: function (params) {
            return http.post(`${url}/standard-partition/setUse`, {
                body: JSON.stringify(params),
            });
        },
        // 点位周期声音声音标记为使用中
        setUsePointCycle: function (params) {
            return http.post(`${url}/standard-cycle-same/setUse`, {
                body: JSON.stringify(params),
            });
        },

        // 复制频段
        copyFrequency: function (params) {
            return http.get(`${url}/standard-frequency/copy`, {
                body: params,
            });
        },
        // 复制标准周期
        copyCycle: function (params) {
            return http.get(`${url}/standard-cycle/copy`, {
                body: params,
            });
        },
        // 复制标准声音
        copyDeviation: function (params) {
            return http.get(`${url}/standard-deviation/copy`, {
                body: params,
            });
        },
        // 复制标准突发声音
        copySudden: function (params) {
            return http.get(`${url}/standard-sudden/copy`, {
                body: params,
            });
        },
        // 复制分区声音
        copyPartition: function (params) {
            return http.get(`${url}/standard-partition/copy`, {
                body: params,
            });
        },
        // 复制点位周期声音声音
        copyPointCycle: function (params) {
            return http.get(`${url}/standard-cycle-same/copy`, {
                body: params,
            });
        },


        // 设为禁用
        setNotUse: function (params) {
            return http.post(`${url}/standard-frequency/setNotUse`, {
                body: JSON.stringify(params),
            });
        },
        //根据记录id查询数据
        // findListByIdList: function (params) {
        //     return http.post(`${url}/standard-frequency/findListByIdList`, {
        //         body: JSON.stringify(params),
        //     });
        // },
        // 新版根据记录id查询数据
        findListByIdList: function (params) {
            return http.post(`${url}/standard-frequency/findListByIdListNew`, {
                body: JSON.stringify(params),
            });
        },
        // 删除标准曲线
        deleteFrequency: function (params) {
            return http.post(`${url}/standard-frequency/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 删除周期库
        deleteCycle: function (params) {
            return http.post(`${url}/standard-cycle/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 删除标准声音库
        deleteDeviation: function (params) {
            return http.post(`${url}/standard-deviation/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 删除突发声音库
        deleteSudden: function (params) {
            return http.post(`${url}/standard-sudden/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 删除分区声音库
        deletePartition: function (params) {
            return http.post(`${url}/standard-partition/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 删除点位周期
        deletePointCycle: function (params) {
            return http.post(`${url}/standard-cycle-same/delete`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的标准曲线建库信息
        findStandardFrequency: function (params) {
            return http.post(`${url}/standard-frequency/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的周期建库信息
        findStandardCycle: function (params) {
            return http.post(`${url}/standard-cycle/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的标准声音库信息
        findStandardDeviation: function (params) {
            return http.post(`${url}/standard-deviation/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的突发声音库信息
        findStandardSudden: function (params) {
            return http.post(`${url}/standard-sudden/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的分区声音库信息
        findStandardPartition: function (params) {
            return http.post(`${url}/standard-partition/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        // 查询已有的点位周期声音库信息
        findStandardPointCycle: function (params) {
            return http.post(`${url}/standard-cycle-same/findStandard`, {
                body: JSON.stringify(params),
            });
        },
        // 查询最大值最小值
        findMaxMinFrequencyList: function (params) {
            return http.post(`${url}/standard-frequency/findMaxMinFrequencyList`, {
                body: JSON.stringify(params),
            });
        },
        // 查询品质等级
        getMode: function (params) {
            return http.post(`${url}/type/config/soundDetector/setting/template/find`, {
                body: JSON.stringify(params),
            });
        },

    };
})(`/jiepai/hardware/device`);

export const service2 = (function (url) {
    return {
        //偏离度参数列表
        getList: function (params) {
            return http.post(`${url}/find`, {
                body: JSON.stringify(params),
            });
        },
    };
})(`/hardware/device/standard-condition`);
