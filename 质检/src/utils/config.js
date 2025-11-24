import { VtxUtil } from './util';
export const vtxInfo = {
    // tenantId: VtxUtil.getUrlParam('tenantId'),
    tenantId: "994a5b0dca1e4a71b38576ff3c8cfef6", //质检新算法ce
    // tenantId: '644a123758f94f69a8fa0a14c3f9328b', //sg
    userId: VtxUtil.getUrlParam('userId') || '',
    token: VtxUtil.getUrlParam('token') || '',
};