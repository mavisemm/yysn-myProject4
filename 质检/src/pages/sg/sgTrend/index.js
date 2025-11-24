
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Spin } from 'antd';

import {service} from './service';
import styles from './sgTrend.less';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'standardStore';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { first,uniqBy  } from 'lodash';
import echartsOption from '@src/pages/acomponents/optionEcharts';
let singleTotalArr = [];
let filePath = '';
let deviceDataList = [];
let myEcharts1 = null;
let echartsArr = [];
let totalSelected = [];

@connect(({standardStore}) => ({standardStore}))
class standardStore extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            selectedRows:[],
            loading: false,
            machineList:[],
            machineVisible:false,
            endTime: '',
            machineId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            startTime: '',
            historyList:[],
            singleDataVisible:false,
            frequencyList:[],
            standardLineVisible:false,
            detailDtoList:[],//选定记录列表
            db:"",
            density:"",
            name:"",
            densityFilter:'',
            TableVisible:false,//列表形式查看标准曲线数据
            total:0,
            lineOption:{
                title: {
                    text:'',
                    left: 'center',
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#505765'
                        }
                    }
                },
                legend: {
                    data: [],
                    left: 100,
                },
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        show: true,
                    },
                    data: []
                  },
                  yAxis: {
                    name:"",
                    type: 'value',
                    scale:true,
                    axisLabel: {
                        show: true,
                    },
                    splitLine: {
                        show: false
                    },
                  },
                  series: [
                    {
                      data: [],
                      type: 'line',
                      emphasis: {
                        focus: 'series'
                      },
                    },
                    {
                        data: [],
                        type: 'line',
                        emphasis: {
                            focus: 'series'
                          },
                      },
                      {
                        data: [],
                        type: 'line',
                        emphasis: {
                            focus: 'series'
                          },
                      }
                  ]
            },
            receiverList:[],
            avgList:[],
            avgListSingle:[]
        }
    }
    componentDidMount(){
        const {standardStore} = this.props;
        const {machineList} = standardStore;
             this.setState({
                 machineList,
             })
    }
    componentWillReceiveProps(newProps) {
        const {standardStore} = {...newProps};
        const {machineList} = standardStore;
        this.setState({
            machineList,
        })
    
    }
    disposeEcharts = ()=>{
        if (echartsArr.length) {
            for(let i = 0;i<echartsArr.length;i++){
                echartsArr[i].dispose();
                echartsArr[i] = null;
            }
            echartsArr = [];
        }
    }
    handleClose = () =>{
        this.setState({
            TableVisible:false,
            singleDataVisible:false,
        })
    }
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
    getList = (page) =>{
        this.setState({
            standardLineVisible:false
        })
       
        const {startTime,endTime,machineId} = this.state;
         if (!machineId) {
            message.error('机型不能为空')
            return false;
         }
            let filterPropertyMap = [
                {
                    code: 'detectTime',
                    operate: 'GTE',
                    value: startTime
                },
                {
                    code: 'detectTime',
                    operate: 'LTE',
                    value: endTime
                },
                {
                    code: "status",
                    operate: "EQ",
                    value: 1
                },
                {
                    code: "tenantId",
                    operate: "EQ",
                    value: VtxUtil.getUrlParam('tenantId')
                },
                
                {
                    code: "machineTypeId",
                    operate: "EQ",
                    value: machineId
                },
            ]
            let params = {
                filterPropertyMap:filterPropertyMap.filter((item)=>{return item.value}),
                pageIndex:page-1,
                pageSize:10,
                sortValueMap: [
                    {
                        code: 'detectTime',
                        sort: 'desc'
                    }
                ]
            };
        service.getPointHistory(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if(res.ret){
                    let data = res.ret;
                    arr = data.items.map((item,index)=>{
                        return {
                            ...item,
                            index: (page - 1) * 10 + index+1,
                        }
                    })
                    this.setState({
                        machineVisible: false,
                        historyList:arr,
                        total:data.rowCount
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })

    }
    onItemChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeys,
        });
    }
    onSelectChange = (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
            totalSelected.push(record)
        } else {
            const delIndex = totalSelected.findIndex((val) => {
                return val.id === record.id
            })
            totalSelected.splice(delIndex, 1)
        }
        this.dealSelectedData(totalSelected)
    }
    onSelectAll = (selected, selectedRows, changeRows) => {
      if (selected) {
        totalSelected = totalSelected.concat(changeRows)
      }
      if (!selected) {
        let selectedRows = JSON.parse(JSON.stringify(totalSelected))
        const delIndex = []
        selectedRows.forEach((item, index) => {
          changeRows.forEach((val, itemIndex) => {
            if (item.id === val.id) {
              delIndex.push(index)
            }
          })
        })
        delIndex.forEach((item) => {
          delete selectedRows[item]
        })
        selectedRows = selectedRows.filter((item) => {
          return item !== undefined
        })
        totalSelected = selectedRows
    
      }
        this.dealSelectedData(totalSelected)
    }
    dealSelectedData = (totalSelected) => {
        let totalSelectedArr = totalSelected;
         let detailDtoList = [];
         let recordIdList = [];
         deviceDataList = []

         for (let i = 0; i < totalSelectedArr.length; i++) {
             detailDtoList.push({
                 groupId: totalSelectedArr[i].groupId,
                 recordId: totalSelectedArr[i].id
             })
             recordIdList.push(totalSelectedArr[i].id)
         }
        this.setState({
            detailDtoList
        }, () => {
            this.getSingle(recordIdList);
        });
    
      
    }
    dealSix = ()=>{
        let totalSelectedArr = totalSelected;
        const {lineOption} = this.state;
        const lineOption1 = {...lineOption};
        // 功率温度，振动，扭矩，液压，转速
         // lineOption
         let timeArr = [];
         let powerArr = [];
         let heatArr = [];
         let vibteArr = [];
         let yeyaArr = [];
         let niujuArr = [];
         let speedArr = [];
         for (let i = 0; i < totalSelectedArr.length; i++) {
             timeArr.push(moment(totalSelectedArr[i].detectTime).format('YYYY-MM-DD HH:mm:ss'));
             powerArr.push(totalSelectedArr[i].power);
             heatArr.push(totalSelectedArr[i].temperature);
             vibteArr.push(totalSelectedArr[i].vibration);
             yeyaArr.push(totalSelectedArr[i].hydraulic);
             niujuArr.push(totalSelectedArr[i].torque);
             speedArr.push(totalSelectedArr[i].rotateSpeed);
             // HEAT,VIBTE,HYDRAULIC,TORQUE,POWER,SPEED
             deviceDataList.push({
                 deviceType: "HEAT",
                 deviceData: totalSelectedArr[i].temperature,
                 deviceTime: totalSelectedArr[i].detectTime,
                 recordId: totalSelectedArr[i].id
             }, {
                 deviceType: "VIBTE",
                 deviceData: totalSelectedArr[i].vibration,
                 deviceTime: totalSelectedArr[i].detectTime,
                 recordId: totalSelectedArr[i].id
             }, {
                 deviceType: "HYDRAULIC",
                 deviceData: totalSelectedArr[i].hydraulic,
                 deviceTime: totalSelectedArr[i].detectTime,
                 recordId: totalSelectedArr[i].id
             }, {
                 deviceType: "TORQUE",
                 deviceData: totalSelectedArr[i].torque,
                 deviceTime: totalSelectedArr[i].detectTime,
                 recordId: totalSelectedArr[i].id
             }, {
                 deviceType: "POWER",
                 deviceData: totalSelectedArr[i].power,
                 deviceTime: totalSelectedArr[i].detectTime,
                 recordId: totalSelectedArr[i].id
             }, {
                 deviceType: "SPEED",
                 deviceData: totalSelectedArr[i].rotateSpeed,
                 deviceTime: totalSelectedArr[i].detectTime,
                 recordId: totalSelectedArr[i].id
             }, )
         }

         if (this.echartsBoxhw) {
            let myEcharts1 = echarts.init(this.echartsBoxhw);
             echartsArr.push(myEcharts1);
             lineOption1.title.text = '温度趋势图';
             lineOption1.xAxis.data = timeArr;
             lineOption1.yAxis.name = '℃';
             lineOption1.series[0].data = heatArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }

         if (this.echartsBoxzd) {
            let myEcharts1 = echarts.init(this.echartsBoxzd);
             echartsArr.push(myEcharts1);
             lineOption1.title.text = '振动趋势图';
             lineOption1.xAxis.data = timeArr;
             lineOption1.yAxis.name = 'mm/s';
             lineOption1.series[0].data = vibteArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }

         if (this.echartsBoxyy) {
            let myEcharts1 = echarts.init(this.echartsBoxyy);
              echartsArr.push(myEcharts1);
             lineOption1.title.text = '车号趋势图';
             lineOption1.xAxis.data = timeArr;
            //  lineOption1.yAxis.name = 'MPa';
             lineOption1.yAxis.name = '';
             lineOption1.series[0].data = yeyaArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }

         if (this.echartsBoxgl) {
             let myEcharts1 = echarts.init(this.echartsBoxgl);
              echartsArr.push(myEcharts1);
             lineOption1.title.text = '功率趋势图';
             lineOption1.xAxis.data = timeArr;
             lineOption1.yAxis.name = 'w';
             lineOption1.series[0].data = powerArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }

         if (this.echartsBoxnj) {
             let myEcharts1 = echarts.init(this.echartsBoxnj);
              echartsArr.push(myEcharts1);
             lineOption1.title.text = '扭矩趋势图';
             lineOption1.yAxis.name = 'N·m';
             lineOption1.xAxis.data = timeArr;
             lineOption1.series[0].data = niujuArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }

         if (this.echartsBoxzs) {
             let myEcharts1 = echarts.init(this.echartsBoxzs);
              echartsArr.push(myEcharts1);
             lineOption1.title.text = '转速趋势图';
             lineOption1.yAxis.name = 'r';
             lineOption1.xAxis.data = timeArr;
             lineOption1.series[0].data = speedArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }
    }



    getSingle = (recordIdList) => {
        singleTotalArr = [];
        let params = {
            recordIdList
        }
        service.findFrequencyListByList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                   let data = res.ret || [];
                   for(let i = 0;i<data.length;i++){
                        let frequencyDtoList = [];
                        let receiverId = '';
                        let receiverName = '';
                        for(let j = 0;j<data[i].dtoList.length;j++){
                            let temp = data[i].dtoList[j];
                            frequencyDtoList = temp.standardDataDto.frequencyDtoList || [];
                            receiverId = temp.receiverId;
                            receiverName = temp.receiverName;
                                singleTotalArr.push({
                                    detectTime: data[i].time,
                                    frequencyList: frequencyDtoList,
                                    receiverId,
                                    receiverName,
                                })

                        }
                    
                   }
                    // 获得标准曲线
                    this.getAvgData()
            
            } else {
                message.error(res.err);
            }
        })
       
    }
    getAvgData = ()=>{
        this.setState({
            standardLineVisible:true,
        })
        const {detailDtoList} = this.state;
         let params = {
            detailDtoList,
            tenantId,
        }
        service.getAvgData(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                  this.setState({
                      avgList: res.ret
                  })
                    this.dealStandardLine(res.ret)
                }
            } else {
                message.error(res.err);
            }
        })
    }
    dealAvgList = (receiverId) => {
        const {avgList} = this.state;
        let detailDtoList = [];
        let avgListSingle = [];
        for(let i = 0;i<avgList.length;i++){
            if(receiverId == avgList[i].receiverId){
                detailDtoList = avgList[i].detailDtoList;
                for (let j = 0; j < detailDtoList.length; j++) {
                    let temp = detailDtoList[j];
                    avgListSingle.push({
                        frequency: Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0),
                        db: temp.db.toFixed(2),
                        density: Number(temp.density.toFixed(3))
                    })
                }
            }
        }
        this.setState({
            avgListSingle
        })
    }
    // 处理最终echarts图的展示
    dealStandardLine = (res)=>{
        this.disposeEcharts();
        let Xrr = [];
        // 各条记录的数据
         for (let i = 0; i < singleTotalArr.length; i++) {
            let xArr = [];
            let densityArr = [];
            let dbArr = [];
            for(let j = 0;j<singleTotalArr[i].frequencyList.length;j++){
                let temp = singleTotalArr[i].frequencyList[j];
                xArr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                densityArr.push(Number(temp.density.toFixed(3)));
                if (temp.db == 0) {
                    dbArr.push(undefined);
                } else {
                    dbArr.push(temp.db.toFixed(2));
                }
            }
            singleTotalArr[i] = {
                ...singleTotalArr[i],
                xArr,
                dbArr,
                densityArr
            }
             
         }
        //  标准曲线的数据
        let standArr = [];
         let standardfrequencyList = [];

       for(let k = 0;k<res.length;k++){
            let densityArr = [];
            let dbArr = [];
           Xrr = [];
            for(let i = 0;i<res[k].detailDtoList.length;i++){
                let temp = res[k].detailDtoList[i];
                Xrr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                densityArr.push(Number(temp.density.toFixed(3)));
                if (temp.db == 0) {
                    dbArr.push(undefined);
                } else {
                    dbArr.push(temp.db.toFixed(2));
                }
                
            }
            standArr.push({
                receiverId:res[k].receiverId,
                densityArr,
                dbArr
            })
            standardfrequencyList = standardfrequencyList.concat(res[k].detailDtoList)
        }
        let standarr1 = [];
        let standarr2 = [];
        let standarr3 = [];
        let standarr4 = [];
        let standarr5 = [];
        let standarr6 = [];
        for(let j = 0;j<standArr.length;j++){
            if(j == 0){
                standarr1.push({
                    name: '平均能量曲线',
                    type:"line",
                    data: standArr[j].dbArr
                })
                standarr4.push({
                    name: '平均密度曲线',
                    type:"line",
                    data: standArr[j].densityArr
                })
            }
            if(j == 1){
                standarr2.push({
                    name: '平均能量曲线',
                    type:"line",
                    data: standArr[j].dbArr
                })
                standarr5.push({
                    name: '平均密度曲线',
                    type:"line",
                    data: standArr[j].densityArr
                })
            }
            if(j == 2){
                standarr3.push({
                    name: '平均能量曲线',
                    type:"line",
                    data: standArr[j].dbArr
                })
                standarr6.push({
                    name: '平均密度曲线',
                    type:"line",
                    data: standArr[j].densityArr
                })
            }
          
        }

        this.setState({
            standardfrequencyList
        })

        let arr1 = [];
        let arr2  = [];
        let arr3 = [];
        let arr4 = [];
        let arr5  = [];
        let arr6 = [];
        let receiverName1 = '';
        let receiverName2 = '';
        let receiverName3 = '';
            for(let j = 0;j<singleTotalArr.length;j++){
                receiverName1 = singleTotalArr[0].receiverName;
                receiverName2 = singleTotalArr[1].receiverName;
                receiverName3 = singleTotalArr[2].receiverName;
                if(standArr[0].receiverId == singleTotalArr[j].receiverId){
                    arr1.push({
                            name: moment(singleTotalArr[j].detectTime).format('YYYY-MM-DD HH:mm:ss'),
                            type:"line",
                            receiverName:singleTotalArr[j].receiverName,
                            data: singleTotalArr[j].dbArr
                    })
                    arr4.push({
                        name: moment(singleTotalArr[j].detectTime).format('YYYY-MM-DD HH:mm:ss'),
                        type:"line",
                        receiverName:singleTotalArr[j].receiverName,
                        data: singleTotalArr[j].densityArr
                    })
                }
                if(standArr[1].receiverId == singleTotalArr[j].receiverId){
                    arr2.push({
                            name: moment(singleTotalArr[j].detectTime).format('YYYY-MM-DD HH:mm:ss'),
                            type:"line",
                            receiverName:singleTotalArr[j].receiverName,
                            data: singleTotalArr[j].dbArr
                    })
                    arr5.push({
                        name: moment(singleTotalArr[j].detectTime).format('YYYY-MM-DD HH:mm:ss'),
                        type:"line",
                        receiverName:singleTotalArr[j].receiverName,
                        data: singleTotalArr[j].densityArr
                })
                }
                if(standArr[2].receiverId == singleTotalArr[j].receiverId){
                    arr3.push({
                            name: moment(singleTotalArr[j].detectTime).format('YYYY-MM-DD HH:mm:ss'),
                            type:"line",
                            receiverName:singleTotalArr[j].receiverName,
                            data: singleTotalArr[j].dbArr
                    })
                    arr6.push({
                        name: moment(singleTotalArr[j].detectTime).format('YYYY-MM-DD HH:mm:ss'),
                        type:"line",
                        receiverName:singleTotalArr[j].receiverName,
                        data: singleTotalArr[j].densityArr
                })
                }
            }
      
        let finallydbArr1 = standarr1.concat(arr1);
        let finallydensityArr1 = standarr4.concat(arr4);
        let finallydbArr2 = standarr2.concat(arr2);
        let finallydensityArr2 = standarr5.concat(arr5);
        let finallydbArr3 = standarr3.concat(arr3);
        let finallydensityArr3 = standarr6.concat(arr6);
        if (this.echartsBoxDb1) {
            let myEcharts = echarts.init(this.echartsBoxDb1);
             echartsArr.push(myEcharts);
            if (myEcharts) {
                let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                optionDb.title.text = receiverName1 + '能量曲线图'; 
                optionDb.xAxis[0].data = Xrr || [];
                optionDb.series = finallydbArr1 || [];
                myEcharts.setOption(optionDb)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }
        if (this.echartsBoxDb2) {
               let myEcharts = echarts.init(this.echartsBoxDb2);
               echartsArr.push(myEcharts);
            if (myEcharts) {
                let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                optionDb.title.text = receiverName2 + '能量曲线图'; 
                optionDb.xAxis[0].data = Xrr || [];
                optionDb.series = finallydbArr2 || [];
                myEcharts.setOption(optionDb)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }
        if (this.echartsBoxDb3) {
                let myEcharts = echarts.init(this.echartsBoxDb3);
                 echartsArr.push(myEcharts);
            if (myEcharts) {
                let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                optionDb.title.text = receiverName3 + '能量曲线图'; 
                optionDb.xAxis[0].data = Xrr || [];
                optionDb.series = finallydbArr3 || [];
                myEcharts.setOption(optionDb)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }

        if (this.echartsBoxDensity1) {
               let myEcharts = echarts.init(this.echartsBoxDensity1);
                echartsArr.push(myEcharts);
            if (myEcharts) {
                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                optionDensity.title.text = receiverName1 + '密度曲线图'; 
                optionDensity.xAxis[0].data = Xrr || [];
                optionDensity.series = finallydensityArr1 || [];
                myEcharts.setOption(optionDensity)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }

        if (this.echartsBoxDensity2) {
            let myEcharts = echarts.init(this.echartsBoxDensity2);
             echartsArr.push(myEcharts);
            if (myEcharts) {
                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                optionDensity.title.text = receiverName2 + '密度曲线图'; 
                optionDensity.xAxis[0].data = Xrr || [];
                optionDensity.series = finallydensityArr2 || [];
                myEcharts.setOption(optionDensity)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }

        if (this.echartsBoxDensity3) {
               let myEcharts = echarts.init(this.echartsBoxDensity3);
                echartsArr.push(myEcharts);
            if (myEcharts) {
                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                optionDensity.title.text = receiverName3 + '密度曲线图'; 
                optionDensity.xAxis[0].data = Xrr || [];
                optionDensity.series = finallydensityArr3 || [];
                myEcharts.setOption(optionDensity)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }
        // 处理六个图
        this.dealSix();
    }
    // 保存
    saveStandardLine = ()=>{
        const {detailDtoList,db,density,name,standardfrequencyList,
            densityFilter,machineId} = this.state;
        if (name == '' || db == '' || density == '' || densityFilter == '') {
            message.error('请检查输入框内容是否填写完整！')
            return false
        }
        let params = {
            detailDtoList,
            tenantId,
            db,
            density,
            densityFilter,
            name,
            frequencyDtoList:standardfrequencyList,
            deviceDataList,
            machineId
        }
        service.saveStandardLine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('保存成功')
                this.setState({
                    standardLineVisible:false,
                    selectedRowKeys:[],
                    standardfrequencyList:[]
                })
                this.disposeEcharts();
            } else {
                message.error(res.err);
            }
        })
    }
    handleOk = (e) => {
        this.setState({
            machineVisible: false,
            singleDataVisible:false,
            standardLineVisible:false
        })
    }
    handleCancel = (e) => {
        this.setState({
            machineVisible: false,
            singleDataVisible:false,
            standardLineVisible:false
        })
    }

    chooseMachine =(e)=> {
        const {machineList} = this.state;
        for(let i = 0;i<machineList.length;i++){
            if(machineList[i].id == e){
                this.setState({
                    machineId:e
                })
            }
        }
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    // 查看某条记录的频率数据图
    lookData=(record,index)=>{
        // filePath = record.filePath;
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
                    this.setState({
                        receiverList:res.ret || []
                    })
                    let data = res.ret || [];
                    let resultArr = [];
                    for(let i = 0;i<data.length;i++){
                        resultArr.push({
                            receiverName:data[i].receiverName,
                            receiverId:data[i].receiverId,
                            frequencyDtoList:data[i].standardDataDto.frequencyDtoList
                        })
                    }
                    
                    for(let i = 0;i<resultArr.length;i++){
                        let xArr = [];
                        let densityArr = [];
                        let dbArr = [];
                        for(let j = 0;j<resultArr[i].frequencyDtoList.length;j++){
                            let temp = resultArr[i].frequencyDtoList[j];
                            xArr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                            densityArr.push(Number(temp.density.toFixed(3)));
                            if (temp.db == 0) {
                                dbArr.push(undefined);
                            } else {
                                dbArr.push(temp.db.toFixed(2));
                            }
                        }
                        this.lookEcharts(resultArr[i].receiverId,resultArr[i].receiverName,xArr,dbArr,densityArr,)
                        
                    }
                    
                }
           
            } else {
                message.error(res.err);
            }
        })
    }
    lookEcharts = (receiverId,receiverName,xArr,dbArr,densityArr)=>{
        let myEcharts = echarts.init(document.getElementById(receiverId));
        echartsArr.push(myEcharts);
        let option = JSON.parse(JSON.stringify(echartsOption.optionSingle));
        option.title.text = receiverName + '能量密度曲线';
        option.xAxis[0].data =  xArr;
        option.series[0].data = dbArr;
        option.series[1].data = densityArr;
        myEcharts.setOption(option)
        myEcharts.on('finished', () => {
            myEcharts.resize()
        })
    }
    exportFile  = (record)=>{
        message.success('正在下载中...请稍后')
        let params = {
            recordId:record.id
        }
        service.exportFile(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    window.location.href = res.ret;
                }
            } else {
                message.error(res.err);
            }
        })
    }
    render(){
        const tableStyle = {
            bordered: true,
            loading: false,
            pagination: true,
            size: 'default',
            // rowSelection: {},
            scroll: undefined,
        }
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
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
                title: '检测台',
                dataIndex: 'platformName',
            },
            {
                title: '温度(℃)',
                dataIndex: 'temperature',
            },
            {
                title: '转速(r)',
                dataIndex: 'rotateSpeed',
            },
            {
                title: '扭矩(N·m)',
                dataIndex: 'torque',
            },
            // {
            //     title: '液压(MPa)',
            //     dataIndex: 'hydraulic',
            // },
            {
                title: '车号',
                dataIndex: 'hydraulic',
            },
            {
                title: '功率(w)',
                dataIndex: 'power',
            },
            {
                title: '振动(mm/s)',
                dataIndex: 'vibration',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.lookData(record,index)}> 查看曲线图 </Button>
                    < Button onClick={()=>this.exportFile(record)} style={{marginLeft:'10px'}}> 导出报告 </Button>
                    </span>
                ),
            }
        ];
         const columns1 = [
            {
                title: '频率(Hz)',
                dataIndex: 'frequency',
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
        const { loading, selectedRowKeys ,} = this.state;
        const rowSelection = {
            preserveSelectedRowKeys: true,
            selectedRowKeys,
            onChange: this.onItemChange,
            onSelect: this.onSelectChange,
            onSelectAll: this.onSelectAll,
        };

        const {
            machineList,
            historyList,
            db,
            density,
            name,
            densityFilter,
            receiverList,
            total ,
        } = this.state;
    return (
            <div className={styles.body}>
                <div style={{marginBottom:"10px"}}>
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
                    <Select placeholder="请选择机型" style={{margin:"0 10px",width:'200px'}} onChange={this.chooseMachine.bind(this)} >
                        {
                            (machineList || []).map((item,index)=>{
                                return (
                                      <Option value ={item.id} key={index}> {item.name} </Option>
                                )
                            })
                        }
                    </Select>
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList(1)}> 查询 </Button>
                </div>
                <Table {...tableStyle} style={{width:'98%'}} pagination={false} preserveSelectedRowKeys={true} rowSelection={rowSelection} rowKey='id' columns={columns} dataSource={historyList} />
                <Pagination onChange={this.pageOnChange} showTotal={this.showTotal.bind(this)}   total={total} style={{margin:'20px 0',textAlign:"center"}}/>
                {/* 能量密度 */}
               <div className={styles.frequencyWidth}>
                    <div className={styles.frequencyWidthTitle}>能量、密度平均曲线</div>
                    <div className={styles.standStoreFlexsg}>
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDb1 = c
                                }
                            } 
                              style = {
                                    {
                                        width: '49%',
                                        height: '200px',
                                    }
                                }
                        /> 
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDensity1 = c
                                }
                            }
                              style = {
                                  {
                                      width: '49%',
                                      height: '200px',
                                  }
                              }
                        /> 
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDb2 = c
                                }
                            } 
                              style = {
                                  {
                                      width: '49%',
                                      height: '200px',
                                  }
                              }
                        /> 
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDensity2 = c
                                }
                            }
                              style = {
                                  {
                                      width: '49%',
                                      height: '200px',
                                  }
                              }
                        /> 

                            <div ref = {
                                (c) => {
                                    this.echartsBoxDb3 = c
                                }
                            } 
                              style = {
                                  {
                                      width: '49%',
                                      height: '200px',
                                  }
                              }
                        /> 
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDensity3 = c
                                }
                            }
                              style = {
                                  {
                                      width: '49%',
                                      height: '200px',
                                  }
                              }
                        />
                    </div>
                </div> 


            <div style={{width:'98%',}}>
                <Input addonBefore="平均曲线名称："  style={{width:'200px',marginLeft:10}} value={name} name='name'
                onChange={this.inputChange.bind(this)} />
                <Input addonBefore="能量偏移值大于(db)：" style={{width:'200px',marginLeft:10}} value={db} name='db'
                onChange={this.inputChange.bind(this)} />
                <Input addonBefore="密度偏移值大于(%)：" style={{width:'200px',marginLeft:10}} value={density} name='density'
                onChange={this.inputChange.bind(this)} />
                <Input addonBefore="可忽略密度偏移值小于(%)：" style={{width:'200px',marginLeft:10}} value={densityFilter} name='densityFilter'
                onChange={this.inputChange.bind(this)} />
                    <Button type='primary' style={{marginLeft:10}} onClick={()=>{
                    this.setState({
                        TableVisible:true
                    })
                }}>列表形式查看平均曲线</Button>
            
                (说明：预警值为红色)
            </div>

                <div className={styles.lineFlex}>
                    <div ref = {
                            (c) => {
                                this.echartsBoxzd = c
                            }
                        }
                        style = {
                            {
                                width: '32%',
                                height: '300px',
                            }
                        }/> 
                        <div ref = {
                            (c) => {
                                this.echartsBoxhw = c
                            }
                        }
                        style = {
                            {
                                width: '32%',
                                height: '300px',
                            }
                        }/> 
                        <div ref = {
                            (c) => {
                                this.echartsBoxyy = c
                            }
                        }
                        style = {
                            {
                                width: '32%',
                                height: '300px',
                            }
                        }/> 
                        <div ref = {
                            (c) => {
                                this.echartsBoxgl = c
                            }
                        }
                        style = {
                            {
                                width: '32%',
                                height: '300px',
                            }
                        }/> 
                        <div ref = {
                            (c) => {
                                this.echartsBoxnj = c
                            }
                        }
                        style = {
                            {
                                width: '32%',
                                height: '300px',
                            }
                        }/> 
                        <div ref = {
                            (c) => {
                                this.echartsBoxzs = c
                            }
                        }
                        style = {
                            {
                                width: '32%',
                                height: '300px',
                            }
                        }/> 
                </div> 
      
                 {
                    this.state.standardLineVisible ?  <div className={styles.standStoreTableFlex}>
                        <div style={{width:'90%'}}></div>
                        <Button  style={{backgroundColor:'green',color:'white',margin:'0 auto'}} onClick={()=>this.saveStandardLine()}>保存</Button>
                    </div> : ''
                }
             
                {/* 频率曲线图 */}
                < Modal title = "数据详情" 
                    visible = {this.state.singleDataVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                        {/* <div className={styles.ZCAudioStyle}>
                            <audio  src={filePath} controls></audio>
                        </div> */}
                        {
                            (receiverList || []).map((item)=>{
                                return (
                                    <div id={item.receiverId}  style = {
                                        {
                                            width: '100%',
                                            height: '200px',
                                        }
                                    }></div>
                                )
                            })
                        }
                         
                </Modal>

                {/* 标准库曲线 */}
                < Modal title = "平均曲线列表数据"
                    visible = {this.state.TableVisible}
                    onOk = {()=>{this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                    {
                        (this.state.avgList || []).map((item,index)=>{
                            return (
                                <Button style={{marginRight:'10px',marginBottom:'10px'}} onClick={()=>this.dealAvgList(item.receiverId)} key={index}>{item.receiverName}</Button>
                            )
                        })
                    }
                    <Table {...tableStyle}  columns={columns1} dataSource={this.state.avgListSingle} />
                    
                </Modal>
            </div>
        )
    }
}

export default standardStore;
