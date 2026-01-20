
import React, { Component, useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, Progress, Checkbox, InputNumber, Spin } from 'antd';
import styles from './login.less';

import { service } from './service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const { userId, token } = vtxInfo;
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
        password: "",
        username: ""
    }
    constructor(props) {
        super(props);
        this.namespace = 'voiceIndex';
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    login = (type) => {

        // ==========================本地化部署=================================
        let tenantId = '994a5b0dca1e4a71b38576ff3c8cfef6';
        localStorage.tenantId = tenantId;
        if (type == 1) {
            this.props.history.push(`/manual?tenantId=${tenantId}`)
        } else if (type == 2) {
            this.props.history.push(`/soundNAuto?tenantId=${tenantId}`)
        } else if (type == 3) {
            this.props.history.push(`/autoExamine?tenantId=${tenantId}`)
        } else if (type == 4) {
            this.props.history.push(`/soundWater?tenantId=${tenantId}`)
        } else if (type == 6) {
            // 华阳本地化部署的，211,212,213,214总共4个听音器，id是固定的
            this.props.history.push(`/soundhy?tenantId=${tenantId}`)
        } else if (type == 7) {
            // 通达本地部署，自动听音三屏版
            this.props.history.push(`/nyAuto?tenantId=${tenantId}`)
        } else if (type == 8) {
            this.props.history.push(`/voiceIndex4?tenantId=${tenantId}`)
        } else {
            this.props.history.push(`/vParams`)
        }
        return false;

        // ==========================线上=================================
        const { password, username } = this.state;
        let params = {
            password: md5(password),
            username
        }
        service.login(VtxUtil.handleTrim(params)).then(res => {
            if (res.result == 0) {
                let { tenantCode, tenantId, name } = res.data;
                localStorage.tenantId = tenantId;
                localStorage.name = name;
                if (type == 1) {
                    this.props.history.push(`/manual?tenantId=${tenantId}`)
                } else if (type == 2) {
                    this.props.history.push(`/soundNAuto?tenantId=${tenantId}`)
                } else if (type == 3) {
                    this.props.history.push(`/autoExamine?tenantId=${tenantId}`)
                } else if (type == 4) {
                    this.props.history.push(`/soundWater?tenantId=${tenantId}`)
                } else if (type == 5) {
                    this.props.history.push(`/turnListen?tenantId=${tenantId}`)
                } else if (type == 8) {
                    this.props.history.push(`/voiceIndex4?tenantId=${tenantId}`)
                } else {
                    this.props.history.push(`/soundWater?tenantId=${tenantId}`)
                }
            } else {
                message.error(res.msg)
            }
        })
    }
    GoPage = () => {
        // 1. 定义两个环境的地址
        const devUrl = 'http://192.168.1.33:8003/#/pointManage'; // 本地开发地址
        const prodUrl = 'http://122.224.196.178:8003/sound/#/pointManage'; // 线上地址

        // 2. 环境判断逻辑（双重保障，避免单一判断失效）
        // - 优先通过 React 内置环境变量判断（npm start 是 development，打包后是 production）
        // - 补充域名特征判断（localhost/内网IP 判定为本地开发）
        const isLocalDev = process.env.NODE_ENV === 'development'
            || window.location.hostname === 'localhost'
            || window.location.hostname.includes('192.168');

        // 3. 根据环境选择地址并跳转
        window.open(isLocalDev ? devUrl : prodUrl, '_blank');
    }
    componentDidMount() {
        localStorage.clear();
    }
    render() {
        const { password, username } = this.state;
        return (
            <div className={styles.loginbg}>
                <div className={styles.loginArea}>
                    <div className={styles.loginTitle}> 云音听诊 — 质检平台</div>
                    <div className={styles.loginContent}>
                        <div className={styles.loginContenttitle}>欢迎登录</div>
                        {/* <Input
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
                        </Input>  */}

                        <Button
                            className={styles.btnLogin}
                            onClick={() => {
                                this.login(1)
                            }}
                        >手动检测登录</Button>

                        <Button
                            className={styles.btnLogin}
                            onClick={() => {
                                this.login(3)
                            }}
                        >自动检测登录</Button>
                        {/* <Button
                            className={styles.btnLogin}
                            onClick={()=>{
                                this.login(7)
                            }}
                        >自动检测登录(三屏版)</Button>  */}

                        <Button
                            className={styles.btnLogin1}
                            type='danger'
                            onClick={() => {
                                this.GoPage()
                            }}
                        >前往后台管理系统</Button>


                        {/* <Button
                            className={styles.btnLogin}
                            onClick={()=>{
                                this.login(6)
                            }}
                        >自动检测登录</Button> */}
                        {/*
                        <Button
                            className={styles.btnLogin}
                            onClick={()=>{
                                this.login(2)
                            }}
                        >自动检测登录(听筒同听音器)</Button>  */}
                        {/* <Button
                            className={styles.btnLogin}
                            onClick={()=>{
                                this.login(4)
                            }}
                        >水务检测登录</Button>
                        <Button
                            className={styles.btnLogin}
                            onClick={()=>{
                                this.login(8)
                            }}
                        >敲击检测登录</Button> */}
                    </div>
                </div>
            </div>
        );
    }

}

export default voiceIndex;
