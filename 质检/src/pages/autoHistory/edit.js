
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap, Iframe } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Tabs,Switch,Spin,Popconfirm  } from 'antd';

import {service} from './service';
import styles from './autoHistory.less';
import WeightAuto from '@src/pages/acomponents/weightAuto';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'autoHistory';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { first,uniqBy  } from 'lodash';
 const TabPane = Tabs.TabPane;
let myEchartsFullScreen = null;
 let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
 let singleTotalArr = [];

 let XARR = [];
 let finallydbArr = [];
 let finallydensityArr = [];

 let weightAutoDbArr = [];
 let weightAutoDensityArr = [];

 let echartsClickData = [];

 let filePath  = '';

 let dbName1 = '';
let dbName2 = '';

let densityName1 = '';
let densityName2 = '';
@connect(({autoHistory}) => ({autoHistory}))
class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            cycleType: '',
            endTime: '',
            machineId: '',
            pointId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            startTime: '',
            historyList:[],
            Visible:true,
            name:"",
            qualityList:[],
            fullScreenVisible:false,
            selectedRows:[],
            selectedRowsHistory:[],
            qualityId:"",
            selectedRowKeys:[],
            loading: false,
            total:0,
            groupCount:'',
            receiverId:'',
            groupList:[],
            resultVisible:false,
            resultData:'',
            juleiVisible:false,
            idSet:[],
            deleteIdList:[]
        }
    }
    componentDidMount(){
        const {autoHistory} = this.props;
        const {qualityList} = autoHistory;
        this.setState({
            qualityList,
        })
        this.getList()
    }
    componentWillReceiveProps(newProps) {
        const {autoHistory} = {...newProps};
        const {qualityList} = autoHistory;
        this.setState({
            qualityList,
        })
    }
    componentWillUnmount(){
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
    getList = () => {
        let params = {
            id:this.props.id
        }
        service.findById(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                this.dealRes(res);
                }
            } else {
                message.error(res.err);
            }
        })
      
    }
    dealRes = (res)=>{
           let data = res.ret || [];
           const {
               name,
               cycleType,
               machineId,
               receiverId,
               speed,
               machineNo,
               pointId,
               detectorId,okGroupCount,autoStandardDetailDtoList,groupValue
           } = data;
           let groupList = [];

           let originalrecordIdList = [];

           for(let i = 0;i<autoStandardDetailDtoList.length;i++){
                const {recordIdList,groupType,autoWeightGroupDto} = autoStandardDetailDtoList[i];
                groupList.push({
                    idSet:recordIdList,
                    densityWeightList:[],
                    dbWeightList:[],
                    dbList:autoWeightGroupDto.dbWeightList,
                    densityList:autoWeightGroupDto.densityWeightList,
                    errorLine:autoWeightGroupDto.errorLine,
                    type:groupType
                })
                originalrecordIdList = originalrecordIdList.concat(autoStandardDetailDtoList[i].recordIdList)
            }
            

           this.setState({
                name,
                machineId,
                receiverId,
                speed,
                machineNo,
                pointId,
                detectorId,
                cycleType,groupCount:okGroupCount,autoStandardDetailDtoList,groupValue,
                groupList,
                originalrecordIdList
           },()=>{
            this.getFreqs(originalrecordIdList)
           })
    }
    getFreqs = (recordIdList)=>{
        let id = recordIdList[0];
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
    dealEcharts = () => {
        this.disposeEcharts();
        this.drawEcharts();
    }
    // ==========================================处理权重曲线开始============================
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

        let dbList = groupList[groupIndex].dbList || [];
        let densityList = groupList[groupIndex].densityList || [];

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
    dealDataDb = (k,m,db)=>{
        const {detailList,groupList,groupIndex,freqs} = this.state;
        let dbWeightList = [...groupList[groupIndex].dbWeightList];
        for(let i = 0;i<freqs.length;i++){
            if (k <= i && i <= m) {
                dbWeightList[i] = db;
            }else{
                dbWeightList[i] = 1;
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
            }else{
                densityWeightList[i] = 1;
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
    // =================================================处理权重曲线结束=====================================
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
     
        for(let i = 0;i<finallydbArr.length;i++){
            echartsClickData.push({
                freq: seriesName,
                name: finallydbArr[i].name,
                db: finallydbArr[i].data[dataIndex],
                density: finallydensityArr[i].data[dataIndex],
            })
        }
        if (type == 'db') {
            echartsClickData.sort(this.compareEchartsClick('db'))
        }else{
            echartsClickData.sort(this.compareEchartsClick('density'))
        }
        this.setState({
            clickChartVisible:true
        })
    }
    compareEchartsClick = (property) => {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];

            return value2 - value1;
        }
    }
    handleCancel = (e) => {
        this.setState({
            Visible: false,
  
        })
        this.disposeEcharts();
        this.props.parent.getEditClose(this,false)
    }
    // 播放声音
    playAudio = (record,index)=>{
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
        this.setState({
        filePath
        })
    }
    
     // 全屏查看
     lookFullScreen = (type) => {
         this.setState({
             fullScreenVisible: true,
         }, () => {
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

    // 已选定的曲线列表数据
    // onSelectChange = (selectedRowKeys, selectedRows) => {
    //     this.setState({
    //         selectedRowKeys,
    //         selectedRows
    //     })
    // }
    onSelectChangeHistory = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeysHistory: selectedRowKeys,
            selectedRowsHistory:selectedRows
        })
     }
   
    lookEcharts = ()=>{
        this.dealSelectedData()
    }
    dealSelectedData = ()=>{
        let detailDtoList = [];
        const {selectedRows,selectedRowsHistory,receiverId,groupList,groupIndex} = this.state;
        let tempArr = uniqBy(selectedRows.concat(selectedRowsHistory), 'id');
        let recordIdList = [];
        for (let i = 0; i < tempArr.length; i++) {
            let temp = tempArr[i];
            recordIdList.push(temp.id)
            detailDtoList.push({
                groupId: temp.groupId,
                recordId: temp.id,
                detectTime: temp.detectTime,
                receiverId: temp.receiverId,
            })
        }
        this.setState({
            detailDtoList,
            totalChecked:tempArr
        },()=>{
            this.getSingle(recordIdList)
        })

    }
    
    removeDuplicates(arr) {
        return arr.filter((item, index) => {
            return arr.indexOf(item) === index;
        });
    }


    getSingle = (recordIdList) => {
        singleTotalArr = [];
        let recordIdListArr = [];
        let newdetailDtoList = [];
        const {totalChecked,detailDtoList,receiverId} = this.state;
 
        // for(let i = 0;i<recordIdList.length;i++){
        //     newdetailDtoList.push({
        //         recordId:recordIdList[i],
        //         receiverId
        //     })
        // }   
        // 去重
        let params = {
            // detailDtoList:newdetailDtoList,
            recordIdList: this.removeDuplicates(recordIdList),
            receiverId
        }
        if (recordIdList.length){
            service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    singleTotalArr = [];
                    let ret = res.ret.responseList || [];
                    let freqs = res.ret.freqs || [];
                    XARR = freqs.map(item => (item.toFixed(0)));

                    for (let i = 0; i < ret.length; i++) {
                        let dbArray = ret[i].dbArray || [];
                        let densityArray = ret[i].densityArray || [];
                        singleTotalArr.push({
                            detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                            machineNo: ret[i].machineNo || '',
                            densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                            dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(2))),
                            qualityId:ret[i].qualityId
                        })
                    }
                    this.setState({
                        freqs
                    })
                    this.dealEcharts()
                } else {
                    message.error(res.err);
                }
            })
        }else{
          this.dealEcharts()

        }
    }
    getWeightSet = (result,msg) =>{
        if(msg){
            this.setState({
                groupList:msg
            })
        }
    }

    // 保存
    save = () => {
        const {cycleType,machineId,receiverId,speed,detailDtoList,name, machineNo, 
            groupCount,groupValue,
            pointId,
            detectorId,groupList,
        } = this.state;
   
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
            cycleType,
            machineId,
            receiverId,
            speed,
            tenantId,
            machineNo,
            pointId,
            detectorId,name,
            id:this.props.id,okGroupCount:groupCount,groupValue,autoStandardOKRequestList
        }
        // console.log(params,'params')
        // return false;
        service.submit(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('保存成功')
                this.handleCancel()
            } else {
                message.error(res.err);
            }
        })
        
    }
    groupInit = ()=>{
        this.setState({
            groupList:[],
            juleiVisible:true,
        })
        // 聚类
        const {groupCount,receiverId,groupValue,autoStandardDetailDtoList,deleteIdList,selectedRowsHistory,freqs} = this.state;
       
        let recordIdList = [];
    
        for(let i = 0;i<autoStandardDetailDtoList.length;i++){
            recordIdList = recordIdList.concat(autoStandardDetailDtoList[i].recordIdList)
        }
        for(let i = 0;i<selectedRowsHistory.length;i++){
            recordIdList.push(selectedRowsHistory[i].id)
        }
          // 从 recordIdList 中删除 deleteIdList 中的元素
          recordIdList = recordIdList.filter(id => !deleteIdList.includes(id));
          // 去重
          recordIdList = [...new Set(recordIdList)];
        
        if(groupValue == ''){
            message.error('分组偏差值不能为空')
            return false;
        }
        let dataArr = [];
        for(let i = 0;i<freqs.length;i++){
            dataArr.push(1)
        }
        let params = {
            receiverId,
            groupCount,
            recordIdList,
            groupValue
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
        const {tempList,receiverId} = this.state;
        let tempArr = [];
        for(let i=0;i<data.length;i++){
            let idSet = data[i].idSet;
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
        let errorLine = groupList[index].errorLine ;
        let idSet = item.idSet;
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
            recordIdList:this.removeDuplicates(idSet),
            detailDtoList
        }
        service.findListByIdListNew(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                  // 按照 detectTime 排序
                let newData = res.ret.sort((a, b) => {
                    // 假设 detectTime 是一个可以比较的值（如数字或日期字符串）
                    return a.detectTime - b.detectTime; // 升序排序
                    // 如果需要降序排序，可以改为 b.detectTime - a.detectTime
                });
                let juleiData = (newData || []).map((item, index) => ({
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
        const {groupList,groupCount,receiverId,idSet,selectedRowsHistory,groupIndex } = this.state;
        let recordIdList = [];
        for(let i = 0;i<groupList.length;i++){
            recordIdList = recordIdList.concat(groupList[i].idSet)
        }
        let checkRecordId = '';
        if(selectedRowsHistory.length){
            checkRecordId = selectedRowsHistory[0].id
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
    //======================================== 查询开始==================================================
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    qualityChange = (e) => {
        this.setState({
            qualityId: e
        })
    }
    
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    // 查询条件结束
    queryMonth = () =>{
        const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,qualityId,
            detectorId} = this.state;
        let params = {
            cycleType,
            endTime,
            machineId,
            receiverId,
            speed,
            startTime,
            machineNo,
            pointId,
            qualityId,
            detectorId
        }
        service.getPointHistory(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret;
                    let arr = [];
                    arr = data.map((item,index)=>{
                        return {
                            ...item,
                            detectTime: item.detectTime?moment(item.detectTime).format('YYYY-MM-DD HH:mm:ss') : '',
                            index:index+1
                        }
                    })
                    this.setState({
                        historyList:arr
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })

    }
    handleClose = ()=>{
        this.setState({
            fullScreenVisible:false,
            clickChartVisible:false,
            resultVisible:false,
        })
         if (myEchartsFullScreen) {
             myEchartsFullScreen.dispose();
             myEchartsFullScreen = null;
         }
    }
    // ================================查询结束================================================
    chooseBox = (type) => {
        const {historyList} = this.state;
        let selectedRowKeys = [];
        // 1.全选，2全不选
        for (let i = 0; i < historyList.length; i++) {
            selectedRowKeys.push(historyList[i].id);
        }
        if(type == 1){
            this.setState({
                selectedRowKeysHistory:selectedRowKeys,
                selectedRowsHistory: historyList,
            })
        }else{
            this.setState({
                selectedRowKeysHistory:[],
                selectedRowsHistory: [],
            })
        }
    }

    // 删除
    delete = () => {
        const {autoStandardDetailDtoList,deleteIndex,juleiData,deleteId,originalrecordIdList,deleteIdList} = this.state;
        const set = new Set(originalrecordIdList);
        set.delete(deleteId);
        
        const newList = Array.from(set);
        let arr = [...juleiData]
        arr.splice(deleteIndex, 1);

        let deleteIdListArr= [...deleteIdList];
        deleteIdListArr = deleteIdListArr.concat([deleteId]);

        this.setState({
            deleteIdList: deleteIdListArr,
            originalrecordIdList:newList,
            juleiData:arr
        })
    }

    deleteMode = (item,index)=>{
        this.setState({
            deleteIndex:index,
            deleteId:item.id
        })
    }
    render(){
        const tableStyle = {
            bordered: false,
            loading: false,
            pagination: true,
            size: '15',
            // rowSelection: {},
            scroll: 600,
        }
         const columns = [
              {
                  title: '序号',
                  dataIndex: 'index',
              }, {
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
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                        < Button onClick={()=>this.playAudio(record,index)}> 播放声音 </Button>
                        <span className="ant-divider" />
                        <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                            < Button type='danger' style={{marginLeft:10}} onClick={()=>this.deleteMode(record,index)}> 删除 </Button>
                        </Popconfirm> 
                    </span>
                ),
            }
        ];
       
        const columnsEcharts = [
            {
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
        const { loading, selectedRowKeys,selectedRowKeysCycle,selectedRowKeysHistory,suddenInfo,selectedRowKeysAll   } = this.state;
        // const rowSelection = {
        //     selectedRowKeys,
        //     onChange: this.onSelectChange,
        // };

        const rowSelectionHistory = {
            selectedRowKeys:selectedRowKeysHistory,
            onChange: this.onSelectChangeHistory,
        };
        
        const rowSelectionAll = {
            selectedRowKeys: selectedRowKeysAll,
            hideDefaultSelections: true,
            onChange: this.onSelectChangeAll,
        };
        const {historyList, qualityList,machineNo,errorLine} = this.state;
        const {filePath ,groupIndex,juleiData,groupValue,groupCount,groupList ,resultData,
            name,juleiVisible,freqs,weightType,db,density
        } = this.state;
    return (
            <div>
                < Modal title = "编辑" 
                    visible = {this.state.Visible}
                    maskClosable={false}
                    onOk = {this.handleCancel}
                    onCancel = {this.handleCancel} 
                    okText='关闭'
                    width="95%"
                    >
                
                    <div style={{width:'100%',border:'1px solid green',borderRadius:'10px',padding:'10px 10px'}}>
                        <div className={styles.standStoreFlex}>
                            <div ref = {
                                    (c) => {
                                        this.echartsBoxDb = c
                                    }
                                } 
                                style={{width:'100%',height:300}}
                            /> 
                            <div ref = {
                                    (c) => {
                                        this.echartsBoxDensity = c
                                    }
                                }
                                style={{width:'100%',height:300}}
                            /> 
                        </div>
                    <Button type='primary' onClick={()=>{
                            this.lookFullScreen(1)
                        }}>全屏能量曲线</Button>
                        <Button type='primary' style={{marginLeft:10}} onClick={()=>{
                            this.lookFullScreen(2)
                        }}>全屏密度曲线</Button>
                            <span style={{color:'red'}}>提示：数据量大时可以通过点击具体频率查看所选数据对应的能量、密度 </span>
                    </div> 
                    <div className={styles.frequencyWidth}>
                    <div className={styles.standStoreFlex}>
                        <BtnWrap>
                            <Button style={{backgroundColor:'#F21360',color:'white'}} onClick={()=>this.lookEcharts()}>生成曲线图</Button>
                            <Button  onClick={()=>this.lookEcharts1()}>生成数据集曲线图</Button>
                            <Button  onClick={()=>this.check()}>校验数据</Button>
                        </BtnWrap>
                        <audio  src={filePath} autoPlay controls style={{width:300,height:30,marginLeft:100}}></audio>
                    </div>
                    <div>
                        <Input addonBefore="分组偏差值" style={{width:'200px',marginLeft:10}} name='groupValue' placeholder="请输入" value={groupValue}
                        onChange={this.inputChange.bind(this)}/>
                        <Button type='primary' style={{marginLeft:10}} onClick={()=>this.groupInit()}>开始聚类</Button>
                        <Input addonBefore="OK件种类" disabled style={{width:'150px',marginLeft:5}} name='groupCount' placeholder="请输入" value={groupCount}
                        onChange={this.inputChange.bind(this)}/>
                         <span style={{color:'red',marginLeft:10}}>提示：聚类后，系统会自动生成相应数量的OK件种类，请根据实际情况调整OK件种类数量。</span>
                    </div>
                
                </div>

                    <div>
                        <Tabs type="card">
                            <TabPane tab="聚类数据集" key="1">

                                {
                                    juleiVisible ?   <Spin tip="聚类中,请稍等..." style={{width:400,height:400,margin:'100px auto'}}></Spin> : ''
                                }
                                
                                <div style={{marginTop:10}}>
                                    <Input addonBefore="自动建标曲线名称" style={{width:'400px'}} name='name' placeholder="请输入" value={name}
                                        onChange={this.inputChange.bind(this)}/>
                                     <Button style={{background:'#FFA07A',marginLeft:10,color:'white'}} icon='save' onClick={()=>this.save()}>保存</Button>
                                </div>
                             
                                <div className={styles.frequencyWidth}>
                                    <BtnWrap>
                                        {
                                            (groupList || []).map((item,index)=>{
                                                return (
                                                    <Button key={index} className={groupIndex === index ? 'activeBtn' : 'passiveBtn'} onClick={()=>this.groupClick(item,index)}>数据集{index+1}__{item.idSet.length}</Button>
                                                )
                                            })
                                        }
                                    </BtnWrap>
                                    <Input addonBefore="ng阈值:" style={{width:'300px'}} name='errorLine' placeholder="请输入" value={errorLine}
                                    onChange={this.inputChangeIndex.bind(this)}/>

                                    <WeightAuto  parent={this} groupList={groupList} groupIndex={groupIndex} freqs={freqs}></WeightAuto>
                                    <Table {...tableStyle} rowKey={record => record.id} columns={columns} dataSource={juleiData} />
                                </div>
                                
                            </TabPane>
                        </Tabs>
                    </div>
                        <div>
                            {/* 查询功能 */}
                            <div style={{margin:"10px 0"}}>
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
                                />
                                <Input addonBefore="请输入设备编号："  style={{width:'250px',marginLeft:"10px"}} placeholder="请输入编号:" value={machineNo} name='machineNo'
                                onChange={this.inputChange.bind(this)} />
                                <Select defaultValue='请选择品质等级' style={{ width: 120,marginLeft:10, outline: 'none' }} onChange={this.qualityChange.bind(this)}>
                                      <Option value ='' key={100}> 不限 </Option>
                                    {
                                        (qualityList || []).map((item, index) => {
                                            return (
                                                <Option value ={item.id} key={index}> {item.name} </Option>
                                            )
                                        })
                                    }
                                </Select>
                                <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.queryMonth()}> 查询 </Button>
                                <span style={{color:'red'}}> 提示：如果下方所选某条数据与上方所选某条数据相同，则只展示一条，不会重复生成两条曲线图</span>
                            </div>
                            <BtnWrap>
                                {
                                    selectedRowKeysHistory && selectedRowKeysHistory.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                                }
                            </BtnWrap>
                            <Table rowSelection={rowSelectionHistory} rowKey={record => record.id} columns={columns} dataSource={historyList} />
                        </div>
                    
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
                        <Table {...tableStyle} rowKey={record => record.id} columns={columnsEcharts} dataSource={echartsClickData} />  
                    </Modal>           
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
        )
    }
}

export default Edit;
