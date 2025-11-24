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
class BzCycle extends React.Component {
    state = {
        loading: false,
        freqVisible:false,
        modeId:"",
        groupId:"",
        name:"",
        color:'',
        templateId:"",
        standardPartitionDtoList: [],
        partitionDtoList: [],
        userType:'add',
        currentIndex:'',
        viewVisible:false,
        viewInfo:{},
        startCount:"",
        endCount: "",
        p:"0.5",
        confirmFlag:false,
        deleteIndex:""
    }
    componentDidMount() {
        const {standardPartitionDtoList} = this.props;
        this.setState({
            standardPartitionDtoList
        })
    }

     componentWillReceiveProps(newProps) {
        const {standardPartitionDtoList} = newProps;
        this.setState({
            standardPartitionDtoList
        })
     }
    //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            startCount: "",
            endCount: "",
            p:"",
            partitionDtoList:[],
            userType: 'add',
            freqVisible: true,
        })
    }
    // 编辑信息
    edit=(record,index)=>{
        const {
            startCount,
            endCount, partitionDtoList, p, confirmFlag
            } = record;
        this.setState({
            currentIndex:index,
            startCount,
            endCount,
            partitionDtoList,
            p,
            userType:'edit',
            confirmFlag,
            freqVisible:true,
        })
    }

    // 新增品质等级
    addFreqGrade = () =>{
        let arr = [{
            name:"",
            color:"",
            templateId:"",
            relation:1,
            value: "",
        }]
        const {partitionDtoList = []} = this.state;
        let arr1 = partitionDtoList || [];
        this.setState({
            partitionDtoList: arr1.concat(arr)
        })
    }
    modeChangeFreq = (index, e) => {
        const {partitionDtoList,} = this.state;
        const {qualityList} = this.props;
        let arr1 = partitionDtoList;
        let name = '';
        let color = '';
        let templateId = '';
        for(let i = 0;i<qualityList.length;i++){
            if(qualityList[i].id == e){
                name = qualityList[i].name;
                color = qualityList[i].color;
                templateId = qualityList[i].id;
            }
        }
        arr1[index] = {
            ...arr1[index],
            name,
            color,
            templateId,
        }
        this.setState({
            partitionDtoList: arr1,
        })
    }
    modeChangeRelation = (index,e)=>{
        const {partitionDtoList,} = this.state;
        let arr1 = partitionDtoList;
        arr1[index] = {
            ...arr1[index],
            relation:e,
        }
        this.setState({
            partitionDtoList: arr1,
        })
    }
    // =======================================
    checkBoxChange = (e) => {
        this.setState({
            confirmFlag: e.target.checked
        })
    }
    // 频段确认弹窗
    freqOk = ()=>{
        const {name,standardPartitionDtoList,partitionDtoList ,
        currentIndex,userType,startCount ,endCount,p ,confirmFlag} = this.state;
            // console.log(startCount,endCount,p)
        if (startCount === '' || endCount === '' || p === '' ) {
            message.error('请检查声音频段是否填写！ 请检查品质等级是否设置！')
            return false;
        }
        if (Number(startCount) > Number(endCount)) {
            message.error('开始频率不能大于结束频率！');
            return false;
        }
        if(partitionDtoList.length){
                for (let i = 0; i < partitionDtoList.length; i++) {
                    let obj = partitionDtoList[i];
                    for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                      // 判断属性值是否为空
                      if (obj[key] === '' ||  obj[key]<0) {
                        message.error('请检查是否填写完整,所有值不能为负数')
                        return false
                      }
                    }
                  }
                }
        }else{
             message.error('品质等级组不能为空')
             return false
        }
  
        let arr = standardPartitionDtoList;
        if(userType == 'add'){
            let paramsArr = [{
                p,
                startCount,
                endCount,
                partitionDtoList,
                confirmFlag,
                show:false,
            }]
            this.setState({
                standardPartitionDtoList:arr.concat(paramsArr),
                freqVisible:false,
            })
            this.props.parent.getPartitionSet(this, arr.concat(paramsArr));
         }else{
            // 编辑‘
            arr[currentIndex]={
                ...arr[currentIndex],
                p,
                startCount,
                endCount,
                partitionDtoList,
                confirmFlag
            }
            this.setState({
                standardPartitionDtoList:arr,
                freqVisible:false,
            })
            this.props.parent.getPartitionSet(this, arr);
         }  
       
        
    }
    freqCancel = ()=>{
        this.setState({
            freqVisible:false,
        })
    }
    inputChangeIndex = (index,e)=>{
       const numRegex = /^[-]?\d*\.?\d*$/; // 正则表达式判断是否为合法的小数或整数
       let valueNumber = '';
       if (numRegex.test(e.target.value)) {
           valueNumber = e.target.value;
       } else {
        valueNumber = '';
           message.error('输入非法！！');
        //    return
       }
        const {partitionDtoList = []} = this.state;
        let arr = [...partitionDtoList];
        arr[index]={
            ...arr[index],
            [e.target.name]: valueNumber
        }
        this.setState({
            partitionDtoList: arr
        })
    }
    // ==========频段设置结束============
    inputChange = (e) => {
        const numRegex = /^[-]?\d*\.?\d*$/; // 正则表达式判断是否为合法的小数或整数
        let valueNumber = '';
        if (numRegex.test(e.target.value)) {
            valueNumber = e.target.value;
        } else {
            valueNumber = '';
            message.error('输入非法！！');
            // return
        }
        this.setState({
            [e.target.name]: valueNumber
        })

    }

    // 删除频率明细
    deleteQualityFreqDetail = (record,index)=>{
        const {userType,partitionDtoList} = this.state;
        let arr = [...partitionDtoList];
        arr.splice(index, 1);
        this.setState({
            partitionDtoList: arr
        })
      
    }

    delete = () => {
        const {standardPartitionDtoList,deleteIndex} = this.state;
        let arr = [...standardPartitionDtoList];
        arr.splice(deleteIndex, 1);
        this.setState({
            standardPartitionDtoList: arr,
        })
        this.props.parent.getPartitionSet(this, arr);
    }
    deleteMode = (index)=>{
        this.setState({
            deleteIndex:index
        })
    }

    // 查看
    view =(record)=>{
        this.setState({
            viewInfo:record,
            viewVisible:true
        })
    }
    viewCancel = ()=>{
        this.setState({
            viewVisible:false
        })
    }

     // 展开查看
    open = (item,index)=>{
        const {standardPartitionDtoList} = this.state;
        let arr = [...standardPartitionDtoList];
        arr[index] = {
            ...arr[index],
            show:!item.show
        }
        this.setState({
            standardPartitionDtoList: arr
        })
    }

    render(){
        const columnFreq = [
            {
                title: '品质等级',
                dataIndex: 'name',
            },
            {
                title: '度量值',
                dataIndex: 'value',
                render: (text, record,index) => (
                <span>
                    {record.relation == 0 ? '≥' : '≤'}{record.value}
                </span>
            ),
            },
       
        ];

        const {name,p ,standardPartitionDtoList,partitionDtoList,viewInfo,startCount,endCount,confirmFlag } = this.state;
        return (
            <div>
                <BtnWrap>
                    <Button type = "primary" style={{margin:'10px 0'}} onClick={()=>this.add()}> 新增分区声音品质等级 </Button>
                    <span style={{color:'red'}}>提示：分区声音中下方所选择的数据不计入计算结果 </span>
                </BtnWrap>
                {
                    (standardPartitionDtoList || []).map((item,index)=>{
                        return (
                            <div key={index} style={{marginBottom:5}}>
                                <div>频率范围:{item.startCount} - {item.endCount} &nbsp;&nbsp;&nbsp;&nbsp;p值:{item.p}< Button type='primary' onClick={()=>this.open(item,index)}>展开 </Button> < Button type='primary' onClick={()=>this.edit(item,index)}> 编辑 </Button>
                                <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                                 < Button style={{marginLeft:10}} type='danger' onClick={()=>this.deleteMode(index)}> 删除 </Button>
                                </Popconfirm> 
                                </div>
                                {
                                    item.show &&  <Table rowKey={record => record.id}  columns={columnFreq} dataSource={item.partitionDtoList || []} pagination={false}/>
                                }
                            </div>
                        )
                    })
                }
           
                {/* 频段声音管理 */}
                <Modal
                    title="分区声音品质等级"
                    visible={this.state.freqVisible}
                    onOk={this.freqOk}
                    onCancel={this.freqCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div className={styles.freqFlex}>
                        <Input name='startCount' addonBefore='开始频率' placeholder="请输入" value={startCount} style={{width:'200px'}}
                            onChange={this.inputChange.bind(this)} addonAfter='Hz'/>
                        <div>~</div>
                        <Input  name='endCount' addonBefore='结束频率'  placeholder="请输入" value={endCount}  style={{width:'200px'}}
                            onChange={this.inputChange.bind(this)}  addonAfter='Hz'/>
                    </div>
                    <div className={styles.freqFlex}>
                        <Input name='p' addonBefore='p' placeholder="请输入" value={p} style={{width:'200px'}}
                            onChange={this.inputChange.bind(this)}/>
                    </div>
                   
                    {
                        (partitionDtoList || []).map((item,index)=>{
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div style={{color:item.color}}>品质等级名称：</div>
                                         <Select value={item.name} style={{ width: 300 }}  onChange={this.modeChangeFreq.bind(this,index)}>
                                            {
                                                (this.props.qualityList || []).map((item, index) => {
                                                    return (
                                                        <Option value={item.id} key={index}> {item.name} </Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </div>
                                    <div className={styles.gradeflex}>
                                        <div>度量值：</div>
                                         <Select style={{ width: 100 }} value={item.relation}  onChange={this.modeChangeRelation.bind(this,index)}>
                                            <Option value={0} key={0}> ≥ </Option>
                                            <Option value={1} key={1}> ≤</Option>
                                        </Select>
                                        <Input style={{width:'100px',marginLeft:10}} name='value' placeholder="请输入" value={item.value}
                                          onChange={this.inputChangeIndex.bind(this,index)}/>
                                    </div>
                                  
                                    <Button type='danger' style={{width:'100%'}} onClick={()=>this.deleteQualityFreqDetail(item.id,index)}>删除此等级</Button>
                                </div>
                            )
                        })
                    }

                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.addFreqGrade()}>新增品质等级信息</Button>
                    </BtnWrap>
                    <Checkbox checked={confirmFlag} onChange={this.checkBoxChange.bind(this)}>确定合格</Checkbox>
                </Modal>

                {/* 查看 */}
                  <Modal
                    title="分区声音品质等级"
                    visible={this.state.viewVisible}
                    onOk={this.viewCancel}
                    onCancel={this.viewCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div> 频率范围：{viewInfo.startCount} - {viewInfo.endCount}</div>
                    <div>p： {viewInfo.p} </div>
                    {
                        (viewInfo?.partitionDtoList || []).map((item, index) => {
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div style={{color:item.color}}>品质等级名称：{item.name}</div>
                                    </div>
                                    <div style={{margin:'10px 0'}}>
                                        度量值：
                                        {
                                            item.relation == 0 ? '≥' : '≤'
                                        } {
                                            item.value
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                      <Checkbox checked={viewInfo?.confirmFlag} disabled>确定合格</Checkbox>
           
                </Modal>

            </div>

          
        )
    }
}

export default BzCycle;