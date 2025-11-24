
import React, { Component, useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, Progress, Checkbox, InputNumber, Spin, Tabs, DatePicker } from 'antd';
import stylesCom from '../style.less';
import styles from '../soundhy.less';
const { MonthPicker, RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
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
        receiverGroupIdList: [10,11,12],
        qualityCounts: {},
        groupType: '0',
    }
    componentDidMount() {
        this.getstatistics(3)
    }
    componentWillUnmount() {
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
    getstatistics = (type) => {
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
        service1.statisticsDetector(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret && res.ret.length) {
                    this.setState({
                        staticsData:res.ret || [],
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


    render() {
        const { listenTime, receiverGroupIdList, errorVisible, errorTip, redVisible, machineNo, leaveTime, recordDto } = this.state;
        const { timeValue, djsVisible, machineName, groupType, machineId, machineGroupList, totalCount, begin, staticsData, status, qualityCounts } = this.state;
        return (
            <div style={{width:'100%'}}>
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
                                        <td>{item.groupName}</td>
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
                        {/* <tr>
                            <td colSpan={2}>机型:{machineName}</td>
                            <td colSpan={2}>设备编号:{machineNo}</td>

                        </tr> */}
                        <tr>
                            <td colSpan={4}>
                                <div className={styles.flex}>
                                    <img src={require('@src/assets/timeicon2.png')} style={{ width: 30, height: 30, marginRight: 20, cursor: 'pointer' }} title='从当前时刻开始统计' onClick={() => {
                                        this.getstatistics(1)
                                    }} />
                                    <img src={require('@src/assets/timeicon1.png')} style={{ width: 30, height: 30, marginRight: 20, cursor: 'pointer' }} title='根据时间查询统计' onClick={() => {
                                        this.setState({
                                            staticsTimeVisible: true
                                        })
                                    }} />
                                    <img src={require('@src/assets/fresh.png')} style={{ width: 30, height: 30, marginRight: 20, cursor: 'pointer' }} title='获取最新的当前统计' onClick={() => {
                                        this.getstatistics(3)
                                    }} />
                                </div>
                            </td>
                        </tr>
                         <tr>
                            <td colSpan={4}>
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

                {/* 时间选择弹窗 */}
                <Modal
                    title="统计时间范围"
                    visible={this.state.staticsTimeVisible}
                    onOk={() => this.getstatistics(2)}
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
