
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Tabs} from 'antd';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { service } from './service2';
class CycleRange extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource:[],
            timevisible:false,
            machineTypeId:"",
            // 时间周期
            id:"",
            startIndex:"",
            endIndex:"",
            numberOfGrades:"",
            cycle:"",
            average:"",
            maxMatchDegree:"",
            minMatchDegree:"",
            clickType:"",
            cycleID:""
        };
    }

    componentWillReceiveProps(props){
        this.getList(props.machineTypeId);
    }
    componentDidMount(){
        this.getList();
    }
    getList=(id)=>{
        let params = {
            machineTypeId:id || this.props.machineTypeId,
            tenantId
        };
        service.timeparts(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    this.setState({
                        dataSource: res.ret
                    })
                }
            }else{
                message.error(res.err)
            }
        })
    }
    deleteTime=(id)=> {
        let params = [id];
        service.deleteCycle(params).then(res => {
            if (res.rc == 0) {
                this.getList();
            }
        })
    }
    editTime=(item)=> {
        this.setState({
            clickType: 2,
            timevisible: true,
            ...item
        })
    }

    handleOk = (e) => {
        const {startIndex,endIndex,clickType} = this.state;
        if (startIndex == '' || endIndex == '' || Number(startIndex) > Number(endIndex) || Number(startIndex) < 0 || Number(endIndex)<0) {
            message.error('请填写完整，不能为负数,下限值不能超过上限值！！')
            return false;
        }
        if(Number(startIndex) < 1){
             message.error('开始周期不能小于1！！')
             return false;
        }
        let params = {
            startIndex,
            endIndex,
            tenantId,
            machineTypeId: this.props.machineTypeId,
        }
        if (clickType == 2) {
            params.id = this.state.id;
            service.updateCycle(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    this.setState({
                        timevisible:false
                    })
                    this.getList();
                }else{
                    message.error(res.err)
                }
            })
        }else{
            service.addCycle(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    this.setState({
                        timevisible: false
                    })
                    this.getList();
                }else{
                    message.error(res.err)
                }
            })
        }
    }
    handleCancel = (e) => {
        this.setState({
            timevisible: false,
        });
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    showModal(){
        this.setState({
            clickType:1,
            timevisible:true,
            startIndex:'',
            endIndex:"",
        })
    }
    render(){
        const columns = [
            {
                title: '周期范围下限(ms)',
                dataIndex: 'startIndex',
            },
             {
                title: '周期范围上限(ms)',
                dataIndex: 'endIndex',
            }, 
             {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                    <span>
                        < Button onClick={()=>this.editTime(record,2)}> 编辑 </Button>
                        <span className="ant-divider" />
                        < Button type='danger' onClick={()=>this.deleteTime(record.id)}> 删除 </Button>
                    </span>
                ),
            }];
        const {timevisible,startIndex,endIndex,dataSource} = this.state;
        return (
            <div style={{width:'100%'}}>
                <Button type = "primary"  onClick={()=>this.showModal()} > 新增时间周期管理 </Button>
                <Table rowKey={record => record.id} columns={columns} dataSource={dataSource} pagination={false}/>
                {/* 编辑弹窗 */}
                <Modal
                title="时间周期管理"
                visible={timevisible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                >
                    <Input addonBefore="周期范围下限(ms)：" name="startIndex" placeholder="请输入周期范围下限" value={startIndex}
                    onChange={this.inputChange.bind(this)}/>
                    <Input  addonBefore="周期范围上限(ms)：" name="endIndex" placeholder="请输入周期范围上限" value={endIndex} style={{marginTop:10}}
                    onChange={this.inputChange.bind(this)}/>
                </Modal>

            </div>
        );
    }

}

export default CycleRange;

