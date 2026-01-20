
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, DatePicker, Checkbox, Pagination, Switch, BackTop, Tabs, Spin, Popconfirm } from 'antd';
import { service, service2 } from './service';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'standardStore';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { result } from 'lodash';
const TabPane = Tabs.TabPane;
import styles from './pipeline.less';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import Stomp from 'stompjs';
import comm, { hostIp } from '@src/config/comm.config.js';
import { deviceTypeList } from '@src/services/common';
let myEchartsDb = null;
let socketRecordid = null;
let socketRelative = null;
let socketPre = null;
let t1 = null;
let t = null;
let t2 = null;
let filePath = '';
let myEchartsSingle1 = null;
let myEchartsSingle = null;

let myEchartsPre = null;

let myEchartsA = null;
let myEchartsA1 = null;
let totaldbArr = [];
let totaldensityArr = [];

let totalAdbArr = [];
let totalAdensityArr = [];
class standardStore extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys: [],
            loading: false,
            remark: "",
            total: 0,
            freq1: 200,
            freq2: 8000,
            microsec: 200,
            engP1: '0.15',
            engP2: '3',
            type: '1',
            typeList: [
                {
                    value: '1',
                    label: "敲击声源"
                },
                {
                    value: '2',
                    label: "筋膜枪声源"
                },
                {
                    value: '3',
                    label: "水管声源"
                },

            ],
            channelNo1: 1,
            channelNo2: 1,
            channelNoList: [
                {
                    value: 1,
                    label: "通道1"
                },
                {
                    value: 2,
                    label: "通道2"
                },
                {
                    value: 3,
                    label: "通道3"
                },
                {
                    value: 4,
                    label: "通道4"
                },
            ],
            recordIdList: [],
            dataList: [],
            listenTime: 0,
            disabled: false,
            relativeList: [
                {
                    freq1: '',
                    freq2: '',
                    microsec: '200',
                    checked: true,
                    speed: ""
                },
                {
                    freq1: '',
                    freq2: '',
                    microsec: '200',
                    checked: true,
                    speed: ""
                },
            ],
            distance: "10",
            speed: "",
            Amax: '',
            Bmax: '',
            type: '1',
            distanceVisible: false,
            remark1: "",
            editVisible: false,
            remark1: "",
            buffRankA: "", buffRankB: "", timeA: "3", timeB: '3',
            buffA: "",
            buffB: '',
            dataA: [],
            dataB: [],
            sampleRate: '',
            sampleSec: 1
        }
    }
    componentDidMount() {
        this.getList(1);;
        this.findByDeviceId('A')
        this.findByDeviceId('B')
    }
    componentWillReceiveProps(newProps) {

    }
    componentWillUnmount() {
        this.disposeEcharts();
    }
    disposeEcharts = () => {
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }

    }
    disposeEchartsA = (type) => {
        if (type == 1) {
            if (myEchartsA) {
                myEchartsA.dispose();
                myEchartsA = null;
            }
            if (myEchartsA1) {
                myEchartsA1.dispose();
                myEchartsA1 = null;
            }
        } else {
            if (myEchartsSingle) {
                myEchartsSingle.dispose();
                myEchartsSingle = null;
            }
            if (myEchartsSingle1) {
                myEchartsSingle1.dispose();
                myEchartsSingle1 = null;
            }
        }

    }
    // 查询听筒增益
    findByDeviceId = (type) => {
        // "receiverId1": "2vIyt3Upum5Pbk3vXW6",
        // "receiverId2": "6S2vV0HsoHPlnvWaLyw",
        let deviceId = '';
        if (type == 'A') {
            deviceId = '2vIyt3Upum5Pbk3vXW6';
        } else {
            deviceId = '6S2vV0HsoHPlnvWaLyw';
        }
        service.findByDeviceId({ deviceId }).then(res => {
            if (res.rc == 0) {
                let buffMultiple = res.ret.config.receiverDtoList[0].buffMultiple;
                if (type == 'A') {
                    let msg = 'A听筒增益是' + buffMultiple + '倍';
                    message.success(msg)
                    this.setState({
                        buffRankA: buffMultiple,
                        buffA: res.ret
                    })
                } else {
                    let msg = 'B听筒增益是' + buffMultiple + '倍';
                    message.success(msg)
                    this.setState({
                        buffRankB: buffMultiple,
                        buffB: res.ret
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }

    // 保存增益
    saveBuff = (type) => {
        const { buffA, buffB, buffRankA, buffRankB } = this.state;
        const params =
            type === 'A'
                ? {
                    ...buffA,
                    config: {
                        ...buffA.config,
                        receiverDtoList: buffA.config.receiverDtoList.map((dto, idx) =>
                            idx === 0 ? { ...dto, buffMultiple: buffRankA } : dto
                        )
                    }
                }
                : {
                    ...buffB,
                    config: {
                        ...buffB.config,
                        receiverDtoList: buffB.config.receiverDtoList.map((dto, idx) =>
                            idx === 0 ? { ...dto, buffMultiple: buffRankB } : dto
                        )
                    }
                };
        service.saveBuff(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('数据上传成功，正在修改中，稍后请手动查询')
            } else {
                message.error(res.err);
            }
        })
    }
    // 开始预采集
    preCollect = (type) => {
        const { buffRankA, buffRankB, timeA, timeB } = this.state;
        let params = {};
        if (type == 'A') {
            params = {
                buffRank: buffRankA,
                time: timeA,
                deviceId: "2vIyt3Upum5Pbk3vXW6"
            }
        } else {
            params = {
                buffRank: buffRankB,
                time: timeB,
                deviceId: "6S2vV0HsoHPlnvWaLyw"
            }
        }
        service2.preCollect(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('预采集中，请稍后查看时域图')
                this.subscribePre(res.ret, type)
            } else {
                message.error(res.err);
            }
        })
    }
    lookPre = (type) => {
        const { dataA, dataB, sampleRate } = this.state;
        if (type == 'A' && dataA.length == 0) {
            message.error('没有可查看的时域图');
            return false
        }
        if (type == 'B' && dataB.length == 0) {
            message.error('没有可查看的时域图');
            return false
        }
        let dataArr = type == 'A' ? dataA : dataB;
        // // 计算Y轴最高点
        let maxYValue = -Infinity;
        let maxYIndex = 0;
        dataArr.forEach((value, idx) => {
            if (value > maxYValue) {
                maxYValue = value;
                maxYIndex = idx;
            }
        });
        const xArr = Array.from({ length: dataArr.length }, (_, i) =>
            Number((i / sampleRate).toFixed(6))
        );
        console.log(maxYIndex, maxYValue)
        this.setState({
            preVisible: true,
            maxYpre: maxYValue,
            maxYindex: xArr[maxYIndex]
        }, () => {
            this.getEchartsPre(type == 'A' ? dataA : dataB, type);
        })

    }
    subscribePre = (id, type) => {
        let that = this;
        let socket = new WebSocket(comm.baseurl.pipePrews);
        socketPre = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        socketPre.connect(headers, () => {
            socketPre.subscribe('/police-topic/preCollect/' + id, (msg) => {
                console.log(JSON.parse(msg.body).length)
                if (msg) {
                    if (type == 'A') {
                        this.setState({
                            dataA: JSON.parse(msg.body).data,
                            sampleRate: JSON.parse(msg.body).sampleRate,
                        })
                    } else {
                        this.setState({
                            dataB: JSON.parse(msg.body).data,
                            sampleRate: JSON.parse(msg.body).sampleRate,
                        })
                    }
                    message.success('时域图已生成！')
                    socketPre.disconnect();
                    socketPre = null;

                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    getEchartsPre = (yArr, type) => {
        const { sampleRate } = this.state;
        const xArr = Array.from({ length: yArr.length }, (_, i) =>
            Number((i / sampleRate).toFixed(6))
        );

        if (this.echartsBoxpre) {
            if (myEchartsPre == null) {
                myEchartsPre = echarts.init(this.echartsBoxpre);
            }
            if (myEchartsPre) {

                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionBuff));
                optionDensity.title.text = type + '_时域图';
                optionDensity.xAxis[0].data = xArr || [];
                optionDensity.series = [
                    {
                        name: "",
                        type: "line",
                        data: yArr,
                        // markPoint: {
                        //     symbol: 'circle',
                        //     symbolSize: 8,
                        //     itemStyle: { color: '#ff0000' },
                        //     label: { formatter: '最大值：{c}' },
                        //     data: [{ coord: [xArr[maxYIndex], maxYValue], value: maxYValue }]
                        //   }
                    }
                ];
                myEchartsPre.setOption(optionDensity)
            }
        }
    }
    getList = (page) => {
        let params = {
            pageIndex: page - 1,
            pageSize: 20,
            sortValueMap: [
                {
                    code: 'record_time',
                    sort: 'desc',
                },
            ],
        };
        service.getList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if (res.ret) {
                    let data = res.ret.items;
                    arr = data.map((item, index) => {
                        return {
                            ...item,
                            index: index + 1
                        }
                    })
                    this.setState({
                        tableData: arr,
                        total: res.ret.rowCount,
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let recordIdList = [];
        for (let i = 0; i < selectedRows.length; i++) {
            recordIdList.push(selectedRows[i].id)
        }
        this.setState({
            selectedRowKeys,
            selectedRows,
            recordIdList,
            sampleSec: selectedRows[0] ? selectedRows[0].sampleSec : 1
        })
    }

    deleteData = () => {
        const { recordIdList } = this.state;
        service.delete(recordIdList).then(res => {
            if (res.rc == 0) {
                this.getList(1)
                message.success('删除成功')
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
    typeChecked = (e) => {
        if (e == 1) {
            // 敲击
            this.setState({
                engP2: 3
            })
        } else if (e == 2) {
            // 筋膜枪
            this.setState({
                engP2: 0.6
            })
        } else {
            // 水管
            this.setState({
                engP2: 0.6
            })
        }
        this.setState({
            type: e
        })
    }
    channelChecked = (e) => {
        this.setState({
            channelNo1: e
        })
    }
    channelChecked1 = (e) => {
        this.setState({
            channelNo2: e
        })
    }
    // ===================================包络线结束==============================
    downloadFlie = (record, index) => {
        message.success('开始下载文件...')
        const { id, filePath1, filePath2 } = record;
        let filePath = index == 1 ? filePath1 : filePath2;
        const link = document.createElement('a');
        link.href = comm.pipelineUrl + '?path=' + filePath;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showTotal = (total) => {
        return `合计 ${total} 条`;
    }
    pageOnChange = (page) => {
        this.setState({
            page
        }, () => {
            this.getList()
        })
    }
    loadingTips() {
        this.setState({
            loadingText: '正在听音中...',
            loadingVisible: true,
            djsVisible: true
        })
        let listenTime = Number(this.state.listenTime);
        let that = this;
        if (t1) {
            clearTimeout(t1);
        }
        // 听音时间结束之后开始检测分析
        t1 = setTimeout(function () {
            that.setState({
                loadingText: '文件上传中....',
                djsVisible: false,
                disabled: false
            })
        }, (listenTime + 1) * 1000)
        this.openDjs(listenTime);
    }
    openDjs = (listenTime) => {
        let count = Number(listenTime) + 1;
        let that = this;

        function countNum() {
            if (count > 1) {
                count--;
            } else if (0 < count < 1) {
                count = count;
            } else {
                count = 0;
            }
            that.setState({
                leaveTime: count.toFixed(1)
            })
            if (count == 0) {
                return false
            }
            t2 = setTimeout(() => {
                countNum()
            }, 1000)
        }
        countNum()
    }
    goRun = () => {
        this.clearClock();
        const { remark, channelNo2, channelNo1 } = this.state;
        let params = {
            "receiverId1": "2vIyt3Upum5Pbk3vXW6",
            "receiverId2": "6S2vV0HsoHPlnvWaLyw",
            remark, channelNo2, channelNo1
        }
        service.start(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                const { id, listenTime } = res.ret;
                this.setState({
                    listenTime,
                    disabled: true
                }, () => {
                    this.loadingTips()
                })
                this.subscribeRecordid(id);
                // this.checkWebsocket();
            } else {
                message.error(res.err);
            }
        })
    }
    subscribeRecordid(id) {
        let that = this;
        let socket = new WebSocket(comm.baseurl.pipews);
        socketRecordid = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        socketRecordid.connect(headers, () => {
            socketRecordid.subscribe('/police-topic/record/' + id, (msg) => {
                if (msg) {
                    that.getList(1);
                    socketRecordid.disconnect();
                    socketRecordid = null;
                    that.setState({
                        loadingVisible: false,
                    })
                    that.clearClock();
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    subscribeRelative(id) {
        // 计算相关性的
        let that = this;
        let socket = new WebSocket(comm.baseurl.piperelativews);
        socketRelative = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        socketRelative.connect(headers, () => {
            socketRelative.subscribe('/correlation-topic/correlation/' + id, (msg) => {
                if (msg) {
                    let temp = JSON.parse(msg.body);
                    socketRelative.disconnect();
                    socketRelative = null;
                    that.setState({
                        loading: false,
                    })
                    that.clearClock();
                    this.disposeEcharts();

                    this.drawEcharts(temp)
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    checkWebsocket() {
        t = setInterval(() => {
            try {
                socketRecordid.send("test");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeRecordid();
            }
        }, 10 * 1000)
    }
    clearClock = () => {
        if (t) {
            clearInterval(t);
            t = null;
        }
    }
    caulateSpeed = () => {
        const { dataList, speed, distance, relativeList } = this.state;
        let arr = [...relativeList];
        for (let i = 0; i < dataList.length; i++) {
            const calculatedSpeed = Number(distance) / Number(dataList[i].currentYtime);
            const speedWithTwoDecimals = Number(calculatedSpeed.toFixed(2));
            arr[i] = {
                ...arr[i],
                speed: speedWithTwoDecimals
            }
        }
        this.setState({
            relativeList: arr
        })
    }
    caulateDis = () => {
        const { dataList, speed, distance } = this.state;
        if (speed == '') {
            message.error('请先计算出速度!');
            return false;
        }
        let arr = [...dataList];
        const halfDist = Number(distance) / 2;
        const halfSpeed = speed / 2;

        arr = dataList.map((item, i) => {
            const raw = halfDist + halfSpeed * Number(item.currentYtime);
            const clamped = Math.min(Math.max(raw, 0), distance);   // 0 ≤ x ≤ distance
            const disA = +clamped.toFixed(2);
            const disB = +(distance - disA).toFixed(2);  // B点距离 = 总距离 - A点距离
            return {
                ...arr[i],
                disA: disA,
                disB: disB
            };
        });
        this.setState({
            dataList: arr,
            distanceVisible: true
        })

    }
    setSpeed = (item, index) => {
        this.setState({
            speed: item.speed || ''
        })
    }

    caulateLine = () => {
        // 计算相关性
        const { microsec, recordIdList, relativeList, engP1, engP2 } = this.state;
        if (recordIdList.length == 0) {
            message.error('请先选择数据！')
            return false
        }
        if (engP2 == '' || engP1 == '') {
            message.error('能量指数不能为空！')
            return false
        }
        let tempArr = [];
        for (let i = 0; i < relativeList.length; i++) {
            const item = relativeList[i];
            // 将freq1和freq2转换为数字
            const freq1Num = Number(item.freq1);
            const freq2Num = Number(item.freq2);

            // &&  freq2Num / freq1Num > 1 && 
            // freq2Num / freq1Num < 1.2

            // 检查是否都是有效数字、checked为true，且freq2/freq1在1到1.1之间
            if (item.checked &&
                !isNaN(freq1Num) &&
                !isNaN(freq2Num) &&
                freq1Num > 0  // 避免除以0的情况
            ) {
                tempArr.push({
                    freq1: item.freq1,
                    freq2: item.freq2,
                    speed: item.speed,
                    engP1,
                    engP2,
                    microsec,  // 假设这里应该使用item的microsec
                    recordIdList  // 假设这里应该使用item的recordIdList
                });
            } else {

            }
        }
        if (tempArr.length == 0) {
            message.error('结束频率和开始频率的范围比为1-1.2之间');
            message.error('开始频率/结束频率不能为空!')
            return false;
        }
        let params = {
            list: tempArr
        }
        this.setState({
            loading: true,
            distanceVisible: false,
        })
        service.getBatchCurve(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.subscribeRelative(res.ret)
            } else {
                message.error(res.err);
            }
        })
    }
    drawEcharts = (ret) => {
        const { sampleSec } = this.state;

        // 1. 处理多条折线数据（每条线对应ret中的一个元素）
        const seriesData = []; // 存储所有折线的配置
        let xAxisData = []; // x轴数据（所有折线共用）

        let dataList = [];
        // 循环ret，提取每条折线的信息
        ret.forEach((item, index) => {

            const lineName = moment(item.time).format('YYYY-MM-DD HH:mm:ss') + '——' + item.remark + '——' + item.freq1 + 'Hz至' + item.freq2 + 'Hz';

            const lineData = (item.resultList || []).map(v => Number(v) / 1); // 先转数字再除
            // 计算当前折线的中间点和最高点
            const dataLength = lineData.length;
            const middleIndex = dataLength > 0 ? Math.floor(dataLength / 2) : 0;
            const middleValue = dataLength > 0 ? lineData[middleIndex] : 0;

            // 计算Y轴最高点
            let maxYValue = -Infinity;
            let maxYIndex = 0;
            if (dataLength > 0) {
                lineData.forEach((value, idx) => {
                    if (value > maxYValue) {
                        maxYValue = value;
                        maxYIndex = idx;
                    }
                });
            }


            // 每条折线的配置（包含标记点）
            seriesData.push({
                name: lineName,
                type: 'line',
                data: lineData,
                smooth: true,
                lineStyle: { width: 2 },
                // 标记点配置（中间点和最高点）
                markPoint: {
                    symbol: 'circle',
                    symbolSize: 8,
                    data: [
                        // 中间点（红色）
                        {
                            name: `中点: ${middleValue}`,
                            xAxis: middleIndex,
                            yAxis: middleValue,
                            itemStyle: { color: 'red' },
                            label: { show: false } // 不显示标签文字
                        },
                        // 最高点（绿色）- 仅当有数据时显示
                        ...(dataLength > 0 ? [{
                            name: `最高: ${maxYValue}`,
                            xAxis: maxYIndex,
                            yAxis: maxYValue,
                            itemStyle: { color: 'green' },
                            label: { show: false } // 不显示标签文字
                        }] : [])
                    ]
                },
                // 添加中间点的虚线标记（水平和垂直）
                markLine: {
                    symbol: ['none', 'none'], // 不显示端点标记
                    label: { show: false }, // 不显示标签
                    lineStyle: {
                        color: 'red',
                        type: 'dashed', // 虚线样式
                        width: 1.5
                    },
                    data: dataLength > 0 ? [
                        // 垂直虚线（从中间点到x轴）
                        {
                            xAxis: middleIndex,
                            lineStyle: { type: 'dashed' }
                        },
                        // 水平虚线（从中间点到y轴）
                        // {
                        //     yAxis: middleValue,
                        //     lineStyle: { type: 'dashed' }
                        // }
                    ] : []
                }
            });

            // 初始化x轴数据（取第一条折线的索引作为x轴标签）
            if (index === 0 && dataLength > 0) {
                xAxisData = lineData.map((_, i) => `${i + 1}`);
                // 如果有实际x轴标签（如时间），替换为: xAxisData = item.xAxisLabels || [];
            }
            const currentYtime = ((xAxisData[maxYIndex] - xAxisData[middleIndex]) / sampleSec).toFixed(6); // 时间（保留6位小数）
            dataList.push({
                ...item,
                middleIndex,
                middleValue,
                maxYValue,
                maxYIndex,
                currentYtime,
                time: moment(item.time).format('YYYY-MM-DD HH:mm:ss'),
                disA: '',
                disB: ""
            })
        });

        // 2. 图表配置
        const option = {
            title: { text: '' },
            tooltip: {
                trigger: 'axis',
                formatter: function (params) {
                    // 自定义tooltip，显示标记点信息
                    let tooltipHtml = `${params[0].name}<br/>`;
                    params.forEach(item => {
                        tooltipHtml += `${item.seriesName}: ${item.value}<br/>`;
                    });
                    return tooltipHtml;
                }
            },
            legend: {
                data: seriesData.map(line => line.name),
                top: 30
            },
            grid: {
                left: '3%',   // 左边距（可填百分比或具体像素，如 50）
                right: '3%',  // 右边距
                containLabel: true // 确保边距包含坐标轴标签，防止标签被截断
            },
            xAxis: {
                type: 'category',
                data: xAxisData,
                name: ''
            },
            yAxis: {
                type: 'value',
                name: '',
                scale: true
            },
            series: seriesData,
            dataZoom: [
                { type: 'inside', start: 0, end: 100 },
                { start: 0, end: 100 }
            ]
        };
        // console.log(option)
        this.setState({
            dataList
        }, () => {
            this.caulateSpeed();
        })
        // 3. 初始化并渲染图表
        if (this.echartsBox) {
            myEchartsDb = echarts.init(this.echartsBox);
            myEchartsDb.setOption(option);
            // 自适应处理
            // myEchartsDb.on('finished', () => {
            //     myEchartsDb.resize();
            // });
        }
    };
    handleClose = () => {
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
        if (myEchartsSingle1) {
            myEchartsSingle1.dispose();
            myEchartsSingle1 = null;
        }
        if (myEchartsPre) {
            myEchartsPre.dispose();
            myEchartsPre = null;
        }
        this.setState({
            Visible: false,
            editVisible: false,
            preVisible: false
        })
    }
    getEcharts = (xArr) => {
        if (this.echartsBoxSingle1) {
            if (myEchartsSingle1 == null) {
                myEchartsSingle1 = echarts.init(this.echartsBoxSingle1);
            }
            if (myEchartsSingle1) {
                let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                optionDb.title.text = 'A、B点能量曲线图';
                optionDb.xAxis[0].data = xArr || [];
                optionDb.series = totaldbArr || [];
                myEchartsSingle1.setOption(optionDb)
            }
        }

        if (this.echartsBoxSingle) {
            if (myEchartsSingle == null) {
                myEchartsSingle = echarts.init(this.echartsBoxSingle);
            }
            if (myEchartsSingle) {
                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                optionDensity.title.text = 'A、B点密度曲线图';
                optionDensity.xAxis[0].data = xArr || [];
                optionDensity.series = totaldensityArr || [];
                myEchartsSingle.setOption(optionDensity)
            }
        }
    }
    lookSingle = (record) => {
        this.disposeEchartsA(2);
        // 查看曲线图
        totaldbArr = [];
        totaldensityArr = [];
        this.setState({
            Visible: true
        })
        const { id, receiverId1, receiverId2 } = record;
        let params = {
            recordId: id,
            receiverId: receiverId1
        }
        service.getSingle(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let data = res.ret || [];
                const xArr = [];
                const densityArr = [];
                const dbArr = [];
                data.forEach(({ freq1, freq2, density, db }) => {
                    // 计算横坐标并添加到数组
                    const xValue = Math.sqrt(freq1 * freq2).toFixed(2);
                    xArr.push(xValue);

                    // 处理密度和db数据
                    densityArr.push(density.toFixed(6));
                    dbArr.push(db === 0 ? undefined : db.toFixed(6));
                });
                totaldbArr.push({
                    name: moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') + '——A点——' + record.remark,
                    type: 'line',
                    data: dbArr
                })
                totaldensityArr.push({
                    name: moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') + '——A点——' + record.remark,
                    type: 'line',
                    data: densityArr
                })

                this.getEcharts(xArr);


            } else {
                message.error(res.err);
            }
        })
        let params1 = {
            recordId: id,
            receiverId: receiverId2
        }
        service.getSingle(VtxUtil.handleTrim(params1)).then(res => {
            if (res.rc == 0) {
                let data = res.ret || [];
                const xArr = [];
                const densityArr = [];
                const dbArr = [];

                data.forEach(({ freq1, freq2, density, db }) => {
                    // 计算横坐标并添加到数组
                    const xValue = Math.sqrt(freq1 * freq2).toFixed(2);
                    xArr.push(xValue);

                    // 处理密度和db数据
                    densityArr.push(density.toFixed(6));
                    dbArr.push(db === 0 ? undefined : db.toFixed(6));
                });

                totaldbArr.push({
                    name: moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') + '——B点——' + record.remark,
                    type: 'line',
                    data: dbArr
                })
                totaldensityArr.push({
                    name: moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') + '——B点——' + record.remark,
                    type: 'line',
                    data: densityArr
                })
                this.getEcharts(xArr);
            } else {
                message.error(res.err);
            }
        })

    }

    // ===================================================== A，B能量对比图==============================================================
    compare = (type) => {
        const { selectedRows } = this.state;
        totalAdbArr = [];
        totalAdensityArr = [];
        this.disposeEchartsA(1);
        if (selectedRows.length == 0) {
            message.error('请先选择需要比对的数据');
            return false;
        }
        for (let i = 0; i < selectedRows.length; i++) {
            const { id, receiverId1, receiverId2 } = selectedRows[i];
            this.getA(id, receiverId1, receiverId2, type, selectedRows[i])
        }
    }
    getA = (id, receiverId1, receiverId2, type, record) => {
        let params = {
            recordId: id,
            receiverId: type == 1 ? receiverId1 : receiverId2
        }
        service.getSingle(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let data = res.ret || [];
                const xArr = [];
                const densityArr = [];
                const dbArr = [];
                data.forEach(({ freq1, freq2, density, db }) => {
                    // 计算横坐标并添加到数组
                    const xValue = Math.sqrt(freq1 * freq2).toFixed(2);
                    xArr.push(xValue);

                    // 处理密度和db数据
                    densityArr.push(density.toFixed(6));
                    dbArr.push(db === 0 ? undefined : db.toFixed(6));
                });
                let name = (type == 1 ? '——A点——' : '——B点——');
                totalAdbArr.push({
                    name: moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') + name + record.remark,
                    type: 'line',
                    data: dbArr
                })
                totalAdensityArr.push({
                    name: moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') + name + record.remark,
                    type: 'line',
                    data: densityArr
                })

                this.getAEcharts(xArr, type);

            } else {
                message.error(res.err);
            }
        })
    }

    getAEcharts = (xArr, type) => {
        if (this.echartsBoxAdb) {
            if (myEchartsA == null) {
                myEchartsA = echarts.init(this.echartsBoxAdb);
            }
            if (myEchartsA) {
                let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                optionDb.title.text = (type == 1 ? 'A点能量比对曲线图' : 'B点能量比对曲线图');
                optionDb.xAxis[0].data = xArr || [];
                optionDb.series = totalAdbArr || [];
                myEchartsA.setOption(optionDb)
            }
        }

        if (this.echartsBoxAdensity) {
            if (myEchartsA1 == null) {
                myEchartsA1 = echarts.init(this.echartsBoxAdensity);
            }
            if (myEchartsA1) {
                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                optionDensity.title.text = (type == 1 ? 'A点密度曲线图' : 'B点密度曲线图');
                optionDensity.xAxis[0].data = xArr || [];
                optionDensity.series = totalAdensityArr || [];
                myEchartsA1.setOption(optionDensity)
            }
        }
    }

    // ==================================================A、B能量对比结束==================================================================


    addRelative = () => {
        let arr = [{
            freq1: "",
            freq2: "",
            microsec: "",
            speed: "",
            checked: true
        }]
        const { relativeList = [] } = this.state;
        let tempArr = [...relativeList];
        this.setState({
            relativeList: tempArr.concat(arr),
        })

    }

    playAudio = (record, no) => {
        filePath = comm.pipeAudioUrl + '?recordId=' + record.id + '&no=' + no;
        this.setState({
            filePath
        })
    }

    inputChangeIndex = (index, e) => {
        const { relativeList = [] } = this.state;
        let arr = [];
        arr = [...relativeList];
        arr[index] = {
            ...arr[index],
            [e.target.name]: e.target.value
        }
        this.setState({
            relativeList: arr
        })
    }
    boxChange = (index, e) => {
        const { relativeList = [] } = this.state;
        let arr = [];
        arr = [...relativeList];
        arr[index] = {
            ...arr[index],
            checked: e.target.checked
        }
        this.setState({
            relativeList: arr
        })
    }
    deleteIndex = (index) => {
        const { relativeList } = this.state;
        let arr = [...relativeList];
        arr.splice(index, 1);
        this.setState({
            relativeList: arr
        })
    }

    editRemark = (record) => {
        this.setState({
            remark1: record.remark,
            id: record.id,
            editVisible: true,
        })
    }
    handleReamrk = () => {
        const { id, remark1 } = this.state;
        let params1 = {
            id,
            remark: remark1
        }
        service.editRemark(VtxUtil.handleTrim(params1)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    editVisible: false
                })
                this.getList();
            } else {
                message.error(res.err);
            }
        })
    }

    GoPage = () => {
        window.open('http://122.224.196.178:8003/sound/#/pipeSpeed', '_blank');
    }

    render() {
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
                dataIndex: 'recordTime',
                render: (text, record, index) => (
                    <span>
                        {record.recordTime ? moment(record.recordTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                    </span>
                ),
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record, index) => (
                    <span style={{ color: (record.status != 1 ? 'red' : '') }}>
                        {record.status == 0 ? '处理中' : record.status == 1 ? '正常' : '异常'}
                    </span>
                ),
            },
            {
                title: '备注',
                dataIndex: 'remark',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record, index) => (
                    <span>

                        < Button onClick={() => this.downloadFlie(record, 1)}> 下载文件A </Button>
                        < span className="ant-divider" />
                        < Button onClick={() => this.downloadFlie(record, 2)}> 下载文件B </Button>
                        < span className="ant-divider" />
                        < Button type='primary' onClick={() => this.lookSingle(record)}> 曲线图 </Button>
                        < span className="ant-divider" />
                        < Button onClick={() => this.playAudio(record, 1)}> 播放文件A </Button>
                        < span className="ant-divider" />
                        < Button onClick={() => this.playAudio(record, 2)}> 播放文件B </Button>
                        < span className="ant-divider" />
                        < Button type='danger' onClick={() => this.editRemark(record)}> 编辑备注 </Button>
                    </span>
                ),
            }
        ];
        const { loading, selectedRowKeys, selectedRowKeysCycle, selectedRowKeysAll, filePath } = this.state;
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections: true,
            onChange: this.onSelectChange,
        };
        const { tableData, total, freq1, remark1, microsec, remark, dataList, disabled, leaveTime, djsVisible,
            loadingVisible, loadingText, relativeList, distance, speed, Bmax, Amax, engP1, engP2, channelNo1, channelNo2, distanceVisible,
            buffRankA, buffRankB, timeA, timeB
        } = this.state;

        return (
            <Page title='相关性分析' className={styles.body}>
                <div>
                    <Input addonBefore="备注：" style={{ width: '500px', marginLeft: "10px" }} placeholder="请输入备注:" value={remark} name='remark'
                        onChange={this.inputChange.bind(this)} />
                    <Select placeholder='选择通道1' value={channelNo1} onChange={this.channelChecked.bind(this)} style={{ width: 100, marginLeft: 10 }}>
                        {
                            (this.state.channelNoList || []).map((item, index) => {
                                return (
                                    <Option value={item.value} key={index}> {item.label}</Option>
                                )
                            })
                        }
                    </Select>
                    <Select placeholder='选择通道2' value={channelNo2} onChange={this.channelChecked1.bind(this)} style={{ width: 100, marginLeft: 10 }}>
                        {
                            (this.state.channelNoList || []).map((item, index) => {
                                return (
                                    <Option value={item.value} key={index}> {item.label}</Option>
                                )
                            })
                        }
                    </Select>
                    <Button type="primary" style={{ marginLeft: 10 }} disabled={disabled} onClick={() => this.goRun()}> 启动听音器 </Button>
                    <Button type='primary' style={{ marginLeft: 10 }} onClick={() => this.getList(1)}>刷新数据</Button>
                    <Button type='danger' style={{ marginLeft: 10 }} onClick={() => this.GoPage()}>前往计算速度页面</Button>
                </div>
                {
                    loadingVisible ?
                        <div style={{ width: 300, height: 100, margin: '10px auto' }}>
                            <Spin size="large" style={{ marginLeft: 50 }} />
                            <p >{loadingText}</p>
                            {
                                djsVisible ? <p >听音时间还有<span style={{ fontSize: '22px', color: 'red' }}>{leaveTime}</span>秒</p> : ''
                            }
                        </div> : ''
                }
                <div style={{ width: '98%', marginLeft: 10 }}>
                    <div style={{ width: '100%', border: '1px solid green', borderRadius: '10px', padding: '10px 10px', marginTop: 10, position: 'relative' }}>
                        <div className={styles.flex} style={{ marginBottom: 10 }}>
                            <Input addonBefore="两点之间的距离：" addonAfter='m' style={{ width: '200px' }} name='distance' placeholder="请输入" value={distance}
                                onChange={this.inputChange.bind(this)} />
                            <Input addonBefore="传播速度：" addonAfter='m/s' style={{ width: '200px', marginLeft: 10 }} name='speed' placeholder="请输入" value={speed}
                                onChange={this.inputChange.bind(this)} />
                            <Input addonBefore="microsec：" addonAfter='毫秒' style={{ width: '200px', marginLeft: 10 }} name='microsec' placeholder="请输入" value={microsec}
                                onChange={this.inputChange.bind(this)} />
                            <Select placeholder='选择模式' value={this.state.type} onChange={this.typeChecked.bind(this)} style={{ width: 100, marginLeft: 10 }}>
                                {
                                    (this.state.typeList || []).map((item, index) => {
                                        return (
                                            <Option value={item.value} key={index}> {item.label}</Option>
                                        )
                                    })
                                }
                            </Select>
                            <Input addonBefore="能量指数1：" style={{ width: '150px', marginLeft: 10 }} name='engP1' placeholder="请输入" value={engP1}
                                onChange={this.inputChange.bind(this)} />
                            <Input addonBefore="能量指数2：" style={{ width: '150px', marginLeft: 10 }} name='engP2' placeholder="请输入" value={engP2}
                                onChange={this.inputChange.bind(this)} />

                            <audio src={filePath} autoPlay controls style={{ width: 300, height: 30, marginLeft: 10 }}></audio>
                            <Button type='danger' style={{ marginLeft: 10 }} onClick={() => this.caulateLine()}>计算相关性</Button>
                            <Button type='danger' style={{ marginLeft: 10 }} onClick={() => this.caulateDis()}>计算位置</Button>

                        </div>

                        <div style={{ display: "flex", justifyContent: 'space-between', alignItems: "flex-start" }}>
                            <div>
                                {
                                    relativeList.map((item, index) => {
                                        return (
                                            <div style={{ marginBottom: 10 }}>
                                                <Input addonBefore="开始频率：" addonAfter='Hz' style={{ width: '180px' }} name='freq1' placeholder="请输入" value={item.freq1}
                                                    onChange={this.inputChangeIndex.bind(this, index)} />
                                                <Input addonBefore="结束频率：" addonAfter='Hz' style={{ width: '180px', marginLeft: 5 }} name='freq2' placeholder="请输入" value={item.freq2}
                                                    onChange={this.inputChangeIndex.bind(this, index)} />
                                                <Input addonBefore="传播速度：" addonAfter='m/s' style={{ width: '180px', marginLeft: 5 }} name='speed' placeholder="请输入" value={item.speed}
                                                    onChange={this.inputChangeIndex.bind(this, index)} />
                                                <Button type='danger' style={{ marginLeft: 10 }} onClick={() => this.deleteIndex(index)}>删除</Button>
                                                <Checkbox style={{ marginLeft: 10 }} onChange={this.boxChange.bind(this, index)} checked={item.checked}></Checkbox>
                                                {
                                                    index == 0 ? <Button type='primary' style={{ marginLeft: 10 }} onClick={() => this.setSpeed(item, index)}>设置为传播速度</Button> : ''
                                                }
                                            </div>
                                        )
                                    })
                                }
                                <BtnWrap>
                                    <Button type='primary' onClick={() => this.addRelative()}>新增</Button>
                                </BtnWrap>
                            </div>

                            <div >
                                <div>
                                    <Input addonBefore="A听筒当前增益：" style={{ width: '180px' }} name='buffRankA' placeholder="请输入" value={buffRankA}
                                        onChange={this.inputChange.bind(this)} />
                                    <Input addonBefore="采集时间：" style={{ width: '180px', marginLeft: 10 }} name='timeA' addonAfter='s' placeholder="请输入" value={timeA}
                                        onChange={this.inputChange.bind(this)} />
                                    <BtnWrap>
                                        <Button type='primary' onClick={() => { this.findByDeviceId('A') }}>查询增益</Button>
                                        <Button onClick={() => { this.saveBuff('A') }}>保存增益</Button>
                                        <Button type='primary' onClick={() => this.preCollect('A')}>开始预采集</Button>
                                        <Button onClick={() => this.lookPre('A')}>查看时域图</Button>
                                    </BtnWrap>

                                </div>
                                <div>
                                    <Input addonBefore="B听筒当前增益：" style={{ width: '180px' }} name='buffRankB' placeholder="请输入" value={buffRankB}
                                        onChange={this.inputChange.bind(this)} />
                                    <Input addonBefore="采集时间：" style={{ width: '180px', marginLeft: 10 }} name='timeB' addonAfter='s' placeholder="请输入" value={timeB}
                                        onChange={this.inputChange.bind(this)} />
                                    <BtnWrap>
                                        <Button type='primary' onClick={() => { this.findByDeviceId('B') }}>查询增益</Button>
                                        <Button onClick={() => { this.saveBuff('B') }}>保存增益</Button>
                                        <Button type='primary' onClick={() => this.preCollect('B')}>开始预采集</Button>
                                        <Button onClick={() => this.lookPre('B')}>查看时域图</Button>
                                    </BtnWrap>
                                </div>
                            </div>
                            <BtnWrap>

                            </BtnWrap>

                        </div>


                        <div style={{ marginBottom: 10 }}>
                            {
                                dataList.map((item, index) => {
                                    // 计算顶点在A和B之间的相对位置
                                    const vertexPosition = (item.disA / distance) * 100; // 百分比位置
                                    return (
                                        <div style={{
                                            margin: '10px 0',
                                            padding: '10px',
                                            border: '1px solid #e0e0e0',
                                            borderRadius: '4px'
                                        }}>
                                            <span><span style={{ color: 'blue' }}>检测时间：</span>{item.time}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span><span style={{ color: 'blue' }}>备注：</span>{item.remark}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span><span style={{ color: 'blue' }}>分析频段：</span>{item.freq1}-{item.freq2}Hz&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span><span style={{ color: 'blue' }}>顶点坐标：</span> x：{item.maxYIndex}，y:{item.maxYValue}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span><span style={{ color: 'blue' }}>中点坐标：</span> x：{item.middleIndex}，y:{item.middleValue}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                            <span><span style={{ color: 'blue' }}>时间(s)：</span>{item.currentYtime}</span>

                                            {/* A/B两点距离图形 */}
                                            {
                                                distanceVisible &&
                                                <div style={{
                                                    marginTop: '5px',
                                                    padding: '10px 0',
                                                    position: 'relative',
                                                    height: '80px'
                                                }}>
                                                    {/* 总长度线段 */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50px',
                                                        right: '50px',
                                                        height: '2px',
                                                        backgroundColor: '#333'
                                                    }} />

                                                    {/* A点标记及距离 */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50px',
                                                        transform: 'translate(-50%, -50%)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '10px',
                                                            height: '10px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'red',
                                                            margin: '0 auto'
                                                        }} />
                                                        <span style={{ fontSize: '12px' }}>A点</span>
                                                        <div style={{
                                                            fontSize: '16px',
                                                            color: 'red',
                                                            marginTop: '10px'
                                                        }}>
                                                            声源距离A点{item.disA}m
                                                        </div>
                                                    </div>

                                                    {/* B点标记及距离 */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        right: '50px',
                                                        transform: 'translate(50%, -50%)',
                                                        textAlign: 'center'
                                                    }}>
                                                        <div style={{
                                                            width: '10px',
                                                            height: '10px',
                                                            borderRadius: '50%',
                                                            backgroundColor: 'blue',
                                                            margin: '0 auto'
                                                        }} />
                                                        <span style={{ fontSize: '12px' }}>B点</span>
                                                        <div style={{
                                                            fontSize: '16px',
                                                            color: 'blue',
                                                            marginTop: '10px'
                                                        }}>
                                                            声源距离B点{item.disB}m
                                                        </div>
                                                    </div>

                                                    {/* 顶点标记 */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: `calc(50px + (100% - 100px) * ${vertexPosition / 100})`,
                                                        transform: 'translate(-50%, -50%)',
                                                        textAlign: 'center'
                                                    }}>
                                                        {/* <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        backgroundColor: 'green',
                                                        margin: '0 auto'
                                                        }} /> */}
                                                        <Icon type="sound" style={{ fontSize: '40px', color: 'green' }} />
                                                        {/* <span style={{ fontSize: '10px', color: 'green' }}>声源位置</span> */}
                                                    </div>

                                                    {/* 总长度标签 */}
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '80%',
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        fontSize: '16px',
                                                        color: '#666'
                                                    }}>
                                                        总长度: {distance}m
                                                    </div>
                                                </div>
                                            }

                                        </div>
                                    )
                                })
                            }


                        </div>


                        <div ref={
                            (c) => {
                                this.echartsBox = c
                            }
                        }
                            style={{ width: '100%', height: 400 }}
                        />
                        {loading &&
                            <div style={{
                                width: 300, height: 200, margin: "0 auto", position: 'absolute', top: '45%', left: '45%'
                            }}>
                                <Spin size="large" tip="Loading..." style={{
                                    fontSize: 30
                                }} />
                            </div>
                        }
                    </div>


                    <Table onChange={this.pageOnChange} showTotal={this.showTotal.bind(this)} total={total} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
                    <BtnWrap>
                        <Popconfirm placement="topLeft" title='确认删除所选数据吗？' onConfirm={this.deleteData.bind(this)} okText="确定" cancelText="取消">
                            < Button style={{ marginLeft: 10 }} type='danger'> 批量删除 </Button>
                        </Popconfirm>
                        <Button type='primary' onClick={() => this.compare(1)}>A点比对</Button>
                        <Button type='primary' onClick={() => this.compare(2)} >B点比对</Button>
                    </BtnWrap>


                    <div ref={
                        (c) => {
                            this.echartsBoxAdb = c
                        }
                    }
                        style={
                            {
                                width: '100%',
                                height: '400px',
                            }
                        }
                    />
                    <div ref={
                        (c) => {
                            this.echartsBoxAdensity = c
                        }
                    }
                        style={
                            {
                                width: '100%',
                                height: '400px',
                            }
                        }
                    />
                </div>
                < Modal title="曲线图"
                    visible={this.state.Visible}
                    onOk={() => { this.handleClose() }}
                    onCancel={() => { this.handleClose() }}
                    width="95%"
                >

                    <div ref={
                        (c) => {
                            this.echartsBoxSingle1 = c
                        }
                    }
                        style={
                            {
                                width: '100%',
                                height: '400px',
                            }
                        }
                    />
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
                < Modal title="时域图"
                    visible={this.state.preVisible}
                    onOk={() => { this.handleClose() }}
                    onCancel={() => { this.handleClose() }}
                    width="95%"
                >
                    <div>
                        最大增益坐标：X：{this.state.maxYindex},Y:{this.state.maxYpre}
                    </div>
                    <div ref={
                        (c) => {
                            this.echartsBoxpre = c
                        }
                    }
                        style={
                            {
                                width: '100%',
                                height: '500px',
                            }
                        }
                    />
                </Modal>

                < Modal title="修改备注"
                    visible={this.state.editVisible}
                    onOk={() => { this.handleReamrk() }}
                    onCancel={() => { this.handleClose() }}
                    width="40%"
                >
                    <Input addonBefore="备注：" style={{ width: '500px', marginLeft: "10px" }} placeholder="请输入备注:" value={remark1} name='remark1'
                        onChange={this.inputChange.bind(this)} />

                </Modal>
            </Page>
        )
    }
}

export default standardStore;
