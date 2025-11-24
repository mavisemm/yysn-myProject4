import _ from 'lodash';
const u = require('updeep');
import { VtxUtil } from '@src/utils/util';
import { service,service1 } from './service';
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
    name: '', //参数名称
    startFreq: '3000',
    endFreq: '26000',
    freqCount: "300",
    gamma: '0.8',
    bj: "0.9",
    kaoshi: "2",
    dbP:"1.0",
    freqQ: "1.5",
    alpha: '0.5',
    r:"1"
};


const initState = {
    searchParams: { ...initQueryParams }, // 搜索参数
    queryParams: { ...initQueryParams }, // 查询列表参数

    machineRoomList: [], //机房
    detailDtoList: [],

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
    namespace: 'sampleDegree', // 机器型号

    state: { ...initState },

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if (pathname === '/sampleDegree') {
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
         // 获取机型列表
         *getMachineList({ payload = {} }, { call, put, select }) {
            let { pageSize, currentPage, queryParams } = yield select(
                ({ sampleDegree }) => sampleDegree,
            );
            let params = {
                tenantId
            };
            let arr = [];
            const data = yield call(service1.getMachineList, VtxUtil.handleTrim(params));
                // total = 0,
                status = false;
            if (data && data.rc === 0) {
                if ('ret' in data) {
                    status = true;
                    for (let i = 0; i < data.ret.length; i++) {
                        let temp = data.ret[i];
                        let children = [];
                        if (temp.machineList) {
                            for(let j = 0;j<temp.machineList.length;j++){
                                children.push({
                                    title:temp.machineList[j].name,
                                    key:temp.machineList[j].id,
                                })
                            }
                        }
                        arr[i] = {
                            title:temp.name,
                            key:temp.id,
                            disableCheckbox:true,
                            children:children
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
        // 获取列表
        *getList({ payload = {} }, { call, put, select }) {
            let { pageSize, currentPage, queryParams } = yield select(
                ({ sampleDegree }) => sampleDegree,
            );
            currentPage = 'currentPage' in payload ? payload.currentPage : currentPage;
            pageSize = 'pageSize' in payload ? payload.pageSize : pageSize;

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
                        value:  1
                    },
                ],
                pageIndex: currentPage -1,
                pageSize,
            }
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let dataSource = [],
                total = 0,
                status = false;
            if (data && data.rc === 0) {
                if(data.ret.length != 0){
                        status = true;
                        dataSource = data.ret.items.map(item => ({
                            ...item,
                            createTime: item.createTime
                                ? moment(item.createTime).format('YYYY-MM-DD HH:mm:ss')
                                : '',
                            updateTime: item.updateTime ?
                                moment(item.updateTime).format('YYYY-MM-DD HH:mm:ss'):
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

        // 新增or编辑
        *saveOrUpdate({ payload }, { call, put, select }) {
            const {newItem, editItem } = yield select(({ sampleDegree }) => sampleDegree);
            const {
                id,
                name, 
                startFreq, 
                endFreq, 
                freqCount, 
                kaoshi, 
                bj,
                dbCount,
                dbP, 
                freqQ,
                gamma, 
                alpha,
                r,
                detailDtoList,
            } =  payload.btnType === 'add' ? newItem : editItem;
           
            let params = {
                id,
                name,
                tenantId,
                startFreq,
                endFreq,
                freqCount,
                kaoshi,
                bj,
                dbCount,
                dbP,
                freqQ,
                gamma,
                alpha,
                r,
                detailDtoList,
                type: 1
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
