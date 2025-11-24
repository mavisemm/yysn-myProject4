
import React, { Component, useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, Progress, Checkbox, InputNumber, Spin, Tabs, DatePicker } from 'antd';
// import styles from '../style.less';
import styles from '../soundhy.less';
const { MonthPicker, RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
import Add1 from './Add1';
import Add2 from './Add2';
import Add3 from './Add3';
import Add4 from './Add4';
import Warn from './warn';
import { service, service1 } from '../service';
import { VtxUtil } from '@src/utils/util';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
import comm from '@src/config/comm.config.js';
const { userId, token } = vtxInfo;
import { queryTypeFind, queryMachine, getSoundGroupList } from '@src/models/common1.js';
const tenantId = VtxUtil.getUrlParam('tenantId') ? VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
let socketWarn = '';
let warnTimer = null;
let t = null;
class TabIndex extends React.Component {
    state = {
        loading: false,
        visible: false,
        loginOutVisible: false,
        begin: false,
        staticsData: [],
        staticsTimeVisible: false,
        receiverGroupIdList: [6],
        qualityCounts: {},
        groupType: '0',
    }

    loginOut = () => {
        this.setState({
            loginOutVisible: false,
        })
        this.props.history.push({
            pathname: '/login'
        })
    }
    componentDidMount() {
        if (tenantId) {
            localStorage.groupType = '0';
            this.initalDataBase();
            if (localStorage.voiceInfo) {
                this.setState({
                    voiceName: JSON.parse(localStorage.voiceInfo).name,
                    detailDtoList: JSON.parse(localStorage.voiceInfo).detailDtoList,
                    voiceId: JSON.parse(localStorage.voiceInfo).detailDtoList[0]?.detectorId || '',
                }, () => {
                    this.statisticsDetector(3)
                })
            }
            if (localStorage.machineInfo) {
                let temp = JSON.parse(localStorage.machineInfo);
                localStorage.speed = temp.speedList[0]?.speed || '';
                this.setState({
                    listenTime: temp.listenTime,
                    machineId: temp.id,
                    speedList: temp.speedList,
                    speed: temp.speedList[0]?.speed || '',
                    machineName: temp.name,
                })
            }
            if (localStorage.machineNo) {
                this.setState({
                    machineNo: localStorage.machineNo
                })
            }

        } else {
            this.props.history.push({
                pathname: `/login`
            })
        }

    }
    componentWillUnmount() {
        this.clearClock();
        if (socketWarn) {
            socketWarn.disconnect();
            socketWarn = null;
        }
    }
    checkWebsocket() {
        t = setInterval(() => {
            try {
                socketWarn.send("warn");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeWarn();
            }
            this.statisticsDetector()
        }, 600 * 1000)
    }
    initalDataBase = () => {
        queryTypeFind().then(ret => {
        });
        getSoundGroupList().then(soundList => {
            this.setState({
                soundList,
            });
        });
        queryMachine().then(machineGroupList => {
            if (localStorage.machineInfo) {
                let machineId = JSON.parse(localStorage.machineInfo).id;
                for (let i = 0; i < machineGroupList.length; i++) {
                    let temp = machineGroupList[i];
                    localStorage.speed = temp.speedList[0]?.speed || '';
                    if (machineId == temp.id) {
                        this.setState({
                            listenTime: temp.listenTime,
                            machineName: temp.name,
                            speedList: temp.speedList,
                            speed: temp.speedList[0]?.speed || ''
                        })
                    }
                }
            }

            this.setState({
                machineGroupList,
            });
        });
    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            errorVisible: false,
            timeVisible: false,
            downLoadFileVisible: false,
            staticsTimeVisible: false,
            loginOutVisible: false,
        })
    }

    clearClock = () => {
        if (warnTimer) {
            clearTimeout(warnTimer);
            warnTimer = null;
        }
        if (t) {
            clearInterval(t);
            t = null;
        }
    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
    }
    // 统计
    statisticsDetector = (type) => {
        const { receiverGroupIdList } = this.state;
        const now = Date.now(); // 获取当前时间戳
        // // const oneMonthAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 获取一个月前的时间
        // const oneMonthAgoTimestamp = oneMonthAgo.getTime(); // 获取一个月前的时间戳
        const now1 = new Date(); // 获取当前时间
        const midnight = new Date(now1.getFullYear(), now1.getMonth(), now1.getDate()); // 获取当天凌晨 12 点的时间
        const oneMonthAgoTimestamp = midnight.getTime();
        let params = {}
        if (type == 1) {
            // message.success('已调整为从当前时间开始计数！')
            localStorage.now = now;
            params = {
                startTime: Number(localStorage.now),
                endTime: now,
                tenantId,
                receiverGroupIdList
            }
        } else if (type == 2) {
            const { startTime, endTime } = this.state;
            this.setState({
                staticsTimeVisible: false,
            })
            params = {
                startTime,
                endTime,
                tenantId,
                receiverGroupIdList
            }
        } else {
            if (localStorage.now) {
                params = {
                    startTime: Number(localStorage.now),
                    endTime: now,
                    tenantId,
                    receiverGroupIdList
                }
            } else {
                params = {
                    startTime: oneMonthAgoTimestamp,
                    endTime: now,
                    tenantId,
                    receiverGroupIdList
                }
            }
        }
        service1.statisticsDetectorGroup(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret && res.ret.length) {
                    this.setState({
                        staticsData: res.ret || [],
                    })
                    this.calculateStatistics(res.ret)
                } else {
                    this.setState({
                        staticsData: [],
                    })
                }

            } else {
                message.error(res.err);
            }
        })
    }
    calculateStatistics = (data) => {
        let totalOverallCount = 0;
        const qualityCounts = {};

        data.forEach(point => {
            totalOverallCount += point.totalCount;

            point.detailDtoList.forEach(detail => {
                const { qualityId, count, qualityName } = detail;
                if (!qualityCounts[qualityId]) {
                    qualityCounts[qualityId] = { qualityId, qualityName, count: 0, countRate: 0.0 };
                }
                qualityCounts[qualityId].count += count;
            });
        });

        for (const qualityId in qualityCounts) {
            const totalQualityCount = qualityCounts[qualityId].count;
            qualityCounts[qualityId].countRate = (totalQualityCount / totalOverallCount) * 100;
        }
        this.setState({
            totalCount: totalOverallCount,
            qualityCounts
        })
    }

    // ========================================================= ========================开始听音,结果==========================
    getplc = () => {
        let params = {
            detectorId: this.state.voiceId,
        }
        service.getplc(params).then(res => {
            if (res.rc == 0) {
                const { plcCount, normalCount, timeoutCount } = res.ret;
                this.setState({
                    plcCount,
                    normalCount,
                    timeoutCount
                })
            } else {
                message.error(res.err)
            }

        })
    }
    // =========================================================听音分析，结束===========================
    inputTime = (value) => {
        this.setState({
            timeValue: value
        })
    }
    inputChange = (e) => {
        localStorage.machineNo = e.target.value;
        this.setState({
            machineNo: e.target.value
        })
    }
    timeConfirm = () => {
        const { machineId, timeValue } = this.state;
        let params = {
            tenantId,
            listenTime: timeValue,
            machineId
        }
        service.editSpecialListenTime(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('该机型听音时间修改成功！')
                this.initalDataBase();
                this.setState({
                    listenTime: timeValue,
                    timeVisible: false
                })
            } else {
                message.error(res.err);
            }
        })
    }
    //=======选择听音器组
    voiceChecked = (e) => {
        const { soundList } = this.state;
        for (let i = 0; i < soundList.length; i++) {
            let temp = soundList[i];
            if (e.target.value == temp.id) {
                localStorage.voiceInfo = JSON.stringify(temp);
                this.setState({
                    voiceName: temp.name,
                    detailDtoList: temp.detailDtoList,
                })
            }
        }

    }

    // ======选择机型
    machineChecked = (e) => {
        const { machineGroupList } = this.state;
        for (let i = 0; i < machineGroupList.length; i++) {
            let temp = machineGroupList[i];
            if (e.target.value == temp.id) {
                localStorage.machineInfo = JSON.stringify(temp);
                localStorage.speed = temp.speedList[0]?.speed || '';
                this.setState({
                    machineId: temp.id,
                    listenTime: temp.listenTime,
                    machineName: temp.name,
                    speedList: temp.speedList,
                    speed: temp.speedList[0]?.speed || ''
                })
            }
        }

    }
    // 选择转速
    speedChecked = (e) => {
        localStorage.speed = e.target.value;
        this.setState({
            speed: e.target.value,
        })
    }
    // 选择电机转向
    turnConfirm = () => {
        const { groupType } = this.state;
        let temp = (groupType == 0 ? 1 : 0);
        localStorage.groupType = temp;
        this.setState({
            groupType: groupType == 0 ? 1 : 0
        })
    }

    // 下载质检报告
    exportFile = () => {
        this.setState({
            downLoadFileVisible: true
        })
    }
    confirmDownLoad = () => {
        const { machineId, machineNo } = this.state;
        if (machineId && machineNo) {
            let params = {
                machineNo,
                machineId
            }
            service.exportBatch(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    this.setState({
                        downLoadFileVisible: false
                    })
                    message.success('下载成功')
                    window.location.href = res.ret;
                } else {
                    message.error(res.err);
                }
            })
        } else {
            message.error('机型和设备编号不能为空！')
        }

    }
    startListen = () => {
        this.clearClock();
        this.subscribeWarn();
        this.checkWebsocket();
        let that = this;
        // 开启自动检测
        this.setState({
            begin: false
        }, () => {
            setTimeout(
                that.setState({
                    begin: true
                })
                , 1000);
        })
    }
    getpoint = (msg, result) => {
        const { staticsData } = this.state;
        if (staticsData.length == 0) {
            this.statisticsDetector()
            return false;
        }
        // 创建一个哈希表，用于快速查找
        const pointQualityMap = new Map();
        // 遍历 staticsData，填充哈希表
        for (let i = 0; i < staticsData.length; i++) {
            const { pointId, detailDtoList } = staticsData[i];
            for (let k = 0; k < detailDtoList.length; k++) {
                const { qualityName } = detailDtoList[k];
                const key = `${pointId}-${qualityName}`;
                pointQualityMap.set(key, { index: i, detailIndex: k });
            }
        }

        // 更新 staticsData 中的计数
        for (let j = 0; j < result.length; j++) {
            const { pointId, qualityName } = result[j];
            const key = `${pointId}-${qualityName}`;
            if (pointQualityMap.has(key)) {
                const { index, detailIndex } = pointQualityMap.get(key);
                staticsData[index].detailDtoList[detailIndex].count += 1;
                staticsData[index].totalCount += 1; // 同步更新 totalCount
            }
        }

        // 输出更新后的 staticsData
        console.log(staticsData);
        this.calculateStatistics(staticsData)
    }
    handleWarn = () => {
        let that = this;
        // 当有新消息时，设置warnVisible为true
        // 如果有计时器在运行，清除它
        if (warnTimer) {
            clearTimeout(warnTimer);
        }
        that.setState({
            redVisible: true
        });

        // 设置一个新的计时器，1小时后设置warnVisible为false
        warnTimer = setTimeout(() => {
            that.setState({
                redVisible: false
            });
        }, 60 * 60 * 1000); // 1小时
    }
    // 图标变红
    subscribeWarn() {
        let that = this;
        let socket = new WebSocket(comm.baseurl.eventUrl);
        socketWarn = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        socketWarn.connect(headers, () => {
            socketWarn.subscribe('/assembly-topic/forewarning/' + tenantId, (msg) => {
                if (msg) {
                    that.handleWarn();
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    closeEmail = (msg, result) => {
        this.setState({
            emailVisible: false,
            warnVisible: false
        })
        if (result == 1) {
            if (warnTimer) {
                clearTimeout(warnTimer);
            }
            this.setState({
                redVisible: false
            });
        }
    }
    saveWarn = () => {
        const { qualityId, warnCount, id } = this.state;
        let params = {}
        params = {
            id,
            warnCount,
            qualityId,
            tenantId: localStorage.tenantId,
        }
        service1.saveWarn(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.closeModal();
                message.success('设置成功');
            } else {
                message.error(res.err);
            }
        })
    }
    timeModal = () => {
        const {listenTime} = this.state;
        this.setState({
            timeValue: listenTime,
            timeVisible: true,
        });
    }
    render() {
        const { listenTime, receiverGroupIdList, errorVisible, errorTip, redVisible, machineNo, leaveTime, recordDto } = this.state;
        const { timeValue, djsVisible, machineName, groupType, machineId, machineGroupList, totalCount, begin, staticsData, status, qualityCounts } = this.state;
        return (
            <div className={styles.bodyScreen}>
                <div className={styles.bgStyle}>
                    <div className={styles.headStyle}>
                        <div>
                            <img src={require('@src/assets/voice/logo.png')} className={styles.logo} />
                            <img src={require('@src/assets/voice/headicon.png')} className={styles.headicon} />
                        </div>
                        <div className={styles.flex}>
                            {/* <img src={require('@src/assets/voice/setting.jpg')} className={styles.wifiicon} 
                                onClick={()=>{this.setState({
                                        wifiVisible:true,
                                })}}/> */}
                            {
                                redVisible ? <img src={require('@src/assets/red.png')} onClick={() => { this.setState({ warnVisible: true }) }} className={styles.wifiicon} title='推送条件设置'
                                /> :
                                    <img src={require('@src/assets/green.png')} onClick={() => { this.setState({ warnVisible: true }) }} className={styles.wifiicon} title='推送条件设置'
                                    />
                            }
                            <img src={require('@src/assets/voice/user.png')} className={styles.usericon} />
                            <div className={styles.userFont}>华阳智能</div>
                            <div className={styles.userloginout} onClick={() => {
                                this.setState({
                                    loginOutVisible: true
                                })
                            }}>退出登录</div>
                        </div>
                    </div>
                </div>

                <div className={styles.tabFlex}>
                    <table className={styles.hytable}>
                        <thead>
                            <tr>
                                <th>工位名称</th>
                                <th>总数</th>
                                <th>统计</th>
                                <th>统计</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (staticsData || []).map((item, index) => {
                                    return (
                                        <tr>
                                            <td>{item.pointName}</td>
                                            <td>{item.totalCount}</td>
                                            {
                                                (item.detailDtoList || []).map((itemp, indexp) => {
                                                    return (
                                                        <td key={indexp}>
                                                            {itemp.qualityName}：{itemp.count}&nbsp;&nbsp;({(Number(itemp.countRate) * 100).toFixed(2)}%)&nbsp;&nbsp;
                                                        </td>
                                                    )
                                                })
                                            }
                                        </tr>
                                    )
                                })
                            }
                            <tr>
                                <td colSpan={2}>机型:{machineName}</td>
                                <td colSpan={2}>设备编号:{machineNo}</td>

                            </tr>
                            <tr>
                                <td colSpan={2}>
                                    <div className={styles.flex}>
                                        <img src={require('@src/assets/timeicon2.png')} style={{ width: 30, height: 30, marginRight: 20, cursor: 'pointer' }} title='从当前时刻开始统计' onClick={() => {
                                            this.statisticsDetector(1)
                                        }} />
                                        <img src={require('@src/assets/timeicon1.png')} style={{ width: 30, height: 30, marginRight: 20, cursor: 'pointer' }} title='根据时间查询统计' onClick={() => {
                                            this.setState({
                                                staticsTimeVisible: true
                                            })
                                        }} />
                                        <img src={require('@src/assets/fresh.png')} style={{ width: 30, height: 30, marginRight: 20, cursor: 'pointer' }} title='获取最新的当前统计' onClick={() => {
                                            this.statisticsDetector(3)
                                        }} />
                                    </div>
                                </td>
                                <td colSpan={2}>
                                    <div className={styles.pointNameFlex}>
                                        <div>检测总数：{totalCount}</div>
                                        {
                                            Object.values(qualityCounts).map((item, index) => {
                                                return (
                                                    <div key={index}>
                                                        {item.qualityName}：{item.count}&nbsp;&nbsp;({(Number(item.countRate)).toFixed(2)}%)&nbsp;&nbsp;
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    {/* 操作模块 */}
                    <div className={styles.zcUserconfirm}>
                        <div className={styles.zcUserconfirmflex}>
                            <img src={require('@src/assets/voice/index4.png')} />
                            <select value={this.state.receiverGroupId} className={styles.select1} onChange={this.voiceChecked.bind(this)}>
                                <option value="">请选择听音组</option>
                                {
                                    (this.state.soundList || []).map((item, index) => {
                                        return (
                                            <option value={item.id} key={index}> {item.name} </option>
                                        )
                                    })
                                }
                            </select>
                        </div>
                        <div className={styles.zcUserconfirmflex}>
                            <img src={require('@src/assets/voice/index1.png')} />
                            <select value={this.state.machineId} className={styles.select2} onChange={this.machineChecked.bind(this)}>
                                <option value="">请选择机型</option>
                                {
                                    (machineGroupList || []).map((item, index) => {
                                        return (
                                            <option value={item.id} key={index}> {item.name} </option>
                                        )
                                    })
                                }
                            </select>
                            <div className={styles.zcturnStyle} onClick={() => this.turnConfirm()} >
                                <img src={require('@src/assets/change.png')} className={styles.changeIcon} />
                                {
                                    groupType == 0 ? '正转' : '反转'
                                }
                            </div>
                            <div className={styles.zcSpeedChoose}>
                                <select value={this.state.speed} className={styles.select3} onChange={this.speedChecked.bind(this)}>
                                    <option value="">请选择转速</option>
                                    {
                                        (this.state.speedList || []).map((item, index) => {
                                            return (
                                                <option value={item.speed} key={index}> {item.speed} 转/分钟</option>
                                            )
                                        })
                                    }
                                </select>

                            </div>

                        </div>
                        <div className={styles.zcUserconfirmflex}>
                            <img src={require('@src/assets/voice/index3.png')} />
                            <Input className={styles.InputStylezc} placeholder='请输入设备编号' name='machineNo' onChange={this.inputChange.bind(this)} value={machineNo} />
                            <div className={[styles.buttonStylezc, styles.buttonzc2].join(' ')} onClick={() => this.timeModal()} >听音时间:{listenTime}S</div>
                        </div>
                        <div className={styles.zcUserconfirmflex}>
                            <img src={require('@src/assets/voice/index2.png')} />
                            <div className={[styles.buttonStylezc, styles.buttonzc1].join(' ')} onClick={() => this.startListen()}>开启自动检测</div>
                            <div className={[styles.buttonStylezc, styles.buttonzc2].join(' ')} onClick={() => this.exportFile()}>下载质检报告</div>
                        </div>
                    </div>
                </div>
                {
                    begin && <div className={`${styles.tabFlex} ${styles.container}`}>
                        <div className={styles.left}>
                            <Add1 parent={this}></Add1>
                        </div>
                        <div className={styles.left}>
                            <Add2 parent={this}></Add2>
                        </div>
                        <div className={styles.left}>
                            <Add3 parent={this}></Add3>
                        </div>
                        <div className={styles.left}>
                            <Add4 parent={this}></Add4>
                        </div>
                    </div>
                }

                {
                    this.state.warnVisible && <Warn parent={this} receiverGroupId={receiverGroupIdList}></Warn>
                }

                {/* 听音时间修改 */}
                <Modal
                    title="修改听音时间"
                    visible={this.state.timeVisible}
                    onOk={this.timeConfirm}
                    onCancel={this.closeModal}
                    okText="保存"
                    cancelText="取消"
                >
                    <div className={styles.flex}>
                        修改听音时间(s)：
                        <InputNumber style={{ width: 100, marginLeft: 10 }} onChange={this.inputTime.bind(this)} name='listenTime' value={timeValue} min={0} max={5000} />
                    </div>
                </Modal>
                {/* 退出登录提示 */}
                <Modal
                    title="提示"
                    visible={this.state.loginOutVisible}
                    onOk={this.loginOut}
                    onCancel={this.closeModal}
                    okText="确认"
                    cancelText="取消"
                >
                    <div>确认退出登录吗？</div>
                </Modal>
                {/* 时间选择弹窗 */}
                <Modal
                    title="统计时间范围"
                    visible={this.state.staticsTimeVisible}
                    onOk={() => this.statisticsDetector(2)}
                    onCancel={this.closeModal}
                    okText="查询统计"
                    cancelText="取消"
                >
                    <RangePicker
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        placeholder={['开始时间', '结束时间']}
                        onChange={this.dateChange}
                    />
                </Modal>

            </div>
        );
    }

}

export default TabIndex;
