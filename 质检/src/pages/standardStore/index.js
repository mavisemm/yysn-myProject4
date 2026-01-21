
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, DatePicker, Checkbox, Pagination, Switch, BackTop, Tabs, Popover } from 'antd';

import { service, service2 } from './service';
import styles from './standardStore.less';
import Frequency from '@src/pages/acomponents/bzFrequency';
import Freq from '@src/pages/acomponents/bzFreq';
import BzLineFreq from '@src/pages/acomponents/bzLineFreq';
import Cycle from '@src/pages/acomponents/bzCycle';
import Deviation from '@src/pages/acomponents/bzDeviation';
import Sudden from '@src/pages/acomponents/bzSudden';
import Partition from '@src/pages/acomponents/bzPartition';
import CycleManage from '@src/pages/acomponents/cycleManage';
import SearchPage from '@src/pages/acomponents/searchPage';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'standardStore';
const { MonthPicker, RangePicker } = DatePicker;
import echartsOption from '@src/pages/acomponents/optionEcharts';
import moment from 'moment';
import echarts from 'echarts';
import { result } from 'lodash';
const TabPane = Tabs.TabPane;
import SideBar from '@src/pages/sideBar';
import comm, { hostIp } from '@src/config/comm.config.js';
import { syncEchartsZoom } from '@src/utils/echartsUtil.js';

let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
let myEchartsFullScreen = null;
let singleTotalArr = [];
let filePath = '';
let freq1Arr = [];
let freq2Arr = [];
let avgDbArr = [];
let avgDensityArr = [];

let qualityDbArr = [];
let qualityDbLowArr = [];
let qualityDensityArr = [];
let qualityDensityLowArr = [];

let CompareDbUp = [];
let CompareDbDown = [];
let CompareDbLowUp = [];
let CompareDbLowDown = [];
let CompareDensityUp = [];
let CompareDensityDown = [];
let CompareDensityLowUp = [];
let CompareDensityLowDown = [];

let positiveDbMin = [];
let positiveDbMax = [];

let negativeDbMin = [];
let negativeDbMax = [];

let positiveDensityMin = [];
let positiveDensityMax = [];

let negativeDensityMin = [];
let negativeDensityMax = [];

let XARR = [];
let finallydbArr = [];
let finallydensityArr = [];

let dbMaxAll = [];
let dbMinAll = [];
let densityMaxAll = [];
let densityMinAll = [];

let LineDbUP = [];
let LineDbDown = [];
let LineDbLowUP = [];
let LineDbLowDown = [];
let LineDensityUP = [];
let LineDensityDown = [];
let LineDensityLowUP = [];
let LineDensityLowDown = [];

let echartsClickData = [];

let removeEchartsSync = null;

@connect(({ standardStore }) => ({ standardStore }))
class standardStore extends React.Component {
    myEchartsClickTrend = null;
    constructor(props) {
        super(props);
        this.state = {
            clickTrendData: [],
            selectedFreq: '',
            selectedRowKeys: [],
            selectedRowKeysCycle: [],
            loading: false,
            cycleType: '',
            machineId: '',
            receiverId: '',
            judgeType: '',
            qualityId: '',
            recordId: "",
            speed: '',
            tableData: [],
            singleDataVisible: false,
            standardLineVisible: false,
            detailDtoList: [],
            name: "",
            cycleList: [],
            precision: "",
            cycleDtoList: [],
            standardCycleList: [],
            pointId: '',
            detectorId: "",
            total: 0,
            avgCycle: 0,
            avgDb: 0,
            avgDegree: 0,
            avgFrequency: 0,
            AvgLineShow: false,
            qualityList: [],
            standardCycleDtoList: [],
            standardFrequencyDtoList: [],
            standardDeviationGroupDtoList: [],
            standardPartitionDtoList: [],
            deviationList: [],
            standardfrequencyList: [],
            multiFreqStandardGroupDtoList: [],
            multiAbsFreqStandardGroupDtoList: [],
            cycleStatus: "",
            frequencyStatus: "",
            standardStatus: "",
            suddenStatus: "",
            partitionStatus: "",
            cycleSameStatus: "",
            cycleName: '',
            deviationName: "",
            suddenInfo: {},
            partitionName: "",
            partCompareList: [],
            partCompareVisible: false,
            code: "exp",
            fullScreenVisible: false,
            switchAllShow: false,
            allCaculteData: [],
            allCaculteDataChecked: [],
            selectedRows: [],
            sameGroupDtoList: [],
            pointList: [],
            pointCycleName: "",
            disabled: false,
            clickTrendDimension: 'db',
            startTime: '',
            endTime: '',
        }
    }
    componentDidMount() {
        const { standardStore } = this.props;
        const { qualityList, deviationList, pointList } = standardStore;
        this.queryTypeFind();
        this.setState({
            qualityList,
            deviationList,
            pointList
        })
    }
    componentWillReceiveProps(newProps) {
        const { standardStore } = { ...newProps };
        const { qualityList, deviationList, pointList } = standardStore;
        this.setState({
            qualityList,
            deviationList,
            pointList
        })
    }
    componentWillUnmount() {
        this.disposeEcharts();
    }

