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
        standardCycleDtoList:[],
        cycleDtoList: [],
        userType:'add',
        currentIndex:'',
        viewVisible:false,
        viewInfo:{},
        startFrequency:"",
        endFrequency:"",
        startCycle:"",
        endCycle:"",
        confirmFlag: false,
        deleteIndex:'',
    }
    componentDidMount() {
        const {standardCycleDtoList} = this.props;
        this.setState({
            standardCycleDtoList
        })
    }

     componentWillReceiveProps(newProps) {
        const {standardCycleDtoList} = newProps;
        this.setState({
            standardCycleDtoList
        })
     }
    //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            cycleDtoList:[],
            userType: 'add',
            freqVisible: true,
        })
    }
    // 编辑信息
    edit=(record,index)=>{
        const {startFrequency,endFrequency,cycleDtoList,startCycle,endCycle,confirmFlag} = record;
        // console.log(record,'recod')
        this.setState({
            currentIndex:index,
            startFrequency,
            endFrequency,
            cycleDtoList,
            startCycle,
            endCycle,
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
            degree: "",
            db:"",
        }]
        const {cycleDtoList = []} = this.state;
        let arr1 = cycleDtoList || [];
        this.setState({
            cycleDtoList: arr1.concat(arr)
        })
    }
    modeChangeFreq = (index, e) => {
        const {cycleDtoList,} = this.state;
        const {qualityList} = this.props;
        let arr1 = cycleDtoList;
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
            cycleDtoList: arr1,
        })
    }
    // =======================================
    // 频段确认弹窗
    freqOk = ()=>{
        const {name,standardCycleDtoList,cycleDtoList ,
        currentIndex,userType,startFrequency,endFrequency,startCycle ,endCycle,confirmFlag } = this.state;

        if (startFrequency == '' || endFrequency == '' || startCycle == '' || endCycle == '') {
            message.error('请检查声音频段是否填写！ 请检查品质等级是否设置！')
            return false;
        }
        if (Number(startFrequency) > Number(endFrequency)) {
            message.error('开始频率不能大于结束频率！');
            return false;
        }
        if (Number(startCycle) > Number(endCycle)) {
            message.error('开始周期不能大于结束周期！');
            return false;
        }
        if(cycleDtoList.length){
            for (let i = 0; i < cycleDtoList.length; i++) {
                let obj = cycleDtoList[i];
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
  
        let arr = standardCycleDtoList;
        if(userType == 'add'){
            let paramsArr = [{
                startCycle,
                endCycle,
                startFrequency,
                endFrequency,
                cycleDtoList,
                confirmFlag,
                show:false,
            }]
            this.setState({
                standardCycleDtoList:arr.concat(paramsArr),
                freqVisible:false,
            })
            this.props.parent.getCycleSet(this, arr.concat(paramsArr));
         }else{
            // 编辑‘
            arr[currentIndex]={
                ...arr[currentIndex],
                 startCycle,
                 endCycle,
                startFrequency,
                endFrequency,
                confirmFlag,
                cycleDtoList,
            }
            this.setState({
                standardCycleDtoList:arr,
                freqVisible:false,
            })
            this.props.parent.getCycleSet(this, arr);
         }  
       
        
    }
    checkBoxChange = (e) => {
        this.setState({
            confirmFlag: e.target.checked
        })
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
            // return
        }
        const {cycleDtoList = []} = this.state;
        let arr = [...cycleDtoList];
        arr[index]={
            ...arr[index],
            [e.target.name]: valueNumber
        }
        this.setState({
            cycleDtoList: arr
        })
    }
    // ==========频段设置结束============

    switchChangeOr = (index,checked)=>{
        const {cycleDtoList = []} = this.state;
        let arr = cycleDtoList;
        arr[index]={
            ...arr[index],
            relation:checked ? 1 : 0,
        }
        this.setState({
            cycleDtoList: arr
        })
    }
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
        const {userType,cycleDtoList} = this.state;
        let arr = [...cycleDtoList];
        arr.splice(index, 1);
        this.setState({
            cycleDtoList: arr
        })
      
    }

    delete = () => {
        const {standardCycleDtoList,deleteIndex} = this.state;
        let arr = [...standardCycleDtoList];
        arr.splice(deleteIndex, 1);
        this.setState({
            standardCycleDtoList: arr,
        })
        this.props.parent.getCycleSet(this, arr);
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
        const {standardCycleDtoList} = this.state;
        let arr = [...standardCycleDtoList];
        arr[index] = {
            ...arr[index],
            show:!item.show
        }
        this.setState({
            standardCycleDtoList: arr
        })
    }

    render(){
        const columnFreq = [
            {
                title: '品质等级',
                dataIndex: 'name',
            },
            {
                title: '能量偏离(db)(>=)',
                dataIndex: 'db',
            }, {
                title: '稳定度偏离(>=)',
                dataIndex: 'degree',
            },
             {
                title: '能量偏离、稳定度偏离关联性',
                dataIndex: 'relation',
                render: (text, record,index) => (
                    <span>
                        {record.relation == 0 ? '或' : '且'}
                    </span>
                ),
             },
       
        ];

        const {endCycle,startCycle ,standardCycleDtoList,cycleDtoList,viewInfo,startFrequency,endFrequency,confirmFlag } = this.state;
        return (
            <div>
                <Button type = "primary" style={{margin:'10px 0'}} onClick={()=>this.add()}> 新增周期品质等级 </Button>
                {
                    (standardCycleDtoList || []).map((item,index)=>{
                        return (
                            <div key={index} style={{marginBottom:5}}>
                                <div>{item.startCycle} - {item.endCycle}ms &nbsp;&nbsp;&nbsp;&nbsp;< Button type='primary' onClick={()=>this.open(item,index)}>展开 </Button> < Button type='primary' onClick={()=>this.edit(item,index)}> 编辑 </Button> 
                                <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                                    < Button style={{marginLeft:10}} type='danger' onClick={()=>this.deleteMode(index)}> 删除 </Button>
                                </Popconfirm>
                                </div>
                                {
                                    item.show &&  <Table rowKey={record => record.id}  columns={columnFreq} dataSource={item.cycleDtoList || []} pagination={false}/>
                                }
                            </div>
                        )
                    })
                }
           
                {/* 频段声音管理 */}
                <Modal
                    title="声音周期品质等级"
                    visible={this.state.freqVisible}
                    onOk={this.freqOk}
                    onCancel={this.freqCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div className={styles.freqFlex}>
                        <Input name='startFrequency' addonBefore='开始频段' placeholder="请输入开始频段" value={startFrequency} style={{width:'200px'}}
                        addonAfter='Hz' onChange={this.inputChange.bind(this)}/>
                        <div>~</div>
                        <Input  name='endFrequency' addonBefore='结束频段' addonAfter='Hz' placeholder="请输入结束频段" value={endFrequency}  style={{width:'200px'}}
                        onChange={this.inputChange.bind(this)}/>
                    </div>
                    <div className={styles.freqFlex}>
                        <Input name='startCycle' addonBefore='开始周期' placeholder="请输入开始周期" value={startCycle} style={{width:'200px'}}
                        addonAfter='ms' onChange={this.inputChange.bind(this)}/>
                        <div>~</div>
                        <Input  name='endCycle' addonBefore='结束周期' addonAfter='ms' placeholder="请输入结束周期" value={endCycle}  style={{width:'200px'}}
                        onChange={this.inputChange.bind(this)}/>
                    </div>
                   
                    {
                        (cycleDtoList || []).map((item,index)=>{
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
                                    <Input addonBefore="能量偏离值(>=)" style={{width:'200px',}} name='db' placeholder="请输入" value={item.db}
                                        addonAfter='db'  onChange={this.inputChangeIndex.bind(this,index)}/>
                                    <Input addonBefore="稳定度偏离值(>=)" style={{width:'200px',marginLeft:20}} name='degree' placeholder="请输入" value={item.degree}
                                         onChange={this.inputChangeIndex.bind(this,index)}/>
                                    <div  style={{margin:'10px 0'}}>
                                        能量偏离与稳定度偏离的关联性：
                                     <Switch checked={item.relation == 0 ? false : true}  checkedChildren="且" unCheckedChildren="或"  onChange={this.switchChangeOr.bind(this,index)} />
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
                    title="声音周期品质等级"
                    visible={this.state.viewVisible}
                    onOk={this.viewCancel}
                    onCancel={this.viewCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div>  声音频段名称：{viewInfo.name}</div>
                    <div style={{margin:'5px 0',fontSize:'20px',fontWeight:'600'}}>频段设置(Hz)：  </div>
                    {
                        (viewInfo?.cycleDtoList || []).map((item, index) => {
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div style={{color:item.color}}>品质等级名称：{item.name}</div>
                                    </div>
                                    <span>能量正偏离大于等于:{item.db}</span>
                                    <span>能量负偏离大于等于{item.dbLowerLimit}</span>
                                    <span>密度正偏离大于等于{item.density}</span>
                                    <span>密度负偏离大于等于{item.densityLowerLimit}</span>
                                    <div  style={{margin:'10px 0'}}>
                                        能量偏离与密度偏离的关联性：
                                        {
                                            item.relation == 0 ? '或' : '且'
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