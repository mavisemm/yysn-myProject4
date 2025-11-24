import React, {Component} from 'react';
import styles from '../knockvoice.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox} from 'antd';
import { subPixelOptimizeLine } from 'echarts/lib/util/graphic';
let myEcharts = null;
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
           fullScreen:false,
           fullScreenDensity:false,
           option:{},
           densityOption:{},
           receiverID:[],
           tableVisible:false,
            newreceiverResponseList:[],
            tabType:"",
            tableData:[],
            echoValueList:[],
            filePath:"",
            lineCount:"",
            option:{
                xAxis:{
                    type: 'category',
                    name:'(单位:秒)',
                    data: [],
                    axisLabel: {
                        textStyle: {
                            show:true,
                            color: "#fff",
                            fontSize: '18',
                        },                           
                    },
                    nameTextStyle: { //y轴上方单位的颜色
                        color: '#fff'
                    },
                } ,
                yAxis: {
                    type: 'value',
                    name:'回音度',
                    axisLabel: {
                        textStyle: {
                            show:true,
                            color: "#fff",
                            fontSize: '18',
                        },                           
                    },
                    // scale:true,
                    splitNumber:3,
                    splitLine:{
                        show:false,//不显示分割线
                    },
                    nameTextStyle: { //y轴上方单位的颜色
                        color: '#fff'
                    },
                } ,
                series: [
                  {
                    data: [],
                    type: 'bar',
                    barWidth : 30,
                    itemStyle: {
                        normal: {
                            label: {
                                show: true, 
                                position: 'top',
                                textStyle: {
                                    color: 'white',
                                    fontSize: 12
                                }
                            },
                            color:['#0166FF']
                        }
                    },
                    markLine: {
                        data: [{
                          name:'标记线',
                          yAxis:'',

                        }],
                        silent: true,
                        lineStyle: {//标注线样式
                            normal: {
                              type: 'solid',
                              color: 'red',//标注线颜色
                            },
                          },
     
                      }

                  }
                ]
            },
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        const {receiverResponseList=[],receiverID=[],filePath,lineCount} = {...this.props};
        const {echoValueList} = receiverResponseList[0];
        this.dealData(echoValueList, lineCount)
        this.setState({
            echoValueList,
            filePath,
            lineCount
        },()=>{
        })
    }
    componentWillReceiveProps(newProps) {
        const {receiverResponseList=[],receiverID=[],filePath,lineCount} = {...newProps};
        const {echoValueList,} = receiverResponseList[0];
        this.setState({
            echoValueList,
            filePath,
            lineCount
        },()=>{
        })
        this.dealData(echoValueList, lineCount)
    }

    componentWillUnmount(){
        if (myEcharts){
            myEcharts.dispose();
             myEcharts = null;
        }
    }
    dealData = (echoValueList, lineCount) => {
        if(echoValueList.length){
            let xdata = [];
            let ydata = [];
            for(let i = 0;i<echoValueList.length;i++){
                xdata.push((echoValueList[i].echoIndex/640000).toFixed(2))
                ydata.push(echoValueList[i].echo)
            }
            this.initEchart(xdata, ydata, lineCount)
        }
    }

    // ======忽略结束 ========
      initEchart = (xdata, ydata, lineCount) => {
        if (this.echartsBox){
            if (myEcharts == null){
                myEcharts = echarts.init(this.echartsBox);
            }
            if(myEcharts){
                let option = this.state.option;
                option.xAxis.data = xdata;
                option.series[0].markLine.data[0].yAxis = lineCount || '';
                option.series[0].data = ydata;
                myEcharts.setOption(option)
                myEcharts.on('finished', () => {
                    if (myEcharts) {
                        myEcharts.resize()
                    }

                })
            }
        }
           
      }

    closeModal = ()=>{
        this.setState({
            tableVisible:false
        })
    }
    queryAudio = ()=>{
        let params = {
            recordId:localStorage.remberId
        }
        service.queryDetectorRecord(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                    const {recordDto,receiverResponseList} = res.ret;
                   if (recordDto.status == 1) {
                        // 听音完成
                        this.setState({
                            filePath:res.ret?.receiverResponseList[0].filePath
                        })
              
                    }
                    
            }else{
                message.error(res.err)
                
            }
        })
    }
    render() {
        const {filePath,echoValueList} = this.state;
        return (
            <div  className={styles.newLeft}>
                <div className={styles.echartsStyle}>
                {echoValueList.length === 0 ? <div className={styles.echoResult}>本次听音未发现结果</div> : ''}
                   <div ref = {
                            (c) => {
                                this.echartsBox = c
                            }
                        }
                        style = {
                            {
                                width: '800px',
                                height: '240px',
                                pointerEvents: 'none'
                            }
                        }
                    />
                   
                 
                        <div className={styles.bottomFlex}>
                            <audio  src={filePath} controls></audio>
                        </div>
              
                </div> 
                    
         </div>
        )
    }
}

export default WholeBar;
