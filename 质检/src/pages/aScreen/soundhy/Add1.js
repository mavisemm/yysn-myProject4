
import React, { Component, useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, Progress, Checkbox, InputNumber, Spin, DatePicker } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import styles from '../soundhy.less';
import WholeBar from './components/WholeBar';
import { service, service1 } from '../service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const { userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
message.config({
    top: 400,
    duration: 2,
});
let socketRecordid = "";
let socketLoading = '';
let t1 = null;
let t = null;
let t2 = null;
let resultArr = [];
const tenantId = VtxUtil.getUrlParam('tenantId') ? VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
class voiceIndex extends React.Component {
    state = {
        loading: false,
        visible: false,
        machineId: "",
        loadingVisible: false,
        listenTime: 0,
        loadingText: '听音数据采集中...',
        djsVisible: false,
        leaveTime: 0,
        recordDto: {},
        showResult: false,
        errorVisible: false,
        errorTip: "",
        timeVisible: false,
        recordId: '',
        degree: 0.3,
        degree2: 0.3,
        machineNo: "",
        receiverGroupId: "6",//211听音器
        voiceId: "14",
        detectorIdList: [14],
        // receiverGroupId:244,//211听音器
        // voiceId:286,
        // detectorIdList:[286],
    }
    constructor(props) {
        super(props);
        this.namespace = 'HuaYang';
    }
    componentWillUnmount() {
        this.clearClock();
        if (socketLoading) {
            socketLoading.disconnect();
            socketLoading = null;
        }
        if (socketRecordid) {
            socketRecordid.disconnect();
            socketRecordid = null;
        }
    }
    componentDidMount() {
        if (tenantId) {
            if (localStorage.machineNo) {
                this.setState({
                    machineNo: localStorage.machineNo
                })
            }
            if (localStorage.machineInfo) {
                let temp = JSON.parse(localStorage.machineInfo);
                this.setState({
                    listenTime: temp.listenTime,
                    machineId: temp.id,

                }, () => {
                    this.run();
                })
            }
        } else {
            this.props.history.push({
                pathname: `/login`
            })
        }

    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            errorVisible: false,
            timeVisible: false,
        })
    }

    clearClock = () => {
        if (t) {
            clearInterval(t);
            t = null;
        }
        try {
            clearTimeout(t1)
        } catch (error) { }
        t1 = null;

        try {
            clearTimeout(t2)
        } catch (error) { }
        t2 = null;
    }
    // 统计
    statisticsDetector = (res) => {
        let arr = [];
        for (let i = 0; i < res.length; i++) {
            arr.push({
                pointId: res[i].pointId,
                qualityName: res[i].qualityName
            })
        }
        this.props.parent.getpoint(this, arr);
    }
    checkWebsocket() {
        t = setInterval(() => {
            try {
                socketLoading.send("testLoading");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeLoading();
            }
            try {
                socketRecordid.send("test");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeRecordid();
            }
        }, 3 * 1000)
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
                loadingText: '检测报告分析中....',
                djsVisible: false
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

    // ========================================================= ========================开始听音,结果==========================
    run() {
        this.clearClock();
        if (socketRecordid) {
            socketRecordid.disconnect();
            socketRecordid = null;
        }
        const { machineId, degree, degree2, machineNo, receiverGroupId, listenTime, detectorIdList } = this.state;
        this.setState({
            showResult: false,
            loadingText: '正在听音中...',
            loadingVisible: true,
        })
        let params = {
            tenantId,
            machineId,
            detectorIdList,
            groupType: localStorage.groupType,
            speed: localStorage.speed,
            degree,
            degree2,
            machineNo,
            listenTime,
            receiverGroupId
        }
        service.run(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.checkWebsocket();
                this.subscribeRecordid();
                this.subscribeLoading()
            } else {
                this.clearClock();
                this.setState({
                    loadingVisible: false,
                    loadingText: '',
                    errorVisible: true,
                    errorTip: res.err
                })
            }
        })
    }
    subscribeRecordid() {
        const { voiceId } = this.state;
        let that = this;
        let socket = new WebSocket(comm.baseurl.eventUrl);
        socketRecordid = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        socketRecordid.connect(headers, () => {
            socketRecordid.subscribe('/assembly-topic/batchDetectorRecordDetailAndReceiver/' + voiceId, (msg) => {
                if (msg) {
                    let temp = JSON.parse(msg.body);
                    that.queryDetectorRecord(temp)
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    //倒计时
    subscribeLoading() {
        let voiceId = this.state.voiceId;
        let that = this;
        // 建立连接对象
        let socket = new WebSocket(comm.baseurl.eventUrl);
        // 获取STOMP子协议的客户端对象
        socketLoading = Stomp.over(socket);
        // 定义客户端的认证信息,按需求配置
        let headers = {
            Authorization: ''
        }
        // 向服务器发起websocket连接
        socketLoading.connect(headers, () => {
            socketLoading.subscribe('/assembly-topic/batchDetectorStartRecord/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                if (msg) {
                    that.loadingTips();
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    // 听音结果分析,todo
    queryDetectorRecord(res) {
        console.log(res, 'res')
        this.clearClock();
        this.setState({
            showResult: false,
        })
        resultArr = [];
        if (res.rc == 0) {
            const { recordDto, receiverResponseList } = res.ret;
            this.statisticsDetector(receiverResponseList);

            resultArr.push(res.ret);
            if (recordDto.status == 1) {
                this.setState({
                    receiverResponseList,
                    loadingVisible: false,
                    recordDto: recordDto || {},
                    loadingText: '听音数据采集中...',
                    showResult: true,
                })
            } else {
                message.error(res.err)
            }
        } else {
            this.setState({
                loadingVisible: false,
                errorVisible: true,
                errorTip: res.err || '听音异常！'
            })

        }
    }
    // =========================================================听音分析，结束===========================

    render() {
        const { listenTime, showResult, errorVisible, errorTip, leaveTime, djsVisible, plcCount, normalCount, timeoutCount } = this.state;
        return (
            <div className={styles.contentWrap}>
                <div className={styles.echartsContainer}>
                    {
                        showResult && (resultArr || []).map((item, index) => {
                            return (
                                <WholeBar receiverResponseList={item.receiverResponseList} recordDto={item.recordDto} parent={this} key={index} />
                            )
                        })
                    }
                </div>
                {
                    this.state.loadingVisible ?
                        <div className={styles.loading}>
                            <Spin size="large" />
                            <p className={styles.loadingTip}>{this.state.loadingText}</p>
                            {
                                djsVisible ? <p className={styles.loadingTip}>听音时间还有<span style={{ fontSize: '22px', color: 'red' }}>{leaveTime}</span>秒</p> : ''
                            }
                        </div> : ''
                }
                {/* 错误确认弹窗 */}
                <Modal
                    title="提示"
                    visible={errorVisible}
                    onOk={this.closeModal}
                    onCancel={this.closeModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <div> {errorTip}</div>
                </Modal>
            </div>
        );
    }
}

export default voiceIndex;
