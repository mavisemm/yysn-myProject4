import u from 'updeep';
import { VtxUtil } from '@src/utils/util';
import {message} from "antd";
import moment from 'moment';
import {
    dashboardService,
    deviceLatestService,
    deviceService,
    eventService,
    hardwareService,
    factoerEventService,
    aiService,
} from '@src/services/remoteService';
export default {
    namespace: 'boardM',
    state: {
        validList:[],//流水线列表
    },
    subscriptions: {
        setup({ dispatch, history }) {
            // if(!VtxUtil.getUrlParam("tenantId")){
            //     const newUrl =  window.location.href.split("#")[0]+'#/login';
            //     location.href=newUrl
            // }
        }
    },
    effects: {
        //获取实时流水线数据
        // *getValidEvent({ payload }, { call, put, select, take  }) {
        //     let params={
        //         tenantId:'b94bda9800414fe6960eab550496700b'
        //     }
        //     console.log(params,'params')
        //     let dataSource = [];
        //     eventService.getEvent({...params}).then(res => {
        //         if (res.rc == 0) {
        //             if (res.ret) {
        //                 dataSource = res.ret.list;
                
        //             }
        //         } else {
        //             message.error(res.err)
        //         }
        //     })
        //     const {data} = yield call(eventService.getEvent,{...params})
        //     yield put({
        //         type:"updateState",
        //         payload:{
        //             validList:dataSource
        //         }
        //     })
            
        // },
 
        // //录音开始
        // *audioRecordStart({ payload }, { call, put, select, take  }) {
        //     const {data} = yield call(deviceLatestService.audioRecordStart,{
        //         deviceId:payload.deviceId,
        //         clientId:payload.clientId

        //     })
        //     if(!!data && !data.rc) {
        //         payload.onSuccess()
        //     } else {
        //         message.warn("开始播放录音失败")
        //     }
        // },
        // //录音结束
        // *audioRecordStop({ payload }, { call, put, select, take  }) {
        //     const {data} = yield call(deviceLatestService.audioRecordStop,{
        //         deviceId:payload.deviceId,
        //         clientId:payload.clientId
        //     })
        //     if(!!data && !data.rc) {
        //         payload.onSuccess()
        //     } else {
        //         message.warn("结束播放录音失败")
        //     }
        // },
        // //视频ai结果
        // *getVideo({ payload }, { call, put, select, take  }) {
        //     let res=[];
        //     for(let i=0;i<payload.ids.length;i++){
        //         const {data} = yield call(aiService.findVideo,{
        //             channelId:payload.ids[i],
        //         });
        //         res.push(data.ret)
        //     }
        //     payload.onSuccess(res)
        // },
        //获取小车的录音
        // *getcartAudio({ payload }, { call, put, select, take  }) {
        //     let params={
        //         "filterPropertyMap": [
        //           {
        //             "code": "deviceId",
        //             "operate": "EQ",
        //             "value": payload.id
        //           }
        //         ],
        //         "pageIndex": 0,
        //         "pageSize": 20,
        //         "sortValueMap": [
        //           {
        //             "code": "time",
        //             "sort": "desc"
        //           }
        //         ]
        //     }
        //     const data = yield call(deviceLatestService.getCartAudio,{...params})
        //     payload.onSuccess(data.data.ret.items)
        // },
        //小车反控
        // *sendCmd({ payload }, { call, put, select, take  }) {
        //     const {data} = yield call(deviceService.sendCmd,{...payload.params})
        //     if(!!data && !data.rc) {
        //         message.success("操作成功");
        //         payload.onSuccess();
        //     } else {
        //         message.success("操作失败")
        //     }
        // },
    },
    reducers: {
        updateState(state, action) {
            return u(action.payload, state);
        },
        initDefaultHandleModal(state, action){
            return {
                ...state,
                handleModal: {
                    ...defaultHandleModal
                }
            }
        },
        initDefaultVoiceHandleModal(state, action){
            return {
                ...state,
                handleVoiceModal: {
                    ...defaultVoiceHandleModal
                }
            }
        },
        initDefaultCycleHandleModal(state, action) {
            return {
                ...state,
                handleCycleModal: {
                    ...defaultCycleHandleModal
                }
            }
        },
        initDefaultAlarmHandleModal(state, action) {
            return {
                ...state,
                handleAlarmModal: {
                    ...defaultAlarmHandleModal
                }
            }
        },
        initDefaultLineHandleModal(state, action) {
            return {
                ...state,
                handleLineModal: {
                    ...defaultLineHandleModal
                }
            }
        },
    }
}

