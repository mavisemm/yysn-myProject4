
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker  } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import stylesCom from '../style.less';
import styles from '../style.less';
import WholeBar from './components/WholeBar';
import WifiModel from './components/wifiModel';
import {service,service1} from '../service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
import {queryTypeFind,queryMachine,getSoundGroupList,getTagList } from '@src/models/common1.js';
const tenantId = VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
message.config({
    top: 100,
    duration: 2,
});
let stompClient = "";
let t1 =null;
let t2 = null;

import echarts from 'echarts';
let myEcharts = null;

class voiceIndex extends React.Component {
    state = {
        loading: false,
        visible: false,
        soundList:[],
        machineGroupList:[],
        speed:"",
        machineId:"",
        loadingVisible:false,
        machineName:"请选择机型",
        listenTime:0,
        loadingText: '听音数据采集中...',
        djsVisible:false,
        wifiVisible:false,
        leaveTime:0,
        recordDto:{},
        showResult:false,
        showCancel:false,
        errorVisible:false,
        errorTip:"",
        timeVisible:false,
        groupType:'0',
        loginOutVisible:false,
        defaultCheckedList:[],
        detectorIdList:[],
        recordId: '',
        groupRecordDtoList:[],
        degree:0.3,
        degree2:0.3,
        machineNo:"",
        speedList:[],
        detailDtoList:[],
        downLoadFileVisible:false,
        receiverGroupId:"",
        timeValue:"",
        detectorList: [],
        option:{
            title: {
                text: '',
                subtext: '',
                left: 'center',
                textStyle:{
                    color:'white'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: 'white'
                }
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    color: ['green','red','orange'],
                    data: [],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                 
                }
            ]
        },

    }
    constructor(props) {
        super(props);
        this.namespace = 'Manual';
    }
    timeModal = () => {
        const {listenTime} = this.state;
        this.setState({
            timeValue: listenTime,
            timeVisible: true,
        });
    }
    componentWillMount() {
            if (myEcharts) {
                myEcharts.dispose();
                myEcharts = null;
            }
    }

    componentDidMount(){
        if (tenantId){
            this.initalDataBase();
            if (localStorage.voiceInfo) {
                this.setState({
                    detailDtoList: JSON.parse(localStorage.voiceInfo).detailDtoList,
                    receiverGroupId: JSON.parse(localStorage.voiceInfo).id
                },()=>{
                    this.statisticsDetector()
                })
            }
            if (localStorage.machineInfo) {
                let temp = JSON.parse(localStorage.machineInfo);
                this.setState({
                    machineId: temp.id,
                })
            }
            if (localStorage.speed) {
                this.setState({
                    speed: JSON.parse(localStorage.speed)
                })
            }
        }else{
            this.props.history.push({
                pathname: `/login`
            })
        }
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
            if (localStorage.machineInfo){
                let machineId = JSON.parse(localStorage.machineInfo).id;
                     for (let i = 0; i < machineGroupList.length; i++) {
                         let temp = machineGroupList[i];
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
        getTagList().then(ret => {
        });
    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            wifiVisible: false,
            errorVisible: false,
            timeVisible: false,
            loginOutVisible: false,
            downLoadFileVisible:false,
            staticsTimeVisible:false
        })
    }

    clearClock = () => {
        try {
            clearTimeout(t1)
            clearTimeout(t2);
        } catch (error) {}
        t1 = null;
        t2 = null;
    }
    
    clearClock1 = () => {
        try {
            clearTimeout(t1)
            clearTimeout(t2);
        } catch (error) {}
        t1 = null;
        t2 = null;
    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
    }
    // 统计
    statisticsDetector = (type) => {
        const {receiverGroupId} = this.state;
        const now = Date.now(); // 获取当前时间戳
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 获取一个月前的时间
        const oneMonthAgoTimestamp = oneMonthAgo.getTime(); // 获取一个月前的时间戳
            let params = {}
            if (type == 1) {
                message.success('已调整为从当前时间开始计数！')
                localStorage.now = now;
                params = {
                    startTime: Number(localStorage.now),
                    endTime: now,
                    tenantId,
                    receiverGroupIdList: [receiverGroupId]
                }
            } else if (type == 2) {
                const {
                    startTime,
                    endTime
                } = this.state;
                this.setState({
                    staticsTimeVisible: false,
                })
                params = {
                    startTime,
                    endTime,
                    tenantId,
                    receiverGroupIdList: [receiverGroupId]
                }
            } else {
                if (localStorage.now) {
                    params = {
                        startTime: Number(localStorage.now),
                        endTime: now,
                        tenantId,
                        receiverGroupIdList: [receiverGroupId]
                    }
                } else {
                    params = {
                        startTime: oneMonthAgoTimestamp,
                        endTime: now,
                        tenantId,
                        receiverGroupIdList: [receiverGroupId]
                    }
                }

            }
        service1.statisticsDetector(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret && res.ret.length) {
                    this.setState({
                        detectorList: res.ret || [],
                    },()=>{
                        this.initPie();
                    })
                }else{
                    // if (myEcharts) {
                    //     myEcharts.dispose();
                    //     myEcharts = null;
                    // }
                }
       
            } else {
                message.error(res.err);
            }
        })
    }
    initPie = ()=>{
        const {detectorList} = this.state;
        const {detailDtoList,totalCount} = detectorList[0];
        let data = [];
        for(let i = 0;i<detailDtoList.length;i++){
            let temp = detailDtoList[i];
            data.push({
                value: temp.count,
                name: temp.qualityName + temp.count
            })
        }
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
        if (this.echartsBox) {
            myEcharts = echarts.init(this.echartsBox);
            let option = this.state.option;
            option.title.text = '检测总数' + totalCount;
            option.series[0].data = data;
            myEcharts.setOption(option)
        }
    }

    componentWillUnmount() {
        this.clearClock()
    }
    // ========================================================= ========================开始听音,结果==========================
    batchStartListen() {
        this.clearClock();
        if (stompClient) {
            stompClient.disconnect();
            stompClient = null;
        }
        const {machineId,groupType,detailDtoList,degree,degree2,speed,machineNo,receiverGroupId} = this.state;
        let detectorIdList = [];
        for (let i = 0; i < detailDtoList.length; i++) {
               detectorIdList.push(detailDtoList[i].detectorId)
        }
        this.setState({
            showResult:false,
            loadingText:'听音数据采集中...',
            loadingVisible: true,
        })
        let params = {
            tenantId,
            machineId,
            detectorIdList,
            groupType,
            degree,
            degree2,
            speed,
            machineNo,
            receiverGroupId
        }
        this.ShortTimeListen(params);
    }

    initWebsocket = (id)=>{
        this.connection(id);
    }

    ShortTimeListen = (params) => {
        service.batchStartListen(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.loadingTips();
                if (res.ret) {
                    const {id,type} = res.ret;
                    this.setState({
                        recordId: id,
                        showCancel:true,
                    })
                    this.initWebsocket(id)
                }
            } else {
                this.clearClock();
                this.setState({
                    loadingVisible: false,
                    loadingText:'',
                    errorVisible:true,
                    errorTip: res.err
                })
            }
        })
    }
    loadingTips(){
        this.setState({
            loadingText: '正在听音中...',
            loadingVisible: true,
            djsVisible:true
        })
        let listenTime = Number(this.state.listenTime);
        let that = this;
        if(t1){
             clearTimeout(t1);
        }
        // 听音时间结束之后开始检测分析
        t1 = setTimeout(function () {
           that.setState({
                loadingText: '检测报告分析中....',
                djsVisible:false
           })
        }, (listenTime+1)*1000)
        this.openDjs(listenTime);
    }
    openDjs = (listenTime) => {
        let count = Number(listenTime)+1;
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

    // 取消听音
    cancelListen = () =>{
        if (stompClient) {
            stompClient.disconnect();
        }
        const {recordId,listenTime} = this.state;
        message.error('取消听音中...');
        let params = {
           id: recordId
        }
        service.cancelListen(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.clearClock();
                this.setState({
                    loadingVisible:false,
                    leaveTime:Number(listenTime),
                    showCancel:false,
                    djsVisible:false
                })
            } else {
                message.error(res.err);
            }
        })
    }
    // 得到听音纪录id
    connection(recordId) {
        let that = this;
        let socket = new WebSocket(comm.baseurl.eventUrl);
        stompClient = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        stompClient.connect(headers, () => {
            stompClient.subscribe('/assembly-topic/batchRecordDetail/' + recordId, (msg) => {
                if (msg) {
                    let res = JSON.parse(msg.body);
                    that.queryDetectorRecord(res)
                    if (stompClient) {
                        stompClient.disconnect();
                    }
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    // 听音结果分析,todo
    queryDetectorRecord(res){
        this.clearClock();
        const {recordDto,receiverResponseList,groupRecordDtoList } = res;
        if (recordDto.status == 1) {
            this.statisticsDetector();
            // 听音完成
            this.setState({
                receiverResponseList: receiverResponseList || [],
                groupRecordDtoList: groupRecordDtoList || [],
                loadingVisible: false,
                recordDto: recordDto || {},
                loadingText: '听音数据采集中...',
                showCancel: false,
                showResult: true
            })
        }else{
            this.setState({
                loadingVisible:false,
                showCancel:false,
                errorVisible:true,
                errorTip:res.err || '听音异常！'
            })
        }
        
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
        const {machineId,timeValue} = this.state;
        if (machineId == ''){
            message.error('请先选择机型');
            return false;
        }
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
                    timeVisible:false
                })
            } else {
                message.error(res.err);
            }
        })
    }
    // ====安卓端开始=============
    getWifiMsg = (result,msg) =>{
        if(msg){
            const {degree,degree2} = msg;
            this.setState({
                degree,
                degree2
            })
        } 
        this.setState({
            wifiVisible: false
        })
    }
    loginOut = () =>{
        this.setState({
            loginOutVisible: false,
        })
        this.props.history.push({
            pathname: '/login'
        })
    }
    // ====安卓端结束==============
    //=======选择听音器组
    voiceChecked = (e) => {
        const {soundList} = this.state;
        for(let i = 0;i<soundList.length;i++){
            let temp = soundList[i];
            if(e.target.value == temp.id){
                  localStorage.voiceInfo = JSON.stringify(temp);
                  this.setState({
                      detailDtoList: temp.detailDtoList,
                      receiverGroupId: temp.id,
                  })
            }
        }
      
    }

    // ======选择机型
    machineChecked = (e)=>{
        const {machineGroupList} = this.state;
        for(let i = 0;i<machineGroupList.length;i++){
            let temp = machineGroupList[i];
            if(e.target.value == temp.id){
                localStorage.machineInfo = JSON.stringify(temp);
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
    speedChecked = (e) =>{
        localStorage.speed = JSON.stringify(e.target.value);
        this.setState({
            speed: e.target.value,
        })
    }
    // 选择电机转向
    turnConfirm = ()=>{
        const {groupType} = this.state;
        let temp = (groupType == 0 ? 1 : 0);
        localStorage.groupType = JSON.stringify(temp);
        this.setState({
            groupType: groupType == 0 ? 1 : 0
        })
    }

    // 下载质检报告
    exportFile = ()=>{
        this.setState({
            downLoadFileVisible:true
        })
    }
    confirmDownLoad = ()=>{
        const {machineId,machineNo} = this.state;
        if (machineId && machineNo){
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
        }else{
            message.error('机型和设备编号不能为空！')
        }
      
    }

    render(){
        const {listenTime,speed,showResult,errorVisible,errorTip,showCancel,wifiVisible,machineNo,leaveTime,recordDto} = this.state;
        const {timeValue,djsVisible,machineName,groupType,machineId,machineGroupList,detectorList} = this.state;
        return (
        <div className={stylesCom.bodyScreen}>
            <div className={stylesCom.headStyle}>
                <div>
                    <img src={require('@src/assets/voice/logo.png')} className={stylesCom.logo}/>
                    <img src={require('@src/assets/voice/headicon.png')} className={stylesCom.headicon}/>
                </div>
                <div className={stylesCom.flex}>
                   <img src={require('@src/assets/voice/setting.jpg')} className={stylesCom.wifiicon} 
                    onClick={()=>{this.setState({
                             wifiVisible:true,
                    })}}/>
                    <img src={require('@src/assets/voice/user.png')} className={stylesCom.usericon}/>
                    <div className={stylesCom.userFont}>{localStorage.name || '声音'}</div>

                    <div className={stylesCom.userloginout} onClick={()=>{this.setState({
                        loginOutVisible:true
                    })}}>退出登录</div>
                    
                </div> 
            </div>
        
            <div className={styles.topWrap}>
                < div className = {styles.topWrapLeft} >
                    <div className={styles.printContent}>
                        <div className={styles.printContentLeft}>
                            <div ref = {
                                (c) => {
                                    this.echartsBox = c
                                }
                            } 
                            style = {
                                {
                                    width: '90%',
                                    height: '180px',
                                }
                            }
                            /> 
                            <div>
                                <img src={require('@src/assets/timeicon2.png')}  onClick={()=>{
                                    this.statisticsDetector(1)
                                }}/>
                                <img src={require('@src/assets/timeicon1.png')} onClick={()=>{
                                    this.setState({
                                        staticsTimeVisible:true
                                    })
                                }}/>
                            </div>

                        </div>
                        {
                            showResult ? <div className={styles.printContentRight}>
                                <div><span>机型：</span>{recordDto.machineTypeName}</div>
                                <div><span>检测时间：</span>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                <div><span>听音时间：</span>{recordDto.listenTime}S</div>
                                <div><span>编号：</span>{recordDto.id}</div>
                            </div> : <div></div>
                        }
                    
                    </div>
                </div> 
            
                <div className={styles.zcUserconfirm}>
                    <div className={styles.zcUserconfirmflex}>
                        <img src={require('@src/assets/voice/index4.png')}/>
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
                        <img src={require('@src/assets/voice/index1.png')}/>
                            <select value={this.state.machineId} className={styles.select2} onChange={this.machineChecked.bind(this)}>
                                <option value="">请选择机型</option> 
                                {
                                    (this.state.machineGroupList || []).map((item, index) => {
                                        return (
                                            <option value ={item.id} key={index}> {item.name} </option>
                                        )
                                    })
                                }
                            </select>
                        <div className={styles.zcturnStyle} onClick={()=>this.turnConfirm()} >
                            <img src={require('@src/assets/change.png')} className={styles.changeIcon}/>
                            {
                                groupType == 0 ? '正转' : '反转'
                            }
                        </div>

                        <select value={this.state.speed} className={styles.select3} onChange={this.speedChecked.bind(this)}>
                            <option value="">请选择转速</option> 
                            {
                                (this.state.speedList || []).map((item, index) => {
                                    return (
                                        <option value ={item.speed} key={index}> {item.speed} 转/分钟</option>
                                    )
                                })
                            }
                        </select>
                        
                    </div>
                    <div className={styles.zcUserconfirmflex}>
                        <img src={require('@src/assets/voice/index3.png')}/>
                        <Input className={styles.InputStylezc} placeholder='请输入设备编号' name='machineNo' onChange = {this.inputChange.bind(this)} value={machineNo}/>
                        <div className={[styles.buttonStylezc,styles.buttonzc2].join(' ')} onClick={()=>this.timeModal()} >听音时间:{listenTime}S</div>
                    </div>
                
                    <div className={styles.zcUserconfirmflex}>
                        <img src={require('@src/assets/voice/index2.png')}/>
                        {
                            showCancel ?  <div className={[styles.buttonStylezc,styles.buttonzc1].join(' ')} onClick={()=>this.cancelListen()}>取消听音</div> :
                            <div className={[styles.buttonStylezc,styles.buttonzc1].join(' ')} onClick={()=>this.batchStartListen()}>开始听音</div>
                        }
                            {/* <div className={[styles.buttonStylezc,styles.buttonzc2].join(' ')} onClick={()=>this.exportFile()}>下载质检报告</div> */}
                    </div>
                </div>
            </div>
                {
                    this.state.loadingVisible ?
                    <div className={styles.loading}>
                        <Spin size="large"/>
                        <p className={styles.loadingTip}>{this.state.loadingText}</p>
                        {
                            djsVisible ? <p className={styles.loadingTip}>听音时间还有<span style={{fontSize:'22px',color:'red'}}>{leaveTime}</span>秒</p> :''
                        }
                    </div> : ''
                }
                {
                    showResult ? <div style={{width:'100%'}}>
                        < WholeBar receiverResponseList={this.state.receiverResponseList} groupRecordDtoList={this.state.groupRecordDtoList} machineId={machineId} machineNo={machineNo} parent={this} recordId={this.state.recordId}/>
                    </div> :  <div className={styles.newLeft}> </div>
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
                        <InputNumber style={{width:100,marginLeft:10}} onChange = {this.inputTime.bind(this)} name='listenTime' value={timeValue} min = {0} max ={5000}/>
                    </div>
            </Modal>
            {/* 错误确认弹窗 */}
            <Modal
                title="提示"
                visible={this.state.errorVisible}
                onOk = {this.closeModal}
                onCancel = {this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div> {errorTip}</div>
            </Modal>
            {/* 退出登录提示 */}
            <Modal
                title="提示"
                visible={this.state.loginOutVisible}
                onOk = {this.loginOut}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div>确认退出登录吗？</div>
            </Modal>
            {/* 质检报告确认弹窗 */}
            {/* <Modal
                title="下载质检报告提示"
                visible={this.state.downLoadFileVisible}
                onOk = {this.confirmDownLoad}
                onCancel={this.closeModal}
                okText="确认下载"
                cancelText="取消"
                >
                    <div>已选机型：{machineName}</div>
                    <div style={{margin:"10px 0"}}>设备编号：{machineNo}</div>
            </Modal> */}
         {/* 时间选择弹窗 */}
            <Modal
                title="统计时间范围"
                visible={this.state.staticsTimeVisible}
                onOk = {()=>this.statisticsDetector(2)}
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
            {/* wifi弹窗 */}
            {
                wifiVisible && <WifiModel parent={this} degree={this.state.degree} degree2={this.state.degree2}></WifiModel>
            }
        </div>
    );
    }

}

export default voiceIndex;
