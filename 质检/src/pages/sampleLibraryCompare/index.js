
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch } from 'antd';

import {service,service1} from './service';
import styles from './sampleLibraryCompare.less';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'sampleLibraryCompare';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
let myEchartsSingle = null;
let filePath = '';
@connect(({sampleLibraryCompare}) => ({sampleLibraryCompare}))
class sampleLibraryCompare extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            machineList:[],
            pointList:[],
            cycleType: 0,
            endTime: '',
            machineId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            startTime: '',
            historyList:[],
            singleDataVisible:false,
            frequencyList:[],
            speedList:[],
            pointId:'',
            detectorId:"",
            total:0,
            optionSingle:{
                title: {
                    text: '密度、能量曲线图',
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
                    data: ['密度', '能量'],
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
                    data:[]
                }],
                yAxis: [{
                        name: '能量(db)',
                        type: 'value',
                        axisLabel: {
                            show: true,
                        },
                        nameTextStyle: { //y轴上方单位的颜色
                            color: '#fff'
                        },
                        scale:true
 
                    },
                    {
                        name: '密度(%)',
                     //    nameLocation: 'start',
                        alignTicks: true,
                        type: 'value',
                        axisLabel: {
                            show: true,
                       
                        },
                        nameTextStyle: { //y轴上方单位的颜色
                            color: '#fff'
                        },
                        splitLine: {
                            show: false
                        },
                     //    inverse: true
                    },
 
                ],
 
                series: [{
                        name: '能量',
                        type: 'line',
                        lineStyle: {
                            width: 1
                        },
                        axisLabel: {
                            show: true,
                      
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: {
                            normal: {
                                color: '#0090A3',
                                lineStyle: {
                                    color: '#0090A3'
                                }
                            }
                        },
                     data: []
                    },
                    {
                        name: '密度',
                        type: 'line',
                        yAxisIndex: 1,
                        lineStyle: {
                            width: 1
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        itemStyle: {
                            normal: {
                                color: 'pink',
                                lineStyle: {
                                    color: 'pink'
                                }
                            }
                        },
                     data: []
                    }
                ]
 
            },
            selectedRows:[],
            compareVisible:false,
            responseList:[]
        }
    }
    componentDidMount(){
        const {sampleLibraryCompare} = this.props;
        const {machineList,pointList} = sampleLibraryCompare;
             this.setState({
                 machineList,
                 pointList
             })
    }
    componentWillReceiveProps(newProps) {
        const {sampleLibraryCompare} = {...newProps};
        const {machineList,pointList} = sampleLibraryCompare;
        this.setState({
            machineList,
            pointList
        })
    
    }
    disposeEcharts = ()=>{
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
            
    }
    handleClose = () =>{
        this.setState({
            singleDataVisible:false,
            imgVisible:false,
            compareVisible:false
        })
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
    }

    getList = () =>{
        this.disposeEcharts();
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
        service1.findList(VtxUtil.handleTrim(params)).then(res => {
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
                        historyList:arr,
                        total:arr.length
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })

    }

