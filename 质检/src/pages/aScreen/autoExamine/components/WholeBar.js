import React, { Component } from 'react';
import styles from '../../style.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import { service } from '../../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, Progress, Checkbox } from 'antd';
import moment, { localeData } from 'moment';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
import { BtnWrap } from 'rc-layout';

let t = null;
let myEcharts1 = null;
let myEcharts = null;
const { tenantId, userId, token } = vtxInfo;
let echartsArr = [];
let filePath = '';
let pojoList = [];

class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullScreen: false,
            fullScreenVisible: false,
            recordId: "",
            machineNo: "",
            machineId: "",
            cycleStatus: "",
            frequencyStatus: "",
            standardStatus: "",
            sampleStatus: "",
            partitionStatus: "",
            recordDto: ""
        }
    }

    componentDidMount() {
        let status = JSON.parse(localStorage.status);
        const { cycleStatus, sampleStatus, frequencyStatus, partitionStatus, standardStatus } = status;

        pojoList = [];
        const { receiverResponseList = [], recordDto } = { ...this.props };
        const { machineId, machineNo, id } = recordDto;

        this.setState({
            receiverResponseList,
            recordId: id,
            machineNo,
            machineId,
            recordDto,
            cycleStatus,
            frequencyStatus,
            standardStatus,
            sampleStatus,
            partitionStatus,
        }, () => {
            this.dealEcharts(receiverResponseList)
            // ECharts渲染后强制resize，适配父容器宽度
            setTimeout(() => {
                echartsArr.forEach(chart => chart.resize());
            }, 200);
        })
    }

    componentWillUnmount() {
        this.disposeEcharts();
    }

    disposeEcharts = () => {
        if (echartsArr.length) {
            for (let i = 0; i < echartsArr.length; i++) {
                echartsArr[i].dispose();
            }
            echartsArr = [];
        }
        if (myEcharts1) {
            myEcharts1.dispose();
            myEcharts1 = null;
        }
    }

    dealEcharts = (receiverResponseList) => {
        for (let i = 0; i < receiverResponseList.length; i++) {
            let xArr = [];
            let dbArr = [];
            let densityArr = [];
            for (let j = 0; j < receiverResponseList[i].frequencyDtoList.length; j++) {
                xArr.push(receiverResponseList[i].frequencyDtoList[j].frequency.toFixed(0))
                if (receiverResponseList[i].frequencyDtoList[j].db == 0) {
                    dbArr.push(undefined)
                } else {
                    dbArr.push(receiverResponseList[i].frequencyDtoList[j].db.toFixed(2))
                }
                densityArr.push(receiverResponseList[i].densityDtoList[j].density.toFixed(3))
            }
            this.initEcharts(xArr, dbArr, densityArr, receiverResponseList[i].receiverId)
        }
    }

    initEcharts = (xArr, dbArr, densityArr, id) => {
        const { recordId } = this.state;
        // 确保DOM元素已渲染完成
        const dom = document.getElementById(id + recordId);
        if (!dom) return;

        let myEcharts = echarts.init(dom);
        echartsArr.push(myEcharts);
        let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListen));
        option.xAxis[0].data = xArr;
        option.series[0].data = densityArr;
        option.series[1].data = dbArr;
        option.legend.data = ['密度', '能量'];

        myEcharts.setOption(option);

        // 监听窗口resize，自动适配宽度
        window.addEventListener('resize', () => {
            myEcharts.resize();
        });
    }

    saveEchart = () => {
        const { listenTime, recordId, machineNo, machineId } = this.state;
        let params = {
            pojoList,
            recordId,
            machineId,
            machineNo
        }
        service.saveEchart(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {

            } else {
                message.error(res.err);
            }
        })
    }

    lookSingle = (row) => {
        const { recordId } = this.state;
        filePath = comm.audioUrl + '?recordId=' + recordId + '&receiverId=' + row.receiverId;
        let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListen));

        this.setState({
            fullScreenVisible: true
        }, () => {
            let xArr = [];
            let dbArr = [];
            let densityArr = [];

            let frequencyDtoList = row.frequencyDtoList;
            let densityDtoList = row.densityDtoList;
            for (let j = 0; j < frequencyDtoList.length; j++) {
                xArr.push(frequencyDtoList[j].frequency.toFixed(0))
                if (frequencyDtoList[j].db == 0) {
                    dbArr.push(undefined)
                } else {
                    dbArr.push(frequencyDtoList[j].db.toFixed(2))
                }
                densityArr.push(densityDtoList[j].density.toFixed(3))
            }

            if (this.echartsBox) {
                myEcharts1 = echarts.init(this.echartsBox);
                option.xAxis[0].data = xArr;
                option.series[0].data = densityArr;
                option.series[1].data = dbArr;
                option.legend.data = ['密度', '能量'];
                myEcharts1.setOption(option);
                myEcharts1.resize(); // 强制resize适配全屏宽度
            }
        })
    }

    closeFullScreen = (e) => {
        e.stopPropagation()
        this.setState({
            fullScreenVisible: false
        })
    }

    closeModal = () => {
        this.setState({
            dectorVisible: false,
        })
    }

    lookStatus = (pointId) => {
        this.setState({
            pointId,
            dectorVisible: true
        })
        service.findNg([pointId]).then(res => {
            if (res.rc == 0) {
                this.setState({
                    status: res.ret[0].status,
                })
            } else {
                message.error(res.err)
            }
        })
    }

    setngStatus = () => {
        const { pointId, status } = this.state;
        let params = {
            pointId,
            status: status == 0 ? 1 : 0
        }
        service.ngStatus(params).then(res => {
            if (res.rc == 0) {
                this.lookStatus(pointId)
                message.success('设置成功')
            } else {
                message.error(res.err)
            }
        })
    }

    render() {
        const { receiverResponseList, cycleStatus,
            frequencyStatus, standardStatus, sampleStatus, partitionStatus, recordId, recordDto, status } = this.state;

        return (
            <div style={{ width: '100%', height: '100%' }}>
                {/* 核心调整：echartsContentzc 改为自适应布局，取消固定列宽 */}
                <div className={styles.echartsContentzc}>
                    {
                        receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                // 调整：Contentzc 改为自适应父容器宽度，而非固定32%
                                <div className={styles.Contentzc} key={index}>
                                    <div className={styles.resultInfo}>
                                        <div><span>机型：</span>{recordDto.machineTypeName || '未获取'}</div>
                                        <div><span>检测时间：</span>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                        <div><span>设备编号：</span>{recordDto.machineNo || '未获取'}</div>
                                        <div><span>记录id：</span>{recordDto.id || '未获取'}</div>
                                    </div>

                                    <div onClick={() => { this.lookSingle(item) }} className={styles.pointNameFlex}>
                                        <div>
                                            <span style={{ color: '#3F9CD2' }}>点位名称:</span>
                                            {item.pointName}
                                            <span style={{ color: item.qualityColor }}>{item.qualityName ? item.qualityName : ''}</span>
                                            {item.faultName}
                                        </div>
                                        <img
                                            src={require('@src/assets/full.png')}
                                            style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                                            alt="全屏查看"
                                        />
                                    </div>

                                    {/* 关键：ECharts容器宽度100%，高度自适应 */}
                                    <div
                                        id={item.receiverId + recordId}
                                        className={styles.echartsWidth}
                                        style={{ width: '100%', height: '350px' }} // 增加高度，适配宽屏
                                    ></div>

                                    {
                                        (item.errorValue !== null && item.errorValue !== undefined) ?
                                            <div className={styles.pyValue}>偏差值：{item.errorValue}</div> :
                                            <div className={styles.pyValueWrap}>
                                                <div className={styles.pyValue}>
                                                    {
                                                        sampleStatus == 1 &&
                                                        <div>
                                                            典型样本偏离度:
                                                            {(item.sampleDeviation != null) ? item.sampleDeviation.toFixed(3) : ''}
                                                            &nbsp;&nbsp;&nbsp;&nbsp;{item.sampleConditionName || ''}
                                                        </div>
                                                    }
                                                    {
                                                        standardStatus == 1 &&
                                                        <div>
                                                            标准声音偏离度:
                                                            {(item.deviation != null) ? item.deviation.toFixed(3) : ''}
                                                        </div>
                                                    }
                                                    {
                                                        frequencyStatus == 1 &&
                                                        <div className="deviation-row">
                                                            <span>能量正偏离值:</span>
                                                            <span style={{ color: item.maxDbFlag ? 'red' : 'white' }}>
                                                                {(item.difference != null) ? item.difference.toFixed(3) : ''}
                                                            </span>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            <span>能量负偏离值:</span>
                                                            <span style={{ color: item.minDbFlag ? 'red' : 'white' }}>
                                                                {(item.minDifference != null) ? item.minDifference.toFixed(3) : ''}
                                                            </span>
                                                        </div>
                                                    }
                                                    {
                                                        frequencyStatus == 1 &&
                                                        <div className="deviation-row">
                                                            <span>密度正偏离值:</span>
                                                            <span style={{ color: item.maxDensityFlag ? 'red' : 'white' }}>
                                                                {(item.densityDifference != null) ? item.densityDifference.toFixed(3) : ''}
                                                            </span>
                                                            &nbsp;&nbsp;&nbsp;&nbsp;
                                                            <span>密度负偏离值:</span>
                                                            <span style={{ color: item.minDensityFlag ? 'red' : 'white' }}>
                                                                {(item.minDensityDifference != null) ? item.minDensityDifference.toFixed(3) : ''}
                                                            </span>
                                                        </div>
                                                    }
                                                    {
                                                        partitionStatus == 1 &&
                                                        <div className={styles.frequencyTablezc}>
                                                            <div className={styles.frequencyTitlezc}>
                                                                <div>品质等级</div>
                                                                <div>开始频率</div>
                                                                <div>结束频率</div>
                                                                <div>度量值</div>
                                                            </div>
                                                            {
                                                                (item.partitionDetailDtos || []).map((itemd, indexd) => {
                                                                    return (
                                                                        <div className={styles.zccycleList} key={indexd}>
                                                                            <div style={{ color: itemd.qualityColor }}>{itemd.qualityName ? itemd.qualityName : ''}</div>
                                                                            <div>{itemd.startCount || '-'}</div>
                                                                            <div>{itemd.endCount || '-'}</div>
                                                                            <div>{(itemd.value != null) ? itemd.value.toFixed(3) : '-'}</div>
                                                                        </div>
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    }
                                                </div>

                                                <div className={styles.frequencyTablezcWrap}>
                                                    {
                                                        cycleStatus == 1 &&
                                                        <div className="cycle-column">
                                                            <div className={styles.frequencyTablezc}>
                                                                <div style={{ color: 'orange', fontSize: '16px', marginBottom: '8px' }}>标准周期：</div>
                                                                <div className={styles.frequencyTitlezc}>
                                                                    <div>周期(ms)</div>
                                                                    <div>能量</div>
                                                                    <div>频率</div>
                                                                    <div>稳定度</div>
                                                                </div>
                                                                {
                                                                    (item.receiverEChartDataList || []).map((itemd, indexd) => {
                                                                        return (
                                                                            itemd.standardCycle ?
                                                                                <div className={styles.zccycleList} key={indexd}>
                                                                                    <div>{itemd.standardCycle || '-'}</div>
                                                                                    <div>{itemd.standardDb || '-'}</div>
                                                                                    <div>{itemd.standardFrequency || '-'}</div>
                                                                                    <div>{itemd.standardMatchDegree || '-'}</div>
                                                                                </div> : ''
                                                                        )
                                                                    })
                                                                }
                                                            </div>
                                                        </div>
                                                    }

                                                    <div className={`cycle-column ${cycleStatus == 0 ? 'full-width' : ''}`}>
                                                        <div className={styles.frequencyTablezc}>
                                                            <div style={{ color: 'orange', fontSize: '16px', marginBottom: '8px' }}>检测周期：</div>
                                                            <div className={styles.frequencyTitlezc}>
                                                                <div>周期(ms)</div>
                                                                <div>能量</div>
                                                                <div>频率</div>
                                                                <div>稳定度</div>
                                                            </div>
                                                            {
                                                                (item.receiverEChartDataList || []).map((itemd, indexd) => {
                                                                    return (
                                                                        itemd.cycle ?
                                                                            <div className={styles.zccycleList} style={{ color: itemd.colorFlag ? 'red' : 'white' }} key={indexd}>
                                                                                <div>{itemd.cycle || '-'}</div>
                                                                                <div>{itemd.db || '-'}</div>
                                                                                <div>{itemd.frequency || '-'}</div>
                                                                                <div>{itemd.matchDegree || '-'}</div>
                                                                            </div> : ''
                                                                    )
                                                                })
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                    }

                                    <div style={{ marginTop: '15px', textAlign: 'center' }}>
                                        <BtnWrap>
                                            <Button
                                                type='primary'
                                                onClick={() => this.lookStatus(item.pointId)}
                                                style={{ backgroundColor: '#3F9CD2', borderColor: '#3F9CD2' }}
                                            >
                                                当前检测状态查询
                                            </Button>
                                        </BtnWrap>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                {/* 全屏查看弹窗 */}
                {
                    this.state.fullScreenVisible ?
                        <div className={styles.fullScreenzc}>
                            <div className={styles.screenContentzc}>
                                <div className={styles.screenzcClose} onClick={this.closeFullScreen.bind(this)}>
                                    <img
                                        src={require('@src/assets/voice/close.png')}
                                        className={styles.closeIconzc}
                                        style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                                        alt="关闭"
                                    />
                                </div>
                                <div
                                    ref={(c) => { this.echartsBox = c }}
                                    style={{ width: '100%', height: '70%', marginTop: '50px' }}
                                />
                                <div className={styles.ZCAudioStyle}>
                                    <audio src={filePath} controls style={{ width: '80%', height: '50px' }}></audio>
                                </div>
                            </div>
                        </div> : ""
                }

                {/* 当前听音器状态弹窗 */}
                <Modal
                    title="当前点位状态"
                    visible={this.state.dectorVisible}
                    onOk={this.closeModal}
                    onCancel={this.closeModal}
                    okText="确认"
                    cancelText="取消"
                    width={400}
                >
                    <div style={{ fontSize: '16px', marginBottom: '20px' }}>
                        当前点位状态:
                        <span style={{ color: "blue", marginLeft: '8px' }}>
                            {status == 0 ? '正常检测' : '输出全是NG'}
                        </span>
                    </div>
                    <BtnWrap>
                        <Button
                            type='primary'
                            onClick={() => { this.setngStatus() }}
                            style={{ backgroundColor: '#3F9CD2', borderColor: '#3F9CD2' }}
                        >
                            切换状态
                        </Button>
                    </BtnWrap>
                </Modal>
            </div>
        )
    }
}

export default WholeBar;