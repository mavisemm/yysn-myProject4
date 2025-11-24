/**
 * 公共配置文件
 * author : vtx gjh
 * 数据 _CF 来源：./resources/js/config.js
 */

 
 import { message } from 'antd';
 
 export const hostIp = 'http://115.236.25.110:8003';
 export const hostIp1 = 'http://115.236.25.110';

 export default {
     baseurl : { // 基础路径
        eventUrl: `ws://115.236.25.110:8003/assembly`,
        // eventUrl: `ws://115.236.25.110:36051/assembly`,
        // spoteventUrl: `ws://115.236.25.110:8003/assembly`,
        pipews:`ws://115.236.25.110:8003/police`,
        piperelativews:`ws://115.236.25.110:8003/correlation`,
        pipePrews:`ws://115.236.25.110:8003/police`,
     },
     downloadFileUrl: `${hostIp}/cloudFile/common/downloadFile?id=`,
     audioUrl:`${hostIp}/jiepai/hardware/device/type/config/calculate/wav-steam`,
     pipelineUrl:`${hostIp1}:36000/taicang/hardware/device/sound/correlate/download`,
     pipeAudioUrl:`${hostIp1}:36000/taicang/hardware/device/sound/correlate/sound-player`,
    
 }
