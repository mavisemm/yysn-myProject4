import React, {Component} from 'react';
import styles from '../../style.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service,service1} from '../../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox} from 'antd';
let t = null;
let myEcharts1 = null;
let myEcharts = null;
const {  userId, token } = vtxInfo;
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
import { withRouter } from 'dva/router';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import { BtnWrap } from 'rc-layout';
import { trimEnd } from 'lodash';
let stompClient = "";
let echartsArr = [];
let filePath = '';
let pojoList = [];
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullScreen:false,
            fullScreenVisible:false,
            groupRecordDtoList:[],
            optionList:[
                // {
                //     type:1,
                //     name:'按照能量偏移从大到小排序'
                // },
                // {
                //     type:2,
                //     name:'按照密度偏移从大到小排序'
                // },
                {
                    type:3,
                    name:'按照默认顺序排序'
                },
                {
                    type: 4,
                    name: '按照分组顺序排序'
                },
            ],
            groupVisible:false,
            sortVisible:true,
            recordId:"",
            machineNo:"",
            machineId:"",
            cycleStatus: "",
            frequencyStatus: "",
            standardStatus: "",
            suddenStatus: "",
            sampleStatus:"",
            partitionStatus:"",
            driftType:'',
            tagList:[]
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        let status = JSON.parse(localStorage.status);
        const {cycleStatus,sampleStatus,frequencyStatus,partitionStatus,standardStatus} = status;
        pojoList = [];
        const {receiverResponseList=[],groupRecordDtoList,recordId ,machineNo,machineId} = {...this.props};
        let that = this;
        let arr = [];
        for(let i = 0;i<groupRecordDtoList.length;i++){
            if(groupRecordDtoList[i].receiverDtoList.length){
                arr.push(groupRecordDtoList[i])
            }
        }
        this.setState({
            receiverResponseList,
            groupRecordDtoList:arr,
            recordId,
            machineNo,
            machineId,
            cycleStatus,
            frequencyStatus,
            standardStatus,
            sampleStatus,
            partitionStatus,
            tagList:JSON.parse(localStorage.tagList) ? JSON.parse(localStorage.tagList) : [],
        },()=>{
            this.dealEcharts(receiverResponseList)
            that.dealData(receiverResponseList, arr)
        })
        // t = setTimeout(function () {
        //     that.saveEchart();
        // }, 5000)
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
    
    dealData = (receiverResponseList, groupRecordDtoList) => {
        for(let m = 0;m<groupRecordDtoList.length;m++){
            if(groupRecordDtoList[m].receiverDtoList.length){
              for(let i = 0;i<groupRecordDtoList[m].receiverDtoList.length;i++){
                    for(let j = 0;j<receiverResponseList.length;j++){
                        if(receiverResponseList[j].receiverId == groupRecordDtoList[m].receiverDtoList[i].id){
                            groupRecordDtoList[m].receiverDtoList[i] = {
                                ...groupRecordDtoList[m].receiverDtoList[i],
                                ...receiverResponseList[j],
                            }
                        }
                    }              
              }
            }
        }
        this.setState({
            groupRecordDtoList
        })
        // this.dealEchartsGroup(groupRecordDtoList);
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
    dealEchartsGroup = (groupRecordDtoList) => {
      
        for(let m = 0;m<groupRecordDtoList.length;m++){
            for(let i = 0;i<groupRecordDtoList[m].receiverDtoList.length;i++){
                     let xArr = [];
                     let dbArr = [];
                     let densityArr = [];
                for (let j = 0; j < groupRecordDtoList[m].receiverDtoList[i].frequencyDtoList.length; j++) {
                    xArr.push(groupRecordDtoList[m].receiverDtoList[i].frequencyDtoList[j].frequency.toFixed(0))
                    if (groupRecordDtoList[m].receiverDtoList[i].frequencyDtoList[j].db == 0) {
                        dbArr.push(undefined)
                    }else{
                        dbArr.push(groupRecordDtoList[m].receiverDtoList[i].frequencyDtoList[j].db.toFixed(2))
                    }
                    densityArr.push(groupRecordDtoList[m].receiverDtoList[i].densityDtoList[j].density.toFixed(3))
                }
                this.initEcharts(xArr, dbArr, densityArr, groupRecordDtoList[m].receiverDtoList[i].receiverId)
                
            }
        }
        
    }


    initEcharts = (xArr, dbArr, densityArr, id) => {
        let myEcharts = echarts.init(document.getElementById(id));
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
        filePath = comm.audioUrl + '?recordId=' + recordId + '&receiverId=' + row.receiverId;
        let option = JSON.parse(JSON.stringify(echartsOption.freqOptionListenWhite));
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

    // ============================排序方式
    driftChangeVisible = () =>{
        const {driftVisible} = this.state;
        this.setState({
            driftVisible: !driftVisible
        })
    }
    driftChange = (e)=>{
        pojoList = [];
        const {receiverResponseList,groupRecordDtoList} = this.state;
        let arr = receiverResponseList;
        let that = this;
        this.disposeEcharts();
        if (e.target.value == 1) {
            // 按照能量偏移值排序
            arr.sort(this.compare("difference"))
        }
        if (e.target.value == 2) {
            // 按照密度偏移值排序
            arr.sort(this.compare("densityDifference"))
        }
        if (e.target.value == 3) {
            // 按照默认顺序排序
            // arr = receiverResponseList;
             arr.sort(this.compare("receiverId"))
        }
        if (e.target.value == 4) {
            // 按照分组顺序排序
            this.setState({
                groupVisible:true,
                sortVisible:false
            },()=>{
                   that.dealEchartsGroup(groupRecordDtoList)
            })
          
        }else{
            this.setState({
                groupVisible: false,
                sortVisible:true
            },()=>{
                   that.dealEcharts(arr)
            })
          
        }
        this.setState({
            receiverResponseList: arr,
            driftVisible:false,
        })
    }
    compare =(property)=> {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];

            return value2 - value1;
        }
    }
    tagChange = (e)=>{
        this.setState({
            tagIdList:e
        })
    }
    tagSave = (item)=>{
        const {listenTime,recordId,machineNo,tagIdList} = this.state;
        let params = {
            tagIdList,
            calculateReceiverId:item.calculateReceiverId,
            recordId:this.props.recordId
        }
        service1.saveTag(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
              message.success('打标签成功')
            } else {
                message.error(res.err);
            }
        })
    }

    render() {
        const {groupRecordDtoList,receiverResponseList,cycleStatus,
            frequencyStatus,standardStatus,suddenStatus,sampleStatus,partitionStatus,tagList } = this.state;
        return (
            <div >
                {/* <select value={this.state.driftType} className={styles.select1} onChange={this.driftChange.bind(this)}>
                    {
                        (this.state.optionList || []).map((item, index) => {
                            return (
                                <option value={item.driftType} key={index}>显示方式： {item.name} </option>
                            )
                        })
                    }
                </select> */}
                {
                    this.state.groupVisible &&   <div className={styles.echartsContentzc}>
                    {
                        groupRecordDtoList.length !=0 &&  (groupRecordDtoList || []).map((item,index)=>{
                            return (
                                <div key={index} className={styles.pointGroup}>
                                    <div className={styles.zcGroupName}>
                                        <span>点位组名称:</span> {item.groupName}
                                    </div>
                                    <div  className={styles.ContentzcStyle}>
                                        {
                                            (item.receiverDtoList || []).map((itemp,indexp)=>{
                                                return (
                                                    <div className={styles.Contentzc} key={indexp}>
                                                        <div onClick={()=>{this.lookSingle(itemp)}} className={styles.pointNameFlex}>
                                                            <div><span>点位名称:</span>{itemp.pointName} <span style={{color:itemp.qualityColor}}>{itemp.qualityName ? itemp.qualityName:"——"}</span>{item.faultName}</div>
                                                            <img src={require('@src/assets/full.png')} style={{width:'30px',height:'30px'}} />
                                                        </div>
                                                        <div id={itemp.id} style={{width:'100%',height:'280px'}}></div>
                                                        <div className={styles.pyValue}>
                                                            {
                                                                sampleStatus == 1 && 
                                                                <div>典型样本偏离度:{(itemp.sampleDeviation!=null) ? itemp.sampleDeviation.toFixed(3) :''}&nbsp;&nbsp;&nbsp;&nbsp;{itemp.sampleConditionName}</div>
                                                            }
                                                            {standardStatus == 1 && 
                                                                <div>标准声音偏离度:{(itemp.deviation!=null) ? itemp.deviation.toFixed(3) :''}</div>
                                                            }
                                                  
                                                            {
                                                                frequencyStatus == 1 &&
                                                                <div>
                                                                    能量正偏离值:
                                                                    <span style={ {color:itemp.maxDbFlag ? 'red':'white'}}>{(itemp.difference != null) ? itemp.difference.toFixed(3) : ''}</span> 
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;能量负偏离值:
                                                                    <span style={ {color:itemp.minDbFlag ? 'red':'white'}}>{(itemp.minDifference!= null) ? itemp.minDifference.toFixed(3) : ''}</span>
                                                                </div>
                                                            }
                                                            {
                                                                frequencyStatus == 1 && 
                                                                <div>
                                                                    密度正偏离值:
                                                                    <span style={ {color:itemp.maxDensityFlag ? 'red':'white'}}> {(itemp.densityDifference!=null) ? itemp.densityDifference.toFixed(3) : ''}</span>
                                                                    &nbsp;&nbsp;&nbsp;&nbsp;密度负偏离值:
                                                                    <span style={ {color:itemp.minDensityFlag ? 'red':'white'}}>{(itemp.minDensityDifference!=null) ? itemp.minDensityDifference.toFixed(3) : ''}</span>
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
                                                                        (itemp.partitionDetailDtos || []).map((itemd, indexd) => {
                                                                            return (
                                                                                <div className={styles.zccycleList} key={indexd}>
                                                                                    <div style={{color:itemd.qualityColor}}>{itemd.qualityName ? itemd.qualityName : '——'}</div>
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
                                                                    <div style={{color:'white',fontSize:'16px',color:'orange'}}>标准周期：</div>
                                                                    <div className={styles.frequencyTitlezc}>
                                                                        <div >周期(ms)</div>
                                                                        <div >能量(db)</div>
                                                                        <div >频率(Hz)</div>
                                                                        <div >稳定度</div>
                                                                    </div>
                                                                    {
                                                                        (itemp.receiverEChartDataList || []).map((itemd,indexd)=>{
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
                                                        
                                                        
                                                            <div style={{width:cycleStatus === 0 ? '100%':'49%'}}>
                                                                <div className={styles.frequencyTablezc}>
                                                                    <div style={{color:'white',fontSize:'16px',color:'orange'}}>检测周期：</div>
                                                                    <div className={styles.frequencyTitlezc}>
                                                                        <div >周期(ms)</div>
                                                                        <div >能量(db)</div>
                                                                        <div >频率(Hz)</div>
                                                                        <div >稳定度</div>
                                                                    </div>
                                                                    {
                                                                        (itemp.receiverEChartDataList || []).map((itemd,indexd)=>{
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

                                                        <div style={{display:'flex'}}>
                                                            <Select mode="multiple" className={styles.select1} onChange={this.tagChange.bind(this)} 
                                                                >
                                                                {
                                                                    (tagList || []).map((item, index) => {
                                                                        return (
                                                                            <Option value ={item.id} key={index}> {item.tagName} </Option>
                                                                        )
                                                                    })
                                                                }
                                                            </Select>
                                                            <Button type='primary' onClick={()=>this.tagSave(item)}>打标签</Button>
                                                        </div>

                                                    </div> 
                                                )
                                            })
                                        }
                            
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>}
                { this.state.sortVisible  && <div className={styles.echartsContentzc}>
                    {
                       receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                <div className={styles.Contentzc}  key={index}>
                                    <div onClick={()=>{this.lookSingle(item)}} className={styles.pointNameFlex}>
                                        <div><span style={{color:'#3F9CD2'}}>点位名称:</span>{item.pointName}  <span style={{color:item.qualityColor}}>{item.qualityName ? item.qualityName : '——'}</span>{item.faultName}</div>
                                        <img src={require('@src/assets/full.png')} style={{width:'30px',height:'30px'}} />
                                    </div>
                                    <div id={item.receiverId} className={styles.echartsWidth}></div>
                                    {
                                        (item.errorValue !== null && item.errorValue !==  undefined )? <div className={styles.pyValue}>偏差值：{item.errorValue}</div> :
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
                                                        {/* <div style={{color:'white',fontSize:'16px',color:'orange'}}>分区声音：</div> */}
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
                                            
                                            <div className={styles.frequencyTablezcWrap}>
                                                {
                                                    cycleStatus == 1 && 
                                                    <div style={{width:'49%'}}>
                                                        <div className={styles.frequencyTablezc}>
                                                            <div style={{color:'white',fontSize:'16px',color:'orange'}}>标准周期：</div>
                                                            <div className={styles.frequencyTitlezc}>
                                                                <div >周期(ms)</div>
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
                                            
                                                <div  style={{width:cycleStatus === 0 ? '100%':'49%'}}>
                                                    <div className={styles.frequencyTablezc}>
                                                        <div style={{color:'white',fontSize:'16px',color:'orange'}}>检测周期：</div>
                                                        <div className={styles.frequencyTitlezc}>
                                                            <div >周期(ms)</div>
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

                                            <div style={{display:'flex'}}>
                                                <Select mode="multiple" className={styles.select1} onChange={this.tagChange.bind(this)} 
                                                    >
                                                    {
                                                        (tagList || []).map((item, index) => {
                                                            return (
                                                                <Option value ={item.id} key={index}> {item.tagName} </Option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                                <Button type='primary' onClick={()=>this.tagSave(item)}>打标签</Button>
                                            </div>
                                            
                                        </div>
                                    }

                                  
                                </div> 
                            )
                        })
                    }
                </div>
                }

                {/* 默认不分组展示 */}

            <Modal
                title="全屏查看"
                visible={this.state.fullScreenVisible}
                onOk={()=>{
                    this.setState({
                        fullScreenVisible:false
                    })
                }}
                onCancel={()=>{
                    this.setState({
                        fullScreenVisible:false
                    })}}
                okText="关闭"
                width={'95%'}
                >
                          <div ref = {
                            (c) => {
                                this.echartsBox = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '600px',
                            }
                        }
                        />
                        < div className={styles.ZCAudioStyle}>
                            <audio  src={filePath} controls></audio>
                        </div>
                    
                </Modal> 
            </div>
        )
    }
}

export default WholeBar;
