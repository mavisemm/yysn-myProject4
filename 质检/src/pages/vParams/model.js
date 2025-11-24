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
// 新增参数
let defaultNewItem = {
    id: '',
    imageList: [], // 图片
    description: '', // 描述
    name: '', // 机器名称
    deviceId: '', // 机器编号
};
let defaultTreeItem = {
    visible: false,
}

const initState = {
    searchParams: { ...initQueryParams }, // 搜索参数
    queryParams: { ...initQueryParams }, // 查询列表参数

    machineRoomList: [], //机房
    machineList: [],
    detailDtoList:[],
    currentPage: 1, // 页码
    pageSize: 10, // 每页条数
    loading: false, // 列表是否loading
    dataSource: [], // 列表数据源
    total: 0, // 列表总条数
    selectedRowKeys: [],
    newItem: { ...defaultNewItem },
    editItem: {
        // 编辑参数
        visible: false,
        loading: false,
    },
    viewItem: {
        // 查看参数
        visible: false,
    },
    // 编辑子部件参数
    treeItem: {...defaultTreeItem},
};

export default {
    namespace: 'vParams', // 机器型号

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/vParams') {
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
            let params = {
                tenantId
            };
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let dataSource = [],
                total = 0,
                status = false;
            if (data && data.rc === 0) {
                if(data.ret.length != 0){
                    status = true;
                    dataSource = data.ret.map(item => ({
                        ...item,
                        createTime: item.createTime
                            ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                            : '',
                        key: item.id,
                    }));
                }
                // if ('ret' in data && Array.isArray(data.ret?.items)) {
                //     status = true;
                //     dataSource = data.ret.items.map(item => ({
                //         ...item,
                //         createTime: item.createTime
                //             ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                //             : '',
                //         imageList: item.imageList || [],
                //         key: item.deviceId,
                //     }));
                //     total = data.ret.rowCount;
                // }
            }
            let uState = {
                dataSource,
                total,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },

        // 新增or编辑
        *saveOrUpdate({ payload }, { call, put, select }) {
            const {newItem, editItem } = yield select(({ vParams }) => vParams);
  
            const {
                id,
                listenTime,
                calT1,
                calT2,
                startFrequency,
                endFrequency,
                frequencyCount,
                 detailDtoList, dbP

            } =  payload.btnType === 'add' ? newItem : editItem;

            let params = {
                id,
                listenTime,
                tenantId,
                calT1,
                calT2,
                startFrequency,
                endFrequency,
                frequencyCount,
                 detailDtoList, dbP
            };
            const data = yield call(service.save, VtxUtil.handleTrim(params));
            if (data && data.rc === 0) {
                yield put({ type: 'getList' });
                payload.onSuccess();
            } else {
                payload.onError();
            }
        },

        // 删除
        *deleteItems({ payload }, { call, put, select }) {
            let { ids = [] } = payload;
            const data = yield call(service.delete, ids);
            if (!!data && data.rc == 0) {
                payload.onSuccess(ids);
            } else {
                payload.onError(data ? data.msg : '删除失败');
            }
        },
    },

    reducers: {
        updateState(state, action) {
            return u(action.payload, state);
        },

        updateQueryParams(state, action) {
            let queryParams = _.pick(state.searchParams, _.keys(initQueryParams));
            return {
                ...state,
                ...action.payload,
                selectedRowKeys: [],
                currentPage: 1,
                queryParams: queryParams,
            };
        },

        initQueryParams(state, action) {
            return {
                ...state,
                ...action.payload,
                currentPage: 1,
                pageSize: 10,
                searchParams: initQueryParams,
                queryParams: initQueryParams,
            };
        },

        initNewItem(state, action) {
            return {
                ...state,
                newItem: {
                    ...defaultNewItem,
                },
            };
        },
        initTreeItem(state, action) {
            return {
                ...state,
                treeItem: {
                    ...defaultTreeItem,
                },
            };
        },
    },
};
