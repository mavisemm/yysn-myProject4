import React, {Component} from 'react';
import styles from '../sgcheck.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox} from 'antd';
import comm from '@src/config/comm.config.js';
import { withRouter } from 'dva/router';
import { Iframe } from 'rc-layout';
let legendArr = [];
let filePath = '';
let myEchartsVoice = null;
let xArr = [];
let dbArr = [];
let densityArr = [];
let standardDbArr = [];
let standardDensityArr = [];
let t = null;
let myEcharts1 = null;
let pojoList = [];
let exportPojos = [];
let myEchartsZd = null;
let myEchartsHw = null;
let myEchartsYy = null;
import moment, { localeData } from 'moment';
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            freqOption:{
                title: {
                        text:'',
                        left: 'right',
                        textStyle: {
                            color: 'white'
                        }
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
                            animation: false,
                            label: {
                                backgroundColor: '#505765'
                            }
                        },
                       // alwaysShowContent:true,
                       hideDelay:5000
                    },
                    legend: {
                        data: ['标准能量','能量','标准密度','密度'],
                        left: 10,
                        textStyle: {
                            color: 'white'
                        }
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
                            textStyle: {
                                color: 'white'
                            },
                             formatter: `{value}Hz`
                        },
                        interval: 1,
                        data: []
                    }
                   ],
                    yAxis: [{
                            name: '能量(db)',
                            type: 'value',
                             scale: true,
                            axisLabel: {
                                show: true,
                                textStyle: {
                                    color: 'white'
                                }
                            },
                            nameTextStyle: { //y轴上方单位的颜色
                                color: '#fff'
                            },

                        },
                        {
                            name: '密度(%)',
                           //  nameLocation: 'start',
                            alignTicks: true,
                            type: 'value',
                             scale: true,
                            axisLabel: {
                                show: true,
                                textStyle: {
                                    color: 'white'
                                }
                            },
                            nameTextStyle: { //y轴上方单位的颜色
                                color: '#fff'
                            },
                            splitLine: {
                                show: false
                            },
                           //  inverse: true,
                        },

                    ],

                    series: [
                       {
                            name: '标准能量',
                            type: 'line',
                            animation:false,
                            lineStyle: {
                                width: 1
                            },
                            axisLabel: {
                                show: true,
                                textStyle: {
                                    color: 'white'
                                }
                            },
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#469990',
                                    lineStyle: {
                                        color: '#469990'
                                    }
                                }
                            },
                            data: []
                        },
                       {
                            name: '能量',
                            type: 'line',
                            animation:false,
                            lineStyle: {
                                width: 1
                            },
                            axisLabel: {
                                show: true,
                                textStyle: {
                                    color: 'white'
                                }
                            },
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                normal: {
                                    color: '#fabed4',
                                    lineStyle: {
                                        color: '#fabed4',
                                    }
                                }
                            },
                            data: []
                        },

                        {
                            name: '标准密度',
                            type: 'line',
                            animation:false,
                            yAxisIndex: 1,
                            lineStyle: {
                                width: 1
                            },
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                normal: {
                                    color: 'yellow',
                                    lineStyle: {
                                        color: 'yellow'
                                    }
                                }
                            },
                            data: []
                        },
          
                        {
                            name: '密度',
                            type: 'line',
                            animation: false,
                            smooth: true,
                            yAxisIndex: 1,
                            lineStyle: {
                                width: 1
                            },
                            emphasis: {
                                focus: 'series'
                            },
                            itemStyle: {
                                normal: {
                                    color: 'red',
                                    lineStyle: {
                                        color: 'red'
                                    }
                                }
                            },
                            data: []
                        }
                    ]

           },
            tableData:[],
            recordId:"",
            densityDtoList:[],
            lineOption:{
                title: {
                    text:'',
                    left: 'center',
                    textStyle: {
                        color: 'white'
                    }
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
                    textStyle: {
                        color: 'white'
                    }
                },
                xAxis: {
                    type: 'category',
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: 'white'
                        },
                    },
                    data: []
                  },
                  yAxis: {
                    type: 'value',
                    scale:true,
                    axisLabel: {
                        show: true,
                        textStyle: {
                            color: 'white'
                        }
                    },
                    splitLine: {
                        show: false
                    },
                    nameTextStyle: { //y轴上方单位的颜色
                        color: '#fff'
                    },
                  },
                  series: [
                    {
                        data: [],
                        type: 'line',
                        animation:false,
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: {
                            normal: {
                                color: 'yellow',
                                lineStyle: {
                                    color: 'yellow'
                                }
                            }
                        },
                    },
                    {
                        data: [],
                        type: 'line',
                        animation: false,
                        emphasis: {
                            focus: 'series'
                        },
                    },
                    {
                        data: [],
                        animation: false,
                        type: 'line',
                        emphasis: {
                            focus: 'series'
                        },
                    }
                ]
            },
            fullScreenVisible:false,
            cycleList:[],


        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        const {receiverResponseList=[],recordId,result } = {...this.props};
        const {powerHistoryList,powerColorFlag,power,rotateSpeedHistoryList,rotateSpeedColorFlag,rotateSpeed,
            temperatureHistoryList,temperatureColorFlag,temperature,torqueHistoryList,torqueColorFlag,torque,
            vibrationHistoryList,vibrationColorFlag,vibration,hydraulicHistoryList,hydraulicColorFlag,hydraulic,
        } = result;
        // hydraulic液压
        let that = this;
        let arr = [];
        this.setState({
            receiverResponseList,
            torqueHistoryList:arr,
            recordId,
            receiverId: receiverResponseList[0].receiverId,
            powerHistoryList,powerColorFlag,power,rotateSpeedHistoryList,rotateSpeedColorFlag,rotateSpeed,
            temperatureHistoryList,temperatureColorFlag,temperature,torqueHistoryList,torqueColorFlag,torque,
            vibrationHistoryList,vibrationColorFlag,vibration,hydraulicHistoryList,hydraulicColorFlag,hydraulic,
        },()=>{
           that.lookEcharts(receiverResponseList[0].receiverId);
           that.lookEcharts(receiverResponseList[1].receiverId);
           that.lookEcharts(receiverResponseList[2].receiverId);
           that.initEchartsLine();
        })
        t = setTimeout(function () {
            that.saveEchart();
        }, 5000)
    }
    componentWillReceiveProps(newProps) {

    }
    componentWillUnmount(){
        if (myEchartsVoice) {
            myEchartsVoice.dispose();
            myEchartsVoice = null;
        }
        if(myEcharts1){
            myEcharts1.dispose();
            myEcharts1 = null;
        }
        if (myEchartsZd) {
            myEchartsZd.dispose();
            myEchartsZd = null;
        }
        if (myEchartsHw) {
            myEchartsHw.dispose();
            myEchartsHw = null;
        }
        if (myEchartsYy) {
            myEchartsYy.dispose();
            myEchartsYy = null;
        }

    }
    // 震动、红外、液压
    initEchartsLine= ()=>{
        const { vibrationHistoryList,hydraulicHistoryList,
            temperatureHistoryList,lineOption,powerHistoryList,rotateSpeedHistoryList,torqueHistoryList,
        rotateSpeed,torque,power} = this.state;
        const lineOption1 = {...lineOption};

        // 红外
        let xarr = [];
        let yarr = []
        for(let i = 0;i<temperatureHistoryList.length;i++){
            xarr.push(moment(temperatureHistoryList[i].time).format('YYYY-MM-DD HH:mm:ss'));
            yarr.push(temperatureHistoryList[i].data);
        }
        if(this.echartsBoxhw){
            myEchartsHw = echarts.init(this.echartsBoxhw);
            lineOption1.title.text =  '热成像趋势图';
            lineOption1.xAxis.data = xarr;
            lineOption1.series[0].data = yarr;
            myEchartsHw.setOption(lineOption1)
            myEchartsHw.on('finished', () => {
                myEchartsHw.resize()
            })
            var opts = {
                type: 'png', // 导出的格式，可选 png, jpeg
                pixelRatio: 1.2, // 导出的图片分辨率比例，默认为 1。
                backgroundColor: 'black', // 导出的图片背景色，默认使用 option 里的 backgroundColor
                // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox'],一般也忽略了'toolbox'这栏就够了
            }
            var resBase64 = myEchartsHw.getDataURL(opts); //拿到base64 地址，就好下载了。
            exportPojos.push({
                type: 'HEAT',
                base64: resBase64
            })
        }

        // 震动
        let xarr1 = [];
        let yarr1 = []
        for(let i = 0;i<vibrationHistoryList.length;i++){
            xarr1.push(moment(vibrationHistoryList[i].time).format('YYYY-MM-DD HH:mm:ss'));
            yarr1.push(vibrationHistoryList[i].data);
        }
        if(this.echartsBoxzd){
            myEchartsZd = echarts.init(this.echartsBoxzd);
            lineOption1.title.text =  '振动趋势图';
            lineOption1.xAxis.data = xarr1;
            lineOption1.series[0].data = yarr1;
            myEchartsZd.setOption(lineOption1)
            myEchartsZd.on('finished', () => {
                myEchartsZd.resize()
            })
            var opts = {
                type: 'png', // 导出的格式，可选 png, jpeg
                pixelRatio: 1.2, // 导出的图片分辨率比例，默认为 1。
                backgroundColor: 'black', // 导出的图片背景色，默认使用 option 里的 backgroundColor
                // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox'],一般也忽略了'toolbox'这栏就够了
            }
            var resBase64 = myEchartsZd.getDataURL(opts); //拿到base64 地址，就好下载了。
            exportPojos.push({
                type: 'VIBTE',
                base64: resBase64
            })
        }

        // 液压
        let xarr2 = [];
        let yarr2 = []
        for(let i = 0;i<hydraulicHistoryList.length;i++){
            xarr2.push(moment(hydraulicHistoryList[i].time).format('YYYY-MM-DD HH:mm:ss'));
            yarr2.push(hydraulicHistoryList[i].data);
        }
        if(this.echartsBoxyy){
            myEchartsYy = echarts.init(this.echartsBoxyy);
            lineOption1.title.text =  '液压趋势图';
            lineOption1.xAxis.data = xarr2;
            lineOption1.series[0].data = yarr2;
            myEchartsYy.setOption(lineOption1)
            myEchartsYy.on('finished', () => {
                myEchartsYy.resize()
            })
            var opts = {
                type: 'png', // 导出的格式，可选 png, jpeg
                pixelRatio: 1.2, // 导出的图片分辨率比例，默认为 1。
                backgroundColor: 'black', // 导出的图片背景色，默认使用 option 里的 backgroundColor
                // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox'],一般也忽略了'toolbox'这栏就够了
            }
            var resBase64 = myEchartsYy.getDataURL(opts); //拿到base64 地址，就好下载了。
            exportPojos.push({
                type: 'HYDRAULIC',
                base64: resBase64
            })
        }

        // 功率
        let xarr3 = [];
        let yarr3 = []
        for(let i = 0;i<powerHistoryList.length;i++){
            xarr3.push(moment(powerHistoryList[i].time).format('YYYY-MM-DD HH:mm:ss'));
            yarr3.push(powerHistoryList[i].data);
        }
        // 转速
        let xarr4 = [];
        let yarr4 = []
        for(let i = 0;i<rotateSpeedHistoryList.length;i++){
            xarr4.push(moment(rotateSpeedHistoryList[i].time).format('YYYY-MM-DD HH:mm:ss'));
            yarr4.push(rotateSpeedHistoryList[i].data);
        }
        // 扭矩
        let xarr5 = [];
        let yarr5 = []
        for(let i = 0;i<torqueHistoryList.length;i++){
            xarr5.push(moment(torqueHistoryList[i].time).format('YYYY-MM-DD HH:mm:ss'));
            yarr5.push(torqueHistoryList[i].data);
        }

        if(this.echartsBoxgl){
            myEcharts1 = echarts.init(this.echartsBoxgl);
            lineOption1.title.text =  '功率趋势图';
            lineOption1.title.left = 'right';
            lineOption1.xAxis.data = xarr3;
            lineOption1.legend.data = ['功率','转速','扭矩'];
            lineOption1.series[0] = {
                    name:"功率",
                    data: yarr3,
                    type: 'line',
                    emphasis: {
                      focus: 'series'
                    },
                    itemStyle: {
                        normal: {
                            color: 'yellow',
                            lineStyle: {
                                color: 'yellow'
                            }
                        }
                    },
            };
            lineOption1.series[1] = {
                name:"转速",
                data: yarr4,
                type: 'line',
                emphasis: {
                  focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: 'green',
                        lineStyle: {
                            color: 'green'
                        }
                    }
                },
            };
            lineOption1.series[2] = {
                name:"扭矩",
                data: yarr5,
                type: 'line',
                emphasis: {
                  focus: 'series'
                },
            };
            myEcharts1.setOption(lineOption1)
            myEcharts1.on('finished', () => {
                myEcharts1.resize()
            })
        }


    }

    // 点击查看听筒
    lookEcharts = (receiverId)=>{
        this.setState({
            receiverId
        })
        const {receiverResponseList,freqOption} = this.state;
        if(myEchartsVoice){
            myEchartsVoice.dispose();
            myEchartsVoice = null;
        }
        // 周期
        let cycleArr = [];
        for(let i = 0;i<receiverResponseList.length;i++){
            for(let k = 0;k<receiverResponseList[i].receiverEChartDataList.length;k++){
                cycleArr.push({
                    receiverName:receiverResponseList[i].receiverName,
                    db:receiverResponseList[i].receiverEChartDataList[k].db,
                    cycle:receiverResponseList[i].receiverEChartDataList[k].cycle,
                    matchDegree:receiverResponseList[i].receiverEChartDataList[k].matchDegree,
                    frequency:receiverResponseList[i].receiverEChartDataList[k].frequency,
                })
            }
            this.setState({
                cycleList:cycleArr
            })
        }

        // 频率声音
        let densityDtoList = [];
        let frequencyDtoList = [];
        let standardFrequencyDtos = [];
        xArr = [];
        dbArr = [];
        densityArr = [];
        standardDbArr = [];
        standardDensityArr = [];
        for(let i = 0;i<receiverResponseList.length;i++){
            if(receiverId == receiverResponseList[i].receiverId){
                densityDtoList =receiverResponseList[i].densityDtoList;
                frequencyDtoList =receiverResponseList[i].frequencyDtoList;
                standardFrequencyDtos =receiverResponseList[i].standardFrequencyDtos;
            }
        }
      
        for(let i = 0;i<densityDtoList.length;i++){
            xArr.push(densityDtoList[i].frequency.toFixed(2))
            densityArr.push(densityDtoList[i].density.toFixed(3))
            if (frequencyDtoList[i].db == 0) {
                dbArr.push(undefined)
            }else{
                dbArr.push(frequencyDtoList[i].db.toFixed(2))
            }
        }
        if (standardFrequencyDtos){
              for (let i = 0; i < standardFrequencyDtos.length; i++) {
                  standardDensityArr.push(standardFrequencyDtos[i].density.toFixed(3))
                  if (standardFrequencyDtos[i].db == 0) {
                      standardDbArr.push(undefined)
                  } else {
                      standardDbArr.push(standardFrequencyDtos[i].db.toFixed(2))
                  }
              }
        }

      

        myEchartsVoice = echarts.init(this.echartsVoice);
        let option = this.state.freqOption;
        option.xAxis[0].data =  xArr;
        option.series[0].data = standardDbArr;
        option.series[1].data = dbArr;
        option.series[2].data = standardDensityArr;
        option.series[3].data = densityArr;
        myEchartsVoice.setOption(option)
        myEchartsVoice.on('finished', () => {
            myEchartsVoice.resize()
        })


        var opts = {
            type: 'png', // 导出的格式，可选 png, jpeg
            pixelRatio: 1.2, // 导出的图片分辨率比例，默认为 1。
            backgroundColor: 'black', // 导出的图片背景色，默认使用 option 里的 backgroundColor
            // 忽略组件的列表，例如要忽略 toolbox 就是 ['toolbox'],一般也忽略了'toolbox'这栏就够了
        }
        var resBase64 = myEchartsVoice.getDataURL(opts); //拿到base64 地址，就好下载了。
        pojoList.push({
            receiverId,
            base64: resBase64
        })
        // this.saveEchart()
    }

    saveEchart = ()=>{
        const {recordId} = this.state;

        let newPojo = [];
        newPojo = pojoList.filter(function (item, index) {
             return pojoList.indexOf(item) === index; // 因为indexOf 只能查找到第一个  
         });


        let newExport = [];
        newExport = exportPojos.filter(function (item, index) {
             return exportPojos.indexOf(item) === index; // 因为indexOf 只能查找到第一个  
         });


        let params = {
            pojoList: newPojo,
            exportPojos: newExport,
            recordId,
        }
        service.saveEchart(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
              
            } else {
                // message.error(res.err);
            }
        })
    }
    closeFullScreen = (e) => {
        e.stopPropagation()
        this.setState({
            fullScreenVisible:false
        })
    }
    look = (type)=>{
         filePath = comm.audioUrl + '?recordId=' + this.state.recordId + '&receiverId=' + this.state.receiverId;
        this.setState({
            fullScreenVisible:true
        },()=>{
            if(this.echartsBoxFull){
                let myEcharts1 = echarts.init(this.echartsBoxFull);
                let option = this.state.freqOption;
                option.xAxis[0].data =  xArr;
                option.series[0].data = standardDbArr;
                option.series[1].data = dbArr;
                option.series[2].data = standardDensityArr;
                option.series[3].data = densityArr;
                myEcharts1.setOption(option)
                myEcharts1.on('finished', () => {
                    myEcharts1.resize()
                })
            }
        })
    }
 
    render() {
        const {vibrationColorFlag,vibration,temperatureColorFlag,temperature,powerColorFlag,power,
            hydraulicColorFlag,hydraulic,receiverResponseList } = this.state;

        return (
            <div className={styles.echartsBody}>
                <div className={styles.echartsBodyLeft}>
                   
                    <div ref = {
                        (c) => {
                            this.echartsVoice = c
                        }
                    }
                    style = {
                        {
                            width: '100%',
                            height: '300px',
                        }
                    }/> 
                     <Button type='primary' onClick={()=>{this.look(1)}}>全屏查看</Button>
                     {
                        (receiverResponseList || []).map((item,index)=>{
                            return (
                                <Button style={{marginLeft:'10px'}} onClick={()=>{this.lookEcharts(item.receiverId)}}>{item.receiverName}</Button>
                            )
                        })
                     }
                     
                    <div className={styles.cycleStylesg}>
                        <div className={styles.cycleTitlesg}>
                            <div>听筒名称</div>
                            <div>周期(ms)</div>
                            <div>能量(db)</div>
                            <div>频率(Hz)</div>
                            <div>稳定度</div>
                        </div>
                        {
                            (this.state.cycleList || []).map((item,index)=>{
                                return (
                                    <div className={styles.cycleContentsg}>
                                        <div>{item.receiverName}</div>
                                        <div>{item.cycle}</div>
                                        <div>{item.db}</div>
                                        <div>{item.frequency}</div>
                                        <div>{item.matchDegree}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div ref = {
                        (c) => {
                            this.echartsBoxgl = c
                        }
                    }
                    style = {
                        {
                            width: '100%',
                            height: '200px',
                        }
                    }/> 
             
                </div>
                <div className={styles.echartsBodyRight}>
                    <div className={styles.bgValue} style={{color : temperatureColorFlag ? 'red' : ''}}>温度：{temperature}°C</div>
                    <div ref = {
                            (c) => {
                                this.echartsBoxhw = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '200px',
                            }
                        }/> 
                         <div className={styles.bgValue} style={{color : vibrationColorFlag ? 'red' : ''}}>振幅：{vibration}mm/s</div>
                    <div ref = {
                        (c) => {
                            this.echartsBoxzd = c
                        }
                    }
                    style = {
                        {
                            width: '100%',
                            height: '200px',
                        }
                    }/> 
                     <div className={styles.bgValue} style={{color : hydraulicColorFlag ? 'red' : ''}}>液压：{hydraulic}MPa</div>
                      <div ref = {
                        (c) => {
                            this.echartsBoxyy = c
                        }
                    }
                    style = {
                        {
                            width: '100%',
                            height: '200px',
                        }
                    }/> 
                </div>
               
               {/* 点击放大全屏功能 */}
               {
                this.state.fullScreenVisible ?
                <div className={styles.fullScreenzc}>
                    <div className={styles.screenContentzc}>
                        <div className={styles.screenzcClose} onClick={this.closeFullScreen.bind(this)}>
                            <div></div>
                            <img src={require('@src/assets/voice/close.png')} className={styles.closeIconzc}/>
                        </div>
                        <div ref = {
                            (c) => {
                                this.echartsBoxFull = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '80%',
                                marginTop:'50px'
                            }
                        }
                        />
                        < div className={styles.ZCAudioStyle}>
                            <audio  src={filePath} controls></audio>
                        </div>
                    </div>
         
                </div> :""
            }

    
            </div>
        )
    }
}

export default WholeBar;
