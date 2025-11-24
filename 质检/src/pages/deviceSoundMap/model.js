import _ from 'lodash';
const u = require('updeep');
import { VtxUtil } from '@src/utils/util';
import { service,service1 } from './service';
import moment from 'moment';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;

const initState = {
    // classList: [
    //     { key: 'PRODC', text: '生产设备' },
    //     { key: 'CHECK', text: '检测设备' },
    // ],
    classList:[],
    typeList: [],
    deviceList: [],

    objectList: [],

    addPointInfo: {},
    editPointInfo: {},

    detectorId: '',
    pointId:"",
    pointName:"",
    detectorName:"",

    receiverId: '',
    machineId: '',
    machineName: "",
    machineFileId: "",
    machineFileName: "",
    machineFilePath: "",
    machineFileUrl: "",
    mode: '',
    canAdd: false,
    canEdit: false,
    imageid:"",
    pointList:[],
};

export default {
    namespace: 'deviceSoundMap',

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/deviceSoundMap') {
                    // 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState,
                        },
                    });
                    dispatch({ type: 'getPointList' });
                    dispatch({ type: 'getSoundList' });
                    dispatch({ type: 'getMachineList' });
                }
            });
        },
    },

    effects: {
        // 点位列表
        *getPointList({ payload = {} }, { call, put, select }) {
             let params = {
                filterPropertyMap: [{
                    code: "tenantId",
                    operate: "EQ",
                    value: tenantId
                }],
                pageIndex: 0,
                pageSize:1000,
            }
            const data = yield call(service1.getPointList, VtxUtil.handleTrim(params));
            let dataSource = [],
                status = false;
            if (data && data.rc === 0) {
                if(data.ret.length != 0){
                    status = true;
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        key: item.id,
                    }));
                }
            }
            let uState = {
                pointList:dataSource,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },
        // 听音器列表
        *getSoundList({ payload = {} }, { call, put, select }) {
            let params = {
                tenantId
            };
            const data = yield call(service1.getSoundList, VtxUtil.handleTrim(params));
            let dataSource = [],
                status = false;
            if (data && data.rc === 0) {
                if (data.ret.length != 0){
                    status = true;
                    dataSource = data.ret.map(item => ({
                        ...item,
                        key: item.id,
                    }));
                }
            }
            
            let uState = {
                classList:dataSource,
            };
            // 请求成功 更新传入值
            status && (uState = { ...uState, ...payload });
            yield put({
                type: 'updateState',
                payload: { ...uState },
            });
        },

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
                if (data.ret.length != 0){
                    status = true;
                    let  arr = data.ret;
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].machineList) {
                            machineList = machineList.concat(arr[i].machineList)
                        }
                    }
                }
            }
            let uState = {
                deviceList: machineList,
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
            const { machineId,receiverId} = yield select(({ deviceSoundMap }) => deviceSoundMap);
            let params = {
                machineId,
                receiverId
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
            const { machineId,receiverId} = yield select(({ deviceSoundMap }) => deviceSoundMap);
            let params = {
                machineId,
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
                deviceList,
                addPointInfo,
                editPointInfo,
                detectorName,
                receiverId,
                receiverName,
                machineFileId,
                machineFileName,
                machineFilePath,
                machineFileUrl,
                machineId,
                machineName,
                detectorId,
                pointId,
            } = yield select(({ deviceSoundMap }) => deviceSoundMap);
            /*   console.log(objectId, deviceList)
            let device;
            deviceList.forEach(item => {
                if(objectId == item.id) {
                    device = item
                }
            })
            console.log(device) */
            let params;
            if (payload.mode == 'add') {
                params = {
                    ...addPointInfo,
                    detectorId,
                    detectorName,
                    receiverId,
                    receiverName,
                    machineFileId,
                    machineFileName,
                    machineFilePath,
                    machineFileUrl,
                    machineId,
                    machineName,
                    tenantId,
                    pointId
                };
            } else if (payload.mode == 'edit') {
                params = {
                    ...editPointInfo,
                };
            } else {
                return;
            }
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
