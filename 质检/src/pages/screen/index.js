
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker  } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import styles from './screen.less';
import WholeBar from './components/WholeBar';
import {service,service1} from './service';
import moment, { localeData } from 'moment';
import WifiModel from './components/wifiModel';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
import {queryTypeFind,queryMachine,getSoundGroupList } from '@src/models/common1.js';
const tenantId = VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
message.config({
    top: 100,
    duration: 2,
});
let socketRecordid = "";
let socketLoading = '';
let t1 =null;
let t = null;
let t2 = null;
let resultArr = [];
        
import echarts from 'echarts';
let myEcharts = null;
let myEcharts1 = null;
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
        machineNo:"",
        speedList:[],
        detailDtoList:[],
        receiverGroupId:"",
        timeValue:"",
        detectorList: [],
        option:{
            title: {
                text: '',
                subtext: '',
                left: 'center',
                textStyle:{
                    color:'white',
                    fontSize:30
                }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                show:true,
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: 'white'
                }
            },
            series: [
                {
                    // name: '',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        // { value: 1048, name: 'Search Engine' },
                    ],
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    },
                    label: {
                        normal: {
                            textStyle: {
                                color: 'white',
                                fontSize: 24 // 设置扇区名称字体大小
                            }
                        }
                    },
                    color: ['#ff4500', '#32cd32', '#6495ed', '#ffa500']
                }
            ]
        },
        voiceId:"",
        staticsData:[],
        totalCount:"",
        staticsTimeVisible: false,
        startTime: "",
        endTime: "",
        plcCount:'',
        normalCount:0,
        timeoutCount:"",
        misjudgmentCount:0,
        omissionCount:0
        
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
                    voiceName: JSON.parse(localStorage.voiceInfo).name,
                    detailDtoList: JSON.parse(localStorage.voiceInfo).detailDtoList,
                    receiverGroupId: JSON.parse(localStorage.voiceInfo).id,
                    voiceId: JSON.parse(localStorage.voiceInfo).detailDtoList[0]?.detectorId || '',
                },()=>{
                    this.statisticsDetector()
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
    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            errorVisible: false,
            timeVisible: false,
            staticsTimeVisible:false,
            loginOutVisible:false
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
    statisticsDetector = (type)=>{
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
       const morningStartTimestamp = new Date(`${year}-${month}-${day} 07:00:00`).getTime();
       // 获取今天晚上7点半的时间戳
       const eveningEndTimestamp = new Date(`${year}-${month}-${day} 19:00:00`).getTime();
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
                        nextDayMorningStartTimestamp = new Date(`${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()} 19:00:00`).getTime();
                        startTimestamp = nextDayMorningStartTimestamp;
                        endTimestamp = morningStartTimestamp;
                    }else{
                        const nextDay = new Date(today);
                        nextDay.setDate(day + 1);
                        nextDayMorningStartTimestamp = new Date(`${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()} 07:00:00`).getTime();
                        startTimestamp = eveningEndTimestamp;
                        endTimestamp = nextDayMorningStartTimestamp;
                    }
            }
       }
        let params1 = {}
        params1 = {
            startTime: startTimestamp,
            endTime: endTimestamp,
            tenantId,
            receiverGroupIdList: [receiverGroupId]
        }
        service1.statisticsDetector(VtxUtil.handleTrim(params1)).then(res => {
            if (res.rc == 0) {
                if (res.ret && res.ret.length) {
                    this.setState({
                        detectorList: res.ret || [],
                        staticsData:res.ret[0]?.detailDtoList || [],
                        totalCount:res.ret[0]?.totalCount || ''
                    },()=>{
                         this.initPie();
                    })
                }else{
                    this.setState({
                        staticsData:[],
                        totalCount:0,
                    })
                }
       
            } else {
                message.error(res.err);
            }
        })
        let params = {
            startTime: startTimestamp,
            endTime: endTimestamp,
            tenantId,
        }
        service.judgeCount(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    const {totalCount,misjudgmentCount,omissionCount} = res.ret;
                    this.setState({
                        misjudgmentCount,
                        omissionCount,
                        totalJudgeCount:totalCount
                    },()=>{
                         this.initPie1();
                    })
                }
            } else {
                message.error(res.err);
            }
        })

    }
    initPie1 = ()=>{
        const {totalJudgeCount,misjudgmentCount,omissionCount} = this.state;

        let data = [];
        
        let normalCount = totalJudgeCount-misjudgmentCount-omissionCount;
        data.push(
            {
                value: misjudgmentCount,
                name:'误判:' + misjudgmentCount+'个'+((misjudgmentCount/totalJudgeCount)*100).toFixed(1) +'%'
            },
            {
                value: omissionCount,
                name:'漏判:' + omissionCount+ '个' + ((omissionCount/totalJudgeCount)*100).toFixed(1) +'%'
            },
            {
                value: normalCount,
                name:'正常:' +normalCount+ '个'+((normalCount/totalJudgeCount)*100).toFixed(1) +'%'
            },
        )
        
        if (myEcharts1) {
            myEcharts1.dispose();
            myEcharts1 = null;
        }
        if (this.echartsBox1) {
            myEcharts1 = echarts.init(this.echartsBox1);
            let option = this.state.option;
            option.series[0].data = data;
            myEcharts1.setOption(option)
            // myEcharts.on('finished', () => {
            //     myEcharts.resize()
            // })
        }
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
            // myEcharts.on('finished', () => {
            //     myEcharts.resize()
            // })
        }
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
    loadingTips() {
        this.setState({
            loadingText: '正在听音中...',
            loadingVisible: true,
            djsVisible: true
        })
        let listenTime = Number(this.state.listenTime);
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

    // ========================================================= ========================开始听音,结果==========================
    startListen() {
        message.success('等待检测中，请稍后...');
        this.clearClock();
        if (socketRecordid) {
            socketRecordid.disconnect();
            socketRecordid = null;
        }
        const {machineId,groupType,detailDtoList,degree,degree2,speed,machineNo,receiverGroupId,listenTime,} = this.state;
        let detectorIdList = [];
        for (let i = 0; i < detailDtoList.length; i++) {
               detectorIdList.push(detailDtoList[i].detectorId)
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
            machineNo,
            listenTime,
            receiverGroupId
        }
        // this.queryDetectorRecord('943dd5c4249143b8bfd', 1)
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
             socketLoading.subscribe('/assembly-topic/batchDetectorStartRecord/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                 if (msg) {
                    that.loadingTips();
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
        this.getplc();
        this.setState({
            showResult:false,
        })
  
        resultArr = [];
          if (res.rc == 0) {
            resultArr.push(res.ret);
            const {recordDto,receiverResponseList } = res.ret;
            if (recordDto.status == 1) {
                this.statisticsDetector();
                this.setState({
                    receiverResponseList,
                    loadingVisible: false,
                    recordDto: recordDto || {},
                    recordId:recordDto.id,
                    loadingText: '听音数据采集中...',
                    showResult: true,
                })
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
        const {machineId,timeValue} = this.state;
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
    loginOut = () => {
        this.setState({
            loginOutVisible: false,
        })
        this.props.history.push({
            pathname: '/login'
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
    goPage = () =>{
        this.props.history.push({pathname:`/autoExamine`})
    }
    judge = (type)=>{
        // type1,误判，type2,漏判
        let params = {
            recordId : this.state.recordId ,
        }
        if(type == 1){
            // 误判
            service.misjudgment(params).then(res => {
                if (res.rc == 0) {
                    this.statisticsDetector();
                    message.success('误判成功')
                } else {
                    message.error(res.err)
                }
    
            })
        }else{
            // 漏判
            service.omission(params).then(res => {
                if (res.rc == 0) {
                    this.statisticsDetector();
                    message.success('漏判成功')
                } else {
                    message.error(res.err)
                }
    
            })
        }

    }
    render(){
        const {listenTime,speed,showResult,errorVisible,errorTip,voiceName,machineNo,leaveTime,recordDto} = this.state;
        const {timeValue,djsVisible,machineName,groupType,machineId,machineGroupList,
            detectorList,receiverResponseList,staticsData,totalCount,wifiVisible,  plcCount,
            normalCount,
            timeoutCount } = this.state;
        return (
        <div className={styles.bodybgS}>
            <div className={styles.headStyle}>
                <div>
                    <img src={require('@src/assets/voice/logo.png')} className={styles.logo}/>
                    <img src={require('@src/assets/voice/headicon.png')} className={styles.headicon}/>
                </div>
                <div className={styles.flex}>
                    <img onClick={()=>this.goPage()} src={require('@src/assets/admin.png')} className={styles.wifiicon} title='前往默认版'
                    alt='默认版'/>
                    <div style={{fontSize:14}}>
                        plc：{plcCount} &nbsp;&nbsp;
                        正常：{normalCount} &nbsp;&nbsp;
                        超时：{timeoutCount}
                    </div>
                    <img src={require('@src/assets/voice/setting.jpg')} className={styles.wifiicon} 
                    onClick={()=>{this.setState({
                                wifiVisible:true,
                    })}}/>
                    <img src={require('@src/assets/voice/user.png')} className={styles.usericon}/>
                    <div className={styles.userFont}>{localStorage.name || '声音'}</div>
                    <div className={styles.userloginout} onClick={()=>{this.setState({
                        loginOutVisible:true
                    })}}>退出登录</div>
                </div> 
            </div>
            <div className={styles.scanStyle}>
                <div className={styles.bdBg1}>
                    <div className={styles.echartsContainer}>
                        {
                            showResult && (resultArr || []).map((item, index) => {
                                return (
                                    <WholeBar receiverResponseList={item.receiverResponseList} recordDto={item.recordDto} parent={this} key={index}/>
                                )
                            })
                        }
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
                    <div style={{marginLeft:60}}>
                        <img src={require('@src/assets/timeicon2.png')} style={{cursor:'pointer',width:'40px',height:'40px'}} title='从当前时刻开始计时'  onClick={()=>{
                            this.statisticsDetector(1)
                        }}/>
                        <img src={require('@src/assets/timeicon1.png')} style={{cursor:'pointer',width:'40px',height:'40px'}}  title='根据时间范围查询统计' onClick={()=>{
                            this.setState({
                                staticsTimeVisible:true
                            })
                        }}/>
                    </div>
                </div>
            </div>
                            
            <div className={styles.echartBg}>
                <div className={styles.echartsBg1}>
                    <div className={styles.namebg}>品质等级图</div>
                    <div ref = {
                            (c) => {
                                this.echartsBox = c
                            }
                        } 
                        style = {
                            {
                                width: '100%',
                                height: '450px',
                            }
                        }
                    /> 
                </div>
                
                <div className={styles.echartsBg1}>
                    <div className={styles.namebg}>误判漏判图</div>
                    <div ref = {
                            (c) => {
                                this.echartsBox1 = c
                            }
                        } 
                        style = {
                            {
                                width: '100%',
                                height: '450px',
                            }
                        }
                    /> 
                </div>
            
            </div>

            <div className={styles.panel}>
                <p>操作按钮</p>
                <div className={styles.panelFlex}>
                    <div className={styles.panelBtn1} onClick={()=>this.judge(1)}>
                        误判
                    </div>
                    <div className={styles.panelBtn2} onClick={()=>this.judge(2)}>
                        漏判
                    </div>
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
