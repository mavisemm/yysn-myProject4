
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin  } from 'antd';
import styles from './sgcheck.less';

import WholeBar from './components/WholeBar';

import WifiModel from './components/wifiModel';
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
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
let stompClient = "";
let t1 =null;
let t2 = null;
class sgCheck extends React.Component {
    state = {
        loading: false,
        visible: false,
        tenantId: '',
        platList:[],
        machineList:[],
        speed:"",
        machineId:"",
        loadingVisible:false,
        machineName:"请选择备检设备",
        listenTime:0,
        loadingText: '数据采集中...',
        djsVisible:false,
        wifiVisible:false,
        leaveTime:0,
        recordDto:{},
        platName:"请选择检测台",
        showResult:false,
        showCancel:false,
        errorVisible:false,
        errorTip:"",
        timeVisible:false,
        timeEditVisible:false,
        loginOutVisible:false,
        defaultCheckedList:[],
        recordId: '',
        degree:0.3,
        degree2:0.3,
        machineVisible:false,
        detailDtoList:[],
        plainOptions:[],
        platformId:"",
        rotateSpeed:"",
        torque:"",
        power:"",
        hydraulic:"",
        result:{},
        deviceIdList:[]
    }
    constructor(props) {
        super(props);
    }
    showModal = (type) => {
        if (type == 5) {
            this.setState({
                timeVisible: true,
            });
        }else{

        }
    }
    componentWillUnmount() {
        this.clearClock()
    }

    componentDidMount(){
        let href = window.location.href;
        let tenantId = '';
        if (href.split('?')[1]) {
            tenantId = href.split('?')[1].split('&')[0].split('=')[1];
            localStorage.tenantId = tenantId;
            this.setState({
                tenantId
            })
        }
        if (localStorage.tenantId || tenantId) {
            this.setState({
                tenantId: localStorage.tenantId || tenantId
            },()=>{
                this.queryMachine();
                this.getPlat();
                if (localStorage.sgInfo) {
                    let sgInfo = JSON.parse(localStorage.sgInfo);
                    const {platName,plainOptions, machineId,
                        machineName, rotateSpeed, hydraulic, torque, power, platformId, listenTime, deviceRequestList, deviceIdList
                        } = sgInfo;
                    this.setState({
                        platName,
                        plainOptions,
                        machineId,
                        machineName,
                        rotateSpeed,
                        hydraulic,
                        torque,
                        power,
                        platformId,
                        listenTime,
                        deviceRequestList,
                        deviceIdList
                    })
                }
            })

        }else{
            this.props.history.push({
                pathname: `/loginSg`
            })
        }
       
    }
    closeModal = (msg) => {
        this.setState({
            visible: false,
            wifiVisible: false,
            errorVisible: false,
            timeVisible: false,
            timeEditVisible: false,
            loginOutVisible: false,
            machineVisible:false
        })
    }

    clearClock = () => {
        try {
            clearTimeout(t1)
            clearTimeout(t2)
        } catch (error) {}
        t1 = null;
        t2 = null;
    }

    // 获取听音器组列表
    getPlat = ()=>{
        const {tenantId} = this.state;
        let params = {
            tenantId,
        }
         service.getPlat(VtxUtil.handleTrim(params)).then(res => {
             if(res.rc == 0 && res.ret){
                let arr = res.ret.items || [];
                this.setState({
                    platList:arr
                })
             }else{
                message.error(res.err)
             }

         })
    }

