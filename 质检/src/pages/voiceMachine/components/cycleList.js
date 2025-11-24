/**
 * 听音器机型管理
 * author : vtx shh
 * createTime : 2021-08-01 13:07:36
 */
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Tabs} from 'antd';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;

import { VtxUtil } from '@src/utils/util';
import { service } from '../service';


const namespace = 'voiceMachineModel';
@connect(({
    voiceMachineModel
}) => ({
    voiceMachineModel
}))
class voiceMachineModel extends React.Component {
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
            modeList:[],
            ModeList1:[],
            modeVisible:false,
            modeId:"",
            cycleID:""
        };
    }
    deleteTime(id){
      let params = [id];
        service.deleteCycle(params).then(res =>{
            if(res.rc == 0){
                 this.getList();
            }
        })
    }
    editTime(item){
        this.setState({
            clickType:2,
            timevisible:true,
            ...item
        })
    }
    componentWillReceiveProps(props){
        this.getList(props.machineTypeId);
    }
    componentDidMount(){
        this.getList();
        // this.getMode();
    }
    getMode(){
        let params = {
            tenantId
        };
        let arr = [{
            id: '',
            name: '请选择模式等级'
        }]
        service.getMode(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    this.setState({
                        ModeList: res.ret,
                        ModeList1: arr.concat(res.ret)
                    })
                } else {
                    this.setState({
                        modeList1: []
                    })
                }
            } else {
                message.error(res.err)
            }
        })
    }
    modeChange = (e) => {
        this.setState({
            modeId: e.target.value
        })
    }
    openMode = (val)=>{
        this.setState({
            modeVisible:true,
            cycleID:val
        })
    }
    getList(id){
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
                }else{
                       this.setState({
                           dataSource: []
                       })
                }
            }else{
                message.error(res.err)
            }
        })
    }
    updatetime(){
        const {startIndex,endIndex,clickType} = this.state;
        let params = {
            startIndex,
            endIndex,
            tenantId,
            machineTypeId: this.props.machineTypeId,
            // numberOfGrades: this.state.numberOfGrades,
            // cycle: this.state.cycle,
            // average: this.state.average,
            // maxMatchDegree: this.state.maxMatchDegree,
            // minMatchDegree: this.state.minMatchDegree,
          
            // managementType: 1
        }
        if (clickType == 2) {
            params.id = this.state.id
            service.updateCycle(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    this.getList();
                }else{
                    message.error(res.err)
                }
            })
            }else{
            service.addCycle(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    this.getList();
                }else{
                    message.error(res.err)
                }
            })
        }
    }
    // 方法
    handleOk = (e) => {
        this.setState({
            timevisible: false,
        });
        this.updatetime()
    }
    handleCancel = (e) => {
        this.setState({
            timevisible: false,
        });
    }
    handlemodeOk = (e) => {
         let params = {
             cycleIdList: [this.state.cycleID],
             groupId: this.state.modeId,
             tenantId,
         }
            service.bindQuality(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    this.setState({
                        modeVisible: false,
                    });
                    this.getList();
                } else {
                    message.error(res.err)
                }
            })
        // this.updatetime()
    }
    handlemodeCancel = (e) => {
        this.setState({
            modeVisible: false,
        });
    }
    // 按时间管理
    inputTime = (e) => {
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
            // numberOfGrades:"",
            // cycle:"",
            // average:"",
            // minMatchDegree:"",
            // maxMatchDegree:"",
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
            // {
            //     title: '划分等级数',
            //     dataIndex: 'numberOfGrades',
            // },
            // {
            //     title: '观察周期',
            //     dataIndex: 'cycle',
            // },
            // {
            //     title: '平均次数',
            //     dataIndex: 'average',
            // },
            // {
            //     title: '周期最小匹配度下限',
            //     dataIndex: 'minMatchDegree',
            // },
            // {
            //     title: '周期最小匹配度上限',
            //     dataIndex: 'maxMatchDegree',
            // },
            // {
            //     title: '品质等级模式',
            //     dataIndex: 'qualityGroupName',
            // },
             {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                    <span>
                    < Button onClick={()=>this.editTime(record,2)}> 编辑 </Button>
                    <span className="ant-divider" />
                    < Button onClick={()=>this.deleteTime(record.id)}> 删除 </Button>
                      {/* <span className="ant-divider" />
                    < Button onClick={()=>this.openMode(record.id)}> 选择品质模式 </Button> */}
                    </span>
                ),
            }];
        const data = this.state.dataSource;
        const {timevisible,startIndex,endIndex,ModeList1} = this.state;
        return (
            <div style={{marginTop:10}}>
                <Button type = "primary"  onClick={()=>this.showModal()} > 新增 </Button>
                {/* 列表 */}
                <Table columns={columns} dataSource={data} pagination={false}/>

                {/* 编辑弹窗 */}
                <Modal
                title="按时间周期管理"
                visible={timevisible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                >
                    <Input addonBefore="周期范围下限(ms)：" name="startIndex" placeholder="请输入周期范围下限" value={startIndex}
                    onChange={this.inputTime.bind(this)}/>
                    <Input  addonBefore="周期范围上限(ms)：" name="endIndex" placeholder="请输入周期范围上限" value={endIndex} style={{marginTop:10}}
                    onChange={this.inputTime.bind(this)}/>
                </Modal>
                {/* 品质等级模式 */}
                <Modal
                    title="品质等级模式"
                    visible={this.state.modeVisible}
                    onOk={this.handlemodeOk}
                    onCancel={this.handlemodeCancel}
                    >
                    <select placeholder="请选择品质模式" style={{ width: 200, outline: 'none' }} onChange={this.modeChange.bind(this)}>
                        {
                            (ModeList1 || []).map((item,index)=>{
                                return (
                                    < option value ={item.id} key={index}> {item.name} </option>
                                )
                            })
                        }
                    </select>
                </Modal>
            </div>
        );
    }

}

export default voiceMachineModel;

