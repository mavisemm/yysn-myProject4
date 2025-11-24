import React from 'react';
import { Router, Route, Switch,Redirect } from 'dva/router';
import dynamic from 'dva/dynamic';
import { VtxUtil } from './utils/util';
const routes = [
    {
        path: '/login',
        title: '质检登录',
        models: () => [import('./models/common')],
        component: () => import('./pages/login'),
    },
    {
        path: '/loginSg',
        title: '上港集团登录',
        models: () => [import('./models/common')],
        component: () => import('./pages/loginSg'),
    },
    // {
    //     path: '/loginSpot',
    //     title: '点检功能登录',
    //     models: () => [import('./models/common')],
    //     component: () => import('./pages/loginSpot'),
    // },
    {
        path: '/loginVoiceUpload',
        title: '文件上传功能登录',
        component: () => import('./pages/loginVoiceUpload'),
    },
    {
        path: '/uploadFile',
        title: '上传文件版本',
        models: () => [import('./models/common')],
        component: () => import('./pages/uploadFile'),
    },
    {
        path: '/voiceIndex4',
        title: '雅马哈连续敲击听音器首页',
        component: () => import('./pages/voiceIndex4'),
    },
    {
        path: '/manual',
        title: '手动听音器版本',
        component: () => import('./pages/aScreen/manual'),
    },
    {
        path: '/autoExamine',
        title: '自动检测版本(根据听音器检测)',
        component: () => import('./pages/aScreen/autoExamine'),
    },
    {
        path: '/autoReceiver',
        title: '自动检测版本(雷利版本，一个听筒就相当于听音器，拿到检测结果之后，根据id分割)',
        component: () => import('./pages/aScreen/autoReceiver'),
    },
    {
        path: '/soundhy',
        title: '自动检测，华阳集团听音页面',
        component: () => import('./pages/aScreen/soundhy'),
    },
    {
        path: '/nyAuto',
        title: '自动检测，三版组合听音页面',
        component: () => import('./pages/aScreen/nyAuto'),
    },
    // {
    //     path: '/turnListen',
    //     title: '多路轮询听音器版本',
    //     component: () => import('./pages/turnListen'),
    // },
    {
        path: '/soundWater',
        title: '水务检测距离版本',
        component: () => import('./pages/soundWater'),
    },
    {
        path: '/soundNAuto',
        title: '听筒相当于听音器版本,自动检测',
        component: () => import('./pages/soundNAuto'),
    },
    {
        path: '/screen',
        title: '扫码枪大屏展示',
        component: () => import('./pages/screen'),
    },
    {
        path: '/voiceMachine',
        title: '听音器机型管理',
        models: () => [import('./models/common'), ],
        component: () => import('./pages/voiceMachine'),
    },
    // {
    //     path: '/voiceleaderBoard',
    //     title: '领导看板',
    //     models: () => [import('./models/common'), import('./pages/voiceleaderBoard/model')],
    //     component: () => import('./pages/voiceleaderBoard'),
    // },
    {
        path: '/vParams',
        title: '听音器参数设置',
        models: () => [import('./models/common'), import('./pages/vParams/model')],
        component: () => import('./pages/vParams'),
    },
    {
        path: '/vSoundGroup',
        title: '听音器组管理',
        models: () => [import('./models/common'), import('./pages/vSoundGroup/model')],
        component: () => import('./pages/vSoundGroup'),
    },
    {
        path: '/vSound',
        title: '听音器及听筒设置',
        models: () => [import('./models/common'), import('./pages/vSound/model')],
        component: () => import('./pages/vSound'),
    },
    {
        path: '/vQuality',
        title: '品质等级管理',
        component: () => import('./pages/vQuality'),
    },
    {
        path: '/pointManage',
        title: '点位管理',
        models: () => [import('./models/common'), import('./pages/pointManage/model')],
        component: () => import('./pages/pointManage'),
    },
    {
        path: '/pointGroupManage',
        title: '点位组管理',
        models: () => [import('./models/common'), import('./pages/pointGroupManage/model')],
        component: () => import('./pages/pointGroupManage'),
    },
    {
        path: '/collectData',
        title: '水务-采集数据管理',
        models: () => [import('./models/common'), import('./pages/collectData/model')],
        component: () => import('./pages/collectData'),
    },
    {
        path: '/collectDataCompare',
        title: '点位对比管理',
        models: () => [import('./models/common'), import('./pages/collectDataCompare/model')],
        component: () => import('./pages/collectDataCompare'),
    },
    {
        path: '/standardStore',
        title: '标准库管理',
        models: () => [import('./models/common'), import('./pages/standardStore/model')],
        component: () => import('./pages/standardStore'),
    },
    {
        path: '/standardStoreHistory',
        title: '历史标准库管理',
        models: () => [import('./models/common'), import('./pages/standardStoreHistory/model')],
        component: () => import('./pages/standardStoreHistory'),
    },
    {
        path: '/deviceSoundMap',
        title: '听筒地图管理',
        models: () => [import('./models/common'), import('./pages/deviceSoundMap/model')],
        component: () => import('./pages/deviceSoundMap'),
    },
    {
        path: '/pointMap',
        title: '点位分布管理',
        models: () => [import('./models/common'), import('./pages/pointMap/model')],
        component: () => import('./pages/pointMap'),
    },
    {
        path: '/paramsSet',
        title: '设备参数调整',
        models: () => [import('./models/common'), import('./pages/paramsSet/model')],
        component: () => import('./pages/paramsSet'),
    },
    // ====上港集团菜单====
    {
        path: '/sgMachine',
        title: '上港机型管理',
        models: () => [import('./models/common'), import('./pages/sg/sgMachine/model')],
        component: () => import('./pages/sg/sgMachine'),
    },
    {
        path: '/sgTestingEquipment',
        title: '上港检测设备管理',
        models: () => [import('./models/common'), import('./pages/sg/sgTestingEquipment/model')],
        component: () => import('./pages/sg/sgTestingEquipment'),
    },
    {
        path: '/sgTestingPlat',
        title: '上港检测台管理',
        models: () => [import('./models/common'), import('./pages/sg/sgTestingPlat/model')],
        component: () => import('./pages/sg/sgTestingPlat'),
    },
    {
        path: '/sgStandardStore',
        title: '上港标准库管理',
        models: () => [import('./models/common'), import('./pages/sg/sgStandardStore/model')],
        component: () => import('./pages/sg/sgStandardStore'),
    },
    {
        path: '/sgHistoryStore',
        title: '上港历史库管理',
        models: () => [import('./models/common'), import('./pages/sg/sgHistoryStore/model')],
        component: () => import('./pages/sg/sgHistoryStore'),
    },
    {
        path: '/sgTrend',
        title: '上港趋势库管理',
        models: () => [import('./models/common'), import('./pages/sg/sgTrend/model')],
        component: () => import('./pages/sg/sgTrend'),
    },
    {
        path: '/sgTrendHistory',
        title: '上港历史趋势库管理',
        models: () => [import('./models/common'), import('./pages/sg/sgTrendHistory/model')],
        component: () => import('./pages/sg/sgTrendHistory'),
    },
    {
        path: '/sgBoard',
        title: '领导看板',
        models: () => [import('./models/common'), import('./pages/sg/sgBoard/model')],
        component: () => import('./pages/sg/sgBoard'),
    },
    {
        path: '/sgCheck',
        title: '上港检测页面',
        models: () => [import('./models/common')],
        component: () => import('./pages/sg/sgCheck'),
    },
    {
        path: '/sgCompare',
        title: '上港设备对比',
        models: () => [import('./models/common'), import('./pages/sg/sgCompare/model')],
        component: () => import('./pages/sg/sgCompare'),
    },
    // =============================
    // {
    //     path: '/machineManage',
    //     title: '机型管理',
    //     models: () => [import('./models/common'), ],
    //     component: () => import('./pages/machineManage'),
    // },
    // ==偏离度设置
    {
        path: '/deviationDegree',
        title: '偏离度参数设置',
        models: () => [import('./models/common'), import('./pages/deviationDegree/model')],
        component: () => import('./pages/deviationDegree'),
    },
    {
        path: '/sampleDegree',
        title: '样本参数设置',
        models: () => [import('./models/common'), import('./pages/sampleDegree/model')],
        component: () => import('./pages/sampleDegree'),
    },
    {
        path: '/faultManage',
        title: '故障类型管理',
        models: () => [import('./models/common'), ],
        component: () => import('./pages/faultManage'),
    },
    {
        path: '/sampleLibrary',
        title: '典型样本库管理',
        models: () => [import('./models/common'), import('./pages/sampleLibrary/model')],
        component: () => import('./pages/sampleLibrary'),
    },
    {
        path: '/sampleLibraryCompare',
        title: '典型样本库比对',
        models: () => [import('./models/common'), import('./pages/sampleLibraryCompare/model')],
        component: () => import('./pages/sampleLibraryCompare'),
    },
    {
        path: '/report',
        title: '生成报告',
        models: () => [import('./models/common'), import('./pages/report/model')],
        component: () => import('./pages/report'),
    },
    {
        path: '/auto',
        title: '自动建标',
        models: () => [import('./models/common'), import('./pages/auto/model')],
        component: () => import('./pages/auto'),
    },
    {
        path: '/autoHistory',
        title: '自动建标历史管理',
        models: () => [import('./models/common'), import('./pages/autoHistory/model')],
        component: () => import('./pages/autoHistory'),
    },
    {
        path: '/qualitySort',
        title: '质量排序',
        models: () => [import('./models/common')],
        component: () => import('./pages/qualitySort'),
    },
    {
        path: '/pipeline',
        title: '相关性',
        models: () => [import('./models/common')],
        component: () => import('./pages/pipeline'),
    },
    {
        path: '/pipeSpeed',
        title: '相关性速度',
        models: () => [import('./models/common')],
        component: () => import('./pages/pipeSpeed'),
    },
    {
        path: '/apiToken',
        title: 'api接口授权',
        models: () => [import('./models/common'),import('./pages/apiToken/model')],
        component: () => import('./pages/apiToken'),
    },
    {
        path: '/labelManage',
        title: '标签管理',
        models: () => [import('./models/common'), import('./pages/labelManage/model')],
        component: () => import('./pages/labelManage'),
    },
];

function RouterConfig({ history, app }) {
    return (
        <Router history={history}>
            <Switch>
                {routes.map(({ path, ...dynamics }, key) => (
                    <Route
                        key={key}
                        exact
                        path={path}
                        component={dynamic({
                            app,
                            ...dynamics,
                        })}
                    />
                ))}
            </Switch>
        </Router>
    );
}

export default RouterConfig;

