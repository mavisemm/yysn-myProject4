/**
 * 公共配置文件
 * author : vtx gjh
 * 数据 _CF 来源：./resources/js/config.js
 */


import { message } from 'antd';

export const hostIp = 'http://122.224.196.178:8003';
export const hostIp1 = 'http://122.224.196.178';

export default {
    baseurl: { // 基础路径
        eventUrl: `ws://122.224.196.178:8003/assembly`,
        // eventUrl: `ws://122.224.196.178:36051/assembly`,
        // spoteventUrl: `ws://122.224.196.178:8003/assembly`,
        pipews: `ws://122.224.196.178:8003/police`,
        piperelativews: `ws://122.224.196.178:8003/correlation`,
        pipePrews: `ws://122.224.196.178:8003/police`,
    },
    downloadFileUrl: `${hostIp}/cloudFile/common/downloadFile?id=`,
    audioUrl: `${hostIp}/jiepai/hardware/device/type/config/calculate/wav-steam`,
    pipelineUrl: `${hostIp1}:36000/taicang/hardware/device/sound/correlate/download`,
    pipeAudioUrl: `${hostIp1}:36000/taicang/hardware/device/sound/correlate/sound-player`,

}
