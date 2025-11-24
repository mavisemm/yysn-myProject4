
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch,Popconfirm } from 'antd';
import {service,service1} from './service';
import styles from './sampleLibrary.less';
import Add from './Add';
import Edit from './Edit';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'sampleLibrary';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
@connect(({sampleLibrary}) => ({sampleLibrary}))
class sampleLibrary extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            machineList:[],
            pointList:[],
            turnType: 0,
            endTime: '',
            machineId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            startTime: '',
            tableData:[],
            speedList:[],
            pointId:'',
            detectorId:"",
            total:0,
            addVisible:false,
            editVisible:false,
            qualityList:[],
            templateId:"",
            templateIdSecond:"",
            querytemplateId:'',
            faultList:[],
            editInfo:{},
            id:""
        }
    }
    componentDidMount(){
        const {sampleLibrary} = this.props;
        const {machineList,pointList,qualityList,faultList,querytemplateId,deviationList} = sampleLibrary;
        this.setState({
            machineList,
            pointList,
            qualityList,
            faultList,
            querytemplateId,
            deviationList
        },()=>{
             this.getList(1)
        })
    }
    componentWillReceiveProps(newProps) {
        const {sampleLibrary} = {...newProps};
        const {machineList,pointList,qualityList,faultList,querytemplateId,deviationList} = sampleLibrary;
        this.setState({
            machineList,
            pointList,
            qualityList,
            faultList,
            querytemplateId,
            deviationList
        },()=>{
            this.getList(1)
        })
    
    }
    // ===========================================查询条件==============
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
    modeChange = (e) => {
        this.setState({
            turnType: e
        })
    }
    chooseSpeed = (e)=>{
        this.setState({
            speed:e
        })
    }
    qualityChange = (e)=>{
        this.setState({
            templateId:e
        })
    }
    faultChange = (e)=>{
        this.setState({
            templateIdSecond: e
        })
    }
    // ======================================查询条件结束===============
   
    showTotal=(total)=> {
        return `合计 ${total} 条`;
    }
    pageOnChange = (page) => {
        this.getList(page)
    }
    getList = (page) =>{
        const {turnType,startTime,endTime,machineId,templateIdSecond,speed,pointId,
            templateId} = this.state;
        let filterPropertyMap = [
            {
                code: 'update_time',
                operate: 'GTE',
                value: startTime
            },
            {
                code: 'update_time',
                operate: 'LTE',
                value: endTime
            },
            {
                code: "tenant_id",
                operate: "EQ",
                value: tenantId
            },
            {
                code: "machine_id",
                operate: "EQ",
                value: machineId
            },
            {
                code: "machine_speed",
                operate: "EQ",
                value: speed
            },
            {
                code: "point_id",
                operate: "EQ",
                value: pointId
            },
            {
                code: "turn_type",
                operate: "EQ",
                value: turnType
            },
            {
                code: "quality_template_id",
                operate: "EQ",
                value: templateId
            },
            {
                code: "quality_second_id",
                operate: "EQ",
                value: templateIdSecond
            },

        ]
        let params = {
            filterPropertyMap: filterPropertyMap.filter((item) => {
                return item.value
            }),
            pageIndex: page - 1,
            pageSize: 10,
            sortValueMap: [{
                code: 'update_time',
                sort: 'desc'
            }]
        };
        service1.getList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if(res.ret){
                     let data = res.ret.items || [];
                     arr = data.map((item, index) => {
                         return {
                             ...item,
                             index: (page - 1) * 10 + index + 1
                         }
                     })
                    this.setState({
                        tableData:arr,
                        total: res.ret.rowCount
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })

    }
    // 状态修改
    setUse = (record)=>{
        if (record.groupStatus == 0) {
            service1.use({id:record.id}).then(res => {
                if (res.rc == 0) {
                    message.success('成功');
                    this.getList(1)
                } else {
                    message.error(res.err);
                }
            })
        }else{
            service1.notUse({id:record.id}).then(res => {
                if (res.rc == 0) {
                    message.success('成功');
                    this.getList(1)
                } else {
                    message.error(res.err);
                }
            })
        }
   
    }
    // 删除
    deleteMode = (record) => {
        this.setState({
            id: record.id,
        })
    }
    delete = (record)=>{
        let id = this.state.id;
        service1.delete([id]).then(res => {
                if (res.rc == 0) {
                    message.success('成功');
                    this.getList(1)
                } else {
                    message.error(res.err);
                }
            }) 
    }
    // 编辑
    edit= (record)=>{
        this.setState({
            editInfo:record,
            editVisible:true
        })
    }

    openAdd = ()=>{
        this.setState({
            addVisible:true
        })
    }

    getChildClose = ()=>{
        this.setState({
            addVisible:false,
            editVisible:false
        },()=>{
            this.getList(1)
        })
    }

    render(){
        const tableStyle = {
            bordered: false,
            loading: false,
            pagination: false,
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
                title: '库名称',
                dataIndex: 'groupName',
            },
            {
                title: '机型',
                dataIndex: 'machineName',
            },
            {
                title: '转速',
                dataIndex: 'machineSpeed',
            },
            {
                title: '转向',
                dataIndex: 'turnType',
                render: (text, record,index) => (
                    <span>
                        {record.turnType == 0 ? '正转' : '反转'}
                    </span>
                ),
            },
            {
                title: '点位',
                dataIndex: 'pointName',
            },
            {
                title: '品质等级',
                dataIndex: 'qualityTemplateName',
            },
            {
                title: '故障类型',
                dataIndex: 'qualitySecondName',
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
                title: '状态',
                dataIndex: 'groupStatus',
                render: (text, record,index) => (
                    <span>
                        {record.groupStatus == 0 ? '停用' : '使用中'}
                    </span>
                ),
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                        < Button onClick={()=>this.setUse(record,index)}>
                            {
                                record.groupStatus == 0 ? '启用' : '停用'
                            }
                        </Button>
                        < span className = "ant-divider" />
                        < Button onClick={()=>this.edit(record,index)}> 编辑 </Button>
                        < span className = "ant-divider" />
                        <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                            < Button type='danger' onClick={()=>this.deleteMode(record)}> 删除 </Button>
                        </Popconfirm>
                    </span>
                ),
            }
        ];

    const { loading, selectedRowKeys} = this.state;

    const {machineList, templateId,pointList,tableData,speedList,addVisible,qualityList,querytemplateId,faultList,editVisible,editInfo} = this.state;
    return (
            <div className={styles.body}>
                <div style={{marginBottom:"10px"}}>
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
                    <Select placeholder="请选择机型" style={{marginLeft:10,width:'200px'}} onChange={this.chooseMachine.bind(this)} 
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

                    <Select placeholder="请选择点位" style={{ width: 120, outline: 'none',marginLeft:10, }} onChange={this.pointChange.bind(this)} 
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
                    <Select placeholder="请选择品质等级" style={{ width: 100, outline: 'none',marginLeft:10,}} onChange={this.qualityChange.bind(this)}>
                        {
                            (qualityList || []).map((item, index) => {
                                return (
                                    <Option value ={item.id} key={index}> {item.name} </Option>
                                )
                            })
                        }
                    </Select>
                    {
                        querytemplateId == templateId ?     <Select placeholder="故障类型" style={{ width: 100, outline: 'none',marginLeft:10,}} onChange={this.faultChange.bind(this)}>
                            {
                                (faultList || []).map((item, index) => {
                                    return (
                                        <Option value ={item.id} key={index}> {item.faultName} </Option>
                                    )
                                })
                            }
                        </Select> :""
                    }
                
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList(1)}> 查询 </Button>
      
                </div>
                <BtnWrap>
                    <Button type = "primary"  style={{marginLeft:10}} onClick={this.openAdd.bind(this)}> 新增 </Button>
                </BtnWrap>
        
                <Table rowKey={record => record.id} {...tableStyle} columns={columns} dataSource={tableData} />
                <Pagination size="small" total={this.state.total} showSizeChanger onChange={this.pageOnChange} showQuickJumper showTotal={this.showTotal.bind(this)} style={{margin:'20px 0',textAlign:"right"}}/>
                {addVisible && <Add parent={this}></Add>}
                {editVisible && <Edit parent={this} editInfo={editInfo}></Edit>}
                
            </div>
        )
    }
}

export default sampleLibrary;
