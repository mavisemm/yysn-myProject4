import _ from 'lodash';
const u = require('updeep').default;
import { VtxUtil } from '@src/utils/util';
import { service } from './service';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import moment from 'moment';
import { message } from 'antd';

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
    name: '', //听音器名称
    y: "",
    z: "",
    degree: '0.2',
    degree2: '0.4',
    sectionRate: '0.33',
    type: "",
};


const initState = {
    searchParams: { ...initQueryParams }, // 搜索参数
    queryParams: { ...initQueryParams }, // 查询列表参数

    machineRoomList: [], //机房
    receiverList: [],

    currentPage: 1, // 页码
    pageSize: 10, // 每页条数
    loading: false, // 列表是否loading
    dataSource: [], // 列表数据源
    total: 0, // 列表总条数
    selectedRowKeys: [],
    newItem: { ...defaultNewItem },
    newItemOne: { ...defaultNewItem },
    editItem: {
        // 编辑参数
        visible: false,
        loading: false,
        receiverList: [],
        type: ""
    },
    editItemOne: {
        // 编辑参数
        visible: false,
        loading: false,
        name: "",
        type: ""
    },
    viewItem: {
        // 查看参数
        visible: false,
    },
};

export default {
    namespace: 'sgTestingEquipment', // 机器型号

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/sgTestingEquipment') {
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
            }
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let dataSource = [],
                total = 0,
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.length != 0) {
                    status = true;
                    dataSource = data.ret.map(item => ({
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

        // 声音设备新增or编辑
        *saveOrUpdate({ payload }, { call, put, select }) {
            const { newItem, editItem } = yield select(({ sgTestingEquipment }) => sgTestingEquipment);
            const { id, name, degree, degree2, sectionRate, } = payload.btnType === 'add' ? newItem : editItem;
            let newreceiverList = [];
            let receiverList = [];
            if (localStorage.receiverList) {
                receiverList = JSON.parse(localStorage.receiverList)
            }
            for (let i = 0; i < receiverList.length; i++) {
                newreceiverList.push({
                    name: receiverList[i].name,
                    id: receiverList[i].id || null
                })
            }
            let params = {
                id,
                name,
                tenantId,
                degree,
                degree2,
                sectionRate,
                receiverList: newreceiverList
            };

            let newParams = {
                receiverList: newreceiverList,
                name,
                tenantId,
                degree,
                degree2,
                sectionRate,
                type: 'SOUND'
            }
            let data = '';
            if (payload.btnType === 'add') {
                data = yield call(service.addSave, VtxUtil.handleTrim(newParams));
            } else {
                data = yield call(service.editSave, VtxUtil.handleTrim(params));
            }
            if (data && data.rc === 0) {
                yield put({ type: 'getList' });
                payload.onSuccess();
            } else {
                payload.onError();
            }
        },
        // 振动、红外新增
        *saveOrUpdateOne({ payload }, { call, put, select }) {
            const { newItemOne, editItemOne } = yield select(({ sgTestingEquipment }) => sgTestingEquipment);
            const { id, name, type } = payload.btnType === 'add' ? newItemOne : editItemOne;
            let params = {
                id,
                name,
                tenantId,
                type,
            };

            let newParams = {
                name,
                tenantId,
                type
            }
            let data = '';
            if (payload.btnType === 'add') {
                data = yield call(service.addSave, VtxUtil.handleTrim(newParams));
            } else {
                data = yield call(service.editSave, VtxUtil.handleTrim(params));
            }
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
        initNewItemOne(state, action) {
            return {
                ...state,
                newItemOne: {
                    ...defaultNewItem,
                },
            };
        },
    },
};
