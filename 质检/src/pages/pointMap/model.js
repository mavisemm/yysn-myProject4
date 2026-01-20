import _ from 'lodash';
const u = require('updeep').default;
import { VtxUtil } from '@src/utils/util';
import { service, service1 } from './service';
import moment from 'moment';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;

const initState = {
    // classList: [
    //     { key: 'PRODC', text: '生产设备' },
    //     { key: 'CHECK', text: '检测设备' },
    // ],
    classList: [],
    typeList: [],
    machineList: [],

    objectList: [],

    addPointInfo: {},
    editPointInfo: {},

    detectorId: '',
    pointId: "",
    pointName: "",
    detectorName: "",

    machineId: '',
    machineName: "",
    machinePointFileId: "",
    machinePointFileName: "",
    machinePointFilePath: "",
    machinePointFileUrl: "",
    machinePhotoId: '',
    mode: '',
    canAdd: false,
    canEdit: false,
    imageid: "",
    photoDtoList: [],
    sort: ""
};

export default {
    namespace: 'pointMap',

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/pointMap') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getMachineList' });
                }
            });
        },
    },

    effects: {
        // 机型列表
        *getMachineList({ payload = {} }, { call, put, select }) {
            let params = {
                tenantId
            };
            const data = yield call(service1.getMachineList, VtxUtil.handleTrim(params));
            let dataSource = [],
                machineList = [],
                total = 0,
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.length != 0) {
                    status = true;
                    let arr = data.ret;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].machineList) {
                            machineList = machineList.concat(arr[i].machineList)
                        }
                    }
                }
            }
            let uState = {
                machineList,
                total,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },

        // 管理
        *getPoints({ payload = {} }, { call, put, select }) {
            const { machineId, pointId, machinePhotoId } = yield select(({ pointMap }) => pointMap);
            let params = {
                machineId,
                pointId,
                machinePhotoId
            };
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let list = [];
            if (data && data.rc == 0) {
                // list.push(data.ret)
                list = data.ret || [];
            }
            if (payload.init) {
                yield put({
                    type: 'updateState',
                    payload: {
                        objectList: list,
                    },
                });
            }
            return list;
        },
        // 根据机型获取
        *findByMachineId({ payload = {} }, { call, put, select }) {
            const { machineId, machinePhotoId } = yield select(({ pointMap }) => pointMap);
            let params = {
                machineId,
                machinePhotoId
            };
            const data = yield call(service.findByMachineId, VtxUtil.handleTrim(params));
            let list = [];
            if (data && data.rc == 0) {
                list = data.ret;
            }
            if (payload.init) {
                yield put({
                    type: 'updateState',
                    payload: {
                        objectList: list,
                    },
                });
            }
            return list;
        },
        //保存点位
        *save({ payload = {} }, { call, put, select }) {
            const {
                objectId,
                machineList,
                addPointInfo,
                editPointInfo,
                machineId,
                machineName,
                pointId, machinePhotoId, sort
            } = yield select(({ pointMap }) => pointMap);
            let params;
            if (payload.mode == 'add') {
                params = {
                    ...addPointInfo,
                    pointId,
                    // sort,
                    machinePhotoId,
                    machineId,
                    machineName,
                    tenantId,
                };
            } else if (payload.mode == 'edit') {
                params = {
                    ...editPointInfo,
                };
            } else {
                return;
            }
            // console.log(params,'params')
            // return false;
            const data = yield call(service.save, params);
            if (data && data.rc == 0) {
                payload.onSuccess();
            }
        },

        //删除点位
        *delete({ payload = {} }, { call, put, select }) {
            const data = yield call(service.delete, payload.id);
            if (data && data.rc == 0) {
                payload.onSuccess();
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
        initEditPointInfo(state, action) {
            return {
                ...state,
                editPointInfo: {},
            };
        },
        initAddPointInfo(state, action) {
            return {
                ...state,
                addPointInfo: {},
            };
        },
    },
};
