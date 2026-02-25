
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch ,BackTop,Tabs } from 'antd';

import {service} from './service';
import styles from './standardStore.less';
import SearchPage from '@src/pages/acomponents/compareSearch';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'collectDataCompare';
const { MonthPicker, RangePicker } = DatePicker;
import echartsOption from '@src/pages/acomponents/optionEcharts';
import moment from 'moment';
import echarts from 'echarts';
import { result } from 'lodash';
const TabPane = Tabs.TabPane;
import comm from '@src/config/comm.config.js';
import SideBar from '@src/pages/sideBar';
let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
let myEchartsFullScreen = null;
let singleTotalArr = [];
let filePath = '';
let XARR = [];
let finallydbArr = [];
let finallydensityArr = [];
let finallydistArr = [];

let dbMaxAll = [];
let dbMinAll = [];
let densityMaxAll = [];
let densityMinAll = [];

let echartsClickData = [];

let responseList = {};
@connect(({collectDataCompare}) => ({collectDataCompare}))
class collectDataCompare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            selectedRowKeysCycle:[],
            loading: false,
            cycleType: '',
            machineId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            tableData:[],
            singleDataVisible:false,
            detailDtoList:[],//选定记录列表
            pointId:'',
            detectorId:"",
            total:0,
            fullScreenVisible:false,
            switchAllShow:false,
            allCaculteData:[],//选择自动包络线的数据
            allCaculteDataChecked:[],//弹窗中另外选择的
            selectedRows:[],
            pointList:[],
            start:"",
            end:"",
            compareTable:[],
            calculateVisible:false,
        }
    }
    componentDidMount(){
        const {collectDataCompare} = this.props;
        const {qualityList,deviationList,pointList} = collectDataCompare;
        this.setState({
            qualityList,
            deviationList,
            pointList
        })
    }
    componentWillReceiveProps(newProps) {
        const {collectDataCompare} = {...newProps};
        const {qualityList,deviationList,pointList} = collectDataCompare;
        this.setState({
            qualityList,
            deviationList,
            pointList
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
            fullScreenVisible:false,
            allDataVisible:false,
            clickChartVisible:false,
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
      
    getList = (result,msg) =>{
        this.disposeEcharts();
        const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,
            detectorId} = msg;
            let params = {
                ...msg,
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
    findMaxMinFrequencyList = ()=>{
        dbMaxAll = [];
        dbMinAll = [];
        densityMaxAll = [];
        densityMinAll = [];
        const {receiverId,selectedRows} = this.state;
        let recordIdList = [];
    
        if(selectedRows.length == 0){
            message.error('还未选择任何数据！')
            return false;
        }
        for(let i = 0;i<selectedRows.length;i++){
            recordIdList.push(selectedRows[i].id)
        }
        this.setState({
            allCaculteData:selectedRows
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
                            dbMaxAll.push(arr[i].dbMax.toFixed(5));
                        }
                        if (arr[i].dbMin == 0) {
                            dbMinAll.push(undefined);
                        } else {
                            dbMinAll.push(arr[i].dbMin.toFixed(5));
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
    lookEcharts = ()=>{
        const {detailDtoList} = this.state;
        let recordIdList = [];
        // 1.全选，2全不选
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        this.getSingle(recordIdList);
    }
    switchAllChange = (e)=>{
        this.setState({
            switchAllShow:e
        },()=>{
            this.findMaxMinFrequencyList();
        })
    }
    lookAllData = ()=>{
        this.setState({
            allDataVisible:true
        })
    }

    // ================================周期结束================================================
    chooseBox = (type) => {
        const {tableData} = this.state;
        let detailDtoList = [];
        let recordIdList = [];
        let selectedRowKeys = [];
        // 1.全选，2全不选
        for (let i = 0; i < tableData.length; i++) {
            selectedRowKeys.push(tableData[i].index);
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
        }else{
            this.setState({
                selectedRowKeys:[],
                detailDtoList: [],
                allCaculteData:[]
            })
            singleTotalArr = [];
        }
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
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
    }
    onSelectChangeAll = (selectedRowKeys, selectedRows) => {
        // console.log(selectedRowKeys,selectedRows)
        this.setState({
            selectedRowKeysAll:selectedRowKeys,
            allCaculteDataChecked:selectedRows,
        })
    }

    removeDuplicates(arr) {
        return arr.filter((item, index) => {
            return arr.indexOf(item) === index;
        });
    }

    getSingle = (recordIdList) => {
          singleTotalArr = [];
          let cycleList = [];
          let recordIdListArr = [];
          let newdetailDtoList = [];
          const {
              switchAllShow,
              allCaculteData,
              totalChecked,
              allCaculteDataChecked,
              detailDtoList,
              receiverId, tableData
          } = this.state;
          if (switchAllShow) {
              let result = this.findDifferentIds(totalChecked, allCaculteData);
              let newArr = result.concat(allCaculteDataChecked);
              for (let i = 0; i < newArr.length; i++) {
                  recordIdListArr.push(newArr[i].id);
                  newdetailDtoList.push({
                      groupId: newArr[i].groupId,
                      recordId: newArr[i].id,
                      receiverId: newArr[i].receiverId,
                  })
              }
          } else {
              recordIdListArr = recordIdList;
              newdetailDtoList = detailDtoList;
          }
          for (let i = 0; i < newdetailDtoList.length; i++) {
              if (newdetailDtoList[i].receiverId) {} else {
                  newdetailDtoList[i] = {
                      ...newdetailDtoList[i],
                      receiverId: receiverId
                  }
              }
          }
          // 去重
          let params = {
              detailDtoList: newdetailDtoList,
              recordIdList: this.removeDuplicates(recordIdListArr),
              receiverId
          }
        if(recordIdListArr.length){
            service.findSimpleFrequencyListNew(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {  
                     singleTotalArr = [];
                       let ret = res.ret.responseList || [];
                       responseList = res.ret;
                       let freqs = res.ret.freqs || [];
                       XARR = freqs.map(item => (item.toFixed(0)));
                       for(let i = 0;i<ret.length;i++){
                           let dbArray = ret[i].dbArray || [];
                           let densityArray = ret[i].densityArray || [];
                           let distArray = ret[i].distArray || [];
                           singleTotalArr.push({
                               id:ret[i].recordId,
                               detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                               machineNo: ret[i].machineNo || '',
                               pointName: ret[i].pointName || '',
                               densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                               dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(5))),
                               distArr: distArray.map(item => ((item ===0 || item == null) ? undefined : item.toFixed(5))),
                           })
                       }
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
        let that = this;
         that.drawEcharts()
       
    }

    drawEcharts = ()=>{
        let dbMinAllEcharts = [];
        let dbMaxAllEcharts = [];
        let densityMinAllEcharts = [];
        let densityMaxAllEcharts = [];
        const {switchAllShow,} = this.state;
 
        if(switchAllShow){
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
        }else{
            dbMinAllEcharts = [];
            dbMaxAllEcharts = [];
            densityMinAllEcharts = [];
            densityMaxAllEcharts = [];
        }
        
         let totaldbArr = [];
         let totaldensityArr = [];
         let totaldistArr = [];
         for (let j = 0; j < singleTotalArr.length; j++) {
             totaldbArr.push({
                 name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo + '_' + singleTotalArr[j].pointName,
                 type: "line",
                 data: singleTotalArr[j].dbArr
             })
             totaldensityArr.push({
                 name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo + '_' + singleTotalArr[j].pointName,
                 type: "line",
                 data: singleTotalArr[j].densityArr
             })
            totaldistArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo + '_' + singleTotalArr[j].pointName,
                type: "line",
                data: singleTotalArr[j].distArr
            })
         }
         finallydbArr = [];
         finallydensityArr = [];
         finallydistArr = [];
     
        let that = this;
         setTimeout(() => {
              let endDbArr = [...totaldbArr, ...dbMaxAllEcharts, ...dbMinAllEcharts];
              let endDensityArr = [...totaldensityArr, ...densityMaxAllEcharts, ...densityMinAllEcharts];
        
                finallydbArr = endDbArr;
                finallydensityArr = endDensityArr;
                finallydistArr = totaldistArr;
              if (that.echartsBoxDb) {
                  if (myEchartsDb == null) {
                      myEchartsDb = echarts.init(that.echartsBoxDb);
                  }
                  if (myEchartsDb) {
                    let optionDb =JSON.parse(JSON.stringify(echartsOption.optionDb));
                      optionDb.xAxis[0].data = XARR || [];
                      optionDb.series = finallydbArr;
                      myEchartsDb.setOption(optionDb);
                      myEchartsDb.on('click', function (params) {
                          if (params.componentType === 'series') {
                              const seriesName = params.seriesName;
                              const dataIndex = params.dataIndex;
                              const seriesIndex = params.seriesIndex;
                              that.echartsClick(dataIndex, params.name,'db')
                          }
                      });
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
                              that.echartsClick(dataIndex, params.name,'density')
                          }
                      });
                  }
              }

         }, 500);

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
             } else{
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
                    for(let i = 0;i<data.length;i++){
                         xArr.push(Math.sqrt(Number(data[i].freq1) * Number(data[i].freq2)).toFixed(0));
                         densityArr.push(Number(data[i].density.toFixed(3)));
                         if (data[i].db == 0) {
                             dbArr.push(undefined);
                         } else {
                             dbArr.push(data[i].db.toFixed(5));
                         }
                    }
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
                            //  myEchartsSingle.on('finished', () => {
                            //      if (myEchartsSingle) {
                            //          myEchartsSingle.resize()
                            //      }

                            //  })
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
    // ================================================展示包络线========================

    findClosestNumberInArray =(target, arr)=> {
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

    sortArrayByTotalDescending =(arr)=> {
        return arr.sort((a, b) => b.total - a.total);
    }

    export = ()=>{
        const {compareTable} = this.state;
    
        service.exportDist(compareTable).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    window.open(res.ret, '_blank');
                }
            } else {
                message.error(res.err);
            }
        })

    }
    render(){
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
                        < Button onClick={()=>this.lookData(record,index)}> 查看曲线图 </Button>
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
        const { loading, selectedRowKeys ,selectedRowKeysCycle,selectedRowKeysAll} = this.state;
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections:true,
            onChange: this.onSelectChange,
        };

        const rowSelectionAll = {
            selectedRowKeys:selectedRowKeysAll,
            hideDefaultSelections:true,
            onChange: this.onSelectChangeAll,
        };
    
        const {tableData,name,allCaculteData,partCompareList,start,end,compareTable } = this.state;
    return (
        <Page title='采集数据点位对比管理' className="pageLayoutRoot" style={{width:'100%'}}>
            < SideBar parent={this}></SideBar>
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
            <SearchPage parent={this}></SearchPage>
                {/* 能量密度 */}
               <div className={styles.frequencyWidth}>
                    <div className={styles.standStoreFlex}>
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDb = c
                                }
                            } 
                            style = {
                                {
                                    width: '49%',
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
                                    width: '49%',
                                    height: '300px',
                                }
                            }
                        /> 
                    </div>
                    <Button type='primary' onClick={()=>{
                        this.lookFullScreen(1)
                }}>全屏能量曲线</Button>
                    <Button type='primary' style={{marginLeft:10,marginTop:'10px'}} onClick={()=>{
                    this.lookFullScreen(2)
                }}>全屏密度曲线</Button>
                <br/>
                    <span style={{color:'red',fontSize:16}}>提示：数据量大时可以通过点击具体频率查看所选数据对应的能量、密度 </span>
                </div>
                <BtnWrap>
                    {
                        selectedRowKeys.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                    }
                    <Button style={{backgroundColor:'#F21360',color:'white',marginTop:'10px'}} onClick={()=>this.lookEcharts()}>生成曲线图</Button>
                    <Switch style={{marginTop:'10px'}} checkedChildren="预览所选数据上下限" unCheckedChildren="关闭所选数据上下限" checked={this.state.switchAllShow} onChange={this.switchAllChange.bind(this)}/>
                    {this.state.switchAllShow && <Button style={{backgroundColor:'green',color:'white',marginLeft:10,marginTop:'10px'}} onClick={()=>this.lookAllData()}>查看所选数据</Button>}
                </BtnWrap>
                <Table {...tableStyle} rowSelection={rowSelection} rowKey={record => record.index} columns={columns} dataSource={tableData} />
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
                        <Table pagination={false} rowKey={record => record.id} columns={columnsEcharts} dataSource={echartsClickData} />  
                    </Modal>  
                
                <BackTop />
                </div>
            </div>
             
        </Page>
        
        
        )
    }
}

export default collectDataCompare;
