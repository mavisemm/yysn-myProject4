import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon,Table,Checkbox,Tabs,Switch,Popconfirm } from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
import styles from './vQuality.less';
import { VtxUtil } from '@src/utils/util';
import { service2 } from './service';
const { tenantId, userId, token } = vtxInfo;
const CheckboxGroup = Checkbox.Group;
class CycleManage extends React.Component {
    state = {
        loading: false,
        freqVisible:false,
        modeId:"",
        groupId:"",
        name:"",
        color:'',
        templateId:"",
        sameGroupDtoList:[],
        detailDtoList: [],
        detailDtoListSingle:[],
        btnType:'add',
        currentIndex:'',
        viewVisible:false,
        cycle:"",
        deviation:"",
        deleteIndex:'',
        barType:0,
        title: "多点位不合格周期设置",
        pointList:[],
        pointIdArr:[],
        nowIndex:0,
        freqIndexVisible:false,
    }
    componentDidMount() {
        const {sameGroupDtoList,pointList } = this.props;
        this.setState({
            sameGroupDtoList:sameGroupDtoList || [],
            pointList
        },()=>{
             this.dealBar()
        })
    }

     componentWillReceiveProps(newProps) {
        const {sameGroupDtoList,pointList } = newProps;
        this.setState({
            sameGroupDtoList: sameGroupDtoList || [],
            pointList
        },()=>{
            this.dealBar()
        })
     }
     dealBar = ()=>{
        const {sameGroupDtoList,barType} = this.state;
        // console.log(sameGroupDtoList,'传递过来的')
        let detailDtoListSingle = [];
        let newArr = [];
        for(let i = 0;i<sameGroupDtoList.length;i++){
            let temp = sameGroupDtoList[i];
            if (temp.type == 1) {
                detailDtoListSingle = temp.detailDtoList || [];
            }else{
                let pointIdArr = [];
                if(temp.pointDtoList){
                    for (let j = 0; j < temp.pointDtoList.length; j++) {
                        pointIdArr.push(temp.pointDtoList[j].pointId)
                    }
                }
             
                newArr.push({
                    ...temp,
                    pointIdArr
                })
            }
        }
        this.setState({
            detailDtoListSingle,
            sameGroupDtoList:newArr
        })
     }
    //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            cycle:"",
            deviation:"",
            degree:"",
            btnType: 'add',
            freqVisible: true,
        })
    }
    // 编辑信息
    edit=(record,index)=>{
        const {cycle,deviation,detailDtoList} = record;
        this.setState({
            currentIndex:index,
            cycle,
            deviation,
            detailDtoList,
            btnType:'edit',
            freqVisible:true,
        })
    }
    // =======================================
    // 频段确认弹窗
    freqOk = ()=>{
        const {
            name,
            sameGroupDtoList,
            detailDtoListSingle,
        currentIndex,btnType,cycle,deviation ,barType,degree } = this.state;
        if (cycle == '' || deviation == '') {
            message.error('请检查是否有内容未填写！')
            return false;
        }
        let arrSingle = [...detailDtoListSingle];
     
        if(btnType == 'add'){
            let paramsArrSingle = [];
            paramsArrSingle = [{
                cycle,
                deviation,
                degree
            }]
            this.setState({
                detailDtoListSingle: arrSingle.concat(paramsArrSingle),
                type: 1,
                freqVisible: false,
            })
            this.props.parent.getCyclePointSet(this, sameGroupDtoList, arrSingle.concat(paramsArrSingle));
         }else{
            arrSingle[currentIndex] = {
                ...arrSingle[currentIndex],
                cycle,
                deviation,
                degree
            }
            this.setState({
                detailDtoListSingle: arrSingle,
                type: 1,
                freqVisible: false,
            })
            this.props.parent.getCyclePointSet(this, sameGroupDtoList, arrSingle);
         }  
        
    }
     editMode = (row, index) => {
        const {cycle,deviation,degree} = {...row};
        this.setState({
            cycle,
            deviation,
            degree,
            currentIndex: index,
            btnType: 'edit',
            freqVisible: true,
        })
     }
    deleteMode = (row, index) => {
        const {detailDtoListSingle=[],barType,sameGroupDtoList} = this.state;
        let arrSingle = [...detailDtoListSingle];
        arrSingle.splice(index, 1)
       
        this.setState({
            detailDtoListSingle:arrSingle,
            currentIndex: index,
        })
        this.props.parent.getCyclePointSet(this, sameGroupDtoList, arrSingle);
    }
    freqCancel = ()=>{
        this.setState({
            freqVisible:false,
            freqIndexVisible:false
        })
    }
    // ==========频段设置结束============
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    callback = (e)=>{
        this.setState({
            barType:e,
            title:e == 0 ? '多点位不合格周期设置' : '点位不合格周期设置'
        },()=>{
            //  this.dealBar();
        })
    }
   
    //========================= 多点位不合格周期设置开始==================
    addList = ()=>{
        const {sameGroupDtoList,} = this.state;
        let tempArr = [...sameGroupDtoList];
        let arr = [
            {
                detailDtoList:[],
                pointDtoList:[],
                type:0
            }
        ]
        this.setState({
            sameGroupDtoList:tempArr.concat(arr),
            detailDtoList:[]
        })
    }
    addListIndex = (index)=>{
        const {sameGroupDtoList} = this.state;
        let arr = [...sameGroupDtoList];
        this.setState({
            detailDtoList: arr[index].detailDtoList,
            cycle: "",
            deviation: "",
            degree: "",
            nowIndex:index,
            freqIndexVisible: true,
        })
    }
    addButton =()=>{
        const {sameGroupDtoList,nowIndex,detailDtoList} = this.state;
        let temp = [
            {
                cycle:"",
                deviation:""
            }
        ]
        this.setState({
            detailDtoList: detailDtoList.concat(temp),
            btnType: 'add',
        })
    }
    pointChange = (index,e) => {
        const {pointList,detailDtoListSingle,sameGroupDtoList} = this.state;
        let arr = [...sameGroupDtoList];
        let pointArr = [];
        let ogPointList = arr[index].pointDtoList;
        for (let i = 0; i < e.length; i++) {
            let temp = e[i];
            let found = false; // 标志变量

            for (let j = 0; j < ogPointList.length; j++) {
                if (temp == ogPointList[j].pointId) {
                    pointArr[i] = { ...ogPointList[j] };
                    found = true; // 找到匹配的 pointId
                    break; // 找到匹配的 pointId，结束内层循环
                }
            }

            if (!found) {
                pointArr[i] = { pointId: temp };
            }
        }
        
        arr[index] = {
            ...arr[index],
            pointDtoList: pointArr
        }
        this.setState({
            sameGroupDtoList:arr,
            nowIndex:index
        })
        this.props.parent.getCyclePointSet(this, arr, detailDtoListSingle);

    }
    editModeList = (row, index) => {
        const {cycle,deviation,degree} = {...row};
        this.setState({
            cycle,
            deviation,
            degree,
            currentIndex: index,
            btnType: 'edit',
            freqIndexVisible: true,
        })
     }
    freqOkIndex = ()=>{
        const {nowIndex,sameGroupDtoList,cycle,deviation,detailDtoListSingle,btnType,currentIndex,detailDtoList} = this.state;
        let arr = [...sameGroupDtoList];
        arr[nowIndex] = {
            ...arr[nowIndex],
            detailDtoList
        }
        this.setState({
            sameGroupDtoList:arr,
            freqIndexVisible:false
        })
        this.props.parent.getCyclePointSet(this, arr, detailDtoListSingle);
    }
    // 删除
    deleteList=(index)=>{
        const {sameGroupDtoList} = this.state;
        let arr = [...sameGroupDtoList];
        arr.splice(index,1);
        this.setState({
            sameGroupDtoList: arr
        })
    }
    deleteModeList = (index) => {
        const {detailDtoList=[]} = this.state;
        let arr = [...detailDtoList];
        arr.splice(index,1);
        this.setState({
            detailDtoList:arr
        })
    }
    inputChangeIndex = (index,e)=>{
        const {detailDtoList = [],nowIndex,sameGroupDtoList} = this.state;
        let arr = [...detailDtoList];
        arr[index]={
            ...arr[index],
            [e.target.name]: e.target.value
        }
        this.setState({
            detailDtoList: arr,
            [e.target.name]: e.target.value
        })
    }
    // =========================多点位不合格周期设置结束============================

    render(){
        const column1 = [
            {
                title: '检测周期(ms)',
                dataIndex: 'cycle',
            },
            {
                title: '偏差范围(%)',
                dataIndex: 'deviation',
            },
        ];
        const column2 = [
            {
                title: '检测周期(ms)',
                dataIndex: 'cycle',
            },
            {
                title: '偏差范围(%)',
                dataIndex: 'deviation',
            },
            {
                title: '稳定度',
                dataIndex: 'degree',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.editMode(record,index)}> 编辑 </Button>
                    <span className="ant-divider" />
                    < Button type='danger' onClick={()=>this.deleteMode(record,index)}> 删除 </Button>
                    </span>
                ),
            }
        ];
        const {deviation,cycle ,detailDtoList,title,barType,degree,detailDtoListSingle,pointList,pointIdArr ,sameGroupDtoList,btnType} = this.state;
        return (
            <div>
                 <Tabs defaultActiveKey="0" size="small" onChange={this.callback} >
                    <TabPane tab="多点位不合格周期设置" key="0">
                        <BtnWrap>
                            <Button type="primary" onClick={()=>this.addList()}> 新增 </Button>
                        </BtnWrap>
                        {
                            (sameGroupDtoList || []).map((item,index)=>{
                                return (
                                    <div style={{marginBottom:10,border:'1px solid #FBC115',padding:'10px 10px',borderRadius:10}} key={index}>
                                        <div>
                                            点位：
                                            {/* value={pointIdArr} */}
                                            <Select value={item?.pointIdArr || []}  placeholder='请选择点位' multiple style={{ width: 700, outline: 'none' }} onChange={this.pointChange.bind(this,index)}>
                                                {
                                                    (pointList || []).map((item, index) => {
                                                        return (
                                                            <Option value ={item.id} key={index}> {item.pointName} </Option>
                                                        )
                                                    })
                                                }
                                            </Select>
                                        </div>
                                        <BtnWrap>
                                            <Button type = "primary"  onClick={()=>this.addListIndex(index)}> 不合格周期设置 </Button>
                                        </BtnWrap>
                                        <Table rowKey={record => record.id} style={{width:'50%'}} columns={column1} dataSource={item.detailDtoList || []} pagination={false}/>
                                        <Button type = "danger" style={{margin:'5px 0'}} onClick={()=>this.deleteList(index)}> 删除此相关点位设置 </Button>
                                    </div>
                                )
                            })
                        }

                    </TabPane>
                    <TabPane tab="当前点位不合格周期设置" key="1">
                        <Button type = "primary" style={{margin:'5px 0'}} onClick={()=>this.add()}> 新增 </Button>
                        <Table rowKey={record => record.id}  columns={column2} dataSource={detailDtoListSingle || []} pagination={false}/>
                    </TabPane>
                </Tabs>
           
                {/* 点位周期声音管理 */}
                <Modal
                    title={title}
                    visible={this.state.freqVisible}
                    onOk={this.freqOk}
                    onCancel={this.freqCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div className={styles.freqFlex}>
                        <Input name='cycle' addonBefore='检测周期' placeholder="请输入" value={cycle} style={{width:'200px'}}
                        addonAfter='ms' onChange={this.inputChange.bind(this)}/>
                        <Input  name='deviation' addonBefore='偏差范围' addonAfter='%' placeholder="请输入" value={deviation}  style={{width:'200px'}}
                        onChange={this.inputChange.bind(this)}/>
                    </div>
                    <div style={{color:'red'}}>
                        提示：如20ms，偏差10%.匹配周期为18ms-22ms
                    </div>
                    {
                        barType == 1 && <div>
                            <Input addonBefore='稳定度(大于)' name='degree' placeholder="" value={degree}  style={{width:'200px',marginLeft:5}}
                                onChange={this.inputChange.bind(this)}/>
                        </div>
                    }
                
                </Modal>
                
                {/* 多点位不合格周期设置 */}
                <Modal
                    title={title}
                    visible={this.state.freqIndexVisible}
                    onOk={this.freqOkIndex}
                    onCancel={this.freqCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    {
                        (detailDtoList || []).map((item,index)=>{
                            return (
                                <div className={styles.freqFlex} key={index}>
                                    <Input name='cycle' addonBefore='检测周期' placeholder="请输入" value={item.cycle} style={{width:'200px'}}
                                    addonAfter='ms' onChange={this.inputChangeIndex.bind(this,index)}/>
                                    <Input  name='deviation' addonBefore='偏差范围' addonAfter='%' placeholder="请输入" value={item.deviation}  style={{width:'200px'}}
                                    onChange={this.inputChangeIndex.bind(this,index)}/>
                                    <Button type='danger' onClick={()=>this.deleteModeList(index)}>删除</Button>
                                </div> 
                            )
                        })
                    }
          
                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.addButton()}>新增</Button>
                    </BtnWrap>
                    <div style={{color:'red'}}>
                        提示：如20ms，偏差10%.匹配周期为18ms-22ms
                    </div>
                </Modal>
            </div>

        )
    }
}

export default CycleManage;