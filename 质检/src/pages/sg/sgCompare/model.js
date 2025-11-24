import _ from 'lodash';
const u = require('updeep');
import { VtxUtil } from '@src/utils/util';
import { service,service1 } from './service';
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
    soundList:[]
};

export default {
    namespace: 'sgCompare', 

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/sgCompare') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getMachineList' });
                    dispatch({ type: 'getSoundList' });
                }
            });
        },
    },

    effects: {
        // 获取机型列表
        *getMachineList({ payload = {} }, { call, put, select }) {
            let params = {
                tenantId
            };
            let arr = [];
            const data = yield call(service1.getMachineList, VtxUtil.handleTrim(params));
            if (data && data.rc === 0) {
                if ('ret' in data) {
                    for (let i = 0; i < data.ret.length; i++) {
                        if (data.ret[i].machineList) {
                            arr = arr.concat(data.ret[i].machineList)
                        }
                    }
                }
            }
            let uState = {
                machineList:arr,
                // total,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },
        // 获取听音器列表
         *getSoundList({ payload = {} }, { call, put, select }) {
            let params = {
                tenantId
            }
            const data = yield call(service.getSoundList, VtxUtil.handleTrim(params));
            let dataSource = [],
                status = false;
            if (data && data.rc === 0) {
                if(data.ret.length != 0){
                        status = true;
                        for(let i =0 ;i<data.ret.length;i++){
                            if(data.ret[i].type == 'SOUND'){
                                dataSource = dataSource.concat(data.ret[i]?.receiverList || []);
                            }
                        }
                }
            }
            let uState = {
                soundList:dataSource,
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
