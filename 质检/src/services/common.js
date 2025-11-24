import http from '@src/utils/request';

//视频通道下拉
export function channelSelect(params) {
    return http.get('/cloud/vis/base/np/videoCommon/channelSelect.smvc', {
        body: params,
    });
}

//设备类型
export function deviceTypeList(params) {
    return http.get('/taicang/hardware/device/type/getDropdownList', {
        body: params,
    });
}

//设施类型
export function facilityTypeList(params) {
    return http.get('/taicang/hardware/facility/type/getDropdownList', {
        body: params,
    });
}
