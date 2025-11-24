
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination } from 'antd';

import {service} from './service';
import styles from './standardStoreHistory.less';
import Edit from './edit';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'sgTrendHistory';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
let myEcharts = null;
let myEcharts1 = null;
 let singleTotalArr = [];
@connect(({sgTrendHistory}) => ({sgTrendHistory}))
class sgTrendHistory extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            machineList:[],
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
            optionDb:{
                title: {
                    text: '能量曲线图(单位:db)'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    // data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
                    show:false
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                    saveAsImage: {}
                    },
                    show:false
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    // {
                    //     name: 'Email',
                    //     type: 'line',
                    //     data: [120, 132, 101, 134, 90, 230, 210]
                    // },
                ]     
            },
            optionDensity:{
                title: {
                    text: '密度曲线图(单位:%)'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    // data: ['Email', 'Union Ads', 'Video Ads', 'Direct', 'Search Engine']
                    show:false
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                    saveAsImage: {}
                    },
                    show:false
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: []
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    // {
                    //     name: 'Email',
                    //     type: 'line',
                    //     data: [120, 132, 101, 134, 90, 230, 210]
                    // },
                ]     
            },
            standardLineVisible:false,
            detailDtoList:[],//选定记录列表
            db:"",
            density:"",
            total :0,
            selectedRowKeys:[],
            idList:[]
        }
    }
    componentDidMount(){
        const {sgTrendHistory} = this.props;
        const {machineList} = sgTrendHistory;
        this.setState({
            machineList,
        })
        this.getList(1)
    }
    componentWillReceiveProps(newProps) {
        const {sgTrendHistory} = {...newProps};
        const {machineList} = sgTrendHistory;
        this.setState({
            machineList,
        })
    
    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
    showTotal = (total)=>{
        return `合计 ${total} 条`;
    }
    pageOnChange = (page)=>{
        this.getList(page)
    }
    getList = (pagenum) => {
        const {cycleType,startTime,endTime,machineId,pointId,receiverId,speed,machineNo} = this.state;
        let filterPropertyMap = [
            {
                
                code: "tenantId",
                operate: "EQ",
                value: tenantId
            }
        ];
        
        if (machineId){
            filterPropertyMap.push(
                {
                    code: "machine_id",
                    operate: "EQ",
                    value: machineId
                },
            )
        }
      
        if (startTime) {
             filterPropertyMap.push(
                {
                    code: 'update_time',
                    operate: 'GTE',
                    value: startTime,
                }, {
                    code: 'update_time',
                    operate: 'LTE',
                    value: endTime,
                },
             )
         
        }

        let params = {
            filterPropertyMap,
            pageIndex:pagenum-1,
            pageSize: 10,
            sortValueMap: [{
                code: 'update_time',
                sort: 'desc',
            }, ],
        }
  
        service.findStandardList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if(res.ret){
                    let data = res.ret.items || [];
                    arr = data.map((item,index)=>{
                        return {
                            ...item,
                            index: (pagenum-1)*10 +index+1
                        }
                    })
                    this.setState({
                        historyList: arr,
                        total:res.ret.rowCount
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })
    }
    handleOk = (e) => {
        this.setState({
            machineVisible: false,
            singleDataVisible:false,
            standardLineVisible:false
        })
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
    }
    handleCancel = (e) => {
        this.setState({
            machineVisible: false,
            singleDataVisible:false,
            standardLineVisible:false
        })
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
    }

    chooseMachine =(e)=> {
        const {machineList} = this.state;
        for(let i = 0;i<machineList.length;i++){
            if(machineList[i].id == e){
                this.setState({
                    machineId:e
                })
            }
        }
    }
    lookData=(record,index)=>{
        this.setState({
            singleDataVisible:true,
            id:record.id
        })
    }
    // 设为使用中
    setUse = (record,index)=>{
        let params = {
            id:record.id
        }
        service.setUse(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('设置成功')
                this.getList(1);
            } else {
                message.error(res.err);
            }
        })
    }
    getEditClose = (result,msg)=>{
        this.setState({
            singleDataVisible:false
        })
        this.getList(1);
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let idList = []
        for(let i = 0;i<selectedRows.length;i++){
            idList.push(selectedRows[i].id)
        }
        this.setState({
            selectedRowKeys,
            idList
        });

    }
    render(){
        const tableStyle = {
            // bordered: true,
            loading: false,
            pagination: false,
            size: 'default',
            // rowSelection: {},
            scroll: undefined,
        }
        const { loading, selectedRowKeys ,selectedRowKeysCycle} = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                title: '曲线名称',
                dataIndex: 'name',
            },
            // {
            //     title: '创建时间',
            //     dataIndex: 'createTime',
            //     render: (text, record,index) => (
            //         <span>
            //             {record.createTime ? moment(record.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}
            //         </span>
            //     ),
            // },
            {
                title: '更新时间',
                dataIndex: 'updateTime',
                render: (text, record,index) => (
                    <span>
                        {record.updateTime ? moment(record.updateTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                    </span>
                ),
            }, 
            {
                title: '机型',
                dataIndex: 'machineName',
            },
            // {
            //     title: '状态',
            //     dataIndex: 'status',
            //     key: 'status',
            //     render: (text, record,index) => (
            //         <span>
            //             {record.status == 0 ? '' : '使用中'}
            //         </span>
            //     ),
            // },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.lookData(record,index)}> 编辑 </Button>
                    {/* {
                        record.status == 0 ?  < Button onClick={()=>this.setUse(record,index)} style={{marginLeft:'10px'}}> 设为使用中 </Button> : ''
                    } */}
                   
                    </span>
                ),
            }
        ];
        const {machineList,historyList,total} = this.state;
    return (
            <div className={styles.body}>
                <div style={{margin:'20px 0'}}>
                    < RangePicker onChange = {
                        this.dateChange.bind(this)
                    }
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
                    <Select placeholder="请选择机型" style={{margin:"0 10px",width:'200px'}} onChange={this.chooseMachine.bind(this)} >
                        {
                            (machineList || []).map((item,index)=>{
                                return (
                                      <Option value ={item.id} key={index}> {item.name} </Option>
                                )
                            })
                        }
                    </Select>
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList(1)}> 查询 </Button>
                </div>
                <Table rowSelection={rowSelection} rowKey='id' {...tableStyle} columns={columns} dataSource={historyList} />
                <Pagination onChange={this.pageOnChange} showTotal={this.showTotal.bind(this)} total={total} style={{margin:'20px 0',textAlign:"right"}}/>
                {this.state.singleDataVisible && <Edit id={this.state.id} parent={this}></Edit>}

            </div>
        )
    }
}

export default sgTrendHistory;
