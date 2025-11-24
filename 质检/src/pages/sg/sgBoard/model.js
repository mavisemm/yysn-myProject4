import _ from 'lodash';
const u = require('updeep');
import { VtxUtil } from '@src/utils/util';
import { service } from './service';
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
};

export default {
    namespace: 'sgBoard', 

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/sgBoard') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getList' });
                }
            });
        },
    },

    effects: {
        // 获取列表
        *getList({ payload = {} }, { call, put, select }) {
            let { pageSize, currentPage, queryParams } = yield select(
                ({ sgBoard }) => sgBoard,
            );
            let params = {
                tenantId
            };
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let Source = [],
                total = 0,
                status = false;
            if (data && data.rc === 0) {
                if ('ret' in data) {
                    status = true;
                    Source = [
                        {
                            name:'今日检测总量',
                            number: data.ret.detectAmountToday,
                            key:1
                        },
                             {
                            name:'今日机型品质优数量',
                            number: data.ret.excellenceAmountToday,
                              key: 2
                        },
                             {
                            name:'今日机型品质不合格',
                            number: data.ret.defectsAmountToday,
                              key: 3
                        },
                             {
                            name: '本月检测总量',
                            number: data.ret.detectAmountMonth,
                              key: 4
                        },
                             {
                            name: '本月机型品质优数量',
                            number: data.ret.excellenceAmountMonth,
                              key: 5
                        },
                             {
                            name: '本月机型品质不合格',
                            number: data.ret.defectsAmountMonth,
                            key:6
                        },

                    ]
                }
            }
            let uState = {
                Source,
                total,
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
