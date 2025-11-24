import React, {Component} from 'react';
import styles from '../soundWater.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,Switch} from 'antd';
let t = null;
let myEcharts1 = null;
let myEcharts = null;
const { tenantId, userId, token } = vtxInfo;
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
import { withRouter } from 'dva/router';
import echartsOption from '@src/pages/acomponents/optionEcharts';
let stompClient = "";
let echartsArr = [];
let filePath = '';
let compareTable = [];
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullScreen:false,
            fullScreenVisible:false,
            cycleStatus: "",
            frequencyStatus: "",
            standardStatus: "",
            suddenStatus: "",
            sampleStatus:"",
            partitionStatus:"",
            distVisible:true,
            start:'',
            end:"",
        compareVisible: false,

        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        let status = JSON.parse(localStorage.status);
        const {cycleStatus,frequencyStatus,partitionStatus,standardStatus,sampleStatus} = status;
        const {receiverResponseList=[]} = {...this.props};
        this.setState({
            receiverResponseList,
            cycleStatus,
            frequencyStatus,
            standardStatus,
            sampleStatus,
            partitionStatus,
        },()=>{
            this.dealEcharts(receiverResponseList)
        })
    }
    componentWillReceiveProps(newProps) {
     
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
                     let xArr = receiverResponseList[i].freqList.map(value => parseFloat(value.toFixed(2)));
                     let dbArr = [];
                     let densityArr = [];
                     let distArr = [];
                for (let j = 0; j < receiverResponseList[i].frequencyDtoList.length; j++) {
                    if (receiverResponseList[i].frequencyDtoList[j].db == 0) {
                        dbArr.push(undefined)
                    }else{
                        dbArr.push(receiverResponseList[i].frequencyDtoList[j].db.toFixed(2))
                    }
                    densityArr.push(receiverResponseList[i].densityDtoList[j].density.toFixed(3));
                    if (receiverResponseList[i].distDtoList[j].dist) {
                        distArr.push(receiverResponseList[i].distDtoList[j].dist.toFixed(3));
                    }else{
                        distArr.push(undefined)
                    }
        
                }
                this.initEcharts(xArr, dbArr, densityArr, receiverResponseList[i].receiverId,distArr)
                
            }
    }
  


    initEcharts = (xArr, dbArr, densityArr, id,distArr) => {
        let myEcharts = echarts.init(document.getElementById(id));
        echartsArr.push(myEcharts);
        const {distVisible} = this.state;
        let option = distVisible ? JSON.parse(JSON.stringify(echartsOption.optionBlackDist)) : JSON.parse(JSON.stringify(echartsOption.freqOptionListen));
        option.xAxis[0].data =  xArr;
        option.series[0].data = densityArr;
        option.series[1].data = distVisible ? distArr : dbArr;
        option.legend.data = distVisible ? ['密度', '距离'] : ['密度', '能量'];
        myEcharts.setOption(option)
        // myEcharts.on('finished', () => {
        //     myEcharts.resize()
        // })
    }
    lookSingle = (row)=>{
      const {distVisible} = this.state
        filePath = comm.audioUrl + '?recordId=' + this.props.recordId + '&receiverId=' + row.receiverId;
        let option = distVisible ? JSON.parse(JSON.stringify(echartsOption.optionBlackDist)) : JSON.parse(JSON.stringify(echartsOption.freqOptionListen));
        this.setState({
            fullScreenVisible: true
        },()=>{
            let xArr = [];
            let dbArr = [];
            let densityArr = [];
         
            let distArr = [];
            let tempArr = [];

            let frequencyDtoList = row.frequencyDtoList;

            let densityDtoList = row.densityDtoList;
            let freqList = row.freqList;
            let distDtoList = row.distDtoList;
            for (let j = 0; j < frequencyDtoList.length; j++) {
                if (frequencyDtoList[j].db == 0) {
                    dbArr.push(undefined)
                } else {
                    dbArr.push(frequencyDtoList[j].db.toFixed(2))
                }
                densityArr.push(densityDtoList[j].density.toFixed(3));
                if (distDtoList[j].dist) {
                    distArr.push(distDtoList[j].dist.toFixed(3));
                } else {
                    distArr.push(undefined)
                }

            }

            if(this.echartsBox){
                myEcharts1 = echarts.init(this.echartsBox);
                option.xAxis[0].data = freqList.map(value => parseFloat(value.toFixed(2)));

                option.series[0].data = densityArr;
                option.series[1].data = distVisible ? distArr : dbArr;
                option.legend.data = distVisible ? ['密度', '距离'] : ['密度', '能量'];
                
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
    changeBtn = (e) => {
         const {receiverResponseList} = this.state;
         this.disposeEcharts();
        this.setState({
            distVisible: e
        },()=>{
            this.dealEcharts(receiverResponseList)
        })
    }

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    // 计算
    cauclate = ()=>{
        const {receiverResponseList} = this.props;
        const {start,end} = this.state;
        if (start == '' || end == ''){
             message.error('开始频率、结束频率不能为空！');
             return false;
        }
        if (Number(start) > Number(end)) {
            message.error('开始频率不能大于结束频率！');
            return false;
        }
        this.setState({
            compareVisible:true,
        })
        compareTable = [...receiverResponseList];
        for (let i = 0; i < compareTable.length; i++) {
            let total = 0;
            for(let j = 0;j<compareTable[i].frequencyDtoList.length;j++){
                let temp = compareTable[i].frequencyDtoList[j];
            
                if (temp.frequency > start && temp.frequency < end){
                    total += temp.db; 
                }
            }
            compareTable[i] = {
                ...compareTable[i],
                total:total.toFixed(4)
            }
        }
        
    }

    render() {
        const {receiverResponseList,cycleStatus,frequencyStatus,standardStatus,sampleStatus,partitionStatus,start ,end } = this.state;
        return (
            <div >
                <Switch style={{marginRight:20}} checkedChildren="距离密度" unCheckedChildren="能量密度" defaultChecked={true} onChange={this.changeBtn.bind(this)}/>

                <div className={styles.echartsContentzc}>
                    {
                       receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                <div className={styles.Contentzc}  key={index}>
                                    <div onClick={()=>{this.lookSingle(item)}} className={styles.pointNameFlex}>
                                        <div><span style={{color:'#3F9CD2'}}>点位名称:</span>{item.pointName}  <span style={{color:item.qualityColor}}>{item.qualityName ? item.qualityName : '——'}</span>{item.faultName}</div>
                                        <img src={require('@src/assets/full.png')} style={{width:'30px',height:'30px',cursor:'pointer'}} />
                                    </div>
                                    <div id={item.receiverId} className={styles.echartsWidth}></div>
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
                                                                <div style={{color:itemd.qualityColor}}>{itemd.qualityName ? itemd.qualityName : "——"}</div>
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
                                    
                                    {/* <div className={styles.frequencyTablezcWrap}>
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

                                    </div> */}
                                </div> 
                            )
                        })
                    }

                    {/* 距离输入 */}
                    <div className={styles.Contentzc}>
                        <div className={styles.flex}>
                            <Input className={styles.InputStart} placeholder='开始频率' name='start' onChange = {this.inputChange.bind(this)} value={start}/>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                            <Input className={styles.InputStart} placeholder='结束频率' name='end' onChange = {this.inputChange.bind(this)} value={end}/>
                            &nbsp;&nbsp;&nbsp;&nbsp;
                           <div className={styles.caulateBtn} onClick={()=>this.cauclate()} >计算</div>
                        </div>
                        <div className={styles.compareContent}>
                            {
                               this.state.compareVisible && (compareTable).map((item, index) => {
                                    return (
                                        <div key={index} style={{marginTop:10}}>
                                            <div><span style={{color:'#3F9CD2'}}>点位名称:</span>{item.pointName}  <span style={{fontWeight:600,fontSize:20,color:"#249544"}}>{item.total}</span> </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
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
