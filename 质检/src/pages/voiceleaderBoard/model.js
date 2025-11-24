import _ from 'lodash';
const u = require('updeep');
import { VtxUtil } from '@src/utils/util';
import { service1 } from './service';
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

    machineRoomList: [], //机房
    machineList: [],

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
    qualityList:[]
};
export default {
    namespace: 'voiceleaderBoard', 
    state: { ...initState },
    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/voiceleaderBoard') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getMode' });
                }
            });
        },
    },

    effects: {
         // 获取品质等级列表
        *getMode({payload = {}}, {call,put,select}) {
            let params = {
                filterPropertyMap: [{
                    code: 'tenantId',
                    operate: 'EQ',
                    value: tenantId,
                }, ],
                sortValueMap: [{
                    code: 'sort',
                    sort: 'asc',
                }, ],
            }
            const data = yield call(service1.getMode, VtxUtil.handleTrim(params));
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
            status && (uState = {
                ...uState,
                ...payload
            });
            yield put({
                type: 'updateState',
                payload: {
                    ...uState
                },
            });
        },

    },

    reducers: {
        updateState(state, action) {
            return u(action.payload, state);
        },
    },
};
