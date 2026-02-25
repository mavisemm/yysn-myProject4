
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch ,BackTop,Tabs,Popconfirm,Spin  } from 'antd';

import {service} from './service';
import styles from './auto.less';
import SearchPage from '@src/pages/acomponents/searchPage';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'auto';
const { MonthPicker, RangePicker } = DatePicker;

import echartsOption from '@src/pages/acomponents/optionEcharts';
import WeightAuto from '@src/pages/acomponents/weightAuto';
import moment from 'moment';
import echarts from 'echarts';
import { result } from 'lodash';
const TabPane = Tabs.TabPane;
import SideBar from '@src/pages/sideBar';
import comm from '@src/config/comm.config.js';
let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
let myEchartsFullScreen = null;
let singleTotalArr = [];
let filePath = '';

let XARR = [];
let finallydbArr = [];
let finallydensityArr = [];

let echartsClickData = [];

let weightAutoDbArr = [];
let weightAutoDensityArr = [];

let dbName1 = '';
let dbName2 = '';

let densityName1 = '';
let densityName2 = '';
@connect(({auto}) => ({auto}))
class auto extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            tableData:[],
            total:0,
            selectedRows:[],
            groupCount:'',
            receiverId:'',
            groupList:[],
            resultVisible:false,
            resultData:'',
            juleiVisible:false,
            idSet:[],
            groupIndex:'',
            juleiData:[],
            detailDtoList:[],
            weightType:1,//1能量，2密度
            freqs:[],
            deleteIdList:[]
        }
    }
    componentDidMount(){
        const {auto} = this.props;
        const {qualityList,} = auto;
        this.setState({
            qualityList,
        })
    }
    componentWillReceiveProps(newProps) {
        const {auto} = {...newProps};
        const {qualityList,} = auto;
        this.setState({
            qualityList,
        })
    }
    componentWillUnmount() {
        this.disposeEcharts();
    }
    disposeEcharts = ()=>{
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }
        if (myEchartsDensity) {
            myEchartsDensity.dispose();
            myEchartsDensity = null;
        }
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
            
    }
    handleClose = () =>{
        this.setState({
            singleDataVisible:false,
            resultVisible:false,
            fullScreenVisible:false,
            clickChartVisible:false,
            autoVisible:false
        })
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
        if (myEchartsFullScreen) {
            myEchartsFullScreen.dispose();
            myEchartsFullScreen = null;
        }
    }
    dbClick = ()=>{
        if (dbName1 && dbName2) {
            this.setState({
                weightType:1,
                autoVisible: true,
                
            });
        }
    }
    densityClick = ()=>{
        if (densityName1 && densityName2) {
            this.setState({
                weightType:2,
                autoVisible: true,
            });
        }
    }
    handleDb = ()=>{
        const {freqs,groupIndex,groupList,db,weightType,density} = this.state;
        let arr = [{
            freq1:weightType == 1? dbName1.name : densityName1.name,
            freq2:weightType == 1? dbName2.name : densityName2.name,
            value:weightType == 1? db : density,
        }]

        if(weightType == 1){
            let dbWeightList = [...groupList[groupIndex].dbWeightList]; 
            // 1、能量
            for(let i = 0;i<dbWeightList.length;i++){
                if(i >= dbName1.dataIndex && i<= dbName2.dataIndex){
                    dbWeightList[i] = db
                }
            }
            groupList[groupIndex] = {
                ...groupList[groupIndex],
                dbList:groupList[groupIndex].dbList.concat(arr),
                dbWeightList,
            }
        }else{
            let densityWeightList = [...groupList[groupIndex].densityWeightList]; 
            // 2、密度
            for(let i = 0;i<densityWeightList.length;i++){
                if(i >= densityName1.dataIndex && i<= densityName2.dataIndex){
                    densityWeightList[i] = density
                }
            }
            groupList[groupIndex] = {
                ...groupList[groupIndex],
                densityList:groupList[groupIndex].densityList.concat(arr),
                densityWeightList,
            }
        }
        this.setState({
            groupList,
            autoVisible:false,
        })
        if(weightType == 1){
            dbName1 = '';
            dbName2 = '';
        }else{
            densityName1 = '';
            densityName2 = '';
        }
    }
     // 处理echarts图数据
     echartsClick = (dataIndex, seriesName,type) => {
        echartsClickData = [];
        for (let i = 0; i < finallydbArr.length; i++) {
            echartsClickData.push({
                freq: seriesName,
                name: finallydbArr[i].name,
                db: finallydbArr[i].data[dataIndex],
                density: finallydensityArr[i].data[dataIndex],
            })
        }
        if (type == 'db') {
            echartsClickData.sort(this.compareEchartsClick('db'))
        } else {
            echartsClickData.sort(this.compareEchartsClick('density'))
        }
        this.setState({
            clickChartVisible: true
        })
    }
    compareEchartsClick = (property) => {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];

            return value2 - value1;
        }
    }
    // 全屏查看
    lookFullScreen = (type)=>{
        this.setState({
            fullScreenVisible:true,
        },()=>{
             if (type == 1) {
                 // 能量频率曲线
                 if (this.echartsBoxFullScreen) {
                     if (myEchartsFullScreen == null) {
                         myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                     }
                     if (myEchartsFullScreen) {
                         let optionDb = JSON.parse(JSON.stringify(echartsOption.yDb));
                         optionDb.xAxis[0].data = XARR || [];
                         optionDb.series = finallydbArr || [];
                         myEchartsFullScreen.setOption(optionDb)
            
                     }
                 }
             } else {
                 // 密度频率曲线
                 if (this.echartsBoxFullScreen) {
                     if (myEchartsFullScreen == null) {
                         myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                     }
                     if (myEchartsFullScreen) {
                         let optionDensity = JSON.parse(JSON.stringify(echartsOption.yDensity));
                         optionDensity.xAxis[0].data = XARR || [];
                         optionDensity.series = finallydensityArr || [];
                         myEchartsFullScreen.setOption(optionDensity)
                     }
                 }
             }
        })
       
    }

    // 播放声音
    playAudio = (record,index)=>{
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
        this.setState({
            filePath
        })
    }
    // 查看某条记录的频率数据图
    lookData=(record,index)=>{
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
        this.setState({
            singleDataVisible:true
        })
        let params = {
            recordId:record.id,
            receiverId: record.receiverId
        }
        service.getSingleDataLine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret.frequencyDtoList || [];
                    let xArr = [];
                    let densityArr = [];
                    let dbArr = [];
                    data.forEach(({ freq1, freq2, density, db }) => {
                        xArr.push(Math.sqrt(freq1 * freq2).toFixed(0));
                        densityArr.push(density.toFixed(3));
                        dbArr.push(db === 0 ? undefined : db.toFixed(5));
                    });

                    if (this.echartsBoxSingle) {
                        if (myEchartsSingle == null) {
                            myEchartsSingle = echarts.init(this.echartsBoxSingle);
                        }
                        if (myEchartsSingle) {
                             let optionSingle = JSON.parse(JSON.stringify(echartsOption.optionSingle));
                             optionSingle.xAxis[0].data = xArr || [];
                             optionSingle.series[0].data = dbArr || [];
                             optionSingle.series[1].data = densityArr || [];
                             myEchartsSingle.setOption(optionSingle)
                        }
                    }
                }
            } else {
                message.error(res.err);
            }
        })
    }

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    callback =(key)=>{
        this.setState({
            callKey:key
        })
    }
      
    getList = (result,msg) =>{
        this.disposeEcharts();
        const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,
            detectorId} = msg;
            let params = {
                ...msg
            }
        service.getPointHistory(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if(res.ret){
                    let data = res.ret;
                    arr = data.map((item,index)=>{
                        return {
                            ...item,
                            index:index+1
                        }
                    })
                    this.setState({
                        tableData:arr,
                        total:arr.length,
                        cycleType,
                        machineId,
                        receiverId,
                        speed,
                        machineNo,
                        pointId,
                        detectorId
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    lookEcharts = (type)=>{
        const {detailDtoList} = this.state;
        let recordIdList = [];
        // 1.全选，2全不选
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        this.getSingle(recordIdList);
    }
    chooseBox = (type) => {
        const {tableData,freqs} = this.state;
        let detailDtoList = [];
        let recordIdList = [];
        let selectedRowKeys = [];
        // 1.全选，2全不选
        for (let i = 0; i < tableData.length; i++) {
            selectedRowKeys.push(tableData[i].id);
            detailDtoList.push({
                groupId: tableData[i].groupId,
                recordId: tableData[i].id,
                 receiverId: tableData[i].receiverId
            })
            recordIdList.push(tableData[i].id)
        }
        if(type == 1){
            this.setState({
                selectedRowKeys,
                detailDtoList,
                selectedRows:tableData,
            })
            if(freqs.length == 0){
                this.getFreqs(selectedRows);
            }
        }else{
            this.setState({
                selectedRowKeys:[],
                detailDtoList: [],
            })
            singleTotalArr = [];
        }
      
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        const {freqs} = this.state;
        let detailDtoList = [];
        for(let i = 0;i<selectedRows.length;i++){
            detailDtoList.push({
                groupId: selectedRows[i].groupId,
                recordId: selectedRows[i].id,
                receiverId:selectedRows[i].receiverId
            })
        }
        this.setState({
            selectedRowKeys,
            selectedRows,
            detailDtoList
        })
        if(freqs.length == 0){
            this.getFreqs(selectedRows);
        }
    }
    getFreqs = (recordIdList)=>{
        let id = recordIdList[0].id;
        const {receiverId} = this.state;
        let params = {
            receiverId,
            recordIdList:[id]
        }
        service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                    let freqs = res.ret.freqs || [];
                    this.setState({
                        freqs
                    })
            } else {
                message.error(res.err);
            }
        })
        
    }

    getSingle = (recordIdList) => {
        singleTotalArr = [];
        const {receiverId} = this.state;
        let params = {
            receiverId,
            recordIdList
        }
        if(recordIdList.length){
            service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {  
                     singleTotalArr = [];
                       let ret = res.ret.responseList || [];
                       let freqs = res.ret.freqs || [];
                       XARR = freqs.map(item => (item.toFixed(0)));
                       for(let i = 0;i<ret.length;i++){
                           let dbArray = ret[i].dbArray || [];
                           let densityArray = ret[i].densityArray || [];
                           singleTotalArr.push({
                               id:ret[i].recordId,
                               detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                               machineNo: ret[i].machineNo || '',
                               densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                               dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(5))),
                               qualityId:ret[i].qualityId
                           })
                       }
                       this.setState({
                        freqs
                       })
                    
                        this.dealEcharts();
                } else {
                    message.error(res.err);
                }
            })
        }else{
             this.dealEcharts();
        }
    }

    dealEcharts = ()=>{
        this.disposeEcharts();
        this.drawEcharts()
    }
    dealDataDb = (k,m,db)=>{
        const {detailList,groupList,groupIndex,freqs} = this.state;
        let dbWeightList = [...groupList[groupIndex].dbWeightList];
        for(let i = 0;i<freqs.length;i++){
            if (k <= i && i <= m) {
                dbWeightList[i] = db;
            }
        }
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            dbWeightList
        }
  
        this.setState({
            groupList
        })
    }
    dealDataDensity = (k,m,density)=>{
        const {detailList,groupList,groupIndex,freqs} = this.state;
        let densityWeightList = [...groupList[groupIndex].densityWeightList];

        for(let i = 0;i<freqs.length;i++){
            if (k <= i && i <= m) {
                densityWeightList[i] = density;
            }
        }
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            densityWeightList
        }
        this.setState({
            groupList
        })
    }
    findClosestIndices(freqs, target) {
        // 初始化最小差值和最接近的索引
        let minDiff = Infinity;
        let closestIndex = 0;
      
        // 遍历数组，找到与目标值最接近的元素的索引
        for (let i = 0; i < freqs.length; i++) {
          // 计算当前元素与目标值的差值
          let diff = Math.abs(freqs[i] - target);
      
          // 如果当前差值小于已知的最小差值，则更新最小差值和最接近的索引
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
      
        // 返回最接近的索引
        return closestIndex;
      }
    // 计算权重曲线图
    dealWeight = ()=>{
        const {groupList,groupIndex,freqs} = this.state;
        weightAutoDbArr = [];
        weightAutoDensityArr = [];
        let dbList = groupList[groupIndex].dbList;
        let densityList = groupList[groupIndex].densityList;
        
        let dataArr = [];
        for(let i = 0;i<freqs.length;i++){
            dataArr.push(1)
        }

        if(dbList.length){
            for(let i = 0;i<dbList.length;i++){
                let obj = dbList[i];
                let k1 = this.findClosestIndices(freqs,obj.freq1);
                let k2 = this.findClosestIndices(freqs,obj.freq2);
                this.dealDataDb(k1,k2,obj.value)
            }
        }else{
            groupList[groupIndex] = {
                ...groupList[groupIndex],
                dbWeightList:dataArr
            }
            this.setState({
                groupList
            })
        }

        if(densityList.length){
            for(let i = 0;i<densityList.length;i++){
                let obj = densityList[i];
                let k1 = this.findClosestIndices(freqs,obj.freq1);
                let k2 = this.findClosestIndices(freqs,obj.freq2);
                this.dealDataDensity(k1,k2,obj.value)
            }
        
        }else{
            groupList[groupIndex] = {
                ...groupList[groupIndex],
                densityWeightList:dataArr
            }
            this.setState({
                groupList
            })
        }
    }
    drawEcharts = ()=>{
        if(this.state.groupList.length){
            this.dealWeight();
        }
         let totaldbArr = [];
         let totaldensityArr = [];
         
        let colorArray = ['blue','green','black','orange'];

        // 假设 qualityId 是 ret[i].recordId
        // 创建一个映射关系，将 qualityId 映射到颜色
        const colorMap = {};
        let colorIndex = 0;

        // 遍历 singleTotalArr，为每个 qualityId 分配颜色
        for (let i = 0; i < singleTotalArr.length; i++) {
            const qualityId = singleTotalArr[i].qualityId; // 假设 id 是 qualityId
            if (!colorMap[qualityId]) {
                // 如果当前 qualityId 还没有分配颜色，则分配一个颜色
                colorMap[qualityId] = colorArray[colorIndex % colorArray.length];
                colorIndex++;
            }
        }

        // 遍历 singleTotalArr，生成 totaldbArr 和 totaldensityArr
        for (let j = 0; j < singleTotalArr.length; j++) {
            const qualityId = singleTotalArr[j].qualityId; // 假设 id 是 qualityId
            const color = colorMap[qualityId]; // 获取对应的颜色

            totaldbArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                yAxisIndex: 0,
                data: singleTotalArr[j].dbArr,
                lineStyle: {
                    color: color, // 设置颜色
                    width: 1,
                    type: 'solid'
                },
            });

            totaldensityArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                yAxisIndex: 0,
                data: singleTotalArr[j].densityArr,
                lineStyle: {
                    color: color, // 设置颜色
                    width: 1,
                    type: 'solid'
                },
            });
        }

        //  for (let j = 0; j < singleTotalArr.length; j++) {
        //      totaldbArr.push({
        //          name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
        //          type: "line",
        //          yAxisIndex: 0,
        //          data: singleTotalArr[j].dbArr,
        //          lineStyle: {
        //             // color:'red',
        //             width: 1,
        //             type: 'solid'
        //         },
        //      })
        //      totaldensityArr.push({
        //          name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
        //          type: "line",
        //          yAxisIndex: 0,
        //          data: singleTotalArr[j].densityArr,
        //          lineStyle: {
        //             // color:'red',
        //             width: 1,
        //             type: 'solid'
        //         },

        //      })
        //  }
         finallydbArr = [];
         finallydensityArr = [];

         const {groupList,groupIndex} = this.state;
         if(groupList.length){
            weightAutoDbArr = [
                {
                    name: '能量权重曲线',
                    type: 'line',
                    yAxisIndex: 1,
                    data: groupList[groupIndex].dbWeightList,
                    lineStyle: {
                        color:'red',
                        width: 3,
                        type: 'solid'
                    },
                }
            ]

            weightAutoDensityArr = [
                {
                    name: '密度权重曲线',
                    type: 'line',
                    data: groupList[groupIndex].densityWeightList,
                    yAxisIndex: 1,
                    lineStyle: {
                        color: 'red',
                        width: 3,
                        type: 'solid'
                    },
                }
                
            ]
        }

     
        let that = this;
         setTimeout(() => {
              let endDbArr = [ ...totaldbArr,...weightAutoDbArr];
              let endDensityArr = [...totaldensityArr,...weightAutoDensityArr];

            finallydbArr = endDbArr;
            finallydensityArr = endDensityArr;

              
              if (that.echartsBoxDb) {
                  if (myEchartsDb == null) {
                      myEchartsDb = echarts.init(that.echartsBoxDb);
                  }
                  if (myEchartsDb) {
                      let optionDb = JSON.parse(JSON.stringify(echartsOption.yDb));
                      optionDb.xAxis[0].data = XARR || [];
                      optionDb.series = finallydbArr || [];
                      myEchartsDb.setOption(optionDb);
                      myEchartsDb.on('click', function (params) {
                        const dataIndex = params.dataIndex;
                            if (params.componentType === 'series') {
                                if(params.seriesName == '能量权重曲线'){
                                    if(dbName1 == ''){
                                        dbName1 = params;
                                        let msg = '开始频段' + params.name + 'Hz'
                                        message.success(msg)
                                    }else{
                                        dbName2 = params;
                                        let msg = '开始频段' + dbName1.name + 'Hz，结束频段' + dbName2.name;
                                        message.success(msg)
                                        that.dbClick();
                                    }
                                }else{
                                    that.echartsClick(dataIndex, params.name,'db')

                                }
                            }
                      });
           
                  }
              }
              if (that.echartsBoxDensity) {
                  if (myEchartsDensity == null) {
                      myEchartsDensity = echarts.init(that.echartsBoxDensity);
                  }
                  if (myEchartsDensity) {
                      let optionDensity = JSON.parse(JSON.stringify(echartsOption.yDensity));
                      optionDensity.xAxis[0].data = XARR || [];
                      optionDensity.series = finallydensityArr || [];
                      myEchartsDensity.setOption(optionDensity);
                      myEchartsDensity.on('click', function (params) {
                        const dataIndex = params.dataIndex;
                        if (params.componentType === 'series') {
                            if(params.seriesName == '密度权重曲线'){
                                if(densityName1 == ''){
                                    densityName1 = params;
                                    let msg = '开始频段' + params.name + 'Hz'
                                    message.success(msg)
                                }else{
                                    densityName2 = params;
                                    let msg = '开始频段' + densityName1.name + 'Hz，结束频段' + densityName2.name;
                                    message.success(msg)
                                    that.densityClick();
                                }
                            }else{
                                that.echartsClick(dataIndex, params.name,'db')

                            }
                        }
                      });
                  }
              }

         }, 500);
    }
    getWeightSet = (result,msg) =>{
        if(msg){
            this.setState({
                groupList:msg
            })
        }
    }
    save = ()=>{
        const {groupCount,groupValue, cycleType,
            detailDtoList,machineId,receiverId,
            speed, machineNo,
            pointId,detectorId,groupList,name,
        } = this.state;
        let recordIdList = [];
        // 1.全选，2全不选
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        let autoStandardOKRequestList = [];
        for(let i = 0;i<groupList.length;i++){
            let temp = groupList[i];
            const {type,idSet} = temp;
            autoStandardOKRequestList.push({
                dbAutoWeightList:[],
                dbWeightList:groupList[i].dbList,
                densityAutoWeightList:[],
                densityWeightList:groupList[i].densityList,
                type,
                errorLine:groupList[i].errorLine,
                recordIdList:idSet
            })
        }
        let params = {
            name,
            receiverId,
            okGroupCount:groupCount,
            recordIdList,
            cycleType,
            machineId,
            speed,
            tenantId,
            machineNo,
            pointId,
            detectorId,
            groupValue,
            autoStandardOKRequestList
        }
        // console.log(params)
        // return false;
        if(name == ''){
            message.error('请先填写参数')
            return false
        }
        service.submit(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                message.success('保存成功');
            } else {
                message.error(res.err);
            }
        })
    }
    // 
    groupInit = ()=>{
        this.setState({
            groupList:[],
            juleiVisible:true,
        })
        // 聚类
        const {groupCount,receiverId} = this.state;
        const {detailDtoList,groupValue,groupList,freqs,deleteIdList} = this.state;

        if(groupValue == ''){
            message.error('分组偏差值不能为空')
            return false;
        }

        let dataArr = [];
        for(let i = 0;i<freqs.length;i++){
            dataArr.push(1)
        }
        let recordIdList = [];
        // 数据集数据有删减，重新聚类计算
        for (let i = 0; i < groupList.length; i++) {
            recordIdList =  recordIdList.concat(groupList[i].idSet)
        }
        // 从全部数据直接选择过来
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        // 从 recordIdList 中删除 deleteIdList 中的元素
        recordIdList = recordIdList.filter(id => !deleteIdList.includes(id));
        // 去重
        recordIdList = [...new Set(recordIdList)];

        let params = {
            receiverId,
            groupCount,
            groupValue,
            recordIdList
        }
        service.autoGroup(VtxUtil.handleTrim(params)).then(res => {
            this.setState({
                juleiVisible:false
            })
            if (res.rc == 0) {  
                let data  = res.ret;
                for(let i = 0;i<data.length;i++){
                    data[i] = {
                        ...data[i],
                        dbWeightList:dataArr,
                        densityWeightList:dataArr,
                        dbList:[],
                        densityList:[],
                        errorLine:""
                    }
                }
                this.setState({
                    tempList:data,
                    groupCount:res.ret.length || ''
                },()=>{
                    this.calculateError(data)
                })
            } else {
                message.error(res.err);
            }
        })
    }
    calculateError = (data)=>{
        const {receiverId} = this.state;
        const {tempList} = this.state;
        let tempArr = [];
        for(let i=0;i<data.length;i++){
            let idSet = data[i].idSet;
            // this.calculateError(receiverId,idSet,i)
            let params = {
                receiverId,
                recordIdList:idSet,
            }
            service.calculateError(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {  
                    tempArr[i] = {
                         ...tempList[i],
                        errorLine:res.ret ? res.ret : ''
                    }
                    this.setState({
                        groupList:tempArr,
                    })
        
                } else {
                    message.error(res.err);
                }
            })
        }
    }
    // 
    groupClick=(item,index)=>{
        const {receiverId,groupList} = this.state;
        let idSet = item.idSet;
        let errorLine = groupList[index].errorLine;
        // 点击某一个数据集
        this.setState({
            groupIndex:index,
            idSet:item.idSet,
            errorLine
        })
        let detailDtoList = [];
        for(let i = 0;i<idSet.length;i++){
            detailDtoList.push({
                receiverId,
                recordId:idSet[i]
            })
        }
        let params = {
            receiverId,
            recordIdList:idSet,
            detailDtoList
        }
        // this.calculateError(receiverId,idSet,index)
        service.findListByIdListNew(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                let juleiData = (res.ret || []).map((item, index) => ({
                    ...item,
                    index: index + 1 // 假设你想要从1开始计数
                  }))
                this.setState({
                    juleiData,
                })
            } else {
                message.error(res.err);
            }
        })
    }

    lookEcharts1 = ()=>{
        const {idSet} = this.state;
        if(idSet.length){
            this.getSingle(idSet)
        }else{
            message.error('还未选中数据集！')
        }
    }
    inputChangeIndex = (e)=>{
        const {groupIndex,groupList} = this.state;
        for(let i = 0;i<groupList.length;i++){
            if(i == groupIndex){
                groupList[i] = {
                    ...groupList[i],
                    errorLine:e.target.value
                }
            }
        }
        this.setState({
            [e.target.name]:e.target.value,
            groupList
        })
    }
    check = ()=>{
        // 校验数据
        const {groupList,groupCount,receiverId,idSet,groupIndex} = this.state;
        const {detailDtoList} = this.state;
        let recordIdList = [];
        for(let i = 0;i<groupList.length;i++){
            recordIdList = recordIdList.concat(groupList[i].idSet)
        }
        let checkRecordId = '';
        if(detailDtoList.length){
            checkRecordId = detailDtoList[0].recordId
        }
        let dataList = [];
        for(let i = 0;i<groupList.length;i++){
            if(i == groupIndex){
                dataList.push({
                  ...groupList[i],
                  recordIdList:groupList[i].idSet
                })
            }
        }
        //生成权重曲线
        let params = {
            receiverId,
            groupCount,
            dataList,
            recordIdList:idSet,
            checkRecordId
        }
        service.check(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                this.setState({
                    resultData:res.ret,
                    resultVisible:true,
                })
            } else {
                message.error(res.err);
            }
        })
    }
    deleteMode = (record,index) => {
        this.setState({
            deleteIndex:index,
            deleteId:record.id
        })
    }
    delete = ()=>{
        const {juleiData,deleteIndex,groupIndex,groupList,deleteId,detailDtoList,deleteIdList} = this.state;
        for(let i = 0;i<groupList.length;i++){
            if(i == groupIndex){
                let idSet = groupList[i].idSet;
                for(let j = 0;j<idSet.length;j++){
                    if(idSet[j] == deleteId){
                        idSet.splice(j,1)
                    }
                }
                groupList[i] = {
                    ...groupList[i],
                    idSet
                }
            }
        }
        let deleteIdListArr= [...deleteIdList];
        deleteIdListArr = deleteIdListArr.concat([deleteId]);
        const updatedJuleiData = juleiData.filter((item, index) => index !== deleteIndex);
        const updatedDetailDtoList = detailDtoList.filter(item => item.recordId !== deleteId);

        this.setState({
            juleiData:updatedJuleiData,
            detailDtoList:updatedDetailDtoList,
            groupList,
            deleteIdList:deleteIdListArr
        })

    }
    render(){
        const { loading, selectedRowKeys ,selectedRowKeysCycle,selectedRowKeysAll,callKey} = this.state;

        const tableStyle = {
            bordered: false,
            loading: false,
            pagination:{
                defaultPageSize:30,
            },
            size: 'default',
            // rowSelection: {},
            // 当列总宽度超过容器时，启用表格内部横向滚动条
            scroll: { x: 'max-content' },
        }
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                title: '记录id',
                dataIndex: 'id',
            },
            {
                title: '检测时间',
                dataIndex: 'detectTime',
                render: (text, record,index) => (
                    <span>
                        {record.detectTime ? moment(record.detectTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                    </span>
                ),
            }, {
                title: '机型',
                dataIndex: 'machineTypeName',
            },
            {
                title: '采音时间(s)',
                dataIndex: 'listenTime',
            },
            
            {
                title: '设备编号',
                dataIndex: 'machineNo',
            },
            {
                title: '听音器名称',
                dataIndex: 'detectorName',
            },
            {
                title: '听筒名称',
                dataIndex: 'receiverName',
            },
            {
                title: '转速',
                dataIndex: 'speed',
            },
            {
                title: '正反转',
                dataIndex: 'type',
                render: (text, record,index) => (
                    <span>
                        {record.type == 0 ? '正转' : '反转'}
                    </span>
                ),
            },

            {
                title: '点位名称',
                dataIndex: 'pointName',
            },
            {
                title: '品质等级',
                dataIndex: 'qualityName',
            },
            {
                title: '标签',
                dataIndex: 'judgeType',
                render: (text, record,index) => (
                    <span>
                        {record.judgeType == 1 ? '漏判' : (record.judgeType == 2 ? '误判' : '')}
                    </span>
                ),
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                        < Button onClick={()=>this.lookData(record,index)}> 查看曲线图 </Button>
                        < span className = "ant-divider" />
                        < Button onClick={()=>this.playAudio(record,index)}> 播放声音 </Button>
                        < span className = "ant-divider" />
                        <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                            {
                                callKey == 4 &&  < Button type='danger' onClick={()=>this.deleteMode(record,index)}> 删除 </Button>
                            }
                        </Popconfirm>
                    </span>
                ),
            }
        ];
         const columnsEcharts = [{
                 title: '频率(Hz)',
                 dataIndex: 'freq',
             },
             {
                 title: '曲线名称',
                 dataIndex: 'name',
             },
             {
                 title: '能量(db)',
                 dataIndex: 'db',
             },
             {
                 title: '密度(%)',
                 dataIndex: 'density',
             },

         ];
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections:true,
            onChange: this.onSelectChange,
        };
        const {tableData,filePath,groupValue,groupCount,groupList,resultData,name,juleiVisible,
            groupIndex,juleiData,errorLine ,freqs,db,weightType,density
        } = this.state;
        
    return (
        <Page title='自动建标管理' className="pageLayoutRoot">
            < SideBar parent={this}></SideBar>
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
            <div className={styles.body}>
                <SearchPage parent={this}></SearchPage>
                {/* 能量密度 */}
               <div className={styles.frequencyWidth}>
                    <div ref = {
                            (c) => {
                                this.echartsBoxDb = c
                            }
                        } 
                        style = {
                            {
                                width: '100%',
                                height: '300px',
                            }
                        }
                    /> 
                    <div ref = {
                            (c) => {
                                this.echartsBoxDensity = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '300px',
                            }
                        }
                    /> 
                    <BtnWrap>
                        <Button type='primary' onClick={()=>{
                            this.lookFullScreen(1)
                        }}>全屏能量曲线</Button>
                        <Button type='primary' style={{marginLeft:10,marginTop:'10px'}} onClick={()=>{
                            this.lookFullScreen(2)
                        }}>全屏密度曲线</Button>
                        <br/>
                         <span style={{color:'red'}}>提示：数据量大时可以通过点击具体频率查看所选数据对应的能量、密度 </span>
                    </BtnWrap>
                   
                </div>

                <div className={styles.frequencyWidth}>
                    <div className={styles.standStoreFlex}>
                        <BtnWrap style={{marginTop:'-10px'}}>
                            <Button style={{backgroundColor:'#F21360',color:'white'}} onClick={()=>this.lookEcharts()}>生成曲线图</Button>
                            <Button style={{marginTop:'10px'}}  onClick={()=>this.lookEcharts1()}>生成数据集曲线图</Button>
                            <Button style={{marginTop:'10px'}}  onClick={()=>this.check()}>校验数据</Button>
                        </BtnWrap>
                        <audio  src={filePath} autoPlay controls style={{width:300,height:30,marginLeft:100}}></audio>
                    </div>
                    <div>
                        <Input addonBefore="分组偏差值" style={{width:'200px',marginLeft:10,marginTop:'10px'}} name='groupValue' placeholder="请输入" value={groupValue}
                        onChange={this.inputChange.bind(this)}/>
                        <Button type='primary' style={{marginLeft:10,marginTop:'10px'}} onClick={()=>this.groupInit()}>开始聚类</Button>
                        <Input addonBefore="OK件种类" disabled style={{width:'150px',marginLeft:10,marginTop:'10px'}} name='groupCount' placeholder="请输入" value={groupCount}
                        onChange={this.inputChange.bind(this)}/>
                        <br/>
                        <span style={{color:'red',marginLeft:10}}>提示：聚类后，系统会自动生成相应数量的OK件种类，请根据实际情况调整OK件种类数量。</span>
                    </div>
                </div>
                
                <Tabs onChange={this.callback} type="card">
                    <TabPane tab="全部数据" key="1">
                        <BtnWrap>
                            {
                                selectedRowKeys.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                            }
                        </BtnWrap>
                        <Table {...tableStyle} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
                    </TabPane>   

                    <TabPane tab="聚类数据集" key="4">
                        {
                            juleiVisible ?   <Spin tip="聚类中,请稍等..." style={{width:400,height:400,margin:'100px auto'}}></Spin> : ''
                        }
              
                        <BtnWrap>
                            {
                                (groupList || []).map((item,index)=>{
                                    return (
                                        <Button key={index} className={groupIndex === index ? 'activeBtn' : 'passiveBtn'} onClick={()=>this.groupClick(item,index)}>数据集{index+1}__{item.idSet.length}</Button>
                                    )
                                })
                            }
                        </BtnWrap>
                        <div className={styles.frequencyWidth}>
                            <Input addonBefore="ng阈值:" style={{width:'300px'}} name='errorLine' placeholder="请输入" value={errorLine}
                                    onChange={this.inputChangeIndex.bind(this)}/>
                            <WeightAuto  parent={this} groupList={groupList} groupIndex={groupIndex}></WeightAuto>
                        </div>
                        <div style={{marginTop:10}}>
                                <Input addonBefore="自动建标曲线名称" style={{width:'400px'}} name='name' placeholder="请输入" value={name}
                                    onChange={this.inputChange.bind(this)}/>
                                <Button style={{background:'#FFA07A',marginLeft:10,color:'white'}} icon='save' onClick={()=>this.save()}>保存</Button>
                            </div>
                        <Table {...tableStyle} rowKey={record => record.id} columns={columns} dataSource={juleiData} />
                    </TabPane>
                </Tabs>
                {/* 频率曲线图 */}
                < Modal title = "数据详情" 
                    visible = {this.state.singleDataVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                        <div className={styles.ZCAudioStyle}>
                            <audio  src={filePath} controls></audio>
                        </div>
                        
                        <div ref = {
                            (c) => {
                                this.echartsBoxSingle = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '400px',
                            }
                        }
                    /> 
                </Modal>

                {/* 校验结果 */}
                < Modal title = "校验结果" 
                    visible = {this.state.resultVisible}
                    onOk = {()=>{this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="30%"
                    >
                        <div>校验值：{resultData.error}</div>
                    {resultData.okFlag?'通过':"未通过"}
                </Modal>

                {/* 全屏查看 */}
                 < Modal title = "数据详情" 
                    visible = {this.state.fullScreenVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="98%"
                    >
                        <div ref = {
                            (c) => {
                                this.echartsBoxFullScreen = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '600px',
                            }
                        }
                    /> 
                </Modal>

                {/* 点击对应的坐标轴数据数值 */}
                < Modal title = "图表点击对应频率数据"
                    visible = {this.state.clickChartVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="60%"
                    >
                    <Table pagination={false} rowKey={record => record.id} columns={columnsEcharts} dataSource={echartsClickData} />  
                </Modal>  
                    
                < Modal title = "自动建标数据"
                    visible = {this.state.autoVisible}
                    onOk = {() => {this.handleDb()}}
                    onCancel = {() => {this.handleClose()}}
                    width="30%"
                    >
                        {
                            weightType == 1 ? 
                                <Input addonBefore="能量权重系数：" style={{width:200}} name='db' placeholder="请输入" value={db}
                                onChange={this.inputChange.bind(this)}/> 
                            :
                            <Input addonBefore="密度权重系数：" style={{width:200}} name='density' placeholder="请输入" value={density}
                                onChange={this.inputChange.bind(this)}/>
                        }
                </Modal>  
                
            </div>
                </div>
            </div>
        </Page>
        
        )
    }
}

export default auto;
