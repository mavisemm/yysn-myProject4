import React, {Component} from 'react';
import styles from '../../autoReceiver.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service,service1 } from '../../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,DatePicker} from 'antd';
import moment, { localeData } from 'moment';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
let t = null;
let myEcharts = null;
let myEchartsBox = null;
const { MonthPicker, RangePicker } = DatePicker;
const { tenantId, userId, token } = vtxInfo;
let echartsArr = [];
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            option:{
                 title: {
                    text: '',
                    subtext: '',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    show:false
                },
                 color: ['green', 'red', '#9A60B4', '#ef6567', '#f9c956', '#3BA272'],
                series: [
                    {
                    name: '数据统计',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        // { value: 1048, name: 'Search Engine' },
                        // { value: 735, name: 'Direct' },
                        // { value: 580, name: 'Email' },
                        // { value: 484, name: 'Union Ads' },
                        // { value: 300, name: 'Video Ads' }
                    ],
                    emphasis: {
                        itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                    }
                ]
            },
            totalCount:'',
            totalDetailList:[]
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
    }
    componentWillUnmount() {
        this.disposeEcharts();
    }
    disposeEcharts = () => {
        if (echartsArr.length) {
            for (let i = 0; i < echartsArr.length; i++) {
                echartsArr[i].dispose();
            }
            echartsArr = [];
        }
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
         if (myEchartsBox) {
             myEchartsBox.dispose();
             myEchartsBox = null;
         }
    }
    // 统计
    statisticsDetectorGroup = ()=>{
        this.disposeEcharts();
        this.queryTotal();
        const { startTime, endTime} = this.state;
        let params = {
            startTime,
            endTime,
            tenantId: localStorage.tenantId,
            receiverGroupIdList: [this.props.receiverGroupId]
        }
      
        service1.statisticsDetectorGroup(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    staticsData: res.ret || [],
                })
                let arr = res.ret;
                for(let i = 0;i<arr.length;i++){
                    this.initPie(arr[i].pointId,arr[i].detailDtoList)
                }
            }else{
                message.error(res.err);
            }
        })
    }
    initPie = (id,detailDtoList)=>{
        let data = [];
        for(let i = 0;i<detailDtoList.length;i++){
            let temp = detailDtoList[i];
            data.push({
                value: temp.count,
                name: temp.qualityName + '——' + temp.count
            })
        }
        let myEcharts = echarts.init(document.getElementById(id));
        echartsArr.push(myEcharts);
        let option = this.state.option;
        option.series[0].data = data;
        myEcharts.setOption(option)
        // myEcharts.on('finished', () => {
        //     myEcharts.resize()
        // })
    }

    queryTotal = () => {
        this.disposeEcharts();
        const { startTime, endTime} = this.state;
        if (this.props.receiverGroupId == ''){
             message.error('请先选择听音器！');
             return false;
        }
        let params = {
            startTime,
            endTime,
            tenantId: localStorage.tenantId,
            receiverGroupIdList: [this.props.receiverGroupId]
        }
      
        service1.queryTotal(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0 && res.ret) {
                const {detailDtoList,totalCount} = res.ret;
                 let data = [];
                 for (let i = 0; i < detailDtoList.length; i++) {
                     let temp = detailDtoList[i];
                     data.push({
                         value: temp.count,
                         name: temp.qualityName + '——' + temp.count
                     })
                 }
                this.setState({
                    totalDetailList: detailDtoList || [],
                    totalCount
                })
                  if (this.echartsBox) {
                      myEchartsBox = echarts.init(this.echartsBox);
                       let option = this.state.option;
                      option.series[0].data = data;
                      myEchartsBox.setOption(option)
                    //   myEchartsBox.on('finished', () => {
                    //       myEchartsBox.resize()
                    //   })
                  }
            }else{
                message.error(res.err);
            }
        })
    }


    render() {
        const {staticsData,totalCount,totalDetailList  } = this.state;
        return (
            <div style={{width:'100%'}}>
                 <div className={styles.staticsTotal}>
                         <RangePicker
                            ranges={{ 
                                '今天': [moment().startOf('day'), moment().endOf('day')],
                                '最近三天': [moment().startOf('day').subtract(2, 'd'), moment().endOf('day')],
                                '最近一周': [moment().startOf('day').subtract(6, 'd'), moment().endOf('day')],
                                '本月': [moment().startOf('month'), moment().endOf('month')]
                            }}
                            showTime
                            format="YYYY/MM/DD HH:mm:ss"
                            onChange={this.dateChange.bind(this)}
                            />
                    <Button type='primary' style={{marginLeft:10}} onClick={()=>{this.statisticsDetectorGroup()}}>查询</Button>
                </div>
               <div className={styles.pointPage}>
                    <div className={styles.pointStyle}>
                          {
                                (staticsData || []).map((item,index)=>{
                                    return (
                                        <div key={index}  className={styles.pointData}>
                                            <div>
                                               <span style={{ color: '#108EE9'}}> 工位： </span>{item.pointName} &nbsp;&nbsp;<span style={{ color: '#108EE9'}}>总数： <span style={{fontSize:18,fontWeight:600,color:'#FF7840'}}>{item.totalCount}</span></span>
                                            </div>
                                            {
                                                (item.detailDtoList || []).map((itemp,indexp)=>{
                                                    return (
                                                        <span>
                                                            &nbsp;&nbsp;{itemp.qualityName}：{itemp.count}&nbsp;&nbsp;({(Number(itemp.countRate)*100).toFixed(2)}%)&nbsp;&nbsp;
                                                        </span>
                                                    )
                                                })
                                            }

                                            <div id={item.pointId} style={{width:300,height:200}}></div>
                                            
                                        </div>
                                    )
                                }) 
                            }

                             {/* 总工位统计 */}
                                <div  className={styles.pointData}>
                                    <div>
                                       <span style={{ color: '#108EE9'}}> 总工位： </span>&nbsp;&nbsp;<span style={{ color: '#108EE9'}}>总数： <span style={{fontSize:18,fontWeight:600,color:'#FF7840'}}>{totalCount}</span></span>
                                    </div>
                                    <div>
                                        {
                                            (totalDetailList || []).map((itemp, indexp) => {
                                                return (
                                                    <span key={indexp}>
                                                        &nbsp;&nbsp;{itemp.qualityName}：{itemp.count}&nbsp;&nbsp;({(Number(itemp.countRate)*100).toFixed(2)}%)&nbsp;&nbsp;
                                                    </span>
                                                )
                                            })
                                        }
                                    </div>
                              
                                    <div ref = {
                                        (c) => {
                                            this.echartsBox = c
                                        }
                                    }
                                    style = {
                                        {
                                            width: '300px',
                                            height: '200px',
                                        }
                                    }
                                    />
                                    
                                </div>

                    </div>
                
                </div>
            </div>
        )
    }
}

export default WholeBar;
