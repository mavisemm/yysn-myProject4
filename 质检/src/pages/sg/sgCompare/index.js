
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Spin } from 'antd';

import {service} from './service';
import styles from './sgCompare.less';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'sgCompare';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { first,uniqBy  } from 'lodash';
let singleTotalArr = [];
let filePath = '';
let myEcharts1 = null;
let echartsArr = [];
let totalSelected = [];
import echartsOption from '@src/pages/acomponents/optionEcharts';
@connect(({sgCompare}) => ({sgCompare}))
class sgCompare extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            machineList:[],
            endTime: '',
            recordId: "",
            startTime: '',
            frequencyList:[],
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
                  series: []
            },
            soundList:[],
            detailResponseList:[],
            machineIdList: [],
            receiverIdList: []
        }
    }
    componentDidMount(){
        const {sgCompare} = this.props;
        const {machineList,soundList} = sgCompare;
             this.setState({
                 machineList,
                 soundList
             })
    }
    componentWillReceiveProps(newProps) {
        const {sgCompare} = {...newProps};
        const {machineList,soundList} = sgCompare;
        this.setState({
            machineList,
            soundList
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
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
     chooseMachine =(e)=> {
        this.setState({
            machineIdList: e
        })
    }
    chooseReceiver = (e)=>{
        this.setState({
            receiverIdList:e
        })
    }
    getList = () =>{
        // this.dealSelectedData();
        // return false;
        const {startTime,endTime,machineIdList,receiverIdList} = this.state;
        let params = {
            startTime, endTime, machineIdList, receiverIdList
            // "startTime": 1682438400000,
            // "endTime": 1690300799000,
            // "machineIdList": [241, 243, 244, 247, 285, 286],
            // "receiverIdList": [114, 252, 253]
        };
        service.getList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if(res.ret){
                    let data = res.ret;
                    this.setState({
                        detailResponseList: data?.detailResponseList || []
                    },()=>{
                        this.dealSelectedData();
                    })
                    // localStorage.detailResponseList = JSON.stringify(data.detailResponseList)
                    
                }
            } else {
                message.error(res.err);
            }
        })

    }
    dealSelectedData = () => {
        const {detailResponseList} = this.state;
        // let detailResponseList = JSON.parse(localStorage.detailResponseList);
        const {receiverIdList} = this.state;
        totalSelected= [] ;
        let receiverId = receiverIdList[0];
        for(let i =0 ;i<detailResponseList.length;i++){
            let temp = detailResponseList[i];
            if (receiverId == temp.receiverId){
                totalSelected.push({
                    machineName:temp.machineName,
                    dataResponseList:temp.dataResponseList
                })
            }
        }
        for (let i = 0; i < totalSelected.length; i++) {
            let temp = totalSelected[i];
             let timeArr = [];
             let powerArr = [];
             let heatArr = [];
             let vibteArr = [];
             let yeyaArr = [];
             let niujuArr = [];
             let speedArr = [];
            for (let j = 0; j < temp.dataResponseList.length; j++) {
                let temps = temp.dataResponseList[j];
                timeArr.push(moment(temps.time).format('YYYY-MM-DD HH:mm:ss'));
                powerArr.push(temps.power);
                heatArr.push(temps.temperature);
                vibteArr.push(temps.vibration);
                yeyaArr.push(temps.hydraulic);
                niujuArr.push(temps.torque);
                speedArr.push(temps.rotateSpeed);
            }
            totalSelected[i] = {
                ...totalSelected[i],
                machineName:temp.machineName,
                timeArr,
                powerArr,
                heatArr,
                vibteArr,
                yeyaArr,
                niujuArr,
                speedArr
            }
        }
        this.disposeEcharts();
        this.dealSix();
        this.dealStandardLine();
    }
    dealSix = ()=>{
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
         for(let i = 0;i<totalSelected.length;i++){
            let temp = totalSelected[i];
            timeArr = timeArr.concat(temp.timeArr);
            powerArr.push({
                name: temp.machineName,
                type: "line",
                data: temp.powerArr
            });
            heatArr.push({
                name: temp.machineName,
                type: "line",
                data: temp.heatArr
            });
            vibteArr.push({
                name: temp.machineName,
                type: "line",
                data: temp.vibteArr
            });
            yeyaArr.push({
                name: temp.machineName,
                type: "line",
                data: temp.yeyaArr
            });
            niujuArr.push({
                name: temp.machineName,
                type: "line",
                data: temp.niujuArr
            });
            speedArr.push({
                name: temp.machineName,
                type: "line",
                data: temp.speedArr
            });

         }
         if (this.echartsBoxhw) {
            let myEcharts1 = echarts.init(this.echartsBoxhw);
             echartsArr.push(myEcharts1);
             lineOption1.title.text = '温度趋势图';
             lineOption1.xAxis.data = timeArr;
             lineOption1.yAxis.name = '℃';
             lineOption1.series = heatArr;
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
             lineOption1.series = vibteArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }

         if (this.echartsBoxyy) {
            let myEcharts1 = echarts.init(this.echartsBoxyy);
              echartsArr.push(myEcharts1);
             lineOption1.title.text = '液压趋势图';
             lineOption1.xAxis.data = timeArr;
             lineOption1.yAxis.name = 'MPa';
             lineOption1.series = yeyaArr;
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
             lineOption1.series = powerArr;
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
             lineOption1.series = niujuArr;
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
             lineOption1.series = speedArr;
             myEcharts1.setOption(lineOption1)
             myEcharts1.on('finished', () => {
                 myEcharts1.resize()
             })
         }
    }


    // 处理最终echarts图的展示
    dealStandardLine = (res)=>{
        const {detailResponseList} = this.state;
    //    let detailResponseList = JSON.parse(localStorage.detailResponseList);
       let singleTotalArr = detailResponseList;
        const {receiverIdList} = this.state;
        let Xrr = [];
        let xArr = [];
        let densityArr = [];
        let dbArr = [];
        // 各条记录的数据
         for (let i = 0; i < singleTotalArr.length; i++) {
            for(let j = 0;j<singleTotalArr[i].dataResponseList.length;j++){
                let temp = singleTotalArr[i].dataResponseList[j];
                Xrr = [];
                densityArr = [];
                dbArr = [];
                 for (let k = 0; k < temp.freqResponseList.length; k++) {
                    let temps = temp.freqResponseList[k];
                    Xrr.push(Number(temps.frequency).toFixed(0));
                    densityArr.push(Number(temps.density.toFixed(3)));
                    if (temps.db == 0) {
                        dbArr.push(undefined);
                    } else {
                        dbArr.push(temps.db.toFixed(2));
                    }
                 }
                singleTotalArr[i].dataResponseList[j] = {
                    ...singleTotalArr[i].dataResponseList[j],
                    dbArr,
                    densityArr
                }
            }
             
         }
        //  console.log(singleTotalArr,'lllll')

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
                receiverName1 = singleTotalArr[0]?.receiverName || '';
                receiverName2 = singleTotalArr[1]?.receiverName || '';
                receiverName3 = singleTotalArr[2]?.receiverName || '';
                if (receiverIdList[0] == singleTotalArr[j].receiverId) {
                    for(let k = 0;k<singleTotalArr[j].dataResponseList.length;k++){
                        let temp = singleTotalArr[j].dataResponseList[k];
                        arr1.push({
                            name: moment(temp.time).format('YYYY-MM-DD HH:mm:ss') + '-' + singleTotalArr[j].machineName,
                            type: "line",
                            receiverName: singleTotalArr[j].receiverName,
                            data: temp.dbArr
                        })
                        arr4.push({
                            name: moment(temp.time).format('YYYY-MM-DD HH:mm:ss') + '-' + singleTotalArr[j].machineName,
                            type: "line",
                            receiverName: singleTotalArr[j].receiverName,
                            data: temp.densityArr
                        })
                    }
            
                }
                if (receiverIdList[1] == singleTotalArr[j].receiverId) {
                    for (let k = 0; k < singleTotalArr[j].dataResponseList.length; k++) {
                        let temp = singleTotalArr[j].dataResponseList[k];
                        arr2.push({
                            name: moment(temp.time).format('YYYY-MM-DD HH:mm:ss') + '-' + singleTotalArr[j].machineName,
                            type: "line",
                            receiverName: singleTotalArr[j].receiverName,
                            data: temp.dbArr
                        })
                        arr5.push({
                            name: moment(temp.time).format('YYYY-MM-DD HH:mm:ss') + '-' + singleTotalArr[j].machineName,
                            type: "line",
                            receiverName: singleTotalArr[j].receiverName,
                            data: temp.densityArr
                        })
                    }
                }
                if (receiverIdList[2] == singleTotalArr[j].receiverId) {
                    for (let k = 0; k < singleTotalArr[j].dataResponseList.length; k++) {
                        let temp = singleTotalArr[j].dataResponseList[k];
                        arr3.push({
                            name: moment(temp.time).format('YYYY-MM-DD HH:mm:ss') + '-' + singleTotalArr[j].machineName,
                            type: "line",
                            receiverName: singleTotalArr[j].receiverName,
                            data: temp.dbArr
                        })
                        arr6.push({
                            name: moment(temp.time).format('YYYY-MM-DD HH:mm:ss') + '-' + singleTotalArr[j].machineName,
                            type: "line",
                            receiverName: singleTotalArr[j].receiverName,
                            data: temp.densityArr
                        })
                    }
                }
            }
      
        let finallydbArr1 = arr1;
        let finallydensityArr1 = arr4;
        let finallydbArr2 = arr2;
        let finallydensityArr2 = arr5;
        let finallydbArr3 = arr3;
        let finallydensityArr3 = arr6;
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
    }
    render(){
        const {machineList,soundList} = this.state;
        return (
                <div className={styles.body}>
                    <div>
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
                        <Select placeholder="请选择机型" multiple style={{marginLeft:10,width:300}} onChange={this.chooseMachine.bind(this)} >
                            {
                                (machineList || []).map((item,index)=>{
                                    return (
                                        <Option value ={item.id} key={index}> {item.name} </Option>
                                    )
                                })
                            }
                        </Select>
                        <Select placeholder="请选择听筒" multiple style={{marginLeft:10,width:300}} onChange={this.chooseReceiver.bind(this)} >
                            {
                                (soundList || []).map((item,index)=>{
                                    return (
                                        <Option value ={item.id} key={index}> {item.name} </Option>
                                    )
                                })
                            }
                        </Select>
                        <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList(1)}> 查询 </Button>
                    </div>
        
                    {/* 能量密度 */}
                    <div className={styles.frequencyWidth}>
                        <div className={styles.frequencyWidthTitle}>能量、密度标准库曲线</div>
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

                </div>
            )
        }
    }

export default sgCompare;