    // 查询机型
    queryMachine =()=>{
        const {tenantId} = this.state;
        let params = {
            tenantId,
        }
        service1.queryMachine(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0){
                let data = res.ret;
                let arr =[]
                for(let i = 0;i<data.length;i++){
                    if (data[i].machineList.length){
                        arr = arr.concat(data[i].machineList)
                    }
                }
                this.setState({
                    machineList: arr
                })
            }else{
                message.error(res.err)
            }
        })
    }


    // ========================================================= ========================开始听音,结果==========================
    startListen() {
        this.clearClock();
        if (stompClient) {
            stompClient.disconnect();
        }
        const {machineId,plainOptions,tenantId,degree,degree2,speed,deviceRequestList,platformId,
             rotateSpeed,
             torque,
             power,
             hydraulic,
             machineName, platName, listenTime, deviceIdList
        } = this.state;
    
        this.setState({
            showResult:false,
            loadingText:'数据采集中...',
            loadingVisible: true,
        })
        let params = {
            tenantId,
            machineId,
            degree,
            degree2,
            deviceRequestList,
            platformId,
            rotateSpeed,
            torque,
            power,
            hydraulic
        }

        // 记录参数
        let sgInfo = {
            machineName,
            machineId,
            platName,
            platformId,
            rotateSpeed,
            torque,
            power,
            hydraulic,
            plainOptions,
            deviceRequestList,
            listenTime,
            deviceIdList
        }
        localStorage.sgInfo = JSON.stringify(sgInfo);

        // console.log(sgInfo,'sgInfo')
        // this.setState({
        //     recordId: 'GPQsVPdlLHoNJS7oE23'
        // })
        // this.queryDetectorRecord('GPQsVPdlLHoNJS7oE23', 1)
        // return false
        this.ShortTimeListen(params);
    }

    initWebsocket = (id)=>{
        this.connection(id);
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
            loadingText: '正在采集中...',
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
        }, listenTime*1000)
        this.openDjs(listenTime);
    }
    openDjs = (listenTime) => {
        let count = Number(listenTime);
        let that = this;
        function countNum() {
            count--;
            that.setState({
                leaveTime: count
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
        message.error('取消检测中...');
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
            stompClient.subscribe('/assembly-topic/survey/' + recordId, (msg) => {
                if (msg) {
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
    // 听音结果分析,todo
    queryDetectorRecord=(id)=>{
        this.clearClock();
        let params = {
            recordId:id
        }
        service.queryDetectorRecord(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                const {receiverResponseList,machineName, listenTime,surveyTime,recordId,
                    power,
                    rotateSpeed,
                    torque} = res.ret;
                let recordDto = {
                    machineName,
                    listenTime,
                    surveyTime,
                    recordId,
                    power,
                    rotateSpeed,
                    torque
                }
                // 听音完成
                this.setState({
                    receiverResponseList: receiverResponseList || [],
                    loadingVisible: false,
                    recordDto: recordDto || {},
                    loadingText: '数据采集中...',
                    result:res.ret || {},
                    showCancel: false,
                    showResult: true
                })
             
            }else{
                this.setState({
                    loadingVisible:false,
                    showCancel:false,
                    errorVisible:true,
                    errorTip:res.err || '异常！'
                })
                
            }
        })
    }
    // =========================================================听音分析，结束===========================
    inputTime = (value) => {
        this.setState({
            listenTime: value
        })
    }
    timeConfirm = () => {
        this.setState({
            timeEditVisible: true
        })
    }
    timeEditConfirm = () =>{
        const {tenantId,listenTime,machineId} = this.state;
        let params = {
            tenantId,
            listenTime,
            machineId
        }
        service1.editSpecialListenTime(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    timeEditVisible: false,
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
    
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"
        ];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        if (flag){
            this.props.history.push({
                pathname: `/loginSg`
            })
        }else{
            android.h_logout();
        }
    }
    // ====安卓端结束==============
    //=======选择听音器组
    voiceChange = (e) => {
        const {VoiceVisible} = this.state;
        this.setState({
            VoiceVisible: !VoiceVisible
        })
    }

    voiceChecked = (item) => {
        let arr = item.detailDtoList || [];
        let plainOptions = [];
        for (let i = 0; i < arr.length; i++) {
            plainOptions.push({
                label: arr[i].name,
                value: arr[i].deviceId,
                key: arr[i].deviceId,
                type:arr[i].type
            })
        }
        this.setState({
            platformId:item.id,
            platName: item.name,
            detailDtoList:item.detailDtoList,
            plainOptions,
            VoiceVisible:false
        })
    }

    // ======选择机型
    machineChange = (e)=>{
        this.setState({
            machineVisible: true
        })
    }
    machineChoose = (e)=>{
       this.setState({
        machineId:e
       })
    }

    machineChecked = (item)=>{
        const {machineList,machineId} = this.state;
        for(let i = 0;i<machineList.length;i++){
            if(machineList[i].id == machineId){
                this.setState({ 
                    machineId: machineList[i].id,
                    listenTime: machineList[i].listenTime,
                    machineName: machineList[i].name,
                    machineVisible: false,
                })
            }
        }
 
    }
    checkChange = (checkedValues) => {
        const {detailDtoList} = this.state;
        let arr = [];
        let idArr = [];
        for(let i = 0;i<detailDtoList.length;i++){
            for(let j = 0;j<checkedValues.length;j++){
                if( checkedValues[j] == detailDtoList[i].deviceId){
                    idArr.push(detailDtoList[i].deviceId);
                    arr.push({
                        deviceId: detailDtoList[i].deviceId,
                        type: detailDtoList[i].type
                    })
                }
               
            }
        }
        this.setState({
            deviceRequestList: arr,
            deviceIdList: idArr
        })
    }

    inputValue = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
     }
    printPaper() {
        let id = this.state.recordId;
        android.h_print(id)
    }

    render(){
        const {listenTime,speed,showResult,errorVisible,errorTip,showCancel,wifiVisible,platName,leaveTime,recordDto} = this.state;
        const {tenantId,deviceIdList,djsVisible,machineName,rotateSpeed,torque,power,result,hydraulic} = this.state;
        return (
        <div className={styles.bodybgzc}>
            <div className={styles.headStyle}>
                <div>
                    <img src={require('@src/assets/voice/headicon.png')} className={styles.headicon}/>
                </div>
                <div className={styles.flex}>
                   <img src={require('@src/assets/voice/setting.jpg')} className={styles.wifiicon} 
                    onClick={()=>{this.setState({
                             wifiVisible:true,
                    })}}/>
                    <img src={require('@src/assets/voice/user.png')} className={styles.usericon}/>
                    <div className={styles.userFont}>{localStorage.tenantName ? localStorage.tenantName :'上港集团'}</div>
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
                        {
                            djsVisible ? <p className={styles.loadingTip}>采集时间还有<span style={{fontSize:'22px',color:'red'}}>{leaveTime}</span>秒</p> :''
                        }
                    </div> : ''
                }
                <div className={styles.wrapperSg}>
                    <div className={styles.wrapperSgLeft}>
                    {
                        showResult ? <div style={{width:'100%'}}>
                            < WholeBar receiverResponseList={this.state.receiverResponseList} result={result} parent={this} recordId={this.state.recordId}/>
                        </div> :  <div> </div>
                    }
                    </div>
                    <div className={styles.wrapperSgRight}>
                        <div className={styles.zcUserconfirm}>
                            <div className={styles.zcUserconfirmflex}>
                                <img src={require('@src/assets/voice/index4.png')}/>
                                <div className={styles.zcVoiceChoose}>
                                    <div className={styles.zcVoiceChoose1} onClick={()=>this.voiceChange()}>{platName}</div>
                                    {
                                        this.state.VoiceVisible ?
                                        <ul className={styles.zcVoiceChooseul}>
                                            {
                                                (this.state.platList || []).map((item, index) => {
                                                    return (
                                                        <li value ={item.id} key={index} onClick={()=>this.voiceChecked(item)}> {item.name} </li>
                                                    )
                                                })
                                            }
                                        </ul> :''
                                    }
                                </div>
                            </div>
                            <div className={styles.zcUserconfirmflex}>
                                <img src={require('@src/assets/voice/index1.png')}/>
                                <div className={styles.btnsg} onClick={()=>this.machineChange()}>{machineName}</div>
                            </div>
                            <div className={styles.zcUserconfirmflex}>
                                <img src={require('@src/assets/voice/index3.png')}/>
                                <div className={styles.btnsg} onClick={()=>this.showModal(5)} >检测时间:{listenTime}S</div>
                            </div>
                     
                            <div className={styles.zcUserconfirmflex}>
                                <img src={require('@src/assets/voice/index2.png')}/>
                                {
                                    showCancel ?  <div className={styles.buttonStylezc} onClick={()=>this.cancelListen()}>取消检测</div> :
                                    <div className={styles.buttonStylezc} onClick={()=>this.startListen()}>开始检测</div>
                                }
                            </div>
                        </div>
                        {/*  */}
                        {
                        showResult ? < div className = {styles.printsg} >
                            <div className={styles.printContent}>
                                <div><span>机型：</span>{recordDto.machineName}</div>
                                <div><span>检测时间：</span>{moment(recordDto.surveyTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                <div><span>采集时间：</span>{recordDto.listenTime}s</div>
                                <div><span>编号：</span>{recordDto.recordId}</div>
                                <div><span>转速：</span>{recordDto.rotateSpeed}(r)</div>
                                <div><span>功率：</span>{recordDto.power}(w)</div>
                                <div><span>扭矩：</span>{recordDto.torque}(N·m)</div>
                                <div className={styles.printButton} onClick={()=>this.printPaper()} >打 印</div>
                            </div>
                        </div> : <div className = {styles.printsg}></div>
                    }
                    </div>
                </div>
                {/* 选择检测设备 */}
                <Modal
                    title="选择机型"
                    visible={this.state.machineVisible}
                    onOk={this.machineChecked}
                    onCancel={this.closeModal}
                    okText="确认"
                    cancelText="取消"
                >

                    <div style={{margin:"10px 0"}}>
                        选择机型: <Select placeholder="请选择机型" style={{width:'300px'}} defaultValue={machineName} onChange={this.machineChoose.bind(this)} >
                            {(this.state.machineList || []).map((item,index)=>{
                                return  <Option value ={item.id} key={item.id}>{item.name}</Option>
                            })}
                        </Select>
                    </div>
                    <div style={{margin:"10px 0"}}>选择检测项目:</div>

                    {/* <Checkbox.Group onChange={this.checkChange.bind(this)}>
                        {
                            (this.state.detailDtoList || []).map(item=>{
                                return <Checkbox value={item.deviceId} defaultValue={deviceIdList} key={item.deviceId}>{item.name}</Checkbox>
                            })
                        }
                    </Checkbox.Group> */}

                     <CheckboxGroup options={this.state.plainOptions} key={deviceIdList} defaultValue={deviceIdList} onChange={this.checkChange} />

                    
                    <Input addonBefore="转速(r)：" name="rotateSpeed"  placeholder="请输入" style={{width:400,margin:"20px 0 10px 0"}} value={rotateSpeed}
                                    onChange={this.inputValue.bind(this)}/>
                    <Input addonBefore="扭矩(N·m)：" name="torque"  placeholder="请输入" style={{width:400}} value={torque}
                                    onChange={this.inputValue.bind(this)}/>
                    <Input addonBefore="功率(w)：" name="power"  placeholder="请输入" style={{width:400,margin:"10px 0"}} value={power}
                                    onChange={this.inputValue.bind(this)}/>
                    <Input addonBefore="液压(MPa)：" name="hydraulic"  placeholder="请输入" style={{width:400}} value={hydraulic}
                        onChange={this.inputValue.bind(this)}/>
                   
            </Modal>

            {/* 听音时间修改 */}
             <Modal
                title="修改采集时间"
                visible={this.state.timeVisible}
                onOk={this.timeConfirm}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div className={styles.flex}>
                        修改采集时间(s)：
                        <InputNumber style={{width:100,marginLeft:10}} onChange = {this.inputTime.bind(this)} name='listenTime' value={listenTime} min = {1} max ={5000}/>
                    </div>
            </Modal>
            <Modal
                title="确认操作弹窗"
                visible={this.state.timeEditVisible}
                onOk={this.timeEditConfirm}
                onCancel={this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                    <div style={{fontSize:'16px'}}>
                        本次采集时间将被记录,是否确认修改?
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
            {/* wifi弹窗 */}
            {
                wifiVisible && <WifiModel parent={this} degree={this.state.degree} degree2={this.state.degree2}></WifiModel>
            }
        </div>
    );
    }

}

export default sgCheck;
