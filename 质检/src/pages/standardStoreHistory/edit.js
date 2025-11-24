
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap, Iframe } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Tabs,Switch } from 'antd';

import {service} from './service';
import styles from './standardStoreHistory.less';
import Frequency from '@src/pages/acomponents/bzFrequency';
import Freq from '@src/pages/acomponents/bzFreq';
import BzLineFreq from '@src/pages/acomponents/bzLineFreq';
import Cycle from '@src/pages/acomponents/bzCycle';
import Deviation from '@src/pages/acomponents/bzDeviation';
import Sudden from '@src/pages/acomponents/bzSudden';
import Partition from '@src/pages/acomponents/bzPartition';
import CycleManage from '@src/pages/acomponents/cycleManage';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'standardStoreHistory';
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

 let XARR = [];
 let finallydbArr = [];
 let finallydensityArr = [];

 let dbMaxAll = [];
 let dbMinAll = [];
 let densityMaxAll = [];
 let densityMinAll = [];

 let CompareDbUp = [];
 let CompareDbDown = [];
 let CompareDbLowUp = [];
 let CompareDbLowDown = [];
 let CompareDensityUp = [];
 let CompareDensityDown = [];
 let CompareDensityLowUp = [];
 let CompareDensityLowDown = [];

    let LineDbUP = [];
    let LineDbDown = [];
    let LineDbLowUP = [];
    let LineDbLowDown = [];
    let LineDensityUP = [];
    let LineDensityDown = [];
    let LineDensityLowUP = [];
    let LineDensityLowDown = [];

 let echartsClickData = [];

 let filePath  = '';
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
            frequencyList:[],
            detailDtoList:[],//选定记录列表
            machineNo:'',
            Visible:true,
            selectedList:[],
            selectedRowKeysCycle:[],
            selectedRowKeysHistory:[],
            precision:"",
            name:"",
            standardfrequencyList:[],
             multiFreqStandardGroupDtoList: [],
             multiAbsFreqStandardGroupDtoList:[],
            standardCycleList:[],
            avgCycle: 0,
            avgDb: 0,
            avgDegree: 0,
            avgFrequency: 0,
            cycleList:[],
            deviation:"",
            qualityList:[],
            standardCycleDtoList:[], 
            standardDeviationGroupDtoList:[], 
            standardPartitionDtoList:[],
            standardFrequencyDtoList:[],
            deviationList:[],
            singleFreq1:"",
            singleFreq2:"",
            minDb:"",
            minDensity:"",
            milSeconds:"",
            suddenInfo:{},
            AvgLineShow:false,
            partCompareList: [],
            partCompareVisible: false,
            code:"",
            fullScreenVisible:false,
            selectedRows:[],
            selectedRowsHistory:[],
            switchAllShow: false,
            allCaculteData: [], //选择自动包络线的数据
            allCaculteDataChecked: [], //弹窗中另外选择的
            sameGroupDtoList:[],
            qualityId:""
        }
    }
    componentDidMount(){
        const {standardStoreHistory} = this.props;
        const {machineList,pointList,qualityList,deviationList } = standardStoreHistory;
        this.setState({
            machineList,
            pointList,
            qualityList,
            deviationList
        })
        this.getList()
    }
    componentWillReceiveProps(newProps) {
        const {standardStoreHistory} = {...newProps};
        const {machineList,pointList,qualityList,deviationList } = standardStoreHistory;
        this.setState({
            machineList,
            pointList,
            qualityList,
            deviationList
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
    // 根据id查询记录
    findListByIdList = (detailDtoList, receiverId) => {
        let idList = []
        for(let i = 0;i<detailDtoList.length;i++){
            idList.push(detailDtoList[i].recordId)
        }
        let newdetailDtoList = [...detailDtoList];
        for (let i = 0; i < newdetailDtoList.length; i++) {
            if (newdetailDtoList[i].receiverId) {} else {
                newdetailDtoList[i] = {
                    ...newdetailDtoList[i],
                    receiverId: receiverId
                }
            }
        }
        let params = {
            detailDtoList: newdetailDtoList,
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
                        selectedRowKeys,
                        selectedRows:arr || [],
                    },()=>{
                        this.dealSelectedData()
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }

    getList = () => {
        let params = {
            id:this.props.id
        }
        if(this.props.weidu == 0){
            // 标准曲线
              service.findStandardFrequency(VtxUtil.handleTrim(params)).then(res => {
                  if (res.rc == 0) {
                      if (res.ret) {
                        this.dealRes(res);
                      }
                  } else {
                      message.error(res.err);
                  }
              })
        }
        if (this.props.weidu == 1) {
            // 标准周期
              service.findStandardCycle(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.dealRes(res);
                }
            } else {
                message.error(res.err);
            }
        })
        }
        if (this.props.weidu == 2) {
            // 标准声音
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
            // 突发声音
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
            // 分区声音
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
        if (this.props.weidu == 5) {
            // 点位周期声音声音
            service.findStandardPointCycle(VtxUtil.handleTrim(params)).then(res => {
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
               cycleDtoList,
               name,
               precision,
               frequencyDtoList,
               detailDtoList,
               cycleType,
               machineId,
               receiverId,
               speed,
               machineNo,
               pointId,
               detectorId,
               standardCycleDtoList,
               standardDeviationGroupDtoList,
               standardPartitionDtoList,
               standardFrequencyDtoList,
               multiFreqStandardGroupDtoList, multiAbsFreqStandardGroupDtoList,
                singleFreq1,
                singleFreq2,
                minDb,
                minDensity,
                milSeconds, code, 
                sameGroupDtoList
           } = data;
           this.setState({
                frequencyDtoList,
                name,
                precision,
                detailDtoList,
                standardCycleList: cycleDtoList,
                machineId,
                receiverId,
                speed,
                machineNo,
                pointId,
                detectorId,
                cycleType,
                standardCycleDtoList,
                standardDeviationGroupDtoList,
                standardPartitionDtoList,
                standardFrequencyDtoList,
                multiFreqStandardGroupDtoList, multiAbsFreqStandardGroupDtoList,
                suddenInfo:{
                    name,
                    singleFreq1,
                    singleFreq2,
                    minDb,
                    minDensity,
                    milSeconds,
                },code,
                sameGroupDtoList
           })
           if (detailDtoList && detailDtoList.length != 0) {
                this.findListByIdList(detailDtoList, data.receiverId);
           }
    }
    dealEcharts = () => {
        this.disposeEcharts();
         const {switchAllShow,AvgLineShow} = this.state;
         if (AvgLineShow){
            this.dealLine();
         }
        let that = this;
        // setTimeout(() => {
            that.drawEcharts()
        // }, 500)
    }
    drawEcharts = ()=>{
          const {switchAllShow,AvgLineShow} = this.state;
          let dbMinAllEcharts = [];
          let dbMaxAllEcharts = [];
          let densityMinAllEcharts = [];
          let densityMaxAllEcharts = [];
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
          if (this.props.weidu != 0) {
              avgDbArr = [];
              avgDensityArr = [];
          }
          let that = this;

          setTimeout(() => {
              let endDbArr = [...avgDbArr, ...totaldbArr, ...dbMaxAllEcharts, ...dbMinAllEcharts];
              let endDensityArr = [...avgDensityArr, ...totaldensityArr, ...densityMaxAllEcharts, ...densityMinAllEcharts];

              let QualityDbArr = [...qualityDbArr, ...qualityDbLowArr, ...positiveDbMax, ...positiveDbMin, ...negativeDbMin, ...negativeDbMax, ...CompareDbDown, ...CompareDbUp, ...CompareDbLowDown, ...CompareDbLowUp, ...LineDbDown, ...LineDbUP, ...LineDbLowUP, ...LineDbLowDown];
              let QualityDensityArr = [...qualityDensityArr, ...qualityDensityLowArr, ...positiveDensityMax, ...positiveDensityMin, ...negativeDensityMin, ...negativeDensityMax, ...CompareDensityDown, ...CompareDensityUp, ...CompareDensityLowUp, ...CompareDensityLowDown, ...LineDensityDown, ...LineDensityUP, ...LineDensityLowDown, ...LineDensityLowUP];

              if (that.state.AvgLineShow) {
                  finallydbArr = endDbArr.concat(QualityDbArr);
                  finallydensityArr = endDensityArr.concat(QualityDensityArr);
              } else {
                  finallydbArr = endDbArr;
                  finallydensityArr = endDensityArr;
              }
              if (that.echartsBoxDb) {
                  if (myEchartsDb == null) {
                      myEchartsDb = echarts.init(that.echartsBoxDb);
                  }
                  if (myEchartsDb) {
                      let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                      optionDb.xAxis[0].data = XARR || [];
                      optionDb.series = finallydbArr || [];
                      myEchartsDb.setOption(optionDb);
                      myEchartsDb.on('click', function (params) {
                          if (params.componentType === 'series') {
                              const seriesName = params.seriesName;
                              const dataIndex = params.dataIndex;
                              const seriesIndex = params.seriesIndex;
                              that.echartsClick(dataIndex, params.name, 'db')
                          }
                      });
                    //   myEchartsDb.on('finished', () => {
                    //       if (myEchartsDb) {
                    //           myEchartsDb.resize()
                    //       }

                    //   })
                  }
              }

              if (that.echartsBoxDensity) {
                  if (myEchartsDensity == null) {
                      myEchartsDensity = echarts.init(that.echartsBoxDensity);
                  }
                  if (myEchartsDensity) {
                      let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                      optionDensity.xAxis[0].data = XARR || [];
                      optionDensity.series = finallydensityArr || [];
                      myEchartsDensity.setOption(optionDensity);
                      myEchartsDensity.on('click', function (params) {
                          if (params.componentType === 'series') {
                              const seriesName = params.seriesName;
                              const dataIndex = params.dataIndex;
                              const seriesIndex = params.seriesIndex;
                              that.echartsClick(dataIndex, params.name, 'density')
                          }
                      });
                    //   myEchartsDensity.on('finished', () => {
                    //       if (myEchartsDensity) {
                    //           myEchartsDensity.resize()
                    //       }

                    //   })
                  }
              }

          }, 500);
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
            selectedRowKeys,
            selectedRows
        })
    }
    onSelectChangeHistory = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeysHistory: selectedRowKeys,
            selectedRowsHistory:selectedRows
        })
     }
    onSelectChangeAll = (selectedRowKeys, selectedRows) => {
        this.setState({
            selectedRowKeysAll: selectedRowKeys,
            allCaculteDataChecked: selectedRows,
        })
    }
    // 周期
    onSelectChangeCycle = (selectedRowKeys, selectedRows) => {
        let avgCycle = 0;
        let avgDb = 0;
        let avgFrequency = 0;
        let avgDegree = 0;
        let totalCycle = 0;
        let totalDb = 0;
        let totalFrequency = 0;
        let totalDegree = 0;
        if(selectedRowKeys.length){
            for(let i = 0;i<selectedRows.length;i++){
                totalCycle += Number(selectedRows[i].period);
                totalDb += Number(selectedRows[i].db);
                totalFrequency += Number(selectedRows[i].frequency);
                totalDegree += Number(selectedRows[i].matchDegree);
            }
            let len = selectedRows.length;
            avgCycle = Number(totalCycle/len).toFixed(2);
            avgDb =  Number(totalDb/len).toFixed(2);
            avgFrequency =  Number(totalFrequency/len).toFixed(2);
            avgDegree =  Number(totalDegree/len).toFixed(2);
        }
        this.setState({
            avgCycle,
            avgDb,
            avgDegree,
            avgFrequency,
            selectedRowKeysCycle:selectedRowKeys
        })
      
    }
    deleteCycle = (record,index)=>{
        const {standardCycleList} = this.state;
        let arr = [...standardCycleList];
        arr.splice(index, 1);
        this.setState({
            standardCycleList: arr
        })
    }
    saveCycle = () => {
        const {
            avgCycle,
            avgDb,
            avgDegree,
            avgFrequency,
            standardCycleList
        } = this.state;
        let arr = standardCycleList;
        this.setState({
            loading: true,
        })

        arr.push({
            cycle: avgCycle,
            db: avgDb,
            degree: avgDegree,
            frequency: avgFrequency
        })
        this.setState({
            standardCycleList: arr,
            avgCycle: 0,
            avgDb: 0,
            avgDegree: 0,
            avgFrequency: 0
        })
        setTimeout(() => {
            this.setState({
                selectedRowKeysCycle: [],
                loading: false,
            });
        }, 500);

    }
    lookEcharts = ()=>{
        this.dealSelectedData()
    }
    dealSelectedData = ()=>{
        let detailDtoList = [];
        const {selectedRows,selectedRowsHistory} = this.state;
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
        let cycleList= [];
        let recordIdListArr = [];
        let newdetailDtoList = [];
        const {switchAllShow,allCaculteData,totalChecked,allCaculteDataChecked,detailDtoList,receiverId} = this.state;
        if(switchAllShow){
            let result = this.findDifferentIds(totalChecked, allCaculteData);
            let newArr = result.concat(allCaculteDataChecked);
            for(let i = 0;i<newArr.length;i++){
                recordIdListArr.push(newArr[i].id);
                newdetailDtoList.push({
                    groupId: newArr[i].groupId,
                    recordId: newArr[i].id,
                    receiverId: newArr[i].receiverId,
                })
            }
        }else{
            recordIdListArr = recordIdList;
            newdetailDtoList = detailDtoList;
        }
        for(let i = 0;i<newdetailDtoList.length;i++){
            if (newdetailDtoList[i].receiverId){}else{
                newdetailDtoList[i] = {
                    ...newdetailDtoList[i],
                    receiverId:receiverId
                }
            }
        }   
        // 去重
        let params = {
            detailDtoList:newdetailDtoList,
            recordIdList: this.removeDuplicates(recordIdListArr),
            receiverId
        }
        if (recordIdListArr.length){
            service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                      singleTotalArr = [];
                        let ret = res.ret.responseList || [];
                        let freqs = res.ret.freqs || [];
                        XARR = freqs.map(item => (item.toFixed(0)));

                        for (let i = 0; i < ret.length; i++) {
                            cycleList = cycleList.concat(ret[i].cycleList || []);
                            let dbArray = ret[i].dbArray || [];
                            let densityArray = ret[i].densityArray || [];
                            singleTotalArr.push({
                                detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                                machineNo: ret[i].machineNo || '',
                                densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                                dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(2)))
                            })
                        }
                        this.setState({
                            cycleList
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
 
    methodChange = (e) => {
        this.setState({
            code: e
        })
    }
    // 保存
    saveStandardLine = (type) => {
        const {cycleType,machineId,receiverId,speed,detailDtoList,name,
           precision, standardfrequencyList, machineNo, standardCycleList, multiFreqStandardGroupDtoList, multiAbsFreqStandardGroupDtoList,
            pointId,
            detectorId,
            standardFrequencyDtoList,
            standardCycleDtoList,
            standardDeviationGroupDtoList, suddenInfo, standardPartitionDtoList, code, sameGroupDtoList,
        } = this.state;
        let newdetailDtoList = [...detailDtoList];
        for (let i = 0; i < newdetailDtoList.length; i++) {
            if (newdetailDtoList[i], receiverId) {} else {
                newdetailDtoList[i] = {
                    ...newdetailDtoList[i],
                    receiverId: receiverId
                }
            }
        }
        let params = {
            cycleType,
            detailDtoList: newdetailDtoList,
            machineId,
            receiverId,
            speed,
            tenantId,
            machineNo,
            pointId,
            detectorId,
            id:this.props.id,
        }
        let typeparams = {};
        if(type != 3){
            if (name == '') {
                message.error('请检查输入框内容是否填写完整！')
                return false
            }
        }
        if (type == 0) {
            // if (standardFrequencyDtoList.length == 0){
            //     message.error('请检查品质等级是否设置！！')
            //     return false
            // }
            // let obj = {
     
            // }
            // let ifShow = false;
            // for (var key in obj) {
            //     if (obj.hasOwnProperty(key)) {
            //         // 判断属性值是否为空
            //         if (obj[key] === '' || obj[key] === null) {
            //            ifShow = true;
            //         }
            //     }
            // }
            // if (ifShow) {
            //     if (standardFrequencyDtoList.length == 0) {
            //         message.error('请检查品质等级是否设置！！')
            //         return false;
            //     }
            // } 
            typeparams = {
                name,
                standardFrequencyDtoList,
                 multiFreqStandardGroupDtoList,
                 multiAbsFreqStandardGroupDtoList,
            }
        }
        if (type == 1) {
            if (standardCycleDtoList.length == 0) {
                message.error('请检查品质等级是否设置！！')
                return false
            }
            typeparams = {
                name,
                precision,
                cycleDtoList: standardCycleList,
                standardCycleDtoList
            }
        }

        if (type == 2) {
            if (standardDeviationGroupDtoList.length == 0) {
                message.error('请检查品质等级是否设置！！')
                return false
            }
            typeparams = {
                name,
                standardDeviationGroupDtoList
            }
        }
        if(type == 3){
             typeparams = {
                ...suddenInfo
             }
        }
        if (type == 4) {
            if (standardPartitionDtoList.length == 0) {
                message.error('请检查品质等级是否设置！！')
                return false
            }
            typeparams ={
                name,
                code,
                standardPartitionDtoList
            }
        }
        if (type == 5) {
            if (sameGroupDtoList.length == 0) {
                message.error('请检查是否设置点位周期！！')
                return false
            }
            for (let i = 0; i < sameGroupDtoList.length; i++) {
                let temp = sameGroupDtoList[i];
                if (temp.type == 0) {
                    if (temp.pointDtoList.length == 0) {
                        message.error('多点位不合格周期设置未选择点位！！')
                        return false;
                    }
                }
            }
            typeparams = {
                name,
                sameGroupDtoList
            }
        }
        let mergedObject = Object.assign({}, params, typeparams);

        if(type == 0){
            // 标准曲线
            service.submitFrequency(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('标准曲线声音保存成功')
                    this.handleCancel()
                } else {
                    message.error(res.err);
                }
            })
        }
        if(type==1){
            // 标准周期
            service.submitCycle(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('标准周期声音保存成功')
                   this.handleCancel()
                } else {
                    message.error(res.err);
                }
            })
        }
        if(type == 2){
            // 标准声音
            service.submitDeviation(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('标准声音保存成功')
                     this.handleCancel()
                } else {
                    message.error(res.err);
                }
            })
        }
        if(type == 3){
            // 突发声音
            service.submitSudden(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('突发声音保存成功')
                    this.handleCancel()
                } else {
                    message.error(res.err);
                }
            })
        }
         if(type == 4){
            // 分区声音
            service.submitPartition(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('分区声音保存成功')
                    this.handleCancel()
                } else {
                    message.error(res.err);
                }
            })
        }
        if(type == 5){
            // 点位周期声音
            service.submitPointCycle(VtxUtil.handleTrim(mergedObject)).then(res => {
                if (res.rc == 0) {
                    message.success('点位不合格周期声音保存成功')
                    this.handleCancel()
                } else {
                    message.error(res.err);
                }
            })
        }
    }
    // 查询
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
     // ================================周期结束================================================
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

    // 得到频段的设置值
    getFreqSet = (msg, result) => {
        // console.log(result, '频段')
        this.setState({
            standardFrequencyDtoList: result,
        }, () => {})
    }
    getCycleSet = (msg, result) => {
        // console.log(result, '周期')
        this.setState({
            standardCycleDtoList: result
        }, () => {})
    }
    getDeviationSet = (msg, result) => {
        // console.log(result, '偏离度')
        this.setState({
            standardDeviationGroupDtoList: result
        }, () => {})
    }
    getSuddenSet = (msg, result) => {
        this.setState({
            suddenInfo: {
                ...result
            }
        }, () => {
            this.saveStandardLine(3)
        })
    }
    getPartitionSet = (msg, result) => {
        // console.log(result, '分区声音')
        this.setState({
            standardPartitionDtoList: result
        }, () => {

        })
    }
    // 分区声音比对
    partCompareData = (record,index)=>{
        const {pointId} = this.state;
        this.setState({
            partCompareVisible:true
        })
         let params = {
            recordId:record.id,
            pointId
        }
        service.comparePartition(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.setState({
                        partCompareList: res.ret || [],
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    // 点位周期声音
    getCyclePointSet = (msg, result, resultSingle) => {
        const {pointId} = this.state;
        if (result.length || resultSingle.length) {
            let arr = [{
                detailDtoList: resultSingle,
                pointId,
                type: 1
            }]
            this.setState({
                sameGroupDtoList: result.concat(arr),
            })
        }

    }
    // 获得对比频段的设置
    getCompareSet = (msg, result) => {
        const {AvgLineShow} = this.state;
        this.setState({
            multiFreqStandardGroupDtoList: result,
        }, () => {
            if (AvgLineShow){
                this.dealEcharts()
            }
        })
    }

    // 获得直线频段的设置
    getLineSet = (msg, result) => {
        const {AvgLineShow} = this.state;
        this.setState({
            multiAbsFreqStandardGroupDtoList: result,
        }, () => {
            if (AvgLineShow){
                this.dealEcharts()
            }
        })
    }
    // ===============================预览标准曲线=======================
    switchAllChange = (e) => {
        this.setState({
            switchAllShow: e
        }, () => {
            this.findMaxMinFrequencyList();
        })
    }
    lookAllData = () => {
        this.setState({
            allDataVisible: true
        })
    }
    findMaxMinFrequencyList = ()=>{
        dbMaxAll = [];
        dbMinAll = [];
        densityMaxAll = [];
        densityMinAll = [];
        const {receiverId,selectedRows,selectedRowsHistory} = this.state;
        let recordIdList = [];
        let tempArr = uniqBy(selectedRows.concat(selectedRowsHistory), 'id');
        if (tempArr.length == 0) {
            message.error('请先选择数据')
            return false;
        }
        // console.log(tempArr,'teempArr')
        for (let i = 0; i < tempArr.length; i++) {
            let temp = tempArr[i];
            recordIdList.push(temp.id)
        }
        this.setState({
            allCaculteData: tempArr
        })
  
        let params = {
            receiverId,
            recordIdList
        }
         service.findMaxMinFrequencyList(VtxUtil.handleTrim(params)).then(res => {
             if (res.rc == 0) {
                 if (res.ret) {
                    this.setState({
                        standardfrequencyList: res.ret || [],
                    })
                    let arr = res.ret;
                     dbMaxAll = [];
                     dbMinAll = [];
                     densityMaxAll = [];
                     densityMinAll = [];
                    for(let i = 0;i<arr.length;i++){
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
    // ===============================预览标准曲线结束========================

    // ================================================展示包络线========================
    showAvgLine = (e) => {
        this.setState({
            AvgLineShow: e
        }, () => {
            this.dealEcharts()
        })
    }
    dealLine = () => {
        const {standardFrequencyDtoList,standardfrequencyList, multiFreqStandardGroupDtoList,multiAbsFreqStandardGroupDtoList} = this.state;
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

        CompareDbUp = [];
        CompareDbDown = [];
        CompareDbLowUp = [];
        CompareDbLowDown = [];
        CompareDensityUp = [];
        CompareDensityDown = [];
        CompareDensityLowUp = [];
        CompareDensityLowDown = [];

        LineDbUP = [];
        LineDbDown = [];
        LineDbLowUP = [];
        LineDbLowDown = [];
        LineDensityUP = [];
        LineDensityDown = [];
        LineDensityLowUP = [];
        LineDensityLowDown = [];

        let arr = [...standardFrequencyDtoList];
        if(arr.length){
            for (let i = 0; i < arr.length; i++) {
                let temp = arr[i];
                for (let j = 0; j < temp.detailDtoList.length; j++) {
                    this.dealAvgLine(temp.startFrequency, temp.endFrequency, temp.detailDtoList[j])
                }
                for (let k = 0; k < temp.detailSpecialDtoList.length; k++) {
                    this.dealAvgLineSpecial(temp.startFrequency, temp.endFrequency, temp.detailSpecialDtoList[k])
                }
            }
        }
       
        // 多频段对比
        let tempArr = [...multiFreqStandardGroupDtoList];
        if(tempArr.length){
            for (let i = 0; i < tempArr.length; i++) {
                for (let j = 0; j < tempArr[i].detailDtoList.length; j++) {
                    let temp = tempArr[i].detailDtoList[j];
                    this.dealCompareLine(temp.freq1, temp.freq2, temp.itemDtoList, tempArr[i].qualityName, tempArr[i].color)
                }
            }
        }

        // 直线频段等级设置
        let tempArr1 = [...multiAbsFreqStandardGroupDtoList];
        if (tempArr1.length) {
            for (let i = 0; i < tempArr1.length; i++) {
                for (let j = 0; j < tempArr1[i].detailDtoList.length; j++) {
                    let temp = tempArr1[i].detailDtoList[j];
                     this.dealFreqLine(temp.freq1, temp.freq2, temp.itemDtoList, tempArr1[i].qualityName, tempArr1[i].color)
                }
            }
        }
      
    }

    // 处理特殊品质等级
    dealAvgLineSpecial = (startFrequency, endFrequency, tempObj) => {
            const {standardfrequencyList} = this.state; 
            let k = 0;
            let m= 0;
            let freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
            let freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
            for(let i =0;i<standardfrequencyList.length;i++){
                let temp = standardfrequencyList[i];
                if(freq1 == temp.freq1){
                    k = i;
                }
                if (freq2 == temp.freq2) {
                    m =i;
                }
            }
            let tempStandArr = [...standardfrequencyList];
            
            let name = '';
            let color ='';
            for(let i = 0;i<tempStandArr.length;i++){
                if(k<i && i < m){
                    tempStandArr[i] = {
                        ...tempStandArr[i],
                        dbForwardMinValue: tempObj.dbForwardMinValue ? Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardMinValue) : undefined,
                            dbForwardMaxValue: tempObj.dbForwardMaxValue ? Number(tempStandArr[i].dbMax) + Number(tempObj.dbForwardMaxValue) : undefined,

                            dbReverseMinValue: tempObj.dbReverseMinValue ? Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseMinValue) : undefined,
                            dbReverseMaxValue: tempObj.dbReverseMaxValue ? Number(tempStandArr[i].dbMin) - Number(tempObj.dbReverseMaxValue) : undefined,

                            densityForwardMinValue: tempObj.densityForwardMinValue ? Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardMinValue) : undefined,
                            densityForwardMaxValue: tempObj.densityForwardMaxValue ? Number(tempStandArr[i].densityMax) + Number(tempObj.densityForwardMaxValue) : undefined,

                            densityReverseMinValue: tempObj.densityReverseMinValue ? Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseMinValue) : undefined,
                            densityReverseMaxValue: tempObj.densityReverseMaxValue ? Number(tempStandArr[i].densityMin) - Number(tempObj.densityReverseMaxValue) : undefined,

                        color:tempObj.color,
                        name:tempObj.name
                    }
                    name = tempObj.name;
                    color = tempObj.color;
                }else{
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
                        color:tempObj.color,
                        name:tempObj.name
                    }
                }
        
            }

            positiveDbMin = positiveDbMin.concat(
                [
                    {
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
                    }
                ]
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
        const {standardfrequencyList} = this.state;
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
        let tempStandArr = [...standardfrequencyList];

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

    // 处理多频段对比品质等级
    dealCompareLine = (startFrequency, endFrequency, itemDtoList, qualityName, qualityColor) => {
        let dbUp = '';
        let dbDown = '';
        let dbLowUp = '';
        let dbLowDown = '';
        let densityUp = '';
        let densityDown = '';
        let densityLowUp = '';
        let densityLowDown = '';
        
        let dbUpShow = false;
        let dbDownShow = false;
        let densityUpShow = false;
        let densityDownShow = false;

        for (let i = 0; i < itemDtoList.length; i++) {
            let temp = itemDtoList[i];
            if (temp.type == 0 && temp.numericalRange == 0) {
                // 能量正
                dbUp = temp.max;
                dbDown = temp.min;
                dbUpShow = true;
            }
            if (temp.type == 0 && temp.numericalRange == 1) {
                // 能量负
                dbLowUp = temp.max;
                dbLowDown = temp.min;
                dbDownShow = true;
            }
            if (temp.type == 1 && temp.numericalRange == 0) {
                // 密度正
                densityUp = temp.max;
                densityDown = temp.min;
                densityUpShow = true;
            }
            if (temp.type == 1 && temp.numericalRange == 1) {
                // 密度负
                densityLowUp = temp.max;
                densityLowDown = temp.min;
                densityDownShow = true;
            }
        }
        const {
            standardFrequencyDtoList,
            standardfrequencyList,
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
        let tempStandArr = [...standardfrequencyList];
        let name = '';
        let color = '';
        for (let i = 0; i < tempStandArr.length; i++) {
            if (k < i && i < m) {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbUp: dbUpShow ?  Number(tempStandArr[i].dbMax) + Number(dbUp) : undefined,
                    dbDown: dbUpShow? Number(tempStandArr[i].dbMax) + Number(dbDown) : undefined,
                    dbLowUp: dbDownShow ? Number(tempStandArr[i].dbMin) - Number(dbLowUp) : undefined,
                    dbLowDown: dbDownShow ? Number(tempStandArr[i].dbMin) - Number(dbLowDown) : undefined,
                    densityUp: densityUpShow ? Number(tempStandArr[i].densityMax) + Number(densityUp) : undefined,
                    densityDown: densityUpShow ? Number(tempStandArr[i].densityMax) + Number(densityDown) : undefined,
                    densityLowUp: densityDownShow ? Number(tempStandArr[i].densityMin) - Number(densityLowUp) : undefined,
                    densityLowDown: densityDownShow ? Number(tempStandArr[i].densityMin) - Number(densityLowDown) : undefined,
                    color: qualityColor,
                    name: qualityName
                }
                name = qualityName;
                color = qualityColor;
            } else {
                tempStandArr[i] = {
                    ...tempStandArr[i],
                    dbUp: undefined,
                    dbDown: undefined,
                    dbLowUp: undefined,
                    dbLowDown: undefined,
                    densityUp: undefined,
                    densityDown: undefined,
                    densityLowUp: undefined,
                    densityLowDown: undefined,
                    color: qualityColor,
                    name: qualityName
                }
            }

        }
        CompareDbUp = CompareDbUp.concat(
            [{
                name: name + '--能量正偏离上限(多频段)',
                type: 'line',
                data: (tempStandArr).map(item => item.dbUp || undefined),
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
        CompareDbDown = CompareDbDown.concat(
            [{
                name: name + '--能量正偏离下限(多频段)',
                type: 'line',
                data: (tempStandArr).map(item => item.dbDown || undefined),
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
        CompareDbLowUp = CompareDbLowUp.concat([{
            name: name + '--能量负偏离上限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.dbLowUp || undefined),
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
        CompareDbLowDown = CompareDbLowDown.concat([{
            name: name + '--能量负偏离下限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.dbLowDown || undefined),
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

        CompareDensityUp = CompareDensityUp.concat([{
            name: name + '--密度正偏离上限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityUp || undefined),
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
        CompareDensityDown = CompareDensityDown.concat([{
            name: name + '--密度正偏离下限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityDown || undefined),
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
        CompareDensityLowUp = CompareDensityLowUp.concat([{
            name: name + '--密度负偏离上限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityLowUp || undefined),
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
        CompareDensityLowDown = CompareDensityLowDown.concat([{
            name: name + '--密度负偏离下限(多频段)',
            type: 'line',
            data: (tempStandArr).map(item => item.densityLowDown || undefined),
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

    // 直线频段等级设置
    dealFreqLine = (startFrequency, endFrequency, itemDtoList, qualityName, qualityColor) => {
        const {standardfrequencyList} = this.state;
           let dbUp = '';
           let dbDown = '';
           let dbLowUp = '';
           let dbLowDown = '';
           let densityUp = '';
           let densityDown = '';
           let densityLowUp = '';
           let densityLowDown = '';

           let dbUpShow = false;
           let dbDownShow = false;
           let densityUpShow = false;
           let densityDownShow = false;

           for (let i = 0; i < itemDtoList.length; i++) {
               let temp = itemDtoList[i];
               if (temp.type == 0 && temp.numericalRange == 0) {
                   // 能量正
                   dbUp = temp.max;
                   dbDown = temp.min;
                   dbUpShow = true;
               }
               if (temp.type == 0 && temp.numericalRange == 1) {
                   // 能量负
                   dbLowUp = temp.max;
                   dbLowDown = temp.min;
                   dbDownShow = true;
               }
               if (temp.type == 1 && temp.numericalRange == 0) {
                   // 密度正
                   densityUp = temp.max;
                   densityDown = temp.min;
                   densityUpShow = true;
               }
               if (temp.type == 1 && temp.numericalRange == 1) {
                   // 密度负
                   densityLowUp = temp.max;
                   densityLowDown = temp.min;
                   densityDownShow = true;
               }
           }
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
        let tempStandArr = [...standardfrequencyList];
        let name = '';
        let color = '';
        for (let i = 0; i < tempStandArr.length; i++) {
                if (k < i && i < m) {
                    tempStandArr[i] = {
                        ...tempStandArr[i],
                        dbUp: dbUpShow ?Number(dbUp) : undefined,
                        dbDown: dbUpShow ? Number(dbDown) : undefined,
                        dbLowUp: dbDownShow ? Number(dbLowUp) : undefined,
                        dbLowDown: dbDownShow ? Number(dbLowDown) : undefined,
                        densityUp: densityUpShow ? Number(densityUp) : undefined,
                        densityDown: densityUpShow ? Number(densityDown) : undefined,
                        densityLowUp: densityDownShow ? Number(densityLowUp) : undefined,
                        densityLowDown: densityDownShow ? Number(densityLowDown) : undefined,
                        color: qualityColor,
                        name: qualityName
                    }
                    name = qualityName;
                    color = qualityColor;
                } else {
                    tempStandArr[i] = {
                        ...tempStandArr[i],
                        dbUp: undefined,
                        dbDown: undefined,
                        dbLowUp: undefined,
                        dbLowDown: undefined,
                        densityUp: undefined,
                        densityDown: undefined,
                        densityLowUp: undefined,
                        densityLowDown: undefined,
                        color: qualityColor,
                        name: qualityName
                    }
                }

        }

        LineDbUP = LineDbUP.concat(
              [{
                  name: name + '--能量正偏离上限(直线)',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbUp || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 3,
                      type: 'solid'
                  },
              }]
          )
        LineDbDown = LineDbDown.concat(
              [{
                  name: name + '--能量正偏离下限(直线)',
                  type: 'line',
                  data: (tempStandArr).map(item => item.dbDown || undefined),
                  itemStyle: {
                      borderWidth: 3,
                      borderColor: color,
                      color: color
                  },
                  lineStyle: {
                      color: color,
                      width: 3,
                      type: 'solid'
                  },
              }]
          )
          LineDbLowUP = LineDbLowUP.concat([{
              name: name + '--能量负偏离上限(直线)',
              type: 'line',
              data: (tempStandArr).map(item => item.dbLowUp || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 3,
                  type: 'solid'
              },
          }])
          LineDbLowDown = LineDbLowDown.concat([{
              name: name + '--能量负偏离下限(直线)',
              type: 'line',
              data: (tempStandArr).map(item => item.dbLowDown || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 3,
                  type: 'solid'
              },
          }])

          LineDensityUP = LineDensityUP.concat([{
              name: name + '--密度正偏离上限(直线)',
              type: 'line',
              data: (tempStandArr).map(item => item.densityUp || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 3,
                  type: 'solid'
              },
          }])
          LineDensityDown = LineDensityDown.concat([{
              name: name + '--密度正偏离下限(直线)',
              type: 'line',
              data: (tempStandArr).map(item => item.densityDown || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 3,
                  type: 'solid'
              },
          }])
          LineDensityLowUP= LineDensityLowUP.concat([{
              name: name + '--密度负偏离上限(直线)',
              type: 'line',
              data: (tempStandArr).map(item => item.densityLowUp || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 3,
                  type: 'solid'
              },
          }])
          LineDensityLowDown = LineDensityLowDown.concat([{
              name: name + '--密度负偏离下限(直线)',
              type: 'line',
              data: (tempStandArr).map(item => item.densityLowDown || undefined),
              itemStyle: {
                  borderWidth: 3,
                  borderColor: color,
                  color: color
              },
              lineStyle: {
                  color: color,
                  width: 3,
                  type: 'solid'
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
    // 去重
    findDifferentIds = (arr1, arr2) => {
        // 创建一个新的数组，用于存储不同的元素
        let newArray = [];

        // 遍历第一个数组
        for (let i = 0; i < arr1.length; i++) {
            let isIdExists = false;
            // 遍历第二个数组
            for (let j = 0; j < arr2.length; j++) {
                // 如果找到相同的 id，则设置 isIdExists 为 true
                if (arr1[i].id === arr2[j].id) {
                    isIdExists = true;
                    break;
                }
            }
            // 如果没有找到相同的 id，则将该元素添加到新数组中
            if (!isIdExists) {
                newArray.push(arr1[i]);
            }
        }

        // 遍历第二个数组
        for (let i = 0; i < arr2.length; i++) {
            let isIdExists = false;
            // 遍历第一个数组
            for (let j = 0; j < arr1.length; j++) {
                // 如果找到相同的 id，则设置 isIdExists 为 true
                if (arr2[i].id === arr1[j].id) {
                    isIdExists = true;
                    break;
                }
            }
            // 如果没有找到相同的 id，则将该元素添加到新数组中
            if (!isIdExists) {
                newArray.push(arr2[i]);
            }
        }

        // 返回新数组
        return newArray;
    }
    // ===================================包络线结束==============================
    handleClose = ()=>{
        this.setState({
            partCompareVisible:false,
            fullScreenVisible:false,
            allDataVisible:false,
            clickChartVisible:false
        })
         if (myEchartsFullScreen) {
             myEchartsFullScreen.dispose();
             myEchartsFullScreen = null;
         }
    }
    // 播放声音
    playAudio = (record,index)=>{
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
        this.setState({
        filePath
        })
    }
    render(){
        const tableStyle = {
            bordered: true,
            loading: false,
            pagination: false,
            size: 'default',
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
                       
                    </span>
                ),
            }
        ];
        // < span className = "ant-divider" />
        // < Button onClick={()=>this.partCompareData(record,index)}> 分区声音比对 </Button>
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
        const columnsCycleStandard = [
            {
                title: '周期(ms)',
                dataIndex: 'cycle',
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
                dataIndex: 'degree',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button type='danger' onClick={()=>this.deleteCycle(record,index)}> 删除 </Button>
                    </span>
                ),
            }
        ];
          const columnsPart = [
            {
                title: '开始频率(Hz)',
                dataIndex: 'startCount',
            },
            {
                title: '结束频率(Hz)',
                dataIndex: 'endCount',
            },
            {
                title: 'p',
                dataIndex: 'p',
            },
            {
                title: '度量值',
                dataIndex: 'value',
            },
    
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
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const rowSelectionCycle = {
            selectedRowKeys:selectedRowKeysCycle,
            onChange: this.onSelectChangeCycle,
        };

        const rowSelectionHistory = {
            selectedRowKeys:selectedRowKeysHistory,
            onChange: this.onSelectChangeHistory,
        };
        
        const rowSelectionAll = {
            selectedRowKeys: selectedRowKeysAll,
            hideDefaultSelections: true,
            onChange: this.onSelectChangeAll,
        };
        const {historyList,frequencyList,
             name, selectedList, cycleDtoList,  precision,avgCycle, avgDb,
            avgDegree, deviationList, sameGroupDtoList,
            avgFrequency, cycleList, standardCycleList, standardfrequencyList, qualityList, standardCycleDtoList, standardDeviationGroupDtoList, standardFrequencyDtoList
            ,  partCompareList,
             standardPartitionDtoList, code, allCaculteData, multiFreqStandardGroupDtoList, 
             multiAbsFreqStandardGroupDtoList,filePath,machineNo
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
                        {
                            this.props.weidu !=5  &&
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
                            <Button type='primary' onClick={()=>{
                                    this.lookFullScreen(1)
                                }}>全屏能量曲线</Button>
                                <Button type='primary' style={{marginLeft:10}} onClick={()=>{
                                    this.lookFullScreen(2)
                                }}>全屏密度曲线</Button>
                                 <span style={{color:'red'}}>提示：数据量大时可以通过点击具体频率查看所选数据对应的能量、密度 </span>
                            </div> 
                        }

                    <div className={styles.frequencyWidth}>
                        <Tabs type="card">
                            {
                                this.props.weidu == 0 && <TabPane tab="标准曲线" key="1">
                                  
                                <Input addonBefore="标准曲线名称："  style={{width:'500px'}} value={name} name='name'
                                    onChange={this.inputChange.bind(this)} />
                                    <Switch checkedChildren="预览包络线" unCheckedChildren="关闭包络线" style={{marginLeft:10}} checked={this.state.AvgLineShow} onChange={this.showAvgLine.bind(this)}/>
                                <div className={styles.standStoreFlex1}>
                                    <Frequency qualityList={qualityList} standardfrequencyList={standardfrequencyList || []} standardFrequencyDtoList={standardFrequencyDtoList} parent={this}></Frequency>
                                </div>
                                <div className={styles.standStoreFlex1}>
                                    <Freq qualityList={qualityList} multiFreqStandardGroupDtoList={multiFreqStandardGroupDtoList} parent={this}></Freq>
                                    <BzLineFreq qualityList={qualityList}  multiAbsFreqStandardGroupDtoList={multiAbsFreqStandardGroupDtoList} parent={this}></BzLineFreq>
                                </div>
                              
                                <Button  style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine(0)}><Icon type="save" />保存</Button>
                            </TabPane>
                            }
                            {
                                this.props.weidu == 1 && <TabPane tab="周期声音" key="2">
                                <Input addonBefore="标准周期名称："  style={{width:'500px'}} value={name} name='name'
                                    onChange={this.inputChange.bind(this)} />
                                <Input addonBefore="周期精度(>)："  style={{width:'200px',margin:'0 10px'}}   value={precision} name='precision'
                                    addonAfter='%' onChange={this.inputChange.bind(this)} />
                                <Cycle parent={this} qualityList={qualityList} standardCycleDtoList={standardCycleDtoList || []}></Cycle>
                                <div className={styles.standStoreTableFlex} >
                                    <div style={{width:'48%'}}>
                                        <div style={{fontWeight:600,fontSize:'18px'}}>历史周期库</div>
                                        <div className={styles.cycleTempzc}>
                                            周期(ms):{avgCycle} ,能量(db):{avgDb},频率(Hz):{avgFrequency},稳定度:{avgDegree}
                                            <Button type='primary' loading={loading} onClick={()=>this.saveCycle()}>保存此周期</Button>
                                        </div>

                                        <Table rowSelection={rowSelectionCycle} rowKey='id' columns={columnsCycle} dataSource={cycleList} />
                                    </div>
                                    <div style={{width:'48%'}}>
                                        <div style={{fontWeight:600,fontSize:'18px',marginBottom:'40px'}}>标准周期库</div>
                                        <Table columns={columnsCycleStandard} dataSource={standardCycleList} />
                                    </div>
                                </div>
                                <Button  style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine(1)}><Icon type="save" />保存</Button>
                            </TabPane>
                            }
                            {
                                this.props.weidu == 2 && <TabPane tab="标准声音" key="3">
                                    <Input addonBefore="标准声音名称："  style={{width:'500px'}} value={name} name='name'
                                    onChange={this.inputChange.bind(this)} />
                                    <Deviation parent={this} deviationList={deviationList}  qualityList={qualityList} standardDeviationGroupDtoList={standardDeviationGroupDtoList || []}></Deviation>
                                    <Button  style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine(2)}><Icon type="save" />保存</Button>
                                </TabPane>   
                              
                            }

                            {
                                this.props.weidu == 3 && <TabPane tab="突发声音" key="4">
                                     <Sudden parent={this} suddenInfo={suddenInfo}></Sudden>
                                </TabPane>   
                            }

                            {
                                this.props.weidu == 4 && <TabPane tab="分区声音" key="5">
                                    <Input name='name' addonBefore='分区声音名称' placeholder="请输入名称" value={name} style={{width:'500px'}}
                                        onChange={this.inputChange.bind(this)}/>
                                    <span style={{marginLeft:10}}>度量方法：</span>
                                    <Select placeholder='请选择度量方法' value={code} style={{ width: 200 }}  onChange={this.methodChange.bind(this)}>
                                        <Option value={'exp'} key={'exp'}> exp </Option>
                                    </Select>    
                                    <Partition parent={this} qualityList={qualityList} standardPartitionDtoList={standardPartitionDtoList || []}></Partition>
                                     <Button  style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine(4)}><Icon type="save" />保存</Button>
                                </TabPane>   
                            }
                            {
                                this.props.weidu == 5 && 
                                    <TabPane tab="点位周期声音" key="6">
                                        <Input name='name' addonBefore='周期声音名称' placeholder="请输入名称" value={name} style={{width:'500px'}}
                                            onChange={this.inputChange.bind(this)}/>
                                        <CycleManage parent={this} pointList={this.state.pointList}  sameGroupDtoList={sameGroupDtoList}></CycleManage>
                                        <Button style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine(5)}><Icon type="save" />保存</Button>
                                    </TabPane>
                            }
                        </Tabs>
                    </div>

                    {
                        this.props.weidu != 5 && 
                        <div>
                            <div className={styles.standStoreFlex}>
                                <BtnWrap>
                                    <Button type='primary' style={{backgroundColor:'#F21360',color:'white'}} onClick={()=>this.lookEcharts()}>生 成 曲 线 图</Button>
                                    <Switch checkedChildren="预览所选数据上下限" unCheckedChildren="关闭所选数据上下限" checked={this.state.switchAllShow} onChange={this.switchAllChange.bind(this)}/>
                                    {this.state.switchAllShow && <Button style={{backgroundColor:'green',color:'white',marginLeft:10}} onClick={()=>this.lookAllData()}>查看所选数据</Button>}
                                </BtnWrap>
                                <audio  src={filePath} autoPlay controls style={{width:300,height:30,marginLeft:100}}></audio>
                            </div>
                           

                            <div  style={{fontWeight:600,fontSize:'18px',margin:'5px 0'}}>已选标准频段数据列表:</div>
                    
                            <Table  rowKey={record => record.id}  rowSelection={rowSelection} columns={columns} dataSource={selectedList} />
                
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
                                    selectedRowKeysHistory.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                                }
                            </BtnWrap>
                            <Table rowSelection={rowSelectionHistory} rowKey={record => record.id} columns={columns} dataSource={historyList} />
                        </div>
                    }
                       {/* 分区声音比对 */}
                    < Modal title = "分区声音比对" 
                        visible = {this.state.partCompareVisible}
                        onOk = {()=>{this.handleClose()}}
                        onCancel = {() => {this.handleClose()}}
                        width="80%"
                        >
                        <Table {...tableStyle}  columns={columnsPart} dataSource={partCompareList} />
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
                    
                    
                    {/* 查看选择的数据 */}
                    < Modal title = "生成上下限的数据"
                        visible = {this.state.allDataVisible}
                        onOk = {() => {this.handleClose()}}
                        onCancel = {() => {this.handleClose()}}
                        width="98%"
                        >
                        <Table {...tableStyle} rowSelection={rowSelectionAll} rowKey={record => record.id} columns={columns} dataSource={allCaculteData} />  
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

            </div>
        )
    }
}

export default Edit;