    batchDelete = () => {
        const {
            selectedRowKeys,
            startTime, endTime,
            judgeType, qualityId, recordId
        } = this.state;

        if (selectedRowKeys.length === 0) {
            message.warning('请先选择要删除的数据！');
            return;
        }

        Modal.confirm({
            title: '确认删除',
            content: `您确定要删除选中的 ${selectedRowKeys.length} 条数据吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                service.getDelete([selectedRowKeys]).then(res => {
                    if (res.rc === 0) {
                        message.success('批量删除成功！');
                        this.getList({}, {
                            cycleType: this.state.cycleType,
                            machineId: this.state.machineId,
                            receiverId: this.state.receiverId,
                            speed: this.state.speed,
                            machineNo: this.state.machineNo,
                            pointId: this.state.pointId,
                            detectorId: this.state.detectorId,
                            startTime: this.state.startTime,
                            endTime: this.state.endTime,
                            judgeType: this.state.judgeType,
                            qualityId: this.state.qualityId,
                            recordId: this.state.recordId
                        });
                        this.setState({
                            selectedRowKeys: [],
                            detailDtoList: [],
                            selectedRows: []
                        });
                    } else {
                        message.error(`删除失败：${res.err}`);
                    }
                }).catch(err => {
                    message.error('删除请求出错，请重试！');
                });
            }
        });
    }

    singleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: `您确定要删除这条记录（ID：${record.id}）吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                service.getDelete([record.id]).then(res => {
                    if (res.rc === 0) {
                        message.success('删除成功！');
                        this.getList({}, {
                            cycleType: this.state.cycleType,
                            machineId: this.state.machineId,
                            receiverId: this.state.receiverId,
                            speed: this.state.speed,
                            machineNo: this.state.machineNo,
                            pointId: this.state.pointId,
                            detectorId: this.state.detectorId,
                            startTime: this.state.startTime,
                            endTime: this.state.endTime,
                            judgeType: this.state.judgeType,
                            qualityId: this.state.qualityId,
                            recordId: this.state.recordId
                        });
                        this.setState({
                            selectedRowKeys: [],
                            detailDtoList: [],
                            selectedRows: []
                        });
                    } else {
                        message.error(`删除失败：${res.err}`);
                    }
                }).catch(err => {
                    message.error('删除请求出错，请重试！');
                });
            }
        });
    }

    queryTypeFind = () => {
        let params = {
            tenantId
        }
        service.queryTypeFind(params).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    const {
                        cycleStatus,
                        frequencyStatus,
                        standardStatus,
                        suddenStatus, partitionStatus, cycleSameStatus } = res.ret;
                    this.setState({
                        cycleStatus,
                        frequencyStatus,
                        standardStatus,
                        suddenStatus, partitionStatus, cycleSameStatus
                    })
                }
            } else {
                message.error(res.err)
            }
        })
    }
    disposeEcharts = () => {
        if (typeof removeEchartsSync === 'function') {
            removeEchartsSync();
            removeEchartsSync = null;
        }
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }
        if (myEchartsDensity) {
            myEchartsDensity.dispose();
            myEchartsDensity = null;
        }
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }

    }
    handleClose = () => {
        this.setState({
            singleDataVisible: false,
            partCompareVisible: false,
            fullScreenVisible: false,
            allDataVisible: false,
            clickChartVisible: false,
            tagVisible: false,
        })

        if (myEchartsFullScreen) {
            if (typeof removeEchartsSync === 'function') {
                removeEchartsSync();
                removeEchartsSync = null;
            }
            myEchartsFullScreen.dispose();
            myEchartsFullScreen = null;
        }
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
        if (myEchartsFullScreen) {
            myEchartsFullScreen.dispose();
            myEchartsFullScreen = null;
        }
        if (this.myEchartsClickTrend) {
            this.myEchartsClickTrend.dispose();
            this.myEchartsClickTrend = null;
        }
    }

    getList = (result, msg) => {
        this.disposeEcharts();
        this.setState({
            standardLineVisible: false,
            startTime: msg.startTime,
            endTime: msg.endTime,
            judgeType: msg.judgeType,
            qualityId: msg.qualityId,
            recordId: msg.recordId
        })
        const { cycleType, startTime, endTime, machineId, receiverId, speed, machineNo, pointId,
            detectorId, judgeType, qualityId, recordId } = msg;
        let params = {
            ...msg
        }
        service.getPointHistory(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if (res.ret) {
                    let data = res.ret;
                    arr = data.map((item, index) => {
                        return {
                            ...item,
                            index: index + 1
                        }
                    })
                    this.setState({
                        tableData: arr,
                        total: arr.length,
                        cycleType,
                        machineId,
                        receiverId,
                        speed,
                        machineNo,
                        pointId,
                        detectorId,
                        startTime: msg.startTime,
                        endTime: msg.endTime,
                        judgeType: msg.judgeType,
                        qualityId: msg.qualityId,
                        recordId: msg.recordId
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    findMaxMinFrequencyList = () => {
        dbMaxAll = [];
        dbMinAll = [];
        densityMaxAll = [];
        densityMinAll = [];
        const { receiverId, selectedRows } = this.state;
        let recordIdList = [];

        if (selectedRows.length == 0) {
            message.error('还未选择任何数据！')
            return false;
        }
        for (let i = 0; i < selectedRows.length; i++) {
            recordIdList.push(selectedRows[i].id)
        }
        this.setState({
            allCaculteData: selectedRows
        })

        let params = {
            receiverId,
            recordIdList
        }
        service.findMaxMinFrequencyList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    this.setState({
                        standardfrequencyList: res.ret || [],
                    })
                    let arr = res.ret;
                    dbMaxAll = [];
                    dbMinAll = [];
                    densityMaxAll = [];
                    densityMinAll = [];
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].dbMax == 0) {
                            dbMaxAll.push(undefined);
                        } else {
                            dbMaxAll.push(arr[i].dbMax.toFixed(5));
                        }
                        if (arr[i].dbMin == 0) {
                            dbMinAll.push(undefined);
                        } else {
                            dbMinAll.push(arr[i].dbMin.toFixed(5));
                        }
                        densityMinAll.push(arr[i].densityMin.toFixed(3));
                        densityMaxAll.push(arr[i].densityMax.toFixed(3));
                    }
                }
            } else {
                message.error(res.err);
            }
        })

    }
    lookEcharts = () => {
        const { detailDtoList } = this.state;
        let recordIdList = [];
        // 1.全选，2全不选
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        this.getSingle(recordIdList);
    }
    switchAllChange = (e) => {
        this.setState({
            switchAllShow: e
        }, () => {
            this.findMaxMinFrequencyList();
        })
    }
    lookAllData = () => {
        this.setState({
            allDataVisible: true
        })
    }
    // ============================周期开始===========================
    onSelectChangeCycle = (selectedRowKeys, selectedRows) => {
        let avgCycle = 0;
        let avgDb = 0;
        let avgFrequency = 0;
        let avgDegree = 0;
        let totalCycle = 0;
        let totalDb = 0;
        let totalFrequency = 0;
        let totalDegree = 0;
        if (selectedRowKeys.length) {
            for (let i = 0; i < selectedRows.length; i++) {
                totalCycle += Number(selectedRows[i].period);
                totalDb += Number(selectedRows[i].db);
                totalFrequency += Number(selectedRows[i].frequency);
                totalDegree += Number(selectedRows[i].matchDegree);
            }
            let len = selectedRows.length;
            avgCycle = Number(totalCycle / len).toFixed(2);
            avgDb = Number(totalDb / len).toFixed(5);
            avgFrequency = Number(totalFrequency / len).toFixed(2);
            avgDegree = Number(totalDegree / len).toFixed(2);
        }
        this.setState({
            avgCycle,
            avgDb,
            avgDegree,
            avgFrequency,
            selectedRowKeysCycle: selectedRowKeys
        })


    }
    saveCycle = () => {
        const { avgCycle, avgDb, avgDegree, avgFrequency, standardCycleList } = this.state;
        let arr = standardCycleList;
        this.setState({
            loading: true,
        })

        arr.push({
            cycle: avgCycle,
            db: avgDb,
            degree: avgDegree,
            frequency: avgFrequency
        })
        this.setState({
            standardCycleList: arr,
            avgCycle: 0,
            avgDb: 0,
            avgDegree: 0,
            avgFrequency: 0
        })
        setTimeout(() => {
            this.setState({
                selectedRowKeysCycle: [],
                loading: false,
            });
        }, 1000);

    }
    deleteCycle = (record, index) => {
        const { standardCycleList } = this.state;
        let arr = [...standardCycleList];
        arr.splice(index, 1);
        this.setState({
            standardCycleList: arr
        })
    }
    // ================================周期结束================================================
    chooseBox = (type) => {
        const { tableData } = this.state;
        let detailDtoList = [];
        let recordIdList = [];
        let selectedRowKeys = [];
        // 1.全选，2全不选
        for (let i = 0; i < tableData.length; i++) {
            selectedRowKeys.push(tableData[i].id);
            detailDtoList.push({
                groupId: tableData[i].groupId,
                recordId: tableData[i].id,
                receiverId: tableData[i].receiverId
            })
            recordIdList.push(tableData[i].id)
        }
        if (type == 1) {
            this.setState({
                selectedRowKeys,
                detailDtoList,
                selectedRows: tableData,
            })
        } else {
            this.setState({
                selectedRowKeys: [],
                detailDtoList: [],
                allCaculteData: []
            })
            singleTotalArr = [];
        }
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let detailDtoList = [];
        for (let i = 0; i < selectedRows.length; i++) {
            detailDtoList.push({
                groupId: selectedRows[i].groupId,
                recordId: selectedRows[i].id,
                receiverId: selectedRows[i].receiverId
            })
        }
        this.setState({
            selectedRowKeys,
            selectedRows,
            detailDtoList
        })
    }
    onSelectChangeAll = (selectedRowKeys, selectedRows) => {
        // console.log(selectedRowKeys,selectedRows)
        this.setState({
            selectedRowKeysAll: selectedRowKeys,
            allCaculteDataChecked: selectedRows,
        })
    }

    removeDuplicates(arr) {
        return arr.filter((item, index) => {
            return arr.indexOf(item) === index;
        });
    }

    // // 示例用法
    // const originalArray = [1, 2, 2, 3, 4, 4, 5];
    // const uniqueArray = removeDuplicates(originalArray);
    // console.log(uniqueArray); // 输出 [1, 2, 3, 4, 5]

    getSingle = (recordIdList) => {
        let recordIdListArr = [];
        const { switchAllShow, allCaculteData, selectedRows, allCaculteDataChecked } = this.state;
        if (switchAllShow) {
            let result = this.findDifferentIds(selectedRows, allCaculteData);
            let newArr = result.concat(allCaculteDataChecked);
            for (let i = 0; i < newArr.length; i++) {
                recordIdListArr.push(newArr[i].id)
            }
        } else {
            recordIdListArr = recordIdList;
        }

        this.setState({
            standardLineVisible: false
        })
        singleTotalArr = [];
        let cycleList = [];
        const { receiverId } = this.state;
        // console.log(recordIdListArr,'000')
        let params = {
            receiverId,
            recordIdList: this.removeDuplicates(recordIdListArr)
        }
        if (recordIdListArr.length) {
            service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    singleTotalArr = [];
                    let ret = res.ret.responseList || [];
                    let freqs = res.ret.freqs || [];
                    XARR = freqs.map(item => (item.toFixed(0)));
                    for (let i = 0; i < ret.length; i++) {
                        cycleList = cycleList.concat(ret[i].cycleList || []);
                        let dbArray = ret[i].dbArray || [];
                        let densityArray = ret[i].densityArray || [];
                        singleTotalArr.push({
                            id: ret[i].recordId,
                            detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                            machineNo: ret[i].machineNo || '',
                            densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                            dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(5)))
                        })
                    }
                    this.setState({
                        cycleList
                    })
                    this.dealEcharts();
                } else {
                    message.error(res.err);
                }
            })
        } else {
            this.dealEcharts();
        }


    }

    dealEcharts = () => {
        this.disposeEcharts();
        const { AvgLineShow } = this.state;
        if (AvgLineShow) {
            this.dealLine();
        }
        let that = this;
        setTimeout(() => {
            that.drawEcharts()
        }, 1000)

    }

    drawEcharts = () => {
        let dbMinAllEcharts = [];
        let dbMaxAllEcharts = [];
        let densityMinAllEcharts = [];
        let densityMaxAllEcharts = [];
        const { switchAllShow, AvgLineShow } = this.state;
        if (switchAllShow) {
            dbMaxAllEcharts.push({
                name: '所选数据---上限',
                type: 'line',
                data: dbMaxAll,
                lineStyle: {
                    width: 4,
                    type: 'dotted'
                },
            })
            dbMinAllEcharts.push({
                name: '所选数据---下限',
                type: 'line',
                data: dbMinAll,
                lineStyle: {
                    width: 4,
                    type: 'dotted'
                },
            })
            densityMaxAllEcharts.push({
                name: '所选数据---上限',
                type: 'line',
                data: densityMaxAll,
                lineStyle: {
                    width: 4,
                    type: 'dotted'
                },
            })
            densityMinAllEcharts.push({
                name: '所选数据---下限',
                type: 'line',
                data: densityMinAll,
                lineStyle: {
                    width: 4,
                    type: 'dotted'
                },
            })
        } else {
            dbMinAllEcharts = [];
            dbMaxAllEcharts = [];
            densityMinAllEcharts = [];
            densityMaxAllEcharts = [];
        }

        let totaldbArr = [];
        let totaldensityArr = [];
        for (let j = 0; j < singleTotalArr.length; j++) {
            totaldbArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                data: singleTotalArr[j].dbArr
            })
            totaldensityArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                data: singleTotalArr[j].densityArr
            })
        }
        finallydbArr = [];
        finallydensityArr = [];

        let that = this;
        setTimeout(() => {
            let endDbArr = [...avgDbArr, ...totaldbArr, ...dbMaxAllEcharts, ...dbMinAllEcharts];
            let endDensityArr = [...avgDensityArr, ...totaldensityArr, ...densityMaxAllEcharts, ...densityMinAllEcharts];

            let QualityDbArr = [...qualityDbArr, ...qualityDbLowArr, ...positiveDbMax, ...positiveDbMin, ...negativeDbMin, ...negativeDbMax, ...CompareDbDown, ...CompareDbUp, ...CompareDbLowDown, ...CompareDbLowUp, ...LineDbDown, ...LineDbUP, ...LineDbLowUP, ...LineDbLowDown];
            let QualityDensityArr = [...qualityDensityArr, ...qualityDensityLowArr, ...positiveDensityMax, ...positiveDensityMin, ...negativeDensityMin, ...negativeDensityMax, ...CompareDensityDown, ...CompareDensityUp, ...CompareDensityLowUp, ...CompareDensityLowDown, ...LineDensityDown, ...LineDensityUP, ...LineDensityLowUP, ...LineDensityLowDown];

            if (that.state.AvgLineShow) {
                finallydbArr = endDbArr.concat(QualityDbArr);
                finallydensityArr = endDensityArr.concat(QualityDensityArr);
            } else {
                finallydbArr = endDbArr;
                finallydensityArr = endDensityArr;
            }
            if (that.echartsBoxDb) {
                if (myEchartsDb == null) {
                    myEchartsDb = echarts.init(that.echartsBoxDb);
                }
                if (myEchartsDb) {
                    let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                    optionDb.xAxis[0].data = XARR || [];
                    optionDb.series = finallydbArr || [];
                    myEchartsDb.setOption(optionDb);
                    myEchartsDb.on('click', function (params) {
                        if (params.componentType === 'series') {
                            const seriesName = params.seriesName;
                            const dataIndex = params.dataIndex;
                            const seriesIndex = params.seriesIndex;
                            that.echartsClick(dataIndex, params.name, 'db')
                        }
                    });
                }
            }

            if (that.echartsBoxDensity) {
                if (myEchartsDensity == null) {
                    myEchartsDensity = echarts.init(that.echartsBoxDensity);
                }
                if (myEchartsDensity) {
                    let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                    optionDensity.xAxis[0].data = XARR || [];
                    optionDensity.series = finallydensityArr || [];
                    myEchartsDensity.setOption(optionDensity);
                    myEchartsDensity.on('click', function (params) {
                        if (params.componentType === 'series') {
                            const seriesName = params.seriesName;
                            const dataIndex = params.dataIndex;
                            const seriesIndex = params.seriesIndex;
                            that.echartsClick(dataIndex, params.name, 'density')
                        }
                    });
                }
            }

            // ========== 新增：ECharts 联动缩放逻辑 ==========
            // 先解除之前的联动（防止重复绑定）
            if (typeof removeEchartsSync === 'function') {
                removeEchartsSync();
            }
            // 绑定联动（传入能量和密度两个ECharts实例）
            if (myEchartsDb && myEchartsDensity) {
                removeEchartsSync = syncEchartsZoom(myEchartsDb, myEchartsDensity);
            }

        }, 500);
    }
    // 处理echarts图数据
    echartsClick = (dataIndex, seriesName, type) => {
        // 1. 清空原有表格数据，新增趋势图数据组装
        const trendData = [];
        // 2. 遍历所有曲线数据，提取「时间+对应dB值/密度值」
        for (let i = 0; i < finallydbArr.length; i++) {
            // 从曲线名称中提取时间（原有名称格式："2026-01-19 10:00:00_机型XXX"）
            const name = finallydbArr[i].name || '';
            const timeStr = name.split('_')[0]; // 截取时间部分
            const dbValue = finallydbArr[i].data[dataIndex]; // 当前频率的dB值
            const densityValue = finallydensityArr[i]?.data[dataIndex]; // 当前频率的密度值

            if (timeStr && (dbValue !== undefined || densityValue !== undefined)) {
                trendData.push({
                    time: timeStr, // X轴：时间
                    db: Number(dbValue), // Y轴：dB值
                    density: Number(densityValue), // Y轴：密度值
                    name: name // 保留原始名称（可选）
                });
            }
        }

        // 3. 按时间排序（保证X轴顺序）
        trendData.sort((a, b) => new Date(a.time) - new Date(b.time));

        // 4. 更新state，显示弹窗
        this.setState({
            clickChartVisible: true,
            clickTrendData: trendData, // 趋势图数据
            selectedFreq: seriesName, // 选中的频率值（用于弹窗标题）
            clickTrendDimension: 'db' // 默认展示能量
        }, () => {
            // 5. 弹窗渲染后，初始化趋势图
            this.initClickTrendChart();
        });
    }

    switchTrendDimension = () => {
        this.setState(
            prevState => ({
                clickTrendDimension: prevState.clickTrendDimension === 'db' ? 'density' : 'db'
            }),
            () => {
                // 重新渲染图表
                this.initClickTrendChart();
            }
        );
    }

    initClickTrendChart = () => {
        // 销毁原有实例
        if (this.myEchartsClickTrend) {
            this.myEchartsClickTrend.dispose();
            this.myEchartsClickTrend = null;
        }

        const chartDom = this.echartsBoxClickTrend;
        if (!chartDom) return;

        this.myEchartsClickTrend = echarts.init(chartDom);
        const { clickTrendData, selectedFreq, clickTrendDimension } = this.state;

        // 步骤1：预处理数据 - 根据维度选择对应数值
        const xAxisLabels = clickTrendData.map(item =>
            moment(item.time).format('YYYY-MM-DD HH:mm')
        );

        const seriesData = clickTrendData.map((item, index) => {
            const value = clickTrendDimension === 'db' ? item.db : item.density;
            return [index, value];
        });

        let yMin = undefined;
        let yMax = undefined;
        if (clickTrendDimension === 'db') {
            const yValues = seriesData.map(item => item[1]).filter(v => !isNaN(v));
            yMin = 0
            yMax = yValues.length ? Math.ceil(Math.max(...yValues) / 10) * 10 : 100; // 向上取整到10的倍数
        }

        // 配置项根据维度切换
        const yAxisConfig = {
            db: {
                name: '能量(dB)',
                formatter: (value) => Number(value).toFixed(5) + 'dB'
            },
            density: {
                name: '密度(%)',
                formatter: (value) => Number(value).toFixed(3) + '%'
            }
        };

        const option = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#333',
                        color: '#fff'
                    },
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    }
                },
                formatter: (params) => {
                    const item = params[0];
                    const originalTime = clickTrendData[item.data[0]].time;
                    const time = moment(originalTime).format('YYYY-MM-DD HH:mm:ss');
                    const value = clickTrendDimension === 'db'
                        ? Number(item.data[1]).toFixed(5) + 'dB'
                        : Number(item.data[1]).toFixed(3) + '%';
                    const label = clickTrendDimension === 'db' ? '能量' : '密度';
                    return `${time}<br/>${label}：${value}`;
                }
            },
            dataZoom: [
                {
                    type: 'slider',
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    bottom: 10,
                    zoomLock: false,
                },
                {
                    type: 'inside',
                    xAxisIndex: 0,
                    zoomOnMouseWheel: true,
                    moveOnMouseMove: true,
                }
            ],
            xAxis: {
                type: 'category',
                name: '时间',
                nameLocation: 'end',
                nameGap: 15,
                data: xAxisLabels,
                axisLabel: {
                    formatter: (value) => value,
                    rotate: 45,
                    margin: 15,
                    interval: (index) => {
                        return index % 2 === 0;
                    },
                    showMaxLabel: true,
                    showMinLabel: true,
                },
                boundaryGap: false,
                axisTick: {
                    interval: (index) => index % 2 === 0
                },
                axisPointer: {
                    type: 'line'
                }
            },
            yAxis: {
                type: 'value',
                name: yAxisConfig[clickTrendDimension].name,
                nameLocation: 'end',
                nameGap: 20,
                nameTextStyle: { align: 'right' },
                min: clickTrendDimension === 'db' ? yMin : undefined,
                max: clickTrendDimension === 'db' ? yMax : undefined,
                interval: clickTrendDimension === 'db' ? 40 : undefined,
                minInterval: clickTrendDimension === 'db' ? 40 : undefined,
                axisLabel: {
                    formatter: (value) => {
                        return clickTrendDimension === 'db'
                            ? value.toFixed(0)
                            : value.toFixed(3);
                    }
                },
                axisPointer: {
                    type: 'line'
                }
            },
            series: [
                {
                    name: yAxisConfig[clickTrendDimension].name,
                    type: 'line',
                    data: seriesData,
                    smooth: true,
                    itemStyle: { color: '#1890ff' },
                    sampling: 'none',
                    symbolSize: 2,
                }
            ],
            grid: {
                top: '15%',
                right: '8%',
                bottom: '20%',
                left: '8%'
            }
        };

        this.myEchartsClickTrend.setOption(option);

        const resizeObserver = new ResizeObserver(() => {
            this.myEchartsClickTrend?.resize();
        });
        resizeObserver.observe(chartDom);

        window.addEventListener('resize', () => {
            this.myEchartsClickTrend?.resize();
        });
    }

    compareEchartsClick = (property) => {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];

            return value2 - value1;
        }
    }
    // 全屏查看
    lookFullScreen = (type) => {
        this.setState({
            fullScreenVisible: true,
        }, () => {
            if (type == 1) {
                // 能量频率曲线
                if (this.echartsBoxFullScreen) {
                    if (myEchartsFullScreen == null) {
                        myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                    }
                    if (myEchartsFullScreen) {
                        let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                        optionDb.xAxis[0].data = XARR || [];
                        optionDb.series = finallydbArr || [];
                        myEchartsFullScreen.setOption(optionDb)
                        //  myEchartsFullScreen.on('finished', () => {
                        //      if (myEchartsFullScreen) {
                        //          myEchartsFullScreen.resize()
                        //      }

                        //  })
                    }
                }
            } else {
                // 密度频率曲线
                if (this.echartsBoxFullScreen) {
                    if (myEchartsFullScreen == null) {
                        myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                    }
                    if (myEchartsFullScreen) {
                        let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                        optionDensity.xAxis[0].data = XARR || [];
                        optionDensity.series = finallydensityArr || [];
                        myEchartsFullScreen.setOption(optionDensity)
                        //  myEchartsFullScreen.on('finished', () => {
                        //      if (myEchartsFullScreen) {
                        //          myEchartsFullScreen.resize()
                        //      }

                        //  })
                    }
                }
            }
        })

    }

    // 得到频段的设置值
    getFreqSet = (msg, result) => {
        // console.log(result, '频段')
        const { AvgLineShow } = this.state;
        this.setState({
            standardFrequencyDtoList: result,
        }, () => {
            if (AvgLineShow) {
                this.dealEcharts()
            }
        })

    }
    getCycleSet = (msg, result) => {
        // console.log(result, '周期')
        this.setState({
            standardCycleDtoList: result
        })
    }
    getDeviationSet = (msg, result) => {
        // console.log(result, '偏离度')
        this.setState({
            standardDeviationGroupDtoList: result
        })
    }
    getSuddenSet = (msg, result) => {
        // console.log(result,'突发声音')
        this.setState({
            suddenInfo: {
                ...result
            }
        }, () => {
            this.saveStandardLine(3)
        })
    }
    getPartitionSet = (msg, result) => {
        // console.log(result,'分区声音')
        this.setState({
            standardPartitionDtoList: result
        })
    }
    getCyclePointSet = (msg, result, resultSingle) => {
        const { pointId } = this.state;
        if (result.length || resultSingle.length) {
            let arr = [{
                detailDtoList: resultSingle,
                pointId,
                type: 1
            }]
            this.setState({
                sameGroupDtoList: result.concat(arr),
            })
        }

    }
    // 获得对比频段的设置
    getCompareSet = (msg, result) => {
        const { AvgLineShow } = this.state;
        this.setState({
            multiFreqStandardGroupDtoList: result,
        }, () => {
            if (AvgLineShow) {
                this.dealEcharts()
            }
        })
    }
    // 直线频段品质等级
    getLineSet = (msg, result) => {
        const { AvgLineShow } = this.state;
        this.setState({
            multiAbsFreqStandardGroupDtoList: result,
        }, () => {
            if (AvgLineShow) {
                this.dealEcharts()
            }
        })
    }
    // 保存
    saveStandardLine = (type) => {
        const { cycleType, machineId, receiverId, speed, detailDtoList, db, density, name,
            precision, standardfrequencyList, machineNo, standardCycleList,
            pointId,
            detectorId,
            standardFrequencyDtoList, sameGroupDtoList, multiFreqStandardGroupDtoList, multiAbsFreqStandardGroupDtoList,
            standardCycleDtoList, standardDeviationGroupDtoList, cycleName, deviationName, suddenInfo, partitionName
            , standardPartitionDtoList, code, pointCycleName
        } = this.state;
        let params = {
            cycleType,
            detailDtoList,
            machineId,
            receiverId,
            speed,
            tenantId,
            machineNo,
            pointId,
            detectorId,
        };
        if (pointId == '' || machineId == '') {
            message.error('上方搜索部分,机型、点位等还未选择！')
            return false
        }
        if (type == 0 || type == 1 || type == 2) {
            if (detailDtoList.length == 0) {
                message.error('还未勾选下方列表任何数据！')
                return false
            }
        }
        let typeparams = {};
        if (type == 0) {
            if (name == '') {
                message.error('请检查曲线名称是否填写')
                return false
            }
            let obj = {

            }
            let ifShow = false;
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    // 判断属性值是否为空
                    if (obj[key] === '' || obj[key] === null) {
                        ifShow = true;
                    }
                }
            }
            if (ifShow) {
                if (standardFrequencyDtoList.length == 0) {
                    message.error('请检查品质等级是否设置！！')
                    return false;
                }
            }
            typeparams = {
                name,
                standardFrequencyDtoList,
                multiFreqStandardGroupDtoList,
                multiAbsFreqStandardGroupDtoList,
            }
        }
        if (type == 1) {
            if (cycleName == '' || standardCycleDtoList.length == 0) {
                message.error('请检查输入框内容是否填写完整,品质等级是否设置！')
                return false
            }
            typeparams = {
                name: cycleName,
                precision,
                cycleDtoList: standardCycleList,
                standardCycleDtoList
            }
        }

        if (type == 2) {
            if (deviationName == '' || standardDeviationGroupDtoList.length == 0) {
                message.error('请检查输入框内容是否填写完整,品质等级是否设置！')
                return false
            }
            typeparams = {
                name: deviationName,
                standardDeviationGroupDtoList
            }
        }
        if (type == 3) {
            typeparams = {
                ...suddenInfo
            }
        }
        if (type == 4) {
            if (partitionName == '' || standardPartitionDtoList.length == 0) {
                message.error('请检查输入框内容是否填写完整,品质等级是否设置！')
                return false
            }
            typeparams = {
                name: partitionName,
                code,
                standardPartitionDtoList
            }
        }
        if (type == 5) {
            if (pointCycleName == '' || sameGroupDtoList.length == 0) {
                message.error('请检查输入框内容是否填写完整,周期是否设置！')
                return false
            }
            for (let i = 0; i < sameGroupDtoList.length; i++) {
                let temp = sameGroupDtoList[i];
                if (temp.type == 0) {
                    if (temp.pointDtoList.length == 0) {
                        message.error('多点位不合格周期设置未选择点位！！')
                        return false;
                    }
                }
            }
            typeparams = {
                name: pointCycleName,
                sameGroupDtoList
            }
        }
        let mergedObject = Object.assign({}, params, typeparams);
        if (type == 0) {
            // 标准曲线
            service.submitFrequency(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('标准曲线声音保存成功')
                    this.setState({
                        standardfrequencyList: [],
                    })
                } else {
                    message.error(res.err);
                }
            })
        }
        if (type == 1) {
            // 标准周期
            service.submitCycle(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('标准周期声音保存成功')
                    this.setState({
                        selectedRowKeysCycle: [],
                        standardCycleList: [],
                    })
                } else {
                    message.error(res.err);
                }
            })
        }
        if (type == 2) {
            // 标准声音
            service.submitDeviation(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('标准声音保存成功')
                } else {
                    message.error(res.err);
                }
            })
        }
        if (type == 3) {
            // 突发声音
            service.submitSudden(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('突发声音保存成功')
                } else {
                    message.error(res.err);
                }
            })
        }
        if (type == 4) {
            // 分区声音
            service.submitPartition(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('分区声音保存成功')
                } else {
                    message.error(res.err);
                }
            })
        }
        if (type == 5) {
            // 点位周期管理
            service.submitPointCycle(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('点位不合格周期声音保存成功')
                } else {
                    message.error(res.err);
                }
            })
        }
    }

    methodChange = (e) => {
        this.setState({
            code: e
        })
    }
    // 播放声音
    playAudio = (record, index) => {
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
        this.setState({
            filePath
        })
    }
    // 查看某条记录的频率数据图
    lookData = (record, index) => {
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
        this.setState({
            singleDataVisible: true
        })
        let params = {
            recordId: record.id,
            receiverId: record.receiverId
        }
        service.getSingleDataLine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let data = res.ret.frequencyDtoList || [];
                    let xArr = [];
                    let densityArr = [];
                    let dbArr = [];
                    for (let i = 0; i < data.length; i++) {
                        xArr.push(Math.sqrt(Number(data[i].freq1) * Number(data[i].freq2)).toFixed(0));
                        densityArr.push(Number(data[i].density.toFixed(3)));
                        if (data[i].db == 0) {
                            dbArr.push(undefined);
                        } else {
                            dbArr.push(data[i].db.toFixed(5));
                        }
                    }
                    if (this.echartsBoxSingle) {
                        if (myEchartsSingle == null) {
                            myEchartsSingle = echarts.init(this.echartsBoxSingle);
                        }
                        if (myEchartsSingle) {
                            let optionSingle = JSON.parse(JSON.stringify(echartsOption.optionSingle));
                            optionSingle.xAxis[0].data = xArr || [];
                            optionSingle.series[0].data = dbArr || [];
                            optionSingle.series[1].data = densityArr || [];
                            myEchartsSingle.setOption(optionSingle)
                            //  myEchartsSingle.on('finished', () => {
                            //      if (myEchartsSingle) {
                            //          myEchartsSingle.resize()
                            //      }

                            //  })
                        }
                    }

                }

            } else {
                message.error(res.err);
            }
        })
    }

    // 分区声音比对
    partCompareData = (record, index) => {
        const { pointId } = this.state;
        this.setState({
            partCompareVisible: true
        })
        let params = {
            recordId: record.id,
            pointId
        }
        service.comparePartition(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    this.setState({
                        partCompareList: res.ret || [],
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    callback = (key) => {
        const { detailDtoList } = this.state;
        if (key == 1 || key == 2 || key == 3) {
            if (detailDtoList.length == 0) {
                message.info('提示：如需要保存此栏目请先勾选下方数据！')
            }
        }
    }
    // ================================================展示包络线========================
    showAvgLine = (e) => {
        this.setState({
            AvgLineShow: e
        }, () => {
            this.dealEcharts()
        })
    }
    dealLine = () => {
        const { standardFrequencyDtoList, standardfrequencyList, multiFreqStandardGroupDtoList, multiAbsFreqStandardGroupDtoList } = this.state;
        if (standardfrequencyList.length) {
            for (let i = 0; i < standardfrequencyList.length; i++) {
                let temp = standardfrequencyList[i];
                freq1Arr.push(temp.freq1);
                freq2Arr.push(temp.freq2);
            }
        }
        qualityDbArr = [];
        qualityDensityArr = [];
        qualityDbLowArr = [];
        qualityDensityLowArr = [];

        positiveDbMin = [];
        positiveDbMax = [];

        negativeDbMin = [];
        negativeDbMax = [];

        positiveDensityMin = [];
        positiveDensityMax = [];

        negativeDensityMin = [];
        negativeDensityMax = [];

        CompareDbUp = [];
        CompareDbDown = [];
        CompareDbLowUp = [];
        CompareDbLowDown = [];
        CompareDensityUp = [];
        CompareDensityDown = [];
        CompareDensityLowUp = [];
        CompareDensityLowDown = [];

        LineDbUP = [];
        LineDbDown = [];
        LineDbLowUP = [];
        LineDbLowDown = [];
        LineDensityUP = [];
        LineDensityDown = [];
        LineDensityLowUP = [];
        LineDensityLowDown = [];

        let arr = [...standardFrequencyDtoList];
        if (arr.length) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr[i].detailDtoList.length; j++) {
                    this.dealAvgLine(arr[i].startFrequency, arr[i].endFrequency, arr[i].detailDtoList[j])
                }
                for (let k = 0; k < arr[i].detailSpecialDtoList.length; k++) {
                    this.dealAvgLineSpecial(arr[i].startFrequency, arr[i].endFrequency, arr[i].detailSpecialDtoList[k])
                }
            }
        }


        // 多频段对比
        let tempArr = [...multiFreqStandardGroupDtoList];
        if (tempArr.length) {
            for (let i = 0; i < tempArr.length; i++) {
                for (let j = 0; j < tempArr[i].detailDtoList.length; j++) {
                    this.dealCompareLine(tempArr[i].detailDtoList[j].freq1, tempArr[i].detailDtoList[j].freq2, tempArr[i].detailDtoList[j].itemDtoList, tempArr[i].qualityName, tempArr[i].color)
                }
            }
        }

        // 直线频段等级设置
        let tempArr1 = [...multiAbsFreqStandardGroupDtoList];
        if (tempArr1.length) {
            for (let i = 0; i < tempArr1.length; i++) {
                for (let j = 0; j < tempArr1[i].detailDtoList.length; j++) {
                    let temp = tempArr1[i].detailDtoList[j];
                    this.dealFreqLine(temp.freq1, temp.freq2, temp.itemDtoList, tempArr1[i].qualityName, tempArr1[i].color)
                }
            }
        }

    }
    // 处理特殊品质等级
    dealAvgLineSpecial = (startFrequency, endFrequency, tempObj) => {
        const { standardfrequencyList } = this.state;
        let k = 0;
        let m = 0;
        let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
        let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
        for (let i = 0; i < standardfrequencyList.length; i++) {
            let temp = standardfrequencyList[i];
            if (freq1 == temp.freq1) {
                k = i;
            }
            if (freq2 == temp.freq2) {
                m = i;
            }
        }
        let tempStandArr = [...standardfrequencyList];

        let name = '';
        let color = '';
        for (let i = 0; i < tempStandArr.length; i++) {
            if (k < i && i < m) {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbForwardMinValue: tempObj.dbForwardMinValue ? Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardMinValue) : undefined,
                    dbForwardMaxValue: tempObj.dbForwardMaxValue ? Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardMaxValue) : undefined,

                    dbReverseMinValue: tempObj.dbReverseMinValue ? Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseMinValue) : undefined,
                    dbReverseMaxValue: tempObj.dbReverseMaxValue ? Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseMaxValue) : undefined,

                    densityForwardMinValue: tempObj.densityForwardMinValue ? Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardMinValue) : undefined,
                    densityForwardMaxValue: tempObj.densityForwardMaxValue ? Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardMaxValue) : undefined,

                    densityReverseMinValue: tempObj.densityReverseMinValue ? Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseMinValue) : undefined,
                    densityReverseMaxValue: tempObj.densityReverseMaxValue ? Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseMaxValue) : undefined,

                    color: tempObj.color,
                    name: tempObj.name
                }
                name = tempObj.name;
                color = tempObj.color;
            } else {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbForwardMinValue: undefined,
                    dbForwardMaxValue: undefined,

                    dbReverseMinValue: undefined,
                    dbReverseMaxValue: undefined,

                    densityForwardMinValue: undefined,
                    densityForwardMaxValue: undefined,

                    densityReverseMinValue: undefined,
                    densityReverseMaxValue: undefined,
                    color: tempObj.color,
                    name: tempObj.name
                }
            }

        }

        positiveDbMin = positiveDbMin.concat(
            [
                {
                    name: name + '--能量正偏离下限特殊',
                    type: 'line',
                    data: (tempStandArr).map(item => item.dbForwardMinValue || undefined),
                    itemStyle: {
                        borderWidth: 3,
                        borderColor: color,
                        color: color
                    },
                    lineStyle: {
                        color: color,
                        width: 2,
                        type: 'solid'
                    },
                }
            ]
        )

        positiveDbMax = positiveDbMax.concat(
            [{
                name: name + '--能量正偏离上限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.dbForwardMaxValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )

        negativeDbMin = negativeDbMin.concat(
            [{
                name: name + '--能量负偏离下限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.dbReverseMinValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )

        negativeDbMax = negativeDbMax.concat(
            [{
                name: name + '--能量负偏离上限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.dbReverseMaxValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )

        positiveDensityMin = positiveDensityMin.concat(
            [{
                name: name + '--密度正偏离下限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.densityForwardMinValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )

        positiveDensityMax = positiveDensityMax.concat(
            [{
                name: name + '--密度正偏离上限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.densityForwardMaxValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )

        negativeDensityMin = negativeDensityMin.concat(
            [{
                name: name + '--密度负偏离下限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.densityReverseMinValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )

        negativeDensityMax = negativeDensityMax.concat(
            [{
                name: name + '--密度负偏离上限特殊',
                type: 'line',
                data: (tempStandArr).map(item => item.densityReverseMaxValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'solid'
                },
            }]
        )


    }

    // 处理品质等级
    dealAvgLine = (startFrequency, endFrequency, tempObj) => {
        const { standardFrequencyDtoList, standardfrequencyList } = this.state;
        let k = 0;
        let m = 0;
        let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
        let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
        for (let i = 0; i < standardfrequencyList.length; i++) {
            let temp = standardfrequencyList[i];
            if (freq1 == temp.freq1) {
                k = i;
            }
            if (freq2 == temp.freq2) {
                m = i;
            }
        }
        let tempStandArr = [...standardfrequencyList];

        let name = '';
        let color = '';
        for (let i = 0; i < tempStandArr.length; i++) {
            if (k < i && i < m) {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbForwardValue: Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardValue),
                    dbReverseValue: Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseValue),
                    densityForwardValue: Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardValue),
                    densityReverseValue: Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseValue),
                    color: tempObj.color,
                    name: tempObj.name
                }
                name = tempObj.name;
                color = tempObj.color;
            } else {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbForwardValue: undefined,
                    dbReverseValue: undefined,
                    densityForwardValue: undefined,
                    densityReverseValue: undefined,
                    color: tempObj.color,
                    name: tempObj.name
                }
            }

        }
        qualityDbArr = qualityDbArr.concat(
            [
                {
                    name: name + '--能量正偏离',
                    type: 'line',
                    data: (tempStandArr).map(item => item.dbForwardValue || undefined),
                    itemStyle: {
                        borderWidth: 3,
                        borderColor: color,
                        color: color
                    },
                    lineStyle: {
                        color: color,
                        width: 2,
                        type: 'dashed'
                    },
                }
            ]
        )
        qualityDbLowArr = qualityDbLowArr.concat([
            {
                name: name + '--能量负偏离',
                type: 'line',
                data: (tempStandArr).map(item => item.dbReverseValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'dashed'
                },
            }
        ])
        qualityDensityArr = qualityDensityArr.concat([
            {
                name: name + '--密度正偏离',
                type: 'line',
                data: (tempStandArr).map(item => item.densityForwardValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'dashed'
                },
            }
        ])
        qualityDensityLowArr = qualityDensityLowArr.concat([
            {
                name: name + '--密度负偏离',
                type: 'line',
                data: (tempStandArr).map(item => item.densityReverseValue || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'dashed'
                },
            }
        ])

    }

    // 多频段对比
    dealCompareLine = (startFrequency, endFrequency, itemDtoList, qualityName, qualityColor) => {
        let dbUp = '';
        let dbDown = '';
        let dbLowUp = '';
        let dbLowDown = '';
        let densityUp = '';
        let densityDown = '';
        let densityLowUp = '';
        let densityLowDown = '';

        let dbUpShow = false;
        let dbDownShow = false;
        let densityUpShow = false;
        let densityDownShow = false;

        for (let i = 0; i < itemDtoList.length; i++) {
            let temp = itemDtoList[i];
            if (temp.type == 0 && temp.numericalRange == 0) {
                // 能量正
                dbUp = temp.max;
                dbDown = temp.min;
                dbUpShow = true;
            }
            if (temp.type == 0 && temp.numericalRange == 1) {
                // 能量负
                dbLowUp = temp.max;
                dbLowDown = temp.min;
                dbDownShow = true;
            }
            if (temp.type == 1 && temp.numericalRange == 0) {
                // 密度正
                densityUp = temp.max;
                densityDown = temp.min;
                densityUpShow = true;
            }
            if (temp.type == 1 && temp.numericalRange == 1) {
                // 密度负
                densityLowUp = temp.max;
                densityLowDown = temp.min;
                densityDownShow = true;
            }
        }
        const {
            standardFrequencyDtoList,
            standardfrequencyList,
        } = this.state;
        let k = 0;
        let m = 0;
        let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
        let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
        for (let i = 0; i < standardfrequencyList.length; i++) {
            let temp = standardfrequencyList[i];
            if (freq1 == temp.freq1) {
                k = i;
            }
            if (freq2 == temp.freq2) {
                m = i;
            }
        }
        let tempStandArr = [...standardfrequencyList];
        let name = '';
        let color = '';
        for (let i = 0; i < tempStandArr.length; i++) {
            if (k < i && i < m) {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbUp: dbUpShow ? Number(tempStandArr[i].dbMax) + Number(dbUp) : undefined,
                    dbDown: dbUpShow ? Number(tempStandArr[i].dbMax) + Number(dbDown) : undefined,
                    dbLowUp: dbDownShow ? Number(tempStandArr[i].dbMin) - Number(dbLowUp) : undefined,
                    dbLowDown: dbDownShow ? Number(tempStandArr[i].dbMin) - Number(dbLowDown) : undefined,
                    densityUp: densityUpShow ? Number(tempStandArr[i].densityMax) + Number(densityUp) : undefined,
                    densityDown: densityUpShow ? Number(tempStandArr[i].densityMax) + Number(densityDown) : undefined,
                    densityLowUp: densityDownShow ? Number(tempStandArr[i].densityMin) - Number(densityLowUp) : undefined,
                    densityLowDown: densityDownShow ? Number(tempStandArr[i].densityMin) - Number(densityLowDown) : undefined,
                    color: qualityColor,
                    name: qualityName
                }
                name = qualityName;
                color = qualityColor;
            } else {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbUp: undefined,
                    dbDown: undefined,
                    dbLowUp: undefined,
                    dbLowDown: undefined,
                    densityUp: undefined,
                    densityDown: undefined,
                    densityLowUp: undefined,
                    densityLowDown: undefined,
                    color: qualityColor,
                    name: qualityName
                }
            }

        }
        CompareDbUp = CompareDbUp.concat(
            [{
                name: name + '--能量正偏离上限(多频段)',
                type: 'line',
                data: (tempStandArr).map(item => item.dbUp || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'dashed'
                },
            }]
        )
        CompareDbDown = CompareDbDown.concat(
            [{
                name: name + '--能量正偏离下限(多频段)',
                type: 'line',
                data: (tempStandArr).map(item => item.dbDown || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 2,
                    type: 'dashed'
                },
            }]
        )
        CompareDbLowUp = CompareDbLowUp.concat([{
            name: name + '--能量负偏离上限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.dbLowUp || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'dashed'
            },
        }])
        CompareDbLowDown = CompareDbLowDown.concat([{
            name: name + '--能量负偏离下限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.dbLowDown || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'dashed'
            },
        }])

        CompareDensityUp = CompareDensityUp.concat([{
            name: name + '--密度正偏离上限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityUp || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'dashed'
            },
        }])
        CompareDensityDown = CompareDensityDown.concat([{
            name: name + '--密度正偏离下限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityDown || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'dashed'
            },
        }])
        CompareDensityLowUp = CompareDensityLowUp.concat([{
            name: name + '--密度负偏离上限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityLowUp || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'dashed'
            },
        }])
        CompareDensityLowDown = CompareDensityLowDown.concat([{
            name: name + '--密度负偏离下限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityLowDown || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'dashed'
            },
        }])

    }

    // 直线频段等级设置
    dealFreqLine = (startFrequency, endFrequency, itemDtoList, qualityName, qualityColor) => {
        const {
            standardfrequencyList,
        } = this.state;
        let dbUp = '';
        let dbDown = '';
        let dbLowUp = '';
        let dbLowDown = '';
        let densityUp = '';
        let densityDown = '';
        let densityLowUp = '';
        let densityLowDown = '';

        let dbUpShow = false;
        let dbDownShow = false;
        let densityUpShow = false;
        let densityDownShow = false;

        for (let i = 0; i < itemDtoList.length; i++) {
            let temp = itemDtoList[i];
            if (temp.type == 0 && temp.numericalRange == 0) {
                // 能量正
                dbUp = temp.max;
                dbDown = temp.min;
                dbUpShow = true;
            }
            if (temp.type == 0 && temp.numericalRange == 1) {
                // 能量负
                dbLowUp = temp.max;
                dbLowDown = temp.min;
                dbDownShow = true;
            }
            if (temp.type == 1 && temp.numericalRange == 0) {
                // 密度正
                densityUp = temp.max;
                densityDown = temp.min;
                densityUpShow = true;
            }
            if (temp.type == 1 && temp.numericalRange == 1) {
                // 密度负
                densityLowUp = temp.max;
                densityLowDown = temp.min;
                densityDownShow = true;
            }
        }
        let k = 0;
        let m = 0;
        let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
        let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
        for (let i = 0; i < standardfrequencyList.length; i++) {
            let temp = standardfrequencyList[i];
            if (freq1 == temp.freq1) {
                k = i;
            }
            if (freq2 == temp.freq2) {
                m = i;
            }
        }
        let tempStandArr = [...standardfrequencyList];
        let name = '';
        let color = '';
        for (let i = 0; i < tempStandArr.length; i++) {
            if (k < i && i < m) {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbUp: dbUpShow ? Number(dbUp) : undefined,
                    dbDown: dbUpShow ? Number(dbDown) : undefined,
                    dbLowUp: dbDownShow ? Number(dbLowUp) : undefined,
                    dbLowDown: dbDownShow ? Number(dbLowDown) : undefined,
                    densityUp: densityUpShow ? Number(densityUp) : undefined,
                    densityDown: densityUpShow ? Number(densityDown) : undefined,
                    densityLowUp: densityDownShow ? Number(densityLowUp) : undefined,
                    densityLowDown: densityDownShow ? Number(densityLowDown) : undefined,
                    color: qualityColor,
                    name: qualityName
                }
                name = qualityName;
                color = qualityColor;
            } else {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbUp: undefined,
                    dbDown: undefined,
                    dbLowUp: undefined,
                    dbLowDown: undefined,
                    densityUp: undefined,
                    densityDown: undefined,
                    densityLowUp: undefined,
                    densityLowDown: undefined,
                    color: qualityColor,
                    name: qualityName
                }
            }

        }

        LineDbUP = LineDbUP.concat(
            [{
                name: name + '--能量正偏离上限(直线)',
                type: 'line',
                data: (tempStandArr).map(item => item.dbUp || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 3,
                    type: 'solid'
                },
            }]
        )
        LineDbDown = LineDbDown.concat(
            [{
                name: name + '--能量正偏离下限(直线)',
                type: 'line',
                data: (tempStandArr).map(item => item.dbDown || undefined),
                itemStyle: {
                    borderWidth: 3,
                    borderColor: color,
                    color: color
                },
                lineStyle: {
                    color: color,
                    width: 3,
                    type: 'solid'
                },
            }]
        )
        LineDbLowUP = LineDbLowUP.concat([{
            name: name + '--能量负偏离上限(直线)',
            type: 'line',
            data: (tempStandArr).map(item => item.dbLowUp || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 3,
                type: 'solid'
            },
        }])
        LineDbLowDown = LineDbLowDown.concat([{
            name: name + '--能量负偏离下限(直线)',
            type: 'line',
            data: (tempStandArr).map(item => item.dbLowDown || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 3,
                type: 'solid'
            },
        }])

        LineDensityUP = LineDensityUP.concat([{
            name: name + '--密度正偏离上限(直线)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityUp || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 3,
                type: 'solid'
            },
        }])
        LineDensityDown = LineDensityDown.concat([{
            name: name + '--密度正偏离下限(直线)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityDown || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 2,
                type: 'solid'
            },
        }])
        LineDensityLowUP = LineDensityLowUP.concat([{
            name: name + '--密度负偏离上限(直线)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityLowUp || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 3,
                type: 'solid'
            },
        }])
        LineDensityLowDown = LineDensityLowDown.concat([{
            name: name + '--密度负偏离下限(直线)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityLowDown || undefined),
            itemStyle: {
                borderWidth: 3,
                borderColor: color,
                color: color
            },
            lineStyle: {
                color: color,
                width: 3,
                type: 'solid'
            },
        }])
    }

    findClosestNumberInArray = (target, arr) => {
        // 先对数组进行排序
        arr.sort(function (a, b) {
            return a - b;
        });

        var minDiff = Infinity;
        var closest;

        // 遍历数组，找到与target差值最小的元素
        for (var i = 0; i < arr.length; i++) {
            var diff = Math.abs(arr[i] - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = arr[i];
            }
        }

        return closest;
    }
    // 去重
    findDifferentIds = (arr1, arr2) => {
        // 创建一个新的数组，用于存储不同的元素
        let newArray = [];

        // 遍历第一个数组
        for (let i = 0; i < arr1.length; i++) {
            let isIdExists = false;
            // 遍历第二个数组
            for (let j = 0; j < arr2.length; j++) {
                // 如果找到相同的 id，则设置 isIdExists 为 true
                if (arr1[i].id === arr2[j].id) {
                    isIdExists = true;
                    break;
                }
            }
            // 如果没有找到相同的 id，则将该元素添加到新数组中
            if (!isIdExists) {
                newArray.push(arr1[i]);
            }
        }

        // 遍历第二个数组
        for (let i = 0; i < arr2.length; i++) {
            let isIdExists = false;
            // 遍历第一个数组
            for (let j = 0; j < arr1.length; j++) {
                // 如果找到相同的 id，则设置 isIdExists 为 true
                if (arr2[i].id === arr1[j].id) {
                    isIdExists = true;
                    break;
                }
            }
            // 如果没有找到相同的 id，则将该元素添加到新数组中
            if (!isIdExists) {
                newArray.push(arr2[i]);
            }
        }

        // 返回新数组
        return newArray;
    }
    // ===================================包络线结束==============================
    downloadFlie = (record, index) => {
        message.success('开始下载文件...')
        const { id, receiverId } = record;
        const link = document.createElement('a');
        link.href = comm.audioUrl + '?recordId=' + id + '&receiverId=' + receiverId;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    downAudioFile = () => {
        const { detailDtoList } = this.state;
        let that = this;
        let arr = [];
        for (let i = 0; i < detailDtoList.length; i++) {
            arr.push({
                receiverId: detailDtoList[i].receiverId,
                recordId: detailDtoList[i].recordId
            })
        }
        message.success('开始下载...');
        this.setState({
            disabled: true
        })
        setTimeout(() => {
            this.setState({
                disabled: false
            });
        }, 3000);
        var url = `${hostIp}/jiepai/hardware/device/type/config/calculate/downloadZip`;
        fetch(url, {
            method: 'POST', // 请求类型为POST
            headers: {
                'Content-Type': 'application/json', // 设置请求头为JSON
            },
            body: JSON.stringify(arr), // 将JSON对象转换为字符串作为请求体
        })
            .then(response => {
                // console.log(response,'hhhh')
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.blob(); // 以blob形式获取数据
            })
            .then(blob => {

                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份是从0开始的
                const day = now.getDate().toString().padStart(2, '0');
                const hours = now.getHours().toString().padStart(2, '0');
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');

                let dateTimeString = `${year}${month}${day}${hours}${minutes}${seconds}`;


                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = dateTimeString + '.zip'; // 设置下载文件的默认名称
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url); // 释放URL对象
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
    lookTag = (record) => {
        let params = {
            calculateReceiverId: record.calculateReceiverId,
        }
        service2.getTag(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret.length) {
                    this.setState({
                        tagVisible: true,
                        content: res.ret
                    })
                } else {
                    message.error('无打标签内容！');
                }

            } else {
                message.error(res.err);
            }
        })
    }
    render() {
        const { content } = this.state;
        const tableStyle = {
            bordered: false,
            loading: false,
            pagination: {
                defaultPageSize: 30,
            },
            size: 'default',
            // rowSelection: {},
            scroll: undefined,
        }
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                title: '记录id',
                dataIndex: 'id',
            },
            {
                title: '检测时间',
                dataIndex: 'detectTime',
                render: (text, record, index) => (
                    <span>
                        {record.detectTime ? moment(record.detectTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                    </span>
                ),
            }, {
                title: '机型',
                dataIndex: 'machineTypeName',
            },
            {
                title: '采音时间(s)',
                dataIndex: 'listenTime',
            },

            {
                title: '设备编号',
                dataIndex: 'machineNo',
            },
            {
                title: '备注',
                dataIndex: 'remark',
            },
            {
                title: '听音器名称',
                dataIndex: 'detectorName',
            },
            {
                title: '听筒名称',
                dataIndex: 'receiverName',
            },
            {
                title: '转速',
                dataIndex: 'speed',
            },
            {
                title: '正反转',
                dataIndex: 'type',
                render: (text, record, index) => (
                    <span>
                        {record.type == 0 ? '正转' : '反转'}
                    </span>
                ),
            },

            {
                title: '点位名称',
                dataIndex: 'pointName',
            },
            {
                title: '品质等级',
                dataIndex: 'qualityName',
            },
            {
                title: '标签',
                dataIndex: 'judgeType',
                render: (text, record, index) => (
                    <span>
                        {record.judgeType == 1 ? '漏判' : (record.judgeType == 2 ? '误判' : '')}
                        <Button onClick={() => this.lookTag(record)}>查看标签</Button>
                    </span>
                ),
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record, index) => (
                    <span>
                        < Button type='primary' ghost onClick={() => this.lookData(record, index)}> 曲线图 </Button>
                        {/* < span className = "ant-divider" />
            < Button onClick={()=>this.partCompareData(record,index)}> 分区声音比对 </Button> */}
                        < span className="ant-divider" />
                        < Button onClick={() => this.playAudio(record, index)}> 播放 </Button>
                        < span className="ant-divider" />
                        < Button onClick={() => this.downloadFlie(record, index)}> 下载文件 </Button>
                        < span className="ant-divider" />
                        < Button type="primary" danger onClick={() => this.singleDelete(record)}> 删除 </Button>
                    </span>
                ),
            }
        ];
        const columnsCycle = [
            {
                title: '周期(ms)',
                dataIndex: 'period',
            },
            {
                title: '能量(db)',
                dataIndex: 'db',
            },
            {
                title: '频率(Hz)',
                dataIndex: 'frequency',
            },
            {
                title: '稳定度',
                dataIndex: 'matchDegree',
            },
        ];
        const columnsCycleStandard = [
            {
                title: '周期(ms)',
                dataIndex: 'cycle',
            },
            {
                title: '能量(db)',
                dataIndex: 'db',
            },
            {
                title: '频率(Hz)',
                dataIndex: 'frequency',
            },
            {
                title: '稳定度',
                dataIndex: 'degree',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record, index) => (
                    <span>
                        < Button type='danger' onClick={() => this.deleteCycle(record, index)}> 删除 </Button>
                    </span>
                ),
            }
        ];
        const columnsPart = [
            {
                title: '开始频率(Hz)',
                dataIndex: 'startCount',
            },
            {
                title: '结束频率(Hz)',
                dataIndex: 'endCount',
            },
            {
                title: 'p',
                dataIndex: 'p',
            },
            {
                title: '度量值',
                dataIndex: 'value',
            },

        ];
        const columnsEcharts = [{
            title: '频率(Hz)',
            dataIndex: 'freq',
        },
        {
            title: '曲线名称',
            dataIndex: 'name',
        },
        {
            title: '能量(db)',
            dataIndex: 'db',
        },
        {
            title: '密度(%)',
            dataIndex: 'density',
        },

        ];
        const { loading, selectedRowKeys, selectedRowKeysCycle, selectedRowKeysAll, } = this.state;
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections: true,
            onChange: this.onSelectChange,
        };

        const rowSelectionAll = {
            selectedRowKeys: selectedRowKeysAll,
            hideDefaultSelections: true,
            onChange: this.onSelectChangeAll,
        };
        const rowSelectionCycle = {
            selectedRowKeys: selectedRowKeysCycle,
            onChange: this.onSelectChangeCycle,
        }
        const {
            tableData,
            name,
            standardfrequencyList,
            precision, standardCycleList, cycleList, avgCycle, avgDb, avgDegree, avgFrequency,
            qualityList, standardCycleDtoList, standardFrequencyDtoList, standardDeviationGroupDtoList, deviationList,
            cycleStatus, cycleSameStatus,
            frequencyStatus, sameGroupDtoList, pointCycleName, multiFreqStandardGroupDtoList, multiAbsFreqStandardGroupDtoList,
            standardStatus, suddenInfo, total, allCaculteData, pointList,
            suddenStatus, partitionStatus, partCompareList, cycleName, deviationName,
            standardPartitionDtoList, partitionName, code, filePath, disabled
        } = this.state;
        return (
            <Page title='标准库管理'>
                < SideBar parent={this}></SideBar>
                <div className={styles.body} style={{ width: '90%' }}>
                    <SearchPage parent={this}></SearchPage>
                    {/* 能量密度 */}
                    <div className={styles.frequencyWidth}>
                        <div className={styles.standStoreFlex}>
                            <div ref={
                                (c) => {
                                    this.echartsBoxDb = c
                                }
                            }
                                style={
                                    {
                                        width: '49%',
                                        height: '300px',
                                    }
                                }
                            />
                            <div ref={
                                (c) => {
                                    this.echartsBoxDensity = c
                                }
                            }
                                style={
                                    {
                                        width: '49%',
                                        height: '300px',
                                    }
                                }
                            />
                        </div>
                        <Button type='primary' onClick={() => {
                            this.lookFullScreen(1)
                        }}>全屏能量曲线</Button>
                        <Button type='primary' style={{ marginLeft: 10 }} onClick={() => {
                            this.lookFullScreen(2)
                        }}>全屏密度曲线</Button>
                        <Switch checkedChildren="预览包络线" unCheckedChildren="关闭包络线" style={{ marginLeft: 10 }} checked={this.state.AvgLineShow} onChange={this.showAvgLine.bind(this)} />
                        <span style={{ color: 'red' }}>提示：数据量大时可以通过点击具体频率查看所选数据对应的能量、密度 </span>
                    </div>


                    <div className={styles.frequencyWidth}>
                        <Tabs onChange={this.callback} type="card">
                            {
                                frequencyStatus == 1 &&
                                <TabPane tab="标准曲线" key="1">
                                    <Input addonBefore="标准曲线名称：" style={{ width: '500px' }} value={name} name='name'
                                        onChange={this.inputChange.bind(this)} />
                                    <Frequency qualityList={qualityList} standardfrequencyList={standardfrequencyList} standardFrequencyDtoList={standardFrequencyDtoList} parent={this}></Frequency>
                                    <Freq qualityList={qualityList} standardfrequencyList={standardfrequencyList} multiFreqStandardGroupDtoList={multiFreqStandardGroupDtoList} parent={this}></Freq>
                                    <BzLineFreq qualityList={qualityList} standardfrequencyList={standardfrequencyList} multiAbsFreqStandardGroupDtoList={multiAbsFreqStandardGroupDtoList} parent={this}></BzLineFreq>
                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.saveStandardLine(0)}><Icon type="save" />保存</Button>
                                </TabPane>
                            }
                            {
                                cycleStatus == 1 &&
                                <TabPane tab="周期声音" key="2">
                                    <Input addonBefore="标准周期名称：" style={{ width: '500px' }} value={cycleName} name='cycleName'
                                        onChange={this.inputChange.bind(this)} />
                                    <Input addonBefore="周期精度(>)：" style={{ width: '150px', margin: '0 10px' }} value={precision} name='precision'
                                        addonAfter='%' onChange={this.inputChange.bind(this)} />
                                    <Cycle parent={this} qualityList={qualityList} standardCycleDtoList={standardCycleDtoList}></Cycle>
                                    {/* 周期考察图 */}
                                    {
                                        this.state.standardLineVisible ?
                                            <div className={styles.frequencyWidth}>
                                                <div className={styles.standStoreTableFlex} >
                                                    <div style={{ width: '48%' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '18px' }}>历史周期库</div>
                                                        <div className={styles.cycleTempzc}>
                                                            周期(ms):{avgCycle} ,能量(db):{avgDb},频率(Hz):{avgFrequency},稳定度:{avgDegree}
                                                            <Button type='primary' loading={loading} onClick={() => this.saveCycle()}>保存此周期</Button>
                                                        </div>

                                                        <Table rowKey='id' rowSelection={rowSelectionCycle} columns={columnsCycle} dataSource={cycleList} />
                                                    </div>
                                                    <div style={{ width: '48%' }}>
                                                        <div style={{ fontWeight: 600, fontSize: '18px', marginBottom: '40px' }}>标准周期库</div>
                                                        <Table columns={columnsCycleStandard} dataSource={standardCycleList} />
                                                    </div>
                                                </div>
                                            </div> : ""
                                    }
                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.saveStandardLine(1)}><Icon type="save" />保存</Button>
                                </TabPane>
                            }
                            {
                                standardStatus == 1 &&
                                <TabPane tab="标准声音" key="3">
                                    <Input addonBefore="标准声音名称：" style={{ width: '500px' }} value={deviationName} name='deviationName'
                                        onChange={this.inputChange.bind(this)} />
                                    <Deviation parent={this} deviationList={deviationList} qualityList={qualityList} standardDeviationGroupDtoList={standardDeviationGroupDtoList}></Deviation>
                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.saveStandardLine(2)}><Icon type="save" />保存</Button>
                                </TabPane>
                            }
                            {
                                suddenStatus == 1 &&
                                <TabPane tab="突发声音" key="4">
                                    <Sudden parent={this} suddenInfo={suddenInfo}></Sudden>
                                </TabPane>
                            }
                            {
                                partitionStatus == 1 &&
                                <TabPane tab="分区声音" key="5">
                                    <Input name='partitionName' addonBefore='分区声音名称' placeholder="请输入名称" value={partitionName} style={{ width: '500px' }}
                                        onChange={this.inputChange.bind(this)} />
                                    <span style={{ marginLeft: 10 }}>度量方法：</span>
                                    <Select placeholder='请选择度量方法' value={code} style={{ width: 200 }} onChange={this.methodChange.bind(this)}>
                                        <Option value={'exp'} key={'exp'}> exp </Option>
                                    </Select>
                                    <Partition parent={this} qualityList={qualityList} standardPartitionDtoList={standardPartitionDtoList}></Partition>
                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.saveStandardLine(4)}><Icon type="save" />保存</Button>
                                </TabPane>
                            }
                            {
                                cycleSameStatus == 1 &&
                                <TabPane tab="点位周期声音" key="6">
                                    <Input name='pointCycleName' addonBefore='周期声音名称' placeholder="请输入名称" value={pointCycleName} style={{ width: '500px' }}
                                        onChange={this.inputChange.bind(this)} />
                                    <CycleManage parent={this} pointList={pointList} sameGroupDtoList={sameGroupDtoList}></CycleManage>
                                    <Button style={{ backgroundColor: 'green', color: 'white' }} onClick={() => this.saveStandardLine(5)}><Icon type="save" />保存</Button>
                                </TabPane>
                            }



                        </Tabs>
                    </div>

                    <div className={styles.standStoreFlex}>
                        <BtnWrap>
                            {
                                selectedRowKeys.length == 0 ?
                                    <Button type='primary' onClick={() => this.chooseBox(1)}>全选</Button> :
                                    <Button type='primary' onClick={() => this.chooseBox(2)}>全不选</Button>
                            }
                            {/* 新增批量删除按钮 - 仅选中数据时显示 */}
                            {selectedRowKeys.length > 0 && (
                                <Button
                                    type='primary'
                                    danger
                                    onClick={this.batchDelete}
                                    style={{ marginLeft: 10 }}
                                >
                                    批量删除
                                </Button>
                            )}
                            <Button style={{ backgroundColor: '#F21360', color: 'white', marginLeft: 10 }} onClick={() => this.lookEcharts()}>生成曲线图</Button>
                            <Switch checkedChildren="预览所选数据上下限" unCheckedChildren="关闭所选数据上下限" checked={this.state.switchAllShow} onChange={this.switchAllChange.bind(this)} />
                            {this.state.switchAllShow && <Button style={{ backgroundColor: 'green', color: 'white', marginLeft: 10 }} onClick={() => this.lookAllData()}>查看所选数据</Button>}
                            <Button type='primary' icon="download" disabled={disabled} onClick={() => { this.downAudioFile() }} style={{ marginLeft: 10 }}>批量下载录音文件</Button>
                        </BtnWrap>
                        <audio src={filePath} autoPlay controls style={{ width: 300, height: 30, marginLeft: 100 }}></audio>
                    </div>

                    <Table {...tableStyle} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
                    {/* 频率曲线图 */}
                    < Modal title="数据详情"
                        visible={this.state.singleDataVisible}
                        onOk={() => { this.handleClose() }}
                        onCancel={() => { this.handleClose() }}
                        width="80%"
                    >
                        <div className={styles.ZCAudioStyle}>
                            <audio src={filePath} controls></audio>
                        </div>

                        <div ref={
                            (c) => {
                                this.echartsBoxSingle = c
                            }
                        }
                            style={
                                {
                                    width: '100%',
                                    height: '400px',
                                }
                            }
                        />
                    </Modal>

                    {/* 分区声音比对 */}
                    < Modal title="分区声音比对"
                        visible={this.state.partCompareVisible}
                        onOk={() => { this.handleClose() }}
                        onCancel={() => { this.handleClose() }}
                        width="80%"
                    >
                        <Table {...tableStyle} columns={columnsPart} dataSource={partCompareList} />
                    </Modal>

                    {/* 全屏查看 */}
                    < Modal title="数据详情"
                        visible={this.state.fullScreenVisible}
                        onOk={() => { this.handleClose() }}
                        onCancel={() => { this.handleClose() }}
                        width="98%"
                    >
                        <div ref={
                            (c) => {
                                this.echartsBoxFullScreen = c
                            }
                        }
                            style={
                                {
                                    width: '100%',
                                    height: '600px',
                                }
                            }
                        />
                    </Modal>

                    {/* 查看选择的数据 */}
                    < Modal title="生成上下限的数据"
                        visible={this.state.allDataVisible}
                        onOk={() => { this.handleClose() }}
                        onCancel={() => { this.handleClose() }}
                        width="98%"
                    >
                        <Table {...tableStyle} rowSelection={rowSelectionAll} rowKey={record => record.id} columns={columns} dataSource={allCaculteData} />
                    </Modal>

                    {/* 点击对应的坐标轴数据数值 */}
                    <Modal
                        title={`频率 ${this.state.selectedFreq} Hz时${this.state.clickTrendDimension === 'db' ? '能量' : '密度'}趋势`}
                        visible={this.state.clickChartVisible}
                        onOk={() => { this.handleClose() }}
                        onCancel={() => { this.handleClose() }}
                        width="80%" // 加宽弹窗，适配图表
                        // 弹窗大小变化时，图表自适应
                        onResize={() => this.initClickTrendChart()}
                    >
                        {/* 新增：维度切换按钮 */}
                        <div style={{ marginBottom: 10, textAlign: 'left' }}>
                            <Button
                                type="primary"
                                onClick={this.switchTrendDimension}
                            >
                                {this.state.clickTrendDimension === 'db' ? '密度' : '能量'}
                            </Button>
                        </div>
                        {/* 新增：ECharts容器 */}
                        <div
                            ref={(c) => { this.echartsBoxClickTrend = c; }}
                            style={{ width: '100%', height: '500px' }}
                        />
                    </Modal>

                    < Modal title="打标签内容"
                        visible={this.state.tagVisible}
                        onOk={() => { this.handleClose() }}
                        onCancel={() => { this.handleClose() }}
                        width="40%"
                    >
                        <ul>
                            {
                                (content || []).map(item => {
                                    return <li >{item.tagName}</li>
                                })
                            }
                        </ul>
                    </Modal>

                </div>
            </Page>

        )
    }
}

export default standardStore;
