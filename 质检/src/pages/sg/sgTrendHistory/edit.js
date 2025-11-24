
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap, Iframe } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination } from 'antd';

import {service} from './service';
import styles from './standardStoreHistory.less';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'sgTrendHistory';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { first,uniqBy  } from 'lodash';
 let singleTotalArr = [];
 let deviceDataList  = [];
 let totalSelected = [];
 let newtotalSelected = [];
 let finallyTotalSelected = [];
 let echartsArr = [];
let recordIdList = [];
@connect(({sgTrendHistory}) => ({sgTrendHistory}))
class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            endTime: '',
            machineId: '',
            recordId: "",
            startTime: '',
            historyList:[],
            singleDataVisible:false,
            frequencyList:[],
            optionDb:{
                 title: {
                         text: '能量曲线图',
                         left: 'center',
                     },
                     grid: {
                         bottom: 60,
                         left: '25px',
                         right: '50px'
                     },
                     toolbox: {
                         show: false
                     },
                     tooltip: {
                         trigger: 'axis',
                         axisPointer: {
                             type: 'cross',
                             animation: false,
                             label: {
                                 backgroundColor: '#505765'
                             }
                         },
                          hideDelay: 5000
                     },
                     legend: {
                         data: ['能量'],
                         left: 10,
                     },
                     dataZoom: [{
                             show: true,
                             realtime: true,
                             start: 0,
                             end: 100
                         },
                         {
                             type: 'inside',
                             realtime: true,
                             start: 65,
                             end: 85
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
                             formatter: `{value}Hz`
                         },
                         interval: 1,
                         data: []
                     }],
                     yAxis: [{
                            name: '能量(db)',
                            type: 'value',
                            axisLabel: {
                                show: true,
                            },
                            scale: true,
                         },
                     ],
                     series: []
            },
            optionDensity:{

            title: {
                    text: '密度曲线图',
                    left: 'center',
                },
                grid: {
                    bottom: 60,
                    left: '25px',
                    right: '50px'
                },
                toolbox: {
                    show: false
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        animation: false,
                        label: {
                            backgroundColor: '#505765'
                        }
                    },
                     hideDelay: 5000
                },
                legend: {
                    data: ['密度'],
                    left: 10,
                },
                dataZoom: [{
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100
                    },
                    {
                        type: 'inside',
                        realtime: true,
                        start: 65,
                        end: 85
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
                        formatter: `{value}Hz`
                    },
                    interval: 1,
                    data: []
                }],
                yAxis: [{
                        name: '密度(%)',
                        type: 'value',
                        axisLabel: {
                            show: true,

                        },
                        scale: true,

                    },
                ],
                series: []
            },
            standardLineVisible:false,
            detailDtoList:[],//选定记录列表
            db:"",
            density:"",
            densityFilter:'',
            speedList:[],
            Visible:true,
            selectedList:[],
            selectedRowKeysHistory:[],
            name:"",
            bzFrequencyList:[],
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

        }
    }
    componentDidMount(){
        this.getList()
    }
    componentWillReceiveProps(newProps) {
    }
    disposeEcharts = ()=>{
        if (echartsArr.length) {
            for (let i = 0; i < echartsArr.length; i++) {
                echartsArr[i].dispose();
                  echartsArr[i] = null;
            }
            echartsArr = [];
        }
    }   
    getList = () => {
        let params = {
            id:this.props.id
        }
        service.findById(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret || [];
                    const {density,name,db,
                        detailDtoList, 
                        machineId,
                        densityFilter,
                        frequencyDtoList,
                    } = data;
                    this.setState({
                        frequencyDtoList,
                        name,
                        db,
                        density,
                        densityFilter,
                        detailDtoList,
                        machineId,
                    })
                    this.findListByIdList(detailDtoList);
                }
            } else {
                message.error(res.err);
            }
        })
    } 
     // 根据id查询记录
     findListByIdList = (detailDtoList) => {
        let idList = []
        for(let i = 0;i<detailDtoList.length;i++){
            idList.push(detailDtoList[i].recordId)
        }
        let params = {
            idList,
        }
        service.findListByIdList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let selectedRowKeys = [];
                    let detailDtoListArr = [];
                    let arr = [];
                    for(let i = 0;i<res.ret.length;i++){
                        selectedRowKeys.push(i)
                        detailDtoListArr.push({
                            receiverId:res.ret[i].receiverId,
                            detectTime:res.ret[i].detectTime,
                            groupId: res.ret[i].groupId,
                            recordId: res.ret[i].id,
                        })
                    }
                    arr = res.ret.map((item,index)=>{
                        return {
                            ...item,
                            index:index+1,
                        }
                    })
                    totalSelected = [];
                    totalSelected = res.ret;
                    this.setState({
                        selectedList:arr || [],
                        selectedRowKeys,
                        detailDtoList:detailDtoListArr,
                    },()=>{
                        this.dealSelectedData()
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    // 处理标准曲线数据
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
        //  console.log(singleTotalArr,'singleTotalArr')
        //  标准曲线的数据
        // console.log(res,'resss')
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
    //    console.log(Xrr, 'Xrr')
       let standarr1 = [];
       let standarr2 = [];
       let standarr3 = [];
       let standarr4 = [];
       let standarr5 = [];
       let standarr6 = [];
       for(let j = 0;j<standArr.length;j++){
           if(j == 0){
               standarr1.push({
                   name: '标准能量曲线',
                   type:"line",
                   data: standArr[j].dbArr
               })
               standarr4.push({
                   name: '标准密度曲线',
                   type:"line",
                   data: standArr[j].densityArr
               })
           }
           if(j == 1){
               standarr2.push({
                   name: '标准能量曲线',
                   type:"line",
                   data: standArr[j].dbArr
               })
               standarr5.push({
                   name: '标准密度曲线',
                   type:"line",
                   data: standArr[j].densityArr
               })
           }
           if(j == 2){
               standarr3.push({
                   name: '标准能量曲线',
                   type:"line",
                   data: standArr[j].dbArr
               })
               standarr6.push({
                   name: '标准密度曲线',
                   type:"line",
                   data: standArr[j].densityArr
               })
           }
       }

       this.setState({
            bzFrequencyList:standardfrequencyList
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
       // console.log(finallydbArr, 'finallydbArr')
       if (this.echartsBoxDb1) {
            let myEcharts = echarts.init(this.echartsBoxDb1);
            echartsArr.push(myEcharts);
            if (myEcharts) {
               let optionDb = JSON.parse(JSON.stringify(this.state.optionDb));
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
               let optionDb = JSON.parse(JSON.stringify(this.state.optionDb));
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
               let optionDb = JSON.parse(JSON.stringify(this.state.optionDb));
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
               let optionDensity = JSON.parse(JSON.stringify(this.state.optionDensity));
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
               let optionDensity = JSON.parse(JSON.stringify(this.state.optionDensity));
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
               let optionDensity = JSON.parse(JSON.stringify(this.state.optionDensity));
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
         this.dealSix(finallyTotalSelected)
    }
    // 处理6个图
    dealSix = (selectedRows)=>{
        deviceDataList = [];
        const { lineOption} = this.state;
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
        for(let i = 0;i<selectedRows.length;i++){
            timeArr.push(moment(selectedRows[i].detectTime).format('YYYY-MM-DD HH:mm:ss'));
            powerArr.push(selectedRows[i].power);
            heatArr.push(selectedRows[i].temperature);
            vibteArr.push(selectedRows[i].vibration);
            yeyaArr.push(selectedRows[i].hydraulic);
            niujuArr.push(selectedRows[i].torque);
            speedArr.push(selectedRows[i].rotateSpeed);
            // HEAT,VIBTE,HYDRAULIC,TORQUE,POWER,SPEED
            deviceDataList.push(
                {
                    deviceType:"HEAT",
                    deviceData:selectedRows[i].temperature,
                    deviceTime:selectedRows[i].detectTime,
                    recordId:selectedRows[i].id
                },
                {
                    deviceType:"VIBTE",
                    deviceData:selectedRows[i].vibration,
                    deviceTime:selectedRows[i].detectTime,
                    recordId:selectedRows[i].id
                },
                {
                    deviceType:"HYDRAULIC",
                    deviceData:selectedRows[i].hydraulic,
                    deviceTime:selectedRows[i].detectTime,
                    recordId:selectedRows[i].id
                },
                {
                    deviceType:"TORQUE",
                    deviceData:selectedRows[i].torque,
                    deviceTime:selectedRows[i].detectTime,
                    recordId:selectedRows[i].id
                },
                {
                    deviceType:"POWER",
                    deviceData:selectedRows[i].power,
                    deviceTime:selectedRows[i].detectTime,
                    recordId:selectedRows[i].id
                },
                {
                    deviceType:"SPEED",
                    deviceData:selectedRows[i].rotateSpeed,
                    deviceTime:selectedRows[i].detectTime,
                    recordId:selectedRows[i].id
                },
            )
        }

        if(this.echartsBoxhw){
            let myEcharts1 = echarts.init(this.echartsBoxhw);
              echartsArr.push(myEcharts1);
            lineOption1.title.text =  '温度趋势图';
            lineOption1.xAxis.data = timeArr;
            lineOption1.yAxis.name = '℃';
            lineOption1.series[0].data = heatArr;
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }

        if(this.echartsBoxzd){
            let myEcharts1 = echarts.init(this.echartsBoxzd);
               echartsArr.push(myEcharts1);
            lineOption1.title.text =  '振动趋势图';
            lineOption1.xAxis.data = timeArr;
            lineOption1.yAxis.name = 'mm/s';
            lineOption1.series[0].data = vibteArr;
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }

        if(this.echartsBoxyy){
            let myEcharts1 = echarts.init(this.echartsBoxyy);
               echartsArr.push(myEcharts1);
            lineOption1.title.text =  '液压趋势图';
            lineOption1.xAxis.data = timeArr;
            lineOption1.yAxis.name = 'MPa';
            lineOption1.series[0].data = yeyaArr;
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }

        if(this.echartsBoxgl){
            let myEcharts1 = echarts.init(this.echartsBoxgl);
               echartsArr.push(myEcharts1);
            lineOption1.title.text =  '功率趋势图';
            lineOption1.xAxis.data = timeArr;
            lineOption1.yAxis.name = 'w';
            lineOption1.series[0].data = powerArr;
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }

        if(this.echartsBoxnj){
            let myEcharts1 = echarts.init(this.echartsBoxnj);
               echartsArr.push(myEcharts1);
            lineOption1.title.text =  '扭矩趋势图';
            lineOption1.yAxis.name = 'N·m';
            lineOption1.xAxis.data = timeArr;
            lineOption1.series[0].data = niujuArr;
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }

        if(this.echartsBoxzs){
            let myEcharts1 = echarts.init(this.echartsBoxzs);
               echartsArr.push(myEcharts1);
            lineOption1.title.text =  '转速趋势图';
            lineOption1.yAxis.name = 'r';
            lineOption1.xAxis.data = timeArr;
            lineOption1.series[0].data = speedArr;
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }
    }
    dealSelectedData = () => {
        let tempArr = totalSelected.concat(newtotalSelected);
        finallyTotalSelected = [];
        recordIdList = [];
        finallyTotalSelected = uniqBy(tempArr,'id');
        // 去重
          let detailDtoList = []
          for (let i = 0; i < finallyTotalSelected.length; i++) {
              detailDtoList.push({
                  groupId: finallyTotalSelected[i].groupId,
                  recordId: finallyTotalSelected[i].id,
                  detectTime: finallyTotalSelected[i].detectTime,
                  receiverId: finallyTotalSelected[i].receiverId,
              })
              recordIdList.push(finallyTotalSelected[i].id)
          }
        //   if (finallyTotalSelected.length) {
            this.setState({
                detailDtoList
            }, () => {
                this.getSingle(recordIdList);
            });
        //   } else {
        //       message.error('已选标准频段数据至少保留一条！')
        //       return false;
        //   }
    }

    onItemChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeys,
        });
    }
    // 已选定的曲线列表数据
    onSelectChange = (record, selected, selectedRows, nativeEvent) => {
         if (selected) {
             totalSelected.push(record)
         } else {
             const delIndex = totalSelected.findIndex((val) => {
                 return val.id === record.id
             })
             totalSelected.splice(delIndex, 1)
         }
         this.dealSelectedData()
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
        this.dealSelectedData()
    }
    onItemChangeHistory = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeysHistory:selectedRowKeys,
        });
    }
    onSelectChangeHistory = (record, selected, selectedRows, nativeEvent) => {
        if (selected) {
            newtotalSelected.push(record)
        } else {
            const delIndex = newtotalSelected.findIndex((val) => {
                return val.id === record.id
            })
            newtotalSelected.splice(delIndex, 1)
        }
        this.dealSelectedData();
    }
     onSelectAllHistory = (selected, selectedRows, changeRows) => {
      if (selected) {
        newtotalSelected = newtotalSelected.concat(changeRows)
      }
      if (!selected) {
        let selectedRows = JSON.parse(JSON.stringify(newtotalSelected))
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
        newtotalSelected = selectedRows
    
      }
        this.dealSelectedData()
    }
    getSingle = (recordIdList) => {
        singleTotalArr = [];
        let params = {
            recordIdList,
        }
        service.findFrequencyListByList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                 let data = res.ret || [];
                 for (let i = 0; i < data.length; i++) {
                     let frequencyDtoList = [];
                     let receiverId = '';
                     let receiverName = '';
                     for (let j = 0; j < data[i].dtoList.length; j++) {
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
        const {machineId, detailDtoList} = this.state;
         let params = {
            detailDtoList,
            machineId,
            tenantId,
        }
        service.getAvgData(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.dealStandardLine(res.ret)
                }
            } else {
                message.error(res.err);
            }
        })
    }
    // 保存
    saveStandardLine = ()=>{
        const {machineId,db,density,name,
           bzFrequencyList,
           detailDtoList,
            densityFilter,
        } = this.state;
        if(name == '' || db == '' || density == '' || densityFilter == ''){
            message.error('请检查输入框内容是否填写完整！')
            return false
        }
        let params = {
            detailDtoList,
            machineId,
            tenantId,
            db,
            density,
            densityFilter,
            name,
            frequencyDtoList:bzFrequencyList,
            id:this.props.id,
            deviceDataList,
        }
        service.saveStandardLine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('保存成功')
                this.handleCancel();
            } else {
                message.error(res.err);
            }
        })
    }
    // 查询
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    handleCancel = (e) => {
        this.setState({
            Visible: false,
        })
        newtotalSelected = [];
        this.disposeEcharts();
        this.props.parent.getEditClose(this,false)
    }

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    // 查询条件结束
    query = (page) =>{
        const {startTime,endTime,machineId } = this.state;
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
            pageIndex: page-1,
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
                if(res.ret){
                    let data = res.ret;
                    let arr = data.items.map((item,index)=>{
                        return {
                            ...item,
                            index: (page - 1) * 10 + index+1,
                        }
                    })
                    this.setState({
                        historyList:arr,
                        total:data.rowCount
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })

    }

    showTotal=(total)=> {
        return `合计 ${total} 条`;
      }
      pageOnChange = (page)=>{
        this.query(page)
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
            },{
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
            {
                title: '液压(MPa)',
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
        ];
         
        const { loading, selectedRowKeys,selectedRowKeysHistory  } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onItemChange,
            onSelect: this.onSelectChange,
            onSelectAll: this.onSelectAll,
        };
        const rowSelectionHistory = {
            selectedRowKeys:selectedRowKeysHistory,
            onChange: this.onItemChangeHistory,
            onSelect: this.onSelectChangeHistory,
            onSelectAll: this.onSelectAllHistory,
        };
        const {historyList,frequencyList,db,density,densityFilter,
            name,selectedList,total } = this.state;
    return (
            <div>
                < Modal title = "详情" 
                    visible = {this.state.Visible}
                    onOk = {this.saveStandardLine}
                    onCancel = {this.handleCancel} 
                    width="90%"
                    >
                    <div style={{width:'100%',border:'1px solid green',borderRadius:'10px',padding:'10px 10px'}}>
                        <div className={styles.standStoreFlex}>
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
                        <div>
                            <Input addonBefore="标准曲线名称："  style={{width:'200px',margin:'0 10px'}} value={name} name='name'
                                onChange={this.inputChange.bind(this)} />
                            <Input addonBefore="能量偏移值大于(db)：" style={{width:'200px'}} placeholder="请输入能量:" value={db} name='db'
                            onChange={this.inputChange.bind(this)} />
                            <Input addonBefore="密度偏移值大于(%)：" style={{width:'200px',margin:'0 10px'}}  placeholder="请输入密度:" value={density} name='density'
                            onChange={this.inputChange.bind(this)} />
                              <Input addonBefore="可忽略密度偏移值小于(%)：" style={{width:'200px',margin:'0 10px'}} value={densityFilter} name='densityFilter'
                                onChange={this.inputChange.bind(this)} />
                        </div>
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
                            height: '200px',
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
                            height: '200px',
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
                            height: '200px',
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
                            height: '200px',
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
                            height: '200px',
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
                            height: '200px',
                        }
                    }/> 
            </div>
                    {/* <div className={styles.flexEnd}>
                        <Button  style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine()}>保存</Button>
                    </div> */}
                    <div  style={{fontWeight:600,fontSize:'18px',margin:'10px 0'}}>已选数据</div>
                    <Table rowSelection={rowSelection} columns={columns} dataSource={selectedList} />
                    
                    {/* 查询功能 */}
                    <div style={{margin:"10px 0"}}>
                        <RangePicker onChange={this.dateChange.bind(this)} />
                        <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.query(1)}> 查询 </Button>
                    </div>
                    <Table pagination={false} rowSelection={rowSelectionHistory} rowKey='id' columns={columns} dataSource={historyList} />
                    <Pagination onChange={this.pageOnChange} showTotal={this.showTotal.bind(this)}   total={total} style={{margin:'20px 0',textAlign:"right"}}/>
                </Modal>

            </div>
        )
    }
}

export default Edit;