// =========================查询条件=======================================
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    chooseMachine =(e)=> {
        const {machineList} = this.state;
        for(let i = 0;i<machineList.length;i++){
            if(machineList[i].id == e){
                this.setState({
                    speedList:machineList[i].speedList,
                    machineId:e,
                })
            }
        }
    }

    pointChange = (e) => {
        const {pointList} = this.state;
        let receiverId = '';
        let detectorId = '';
        for(let i= 0;i<pointList.length;i++){
            if (pointList[i].id == e){
                receiverId = pointList[i].receiverId;
                detectorId = pointList[i].detectorId
            }
        }
        this.setState({
            pointId: e,
            receiverId,
            detectorId
        })
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    modeChange = (e) => {
        this.setState({
            cycleType: e
        })
    }
    chooseSpeed = (e)=>{
        this.setState({
            speed:e
        })
    }
// =================================查询条件结束===================================
    // 查看某条记录的频率数据图
    lookData=(record,index)=>{
        filePath = record.filePath;
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
                        frequencyList:res.ret.frequencyDtoList || []
                    })
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
                             dbArr.push(data[i].db.toFixed(2));
                         }
                    }
                    if (this.echartsBoxSingle) {
                        if (myEchartsSingle == null) {
                            myEchartsSingle = echarts.init(this.echartsBoxSingle);
                        }
                        if (myEchartsSingle) {
                             let optionSingle = JSON.parse(JSON.stringify(this.state.optionSingle));
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

    getCompare = (record)=>{
        const {pointId} = this.state;
        let params = {
            recordId:record.id,
            pointId
        }
        service1.compare(params).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.setState({
                        responseList: res.ret.responseList || [],
                        compareVisible:true
                    })
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
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                        < Button onClick={()=>this.lookData(record,index)}> 查看曲线图 </Button>
                         < span className = "ant-divider" />
                        < Button onClick={()=>this.getCompare(record)}> 比对 </Button>
                    </span>
                ),
            }
        ];
        //  const columns1 = [
        //     {
        //         title: '频率(Hz)',
        //         dataIndex: '',
        //         render: (text, record,index) => (
        //             <span>
        //                 {Math.sqrt(Number(record.freq1) * Number(record.freq2)).toFixed(0)}
        //             </span>
        //         ),
        //     },
          
        //     {
        //         title: '能量(db)',
        //         dataIndex: 'db',
        //         render: (text, record,index) => (
        //             <span>
        //                 {record.db.toFixed(2)}
        //             </span>
        //         ),
        //     },
        //     {
        //         title: '密度(%)',
        //         dataIndex: 'density',
        //         render: (text, record,index) => (
        //             <span>
        //                 {record.density.toFixed(3)}
        //             </span>
        //         ),
        //     },
        // ];

          const columns1 = [
            {
                title: '品质等级名称',
                dataIndex: 'templateName',
            },
          
            {
                title: '偏离度',
                dataIndex: 'value',
            },
            {
                title: '偏离度参数组名称',
                dataIndex: 'conditionName',
            },
            {
                title: '故障类型',
                dataIndex: 'faultName',
            },
        ];

        const { loading, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
        };

        const {
            machineList,
            pointList,
            historyList,
            frequencyList,
            speedList,
            machineNo, responseList
        } = this.state;
    return (
            <div className={styles.body}>
                <div style={{marginBottom:"10px"}}>
                    <RangePicker onChange={this.dateChange.bind(this)} 
                     ranges = {
                         {
                             今天: [moment().startOf('day').subtract(0, 'd'), moment().endOf('day')],
                             最近一周: [moment().startOf('day').subtract(6, 'd'), moment().endOf('day')],
                             最近一个月: [moment().startOf('day').subtract(30, 'd'), moment().endOf('day')],
                             最近三个月: [moment().startOf('day').subtract(90, 'd'), moment().endOf('day')],
                         }
                     }
                     showTime = {
                         {
                             hideDisabledOptions: true,
                             defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                         }
                     }
                    />
                    <Select placeholder="请选择机型" style={{width:'200px',marginLeft:10}} onChange={this.chooseMachine.bind(this)} 
                           filterOption={(input, option) => {
                            // 确保 children 是字符串，并且调用 toLowerCase()
                            const childrenStr = option.props.children.toString().toLowerCase();
                            return childrenStr.indexOf(input.toLowerCase()) >= 0;
                        }}
                        optionFilterProp="children" showSearch>
                        {
                            (machineList || []).map((item,index)=>{
                                return (
                                      <Option value ={item.id} key={index}> {item.name} </Option>
                                )
                            })
                        }
                    </Select>
                    <Select placeholder="转速" style={{marginLeft:10,width:'80px'}} onChange={this.chooseSpeed.bind(this)} >
                        {
                            (speedList || []).map((item,index)=>{
                                return (
                                      <Option value ={item.speed} key={index}> {item.speed} </Option>
                                )
                            })
                        }
                    </Select>
                    <Select placeholder="正反转" defaultValue="0"  style={{marginLeft:10,width:'60px'}} onChange={this.modeChange.bind(this)} >
                      <Option value ='0' key='0'>正转</Option>
                      <Option value ='1' key='1'>反转</Option>
                    </Select>
                    <Input addonBefore="请输入设备编号：" style={{width:'300px',marginLeft:10}} placeholder="请输入编号:" value={machineNo} name='machineNo'
                     onChange={this.inputChange.bind(this)} />
                    <Select placeholder="请选择点位" style={{ width: 120, outline: 'none',marginLeft:10 }} onChange={this.pointChange.bind(this)} 
                           filterOption={(input, option) => {
                            // 确保 children 是字符串，并且调用 toLowerCase()
                            const childrenStr = option.props.children.toString().toLowerCase();
                            return childrenStr.indexOf(input.toLowerCase()) >= 0;
                        }}
                        optionFilterProp="children" showSearch>
                        {
                            (pointList || []).map((item, index) => {
                                return (
                                    <Option value ={item.id} key={index}> {item.pointName} </Option>
                                )
                            })
                        }
                    </Select>
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList()}> 查询 </Button>
                </div>
                <Table rowKey={record => record.id} columns={columns} dataSource={historyList} />

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
                        
                        <div ref = {
                            (c) => {
                                this.echartsBoxSingle = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '300px',
                            }
                        }
                    /> 
                    {/* <Table {...tableStyle}   columns={columns1} dataSource={frequencyList} /> */}
                </Modal>

                {/* 比对结果 */}
                 < Modal title = "比对详情" 
                    visible = {this.state.compareVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="60%"
                    >
                        <Table {...tableStyle}   columns={columns1} dataSource={responseList} />
                </Modal>

            </div>
        )
    }
}

export default sampleLibraryCompare;
