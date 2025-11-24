import React from 'react';
import { connect } from 'dva';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon,Table,Checkbox,Tabs } from 'antd';
const { Option } = Select;
const TabPane = Tabs.TabPane;
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
import Add from './components/Add';
import { VtxUtil } from '@src/utils/util';
import { service } from './service';
import moment from 'moment';
import styles from './qualityManage.less';
const { tenantId, userId, token } = vtxInfo;
const namespace = 'qualityManage';
const CheckboxGroup = Checkbox.Group;
class qualityManage extends React.Component {
    state = {
        loading: false,
        visible:false,
        tableData:[],
        name:"",
        id:'',
        checkedList:[],
        plainOptions:['曲线','周期声音','标准声音','典型样本','突发声音','分区声音']
    }
    componentDidMount() {
        this.getList();
        this.queryTypeFind();
    }
    getList = () => {
       let params = {
           filterPropertyMap: [{
               code: 'tenantId',
               operate: 'EQ',
               value: tenantId,
           }, ],
           sortValueMap: [{
               code: 'sort',
               sort: 'asc',
           }, ],
       }
       service.find(VtxUtil.handleTrim(params)).then(res => {
           if (res.rc == 0) {
               this.setState({
                   tableData: res.ret.items || [],
               })
           } else {
               message.error(res.err)
           }
       })
    }
    freshPage = (result,msg)=>{
        this.getList()
    }
    deleteMode=(id)=>{
        // 删除品质等级模式
        service.deleteMode([id]).then(res => {
            if (res.rc == 0) {
                this.getList();
            } else {
                message.error(res.err)
            }
        })
    }

    boxChange = (checkedList) => {
        this.setState({
            checkedList
        })
    }
    // ======================================品质等级划分依据 ==============================
    // 保存品质等级划分依据
    submit =()=>{
        const {checkedList,id} = this.state;
        let cycleStatus = 0;
        let frequencyStatus = 0;
        let sampleStatus = 0;
        let standardStatus = 0;
        let suddenStatus = 0;
        let partitionStatus = 0;
// plainOptions:['曲线','周期声音','标准声音','典型样本','突发声音','分区声音']
        for(let i=0 ;i<checkedList.length;i++){
            let temp = checkedList[i];
            if (temp == '曲线'){
                frequencyStatus = 1;
            }
            if (temp == '周期声音') {
                cycleStatus = 1;
            }
            if (temp == '标准声音') {
                standardStatus = 1;
            }
            if (temp == '典型样本') {
                sampleStatus = 1;
            }
            if (temp == '突发声音') {
                suddenStatus = 1;
            }
            if (temp == '分区声音') {
                partitionStatus = 1;
            }
        }
        let params = {
            id,
            cycleStatus,
            partitionStatus,
            frequencyStatus,
            sampleStatus,
            standardStatus,
            suddenStatus,
            tenantId
        }
        service.qualityTypeSave(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('保存成功')
            } else {
                message.error(res.err)
            }
        })
    }
    queryTypeFind = ()=>{
         let params = {
             tenantId
         }
         service.queryTypeFind(params).then(res => {
             if (res.rc == 0) {
// plainOptions:['曲线','周期声音','标准声音','典型样本','突发声音','分区声音]
                if (res.ret) {
                    let checkedList = [];
                    const {
                        cycleStatus,
                        frequencyStatus,
                        sampleStatus,
                        standardStatus,
                        id,
                        suddenStatus,partitionStatus} = res.ret;
                    if(cycleStatus == 1){checkedList.push('周期声音')}
                    if(frequencyStatus == 1){checkedList.push('曲线')}
                    if(sampleStatus == 1){checkedList.push('典型样本')}
                    if(standardStatus == 1){checkedList.push('标准声音')}
                    if(suddenStatus == 1){checkedList.push('突发声音')}
                    if (partitionStatus == 1){checkedList.push('分区声音')}
                    this.setState({
                        checkedList,
                        id,
                    })
                }
             } else {
                 message.error(res.err)
             }
         })
    }
    // ======================================品质等级划分依据 ==============================

    render(){
        const columns = [
            {
                title: '品质等级名称',
                dataIndex: 'name',
            }, 
            {
                title: '颜色',
                dataIndex: 'color',
                render: (text, record,index) => (
                    <span>
                        < Button style={{backgroundColor:record.color}}>  </Button>
                    </span>
                ),
            },
            {
                title: '排序',
                dataIndex: 'sort',
            },
            
            {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                    <span>
                        < Button type='danger' onClick={()=>this.deleteMode(record.id)}> 删除 </Button>
                    </span>
                ),
            }
        ];
        const {tableData} = this.state;
        return (
            <div className={styles.body}>
                <div style={{margin:'20px 0'}}>
                    <h3 style={{margin:'20px 0',fontWeight:600,fontSize:'20px'}}>品质等级划分依据：  <Button type='primary' style={{marginLeft:20}} onClick={()=>{this.submit()}}>提交</Button></h3>
                    <CheckboxGroup options={this.state.plainOptions} value={this.state.checkedList} onChange={this.boxChange} />
                </div>
                <Add parent={this}></Add>
                <Table rowKey={record => record.id} columns={columns} dataSource={tableData} />
         
            </div>
        )
    }
}

export default qualityManage;