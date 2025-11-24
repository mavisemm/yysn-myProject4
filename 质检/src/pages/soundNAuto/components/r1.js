import React, {Component} from 'react';
import styles from '../soundNAuto.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,Spin,DatePicker} from 'antd';
import moment, { localeData } from 'moment';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
let t = null;
let myEcharts1 = null;
let myEcharts = null;
const { tenantId, userId, token } = vtxInfo;
let echartsArr = [];
let filePath = '';
let pojoList = [];
let t1 = null;
let t2 = null;
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullScreen:false,
            fullScreenVisible:false,
            recordId:"",
            machineNo:"",
            machineId:"",
            cycleStatus: "",
            frequencyStatus: "",
            standardStatus: "",
            sampleStatus:"",
            partitionStatus:"",
            recordDto: "",
            loadingVisible:false,
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        if(localStorage.status){
            let status = JSON.parse(localStorage.status);
            const {cycleStatus,frequencyStatus,standardStatus,sampleStatus,partitionStatus} = status;
            pojoList = [];
            const {receiverResponseList=[],recordDto} = {...this.props};
            const {machineId,machineNo,id} = recordDto;
            this.setState({
                receiverResponseList,
                recordId:id,
                machineNo,
                machineId,
                recordDto,
                cycleStatus,
                frequencyStatus,
                standardStatus,
                sampleStatus,
                partitionStatus,
            },()=>{
                this.dealEcharts(receiverResponseList)
            })
        }
    }
    componentWillUnmount(){
       this.disposeEcharts();
    }
    componentWillReceiveProps(newProps) {
        if (newProps.showLoading == true) {
            // 执行相应的代码
            this.loadingTips();
        }else{
            this.setState({
                loadingVisible:false
            })
        }
        if (this.props.recordDto !== newProps.recordDto) {
            const {receiverResponseList=[],recordDto} = {...newProps};
            const {machineId,machineNo,id} = recordDto;
            this.setState({
                receiverResponseList,
                recordId:id,
                machineNo,
                machineId,
                recordDto,
            },()=>{
                this.dealEcharts(receiverResponseList)
            })
        }
     }
    loadingTips() {
        this.setState({
            loadingText: '正在听音中...',
            loadingVisible: true,
            djsVisible: true
        })
        let listenTime = Number(this.props.listenTime);
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
    disposeEcharts = ()=>{
        if (echartsArr.length) {
            for(let i = 0;i<echartsArr.length;i++){
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
        for(let i = 0;i<receiverResponseList.length;i++){
                let xArr = [];
                let dbArr = [];
                let densityArr = [];
              
            for (let j = 0; j < receiverResponseList[i].frequencyDtoList.length; j++) {
                xArr.push(receiverResponseList[i].frequencyDtoList[j].frequency.toFixed(0))
                if (receiverResponseList[i].frequencyDtoList[j].db == 0) {
                    dbArr.push(undefined)
                }else{
                    dbArr.push(receiverResponseList[i].frequencyDtoList[j].db.toFixed(2))
                }
                densityArr.push(receiverResponseList[i].densityDtoList[j].density.toFixed(3))
            
            }
            this.initEcharts(xArr, dbArr, densityArr, receiverResponseList[i].receiverId)
            
        }
    }
    initEcharts = (xArr, dbArr, densityArr, id) => {
        const {recordId} = this.state;
        let myEcharts = echarts.init(document.getElementById(id+recordId));
        echartsArr.push(myEcharts);
        let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListen));
        option.xAxis[0].data =  xArr;
        option.series[0].data = densityArr;
        option.series[1].data = dbArr;
        option.legend.data = ['密度', '能量']
        myEcharts.setOption(option)
     
    }

    lookSingle = (row)=>{
        const {recordId} = this.state;
        filePath = comm.audioUrl + '?recordId=' + recordId + '&receiverId=' + row.receiverId;
         let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListen));
        this.setState({
            fullScreenVisible: true
        },()=>{
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
            if(this.echartsBox){
                myEcharts1 = echarts.init(this.echartsBox);
                option.xAxis[0].data = xArr;
                 option.series[0].data = densityArr;
                 option.series[1].data = dbArr;
                option.legend.data = ['密度', '能量']
                myEcharts1.setOption(option)
            }
        })

   
    }
    closeFullScreen = (e) => {
        e.stopPropagation()
        this.setState({
            fullScreenVisible:false
        })
    }

    render() {
        const {receiverResponseList,cycleStatus,
            frequencyStatus,standardStatus,sampleStatus,partitionStatus,recordId,recordDto,djsVisible,leaveTime } = this.state;
        return (
            <div>
                {
                    this.state.loadingVisible ?
                    <div className={styles.loadWrap}>
                        <Spin size="large"/>
                        <p className={styles.loadingTip}>{this.state.loadingText}</p>
                        {
                            djsVisible ? <p className={styles.loadingTip}>听音时间还有<span style={{fontSize:'22px',color:'red'}}>{leaveTime}</span>秒</p> :''
                        }
                    </div> : ''
                }
               <div>
                    {
                       receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                <div className={styles.Contentzc}  key={index}>
                               
                                    <div className={styles.resultInfo}>
                                        <div><span>机型：</span>{recordDto.machineTypeName}</div>
                                        <div><span>检测时间：</span>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                        <div><span>编号：</span>{recordDto.id}</div>
                                    </div>
                                    <div onClick={()=>{this.lookSingle(item)}} className={styles.pointNameFlex}>
                                        <div><span style={{color:'#3F9CD2'}}>点位名称:</span>{item.pointName}  <span style={{color:item.qualityColor}}>{item.qualityName ? item.qualityName : '——'}</span>{item.faultName}</div>
                                        <img src={require('@src/assets/full.png')} style={{width:'30px',height:'30px'}} />
                                    </div>
                                    <div id={item.receiverId + recordId} className={styles.echartsWidth}></div>
                                    {
                                        item.errorValue ? <div className={styles.pyValue}>偏差值：{item.errorValue}</div> : 
                                        <div>
                                            <div className={styles.pyValue}>
                                                {
                                                    sampleStatus == 1 && 
                                                    <div>典型样本偏离度:{(item.sampleDeviation!=null) ? item.sampleDeviation.toFixed(3) :''}&nbsp;&nbsp;&nbsp;&nbsp;{item.sampleConditionName}</div>
                                                }
                                                {
                                                    standardStatus == 1 && 
                                                    <div>标准声音偏离度:{(item.deviation!=null) ? item.deviation.toFixed(3) :''}</div>
                                                }
                                                {
                                                    frequencyStatus == 1 && 
                                                    <div>
                                                        能量正偏离值:
                                                        <span style={ {color:item.maxDbFlag ? 'red':'white'}}>{(item.difference!=null) ? item.difference.toFixed(3) : ''}</span>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;能量负偏离值:
                                                        <span style={ {color:item.minDbFlag ? 'red':'white'}}> {(item.minDifference!=null) ? item.minDifference.toFixed(3) : ''}</span>
                                                    </div>
                                                }
                                                {
                                                    frequencyStatus == 1 && 
                                                    <div> 
                                                        密度正偏离值:
                                                        <span style={ {color:item.maxDensityFlag ? 'red':'white'}}> {(item.densityDifference!=null) ? item.densityDifference.toFixed(3) : ''} </span>
                                                        &nbsp;&nbsp;&nbsp;&nbsp;密度负偏离值:
                                                        <span style={ {color:item.minDensityFlag ? 'red':'white'}}> {(item.minDensityDifference!=null) ? item.minDensityDifference.toFixed(3) : ''}</span>
                                                    </div>
                                                }
                                                {
                                                    partitionStatus == 1 && 
                                                        <div className={styles.frequencyTablezc}>
                                                        <div className={styles.frequencyTitlezc}>
                                                            <div >品质等级</div>
                                                            <div >开始频率</div>
                                                            <div >结束频率</div>
                                                            <div >度量值</div>
                                                        </div>
                                                        {
                                                            (item.partitionDetailDtos || []).map((itemd, indexd) => {
                                                                return (
                                                                    <div className={styles.zccycleList} key={indexd}>
                                                                        <div style={{color:itemd.qualityColor}}>{itemd.qualityName ? itemd.qualityName : ''}</div>
                                                                        <div>{itemd.startCount}</div>
                                                                        <div>{itemd.endCount}</div>
                                                                        <div>{(itemd.value!=null) ? itemd.value.toFixed(3) : ''}</div>
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
                                                    <div style={{width:'49%'}}>
                                                        <div className={styles.frequencyTablezc}>
                                                            <div className={styles.frequencyTitlezc}>
                                                                <div style={{color:'orange'}}>标准周期</div>
                                                                <div >能量</div>
                                                                <div >频率</div>
                                                                <div >稳定度</div>
                                                            </div>
                                                            {
                                                                (item.receiverEChartDataList || []).map((itemd, indexd) => {
                                                                    return (
                                                                        
                                                                            itemd.standardCycle ?<div className={styles.zccycleList} key={indexd}>
                                                                            <div>{itemd.standardCycle || '/'}</div>
                                                                            <div>{itemd.standardDb || '/'}</div>
                                                                            <div>{itemd.standardFrequency || '/'}</div>
                                                                            <div>{itemd.standardMatchDegree || '/'}</div>
                                                                        </div> : ''
                                                                    )
                                                                })
                                                            }
                                                        
                                                        </div>
                                                    </div>
                                                }
                                            
                                                <div  style={{width:cycleStatus == 0 ? '100%':'49%'}}>
                                                    <div className={styles.frequencyTablezc}>
                                                        <div className={styles.frequencyTitlezc}>
                                                            <div style={{color:'orange'}}>检测周期</div>
                                                            <div >能量</div>
                                                            <div >频率</div>
                                                            <div >稳定度</div>
                                                        </div>
                                                        {
                                                            (item.receiverEChartDataList || []).map((itemd, indexd) => {
                                                                return (
                                                                    itemd.cycle ?
                                                                    <div className={styles.zccycleList} style={{color:itemd.colorFlag ? 'red':'white'}}  key={indexd}>
                                                                        <div>{itemd.cycle || '/'}</div>
                                                                        <div>{itemd.db || '/'}</div>
                                                                        <div>{itemd.frequency || '/'}</div>
                                                                        <div>{itemd.matchDegree || '/'}</div>
                                                                    </div> : ''
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    }

                                </div> 
                            )
                        })
                    }
                </div>
                {/* 全屏查看 */}
                {
                this.state.fullScreenVisible ?
                <div className={styles.fullScreenzc}>
                    <div className={styles.screenContentzc}>
                        <div className={styles.screenzcClose} onClick={this.closeFullScreen.bind(this)}>
                            <div></div>
                            <img src={require('@src/assets/voice/close.png')} className={styles.closeIconzc}/>
                        </div>
                        <div ref = {
                            (c) => {
                                this.echartsBox = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '70%',
                                marginTop:'100px'
                            }
                        }
                        />
                        < div className={styles.ZCAudioStyle}>
                            <audio  src={filePath} controls></audio>
                        </div>
                    </div>
         
                </div> :""
            }
            </div>
        )
    }
}

export default WholeBar;
