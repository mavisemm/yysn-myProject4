
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch ,BackTop,Tabs } from 'antd';
import {service} from './service2';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import RViewerJS from 'viewerjs-react';
let dateString = '';
const Option = Select.Option;
import comm,{hostIp1} from '@src/config/comm.config.js';
const dateFormat = 'YYYY-MM-DD'; // 定义你需要的时间格式
class SearchPage extends React.Component {
    state = {
        cycleType: 0,
        endTime: '',
        machineId: '',
        receiverId: '',
        recordId: "",
        pointId:"",
        qualityId:"",
        speed: '',
        startTime: '',
        tableData:[],
        total:0,
        machineList:[],
        pointList:[],
        pointFileUrl:"",
        imgVisible:false,
        machineName:"",
        pointName:"",
        qualityList:[],
        speedList:[],
        recordId:"",
        judgeType:""
    }
    componentDidMount() {
        this.getMachineList();
        this.getPointList();
        this.getMode();
    }
    componentWillReceiveProps(newProps) {
 
    }
    getMachineList = ()=>{
        let params = {
            tenantId
        };
        service.getMachineList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret;
                    let arr = []
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].machineList) {
                            arr = arr.concat(data[i].machineList)
                        }
                    }
                    this.setState({
                        machineList:arr
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })
    }
    getPointList = ()=>{
        let params = {
            filterPropertyMap: [
                {
                    code: "tenantId",
                    operate: "EQ",
                    value: tenantId
                },
            ],
            sortValueMap: [{
                code: 'point_name',
                sort: 'asc'
            }]
        }
        service.getPointList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let pointList = []
                    pointList = res.ret.items.map(item => ({
                        ...item,
                        key: item.id,
                    }));
                    this.setState({
                        pointList
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })
    }
    getMode=()=>{
        let params = {
            filterPropertyMap: [{
                code: "tenantId",
                operate: "EQ",
                value: tenantId
            }],
        }
        service.getMode(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let arr = [{
                        name:"不限",
                        id:""
                    }]
                    let qualityList = res.ret.items.map(item => ({
                        ...item,
                        key: item.id,
                    }));
                    this.setState({
                        qualityList:arr.concat(qualityList)
                    })
                }

            } else {
                message.error(res.err);
            }
        })
    }
    //  ================================查询条件开始==================================
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
                let temp = machineList[i];
                this.setState({
                    speedList:temp.speedList || [],
                    machineId:e,
                    pointFileUrl:temp.pointFileUrl,
                    machineName:temp.name,
                })
            }
        }
    }
    pointChange = (e) => {
        const {pointList} = this.state;
        let temp = {};
        for(let i= 0;i<pointList.length;i++){
            if (pointList[i].id == e){
                temp = pointList[i];
            }
        }
        this.setState({
            pointId: e,
            receiverId:temp.receiverId,
            detectorId:temp.detectorId,
            pointName:temp.pointName,
        })
    }
    qualityChange = (e)=>{
        this.setState({
            qualityId:e
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
    judgeChange = (e) => {
        this.setState({
            judgeType: e
        })
    }
    chooseSpeed = (e)=>{
        this.setState({
            speed:e
        })
    }
    // ======================================查询条件结束================================================
    getImage = ()=>{
        this.setState({
            imgVisible:true
        })
    }
    handleClose = () =>{
        this.setState({
            imgVisible:false
        })
    }
    getList = ()=>{
        const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,qualityId,
            detectorId,machineName,pointName,recordId,judgeType,} = this.state;
        let params = {
            cycleType,
            endTime,
            machineId,
            receiverId,
            speed,
            startTime,
            machineNo,
            pointId,
            qualityId,
            detectorId,recordId,judgeType
        }
        this.props.parent.getList(this, params);
    }
    render(){
        const {
            machineList,
            pointList,
            speedList,
            machineNo, pointName, machineName, speed, qualityList,recordId,pointFileUrl
        } = this.state;
        return (
            <div>
                <div style={{marginBottom:"10px"}}>
                    <RangePicker onChange={this.dateChange.bind(this)}
                    style={{width:200}}
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
                    <Select defaultValue='请选择机型' style={{marginLeft:"10px",width:'200px'}} onChange={this.chooseMachine.bind(this)} 
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
                    {
                        speedList.length != 0 && <Select defaultValue='转速' style={{marginLeft:"10px",width:'60px'}} onChange={this.chooseSpeed.bind(this)} >
                             <Option value ={''} > 不限 </Option>
                            {
                                (speedList || []).map((item,index)=>{
                                    return (
                                        <Option value ={item.speed} key={index}> {item.speed} </Option>
                                    )
                                })
                            }
                        </Select>
                    }
                 
                    <Select placeholder="正反转" defaultValue="0"  style={{marginLeft:"10px",width:'60px'}} onChange={this.modeChange.bind(this)} >
                      <Option value ='0' key='0'>正转</Option>
                      <Option value ='1' key='1'>反转</Option>
                    </Select>
                    <Input addonBefore="设备编号："  style={{width:'250px',marginLeft:"10px"}} placeholder="请输入编号:" value={machineNo} name='machineNo'
                     onChange={this.inputChange.bind(this)} />
                    <Select defaultValue='请选择点位' style={{ width: 120,marginLeft:10, outline: 'none' }} onChange={this.pointChange.bind(this)}
                     filterOption={(input, option) => {
                        // 确保 children 是字符串，并且调用 toLowerCase()
                        const childrenStr = option.props.children.toString().toLowerCase();
                        return childrenStr.indexOf(input.toLowerCase()) >= 0;
                    }}
                    optionFilterProp="children" showSearch
                    >
                        {
                            (pointList || []).map((item, index) => {
                                return (
                                    <Option value ={item.id} key={index}> {item.pointName} </Option>
                                )
                            })
                        }
                    </Select>
                    <Select defaultValue='品质等级' style={{ width: 80,marginLeft:10, outline: 'none' }} onChange={this.qualityChange.bind(this)}>
                        {
                            (qualityList || []).map((item, index) => {
                                return (
                                    <Option value ={item.id} key={index}> {item.name} </Option>
                                )
                            })
                        }
                    </Select>
                    <Select placeholder="标签" defaultValue="0"  style={{marginLeft:"10px",width:'80px'}} onChange={this.judgeChange.bind(this)} >
                        <Option value ='0' key='0'>所有标签</Option>
                      <Option value ='1' key='1'>误判</Option>
                      <Option value ='2' key='2'>漏判</Option>
                    </Select>
                    <Input addonBefore="记录id："  style={{width:'250px',marginLeft:"10px"}} placeholder="请输入id:" value={recordId} name='recordId'
                     onChange={this.inputChange.bind(this)} />
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList()}> 查询 </Button>
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getImage()}> 查看机型点位分布 </Button>
                </div>

                
                < Modal title = "机型听筒点位分布图" 
                    visible = {this.state.imgVisible}
                    onOk = {()=>{this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                    {
                        pointFileUrl ? 
                            < RViewerJS >
                            < img src = { `${hostIp1}:36051/jiepai/hardware/device/type/das/soundDetector/wav-steam?fileName=${pointFileUrl}`} > 
                            </img></RViewerJS>
                        : '还未上传！'
                    }
                      
                </Modal>

            </div>

          
        )
    }
}

export default SearchPage;