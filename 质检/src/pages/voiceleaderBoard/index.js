/**
 * 领导看板
 * author : vtx shh
 * createTime : 2021-08-13 16:47:36
 */
import React from 'react';
import { connect } from 'dva';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Checkbox,DatePicker} from 'antd';
import {service} from './service';
import styles from './voiceleaderBoard.less';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const { MonthPicker, RangePicker } = DatePicker;
const namespace = 'voiceleaderBoard';
const Option = Select.Option;
import moment from 'moment';
import echarts from 'echarts';
let myEcharts = null;
@connect(({voiceleaderBoard}) => ({voiceleaderBoard}))
class voiceleaderBoard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            startTime:"",
            endTime:"",
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
                    left: 'left'
                },
                series: [
                    {
                        // name: '',
                        type: 'pie',
                        radius: '50%',
                        data: [
                            // { value: 1048, name: 'Search Engine' },
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
            totalCount:"",
            startTime1:"",
            endTime1:"",
            startTime2:"",
            endTime2:"",
            rankList:[],
            detectorList:[],
            templateId:""
        }
    }
    componentDidMount(){
    }
    componentWillReceiveProps(newProps) {
     }
    componentWillUnmount(){
        if(myEcharts){
            myEcharts.dispose();
            myEcharts = null;
        }
    }
    // dateChange = (date, dateString) => {
    //     this.setState({
    //         startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
    //         endTime: moment(dateString[1] + ' 23:59:59').valueOf()
    //     })
    // }
    timeChange = (value, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
    }
    queryTotal = ()=>{
        const {startTime,endTime} = this.state;
        let params = {
            startTime,
            endTime,
            tenantId
        }
        service.queryTotal(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.setState({
                        totalCount: res.ret.totalCount,
                        detailDtoList: res.ret.detailDtoList || []
                    }, () => {
                        this.initPie();
                    })
                }
       
            } else {
                message.error(res.err);
            }
        })
    }
    initPie = ()=>{
        const {detailDtoList,totalCount} = this.state;
        let data = [];
        for(let i = 0;i<detailDtoList.length;i++){
            let temp = detailDtoList[i];
            data.push({
                value: temp.count,
                name: temp.qualityName + temp.count
            })
        }
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
        if (this.echartsBox) {
            myEcharts = echarts.init(this.echartsBox);
            let option = this.state.option;
            option.title.text = '检测总数' + totalCount;
            option.series[0].data = data;
            myEcharts.setOption(option)
            myEcharts.on('finished', () => {
                myEcharts.resize()
            })
        }
    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime1: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime1: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    dateChange2 = (date, dateString) => {
        this.setState({
            startTime2: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime2: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    statisticsDetector = ()=>{
        const {startTime1,endTime1} = this.state;
        let params = {
            startTime:startTime1,
            endTime:endTime1,
            tenantId
        }
        service.statisticsDetector(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.setState({
                        detectorList: res.ret || [],
                    })
                }
       
            } else {
                message.error(res.err);
            }
        })
    }
    statisticsRank = ()=>{
         const {startTime2,endTime2,templateId} = this.state;
        let params = {
            startTime: startTime2,
            endTime: endTime2,
            templateId,
            tenantId
        }
        service.statisticsRank(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.setState({
                        rankList: res.ret || []
                    })
                }
       
            } else {
                message.error(res.err);
            }
        })
    }
    modeChange =(e) =>{
        this.setState({
            templateId:e
        })
    }
    render(){
        const {voiceleaderBoard} = this.props;
        const {detectorList,rankList,} = this.state;
        const {qualityList} = voiceleaderBoard;
        return (
            <div className={styles.body}>
                <div className={styles.wrapperTop}>
                    <div className={styles.wrapperTopLeft}>
                        <div className={styles.title}>检测数量统计分析</div>
                        <div>
                            <RangePicker
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY-MM-DD HH:mm"
                                placeholder={['开始时间', '结束时间']}
                                onChange={this.timeChange}
                            />
                            <Button type='primary' style={{marginLeft:10}} onClick={this.queryTotal.bind(this)}>查询</Button>
                        </div>
                    
                        <div ref = {
                                (c) => {
                                    this.echartsBox = c
                                }
                            } 
                            style = {
                                {
                                    width: '500px',
                                    height: '300px',
                                }
                            }
                        /> 
                    </div>
                    <div className={styles.wrapperTopRight}>
                        <div className={styles.title}>生产线统计</div>
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
                            <Button type='primary' style={{marginLeft:10}} onClick={this.statisticsDetector.bind(this)}>查询</Button>
                        </div>
                        <div>
                            {
                                (detectorList || []).map((item,index)=>{
                                    return (
                                        <div key={index}>
                                            <div className={styles.detectorName}>{item.groupName}：</div>
                                            <div className={styles.flex}>
                                                <div>生产数量：{item.totalCount}&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                                {
                                                    (item.detailDtoList || []).map((itemp,indexp)=>{
                                                        return (
                                                            <div key={indexp}>
                                                                {itemp.qualityName}:{itemp.count}次,&nbsp;&nbsp;&nbsp;&nbsp;占比{Number(itemp.countRate)*100}%&nbsp;&nbsp;
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                     
                    </div>

                </div>
                <div className={styles.bottom}>
                    <div className={styles.title}>生产设备质量统计排名</div>
                    <div>
                        <RangePicker onChange={this.dateChange2.bind(this)}
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
                        <Select placeholder='请选择排序方式' style={{ width: 150,marginLeft:10}}  onChange={this.modeChange.bind(this)}>
                            {
                                (qualityList || []).map((item, index) => {
                                    return (
                                        <Option value={item.id} key={index}> {item.name} </Option>
                                    )
                                })
                            }
                        </Select>
                        <Button type='primary' style={{marginLeft:10}} onClick={this.statisticsRank.bind(this)}>查询</Button>
                    </div>

                    <div>
                        {
                            (rankList || []).map((item,index)=>{
                                return (
                                    <div key={index}>
                                        <div className={styles.detectorName}>{item.machineName}：</div>
                                        <div className={styles.flex}>
                                            <div>生产数量：{item.totalCount}&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                            {
                                                (item.detailDtoList || []).map((itemp,indexp)=>{
                                                    return (
                                                        <div key={indexp}>
                                                            {itemp.qualityName}:{itemp.count}次,&nbsp;&nbsp;&nbsp;&nbsp;占比{Number(itemp.countRate)*100}%&nbsp;&nbsp;
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                   
                </div>
     
            </div>
            )
        }
}

export default voiceleaderBoard;
