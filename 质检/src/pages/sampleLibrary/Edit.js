
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap, Iframe } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Switch } from 'antd';

import {service,service1} from './service';
import styles from './sampleLibrary.less';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'sampleLibrary';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import echarts from 'echarts';
import { first,uniqBy  } from 'lodash';
 let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
 let singleTotalArr = [];
 let XARR = [];
 const Option = Select.Option;
@connect(({sampleLibrary}) => ({sampleLibrary}))
class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            machineList:[],
            pointList:[],
            machineVisible:false,
            turnType: 0,
            endTime: '',
            machineId: '',
            pointId: '',
            receiverId: '',
            recordId: "",
            machineSpeed: '',
            startTime: '',
            tableData:[],
            detailDtoList:[],//选定记录列表
            machineNo:'',
            speedList:[],
            Visible:true,
            startdetailDtoList:[],
            qualityList: [],
            querytemplateId: '',
            faultList: [],
            groupName:"",
            qualityVisible:false,
            qualitySampleDetailDtoList:[],
            deviationList:[],
            relation:1,
            viewVisible:false,
            exampleList:[],
            editInfo:{},
            selectedList:[],
            selectedRowKeysHistory:[],
            detailDtoListTotal:[],
            newdetailDtoList:[],
            qualityTemplateId:"",
            qualitySecondId:"",
            confirmFlag:false,
        }
    }
    componentDidMount(){
        const {sampleLibrary,editInfo} = this.props;
        const {machineList,pointList,qualityList,faultList,querytemplateId,deviationList} = sampleLibrary;
        const {groupName,turnType,receiverId,machineSpeed,pointId,qualitySecondId,
        qualityTemplateId,machineId,machineNo,confirmFlag} = editInfo;
        this.setState({
            machineList,
            pointList,
            qualityList, 
            faultList,
            querytemplateId,
            deviationList,
            editInfo,
            groupName, turnType, receiverId, machineSpeed, pointId, qualitySecondId, 
            qualityTemplateId, machineId, machineNo,confirmFlag
        },()=>{
            this.findListByIdList();
        })
    }
    componentWillReceiveProps(newProps) {
        const {sampleLibrary,editInfo} = {...newProps};
        const {machineList,pointList,qualityList,faultList,querytemplateId,deviationList} = sampleLibrary;
        this.setState({
            machineList,
            pointList,
            qualityList, 
            faultList, 
            querytemplateId,
            deviationList,
            editInfo,
            groupName: editInfo.groupName
        },()=>{
             this.findListByIdList();
        })
    }
    disposeEcharts = ()=>{
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }
        if (myEchartsDensity) {
            myEchartsDensity.dispose();
            myEchartsDensity = null;
        }
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
            
    }         
    handleCancel = (e) => {
        this.setState({
            Visible: false,
        })
        this.disposeEcharts();
        this.props.parent.getChildClose(this,false)
    }
    // 查询所有声音数据
    findList = () => {
        const {turnType,startTime,endTime,machineId,receiverId,machineSpeed,machineNo,pointId,
            detectorId,qualityTemplateId,qualitySecondId} = this.state;
        let params = {
            cycleType:turnType,
            machineId,
            receiverId,
            speed: machineSpeed,
            startTime,
            endTime,
            machineNo,
            pointId,
            detectorId,
            qualityId:qualityTemplateId,
            faultId:qualitySecondId
        }
        
        service1.findList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret;
                    let arr = [];
                    arr = data.map((item,index)=>{
                        return {
                            ...item,
                            detectTime: item.detectTime?moment(item.detectTime).format('YYYY-MM-DD HH:mm:ss') : '',
                            index:index+1
                        }
                    })
                    this.setState({
                        tableData:arr
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })

    }
    // 根据id查询记录
    findListByIdList = () => {
        const {detailDtoList,receiverId} = this.props.editInfo;
        let idList = []
        for(let i = 0;i<detailDtoList.length;i++){
            idList.push(detailDtoList[i].recordId)
        }
        let params = {
            idList,
            receiverId
        }
        service.findListByIdList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let selectedRowKeys = [];
                    let detailDtoList = [];
                    for(let i = 0;i<res.ret.length;i++){
                        selectedRowKeys.push(res.ret[i].id)
                        detailDtoList.push({
                            receiverId:res.ret[i].receiverId,
                            detectTime:res.ret[i].detectTime,
                            groupId: res.ret[i].groupId,
                            recordId: res.ret[i].id,
                        })
                    }
                     let arr = [];
                     arr = res.ret.map((item, index) => {
                         return {
                             ...item,
                             index: index + 1
                         }
                     })
                    this.setState({
                        selectedList:arr || [],
                        selectedRowKeys,
                        detailDtoList,
                        receiverId,
                    },()=>{
                        this.dealSelectedData();
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }

    // 已选定的曲线列表数据
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let detailDtoList = [];
        for(let i = 0;i<selectedRows.length;i++){
            detailDtoList.push({
                  recordId: selectedRows[i].id,
            })
        }
        this.setState({
            selectedRowKeys,
            detailDtoList
        }, () => {
            if (detailDtoList.length) {
                 this.dealSelectedData();
            }else{
                singleTotalArr = [];
                this.disposeEcharts();
            }
        });
    }

    onSelectChangeHistory = (selectedRowKeys, selectedRows) => {
         let newdetailDtoList = []
         for (let i = 0; i < selectedRows.length; i++) {
             newdetailDtoList.push({
                 groupId: selectedRows[i].groupId,
                 recordId: selectedRows[i].id,
                 detectTime: selectedRows[i].detectTime,
                 receiverId: selectedRows[i].receiverId,
             })
         }
        this.setState({
            selectedRowKeysHistory: selectedRowKeys,
            newdetailDtoList
        }, () => {
            this.dealSelectedData();
        });
       
    }

    dealSelectedData = ()=>{
        const {detailDtoList,newdetailDtoList} = this.state;
        let detailDtoListTotal = [];
        let tempArr = detailDtoList.concat(newdetailDtoList);
        detailDtoListTotal = uniqBy(tempArr, 'recordId');
        let recordIdList = [];
        for (let i = 0; i < detailDtoListTotal.length; i++) {
            recordIdList.push(detailDtoListTotal[i].recordId)
        }
        this.setState({
            detailDtoListTotal
        },()=>{
            this.getSingle(recordIdList)
        })

    }
   
    getSingle = (recordIdList) => {
        singleTotalArr = [];
        const {receiverId} = this.state;
        // 去重
        let params = {
            recordIdList,
            receiverId
        }
        service.findFrequencyListByList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                    let ret = res.ret;
                    for (let i = 0; i < ret.length; i++) {
                        XARR = [];
                        let densityArr = [];
                        let dbArr = [];
                        for (let j = 0; j < ret[i].frequencyDtoList.length; j++) {
                            let temp = ret[i].frequencyDtoList[j];
                            XARR.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                            densityArr.push(Number(temp.density.toFixed(3)));
                            if (temp.db == 0) {
                                dbArr.push(undefined);
                            } else {
                                dbArr.push(temp.db.toFixed(2));
                            }

                        }
                        singleTotalArr.push({
                            detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                            densityArr,
                            dbArr
                        })
                    }
                    this.dealEcharts();
            } else {
                message.error(res.err);
            }
        })
       
    }

    dealEcharts = ()=>{
          this.disposeEcharts();
        let totaldbArr = [];
        let totaldensityArr = [];
        for (let j = 0; j < singleTotalArr.length; j++) {
            totaldbArr.push({
                name: singleTotalArr[j].detectTime,
                type: "line",
                data: singleTotalArr[j].dbArr
            })
            totaldensityArr.push({
                name: singleTotalArr[j].detectTime,
                type: "line",
                data: singleTotalArr[j].densityArr
            })
        }
    
        if (this.echartsBoxDb) {
            if (myEchartsDb == null) {
                myEchartsDb = echarts.init(this.echartsBoxDb);
            }
            if (myEchartsDb) {
                let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                optionDb.xAxis[0].data = XARR || [];
                optionDb.series = totaldbArr || [];
                myEchartsDb.setOption(optionDb)
                // myEchartsDb.on('finished', () => {
                //     if (myEchartsDb) {
                //         myEchartsDb.resize()
                //     }
                // })
            }
        }

        if (this.echartsBoxDensity) {
            if (myEchartsDensity == null) {
                myEchartsDensity = echarts.init(this.echartsBoxDensity);
            }
            if (myEchartsDensity) {
                let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                optionDensity.xAxis[0].data = XARR || [];
                optionDensity.series = totaldensityArr || [];
                myEchartsDensity.setOption(optionDensity)
                // myEchartsDensity.on('finished', () => {
                //     if (myEchartsDensity) {
                //         myEchartsDensity.resize()
                //     }
                // })
            }
        }
    }

    //======== ========查询条件开始================
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
                    machineName: machineList[i].name,
                })
            }
        }
    }
    pointChange = (e) => {
        const {pointList} = this.state;
        let temp = '';
        for(let i= 0;i<pointList.length;i++){
            if (pointList[i].id == e){
                temp = pointList[i];
      
            }
        }
        this.setState({
            pointId: e,
            receiverId: temp.receiverId,
            detectorId: temp.detectorId
        })
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    modeChange = (e) => {
        this.setState({
            turnType: e
        })
    }
    chooseSpeed = (e)=>{
        this.setState({
            machineSpeed: e
        })
    }
    qualityChange = (e)=>{
        const {querytemplateId} = this.state;
        if (e == querytemplateId){

        }else{
            this.setState({
                qualitySecondId:""
            })
        }
        this.setState({
            qualityTemplateId:e
        })
    }
    faultChange = (e)=>{
        this.setState({
            qualitySecondId: e
        })
    }
    //================ 查询条件结束============
    // 1.全选、2.全不选
    chooseBox = (type)=>{
        const {startdetailDtoList} = this.state;
        let selectedRowKeys = [];
        // 1.全选，2全不选
        for(let i = 0;i<startdetailDtoList.length;i++){
            selectedRowKeys.push(startdetailDtoList[i].recordId)
        }

        if(type == 1){
            this.setState({
                selectedRowKeys,
            },()=>{
                this.findListByIdList();
            })
        }else{
            this.setState({
                selectedRowKeys:[],
                detailDtoList: []
            })
            singleTotalArr = [];
            this.disposeEcharts();
        }
  
    }

    save = ()=>{
         const {turnType, machineId,receiverId,machineSpeed,detailDtoList,machineNo,
             pointId, detectorId, groupName, detailDtoListTotal, qualitySecondId, qualityTemplateId
             ,confirmFlag} = this.state;
         if (groupName == '') {
             message.error('请检查输入框内容是否填写完整！')
             return false
         }
         let params = {
            id:this.props.editInfo.id,
             turnType,
             detailDtoList: detailDtoListTotal,
             machineId,
             receiverId,
             machineSpeed,
             tenantId,
             groupName,
             machineNo,
             pointId,
             detectorId,
            qualitySecondId,
            qualityTemplateId,
            confirmFlag
         }
         service1.save(VtxUtil.handleTrim(params)).then(res => {
             if (res.rc == 0) {
                 message.success('保存成功')
                 this.setState({
                     standardLineVisible: false,
                     selectedRowKeys: [],
                 })
                this.disposeEcharts();
                this.props.parent.getChildClose(this, false)

             } else {
                 message.error(res.err);
             }
         })
    }

    // ===================================新增编辑品质等级=========================================
    qualityOk = ()=>{
        const {qualitySampleDetailDtoList,relation} = this.state;
        const {turnType, machineId,receiverId,machineSpeed,detailDtoList,machineNo,
            pointId,detectorId,groupName} = this.state;

        if(qualitySampleDetailDtoList.length){
            for (let i = 0; i < qualitySampleDetailDtoList.length; i++) {
                let temp = qualitySampleDetailDtoList[i];
                if (temp.thresholdValue == '' || temp.conditionId == '') {
                    message.error('请检查参数是否填写完整');
                    return false
                }
            }
        } else {
            message.error('还未选择任何参数组！');
            return false
        }
        let params = {
            qualitySampleDetailDtoList,
            tenantId,
            relation,
            turnType,
            machineId,
            receiverId,
            speed:machineSpeed,
            pointId,
            detectorId,
        }
        service1.quality(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    qualityVisible:false
                })
                message.success('保存成功')
            } else {
                message.error(res.err);
            }
        })
    }
    qualityCancel = ()=>{
        this.setState({
            qualityVisible:false,
            viewVisible:false
        })
    }
    addFreqGrade = () =>{
        let arr = [{
            conditionName: "",
            conditionId: "",
            thresholdValue: "",
        }]
        const {qualitySampleDetailDtoList = []} = this.state;
        let arr1 = qualitySampleDetailDtoList || [];
        this.setState({
            qualitySampleDetailDtoList: arr1.concat(arr)
        })
    }
    inputChangeIndex = (index,e)=>{
        this.setState({
            [e.target.name]: e.target.value
        })
        const {qualitySampleDetailDtoList = []} = this.state;
        let arr = qualitySampleDetailDtoList;
        arr[index]={
            ...arr[index],
           thresholdValue:e.target.value
        }
        this.setState({
            qualitySampleDetailDtoList: arr
        })
    }

    switchChangeOr = (checked)=>{
        this.setState({
            relation: checked ? 1 : 0,
        })
    }

    modeChangeFreq = (index, e) => {
        const {qualitySampleDetailDtoList,deviationList} = this.state;
        let arr1 = qualitySampleDetailDtoList;
        let conditionName = '';
        let conditionId = '';
        for(let i = 0;i<deviationList.length;i++){
            if (deviationList[i].name == e) {
                conditionName = deviationList[i].name;
                conditionId = deviationList[i].id;
            }
        }
        arr1[index] = {
            ...arr1[index],
            conditionName,
            conditionId,
        }
        this.setState({
            qualitySampleDetailDtoList: arr1,
        })
    }

    deleteQuality  =(item,index)=>{
        const {qualitySampleDetailDtoList} = this.state;
        let arr = [...qualitySampleDetailDtoList]
         arr.splice(index, 1);
         this.setState({
             qualitySampleDetailDtoList: arr
         })
    }

    // 查询样本条件品质等级
    findQuality = ()=>{
        this.setState({
            viewVisible:true
        })
         const {
             turnType,
             machineId,
             machineSpeed,
             pointId,
         } = this.state;
         let filterPropertyMap = [
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
                 value: machineSpeed
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
         ]
         let params = {
             filterPropertyMap: filterPropertyMap.filter((item) => {
                 return item.value !== undefined && item.value !== null;
             }),
             pageIndex: 0,
             pageSize: 100,
         };
         service1.findQuality(VtxUtil.handleTrim(params)).then(res => {
             if (res.rc == 0) {
                 if (res.ret) {
                    this.setState({
                        exampleList:res.ret || []
                    })
                 }
             } else {
                 message.error(res.err);
             }
         })

    }
    // 删除品质等级
    delete = (id)=>{
        service1.deletequalityById([id]).then(res => {
             if (res.rc == 0) {
                this.findQuality();
             } else {
                 message.error(res.err);
             }
         })
    }

    // ===================================品质等级结束============================================
    checkBoxChange = (e) => {
        this.setState({
            confirmFlag: e.target.checked
        })
    }
    render(){
         const columns = [
              {
                  title: '序号',
                  dataIndex: 'index',
              }, {
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
                title: '品质等级',
                dataIndex: 'qualityName',
                render: (text, record,index) => (
                    <span style={{color:record.qualityColor }} >
                        {record.qualityName}
                    </span>
                ),
            },
        ];
        const { loading, selectedRowKeys,selectedRowKeysHistory,confirmFlag  } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };

        const rowSelectionHistory = {
            selectedRowKeys:selectedRowKeysHistory,
            onChange: this.onSelectChangeHistory,
        };
        
       const {machineList, templateId,pointList,tableData,speedList,relation ,qualityList,querytemplateId,faultList,machineNo,
        groupName, qualityVisible, qualitySampleDetailDtoList, deviationList, selectedList, qualitySecondId, machineId, machineSpeed,pointId,qualityTemplateId
        } = this.state;
    return (
            <div>
                < Modal title = "样本库编辑" 
                    visible = {this.state.Visible}
                    onOk = {this.save}
                    onCancel = {this.handleCancel} 
                    width="95%"
                    >
                    <div>
                        <Input addonBefore="库名称："  style={{width:'500px',margin:'0 10px'}} value={groupName} name='groupName'
                        onChange={this.inputChange.bind(this)} />
                        
                        <Select value={machineId} style={{marginLeft:10,width:'200px'}} onChange={this.chooseMachine.bind(this)} >
                            {
                                (machineList || []).map((item,index)=>{
                                    return (
                                        <Option value ={item.id} key={index}> {item.name} </Option>
                                    )
                                })
                            }
                        </Select>
                        <Select value={machineSpeed} style={{marginLeft:10,width:'80px'}} onChange={this.chooseSpeed.bind(this)} >
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
                        <Select value={pointId} style={{ width: 150, outline: 'none',marginLeft:10, }} onChange={this.pointChange.bind(this)}>
                            {
                                (pointList || []).map((item, index) => {
                                    return (
                                        <Option value ={item.id} key={index}> {item.pointName} </Option>
                                    )
                                })
                            }
                        </Select>
                    < Select value={qualityTemplateId} style = {{
                            width: 100,
                            outline: 'none',
                            marginLeft: 10,
                        }}
                        onChange = {this.qualityChange.bind(this)} >
                        {
                            (qualityList || []).map((item, index) => {
                                return (
                                    <Option value ={item.id} key={index}> {item.name} </Option>
                                )
                            })
                        }
                    </Select>
                    {
                        querytemplateId == qualityTemplateId ?<Select value={qualitySecondId} style={{ width: 120, outline: 'none',margin:"0 10px", }} onChange={this.faultChange.bind(this)}>
                            {
                                (faultList || []).map((item, index) => {
                                    return (
                                        <Option value ={item.id} key={index}> {item.faultName} </Option>
                                    )
                                })
                            }
                        </Select> :""
                    }
                    </div>
                    <div style={{margin:"10px 0"}}>
                        <span style={{marginLeft:10}}>品质等级判定条件：</span>
                        <Button type='primary' style={{margin:'10px 0'}} onClick={this.findQuality.bind(this)}>查看</Button>
                        <Button onClick={()=>{this.setState({qualityVisible:true})}} style={{marginLeft:10}}>新增</Button>
                        <Checkbox checked={confirmFlag} style={{marginLeft:10}} onChange={this.checkBoxChange.bind(this)}>确定合格</Checkbox>
                    </div>
                    <div style={{width:'100%',border:'1px solid green',borderRadius:'10px',padding:'10px 10px'}}>
                        <div className={styles.standStoreFlex}>
                            <div ref = {
                                    (c) => {
                                        this.echartsBoxDb = c
                                    }
                                } 
                                style = {
                                    {
                                        width: '49%',
                                        height: '300px',
                                    }
                                }
                            /> 
                            <div ref = {
                                    (c) => {
                                        this.echartsBoxDensity = c
                                    }
                                }
                                style = {
                                    {
                                        width: '49%',
                                        height: '300px',
                                    }
                                }
                            /> 
                        </div>
                    </div> 
                     <div  style={{fontWeight:600,fontSize:'18px',margin:'10px 0'}}>库内样本声音</div>
                    <BtnWrap>
                        {
                            selectedRowKeys.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                        }
                        
                    </BtnWrap>
                    <Table  rowKey={record => record.id}  rowSelection={rowSelection} columns={columns} dataSource={selectedList} />
           
                    {/* 查询功能 */}
                    <div style={{margin:"10px 0"}}>
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
                           <Input addonBefore="请输入设备编号：" style={{width:'300px',margin:"0 10px"}} placeholder="请输入编号:" value={machineNo} name='machineNo'
                     onChange={this.inputChange.bind(this)} />
                        <Button type = "primary"  style={{margin:'0 10px',}} onClick={()=>this.findList()}> 查询 </Button>
                    </div>
                    <Table rowSelection={rowSelectionHistory} rowKey={record => record.id} columns={columns} dataSource={tableData} />
                    
                    {/* 编辑品质等级信息 */}
                     < Modal title = "操作" 
                        visible = {this.state.qualityVisible}
                        onOk = {this.qualityOk}
                        onCancel = {this.qualityCancel} 
                        width="40%"
                    >
                        <Button type='primary' style={{margin:'10px 0'}} onClick={()=>this.addFreqGrade()}>新增典型样本偏离度参数组</Button>
                        {
                            (qualitySampleDetailDtoList || []).map((item,index)=>{
                                return (
                                    <div key={index}>
                                        <div className={styles.gradeflex}>
                                            <div style={{color:item.color}}>样本参数组名称：</div>
                                            <Select defaultValue={item.name} style={{ width: 300 }}  onChange={this.modeChangeFreq.bind(this,index)}>
                                                {
                                                    (deviationList || []).map((item, index) => {
                                                        return (
                                                            <Option value={item.name} key={index}> {item.name} </Option>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </div>
                                        <Input addonBefore="偏离度阈值：" style={{width:'200px',}} name='value' placeholder="请输入" value={item.thresholdValue}
                                            onChange={this.inputChangeIndex.bind(this,index)}/>
                                        <Button type='danger' style={{width:'100%',margin:'10px 0'}} onClick={()=>this.deleteQuality(item,index)}>删除此等级</Button>
                                    </div>
                                )
                            })
                        }
                        <div  style={{margin:'10px 10px'}}>
                            偏离度参数组之间的关联性：
                            <Switch defaultChecked={relation == 0 ? false : true}  checkedChildren="且" unCheckedChildren="或"  onChange={this.switchChangeOr.bind(this)} />
                        </div>
                    </Modal>


                    {/* 查看偏离度样本参数组 */}
                     < Modal title = "详情" 
                        visible = {this.state.viewVisible}
                        onOk = {this.qualityCancel}
                        onCancel = {this.qualityCancel} 
                        width="50%"
                    >
                        {
                            (this.state.exampleList || []).map((item,index)=>{
                                return (
                                    <div>
                                        {item.qualitySampleDetailDtoList.length ?<div key={index} style={{borderBottom:'1px solid grey',margin:'5px 0'}}>
                                            {
                                                (item.qualitySampleDetailDtoList || []).map((itemp, indexp) => {
                                                    return (
                                                        <div className={styles.detailflex} key={indexp}>
                                                            <div>样本参数组名称：{itemp.conditionName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
                                                            <div>偏离度阈值： {itemp.thresholdValue}</div>
                                                                <Button type='danger' style={{margin:'10px 0'}} onClick={()=>this.delete(itemp.id)}>删除此参数组</Button>
                                                        </div>
                                                    )
                                                })
                                            }
                                            样本参数组之间的关系：
                                            <Switch defaultChecked={item.relation == 0 ? false : true}  checkedChildren="且" unCheckedChildren="或"  disabled />
                                        </div> : '' }
                                    </div>
                         
                                )
                            })
                        }

                    </Modal>

                </Modal>

            </div>
        )
    }
}

export default Edit;
