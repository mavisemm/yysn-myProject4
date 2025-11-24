

import _ from 'lodash';
const u = require('updeep');
import { VtxUtil } from '@src/utils/util';
import { service } from './service';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import moment from 'moment'

// 查询条件
let initQueryParams = {
    facilityName:'',  //报警对象
    startTime:moment().format('YYYY-MM-DD 00:00:00'),//开始时间
    endTime:moment().format('YYYY-MM-DD 23:59:59'),//结束时间   
    eventTypeCode:undefined,//报警类型
    statusCode:'VALID',//状态类型
    alarmObject:undefined,//报警对象
    deviceId: undefined, //设备名称
};

const initState = {
    searchParams: {...initQueryParams}, // 搜索参数
    queryParams: {...initQueryParams}, // 查询列表参数

    currentPage: 1, // 页码
    pageSize: 10, // 每页条数
    loading: false, // 列表是否loading
    dataSource: [], // 列表数据源
    total: 0, // 列表总条数
    viewItem: { // 查看参数
        visible: false
    },
    typeList:[],
    alarmObjectList:[],//报警对象列表
    statusList:[],
    deviceNameList:[],//设备名称列表
};

export default {

    namespace : 'sgHistoryStore', // 皮带机

    state : {...initState},

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => {
                if(pathname === '/sgHistoryStore') {
					// 初始化state
                    dispatch({
                        type: 'updateState',
                        payload: {
                            ...initState
                        }
                    })
                    // dispatch({type: 'getTypeList'});
                    // dispatch({type: 'getStatusList'});
                    dispatch({type: 'getList'});
                    // dispatch({type: 'getAlarmObject'});
                    // dispatch({type: 'getDeviceName'});
                }
            })
        }
    },

    effects : {
        
        // 获取列表
        *getList({ payload = {} }, { call, put, select }) {
            let {
                pageSize, currentPage, queryParams
            } = yield select(({sgHistoryStore}) => sgHistoryStore);
            currentPage = 'currentPage' in payload ? payload.currentPage : currentPage;
            pageSize = 'pageSize' in payload ? payload.pageSize : pageSize;

            let filterPropertyMap = [
                {
                    code: 'detectTime',
                    operate: 'GTE',
                    value: moment(queryParams.startTime).valueOf()
                },
                {
                    code: 'detectTime',
                    operate: 'LTE',
                    value: moment(queryParams.endTime).valueOf()+999
                },
                {
                    code: 'status',
                    operate: 'EQ',
                    value: 1
                },
                {
                    code: "tenantId",
                    operate: "EQ",
                    value: VtxUtil.getUrlParam('tenantId')
                },
           
            ]
            let params = {
                filterPropertyMap:filterPropertyMap.filter((item)=>{return item.value}),
                pageIndex: currentPage - 1,
                pageSize,
                sortValueMap: [
                    {
                        code: 'detectTime',
                        sort: 'desc'
                    }
                ]
            };
            const data = yield call(service.getList, VtxUtil.handleTrim(params));
            let dataSource = [], total = 0, status = false;
            if(data && data.rc === 0) {
                if('ret' in data && Array.isArray(data.ret.items)) {
                    status = true;
                    dataSource = data.ret.items.map(item => ({
                        ...item, 
                        key: item.id,
                        detectTime: moment(item.detectTime).format('YYYY-MM-DD HH:mm:ss')
                    }));
                    total = data.ret.rowCount;
                }
            }
            let uState = {
                dataSource,
                total
            };
            // 请求成功 更新传入值
            status && (uState = {...uState, ...payload});
            yield put({
                type: 'updateState',
                payload: {...uState}
            })
        },

        // 获取类型列表
        *getTypeList({ payload }, { call, put, select }) {
            const data = yield call(service.getTypeList);
            if(data.rc == 0 ){
                yield put({
                    type: 'updateState',
                    payload: {
                        typeList:data.ret
                    }
                })
            }
        },
        // 获取报警对象列表
        *getAlarmObject({ payload }, { call, put, select }) {
            let params = {
               tenantId
            }
            const data = yield call(service.getAlarmObject,{...params});
            if(data.rc == 0 ){
                yield put({
                    type: 'updateState',
                    payload: {
                        alarmObjectList:data.ret
                    }
                })
            }
        },
        // 设备名称列表
        *getDeviceName({ payload }, { call, put, select }) {
            let params = {
               tenantId
            }
            const data = yield call(service.getDeviceName,{...params});
            if(data.rc == 0 ){
                yield put({
                    type: 'updateState',
                    payload: {
                        deviceNameList:data.ret
                    }
                })
            }
        },
         // 获取状态列表
         *getStatusList({ payload }, { call, put, select }) {
            const data = yield call(service.getStatusList);
            if(data.rc == 0 ){
                yield put({
                    type: 'updateState',
                    payload: {
                        statusList:data.ret
                    }
                })
            }
        }
    },

    reducers : {
		updateState(state,action){
            return u(action.payload, state);
        },

		updateQueryParams(state,action) {
            let queryParams = _.pick(state.searchParams, _.keys(initQueryParams));
            return {
                ...state,
                ...action.payload,
                currentPage: 1,
                queryParams: queryParams
            }
        },

        initQueryParams(state,action) {
            return {
                ...state,
                ...action.payload,
                currentPage: 1,
                pageSize: 10,
				searchParams: initQueryParams,
                queryParams: initQueryParams
            }
        },
    }
}