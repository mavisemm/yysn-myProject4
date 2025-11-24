import React, {Component} from 'react';
import styles from '../../soundhy.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox} from 'antd';
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
            fullScreen:false,
            fullScreenVisible:false,
            recordId:"",
            machineNo:"",
            machineId:"",
            recordDto: "",
            pointId:13,
            voiceId:"17"
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        pojoList = [];
        const {receiverResponseList=[],recordDto} = {...this.props};
        const {machineId,machineNo,id} = recordDto;
        this.setState({
            receiverResponseList,
            recordId:id,
            machineNo,
            machineId,
            recordDto,
        },()=>{
            this.getplc();
            this.lookStatus();
            this.dealEcharts(receiverResponseList)
        })
    }
    componentWillUnmount(){
       this.disposeEcharts();
    }
    getplc = ()=>{
        let params = {
            detectorId: this.state.voiceId,
        }
        service.getplc(params).then(res => {
            if (res.rc == 0) {
                const {plcCount,normalCount,timeoutCount} = res.ret;
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
    lookStatus = ()=>{
        const {pointId} = this.state;
        service.findNg([pointId]).then(res => {
            if (res.rc == 0) {
                this.setState({
                    status:res.ret[0].status,
                })
            } else {
                message.error(res.err)
            }

        })
    }
    setngStatus = ()=>{
        const {pointId,status} = this.state;
        let params = {
            pointId,
            status:status == 0 ? 1 : 0
        }
        service.ngStatus(params).then(res => {
            if (res.rc == 0) {
                this.lookStatus()
                message.success('设置成功')
            } else {
                message.error(res.err)
            }

        })
    }

    render() {
        const {receiverResponseList,recordId,recordDto,status,plcCount,normalCount,timeoutCount } = this.state;
        return (
            <div style={{width:'100%'}}>
               <div className={styles.echartsContentzc}>
                    {
                       receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                <div className={styles.Contentzc}  key={index}>
                                    <div className={styles.pointNameFlex}>
                                        <div className={styles.resultInfo}>
                                            <div><span>检测时间：</span>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                            <div><span>记录id：</span>{recordDto.id}</div>
                                        </div>
                                         <Button onClick={()=>{this.setngStatus()}}> {status == 0 ? '正常' : '异常'}</Button>
                                    </div>
                                  
                                    <div onClick={()=>{this.lookSingle(item)}} className={styles.pointNameFlex}>
                                        <div><span style={{color:'#3F9CD2'}}>点位名称:</span>{item.pointName}  <span style={{color:item.qualityColor}}>{item.qualityName ? item.qualityName : ''}</span>{item.faultName}</div>
                                        <img src={require('@src/assets/full.png')} style={{width:'30px',height:'30px'}} />
                                    </div>
                                    <div id={item.receiverId + recordId} className={styles.echartsWidth}></div>
                                    {
                                       ( item.errorValue !== null && item.errorValue !==  undefined )? <div className={styles.pyValue}>偏差值：{item.errorValue}</div> :
                                        <div>
                                            <div className={styles.pyValue}>
                                                <div className={styles.flexBetween}>
                                                    <div>
                                                        能量正偏离值：
                                                        <span style={ {color:item.maxDbFlag ? 'red':'white'}}>{(item.difference!=null) ? item.difference.toFixed(1) : ''}</span>
                                                    </div>
                                                    <div>
                                                        能量负偏离值：
                                                        <span style={ {color:item.minDbFlag ? 'red':'white'}}> {(item.minDifference!=null) ? item.minDifference.toFixed(1) : ''}</span>
                                                    </div>
                                                </div>
                                        
                                                <div className={styles.flexBetween}> 
                                                    <div>
                                                        密度正偏离值：
                                                        <span style={ {color:item.maxDensityFlag ? 'red':'white'}}> {(item.densityDifference!=null) ? item.densityDifference.toFixed(1) : ''} </span>
                                                    </div>
                                                    <div>
                                                        密度负偏离值：
                                                        <span style={ {color:item.minDensityFlag ? 'red':'white'}}> {(item.minDensityDifference!=null) ? item.minDensityDifference.toFixed(1) : ''}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                     <div style={{fontSize:14,color:'white'}}>
                                        plc：{plcCount} &nbsp;&nbsp;
                                        正常：{normalCount} &nbsp;&nbsp;
                                        超时：{timeoutCount}
                                    </div>
                         
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
