
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap, Iframe } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Switch } from 'antd';

import {service} from './service';
import styles from './standardStoreHistory.less';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'standardStoreHistory';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { first,uniqBy  } from 'lodash';
 let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
 let singleTotalArr = [];
 let cycleTotalArr = [];

 let freq1Arr = [];
 let freq2Arr = [];

let avgDbArr = [];
let avgDensityArr = [];

 let qualityDbArr = [];
 let qualityDbLowArr = [];
 let qualityDensityArr = [];
 let qualityDensityLowArr = [];

 let positiveDbMin = [];
 let positiveDbMax = [];

 let negativeDbMin = [];
 let negativeDbMax = [];

 let positiveDensityMin = [];
 let positiveDensityMax = [];

 let negativeDensityMin = [];
 let negativeDensityMax = [];

 let myEchartsFullScreen = null;
let XARR = [];
let finallydbArr = [];
let finallydensityArr = [];

 let dbMaxAll = [];
 let dbMinAll = [];
 let densityMaxAll = [];
 let densityMinAll = [];

@connect(({standardStoreHistory}) => ({standardStoreHistory}))
class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            machineList:[],
            pointList:[],
            machineVisible:false,
            cycleType: '',
            endTime: '',
            machineId: '',
            pointId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            startTime: '',
            historyList:[],
            singleDataVisible:false,
            frequencyList:[],
            standardLineVisible:false,
            detailDtoList:[],//选定记录列表
            machineNo:'',
            Visible:true,
            selectedList:[],
            selectedRowKeysHistory:[],
            standardfrequencyList:[],
            cycleList:[],
            standardFrequencyDtoList:[],
            AvgLineShow:false,
            fullScreenVisible:false,
            selectedRowsHistory:[],
            NewstandardfrequencyList:[],
            switchShow:true,
            switchAllShow:true,
        }
    }
    componentDidMount(){
        const {standardStoreHistory} = this.props;
        const {machineList,pointList} = standardStoreHistory;
        this.setState({
            machineList,
            pointList
        })
        this.getList()
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
        if(this.props.weidu == 0){
            service.findStandardFrequency(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    if (res.ret) {
                        this.dealRes(res)
                    }

                } else {
                    message.error(res.err);
                }
            })
        }
         if (this.props.weidu == 1) {
             service.findStandardCycle(VtxUtil.handleTrim(params)).then(res => {
                 if (res.rc == 0) {
                     if (res.ret) {
                         this.dealRes(res)
                     }

                 } else {
                     message.error(res.err);
                 }
             })
         }
          if (this.props.weidu == 2) {
              service.findStandardDeviation(VtxUtil.handleTrim(params)).then(res => {
                  if (res.rc == 0) {
                      if (res.ret) {
                          this.dealRes(res)
                      }

                  } else {
                      message.error(res.err);
                  }
              })
          }
           if (this.props.weidu == 3) {
               service.findStandardSudden(VtxUtil.handleTrim(params)).then(res => {
                   if (res.rc == 0) {
                       if (res.ret) {
                           this.dealRes(res)
                       }

                   } else {
                       message.error(res.err);
                   }
               })
           }
            if (this.props.weidu == 4) {
               service.findStandardPartition(VtxUtil.handleTrim(params)).then(res => {
                   if (res.rc == 0) {
                       if (res.ret) {
                           this.dealRes(res)
                       }

                   } else {
                       message.error(res.err);
                   }
               })
           }


    }
    dealRes = (res)=>{
        let data = res.ret || [];
        const {
            frequencyDtoList,
            detailDtoList,
            cycleType,
            machineId,
            receiverId,
            speed,
            machineNo,
            pointId,
            standardFrequencyDtoList,
            detectorId,
        } = data;
        this.setState({
            frequencyDtoList,
            detailDtoList,
            machineId,
            receiverId,
            speed,
            machineNo,
            pointId,
            detectorId,
            cycleType,
            standardFrequencyDtoList,
        },()=>{
            this.getAvgData();
            this.findMaxMinFrequencyList();
        })
        this.findListByIdList(detailDtoList, data.receiverId, frequencyDtoList);
    
    }

    // 根据id查询记录
    findListByIdList = (detailDtoList, receiverId) => {
        let idList = []
        for(let i = 0;i<detailDtoList.length;i++){
            idList.push(detailDtoList[i].recordId)
        }
        let params = {
            idList,
            receiverId
        }
        service.findListByIdList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let selectedRowKeys = [];
                    for(let i = 0;i<res.ret.length;i++){
                        selectedRowKeys.push(res.ret[i].id)
                    }
                    let arr = [];
                      arr = res.ret.map((item, index) => {
                          return {
                              ...item,
                              index: index + 1
                          }
                      })
                    this.setState({
                        selectedList:arr || [],
                        selectedRows:arr || [],
                        selectedRowKeys,
                    },()=>{
                       this.dealSelectedData()
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
  
    handleCancel = (e) => {
        this.setState({
            Visible: false,
        })
        this.disposeEcharts();
        this.props.parent.getEditClose(this,false)
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
                         let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                         optionDb.xAxis[0].data = XARR || [];
                         optionDb.series = finallydbArr || [];
                         myEchartsFullScreen.setOption(optionDb)
                        //  myEchartsFullScreen.on('finished', () => {
                        //      if (myEchartsFullScreen) {
                        //          myEchartsFullScreen.resize()
                        //      }

                        //  })
                     }
                 }
             } else {
                 // 密度频率曲线
                 if (this.echartsBoxFullScreen) {
                     if (myEchartsFullScreen == null) {
                         myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                     }
                     if (myEchartsFullScreen) {
                         let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                         optionDensity.xAxis[0].data = XARR || [];
                         optionDensity.series = finallydensityArr || [];
                         myEchartsFullScreen.setOption(optionDensity)
                        //  myEchartsFullScreen.on('finished', () => {
                        //      if (myEchartsFullScreen) {
                        //          myEchartsFullScreen.resize()
                        //      }

                        //  })
                     }
                 }
             }
         })

     }

    // 已选定的曲线列表数据
    onSelectChange = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRows,
            selectedRowKeys
        })
    }
    onSelectChangeHistory = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowsHistory:selectedRows,
            selectedRowKeysHistory:selectedRowKeys
        })
    }

    dealSelectedData = ()=>{
        const {selectedRows,selectedRowsHistory} = this.state;
        let tempArr = uniqBy(selectedRows.concat(selectedRowsHistory), 'id');
        // console.log(tempArr,'teempArr')
        let recordIdList = [];
        for (let i = 0; i < tempArr.length; i++) {
            let temp = tempArr[i];
            recordIdList.push(temp.id)
        }
        this.setState({
            totalChecked:tempArr
        },()=>{
            this.getSingle(recordIdList)
        })
    }
   
    getSingle = (recordIdList) => {
        singleTotalArr = [];
        cycleTotalArr= [];

        let recordIdListArr = [];
        const {switchAllShow,totalChecked} = this.state;
        if(switchAllShow){
            for (let i = 0; i < totalChecked.length; i++) {
                recordIdListArr.push(totalChecked[i].id)
            }
        }else{
            recordIdListArr = recordIdList;
        }

        const {receiverId} = this.state;
        let params = {
            recordIdList: recordIdListArr,
            receiverId
        }
        if (recordIdListArr.length) {
            service.findFrequencyListByList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    let ret = res.ret;
                        XARR = [];
                        for (let i = 0; i < ret.length; i++) {
                            let xArr = [];
                            let densityArr = [];
                            let dbArr = [];
                                XARR = [];
                            for (let j = 0; j < ret[i].frequencyDtoList.length; j++) {
                                let temp = ret[i].frequencyDtoList[j];
                                xArr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                                XARR.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                                densityArr.push(Number(temp.density.toFixed(3)));
                                if (temp.db == 0) {
                                    dbArr.push(undefined);
                                } else {
                                    dbArr.push(temp.db.toFixed(2));
                                }

                            }
                            singleTotalArr.push({
                                detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                                frequencyList: ret[i].frequencyDtoList || [],
                                xArr,
                                densityArr,
                                dbArr
                            })
                            cycleTotalArr = cycleTotalArr.concat(ret[i].cycleList)
                        }
                        this.dealEcharts();
                        this.setState({
                            cycleList:cycleTotalArr
                        })
                    
                } else {
                    message.error(res.err);
                }
            })
        }else{
            message.error('当前还未选择任何数据！')
        }
   
    }
    getAvgData = ()=>{
        const {cycleType,machineId,receiverId,speed,detailDtoList,machineNo,pointId,
            detectorId, switchShow
            } = this.state;
         let params = {
            cycleType,
            detailDtoList,
            machineId,
            receiverId,
            speed,
            tenantId,
            machineNo,
            pointId,
            detectorId
        }
        service.getAvgData(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                    if (res.ret) {
                        this.setState({
                            standardfrequencyList: res.ret || []
                        })
                        let data = res.ret;
                        XARR = [];
                        let densityArr = [];
                        let dbArr = [];

                        avgDbArr = [];
                        avgDensityArr = [];
                        for (let i = 0; i < data.length; i++) {
                            XARR.push(Math.sqrt(Number(data[i].freq1) * Number(data[i].freq2)).toFixed(0));
                            densityArr.push(Number(data[i].density.toFixed(3)));
                            if (data[i].db == 0) {
                                dbArr.push(undefined);
                            } else {
                                dbArr.push(data[i].db.toFixed(2));
                            }
                        }

                        avgDbArr = dbArr;
                        avgDensityArr = densityArr;
                    }
           
            } else {
                message.error(res.err);
            }
        })
    }

     dealEcharts = () => {
         this.disposeEcharts();
         let dbMinAllEcharts = [];
         let dbMaxAllEcharts = [];
         let densityMinAllEcharts = [];
         let densityMaxAllEcharts = [];

         let avgDbEcharts = [];
         let avgDensityEcharts = [];
         const {switchAllShow,switchShow} = this.state;
        if (switchShow) {
            avgDbEcharts.push({
                name: '标准能量曲线',
                type: 'line',
                data: avgDbArr
            })
            avgDensityEcharts.push({
                name: '标准密度曲线',
                type: 'line',
                data: avgDensityArr
            })
        } else {
            avgDbEcharts = [];
            avgDensityEcharts = [];
        }
         if (switchAllShow) {
             dbMaxAllEcharts.push({
                 name: '所选数据---上限',
                 type: 'line',
                 data: dbMaxAll,
                 lineStyle: {
                     width: 4,
                     type: 'dotted'
                 },
             })
             dbMinAllEcharts.push({
                 name: '所选数据---下限',
                 type: 'line',
                 data: dbMinAll,
                 lineStyle: {
                     width: 4,
                     type: 'dotted'
                 },
             })
             densityMaxAllEcharts.push({
                 name: '所选数据---上限',
                 type: 'line',
                 data: densityMaxAll,
                 lineStyle: {
                     width: 4,
                     type: 'dotted'
                 },
             })
             densityMinAllEcharts.push({
                 name: '所选数据---下限',
                 type: 'line',
                 data: densityMinAll,
                 lineStyle: {
                     width: 4,
                     type: 'dotted'
                 },
             })
         } else {
             dbMinAllEcharts = [];
             dbMaxAllEcharts = [];
             densityMinAllEcharts = [];
             densityMaxAllEcharts = [];
         }

         let totaldbArr = [];
         let totaldensityArr = [];
         for (let j = 0; j < singleTotalArr.length; j++) {
             totaldbArr.push({
                 name: singleTotalArr[j].detectTime,
                 type: "line",
                 data: singleTotalArr[j].dbArr
             })
             totaldensityArr.push({
                 name: singleTotalArr[j].detectTime,
                 type: "line",
                 data: singleTotalArr[j].densityArr
             })
         }


         finallydbArr = [];
         finallydensityArr = [];

        let endDbArr = [...avgDbEcharts, ...totaldbArr, ...dbMaxAllEcharts, ...dbMinAllEcharts];
        let endDensityArr = [...avgDensityEcharts, ...totaldensityArr, ...densityMaxAllEcharts, ...densityMinAllEcharts];

        let QualityDbArr = [...qualityDbArr, ...qualityDbLowArr, ...positiveDbMax, ...positiveDbMin, ...negativeDbMin, ...negativeDbMax];
        let QualityDensityArr = [...qualityDensityArr, ...qualityDensityLowArr, ...positiveDensityMax, ...positiveDensityMin, ...negativeDensityMin, ...negativeDensityMax];

        if (this.state.AvgLineShow) {
            this.dealLine();
            finallydbArr = endDbArr.concat(QualityDbArr);
            finallydensityArr = endDensityArr.concat(QualityDensityArr);
        } else {
            finallydbArr = endDbArr;
            finallydensityArr = endDensityArr;
        }

         if (this.echartsBoxDb) {
             if (myEchartsDb == null) {
                 myEchartsDb = echarts.init(this.echartsBoxDb);
             }
             if (myEchartsDb) {
                 let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                 optionDb.xAxis[0].data = XARR || [];
                 optionDb.series = finallydbArr || [];
                 myEchartsDb.setOption(optionDb)
                //  myEchartsDb.on('finished', () => {
                //      if (myEchartsDb) {
                //          myEchartsDb.resize()
                //      }

                //  })
             }
         }

         if (this.echartsBoxDensity) {
             if (myEchartsDensity == null) {
                 myEchartsDensity = echarts.init(this.echartsBoxDensity);
             }
             if (myEchartsDensity) {
                 let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                 optionDensity.xAxis[0].data = XARR || [];
                 optionDensity.series = finallydensityArr || [];
                 myEchartsDensity.setOption(optionDensity)
                //  myEchartsDensity.on('finished', () => {
                //      if (myEchartsDensity) {
                //          myEchartsDensity.resize()
                //      }

                //  })
             }
         }


     }
    // 查询
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    // 查询条件结束
    queryMonth = () =>{
        const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,
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
            detectorId
        }
        service.getPointHistory(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret;
                    let arr = []
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
    // 全选，全不选
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
                selectedRowKeysHistory: [],
                selectedRowsHistory: [],
            })
        }
    }

      // ================================================展示包络线========================
      showAvgLine = (e) => {
        this.setState({
            AvgLineShow: e
        }, () => {
            this.dealEcharts()
        })
    }
    switchChange = (e) => {
        this.setState({
            switchShow: e
        }, () => {
            // this.getAvgData();
        })

    }
    switchAllChange = (e) => {
        this.setState({
            switchAllShow: e
        }, () => {
            // this.findMaxMinFrequencyList();
        })
    }
     findMaxMinFrequencyList = () => {
         dbMaxAll = [];
         dbMinAll = [];
         densityMaxAll = [];
         densityMinAll = [];
        
         let recordIdList = [];
         const {detailDtoList,receiverId } = this.state;
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
         let params = {
             receiverId,
             recordIdList
         }
         service.findMaxMinFrequencyList(VtxUtil.handleTrim(params)).then(res => {
             if (res.rc == 0) {
                 if (res.ret) {
                     this.setState({
                         NewstandardfrequencyList: res.ret || [],
                     })
                     let arr = res.ret;
                     for (let i = 0; i < arr.length; i++) {
                         if (arr[i].dbMax == 0) {
                             dbMaxAll.push(undefined);
                         } else {
                             dbMaxAll.push(arr[i].dbMax.toFixed(2));
                         }
                         if (arr[i].dbMin == 0) {
                             dbMinAll.push(undefined);
                         } else {
                             dbMinAll.push(arr[i].dbMin.toFixed(2));
                         }
                         densityMinAll.push(arr[i].densityMin.toFixed(3));
                         densityMaxAll.push(arr[i].densityMax.toFixed(3));
                     }
                 }
             } else {
                 message.error(res.err);
             }
         })

     }
    dealLine = () => {
        const {
            standardFrequencyDtoList,
            standardfrequencyList
        } = this.state;
        if (standardfrequencyList.length) {
            for (let i = 0; i < standardfrequencyList.length; i++) {
                let temp = standardfrequencyList[i];
                freq1Arr.push(temp.freq1);
                freq2Arr.push(temp.freq2);
            }
        }
        qualityDbArr = [];
        qualityDensityArr = [];
        qualityDbLowArr = [];
        qualityDensityLowArr = [];

        positiveDbMin = [];
        positiveDbMax = [];

        negativeDbMin = [];
        negativeDbMax = [];

        positiveDensityMin = [];
        positiveDensityMax = [];

        negativeDensityMin = [];
        negativeDensityMax = [];

        let arr = standardFrequencyDtoList;
        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[i].detailDtoList.length; j++) {
                this.dealAvgLine(arr[i].startFrequency, arr[i].endFrequency, arr[i].detailDtoList[j])
            }
            for (let k = 0; k < arr[i].detailSpecialDtoList.length; k++) {
                this.dealAvgLineSpecial(arr[i].startFrequency, arr[i].endFrequency, arr[i].detailSpecialDtoList[k])
            }
        }
    }

      // 处理特殊品质等级
      dealAvgLineSpecial = (startFrequency, endFrequency, tempObj) => {
          const {
              standardfrequencyList,
              NewstandardfrequencyList
          } = this.state;
          let k = 0;
          let m = 0;
          let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
          let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
          for (let i = 0; i < standardfrequencyList.length; i++) {
              let temp = standardfrequencyList[i];
              if (freq1 == temp.freq1) {
                  k = i;
              }
              if (freq2 == temp.freq2) {
                  m = i;
              }
          }
          // let tempStandArr = standardfrequencyList;
          let tempStandArr = NewstandardfrequencyList;

          let name = '';
          let color = '';
          for (let i = 0; i < tempStandArr.length; i++) {
              if (k < i && i < m) {
                  tempStandArr[i] = {
                      ...tempStandArr[i],
                      dbForwardMinValue: Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardMinValue),
                      dbForwardMaxValue: Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardMaxValue),

                      dbReverseMinValue: Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseMinValue),
                      dbReverseMaxValue: Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseMaxValue),

                      densityForwardMinValue: Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardMinValue),
                      densityForwardMaxValue: Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardMaxValue),

                      densityReverseMinValue: Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseMinValue),
                      densityReverseMaxValue: Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseMaxValue),

                      color: tempObj.color,
                      name: tempObj.name
                  }
                  name = tempObj.name;
                  color = tempObj.color;
              } else {
                  tempStandArr[i] = {
                      ...tempStandArr[i],
                      dbForwardMinValue: undefined,
                      dbForwardMaxValue: undefined,

                      dbReverseMinValue: undefined,
                      dbReverseMaxValue: undefined,

                      densityForwardMinValue: undefined,
                      densityForwardMaxValue: undefined,

                      densityReverseMinValue: undefined,
                      densityReverseMaxValue: undefined,
                      color: tempObj.color,
                      name: tempObj.name
                  }
              }

          }

          positiveDbMin = positiveDbMin.concat(
              [{
                  name: name + '--能量正偏离下限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbForwardMinValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          positiveDbMax = positiveDbMax.concat(
              [{
                  name: name + '--能量正偏离上限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbForwardMaxValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          negativeDbMin = negativeDbMin.concat(
              [{
                  name: name + '--能量负偏离下限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbReverseMinValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          negativeDbMax = negativeDbMax.concat(
              [{
                  name: name + '--能量负偏离上限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbReverseMaxValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          positiveDensityMin = positiveDensityMin.concat(
              [{
                  name: name + '--密度正偏离下限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.densityForwardMinValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          positiveDensityMax = positiveDensityMax.concat(
              [{
                  name: name + '--密度正偏离上限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.densityForwardMaxValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          negativeDensityMin = negativeDensityMin.concat(
              [{
                  name: name + '--密度负偏离下限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.densityReverseMinValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )

          negativeDensityMax = negativeDensityMax.concat(
              [{
                  name: name + '--密度负偏离上限特殊',
                  type: 'line',
                  data: (tempStandArr).map(item => item.densityReverseMaxValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'solid'
                  },
              }]
          )


      }

      dealAvgLine = (startFrequency, endFrequency, tempObj) => {
          const {
              standardfrequencyList,
              NewstandardfrequencyList
          } = this.state;
          let k = 0;
          let m = 0;
          let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
          let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
          for (let i = 0; i < standardfrequencyList.length; i++) {
              let temp = standardfrequencyList[i];
              if (freq1 == temp.freq1) {
                  k = i;
              }
              if (freq2 == temp.freq2) {
                  m = i;
              }
          }
          // let tempStandArr = standardfrequencyList;
          let tempStandArr = NewstandardfrequencyList;

          let name = '';
          let color = '';
          name = tempObj.name;
          color = tempObj.color;
          for (let i = 0; i < tempStandArr.length; i++) {
              if (i >= k && i <= m) {
                  tempStandArr[i] = {
                      ...tempStandArr[i],
                      dbForwardValue: Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardValue),
                      dbReverseValue: Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseValue),
                      densityForwardValue: Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardValue),
                      densityReverseValue: Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseValue),
                      color: tempObj.color,
                      name: tempObj.name
                  }
              } else {
                  tempStandArr[i] = {
                      ...tempStandArr[i],
                      dbForwardValue: undefined,
                      dbReverseValue: undefined,
                      densityForwardValue: undefined,
                      densityReverseValue: undefined,
                      color: tempObj.color,
                      name: tempObj.name
                  }
              }

          }
          qualityDbArr = qualityDbArr.concat(
              [{
                  name: name + '--能量正偏离',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbForwardValue || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 2,
                      type: 'dashed'
                  },
              }]
          )
          qualityDbLowArr = qualityDbLowArr.concat([{
              name: name + '--能量负偏离',
              type: 'line',
              data: (tempStandArr).map(item => item.dbReverseValue || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 2,
                  type: 'dashed'
              },
          }])
          qualityDensityArr = qualityDensityArr.concat([{
              name: name + '--密度正偏离',
              type: 'line',
              data: (tempStandArr).map(item => item.densityForwardValue || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 2,
                  type: 'dashed'
              },
          }])
          qualityDensityLowArr = qualityDensityLowArr.concat([{
              name: name + '--密度负偏离',
              type: 'line',
              data: (tempStandArr).map(item => item.densityReverseValue || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 2,
                  type: 'dashed'
              },
          }])

      }
    findClosestNumberInArray = (target, arr) => {
        // 先对数组进行排序
        arr.sort(function (a, b) {
            return a - b;
        });

        var minDiff = Infinity;
        var closest;

        // 遍历数组，找到与target差值最小的元素
        for (var i = 0; i < arr.length; i++) {
            var diff = Math.abs(arr[i] - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = arr[i];
            }
        }

        return closest;
    }
    // ===================================包络线结束==============================
      handleClose = () => {
          this.setState({
              fullScreenVisible: false,
          })
          if (myEchartsFullScreen) {
              myEchartsFullScreen.dispose();
              myEchartsFullScreen = null;
          }
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
                title: '设备编号',
                dataIndex: 'machineNo',
            },
                {
                title: '备注',
                dataIndex: 'remark',
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
        ];
        const columnsCycle = [
            {
                title: '周期(ms)',
                dataIndex: 'period',
            },
            {
                title: '能量(db)',
                dataIndex: 'db',
            },
            {
                title: '频率(Hz)',
                dataIndex: 'frequency',
            },
            {
                title: '稳定度',
                dataIndex: 'matchDegree',
            },
        ];
        const { loading, selectedRowKeys,selectedRowKeysCycle,selectedRowKeysHistory  } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const rowSelectionHistory = {
            selectedRowKeys:selectedRowKeysHistory,
            onChange: this.onSelectChangeHistory,
        };
        const {historyList,selectedList,cycleList} = this.state;
    return (
            <div>
                < Modal title = "比对" 
                    visible = {this.state.Visible}
                    onOk = {this.handleCancel}
                    onCancel = {this.handleCancel} 
                    width="95%"
                    >
                    <div style={{width:'100%',border:'1px solid green',borderRadius:'10px',padding:'10px 10px'}}>
                        <div className={styles.standStoreFlex}>
                            <div ref = {
                                    (c) => {
                                        this.echartsBoxDb = c
                                    }
                                } 
                                style={{width:this.props.weidu == 0 ? '100%':'50%',height:300}}
                                /> 
                            <div ref = {
                                    (c) => {
                                        this.echartsBoxDensity = c
                                    }
                                }
                                style={{width:this.props.weidu == 0 ? '100%':'50%',height:300}}
                            /> 
                        </div>
                         <Button type='primary' style={{margin:'0 10px'}} onClick={()=>{
                              this.lookFullScreen(1)
                        }}>全屏能量曲线</Button>
                           <Button type='primary' style={{margin:'0 10px'}} onClick={()=>{
                            this.lookFullScreen(2)
                        }}>全屏密度曲线</Button>

                  
                    </div> 
                    <BtnWrap>
                        <Button type='primary' style={{backgroundColor:'#F21360',color:'white'}} onClick={()=>this.dealSelectedData()}>生 成 曲 线 图</Button>
                        {
                            this.props.weidu == 0 && 
                            <Switch checkedChildren="预览包络线" unCheckedChildren="关闭包络线" style={{marginLeft:10}} checked={this.state.AvgLineShow} onChange={this.showAvgLine.bind(this)}/>
                        }
                        <Switch checkedChildren="预览标准曲线" unCheckedChildren="关闭预览标准曲线"  style={{marginLeft:10}} checked={this.state.switchShow} onChange={this.switchChange.bind(this)}/>
                        <Switch checkedChildren="预览所选数据上下限" unCheckedChildren="关闭所选数据上下限"  style={{marginLeft:10}} checked={this.state.switchAllShow} onChange={this.switchAllChange.bind(this)}/>
                    </BtnWrap>
                    <div  style={{fontWeight:600,fontSize:'18px',margin:'5px 0'}}>已选标准频段数据</div>
                    <Table rowKey={record => record.id}  rowSelection={rowSelection} columns={columns} dataSource={selectedList} />
                    <div className={styles.standStoreTableFlex} >
                        <div style={{width:'100%'}}>
                            <div style={{fontWeight:600,fontSize:'18px'}}>历史周期库</div>
                            <Table rowKey={record => record.id}   columns={columnsCycle} dataSource={cycleList} />
                        </div>
                    </div>

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
                        <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.queryMonth()}> 查询 </Button>
                    </div>
                    <BtnWrap>
                        {
                            selectedRowKeysHistory.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                        }
                    </BtnWrap>
                    <Table rowSelection={rowSelectionHistory} rowKey={record => record.id} columns={columns} dataSource={historyList} />
                            
                     
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

                </Modal>

            </div>
        )
    }
}

export default Edit;
