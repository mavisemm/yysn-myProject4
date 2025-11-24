
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker  } from 'antd';
import styles from './knockvoice.less';
import WholeBar from './components/WholeBar';
import {service} from './service';
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
let t = null;
let stompClient="";
let stompClient1="";
let socketS = '';
let socketF = '';
let socketLoading = '';
const { MonthPicker, RangePicker } = DatePicker;
class voiceIndex extends React.Component {
    state = {
        loading: false,
        visible: false,
        tenantId: "e8e66bd5d5c946f2abcca096a9b6ac7d",
        soundList:[],
        machineGroupList:[],
        machineId:"",
        loadingVisible:false,
        managementType:"",
        machineName:"未知机型",
        recordId:"",
        loadingText: '听音数据采集中...',
        djsVisible:false,
        receiverList:[],
        machineRow:'',
        leaveTime:0,
        recordDto:{},
        mapVisible:false,
        VoiceVisible:false,
        voiceName:"请选择听音器",
        showResult:false,
        newSoundList:[],
        showCancel:false,
        errorVisible:false,
        errorTip:"",
        timeVisible:false,
        voiceId:"",
        groupType:'0',
        degree: "",
        degree2: "",
        loginOutVisible:false,
        clickTime:0,
        TurnRow:'',
        defaultCheckedList:[],
        receiverID:[],
        currentIndex:100,
        lineCount: 0,
        filePath:"",
        exportVisible:false,
        fileSrc:'',
        startTime:'',
        endTime:"",
    }
    constructor(props) {
        super(props);
        this.namespace = 'voiceIndex4';
    }
    showModal = (type) => {
        if(type == 1){
            this.queryMachine();
            this.setState({
                visible: true,
            });
        }else if(type == 3){
            //选择听筒
            this.setState({
                mapVisible: true,
            });
        }else if(type == 4){
            // 选择听音器
            this.queryVoice()
            this.setState({
                VoiceVisible: true,
            });
        } else if (type == 5) {
            this.setState({
                timeVisible: true,
            });
        }else{

        }
    }
    componentWillMount() {
    }
    componentWillUnmount(){
        if(socketS){
            socketS.disconnect();
            socketS = null;
        }
         if (socketF) {
             socketF.disconnect();
             socketF = null;
         }
           if (socketLoading) {
               socketLoading.disconnect();
               socketLoading = null;
           }
        if(t){
            clearInterval(t);
            t = null;
        }
    }
    componentDidMount(){
        let href = window.location.href;
        if (href.split('?')[1]){
            let tenantId = href.split('?')[1].split('&')[0].split('=')[1];
            this.setState({
                tenantId
            })
        }
        t = setInterval(() => {
              try {
                  socketS.send("test");
              } catch (err) {
                  console.log("断线了: " + err);
                  this.subscribe();
              }
              
                try {
                    socketF.send("testfile");
                } catch (err) {
                    console.log("断线了: " + err);
                    this.subscribeFile();
                }
                try {
                    socketLoading.send("testload");
                } catch (err) {
                    console.log("断线了: " + err);
                    this.subscribeLoad();
                }
        }, 10 * 1000)
    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            VoiceVisible: false,
            mapVisible: false,
            errorVisible: false,
            timeVisible: false,
            loginOutVisible: false,
            exportVisible:false
        })
    }
    // =========================================选择听音器逻辑开始=======================
    // ==== 查询听音器 ==== 
    queryVoice() {
        const {voiceId,tenantId} = this.state;
        let params = {
            tenantId,
        }
        let currentIndex = '';
         service.getList(VtxUtil.handleTrim(params)).then(res=>{
             if(res.rc == 0 && res.ret){
                let arr = res.ret;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].id == voiceId) {
                        currentIndex = i;
                    }
                }
                this.setState({
                    currentIndex,
                    soundList:arr
                })
             }else{
                message.error(res.err)
             }

         })
    }
    // 选择听音器
    voiceChange = (index) => {
        this.setState({
            currentIndex: index,
        })
    }
    // 取消选择听音器
    voiceCancel = () => {
        const {voiceId,soundList} = this.state;
        let arr = this.state.soundList;
        let currentIndex = 100;
        for (let i = 0; i < arr.length; i++) {
            if (voiceId == arr[i].id) {
                currentIndex = i;
            }
        }
        this.setState({
            currentIndex,
            VoiceVisible: false,
        })
    }
    // 确认听音器选择
    voiceConfirm = () => {
        let arr = this.state.soundList;
        const {currentIndex} = this.state;
        let name = '';
        let newArr = [];
        let voiceId = '';
        let degree = '';
        let degree2 = '';
        for (let i = 0; i < arr.length; i++) {
            if (currentIndex === i) {
                name += arr[i].name + '';
                newArr = arr[i].receiverList;
                voiceId = arr[i].id;
                degree = arr[i].degree;
                degree2 = arr[i].degree2;
            }
        }
        for (let j = 0; j < newArr.length; j++) {
            newArr[j] = {
                ...newArr[j],
                checked: true
            }
        }
        if(socketS){
            socketS.disconnect();
            socketS = null;
        }
        if (socketF) {
            socketF.disconnect();
            socketF = null;
        }
        if (socketLoading){
            socketLoading.disconnect();
            socketLoading = null;
        }
        this.setState({
            voiceName: name || '请选择听音器',
            VoiceVisible: false,
            newSoundList: newArr,
            voiceId,
            degree,
            degree2
        },()=>{
            this.subscribe();
            this.subscribeFile();
            this.subscribeLoad()
        })
    }
     // 确认听筒
    receiverConfirm = ()=>{
       const {newSoundList} = this.state;
       let arr = newSoundList;
       let idArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].checked) {
                idArr.push(arr[i].id)
            }
        }
        if (idArr.length == 0){
            message.error('至少选择一路听筒！！')
            return false;
        }
        this.setState({
            receiverID: idArr,
            mapVisible:false
        })
    }
    // ====选择听筒
    singleConfirm = (row) => {
        const {newSoundList} = this.state;
        let arr = newSoundList;
        for (let i = 0; i < arr.length; i++) {
            if (row.id == arr[i].id) {
                arr[i].checked = !arr[i].checked
            }
        }
        this.setState({
            newSoundList: arr
        })
    }
    // ==========================================选择听音器结束=======================

    // 查询机型
    queryMachine(){
        const {machineId,tenantId} = this.state;
        let params = {
            tenantId,
        }
        service.queryMachine(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0){
                let data = [];
                if(res.ret){
                    data = res.ret;
                    data.map(item => {
                        item.machineList.map(itemp=>{
                            if (itemp.id == machineId) {
                                 itemp.checked = true;
                            }else{
                                 itemp.checked = false;
                            }
                           
                        })
                    })
                }
                this.setState({
                    machineGroupList: data
                })
            }else{
                message.error(res.err)
            }
        })
    }
    // ========================================================= ========================开始听音,结果==========================
    startListen(groupId) {
        const {machineId,groupType,soundList,tenantId,degree,degree2,voiceId,lineCount} = this.state;
        const arr = soundList;
        let detectorId = '';
        let idarr = [];
        let idArr = [];
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id == voiceId) {
                detectorId = arr[i].id;
                idarr = arr[i].receiverList;
            }
        }
        for(let i = 0;i<idarr.length;i++){
                idArr.push(idarr[i].id)
        }
        this.setState({
            receiverID:idArr,
            showResult:false,
            loadingText:'听音数据采集中...',
            loadingVisible: true,
        })
        let params = {
            tenantId,
            machineId,
            detectorId,
            receiverIdList: idArr,
            groupType,
            groupId,
            degree,
            degree2,
            lineCount
        }
        // this.queryDetectorRecord('uA2Fo9NmzDpu5QR2Mv0', 1)
        // return false
        this.ShortTimeListen(params);
    }
   
    ShortTimeListen = (params) => {
        service.startListen(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.loadingTips();
                if (res.ret) {
                    const {id,type} = res.ret;
                    this.setState({
                        recordId: id,
                        showCancel:true,
                    })
                    this.connection(id);
                    this.connection1(id);
                }
            } else {
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
        })
     ;
    }

    // 取消听音
    cancelListen = () =>{
        const {recordId} = this.state;
        message.error('取消听音中...');
        let params = {
            id:recordId
        }
        service.cancelListen(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    loadingVisible:false,
                    showCancel:false,
                })
            } else {
                message.error(res.err);
            }
        })
    }
    // 听音结果分析,todo
    queryDetectorRecord(id,type){
        let params = {
            recordId:id
        }
        service.queryDetectorRecord(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                    const {recordDto,receiverResponseList} = res.ret;
                    const {lineCount} = recordDto;
                     if (recordDto.status == 1) {
                        // 听音完成
                        this.setState({
                            receiverResponseList: receiverResponseList || [],
                            loadingVisible: false,
                            managementType: recordDto.machineManagementType || '',
                            recordDto: recordDto || {},
                            loadingText: '听音数据采集中...',
                            showCancel: false,
                            showResult: true,
                            lineCount
                        })
              
                    }else{
                        message.error('正在计算...')
                    }
                    
            }else{
                this.setState({
                    loadingVisible:false,
                    showCancel:false,
                    errorVisible:true,
                    errorTip:res.err
                })
            }
        })
    }
    //连接 后台
    connection(recordId) {
        let that = this;
        // 建立连接对象
        let socket = new WebSocket(comm.baseurl.eventUrl);
        // 获取STOMP子协议的客户端对象
        stompClient = Stomp.over(socket);
        // 定义客户端的认证信息,按需求配置
        let headers = {
            Authorization: ''
        }
        // 向服务器发起websocket连接
        stompClient.connect(headers, () => {
            stompClient.subscribe('/assembly-topic/knock/' + recordId, (msg) => { // 订阅服务端提供的某个topic
                if(msg){
                    that.queryDetectorRecord(recordId)
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
    subscribe = ()=>{
        let voiceId = this.state.voiceId;
        let that = this;
        // 建立连接对象
        let socket = new WebSocket(comm.baseurl.eventUrl);
        // 获取STOMP子协议的客户端对象
        socketS = Stomp.over(socket);
        // 定义客户端的认证信息,按需求配置
        let headers = {
            Authorization: ''
        }
        // 向服务器发起websocket连接
        socketS.connect(headers, () => {
            socketS.subscribe('/assembly-topic/knockDetector/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                if (msg) {
                    that.setState({
                        loadingVisible:false
                    })
                     that.queryDetectorRecord(msg.body)
                
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    subscribeFile = ()=>{
         let voiceId = this.state.voiceId;
         let that = this;
         // 建立连接对象
         let socket = new WebSocket(comm.baseurl.eventUrl);
         // 获取STOMP子协议的客户端对象
         socketF = Stomp.over(socket);
         // 定义客户端的认证信息,按需求配置
         let headers = {
             Authorization: ''
         }
         // 向服务器发起websocket连接
         socketF.connect(headers, () => {
             socketF.subscribe('/assembly-topic/knockFileDetector/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                 if (msg) {
                     that.setState({
                         filePath: msg.body
                     })
                 }
             }, headers);
         }, (err) => {
             // 连接发生错误时的处理函数
             console.log('失败')
             console.log(err)
         });
    }
    subscribeLoad=()=>{
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
            socketLoading.subscribe('/assembly-topic/knockStartDetector/' + voiceId, (msg) => { // 订阅服务端提供的某个topic
                if (msg) {
                    that.setState({
                        loadingVisible: true,
                        showResult:false
                    })
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    connection1(recordId) {
        let that = this;
        // 建立连接对象
        let socket = new WebSocket(comm.baseurl.eventUrl);
        // 获取STOMP子协议的客户端对象
        stompClient1 = Stomp.over(socket);
        // 定义客户端的认证信息,按需求配置
        let headers = {
            Authorization: ''
        }
        // 向服务器发起websocket连接
        stompClient1.connect(headers, () => {
            stompClient1.subscribe('/assembly-topic/fileKnock/' + recordId, (msg) => { // 订阅服务端提供的某个topic
                if(msg){
                   that.setState({
                        filePath:msg.body
                   })
                    if (stompClient1) {
                        stompClient1.disconnect();
                    }
                }
            }, headers);
        }, (err) => {
            // 连接发生错误时的处理函数
            console.log('失败')
            console.log(err)
        });
    }
    // =========================================================听音分析，结束===========================
    inputTime = (value) => {
        this.setState({
            lineCount: value
        })
    }
    timeConfirm = () => {
        const {lineCount} = this.state;
        this.setState({
            timeVisible:false,
            lineCount
        })
    }
    machineClick=(row)=>{
        let data = this.state.machineGroupList;
        data.map(item => {
            item.machineList.map(itemp => {
                if (row.id == itemp.id){
                    itemp.checked = true;
                }else{
                     itemp.checked = false;
                }
            })
        })
        this.setState({
            machineRow: row,
            machineGroupList: data,
        })
    }
    jxConfirm = () =>{
        let row = this.state.machineRow;
        this.setState({
            machineId: row.id,
            machineName: row.name,
            visible: false
        },()=>{})
    }
    clearMachine = ()=>{
        this.setState({
            machineId:"",
            machineName:'未知机型'
        })
    }
    // ====安卓端开始=============
    loginOut = () =>{
        this.setState({
            loginOutVisible: false,
        })
         android.h_logout();
    }
    export = ()=>{
        this.setState({
            exportVisible:true
        })
    }
     timeOnChange = (value, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
      
    }
    timeOnOk = (value) => {
        const {tenantId,startTime,endTime} = this.state;
        let params = {
            startTime,
            endTime,
            tenantId
        }
         service.exportFile(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                 if(res.ret){
                    this.setState({
                        fileSrc: res.ret
                    })
                 }
            }else{
                this.setState({
                    loadingVisible:false,
                    showCancel:false,
                    errorVisible:true,
                    errorTip:res.err
                })
            }
        })
    }

    render(){
        const {showResult,errorVisible,errorTip,showCancel,voiceName,recordDto} = this.state;
        const {tenantId,receiverResponseList,receiverID,currentIndex,lineCount,filePath} = this.state;
        return (
        <div className={styles.bodybg}>
            <div className={styles.headStyle}>
                <div>
                     <img src={require('@src/assets/voice/logo.png')} className={styles.logo}/>
                    <img src={require('@src/assets/voice/headicon.png')} className={styles.headicon}/>
                </div>
                <div className={styles.flex}>
                    <img src={require('@src/assets/voice/user.png')} className={styles.usericon}/>
                    <div className={styles.userFont}>声音</div>
                    <div className={styles.userloginout} onClick={()=>{this.setState({
                        loginOutVisible:true
                    })}}>退出登录</div>
                </div> 
            </div>
                {
                    this.state.loadingVisible ?
                    <div className={styles.loading}>
                        <Spin size="large"/>
                        <p className={styles.loadingTip}>{this.state.loadingText}</p>
                    </div> : ''
                }
                <div className={styles.newContent}>
                    {
                        showResult ? <div style={{width:'65%'}}>
                            < WholeBar receiverResponseList={receiverResponseList} lineCount={this.state.lineCount} tenantId={tenantId} parent={this} filePath={filePath}/>
                        </div> :  <div className={styles.newLeft}> </div>
                    }
                    <div className={styles.newRight}>
                        <div className={styles.middleLeftyma}>
                            <div className={styles.flex}>
                                <img src={require('@src/assets/voice/index4.png')} className={styles.listenIcon}/>
                                 <div className={styles.listenButton} onClick={()=>this.showModal(4)}>{
                                     voiceName
                                 }</div>
                                <div className={styles.listenButton1} onClick={()=>this.showModal(3)} >听筒</div>
                            </div>
                            <div className={styles.flex}>
                                <img src={require('@src/assets/voice/index1.png')} className={styles.listenIcon}/>
                                <div className={styles.listenButton} onClick={()=>this.showModal(1)}>{this.state.machineName.length > 20 ? this.state.machineName.substring(0,16) + '...' : this.state.machineName}</div>
                            </div>
                            <div className={styles.flex}>
                                <img src={require('@src/assets/voice/index2.png')} className={styles.listenIcon}/>
                                {
                                    showCancel ?  <div className={styles.listenButton} onClick={()=>this.cancelListen()}>取消听音</div> :
                                    < div className={styles.flex}>
                                        <div className={styles.listenButton} onClick={()=>this.startListen()}>开始听音</div>
                                         <div className={styles.listenButton1} onClick={()=>this.showModal(5)} >等级</div>
                                    </div>
                                }
                            </div>
                            <div className={styles.flex}>
                                <img src={require('@src/assets/voice/index1.png')} className={styles.listenIcon}/>
                                <div className={styles.listenButton} onClick={()=>this.export()}>导出记录</div>
                            </div>
                        </div>
                        {
                          showResult ? < div className = {styles.print} >
                            <div className={styles.printContent}>
                                <div className={styles.printRight}>

                                    <div className={styles.printStyle}>
                                        <p>机型：</p>
                                        <div>{recordDto.machineTypeName}</div>
                                    </div>
                                    <div className={styles.printStyle}>
                                        <p>听音时间：</p>
                                        <div>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                    </div>
                                    <div className={styles.printStyle}>
                                        <p>编号：</p>
                                        <div style={{color:recordDto.color}}>{recordDto.id}</div>
                                    </div>
                                </div>
                            </div>
                        </div> :''
                        }
                      
                    </div>
                </div>
            {/* 机型弹窗 */}
            {
                this.state.visible && <div className={styles.machineModal}>
                <div className={styles.machineContent}>
                    <div className={styles.machineHead} onClick={this.closeModal}>
                        <div className={styles.unknow} onClick={this.clearMachine.bind(this)}>
                            未知机型
                        </div>
                        <img src={require('@src/assets/voice/close.png')}  className={styles.closeIcon}/>
                     </div>
                    <div className={styles.Scrollflex}>
                    {
                        (this.state.machineGroupList || []).map((item,id)=>{
                            return (
                                <div className = {styles.machineType}  key={id}>
                                    <div className={styles.machinetitle}>
                                        <img src={require('@src/assets/voice/source.png')} className={styles.machineIcon}/>
                                        <p> {item.name}：</p>
                                    </div>
                                    <div className={styles.machineTypeulul}>
                                        {
                                            (item.machineList || []).map((itemp, id) => {
                                                return (
                                                    <div key={id} className={itemp.checked?"activemachineli":'machineTypeululli'} onClick={()=>{this.machineClick(itemp)}}>{itemp.name}</div>
                                                )
                                            })
                                        }
                                   </div>
                                </div>
                            )
                        })
                    }
                    </div>
                    {/* 确定取消按钮 */}
                    <div className={styles.machineConfirm}>   
              
                        <div className={styles.machineButton} onClick={()=>{this.jxConfirm()}}>
                                确定
                        </div>
                        <div className={styles.machineCancelButton} onClick={()=>{this.closeModal()}}>
                                取消
                        </div>
                    </div>
                </div>
            </div>
            }

             <Modal
                title="选择听音器"
                visible={this.state.VoiceVisible}
                onOk={this.voiceConfirm}
                onCancel={this.voiceCancel}
                okText="确认"
                cancelText="取消"
                >
                    <div className = {styles.voiceTypeyma}>
                        {
                            (this.state.soundList || []).map((item,index)=>{
                                return (
                                    <div key={index} className={index === currentIndex?"activevoiceliyma":'voiceliyma'} onClick={()=>{this.voiceChange(index)}}>{item.name}</div>
                                )
                            })
                        }
                    </div>
            </Modal>

            {/* 听音时间修改 */}
             <Modal
                title="操作弹窗"
                visible={this.state.timeVisible}
                onOk={this.timeConfirm}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div className={styles.flex}>
                        设置合格等级线数值：
                        <InputNumber style={{width:100,marginLeft:10}} onChange = {this.inputTime.bind(this)} value={lineCount} min = {1} />
                    </div>
            </Modal>
     

            {/* 听筒坐标 */}
            <Modal
                title="听音器听筒"
                visible={this.state.mapVisible}
                onOk={this.receiverConfirm}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <ul className={styles.voiceFlex}>
                        {
                            (this.state.newSoundList || []).map((item, index) => {
                                return (
                                    <li key={index} onClick={()=>this.singleConfirm(item)}>
                                        {
                                            item.checked ?  <img src={require('@src/assets/voice/checked.png')}/> :
                                             <img src={require('@src/assets/voice/uncheck.png')} />
                                        }
                                       <p>{item.name}</p>
                                    </li>

                                )

                            })
                        }
                    </ul>


            </Modal>

            {/* 导出选择弹窗 */}
             <Modal
                title="导出文件"
                visible={this.state.exportVisible}
                onOk = {this.closeModal}
                onCancel = {this.closeModal}
                okText="关闭"
                cancelText="取消"
                >
                      <RangePicker
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    placeholder={['开始时间', '结束时间']}
                    onChange={this.timeOnChange}
                    onOk={this.timeOnOk}
                    />
                    <a href={this.state.fileSrc}  onClick={()=>this.closeModal()}><Button type='primary' style={{marginLeft:'10px'}}>导出</Button></a>
                    
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
                    <div>  {errorTip}</div>
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
