
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

class voiceIndex extends React.Component {
    state = {
        password:"",
        username: ""
    }
    constructor(props) {
        super(props);
        this.namespace = 'voiceIndex';
    }
    inputChange = (e)=>{
        this.setState({
            [e.target.name]:e.target.value
        })
    }
    login = ()=>{
        const {password,username} = this.state;
        let params = {
            password: md5(password),
            username
        }
         service.login(VtxUtil.handleTrim(params)).then(res => {
             if (res.result == 0) {
                let {tenantCode,tenantId,name}=res.data;
                localStorage.tenantId = tenantId;
                localStorage.tenantName = name;
                this.props.history.push({pathname:`/sgCheck`})
             } else {
                 message.error(res.msg)
             }
         })
    }
    componentDidMount(){
    }
    render(){
        const {password,username} = this.state;
        return (
             <div className={styles.page}>
                <div className={styles.loginArea}>
                    <div className={styles.loginTitle}> 云音听诊 — 质检平台</div>
                    <div className={styles.loginContent}>
                        <div className={styles.loginContenttitle}>欢迎登录</div>
                            <Input
                            className={styles.loginContentInput}
                            value={username || undefined}
                            name = 'username'
                            placeholder="请输入用户名"
                            onChange={this.inputChange.bind(this)}
                        >
                        </Input>
                        <Input
                            className={styles.loginContentInput}
                            value={password || undefined}
                            placeholder="请输入密码"
                            type="password"
                            name = 'password'
                            onChange={this.inputChange.bind(this)}
                        >
                        </Input>
                        <Button
                            className={styles.btnLogin}
                            onClick={()=>{
                                this.login()
                            }}
                        >安全登录</Button>
                    </div>
                </div>
            </div>
    );
    }

}

export default voiceIndex;
