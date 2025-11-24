
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker  } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import stylesCom from '../style.less';
import styles from './style.less'; // 使用新的样式文件
import IndexOne from './index1.js';
import IndexTwo from './index2.js';
import IndexThree from './index3.js';
import Total from './total.js';
import {service,service1} from '../service';
import moment, { localeData } from 'moment';
import WifiModel from './components/wifiModel';
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
const tenantId = VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
message.config({
    top: 100,
    duration: 2,
});
import echarts from 'echarts';
let myEcharts = null;
class voiceIndex extends React.Component {
    state = {
        loading: false,
        visible: false,
        soundList:[],

    }
    constructor(props) {
        super(props);
        this.namespace = 'AutoExamine';
    }
 
    componentDidMount(){
        if (tenantId){
        
        }else{
            this.props.history.push({
                pathname: `/login`
            })
        }
       
    }
    initalDataBase = () => {

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

    handleGetPoint = (childComponent) => {
        // 调用total.js组件的统计方法
        if (this.totalRef && typeof this.totalRef.getstatistics === 'function') {
            this.totalRef.getstatistics();
        }
    }
    
    render(){
        const {listenTime,speed,showResult,errorVisible,errorTip,voiceName,machineNo,leaveTime,recordDto} = this.state;
        const {timeValue,djsVisible,machineName,groupType,machineId,machineGroupList,
            detectorList,receiverResponseList,staticsData,totalCount,wifiVisible,  plcCount,
            normalCount,
            timeoutCount,status } = this.state;
        
        // 确定状态指示器的类名
        const getStatusClass = () => {
            if (normalCount > plcCount * 0.8) return 'statusNormal';
            if (timeoutCount < plcCount * 0.3) return 'statusWarning';
            return 'statusError';
        };
        
        return (
        <div className={stylesCom.bodyScreen}>
            <div className={stylesCom.headStyle}>
                <div>
                    <img src={require('@src/assets/voice/logo.png')} className={stylesCom.logo}/>
                    <img src={require('@src/assets/voice/headicon.png')} className={stylesCom.headicon}/>
                </div>
                <div className={stylesCom.flex}>
                    <img onClick={()=>this.goPage()} src={require('@src/assets/admin.png')} 
                         className={stylesCom.wifiicon} title='前往展示板' alt='展示板'/>
                    
                    <div style={{fontSize:14, display: 'flex', alignItems: 'center'}}>
                        <span className={`statusIndicator ${getStatusClass()}`}></span>
                        <span className='dataText'>
                            plc：<span className='dataTextHighlight'>{plcCount}</span> &nbsp;&nbsp;
                            正常：<span className='dataTextHighlight'>{normalCount}</span> &nbsp;&nbsp;
                            超时：<span className='dataTextHighlight'>{timeoutCount}</span>
                        </span>
                    </div>
                    
                   <img src={require('@src/assets/voice/setting.jpg')} className={stylesCom.wifiicon} 
                    onClick={()=>{
                             this.setState({
                             wifiVisible:true,
                    })
                    }}/>
                    <img src={require('@src/assets/voice/user.png')} className={stylesCom.usericon}/>
                    <div className={stylesCom.userFont}>{localStorage.name || '声音'}</div>
                    <div className={stylesCom.userloginout} onClick={()=>{
                        this.setState({
                        loginOutVisible:true
                    })
                    }}>退出登录</div>
                </div> 
            </div>

            {/* 使用优化后的布局容器 */}
            <div className={styles.nyAutoContainer}>
                <div className={styles.column}>
                    <div className={styles.columnHeader}>统计</div>
                    <div className={styles.chartContainer}>
                        <Total ref={ref => this.totalRef = ref} />
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.columnHeader}>工位3</div>
                    <div className={styles.chartContainer}>
                        <IndexOne parent={{ getpoint: this.handleGetPoint }}/>
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.columnHeader}>工位2</div>
                    <div className={styles.chartContainer}>
                        <IndexTwo  parent={{ getpoint: this.handleGetPoint }}/>
                    </div>
                </div>
                <div className={styles.column}>
                    <div className={styles.columnHeader}>工位1</div>
                    <div className={styles.chartContainer}>
                        <IndexThree  parent={{ getpoint: this.handleGetPoint }}/>
                    </div>
                </div>
            </div>
   
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
