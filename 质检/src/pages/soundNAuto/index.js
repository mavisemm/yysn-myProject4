
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker  } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import styles from './soundNAuto.less';
import R1 from './components/r1';
import R2 from './components/r2';
import R3 from './components/r3';
import {service,service1} from './service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
message.config({
    top: 400,
    duration: 2,
});
let socketRecordid = "";
let socketLoading = '';
let t1 =null;
let t = null;
let t2 = null;
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
        machineName:"请选择机型",
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
        speedList:[],
        detailDtoList:[],
        receiverGroupId:"",
        timeValue:"",
        voiceId:"",
        staticsData:[],
        totalCount:"",
        staticsTimeVisible: false,
        startTime: "",
        endTime: "",
        voiceList:[],
        showLoading1:false,
        showLoading2: false,
        showLoading3: false,
        showResult1: false,
        showResult2: false,
        showResult3: false,
        receiverResponseList1:[],
        receiverResponseList2:[],
        receiverResponseList3:[],
        recordDto1:{},
        recordDto2: {},
        recordDto3: {},
        machineNo:"",
        allTotal:'',
        allDetailList:[]

    }
    constructor(props) {
        super(props);
        this.namespace = 'Screen';
    }
    timeModal = () => {
        const {listenTime} = this.state;
        this.setState({
            timeValue: listenTime,
            timeVisible: true,
        });
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
    }
    componentDidMount(){
        if (localStorage.tenantId){
            this.setState({
                tenantId: localStorage.tenantId
            })
            this.queryTypeFind();
            this.queryMachine();
            this.getSoundGroupList();
            this.querySoundDetector();

            if (localStorage.voiceInfo) {
                this.setState({
                    voiceName: JSON.parse(localStorage.voiceInfo).name,
                    detailDtoList: JSON.parse(localStorage.voiceInfo).detailDtoList,
                    receiverGroupId: JSON.parse(localStorage.voiceInfo).id,
                    voiceId: JSON.parse(localStorage.voiceInfo).detailDtoList[0]?.detectorId || '',
                },()=>{
                    this.statisticsPoint()
                })
            }
            if (localStorage.machineInfo) {
                let temp = JSON.parse(localStorage.machineInfo);
                this.setState({
                    listenTime: temp.listenTime,
                    machineId: temp.id,
                    speedList: temp.speedList,
                    speed: temp.speedList[0]?.speed || '',
                    machineName: temp.name,
                })
            }
            // if (localStorage.machineNo) {
            //     this.setState({
            //         machineNo: JSON.parse(localStorage.machineNo)
            //     })
            // }
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
    closeModal = (msg) => {
        this.setState({
            visible: false,
            errorVisible: false,
            timeVisible: false,
            staticsTimeVisible:false,
            loginOutVisible:false,
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

      
    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
    }
    // 统计
    statisticsPoint = (type)=>{
        const {receiverGroupId} = this.state;
        const now = Date.now(); // 获取当前时间戳
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 获取一个月前的时间
        const oneMonthAgoTimestamp = oneMonthAgo.getTime(); // 获取一个月前的时间戳
        let params = {}
        if(type==1){
            message.success('已调整为从当前时间开始计数！')
            localStorage.now = now;
            params = {
                startTime: Number(localStorage.now),
                endTime: now,
                tenantId: localStorage.tenantId,
                receiverGroupIdList: [receiverGroupId]
            }
        }else if(type == 2){
            const {startTime,endTime} = this.state;
            this.setState({
                staticsTimeVisible:false,
            })
            params = {
                startTime,
                endTime,
                tenantId: localStorage.tenantId,
                receiverGroupIdList: [receiverGroupId]
            }
        }else{
            if(localStorage.now){
                params = {
                    startTime: Number(localStorage.now),
                    endTime: now,
                    tenantId: localStorage.tenantId,
                    receiverGroupIdList: [receiverGroupId]
                }
            }else{
                params = {
                    startTime: oneMonthAgoTimestamp,
                    endTime: now,
                    tenantId: localStorage.tenantId,
                    receiverGroupIdList: [receiverGroupId]
                }
            }
        }
        service1.statisticsPoint(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0 && res.ret) {
                    this.setState({
                        staticsData: res.ret || [],
                    })
        
            } else {
                message.error(res.err);
            }
        })
        service1.queryTotal(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                const {totalCount,detailDtoList} = res.ret;
                this.setState({
                    allTotal: totalCount,
                    allDetailList:detailDtoList
                })
            } else {
                message.error(res.err);
            }
        })
    }

    // 获取听音器组列表
    getSoundGroupList = ()=>{
        let params = {
            tenantId:localStorage.tenantId,
        }
        service.getSoundGroupList(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0 && res.ret){
                let arr = res.ret;
                this.setState({
                    soundList:arr
                })
            }else{
                message.error(res.err)
            }

        })
    }
    // 查询机型
    queryMachine =()=>{
        const {tenantId,machineId } = this.state;
        let params = {
            tenantId,
        }
        service.queryMachine(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0){
                let data = [];
                let arr =[]

                if(res.ret){
                    data = res.ret;
                    data.map(item => {
                        if (item.machineList){
                            arr = arr.concat(item.machineList)
                        }
                    })
                    for (let i = 0; i < arr.length; i++) {
                        let temp = arr[i];
                        if (machineId == temp.id) {
                            localStorage.machineInfo = JSON.stringify(temp);
                            this.setState({
                                machineId: temp.id,
                                listenTime: temp.listenTime,
                                timeValue: temp.listenTime,
                                machineName: temp.name,
                                speedList: temp.speedList,
                                speed: temp.speedList[0]?.speed || ''
                            })
                        }
                    }
                } 
                this.setState({
                    machineGroupList: arr
                })
            }else{
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
                socketLoading.send("testLoading");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeLoading();
            }
            try {
                socketRecordid.send("test");
            } catch (err) {
                console.log("断线了: " + err);
                this.subscribeRecordid();
            }
        }, 3 * 1000)
    }

    // ========================================================= ========================开始听音,结果==========================
    startListen() {
        message.success('等待检测中，请稍后...')
         this.queryTypeFind();
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
        // this.queryDetectorRecord('29bc9cbade4d4972866', 1)
        // return false
        this.ShortTimeListen(params);
    }
    ShortTimeListen = (params) => {
        service.startListen(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.checkWebsocket();
                this.subscribeRecordid();
                this.subscribeLoading()
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
    // 得到听音纪录id
    subscribeRecordid() {
        const {voiceId} = this.state;
        let that = this;
        let socket = new WebSocket(comm.baseurl.eventUrl);
        socketRecordid = Stomp.over(socket);
        let headers = {
            Authorization: ''
        }
        socketRecordid.connect(headers, () => {
            socketRecordid.subscribe('/assembly-topic/batchDetectorRecordAndReceiver/' + voiceId, (msg) => {
                if (msg) {
                     let temp = msg.body.split(":");
                    that.queryDetectorRecord(temp[0],temp[1])
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

        //  返回的是听音记录id:听筒id，根据记录再去调接口查询
         socketLoading.connect(headers, () => {
             socketLoading.subscribe('/assembly-topic/batchReceiverStartRecord/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                 if (msg) {
                    let temp = msg.body.split(":");
                    // console.log(msg,'msg')
                    let receiverId = temp[1];
                    if (receiverId == receiverArr[0]) {
                        that.setState({
                            showLoading1:true,
                            // showResult1:false,
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
                 }
             }, headers);
         }, (err) => {
             // 连接发生错误时的处理函数
             console.log('失败')
             console.log(err)
         });
    }
  
    // 听音结果分析,todo
    queryDetectorRecord(id,receiverId){
        this.clearClock();
        this.getplc();
        this.setState({
            showResult:false,
        })
        let params = {
            recordId:id
        }
        service.queryDetectorRecord(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                const {recordDto,receiverResponseList } = res.ret;
                if (recordDto.status == 1) {
                    this.statisticsPoint();
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
        })
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
                this.queryMachine();
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
                    speedList: temp.speedList,
                    speed: temp.speedList[0]?.speed || ''
                })
            }
        }
       
    }
    // 选择转速
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
    queryTypeFind = () => {
        let params = {
            tenantId: localStorage.tenantId
        }
        service.queryTypeFind(params).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    localStorage.status = JSON.stringify(res.ret);
                }
            } else {
                message.error(res.err)
            }
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

    render(){
        const {listenTime,speed,errorVisible,errorTip} = this.state;
        const {tenantId,timeValue,machineName,groupType,staticsData,
        showResult1, showResult2, showResult3, showLoading1, showLoading2, showLoading3, receiverResponseList1
        ,receiverResponseList2,receiverResponseList3,recordDto1,recordDto2,recordDto3,machineNo,allDetailList,allTotal,
        plcCount,normalCount, timeoutCount} = this.state;
        return (
        <div className={styles.bodybgN}>
                <div className={styles.headStyle}>
                    <div>
                        <img src={require('@src/assets/voice/logo.png')} className={styles.logo}/>
                        <img src={require('@src/assets/voice/headicon.png')} className={styles.headicon}/>
                    </div>
                    <div className={styles.flex}>
                        <img src={require('@src/assets/voice/user.png')} className={styles.usericon}/>
                        <div style={{fontSize:14}}>
                            plc：{plcCount} &nbsp;&nbsp;
                            正常：{normalCount} &nbsp;&nbsp;
                            超时：{timeoutCount}
                        </div>
                        <div className={styles.userFont}> &nbsp;&nbsp; &nbsp;&nbsp;{localStorage.name || '声音'}</div>
                        <div className={styles.userloginout} onClick={()=>{this.setState({
                            loginOutVisible:true
                        })}}>退出登录</div>
                    </div> 
                </div>
                <div className={styles.topFlex}>
                    <div className={styles.bdBg1}>
                        <div style={{margin:'5px auto',width:200}}>
                            <img src={require('@src/assets/timeicon2.png')} title='从当前时刻开始统计' onClick={()=>{
                                this.statisticsPoint(1)
                            }}/>
                            <img src={require('@src/assets/timeicon1.png')} title='根据时间范围查询' onClick={()=>{
                                this.setState({
                                    staticsTimeVisible:true
                                })
                            }}/>
                        </div>
                        <div className={styles.bdBg}>
                            {
                                (staticsData || []).map((item,index)=>{
                                    return (
                                        <div key={index}  className={styles.flex}>
                                            <div>
                                                点位名称：{item.pointName} &nbsp;&nbsp;总数：&nbsp;&nbsp;{item.totalCount}&nbsp;&nbsp;
                                            </div>
                                            {
                                                (item.detailDtoList || []).map((itemp,indexp)=>{
                                                    return (
                                                        <div className={styles.flex}>
                                                            &nbsp;&nbsp;{itemp.qualityName}：&nbsp;&nbsp;{itemp.count}&nbsp;&nbsp;({(Number(itemp.countRate)*100).toFixed(2)}%)&nbsp;&nbsp;
                                                        </div>
                                                    )
                                                })
                                            }
                                            
                                        </div>
                                    )
                                }) 
                            }
                            <div className={styles.flex}>
                                <div>
                                    总数：&nbsp;&nbsp;{allTotal}&nbsp;&nbsp;
                                </div>
                                {
                                    (allDetailList || []).map((itemp,indexp)=>{
                                        return (
                                            <div className={styles.flex} key={indexp}>
                                                &nbsp;&nbsp;{itemp.qualityName}：&nbsp;&nbsp;{itemp.count}&nbsp;&nbsp;({(Number(itemp.countRate)*100).toFixed(2)}%)&nbsp;&nbsp;
                                            </div>
                                        )
                                    })
                                }
                                
                            </div>
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
                            <div className={styles.zcturnStyle} onClick={()=>this.turnConfirm()} >
                                <img src={require('@src/assets/change.png')} className={styles.changeIcon}/>
                                {
                                    groupType == 0 ? '正转' : '反转'
                                }
                            </div>
                            <div className={styles.zcSpeedChoose}>
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
                            
                        </div>
                        <div className={styles.zcUserconfirmflex}>
                            <img src={require('@src/assets/voice/index3.png')}/>
                             <Input className={styles.InputStylezc} placeholder='请输入设备编号' name='machineNo' onChange = {this.inputChange.bind(this)} value={machineNo}/>
                            <div className={[styles.buttonStylezc,styles.buttonzc2].join(' ')} onClick={()=>this.timeModal()} >听音时间:{listenTime}S</div>
                        </div>
                        <div className={styles.zcUserconfirmflex}>
                            <img src={require('@src/assets/voice/index2.png')}/>
                            <div className={[styles.buttonStylezc,styles.buttonzc1].join(' ')} onClick={()=>this.startListen()}>开启自动检测</div>
                        </div>
                    </div>
                </div>
                <div className={styles.echartsContainer}>
                    {/*1  */}
                    <div className={styles.echartsContentzc}>
                        <R1  showLoading={showLoading1} listenTime={listenTime} receiverResponseList={receiverResponseList1} recordDto={recordDto1}  parent={this} />
                    </div>
            
                   
                   <div className={styles.echartsContentzc}>
                        <R2 showLoading={showLoading2} listenTime={listenTime} receiverResponseList={receiverResponseList2} recordDto={recordDto2}  parent={this} />
                    </div>

                    <div  className={styles.echartsContentzc}>
                        <R3  showLoading={showLoading3} listenTime={listenTime}  receiverResponseList={receiverResponseList3} recordDto={recordDto3}  parent={this} />
                    </div>
                </div>
                 
            
            
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
                        <InputNumber style={{width:100,marginLeft:10}} onChange = {this.inputTime.bind(this)} name='listenTime' value={timeValue} min = {1} max ={5000}/>
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
            {/* 时间选择弹窗 */}
            <Modal
                title="统计时间范围"
                visible={this.state.staticsTimeVisible}
                onOk = {()=>this.statisticsPoint(2)}
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
        </div>
    );
    }

}

export default voiceIndex;
