import React, {Component} from 'react';
import styles from '../../autoReceiver.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox} from 'antd';
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
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
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
    componentWillUnmount(){
       this.disposeEcharts();
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
        let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListenNoZoom));
        option.xAxis[0].data =  xArr;
        option.series[0].data = densityArr;
        option.series[1].data = dbArr;

        option.legend.data = ['密度', '能量'];
        myEcharts.setOption(option)
        // myEcharts.on('finished', () => {
        //     myEcharts.resize()
        // })
     
    }

    lookSingle = (row)=>{
        const {recordId} = this.state;
        filePath = comm.audioUrl+'?recordId=' + recordId + '&receiverId=' + row.receiverId;
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
                option.legend.data = ['密度', '能量'];
                myEcharts1.setOption(option)
                // myEcharts1.on('finished', () => {
                //     myEcharts1.resize()
                // })
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
            frequencyStatus,standardStatus,sampleStatus,partitionStatus,recordId,recordDto } = this.state;
        return (
            <div>
                {
                    receiverResponseList && (receiverResponseList || []).map((item, index) => {
                        return (
                            <div className={styles.Contentzc}  key={index}>
                                <div onClick={()=>{this.lookSingle(item)}} className={styles.pointNameFlex}>
                                    <div><span style={{color:'#3F9CD2'}}>工位:</span>{item.pointName}  <span style={{color:item.qualityColor,fontWeight:600,fontSize:20}}>{item.qualityName ? item.qualityName : '——'}</span>{item.faultName}</div>
                                    <div  className={styles.NumberStyle}>
                                         { moment(this.props.recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}
                                         </div>   
                                    
                                    <img src={require('@src/assets/full.png')} style={{width:'30px',height:'30px'}} />
                                </div>
                                <div  className={styles.NumberStyle}>
                                    <span style={{color:'#3F9CD2'}}>编号:</span>{this.props.recordDto.id}&nbsp;
                                  
                                </div>
                                <div id={item.receiverId + recordId} className={styles.echartsWidth}></div>
                                {/* <div>
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
                            
                                </div> */}
                            </div> 
                        )
                    })
                }
                
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
