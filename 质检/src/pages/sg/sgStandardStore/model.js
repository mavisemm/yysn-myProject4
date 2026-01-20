import _ from 'lodash';
const u = require('updeep').default;
import { VtxUtil } from '@src/utils/util';
import { service, service1 } from './service';
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
    machineIdList: [],
    degree: '0.2',
    degree2: '0.4',
    sectionRate: '0.33',
    machineName: ""
};


const initState = {
    searchParams: { ...initQueryParams }, // 搜索参数
    queryParams: { ...initQueryParams }, // 查询列表参数

    machineList: [], //机型

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
};

export default {
    namespace: 'sgStandardStore', // 机器型号

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/sgStandardStore') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getList' });
                    dispatch({ type: 'getMachineList' });
                }
            });
        },
    },

    effects: {
        // 获取列表
        *getList({ payload = {} }, { call, put, select }) {
            let { pageSize, currentPage, queryParams } = yield select(({ sgStandardStore }) => sgStandardStore);
            currentPage = 'currentPage' in payload ? payload.currentPage : currentPage;
            pageSize = 'pageSize' in payload ? payload.pageSize : pageSize;
            let params = {
                filterPropertyMap: [{
                    code: "tenantId",
                    operate: "EQ",
                    value: tenantId
                }],
                pageIndex: currentPage - 1,
                pageSize,
            }
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let dataSource = [],
                total = 0,
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.items.length != 0) {
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
        // 获取机型列表
        *getMachineList({ payload = {} }, { call, put, select }) {
            let params = {
                tenantId
            };
            let arr = [],
                status = false;
            const data = yield call(service1.getMachineList, VtxUtil.handleTrim(params));
            if (data && data.rc === 0) {
                status = true;
                if ('ret' in data) {
                    for (let i = 0; i < data.ret.length; i++) {
                        if (data.ret[i].machineList) {
                            arr = arr.concat(data.ret[i].machineList)
                        }
                    }
                }
            }
            let uState = {
                machineList: arr,
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
            const { newItem, editItem } = yield select(({ sgStandardStore }) => sgStandardStore);
            const { id, name, dbMax, dbMin, vibrationMax, vibrationMin, torqueMax, machineIdList, torqueMin, temperatureMax, temperatureMin, hydraulicMax, hydraulicMin, speed, power, detailDtoList } = payload.btnType === 'add' ? newItem : editItem;
            let params = {
                id,
                name,
                tenantId,
                machineIdList,
                dbMax, dbMin, vibrationMax, vibrationMin, torqueMax, torqueMin, temperatureMax, temperatureMin, hydraulicMax, hydraulicMin, speed, power, detailDtoList
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
    },
};
