
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Popconfirm } from 'antd';
import {service} from './service';
import styles from './autoHistory.less';
import Edit from './edit';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'autoHistory';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import SideBar from '@src/pages/sideBar';
let myEcharts = null;
@connect(({autoHistory}) => ({autoHistory}))
class autoHistory extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            machineList:[],
            pointList:[],
            machineVisible:false,
            cycleType: 0,
            endTime: '',
            machineId: '',
            pointId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            startTime: '',
            historyList:[],
            singleDataVisible:false,
            compareDataVisible:false,
            frequencyList:[],
            standardLineVisible:false,
            detailDtoList:[],//选定记录列表
            machineNo:'',
            speedList:[],
            total :0,
            qualityList:[],
            weidu:"",
            type:'',
            id:'',
            copyVisible:false,
            page:1
        }
    }
    componentDidMount(){
        const {autoHistory} = this.props;
        const {machineList,pointList,qualityList} = autoHistory;
        this.setState({
            machineList,
            pointList,
            qualityList
        })
        this.getList(1)
    }
    componentWillReceiveProps(newProps) {
        const {autoHistory} = {...newProps};
        const {machineList,pointList,qualityList} = autoHistory;
        this.setState({
            machineList,
            pointList,
            qualityList
        })
    
    }
    // ===============================================查询条件==================================
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
                    pointFileUrl:machineList[i].pointFileUrl
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


    // ================================================查询条件结束=================================
    showTotal = (total)=>{
        return `合计 ${total} 条`;
    }
    pageOnChange = (page)=>{
        this.setState({
            page
        },()=>{
            this.getList()
        })
      
    }
    getList = () => {
        const {cycleType,startTime,endTime,machineId,pointId,receiverId,speed,machineNo,page} = this.state;
        let filterPropertyMap = [
            {
                
                code: "tenant_id",
                operate: "EQ",
                value: tenantId
            }
        ];
        if (cycleType != ''){
            filterPropertyMap.push({
                code: "cycle_type",
                operate: "EQ",
                value: cycleType
            }, )
        }
        if (machineId){
            filterPropertyMap.push(
                {
                    code: "machine_id",
                    operate: "EQ",
                    value: machineId
                },
            )
        }
        if (receiverId) {
            filterPropertyMap.push({
                code: "receiver_id",
                operate: "EQ",
                value: receiverId
            }, )
        }
        if (speed) {
            filterPropertyMap.push({
                code: "speed",
                operate: "EQ",
                value: speed
            }, )
        }
        if (startTime) {
             filterPropertyMap.push(
                {
                    code: 'create_time',
                    operate: 'GTE',
                    value: startTime,
                }, {
                    code: 'create_time',
                    operate: 'LTE',
                    value: endTime,
                },
             )
         
        }

        let params = {
            filterPropertyMap,
            pageIndex:page-1,
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
                            index: (page-1)*10 +index+1
                        }
                    })
                    this.setState({
                        page,
                        historyList: arr,
                        total:res.ret.rowCount,
                        copyVisible:false,
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
            standardLineVisible:false,
            compareDataVisible:false
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
            compareDataVisible:false,
            standardLineVisible:false
        })
        if (myEcharts) {
            myEcharts.dispose();
            myEcharts = null;
        }
    }


    lookData=(record,index)=>{
        this.setState({
            id: record.id,
            singleDataVisible:true,
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
    setNotUse=(record,index)=>{
        let params = {
            id: record.id
        }
        service.setNotUse(VtxUtil.handleTrim(params)).then(res => {
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
            singleDataVisible:false,
            compareDataVisible:false,
        })
        this.getList(1);
    }
    // 删除
    deleteMode = (record) => {
        this.setState({
            id: record.id,
        })
    }
    delete = (record)=>{
        const {id,weidu} = this.state;
        // 曲线
        service.deleteFrequency([id]).then(res => {
            if (res.rc == 0) {
                message.success('删除成功')
                this.getList(1);
            } else {
                message.error(res.err);
            }
        })

    }
    // ========================================================复制标准库==========================
    handleClose = ()=>{
        this.setState({
            copyVisible:false,
        })
    }
      chooseMachine1 =(e)=> {
        this.setState({
            machineId1:e,
        })
    }
    pointChange1 = (e) => {
        this.setState({
            pointId1: e,
        })
    }
    render(){
        const tableStyle = {
            // bordered: true,
            loading: false,
            pagination: false,
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
                title: '标准名称',
                dataIndex: 'name',
            },
            {
                title: '机型',
                dataIndex: 'machineName',
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
                dataIndex: 'cycleType',
                render: (text, record,index) => (
                    <span>
                        {record.cycleType == 0 ? '正转' : '反转'}
                    </span>
                ),
            },
        
            {
                title: '点位名称',
                dataIndex: 'pointName',
            },
            {
                title: '状态',
                dataIndex: 'status',
                render: (text, record,index) => (
                    <span style={{color:record.status == 0 ? 'red' :' green'}}>
                        {record.status == 0 ? '停用' : '使用中'}
                    </span>
                ),
            },
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
                title: '操作',
                key: 'action',
                width:'350',
                render: (text, record,index) => (
                    <span>
                        < Button type='primary' onClick={()=>this.lookData(record,index)}> 编辑 </Button>
                        < span className = "ant-divider" />
                        {
                            record.status == 0 ?  < Button onClick={()=>this.setUse(record,index)}> 启用 </Button> : 
                            < Button onClick={()=>this.setNotUse(record,index)}> 停用</Button>
                        }
                        < span className = "ant-divider" />
            
                        <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                            < Button type='danger' onClick={()=>this.deleteMode(record)}> 删除 </Button>
                        </Popconfirm>
                    </span>

                ),
            }
        ];
        const {machineList,pointList,historyList,speedList,total,machineId1,pointId1,name} = this.state;
    return (
        <Page title='自动建标历史管理' className="pageLayoutRoot">
            < SideBar parent={this}></SideBar>
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
            <div className={styles.body}>
                <div style={{marginBottom:'20px'}}>
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
                    <Select placeholder="请选择机型" style={{marginLeft:"10px",width:'200px',marginTop:'10px'}} onChange={this.chooseMachine.bind(this)} 
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
                    <Select placeholder="转速" style={{marginLeft:"10px",width:'60px',marginTop:'10px'}} onChange={this.chooseSpeed.bind(this)} >
                        {
                            (speedList || []).map((item,index)=>{
                                return (
                                      <Option value ={item.speed} key={index}> {item.speed} </Option>
                                )
                            })
                        }
                    </Select>
                    <Select placeholder="正反转" defaultValue="0"  style={{marginLeft:"10px",width:'60px',marginTop:'10px'}} onChange={this.modeChange.bind(this)} >
                      <Option value ='0' key='0'>正转</Option>
                      <Option value ='1' key='1'>反转</Option>
                    </Select>
                    <Select placeholder="请选择点位" style={{ width: 120,marginLeft:10,marginTop:'10px' }} onChange={this.pointChange.bind(this)} 
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
                    <Button type = "primary"  style={{marginLeft:10,marginTop:'10px'}} onClick={()=>this.getList(1)}> 查询 </Button>
                </div>
                <Table rowKey='id' {...tableStyle} columns={columns} dataSource={historyList} />
                <Pagination onChange={this.pageOnChange} showTotal={this.showTotal.bind(this)} total={total} style={{margin:'20px 0',textAlign:"right"}}/>
                {this.state.singleDataVisible && <Edit id={this.state.id} parent={this}></Edit>}
            </div>
                </div>
            </div>
        </Page>
        
        )
    }
}

export default autoHistory;
