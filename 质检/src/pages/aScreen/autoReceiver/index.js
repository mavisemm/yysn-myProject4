
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker,Switch   } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import styles from '../autoReceiver.less';
import stylesComm from '../style.less';
import R1 from './components/r1';
import R2 from './components/r2';
import R3 from './components/r3';
import R4 from './components/r4';
import R5 from './components/r5';
import Loading1 from './components/loading1';
import Loading2 from './components/loading2';
import Loading3 from './components/loading3';
import Loading4 from './components/loading4';
import Loading5 from './components/loading5';
import Statics from './components/statics';
import Email from './components/email';
import Warn from './components/warn';
import {service,service1} from '../service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm,{hostIp1,hostIp} from '@src/config/comm.config.js';
import {queryTypeFind,queryMachine,getSoundGroupList } from '@src/models/common1.js';
const tenantId = VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
const aUrl = `${hostIp}/login.html`;
message.config({
    top: 400,
    duration: 2,
});
let socketRecordid = "";
let socketLoading = '';
let socketWarn = '';
let t1 =null;
let t = null;
let t2 = null;
let warnTimer = null;
let receiverArr = [];
class voiceIndex extends React.Component {
    state = {
        loading: false,
        visible: false,
        // tenantId: '8e3de529abbe4d19951a419fc0f51dde',
        tenantId:localStorage.tenantId,
        soundList:[],
        machineGroupList:[],
        speed:"",
        machineId:"",
        loadingVisible:false,
        machineName:"",
        listenTime:0,
        loadingText: '听音数据采集中...',
        djsVisible:false,
        leaveTime:0,
        recordDto:{},
        voiceName:"请选择听音器",
        showResult:false,
        errorVisible:false,
        errorTip:"",
        timeVisible:false,
        groupType:'0',
        defaultCheckedList:[],
        detectorIdList:[],
        recordId: '',
        degree:0.3,
        degree2:0.3,
        detailDtoList:[],
        receiverGroupId:"",
        timeValue:"",
        voiceId:"",
        staticsData:[],
        totalCount:"",
        voiceList:[],
        showLoading1:false,
        showLoading2: false,
        showLoading3: false,
        showLoading4: false,
        showLoading5: false,
        showResult1: false,
        showResult2: false,
        showResult3: false,
        showResult4: false,
        showResult5: false,
        receiverResponseList1:[],
        receiverResponseList2:[],
        receiverResponseList3:[],
        receiverResponseList4: [],
        receiverResponseList5: [],
        recordDto1:{},
        recordDto2: {},
        recordDto3: {},
        recordDto4: {},
        recordDto5: {},
        machineNo:"",
        checkVisible: false,
        listenVisible: true,
        emailVisible:false,
        warnVisible:false,
        redVisible:false,
        totalDetailList:[],
        plcCount:'',
        normalCount:"",
        timeoutCount:""
    }
    constructor(props) {
        super(props);
        this.namespace = 'LEILI';
    }
    timeModal = () => {
        const {listenTime} = this.state;
        this.setState({
            timeValue: listenTime,
            timeVisible: true,
        });
    }
    closeEmail = (msg,result)=>{
        this.setState({
            emailVisible:false,
            warnVisible:false
        })
        if(result == 1){
            if (warnTimer) {
                clearTimeout(warnTimer);
            }
            this.setState({
                redVisible: false
            });
        }
    }
    componentWillUnmount() {
        this.clearClock();
        if (socketLoading) {
            socketLoading.disconnect();
            socketLoading = null;
        }
        if (socketRecordid) {
            socketRecordid.disconnect();
            socketRecordid = null;
        }
        if (socketWarn){
             socketWarn.disconnect();
             socketWarn = null;
        }
    }
    componentDidMount(){
        if (tenantId){
            this.initalDataBase();
            this.querySoundDetector();

            if (localStorage.voiceInfo) {
                this.setState({
                    voiceName: JSON.parse(localStorage.voiceInfo).name,
                    detailDtoList: JSON.parse(localStorage.voiceInfo).detailDtoList,
                    receiverGroupId: JSON.parse(localStorage.voiceInfo).id,
                    voiceId: JSON.parse(localStorage.voiceInfo).detailDtoList[0]?.detectorId || '',
                },()=>{
                    this.statisticsDetectorGroup()
                })
            }
            if (localStorage.machineInfo) {
                let temp = JSON.parse(localStorage.machineInfo);
                this.setState({
                    listenTime: temp.listenTime,
                    machineId: temp.id,
                    machineName: temp.name,
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
    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            errorVisible: false,
            timeVisible: false,
            loginOutVisible:false,
            checkVisible:false,
            warnVisible:false,
        })
    }
    loginOut = () => {
        this.setState({
            loginOutVisible: false,
        })
        this.props.history.push({
            pathname: '/login'
        })
    }

    clearClock = () => {
          if (t) {
              clearInterval(t);
              t = null;
          }
        try {
            clearTimeout(t1)
        } catch (error) {}
        t1 = null;

            try {
                clearTimeout(t2)
            } catch (error) {}
            t2 = null;

        if (warnTimer) {
            clearTimeout(warnTimer);
        }
    }
    // 统计
    statisticsDetectorGroup = (type)=>{
        const {receiverGroupId} = this.state;
        if (receiverGroupId == ''){
            message.error('请先选择听音器组')
            return false;
        }

        // 获取当前时间戳
        const currentTimestamp = Date.now();

       // 获取今天的日期
       const today = new Date();
       const year = today.getFullYear();
       const month = today.getMonth() + 1;
       const day = today.getDate();
       // 获取今天早上7点半的时间戳
       const morningStartTimestamp = new Date(`${year}-${month}-${day} 07:30:00`).getTime();
       // 获取今天晚上7点半的时间戳
       const eveningEndTimestamp = new Date(`${year}-${month}-${day} 19:30:00`).getTime();
        // 获取今天24点的时间戳
        const EndTimestamp = new Date(`${year}-${month}-${day} 23:59:59`).getTime();
        // 获取今天0点的时间戳
       const Timestamp = new Date(`${year}-${month}-${day} 00:00:00`).getTime();
       // 判断当前时间戳所处的时间段
       let startTimestamp, endTimestamp;

       let nextDayMorningStartTimestamp = '';

       if(type == 2){
            // 调整为默认时间
            localStorage.nowStamp = '';
        }
       if(type == 1){
            // 从当前时刻开始计时
            localStorage.nowStamp = currentTimestamp;
            startTimestamp = currentTimestamp;
            endTimestamp = EndTimestamp;
       }else{
            if(localStorage.nowStamp){
                startTimestamp = localStorage.nowStamp;
                endTimestamp = EndTimestamp;
            }else{
                if (currentTimestamp >= morningStartTimestamp && currentTimestamp <= eveningEndTimestamp) {
                    //    console.log("当前时间处于早上7点半到晚上7点半之间");
                       startTimestamp = morningStartTimestamp;
                       endTimestamp = eveningEndTimestamp;
                   } else if(currentTimestamp >= Timestamp  && currentTimestamp <= morningStartTimestamp){
                    //    console.log("当前时间处于晚上7点半到第二天早上7点半之间");
                       // 获取第二天早上7点半的时间戳
                        const nextDay = new Date(today);
                        nextDay.setDate(day - 1);
                        nextDayMorningStartTimestamp = new Date(`${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()} 19:30:00`).getTime();
                        startTimestamp = nextDayMorningStartTimestamp;
                        endTimestamp = morningStartTimestamp;
                    }else{
                        const nextDay = new Date(today);
                        nextDay.setDate(day + 1);
                        nextDayMorningStartTimestamp = new Date(`${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()} 07:30:00`).getTime();
                        startTimestamp = eveningEndTimestamp;
                        endTimestamp = nextDayMorningStartTimestamp;
                    }
            }
       }
        let params = {}
        params = {
            startTime: startTimestamp,
            endTime: endTimestamp,
            tenantId: localStorage.tenantId,
            receiverGroupIdList: [receiverGroupId]
        }
        // this.queryTotal(params);
        this.getplc();
        service1.statisticsDetectorGroup(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let data = res.ret;
                let totalCount = 0;
                for(let i = 0;i<data.length;i++){
                    totalCount +=Number(data[i].totalCount);
                    for(let j = 0;j<data[i].detailDtoList.length;j++){
                        data[i].detailDtoList[j] = {
                            ...data[i].detailDtoList[j],
                            countRate:(data[i].detailDtoList[j].countRate*100).toFixed(2)
                        }
                    }
                }
               
                this.setState({
                    staticsData:data || [],
                    totalCount,
                },()=>{
                    this.sumDetailDtoLists(res,totalCount)
                })
            } else {
                message.error(res.err);
            }
        })
    }

