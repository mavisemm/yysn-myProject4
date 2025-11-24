
import React,{Component,useState, useEffect, useRef } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Popconfirm,Col,Table,notification,Checkbox,InputNumber,Spin,
    DatePicker,Radio,Pagination,Switch  } from 'antd';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const { MonthPicker, RangePicker } = DatePicker;
import styles from './uploadFile.less';
import {service,service1} from './service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const {  userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm,{hostIp,hostIp1} from '@src/config/comm.config.js';
import echarts from 'echarts';
import isObject from 'lodash/isObject';
import pickBy from 'lodash/pickBy';
// import axios from 'axios';
const Aurl = `http://47.101.211.204:8003/yycs/download/%E4%BA%91%E9%9F%B3%E5%A3%B0%E9%9F%B3%E5%88%86%E6%9E%90%E5%B9%B3%E5%8F%B0%E6%93%8D%E4%BD%9C%E6%89%8B%E5%86%8C.pdf`;
message.config({
    top: 100,
    duration: 2,
});
let myEcharts1 = null;
let myEcharts = null;
let echartsData = [];
let totalArr = [];
const plainOptions = ['密度', '能量'];
let colors = [];
let files = [];
class voiceIndex extends React.Component {
    state = {
        loading: false,
        loadingVisible:false,
        loadTxt:"加载中,请稍后...",
        showResult:false,
        showCancel:false,
        errorVisible:false,
        errorTip:"",
        freq1: '20',
        freq2: '20000',
        freqCount: "3000",
        sampleFrq:"192000",
        engP:'1.25',
        rate: "0",
        type:2,
        selectedRowKeys:[],
        dbOption:{
            title: {
               text:'',
               left: 'right',
           
           },
           grid: {
               bottom: 80,
               left: '40px',
               right: '30px'
           },
           toolbox: {
               show: true
           },
           tooltip: {
               trigger: 'axis',
               axisPointer: {
                   type: 'cross',
                   label: {
                       backgroundColor: '#505765'
                   }
               },
                hideDelay:5000,
                confine: true,
                enterable:true,
                show:true
           },
           legend: {
                show:false,
           },
           dataZoom: [
                {
                   show: true,
                   realtime: true,
                   start: 0,
                   end: 100
               },
               {
                   type: 'inside',
                   realtime: true,
                   start: 0,
                   end: 100
               }
           ],
           xAxis: [{
               type: 'category',
               boundaryGap: false,
               axisLine: {
                   onZero: false
               },
               axisLabel: {
                   show: true,
                   formatter: `{value}Hz`,
               },
               data: []
           }
       ],
           yAxis: [{
                   name: '能量',
                   type: 'value',
                   scale: true,
                   axisLabel: {
                       show: true,
                   },
                   nameTextStyle: { //y轴上方单位的颜色
                       color: '#19CAAD'
                   },

               },
           ],
           series: []

        },
        densityOption: {
            title: {
                    text: '',
                    left: 'right',
                },
                grid: {
                    bottom: 80,
                    left: '40px',
                    right: '30px'
                },
                toolbox: {
                    show: false
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#505765'
                        }
                    },
                    hideDelay: 5000,
                    confine: true,
                    enterable: true,
                    show: true
                },
                legend: {
                    show:false
                },
                dataZoom: [
                    {
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100
                    },
                    {
                        type: 'inside',
                        realtime: true,
                        start: 0,
                        end: 100
                    }
                ],
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    axisLine: {
                        onZero: false,
                    },
                    axisLabel: {
                        show: true,
                        formatter: `{value}Hz`,
                    },
                    data: []
                }],
                yAxis: [{
                    name: '密度',
                    type: 'value',
                    scale: true,
                    axisLabel: {
                        show: true,
                    },
                    nameTextStyle: { //y轴上方单位的颜色
                        color: 'blue'
                    },

                }, ],
                series: [],
        },
        upfileVisible:true,
        showDb:true,
        showDensity:true,
        colorVisible:false,
        selectedRows:[],
        files:[],
        historyVisible:false,
        fileNum:0,
        fileName:"",
        startTime:"",
        endTime:"",
        userName:"",
        nameVisible:false,
        userId:"",
        soundType:'0',
        typeList:[
            {
                value:'0',
                label:'工业'
            },
            {
                value: '1',
                label: '水务'
            },
            {
                value: '2',
                label: '医学'
            },
        ],

    }
    constructor(props) {
        super(props);
        this.namespace = 'voiceUpload';
    }
    componentDidMount() {
        totalArr = [];
          // 获取userId参数的值
        const match = location.hash.match(/[?&]userId=([^&]*)/);
        const userId = match ? match[1] : null;
        let par = {
            userId
        }
        // alert(userId)
        service.getUserLogin(VtxUtil.handleTrim(par)).then(res => {
            this.getUser();
            this.getList(1);
        })
    }
    // 从URL的hash部分解析查询参数
    getHashParams() {
        const hash = window.location.hash.substring(1); // 移除#符号
        const params = {};
        const regex = /([^&=]+)=([^&]*)/g;
        let match;
        
        while ((match = regex.exec(hash))) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
        }
        
        return params;
    }
  
    getUser = ()=>{
        service.getUser({}).then(res => {
            if (res.rc == 0 && res.ret) {
                this.setState({
                    userName: res.ret.userName || '',
                    userId:res.ret.id || '',
                })
            } else {
                window.location.href = 'http://47.101.211.204:8003/sound/#/loginVoiceUpload';
                message.error(res.err)
            }

        })
    }
    componentWillMount() {}
    closeModal = (msg) => {
        this.setState({
            errorVisible: false,
            upfileVisible:false,
            nameVisible:false
        })
    }
    disposeEcharts = () => {
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
        if (myEcharts1) {
            myEcharts1.dispose();
            myEcharts1 = null;
        }
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    inputNum = (e) => {
        const numRegex = /^[-]?\d*\.?\d*$/; // 正则表达式判断是否为合法的小数或整数
        let valueNumber = '';
        if (numRegex.test(e.target.value) && e.target.value !=0) {
            valueNumber = e.target.value;
        } else {
            valueNumber = '';
            // message.warn('输入非法！！');
            // return
        }
        this.setState({
            [e.target.name]: valueNumber
        })
    }

    // ====================================处理上传文件开始=============
    clearFile = () => {
        this.setState({
            files: [],
            fileNum: 0
        })
    }
    handleFileChange = (e) => {
        let filesNew = Array.from(e.target.files);
        let files = this.state.files.concat(filesNew);
        // console.log(files,'files')
        // 检查文件大小是否超过50M
        const maxSize = 50 * 1024 * 1024; // 200M
        const maxTotalSize = 200 * 1024 * 1024; // 总文件最大200M
        const oversizedFiles = files.filter(file => file.size > maxSize);
         // 计算总文件大小
         const totalSize = files.reduce((total, file) => total + file.size, 0);
        if (oversizedFiles.length > 0) {
            // 显示提示信息
            alert('某些文件大小超过50M，请重新选择文件');
        }else if (totalSize > maxTotalSize) {
            alert('文件总大小超过200M，请重新选择文件');
        } else {
            this.setState({
                files,
                fileNum: files.length
            });
        }
        e.target.value = '';
    }
    // ============================处理上传文件结束==============
    convertTowav = ()=>{
        // 转换为wav
        const {files} = this.state;
        if (files.length == 0) {
            message.error('请先上传文件！')
            return false;
        }
        const formdata = new FormData();
        for (let i = 0; i < files.length; i++) {
            formdata.append('file', files[i]);
        }
        let that = this;
        const url = `${hostIp1}:36050/hardware/device/open-api/convert-wav`;
        fetch(url, {
          method: 'POST', // 或者 'GET'，根据后端接口要求
          body: formdata, // 如果是 POST 请求且需要上传文件
          // 如果是 GET 请求，可以去掉 body 和 contentType
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            // const contentDisposition = response.headers.get('content-disposition');
            // console.log(contentDisposition)
            // const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            // const fileName = fileNameMatch ? fileNameMatch[1] : 'default-file-name';
            return response.blob(); // 将响应体解析为 Blob
          })
          .then(blob => {
            // 创建一个临时的 URL
            const url = URL.createObjectURL(blob);
        
            // 创建一个 <a> 标签
            const link = document.createElement('a');
            link.href = url;
            const timestamp = Date.now();
            link.download = timestamp +'.wav'; // 设置下载文件的文件名
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        
            // 释放临时 URL
            URL.revokeObjectURL(url);
          })
          .catch(error => {
            console.error('下载文件失败:', error);
            alert('下载文件失败');
          });
    }
    startListen() {
        const {tenantId,freq1,freq2,freqCount,rate,type,files,sampleFrq,soundType,engP} = this.state;
        if (Number(freq1) < 2) {
            message.error('开始频率最小是2Hz！')
            return false;
        }
        if (Number(freq2) > 2000000) {
            message.error('结束频率不能高于2百万Hz！')
            return false;
        }
        if(Number(freq1) == '' || Number(freq2) == '' || Number(freqCount) == ''){
            message.error('开始频率、结束频率、分段数量不能为空！')
            return false;
        }
        if (Number(freq1) > Number(freq2) || freq1 == freq2) {
            message.error('开始频率不能大于或等于结束频率！')
            return false;
        }
        if (files.length == 0) {
            message.error('请先上传文件！')
            return false;
        }
        this.disposeEcharts();
        echartsData = [];
        this.setState({
            showResult:false,
            loadingVisible: true,
            upfileVisible:false,
            loadTxt:"文件分析中，请稍后..."
        })
        const formdata = new FormData();
        for (let i = 0; i < files.length; i++) {
            formdata.append('files', files[i]);
        }
        formdata.append('freq1', freq1);
        formdata.append('freq2', freq2);
        formdata.append('freqCount', freqCount);
        formdata.append('rate', rate);
        formdata.append('type', type);
        formdata.append('sampleFrq', sampleFrq);
        formdata.append('soundType', soundType);
        formdata.append('engP', engP);
        let that = this;
         $.ajax({
            url: hostIp + "/hardware/device/open-api/calculate-sound",
            type:'POST',
            dataType:"json",
            data: formdata,
            cache: false,
            contentType: false,    //不可缺
            processData: false,    //不可缺
            success:function(data){
                if (data.rc== 0){
                    let res = data.ret;
                    for(let i = 0; i< res.length;i++){
                        let temp = res[i];
                        if (temp.success == true) {
                            echartsData.push({
                                time: moment(temp.createTime).format('YYYY-MM-DD HH:mm:ss') || '',
                                fileName: temp.fileName,
                                receiverResponseList: JSON.parse(temp.dataJson) || []
                            })
                        }else{
                            let fileTip = '文件名称' + '【' + temp.fileName + '】解析失败'
                            message.error(fileTip)
                        }
                    }  
                    that.setState({
                        files:[],
                        loadingVisible: false,
                        fileNum:0
                    }) 
                    that.dealEcharts();
                    that.getList(1);
                }else if(data.rc == 401){
                     window.location.href = 'http://47.101.211.204:8003/sound/#/loginVoiceUpload';
                }else{
                    that.setState({
                        loadingVisible: false,
                        errorVisible: true,
                        errorTip: res.err || ''
                    })
                }
            },
            error: function(xhr) {
                // 处理429错误（限流）
                if (xhr.status === 429) {
                    that.setState({
                        loadingVisible: false,
                        errorVisible: true,
                        errorTip: xhr.msg || '今日调用次数已用完，请明天再试或尝试联系管理员。'
                      });
                } 
            }
        })
    }

    // pcm,wav
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    showTotal=(total)=> {
        return `合计 ${total} 条`;
      }
    pageOnChange = (page)=>{
        this.getList(page)
    }
    exportExcel = ()=>{
        const {selectedRowKeys,selectedRows} = this.state;
        let ids = [];
        for (let i = 0; i < selectedRows.length; i++) {
            ids.push(selectedRows[i].id)
        }
        if(ids.length){
            this.setState({
                loadingVisible: true,
                 loadTxt:"文件导出中，请稍后..."
            })
            service.exportToexcel(ids).then(res => {
                if (res.rc == 0) {
                //    处理文件导出
                const downloadUrl = res.ret; // 假设 res.data 是文件下载链接
                const fileName = '数据导出.xlsx'; // 设置文件名
        
                // 创建一个 <a> 标签
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
        
                this.setState({
                  loadingVisible: false
                });
                } else {
                    message.error(res.err)
                }
            })
        }else{
            message.error('请先选择要导出的数据')
        }
    }
    deleteItem = ()=>{
        const {selectedRowKeys,selectedRows} = this.state;
        let ids = [];
        for (let i = 0; i < selectedRows.length; i++) {
            ids.push(selectedRows[i].id)
        }
        if(ids.length){
            this.disposeEcharts();
            this.setState({
                loadingVisible: true,
                 loadTxt:"文件删除中，请稍后..."
            })
            service.delete(ids).then(res => {
                if (res.rc == 0) {
                    message.success('删除成功')
                    this.getList(1);
                    this.disposeEcharts();
                    this.setState({
                        selectedRows:[],
                        selectedRowKeys:[],
                        loadingVisible:false
                    })
                } else {
                    message.error(res.err)
                }
            })
        }else{
            message.error('请先选择要删除的数据')
        }
 
    }
    // 删除全部
    deleteItemAll = ()=>{
        this.disposeEcharts();
        this.setState({
            loadingVisible: true,
            loadTxt:"文件全部删除中，请稍后..."
        })
        service.getUser({}).then(res => {
            if (res.rc == 0 && res.ret) {
                service.deleteAll({}).then(res => {
                    if (res.rc == 0) {
                        message.success('删除成功');
                        this.getList(1);
                        this.setState({
                            selectedRows: [],
                            selectedRowKeys: [],
                            loadingVisible:false,
                        })
                    } else {
                        message.error(res.err)
                    }
                })
            } else {
                window.location.href = 'http://47.101.211.204:8003/sound/#/loginVoiceUpload';
                message.error(res.err)
            }

        })
  
    }
    switchChange = (e) => {
        this.setState({
            columnVisible: e
        })
    }
 
    getList = (page)=>{
        const {startTime,endTime,fileName,userId} = this.state;
        let filterPropertyMap = [
            {
                code: 'create_time',
                operate: 'GTE',
                value: startTime
            },
            {
                code: 'create_time',
                operate: 'LTE',
                value: endTime
            },
            {
                code: 'user_id',
                operate: 'EQ',
                value: userId
            },
        ]
        if (fileName) {
            filterPropertyMap.push({
                code: 'file_name',
                operate: 'LIKE',
                value: fileName
            })
        }
        let params = {
            filterPropertyMap:filterPropertyMap.filter((item)=>{return item.value}),
            pageIndex:page-1,
            pageSize:10,
            sortValueMap: [
                {
                    code: 'create_time',
                    sort: 'desc'
                }
            ]
        };
        service.getList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0 && res.ret) {
                let arr = [];
                if(res.ret){
                    let data = res.ret;
                    arr = data.items.map((item,index)=>{
                        return {
                            ...item,
                            index: (page - 1) * 10 + index+1,
                        }
                    })
                    totalArr = totalArr.concat(arr);
                    this.setState({
                        tableData:arr,
                        total:data.rowCount
                    })
                }
            } else {
                message.error(res.err)
            }

        })
    }
    includeMultiplee(list, key) {
        let map = new Map();
        return list.filter((item) => !map.has(item[key].toString()) && map.set(item[key].toString()))
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let selectedRowsArr = [];
        if(selectedRowKeys.length){
            for (let i = 0; i < selectedRowKeys.length; i++) {
                for (let j = 0; j < totalArr.length; j++) {
                    if (totalArr[j].id == selectedRowKeys[i]) {
                        selectedRowsArr.push(totalArr[j])
                    }
                }
            }
           
        }
        let newArr = this.includeMultiplee(selectedRowsArr, 'id');
        this.setState({
            selectedRowKeys,
            selectedRows: newArr
        })
    }
    boxChange = (checkedValues) => {
        let type = '';
        if(checkedValues.length == 2){
            type = 2;
        }
        if (checkedValues.length == 1) {
            if(checkedValues[0] == '能量'){
                type = 1;
            }
            if (checkedValues[0] == '密度') {
                type = 0;
            }
        }
        if (checkedValues.length == 0) {
            message.error('至少选择一种！')
            checkedValues = ['能量','密度']
            type = 2;
        }
        this.setState({
            type
        })
    }
    hideChange = (e) => {
        this.setState({
            colorVisible:e
        },()=>{
            if(echartsData.length){
                this.lookEcharts(1);
            }
        })
    }
    typeChecked = (e)=>{
        this.setState({
            soundType:e
        })
    }
    lookEcharts = (type)=>{
        this.setState({
            showResult:true,
        })
        const {selectedRowKeys,selectedRows} = this.state;
        if(type){
             this.dealEcharts()
        }else{
            echartsData = [];
            for (let i = 0; i < selectedRows.length; i++) {
                echartsData.push({
                    time: moment(selectedRows[i].createTime).format('YYYY-MM-DD HH:mm:ss') || '',
                    fileName: selectedRows[i].fileName,
                    receiverResponseList: JSON.parse(selectedRows[i].dataJson)
                })
            }
            this.disposeEcharts();
            this.dealEcharts()
        }
    }
    dealEcharts = () => {
        const {type} = this.state;
        if(type == 2){
            this.setState({
                showDb:true,
                showDensity:true
            })
        }else if(type == 1){
            this.setState({
                showDb:true,
                showDensity:false
            })
        }else{
            this.setState({
                showDb: false,
                showDensity: true
            })
        }
        this.setState({
            loadingVisible:false,
            upfileVisible:false
        })
        if(!echartsData.length){
            message.error('未选择任何数据或者文件解析失败！')
            return false;
        }
        for (let i = 0; i < echartsData.length; i++) {
             let xArr = [];
             let dbArr = [];
             let densityArr = [];
            for(let j = 0;j<echartsData[i].receiverResponseList.length;j++){
                let temp = echartsData[i].receiverResponseList[j];
                xArr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(2));
                if (temp.db !=null){
                      if (temp.db == 0) {
                          dbArr.push(undefined)
                      } else {
                          dbArr.push(temp.db.toFixed(6))
                      }
                }
                if(temp.density != null){
                    densityArr.push(temp.density.toFixed(6))
                }
              
            }
            echartsData[i] = {
                ...echartsData[i],
                xArr,
                dbArr,
                densityArr,
                origindbArr:dbArr,
                origindensityArr:densityArr
            }
        
        }
        // console.log(echartsData, 'echartsData')
        colors = this.getRandomColor();
        this.initEcharts()
  }
   getRandomColor =() => {
    const colors = [];
    for (let i = 0; i < echartsData.length; i++) {
        const color = "#" + Math.random().toString(16).slice(2, 8).padEnd(6, "0");
        colors.push(color);
    }
    return colors;
  }
  enlarge(scale,type){
    if(type == 1){
        // 能量
        echartsData = echartsData.map((item, index) => {
            return {
                ...item,
                dbArr: item.origindbArr?.map(dbValue => (dbValue !== null && dbValue !== undefined ? dbValue * scale : dbValue)) || []
            };
        });
    }else{
        // 密度
        echartsData = echartsData.map((item, index) => {
            // 只更新特定的索引 i
            return {
                ...item,
                densityArr: item.origindensityArr.map(dbValue => dbValue * scale)
            };
        });
    }
    this.disposeEcharts();
    this.initEcharts();
  }
  initEcharts = () => {
        const {showDb,showDensity,colorVisible} = this.state;
        let totaldbArr = [];
        let totaldensityArr = [];
        let nameArr = [];

        for (let j = 0; j < echartsData.length; j++) {
            // +'___' + echartsData[j].time
            nameArr.push({
                name: echartsData[j].fileName,
                icon:'rect'
            })
            totaldbArr.push({
                name: echartsData[j].fileName,
                type: "line",
                data: echartsData[j].dbArr,
                itemStyle: {
                   normal: {
                       color: colors[j] // 点击后的颜色
                   }
                }
            })
            totaldensityArr.push({
                name: echartsData[j].fileName,
                type: "line",
                data: echartsData[j].densityArr,
                itemStyle: {
                    normal: {
                        color: colors[j] // 点击后的颜色
                    },
                    emphasis: {
                        focus: 'series'
                    }
                }
            })
        }
        if (showDensity) {
            myEcharts1 = echarts.init(this.echartsBoxDensity, null, {
                clickable: true
            });
            let optionDensity = this.state.densityOption;
            optionDensity.xAxis[0].data = echartsData[0].xArr;
            optionDensity.series = totaldensityArr;
            myEcharts1.setOption(optionDensity);
            myEcharts1.on('click', function (params) {
                if (params.componentType === 'series') {
                    const seriesName = params.seriesName;
                    const dataIndex = params.dataIndex;
                    const seriesIndex = params.seriesIndex;
                    notification.open({
                        message: '文件名称',
                        description: params.seriesName + ' 数值:' + params.value,
                        style: {
                            color: params.color,
                            fontWeight:600,
                            fontSize:30
                        },
                    });
                    for(let i = 0;i<totaldensityArr.length;i++){
                        let temp = totaldensityArr[i];
                        if (temp.name == seriesName){
                            totaldensityArr[i] = {
                                ...totaldensityArr[i],
                                lineStyle: {
                                    width: 4
                                },
                            }
                        }else{
                            totaldensityArr[i] = {
                                ...totaldensityArr[i],
                                lineStyle: {
                                    width: 2
                                },
                            }
                        }
                    }
                    optionDensity.series = totaldensityArr;
                    myEcharts1.setOption(optionDensity);
                }
            });
            // myEcharts1.on('finished', () => {
            //     myEcharts1.resize()
            // })
       
        }
        if(showDb){
            myEcharts = echarts.init(this.echartsBoxDb, null, {
                clickable: true
            });
            let optionDb = this.state.dbOption;
            optionDb.xAxis[0].data = echartsData[0].xArr;
            optionDb.series = totaldbArr;
            // console.log(optionDb, 'optionDb')
            myEcharts.setOption(optionDb);
            myEcharts.on('click', function (params) {
                if (params.componentType === 'series') {
                    const seriesName = params.seriesName;
                    const dataIndex = params.dataIndex;
                    const seriesIndex = params.seriesIndex;
                    notification.open({
                        message: '文件名称',
                        description: params.seriesName + '数值:' + params.value,
                        style: {
                            color: params.color,
                            fontWeight: 600,
                            fontSize: 30
                        },
                    });
                    for (let i = 0; i < totaldbArr.length; i++) {
                        let temp = totaldbArr[i];
                        if (temp.name == seriesName) {
                            totaldbArr[i] = {
                                ...totaldbArr[i],
                                lineStyle: {
                                    width: 4
                                }
                            }
                        } else {
                            totaldbArr[i] = {
                                ...totaldbArr[i],
                                lineStyle: {
                                    width: 2
                                }
                            }
                        }
                    }
                    optionDb.series = totaldbArr;
                    myEcharts.setOption(optionDb);
                }
            });
        }
  }
    closeUpfile=()=>{
        this.getUser();
        const {upfileVisible} = this.state;
        this.setState({
            upfileVisible: !upfileVisible
        })
    }
    closeHistory = ()=>{
         this.getUser();
        const {historyVisible} = this.state;
        this.setState({
            historyVisible: !historyVisible
        })
    }
    nameSubmit=()=>{
        let userName = this.state.userName;
        service.editUser({name:userName}).then(res => {
            if (res.rc == 0) {
            this.getUser();
                message.success('修改成功')
                this.setState({
                    nameVisible: false
                })
            } else {
                message.error(res.err)
            }

        })
    }

    // 
    deleteFile = (item,index)=>{
        const {files} = this.state;
        let arr =[...files];
        arr.splice(index,1);
        this.setState({
            files:arr,
            fileNum: arr.length
        })
    }
    render(){
        const {files,errorVisible,errorTip,freq1,total ,freq2,freqCount,sampleFrq,tableData,historyVisible,fileNum,columnVisible,engP} = this.state;
        const columnsFile = [
            {
                title: '文件名称',
                dataIndex: 'name',
                width:'300'
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button type='danger' onClick={()=>this.deleteFile(record,index)}> 删除 </Button>
                    </span>
                ),
            }
        ];
         const columns = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                 title: '文件名称',
                 dataIndex: 'fileName',
             },
             {
                 title: '分析时间',
                 dataIndex: 'createTime',
                    render: (text, record, index) => ( 
                    <span > 
                        {
                            record.createTime ? moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
                        } 
                    </span>
                ),
             },
         ];
        const columns1 = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                title: '文件名称',
                dataIndex: 'fileName',
            },
            {
                title: '频率范围',
                dataIndex: 'freq1',
                render: (text, record, index) => ( 
                <span > 
                    {record.freq1 } ~ {record.freq2 }
                </span>
            ),
            },
            {
                title: '分段数量',
                dataIndex: 'freqCount',
            },
            {
                title: '采样频率',
                dataIndex: 'sampleFrq',
            },
            {
                title: '分析时间',
                dataIndex: 'createTime',
                render: (text, record, index) => ( 
                <span > 
                    {
                        record.createTime ? moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') : ''
                    } 
                </span>
            ),
            },
        ];
        const {
            loading,
            selectedRowKeys,
            upfileVisible,
            type,
            showDb,
            showDensity,
            fileName,
            userName,loadTxt
        } = this.state;
        const rowSelection = {
            preserveSelectedRowKeys: true,
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
        <div className={styles.body}>
            <a id="downloadLink" style={{display: 'none'}}></a>
            <div className={styles.wrapper}>
                {
                    historyVisible &&
                    <div className={styles.openBar}>
                        <img src={require('@src/assets/historyicon.png')} onClick={()=>this.closeHistory()} />
                    </div>
                }
                <div className={ historyVisible ? 'content100':'content74'}>
                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.enlarge(1,1)}>能量X1</Button>
                        <Button type='primary' onClick={()=>this.enlarge(100,1)}>能量X100</Button>
                        <Button type='primary' onClick={()=>this.enlarge(1000,1)}>能量X1000</Button>
                        <Button type='dashed' onClick={()=>this.enlarge(1,2)}>密度X1</Button>
                        <Button type='dashed' onClick={()=>this.enlarge(100,2)}>密度X100</Button>
                        <Button type='dashed' onClick={()=>this.enlarge(1000,2)}>密度X1000</Button>
                    </BtnWrap>
                    {
                        this.state.loadingVisible ?
                        <div className={styles.loading}>
                            <Spin size="large"/>
                            <div>{loadTxt}...</div>
                        </div> : ''
                    }
                    {
                        showDensity && < div ref = {
                                (c) => {
                                    this.echartsBoxDensity = c
                                }
                            }
                            style = {
                                {
                                    width: '100%',
                                    height: '500px',
                                }
                            }
                        />
                    }
                    {
                        showDb && < div ref = {
                                (c) => {
                                    this.echartsBoxDb = c
                                }
                            }
                            style = {
                                {
                                    width: '100%',
                                    height: '500px',
                                }
                            }
                        />
                    }
                </div>
                <div className={ historyVisible ?'content0':'content25'}>
                    <div className={styles.headeright}>
                        <img title='上传文件' src={require('@src/assets/open.png')} onClick={()=>this.closeUpfile()} />
                        <div className={styles.userFlex}>
                            <img title='折叠/展开' src={require('@src/assets/historyicon.png')}  onClick={()=>this.closeHistory()} />
                            {/* <img title='修改用户名' src={require('@src/assets/user.png')}  onClick={()=>this.setState({
                                nameVisible:true
                            })} /> */}
                            <span>{userName}</span>
                            <a target='_blank' title='平台使用手册' href = {Aurl} > 
                                <img src={require('@src/assets/help.png')} style={{width:40,height:40}}/>
                            </a>
                        </div>
                    </div>
                    <div className={styles.typeFlex}>
                        <Input style={{width:150}} value={fileName} name='fileName' placeholder='文件名称'
                            onChange={this.inputChange.bind(this)} />
                        <RangePicker onChange={this.dateChange.bind(this)} 
                            ranges={{
                                今天: [moment().startOf('day').subtract(0, 'd'), moment().endOf('day')],
                                最近一周: [moment().startOf('day').subtract(6, 'd'), moment().endOf('day')],
                                最近一个月: [moment().startOf('day').subtract(30, 'd'), moment().endOf('day')],
                                最近三个月: [moment().startOf('day').subtract(90, 'd'), moment().endOf('day')],
                            }}
                            showTime={{
                                hideDisabledOptions: true,
                                defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                            }}
                            style={{width:200,marginLeft:10}}
                        />
                    </div>
                    <BtnWrap>
                        {/* <Button type='primary' onClick={()=>this.lookEcharts()}>生成曲线图</Button> */}
                        <Button type='primary' icon="search"  onClick={()=>this.getList(1)}>查询</Button>
                        <Popconfirm placement="topLeft" title='确认删除所选数据吗？' onConfirm={this.deleteItem.bind(this)} okText="确定" cancelText="取消">
                            < Button type='danger'> 删除 </Button>
                        </Popconfirm>
                        <Popconfirm placement="topLeft" title='确认删除该账号下的所有数据吗？' onConfirm={this.deleteItemAll.bind(this)} okText="确定" cancelText="取消">
                            < Button type='danger'> 全部删除 </Button>
                        </Popconfirm>
                    </BtnWrap>
                  
                    <Table pagination={false} rowSelection={rowSelection} rowKey={record => record.id} columns={columnVisible ? columns1 : columns} dataSource={tableData} />
                    <Pagination onChange={this.pageOnChange} pageSize={10} showTotal={this.showTotal.bind(this)} total={total} style={{margin:'20px 0',textAlign:"right"}}/>
                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.lookEcharts()}>生成曲线图</Button>
                        <Button type='primary' onClick={()=>this.exportExcel()}>excel导出</Button>
                        <Switch checkedChildren="关闭" unCheckedChildren="展开所有列" checked={this.state.columnVisible} onChange={this.switchChange.bind(this)}/>
                      
                    </BtnWrap>
                </div>
            </div>
             
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

            <Modal
                title="上传文件"
                visible={this.state.upfileVisible}
                onCancel={this.closeModal}
                width='50%'
                footer={null}
            >
                <div className={styles.modeFlex1}>

                    <div>
                        <BtnWrap>
                            <Button type='primary' className={styles.btnFile}>选择文件
                                <input id="file" title='支持WAV、PCM、OGG、MP3、f、7zf文件' onChange={this.handleFileChange.bind(this)} type="file" multiple name="file" className={styles.fileStyle}></input>
                            </Button>
                            已选择{fileNum}个文件
                        </BtnWrap>
                        {/* <div className={styles.typeFlex}>
                            <div>文件类型：</div>
                            <Select value={this.state.soundType} onChange={this.typeChecked.bind(this)}>
                                {
                                    (this.state.typeList || []).map((item, index) => {
                                        return (
                                            <Option value ={item.value} key={index}> {item.label}</Option>
                                        )
                                    })
                                }
                            </Select>
                        </div> */}
                        
                        <div>
                            <Input addonBefore="开始频率：" addonAfter='Hz' name="freq1" style={{width:180}}  placeholder="请输入数值" value={freq1}
                            onChange={this.inputNum.bind(this)}/>
                        </div>
                        <div>
                            <Input addonBefore="结束频率："  addonAfter='Hz'  name="freq2" style={{width:180,marginTop:10}} placeholder="请输入数值"  value={freq2}
                            onChange={this.inputNum.bind(this)}/>
                        </div>
                        <div>
                            <Input addonBefore="分段数量：" name="freqCount" style={{width:180,marginTop:10}}  placeholder="请输入数值" value={freqCount} 
                            onChange={this.inputNum.bind(this)}/>
                        </div>
                        <div>
                            <Input addonBefore="文件采样频率：" name="sampleFrq" style={{width:220,marginTop:10}}  placeholder="文件采样频率" value={sampleFrq} 
                            onChange={this.inputNum.bind(this)}/>
                        </div>
                        <div>
                            <Input addonBefore="能量指数：" name="engP" style={{width:220,marginTop:10}}  placeholder="能量指数" value={engP} 
                            onChange={this.inputNum.bind(this)}/>
                        </div>
                    
                        <div style={{marginTop:10}}  className={styles.typeFlex}>
                            分析类型:&nbsp;&nbsp;
                            <CheckboxGroup options={plainOptions} defaultValue={['密度','能量']} onChange={this.boxChange.bind(this)} />
                        </div>
                    </div>
                    
                    <div>
                        <Table pagination={{ pageSize: 50 }} scroll={{ y: 240 }} rowKey={record => record.index} columns={columnsFile} dataSource={files} />
                       
                        <Button type='danger' style={{marginLeft:10}} onClick={()=>this.clearFile()}>清空已选文件</Button>
                    </div>
                </div>
                
                <div className={styles.modeFlex}>
                    <div></div>
                    <a target='_blank' title='平台使用手册'  href={Aurl} > 
                        <img src={require('@src/assets/help.png')} style={{width:40,height:40}}/>
                    </a>
                    <BtnWrap>
                        <Button type='danger' onClick={()=>{this.closeModal()}}>关闭</Button>
                        <Button onClick={()=>{this.convertTowav()}} type='primary'>转为wav文件下载</Button>
                        <Button onClick={()=>{this.startListen()}} type='primary'>开始分析</Button>
                    </BtnWrap>
                </div>
            </Modal>
            
            {/* 修改用户名 */}
            <Modal
                title="用户名修改"
                visible={this.state.nameVisible}
                onOk = {()=>this.nameSubmit()}
                onCancel = {this.closeModal}
                okText="确认"
                cancelText="取消"
                >
                <Input addonBefore="用户名："  style={{width:'500px'}} value={userName} name='userName'
                    onChange={this.inputChange.bind(this)} />
            </Modal>
        </div>
    );
    }

}

export default voiceIndex;
