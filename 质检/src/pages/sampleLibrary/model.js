import _ from 'lodash';
const u = require('updeep').default;
import { VtxUtil } from '@src/utils/util';
import { service, service1, service2 } from './service';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import moment from 'moment';

// 查询条件
let initQueryParams = {
    deviceId: '', // 编号
    name: '', // 名称
    startTime: null,
    endTime: null,
};

let queryOperate = {
    deviceId: 'LIKE',
    name: 'LIKE',
};

const initState = {
    searchParams: { ...initQueryParams }, // 搜索参数
    queryParams: { ...initQueryParams }, // 查询列表参数

    pointList: [], //点位列表
    machineList: [],//机型列表

    currentPage: 1, // 页码
    pageSize: 10, // 每页条数
    loading: false, // 列表是否loading
    Source: [], // 列表数据源
    total: 0, // 列表总条数
    selectedRowKeys: [],
    editItem: {
        // 编辑参数
        visible: false,
        loading: false,
    },
    viewItem: {
        // 查看参数
        visible: false,
    },
    qualityList: [],
    faultList: [],
    querytemplateId: "",
    deviationList: [],
};

export default {
    namespace: 'sampleLibrary',

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/sampleLibrary') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getMachineList' });
                    dispatch({ type: 'getPointList' });
                    dispatch({ type: 'getMode' });
                    dispatch({ type: 'getSecondMode' });
                    dispatch({ type: 'getDeviationList' });
                }
            });
        },
    },

    effects: {
        // 获取机型列表
        *getMachineList({ payload = {} }, { call, put, select }) {
            let { pageSize, currentPage, queryParams } = yield select(
                ({ sampleLibrary }) => sampleLibrary,
            );
            let params = {
                tenantId
            };
            let arr = [];
            const data = yield call(service.getMachineList, VtxUtil.handleTrim(params));
            // total = 0,
            status = false;
            if (data && data.rc === 0) {
                if ('ret' in data) {
                    status = true;
                    for (let i = 0; i < data.ret.length; i++) {
                        if (data.ret[i].machineList) {
                            arr = arr.concat(data.ret[i].machineList)
                        }
                    }
                }
            }
            let uState = {
                machineList: arr,
                // total,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },
        // 获取点位列表
        *getPointList({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [{
                    code: "tenantId",
                    operate: "EQ",
                    value: tenantId
                }],
            }
            const data = yield call(service.getPointList, VtxUtil.handleTrim(params));
            let arr = [];
            let pointList = [],
                // total = 0,
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.length != 0) {
                    status = true;
                    pointList = data.ret.items.map(item => ({
                        ...item,
                        createTime: item.createTime
                            ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                        updateTime: item.updateTime ?
                            moment(item.updateTime).format('YYYY-MM-DD HH:mm:ss') :
                            '',
                        key: item.id,
                    }));
                }
            }
            let uState = {
                pointList,
                // total,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },
        // 获取品质等级列表
        *getMode({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [{
                    code: 'tenantId',
                    operate: 'EQ',
                    value: tenantId,
                },],
                sortValueMap: [{
                    code: 'sort',
                    sort: 'asc',
                },],
            }
            const data = yield call(service.getMode, VtxUtil.handleTrim(params));
            let qualityList = [],
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.length != 0) {
                    status = true;
                    qualityList = data.ret.items || []
                }
            }
            let uState = {
                qualityList,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },
        // 查询品质二级
        *getSecondMode({ payload = {} }, { call, put, select }) {
            let params = {
                tenantId
            }
            const data = yield call(service.getSecondMode, { ...params });
            let faultList = [],
                querytemplateId = '';
            status = false;;
            if (data && data.rc === 0) {
                if (data.ret.length != 0) {
                    status = true;
                    faultList = data.ret.faultTypeDtoList || [],
                        querytemplateId = data.ret?.detailDto?.templateId || ''
                }
            }
            let uState = {
                faultList,
                querytemplateId
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },
        //样本参数列表
        *getDeviationList({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: "tenantId",
                        operate: "EQ",
                        value: tenantId
                    },
                    {
                        code: "type",
                        operate: "EQ",
                        value: 1
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,

            }
            const data = yield call(service2.getDeviationList, VtxUtil.handleTrim(params));
            let dataSource = [],
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.length != 0) {
                    status = true;
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        createTime: item.createTime
                            ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                        updateTime: item.updateTime ?
                            moment(item.updateTime).format('YYYY-MM-DD HH:mm:ss') :
                            '',
                        key: item.id,
                    }));
                }
            }
            let uState = {
                deviationList: dataSource,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },


    },

    reducers: {
        updateState(state, action) {
            return u(action.payload, state);
        },
    },
};
