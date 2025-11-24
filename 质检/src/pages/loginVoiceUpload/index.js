
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin  } from 'antd';
import styles from './login.less';

import {service} from './service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import md5 from 'js-md5';
React.Component.prototype.$md5 = md5;
message.config({
    top: 100,
    duration: 2,
});
let timer = null;
class LoginVoiceUpload extends React.Component {
    state = {
        password:"",
        path:""
    }
    constructor(props) {
        super(props);
        this.namespace = 'LoginVoiceUpload';
    }
    inputChange = (e)=>{
        this.setState({
            [e.target.name]:e.target.value
        })
    }
    componentWillUnmount(){
        clearInterval(timer);
        timer = null;
    }
    login = ()=>{
        let params = {
            uuid:this.state.uuid
        }
         service.login({...params}).then(res => {
             if (res.rc == 0) {
                clearInterval(timer);
                timer = null;
                // this.props.history.push({pathname:`/uploadFile`})
                service.getUser({}).then(res => {
                    if (res.rc == 0 && res.ret) {
                        let params = {
                            userId:res.ret.id
                        }
                        let userId = res.ret.id;
                        // service.getUserLogin(VtxUtil.handleTrim(params)).then(res => {
                            window.location.href = 'http://47.101.211.204:8003/sound/#/uploadFile?userId='+userId;
                        // })
                    } else {
                        // window.location.href = hostIp + '/sound/#/loginVoiceUpload';
                        message.error(res.err)
                    }
        
                })
             } else {
                //  message.error(res.msg)
             }
         })
    }
    componentDidMount(){
        //  localStorage.clear();
        this.getCode();
    }
    getCode = ()=>{
        clearInterval(timer);
        timer = null;
        let that = this;
        let uuid = this.getUuid();
        this.setState({
            uuid
        })
        let params={
            uuid
        }

        service.getCode({...params}).then(res => {
            if(res && res.ticket){
                this.setState({
                    path:res.path,
                },()=>{
                    timer = setInterval(() => {
                        that.login();
                    }, 3 * 1000)
                })
            }
        })
    }
    getUuid = ()=>{
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    render(){
        const {password,username,path} = this.state;
        return (
             <div className={styles.page}>
                <div className={styles.loginArea}>
                    <div className={styles.loginTitle}>云音声音分析平台</div>
                    <div className={styles.loginContent}>
                        <div className={styles.loginContenttitle}>用户登录</div>
                        <p>[ 打开微信扫一扫 获取您的专属分析账号 ]</p>
                        <div  className={styles.freshFlex}  onClick={()=>this.getCode()}>
                            <img src={require('@src/assets/fresh.png')}/>
                            <div>(点击刷新二维码)</div>
                        </div>
                        <img src={path} style={{width:250,height:250}}/>
                        <p style={{color:'#FFE089'}}>[平台支持WAV、PCM、OGG、MP3、f、7zf等格式，一键即可生成声音能量密度曲线]</p>
                       
                    </div>
                </div>
            </div>
    );
    }

}

export default LoginVoiceUpload;