     sumDetailDtoLists(data,totalCount) {
        let detailDtoList = [];
        let totalDetailList = [];
        if(data.ret[0]){
            detailDtoList = data.ret[0].detailDtoList || [];
            totalDetailList = [...detailDtoList];
        }
            const qualityCounts = {};

            // 遍历每个检测点的detailDtoList
            data.ret.forEach(detectionPoint => {
                detectionPoint.detailDtoList.forEach(detail => {
                    // 如果qualityId已经在对象中，则增加其计数
                    // 否则，将qualityId作为键添加到对象中，并设置计数为1
                    qualityCounts[detail.qualityId] = (qualityCounts[detail.qualityId] || 0) + detail.count;
                });
            });
            let arr = [];
            for(var i=0;i<detailDtoList.length;i++){
                for(var key in qualityCounts){
                    if(key == detailDtoList[i].qualityId ){
                        totalDetailList[i] = {
                            ...detailDtoList[i],
                            count:qualityCounts[key],
                            countRate:((qualityCounts[key]/totalCount)*100).toFixed(2)
                        }
                    }
                }
            }
            // console.log(totalDetailList,'totalDetailList')
            this.setState({
                totalDetailList
            })
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


    // 查询听音器
    querySoundDetector = ()=>{
        const {tenantId,machineId } = this.state;
        let params = {
            tenantId,
        }
        service.querySoundDetector(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0){
                if(res.ret){
                    if (localStorage.voiceInfo) {
                        receiverArr = [];
                        for (let i = 0; i < res.ret.length; i++) {
                            if (res.ret[i].id == JSON.parse(localStorage.voiceInfo).detailDtoList[0].detectorId) {
                                for (let j = 0; j < res.ret[i].receiverList.length; j++) {
                                    receiverArr.push(res.ret[i].receiverList[j].id)
                                }
                            }
                        }
                    }
                    this.setState({
                        voiceList: res.ret
                    })
                } 
                
            }else{
                message.error(res.err)
            }
        })
    }

    checkWebsocket(){
        t = setInterval(() => {
            try {
                socketLoading.send("Loading");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeLoading();
            }
            try {
                socketRecordid.send("result");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeRecordid();
            }
            try {
                socketWarn.send("warn");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeWarn();
            }
    

        }, 3 * 1000)
    }

    // ========================================================= ========================开始听音,结果==========================
    run=()=> {
        this.clearClock();
        if (socketRecordid) {
            socketRecordid.disconnect();
            socketRecordid = null;
        }
        const {machineId,groupType,detailDtoList,tenantId,degree,degree2,machineNo,
            speed,receiverGroupId,listenTime,voiceList} = this.state;
        let detectorIdList = [];
        for (let i = 0; i < detailDtoList.length; i++) {
               detectorIdList.push(detailDtoList[i].detectorId)
        }
        receiverArr = [];
        for(let i = 0;i<voiceList.length;i++){
            if(voiceList[i].id == detectorIdList[0]){
                for(let j = 0;j<voiceList[i].receiverList.length;j++){
                    receiverArr.push(voiceList[i].receiverList[j].id)
                }
            }
        }
        this.setState({
            voiceId:detectorIdList[0] || '',
            showResult:false,
            loadingText:'正在听音中...',
            loadingVisible: true,
            checkVisible:false
        })
        let params = {
            tenantId,
            machineId,
            detectorIdList,
            groupType,
            degree,
            degree2,
            speed,
            listenTime,
            machineNo,
            receiverGroupId
        }
        service.run(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.checkWebsocket();
                this.subscribeRecordid();
                this.subscribeLoading();
                this.subscribeWarn();
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

    handleWarn = () =>{
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
            socketWarn.subscribe('/assembly-topic/forewarning/' + localStorage.tenantId, (msg) => {
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
    //倒计时
     subscribeLoading(){
         let voiceId = this.state.voiceId;
         let that = this;
         // 建立连接对象
         let socket = new WebSocket(comm.baseurl.eventUrl);
         // 获取STOMP子协议的客户端对象
         socketLoading = Stomp.over(socket);
         // 定义客户端的认证信息,按需求配置
         let headers = {
             Authorization: ''
         }
         // 向服务器发起websocket连接
         socketLoading.connect(headers, () => {
             socketLoading.subscribe('/assembly-topic/batchReceiverStartRecord/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                 if (msg) {
                    let temp = msg.body.split(":");
                    // console.log(msg,'msg')
                    let receiverId = temp[1];
                    if (receiverId == receiverArr[0]) {
                        that.setState({
                            showLoading1:true,
                            showResult1:false,
                        })
                    }
                    if (receiverId == receiverArr[1]) {
                        that.setState({
                            showLoading2: true,
                            showResult2: false,
                        })
                    }
                    if (receiverId == receiverArr[2]) {
                        that.setState({
                            showLoading3: true,
                            showResult3: false,
                        })
                    }
                      if (receiverId == receiverArr[3]) {
                          that.setState({
                              showLoading4: true,
                              showResult4: false,
                          })
                      }
                      if (receiverId == receiverArr[4]) {
                          that.setState({
                              showLoading5: true,
                              showResult5: false,
                          })
                      }
                 }
             }, headers);
         }, (err) => {
             // 连接发生错误时的处理函数
             console.log('失败')
             console.log(err)
         });
    }

    subscribeRecordid() {
        const {voiceId} = this.state;
        let that = this;
        let socket = new WebSocket(comm.baseurl.eventUrl);
        socketRecordid = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        // 直接听筒的信息，根据听筒的信息去展示
        socketRecordid.connect(headers, () => {
            socketRecordid.subscribe('/assembly-topic/batchDetectorRecordDetailAndReceiver/' + voiceId, (msg) => {
                if (msg) {
                     let temp = JSON.parse(msg.body);
                    that.queryDetectorRecord(temp)
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }

     queryDetectorRecord(res){
        // console.log(res,'res')
         this.clearClock();
         this.setState({
             showResult:false,
         })
         
        if (res.rc == 0) {
            const {recordDto,receiverResponseList } = res.ret;
            const {id,machineTypeName,detectTime} = recordDto;
            let receiverId = recordDto.receiverId;
            if (recordDto.status == 1) {
                this.statisticsDetectorGroup();
                this.setState({
                    machineTypeName
                })
                // 听音完成
                if (receiverId == receiverArr[0]){

                        this.setState({
                            receiverResponseList1: receiverResponseList || [],
                            recordDto1: recordDto || {},
                            showLoading1:false,
                            showResult1: true,
                        })
                }
                if (receiverId == receiverArr[1]) {

                    this.setState({
                        receiverResponseList2: receiverResponseList || [],
                        recordDto2: recordDto || {},
                        showResult2: true,
                        showLoading2: false,
                    })
                }
                if (receiverId == receiverArr[2]) {

                    this.setState({
                        receiverResponseList3: receiverResponseList || [],
                        loadingVisible3: false,
                        recordDto3: recordDto || {},
                        showResult3: true,
                        showLoading3: false,
                    })
                }
                    if (receiverId == receiverArr[3]) {

                        this.setState({
                            receiverResponseList4: receiverResponseList || [],
                            recordDto4: recordDto || {},
                            showResult4: true,
                            showLoading4: false,
                        })
                    }
                    if (receiverId == receiverArr[4]) {

                        this.setState({
                            receiverResponseList5: receiverResponseList || [],
                            loadingVisible5: false,
                            recordDto5: recordDto || {},
                            showResult5: true,
                            showLoading5: false,
                        })
                    }

            }else{
                message.error(res.err)
            }
        }else{
            this.setState({
                loadingVisible:false,
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
        const {tenantId,machineId,timeValue} = this.state;
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
    //=======选择听音器组
    voiceChecked = (e) => {
        const {soundList} = this.state;
        for(let i = 0;i<soundList.length;i++){
            let temp = soundList[i];
            if(e.target.value == temp.id){
                  localStorage.voiceInfo = JSON.stringify(temp);
                  this.setState({
                      voiceName: temp.name,
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
                })
            }
        }
    }

    changeBtn = (e) => {
        this.setState({
            listenVisible: e
        })
    }

    render(){
        const {listenTime,speed,errorVisible,errorTip,redVisible,totalCount,totalDetailList} = this.state;
        const {tenantId,timeValue,machineName,staticsData,receiverGroupId ,listenVisible,machineTypeName,plcCount,normalCount,timeoutCount,
        showResult1, showResult2, showResult3,showResult4,showResult5, showLoading1, showLoading2, showLoading3, showLoading4, showLoading5, receiverResponseList1
        , receiverResponseList2, receiverResponseList3, receiverResponseList4, receiverResponseList5, recordDto1, recordDto2, recordDto3, recordDto4, recordDto5,machineNo
        } = this.state;
        return (
        <div className={stylesComm.bodyScreen}>
                 <div className={stylesComm.headStyle}>
                    <div>
                        <img src={require('@src/assets/logoleili.png')} className={stylesComm.logo}/>
                        {/* <img src={require('@src/assets/voice/headicon.png')} className={styles.headicon}/> */}
                    </div>
                    <div className={stylesComm.flex}>
                           <div style={{fontSize:14}}>
                            plc：{plcCount}
                            正常：{normalCount}
                            超时：{timeoutCount}
                        </div>
                        <div className={styles.timeFlex}>
                            <img src={require('@src/assets/timeicon2.png')}  title='统计时间调整为从此刻开始计时!'  onClick={()=>{
                                this.statisticsDetectorGroup(1)
                            }}/>
                            <img src={require('@src/assets/reset.png')} title='统计时间调整为早7.30,晚7.30'  onClick={()=>{
                                this.statisticsDetectorGroup(2)
                            }}/>
                          </div>
                         
                      
                        {
                            redVisible ? <img src={require('@src/assets/red.png')} onClick={()=>{this.setState({warnVisible:true})}} className={stylesComm.wifiicon} title='推送条件设置'
                                /> : 
                                     <img src={require('@src/assets/green.png')} onClick={()=>{this.setState({warnVisible:true})}} className={stylesComm.wifiicon} title='推送条件设置'
                                />
                        }
                   
                        <img src={require('@src/assets/voice/setting.jpg')} className={stylesComm.wifiicon} 
                            onClick={()=>{this.setState({
                                checkVisible: true,
                        })}}/>
                        <Switch style={{margin:'0 20px'}} checkedChildren="生产环境" unCheckedChildren="统计模式" defaultChecked={true} onChange={this.changeBtn.bind(this)}/>

                        <a href={aUrl} target='_blank'>
                            <img src={require('@src/assets/admin.png')} className={stylesComm.wifiicon} title='后台管理系统'
                                    alt='后台管理系统'/>
                        </a>

                        <img src={require('@src/assets/email.png')} onClick={()=>{this.setState({emailVisible:true})}} className={stylesComm.wifiicon} title='发送邮件'
                                alt='发送邮件'/>
                        
                        <img src={require('@src/assets/voice/user.png')} className={stylesComm.usericon}/>
                        <div className={stylesComm.userFont}>{localStorage.name || '声音'}</div>
                        <div className={stylesComm.userloginout} onClick={()=>{this.setState({
                            loginOutVisible:true
                        })}}>退出登录</div>
                    </div> 
                </div>
                {
                    listenVisible ? 
                <div className={styles.echartsContainer}>
                    {/*1  */}
                    <div className={styles.echartsContentzc}>
                        {
                            showLoading1 &&  <Loading1   listenTime={listenTime} parent={this} />
                        }
                        {
                            showResult1 &&  <R1 receiverResponseList={receiverResponseList1} recordDto={recordDto1}  parent={this} />
                        }
                    </div>
            
                   
                   <div className={styles.echartsContentzc}>
                        {
                            showLoading2 &&  <Loading2   listenTime={listenTime} parent={this} />
                        }
                        {
                            showResult2 &&  <R2 receiverResponseList={receiverResponseList2} recordDto={recordDto2}  parent={this} />
                        }
                    </div>
                    
                    <div  className={styles.echartsContentzc}>
                        {
                            showLoading3 &&  <Loading3   listenTime={listenTime} parent={this} />
                        }
                        {
                            showResult3 &&  <R3 receiverResponseList={receiverResponseList3} recordDto={recordDto3}  parent={this} />
                        }
                    </div>
                    <div  className={styles.echartsContentzc}>
                        {
                            showLoading4 &&  <Loading4   listenTime={listenTime} parent={this} />
                        }
                        {
                            showResult4 &&  <R4 receiverResponseList={receiverResponseList4} recordDto={recordDto4}  parent={this} />
                        }
                    </div>
             
                       <div  className={styles.echartsContentzc}>
                        {
                            showLoading5 &&  <Loading5   listenTime={listenTime} parent={this} />
                        }
                        {
                            showResult5 &&  <R5 receiverResponseList={receiverResponseList5} recordDto={recordDto5}  parent={this} />
                        }
                    </div>
                    <div  className={styles.echartsContentzc}>
                      
                       <div className={styles.Contentzc}>
                       
                            
                            <div style={{color:'#fff',fontSize:16}}>
                                <div>
                                    <span style={{ color: '#108EE9'}}> 总工位： </span><span style={{fontSize:18,fontWeight:600,color:'#46CA78'}}>{totalCount}</span>&nbsp;&nbsp;
                                    <span style={{ color: '#108EE9'}}>机型：</span><span style={{color:'#fff',fontSize:16}}>{machineTypeName || machineName}</span>
                                </div>
                                {
                                    (totalDetailList || []).map((itemp, indexp) => {
                                        return (
                                            <span key={indexp}>
                                                &nbsp;&nbsp;{itemp.qualityName}：{itemp.count}&nbsp;&nbsp;({itemp.countRate}%)&nbsp;
                                            </span>
                                        )
                                    })
                                }
                                {
                                    (staticsData || []).map((item,index)=>{
                                        return (
                                            <div key={index}>
                                                <div>
                                                   <span style={{ color: '#108EE9'}}> 工位： </span> {item.pointName}&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#108EE9'}}>总数：</span>
                                                   <span style={{fontSize:18,fontWeight:600,color:'#46CA78'}}>{item.totalCount}</span>
                                                </div>
                                                {
                                                    (item.detailDtoList || []).map((itemp,indexp)=>{
                                                        return (
                                                            <span>
                                                                &nbsp;&nbsp;{itemp.qualityName}：{itemp.count}&nbsp;&nbsp;({itemp.countRate}%)
                                                            </span>
                                                        )
                                                    })
                                                }
                                            </div>
                                        )
                                    }) 
                                }
                               
                            </div>
                
                       </div>
                      
                    </div>
                </div> : 
                     <Statics receiverGroupId={receiverGroupId} parent={this}></Statics>
                }

                {
                    this.state.emailVisible && <Email parent={this} receiverGroupId={receiverGroupId}></Email>
                }

                
                {
                    this.state.warnVisible && <Warn parent={this} receiverGroupId={receiverGroupId}></Warn>
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

            {/*听音配置 */}
            <Modal
                title="检测配置"
                visible={this.state.checkVisible}
                onOk={this.run}
                onCancel={this.closeModal}
                okText="开启自动检测"
                cancelText="取消"
                >
                <div className={styles.zcUserconfirm}>
                    <div className={styles.zcUserconfirmflex}>
                        <img src={require('@src/assets/voice/index4.png')}/>
                        <select value={this.state.receiverGroupId} className={styles.select1} onChange={this.voiceChecked.bind(this)}>
                            <option value="">请选择听音组</option> 
                            {
                                (this.state.soundList || []).map((item, index) => {
                                    return (
                                        <option value ={item.id} key={index}> {item.name} </option>
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
                    </div>
                    <div className={styles.zcUserconfirmflex}>
                        <img src={require('@src/assets/voice/index3.png')}/>
                        <Input className={styles.InputStylezc} placeholder='请输入设备编号' name='machineNo' onChange = {this.inputChange.bind(this)} value={machineNo}/>

                        <div className={[styles.buttonStylezc,styles.buttonzc2].join(' ')} onClick={()=>this.timeModal()} >听音时间:{listenTime}S</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
    }

}

export default voiceIndex;
