
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker  } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import styles from './style.less'; // 使用新的样式文件
import WholeBar from './components3/WholeBar';
import {service,service1} from '../service';
import moment, { localeData } from 'moment';
import WifiModel from './components/wifiModel';
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
import {queryTypeFind,queryMachine,getSoundGroupList } from '@src/models/common1.js';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
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
        downLoadFileVisible:false,
        receiverGroupId:"",
        timeValue:"",
        detectorList: [],
        option:{
            title: {
                text: '',
                subtext: '',
                left: 'right',
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
                    // name: '',
                    type: 'pie',
                    radius: '50%',
                    color:['green','red','orange'],
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
        voiceId:"",
        staticsData:[],
        totalCount:"",
        staticsTimeVisible: false,
        startTime: "",
        endTime: "",
        plcCount:'',
        normalCount:"",
        timeoutCount:""
    }
    constructor(props) {
        super(props);
        this.namespace = 'AutoExamine';
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
                    this.getstatistics()
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
            downLoadFileVisible:false,
            staticsTimeVisible:false,
            loginOutVisible:false,
            dectorVisible:false,
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
    getstatistics = ()=>{
         this.props.parent.getpoint(this);
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
    run() {
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
        service.run(VtxUtil.handleTrim(params)).then(res => {
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
            const {recordDto,receiverResponseList } = res.ret;
            resultArr.push(res.ret);
            if (recordDto.status == 1) {
                this.getstatistics();
                this.setState({
                    receiverResponseList,
                    loadingVisible: false,
                    recordDto: recordDto || {},
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
        this.props.history.push({pathname:`/screen`})
    }
    lookStatus = ()=>{
        const {voiceId} = this.state;
        if(voiceId == ''){
            message.error('请先选择听音器')
            return false;
        }
        this.setState({
            dectorVisible:true
        })
        // 查询当前听音器状态
        let params = {
            detectorId:voiceId,
        }
        service.findNg(params).then(res => {
            if (res.rc == 0) {
                const {status} = res.ret;
                this.setState({
                    status,
                })
            } else {
                message.error(res.err)
            }

        })
    }
    setngStatus = ()=>{
        const {status} = this.state;
        let params = {
            detectorId: this.state.voiceId,
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
    render(){
        const {listenTime,speed,showResult,errorVisible,errorTip,voiceName,machineNo,leaveTime,recordDto} = this.state;
        const {timeValue,djsVisible,machineName,groupType,machineId,machineGroupList,
            detectorList,receiverResponseList,staticsData,totalCount,wifiVisible,  plcCount,
            normalCount,
            timeoutCount,status } = this.state;
        return (
        <div >
            <div className={styles.scanStyle}>
                
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
                        <div className={[styles.buttonStylezc,styles.buttonzc1].join(' ')} onClick={()=>this.run()}>开启自动检测</div>
                        <div className={[styles.buttonStylezc,styles.buttonzc2].join(' ')} onClick={()=>this.exportFile()}>下载质检报告</div>
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
                    showResult ? <WholeBar receiverResponseList={this.state.receiverResponseList} recordDto={this.state.recordDto} parent={this}/> : ''
                } 
                
                                
                {/*<div className={styles.echartsContainer}>
                    {
                        showResult && (resultArr || []).map((item, index) => {
                            return (
                                <WholeBar receiverResponseList={item.receiverResponseList} recordDto={item.recordDto} parent={this} key={index}/>
                            )
                        })
                    }
                </div>*/}


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
            {/* 质检报告确认弹窗 */}
            <Modal
                title="下载质检报告提示"
                visible={this.state.downLoadFileVisible}
                onOk = {this.confirmDownLoad}
                onCancel={this.closeModal}
                okText="确认下载"
                cancelText="取消"
                >
                    <div>已选机型：{machineName}</div>
                    <div style={{margin:"10px 0"}}>设备编号：{machineNo}</div>
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
            {/* 当前听音器状态 */}
            <Modal
                title="当前听音器状态"
                visible={this.state.dectorVisible}
                onOk = {this.closeModal}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div>
                        当前听音器状态:
                        <span style={{color:"blue"}}> {status == 0 ? '正常检测' : '输出全是NG'}</span>
                    </div>
                   <BtnWrap>
                        <Button type='primary' onClick={()=>{this.setngStatus()}}>切换状态</Button>
                   </BtnWrap>
            </Modal>
        </div>
    );
    }

}

export default voiceIndex;
