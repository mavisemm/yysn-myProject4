import React, {Component} from 'react';
import styles from '../style.less'; // 使用新的样式文件
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
            recordDto: ""
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {

        pojoList = [];
        const {receiverResponseList=[],recordDto} = {...this.props};
        const {machineId,machineNo,id} = recordDto;
        let that = this;
        this.setState({
            receiverResponseList,
            recordId:id,
            machineNo,
            machineId,
            recordDto,
        },()=>{
            this.dealEcharts(receiverResponseList)
        })
        // t = setTimeout(function () {
        //     that.saveEchart();
        // }, 2000)
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
        let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListen));
        option.xAxis[0].data =  xArr;
        option.series[0].data = densityArr;
        option.series[1].data = dbArr;
 
        option.legend.data = ['密度', '能量']
        myEcharts.setOption(option)
        // myEcharts.on('finished', () => {
        //     myEcharts.resize()
        // })
    //     var opts = {
    //     type: 'png', // 导出的格式，可选 png, jpeg
    //     pixelRatio: 1.2,// 导出的图片分辨率比例，默认为 1。
    //     backgroundColor: 'black',// 导出的图片背景色，默认使用 option 里的 backgroundColor
    // // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox'],一般也忽略了'toolbox'这栏就够了
    // }
    //     var resBase64 = myEcharts.getDataURL(opts); //拿到base64 地址，就好下载了。
    //     pojoList.push({
    //         receiverId:id,
    //         base64: resBase64
    //     })
        // console.log(resBase64, 'myEcharts')
    }
    saveEchart = ()=>{
        const {listenTime,recordId,machineNo,machineId} = this.state;
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
            
                option.legend.data = ['密度', '能量']
                
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
    closeModal = ()=>{
        this.setState({
            dectorVisible:false,
        })
    }
     lookStatus = (pointId)=>{
        this.setState({
            pointId,
            dectorVisible:true
        })
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
                this.lookStatus(pointId)
                message.success('设置成功')
            } else {
                message.error(res.err)
            }

        })
    }

    render() {
        const {receiverResponseList,recordId,recordDto,status } = this.state;
        return (
            <div style={{width:'100%'}}>
               <div className={styles.echartsContentzc}>
                    {
                       receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                <div className={styles.Contentzc}  key={index}>
                                    <div className={styles.resultInfo}>
                                        <div><span>机型：</span>{recordDto.machineTypeName} &nbsp;&nbsp;&nbsp;&nbsp; <span>检测时间：</span>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                        <div><span>设备编号：</span>{recordDto.machineNo} &nbsp;&nbsp;&nbsp;&nbsp; <span>记录id：</span>{recordDto.id} </div>
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
                                                <div>
                                                    能量正偏离值:
                                                    <span style={ {color:item.maxDbFlag ? 'red':'white'}}>{(item.difference!=null) ? item.difference.toFixed(3) : ''}</span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;能量负偏离值:
                                                    <span style={ {color:item.minDbFlag ? 'red':'white'}}> {(item.minDifference!=null) ? item.minDifference.toFixed(3) : ''}</span>
                                                </div>
                                    
                                                <div> 
                                                    密度正偏离值:
                                                    <span style={ {color:item.maxDensityFlag ? 'red':'white'}}> {(item.densityDifference!=null) ? item.densityDifference.toFixed(3) : ''} </span>
                                                    &nbsp;&nbsp;&nbsp;&nbsp;密度负偏离值:
                                                    <span style={ {color:item.minDensityFlag ? 'red':'white'}}> {(item.minDensityDifference!=null) ? item.minDensityDifference.toFixed(3) : ''}</span>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {/* <BtnWrap>
                                        <Button type='primary' onClick={()=>this.lookStatus(item.pointId)}>当前检测状态查询</Button>
                                    </BtnWrap> */}
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

            {/* 当前听音器状态 */}
            <Modal
                title="当前点位状态"
                visible={this.state.dectorVisible}
                onOk = {this.closeModal}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div>
                        当前点位状态:
                        <span style={{color:"blue"}}> {status == 0 ? '正常检测' : '输出全是NG'}</span>
                    </div>
                    <BtnWrap>
                        <Button type='primary' onClick={()=>{this.setngStatus()}}>切换状态</Button>
                    </BtnWrap>
            </Modal>
            </div>
        )
    }
}

export default WholeBar;
