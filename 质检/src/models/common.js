import _ from 'lodash';
const u = require('updeep').default;
import { VtxUtil } from '@src/utils/util';
// import { service as machineRoomService } from '@src/pages/machineRoom/service';
// import { service as machineService } from '@src/pages/machine/service';
// import { service as beltService } from '@src/pages/belt/service';
// import { service as patrolCar } from '@src/pages/patrolCar/service';
// import { service as vibrationDetector } from '@src/pages/vibrationDetector/service';
// import { service as thermal } from '@src/pages/thermal/service';
// import { service as rangeFinder } from '@src/pages/rangeFinder/service';
// import { service as videoManage } from '@src/pages/videoManage/service';

// import { deviceTypeList, facilityTypeList } from '@src/services/common';

import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;

export default {
    namespace: 'common', // 振动检测仪

    state: {},

    subscriptions: {
        setup({ dispatch, history }) {
            return history.listen(({ pathname, search }) => { });
        },
    },

    effects: {
        // 获取机房列表
        *MACHR({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'type',
                        operate: 'EQ',
                        value: 'MACHR',
                    },
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'orderIndex',
                        sort: 'asc',
                    },
                ],
            };
            const data = yield call(machineRoomService.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items;
                }
            }
            return dataSource;
        },

        // 获取机器列表
        *MACHI({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'type',
                        operate: 'EQ',
                        value: 'MACHI',
                    },
                    {
                        code: 'parentId',
                        operate: 'LIKE',
                        value: payload.id || '',
                    },
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(machineService.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items;
                }
            }
            return dataSource;
        },
        // 获取皮带机列表
        *BELTX({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'type',
                        operate: 'EQ',
                        value: 'BELTX',
                    },
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(beltService.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items;
                }
            }
            return dataSource;
        },

        // 获取巡检小车列表
        *BLTTM({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(patrolCar.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        id: item.deviceId,
                    }));
                }
            }
            return dataSource;
        },

        // 获取振动仪
        *VIBTE({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(vibrationDetector.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        id: item.deviceId,
                    }));
                }
            }
            return dataSource;
        },

        // 获取热像仪
        *THERM({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(thermal.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        id: item.deviceId,
                    }));
                }
            }
            return dataSource;
        },

        // 获取测距仪
        *RANGE({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(rangeFinder.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        id: item.deviceId,
                    }));
                }
            }
            return dataSource;
        },

        // 获取视频
        *VIDEO({ payload = {} }, { call, put, select }) {
            let params = {
                filterPropertyMap: [
                    {
                        code: 'tenantId',
                        operate: 'EQ',
                        value: tenantId,
                    },
                ],
                pageIndex: 0,
                pageSize: 1000,
                sortValueMap: [
                    {
                        code: 'createTime',
                        sort: 'desc',
                    },
                ],
            };
            const data = yield call(videoManage.getList, VtxUtil.handleTrim(params));
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret?.items)) {
                    dataSource = data.ret.items.map(item => ({
                        ...item,
                        id: item.channelId,
                        name: item.channel?.text || '',
                    }));
                }
            }
            return dataSource;
        },

        // 设备类型
        *getDeviceTypeList({ payload = {} }, { call, put, select }) {
            const data = yield call(deviceTypeList);
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret)) {
                    dataSource = data.ret;
                }
            }
            return dataSource;
        },

        // 设施类型
        *getFacilityTypeList({ payload = {} }, { call, put, select }) {
            const data = yield call(facilityTypeList);
            let dataSource = [];
            if (data && data.rc === 0) {
                if ('ret' in data && Array.isArray(data.ret)) {
                    dataSource = data.ret;
                }
            }
            return dataSource;
        },
    },

    reducers: {
        updateState(state, action) {
            return u(action.payload, state);
        },
    },
};
