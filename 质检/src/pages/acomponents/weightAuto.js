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
const { tenantId, userId, token } = vtxInfo;
let freq1 = '';
let freq2 = '';
class bzFrequency extends React.Component {
    state = {
        loading: false,
        groupList: [],
        dbList:[],
        densityList:[]

    }
    componentDidMount() {
        const {groupList,groupIndex} = this.props;
        this.setState({
            groupList,
            groupIndex,
        },()=>{
            this.initData()
        })
    }

     componentWillReceiveProps(newProps) {
        const {groupList,groupIndex} = newProps;
        this.setState({
            groupList,
            groupIndex,
        },()=>{
            this.initData()
        })
        
     }
     initData = ()=>{
        const {groupList,groupIndex} = this.state;
        if(groupList[groupIndex]){
            let dbList = groupList[groupIndex].dbList ? groupList[groupIndex].dbList : [];
            let densityList = groupList[groupIndex].densityList ? groupList[groupIndex].densityList : [];
            this.setState({
                dbList,
                densityList
            })
        }
     }
    //  =========频段设置开始===========
     // 新增频段名称
    add = (type)=>{
        let arr = [{
            freq1:"",
            freq2: "",
            value:"",
        }]
        if(type == 1){
             const {dbList = []} = this.state;
            this.setState({
                dbList: dbList.concat(arr),
            })
        }else{
            const {densityList = []} = this.state;
            this.setState({
                densityList: densityList.concat(arr),
            })
        }
  
    }
    inputChangeIndex = (index,e)=>{
        const {dbList = [],groupIndex,groupList} = this.state;
        let arr = [...dbList];
        arr[index]={
            ...arr[index],
            [e.target.name]: e.target.value
        }
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            dbList:arr
        }
        this.setState({
            dbList: arr,
            groupList
        },()=>{
            this.props.parent.getWeightSet(this, groupList);
        })
    }
    copy = (type)=>{
        const {dbList,densityList,groupList,groupIndex} = this.state;
        if(type == 1){
            // 能量复制到密度
            groupList[groupIndex] = {
                ...groupList[groupIndex],
                densityList:dbList
            }
            this.setState({
                densityList:dbList
            })
        }else{
            // 密度复制到能量
            groupList[groupIndex] = {
                ...groupList[groupIndex],
                dbList:densityList
            }
            this.setState({
                dbList:densityList
            })
        }
        this.setState({
            groupList
        },()=>{
            this.props.parent.getWeightSet(this, groupList);
        })
    }
    inputChangeIndex1 = (index,e)=>{
        const {densityList = [],groupIndex,groupList} = this.state;
        let arr = [...densityList];
        arr[index]={
            ...arr[index],
            [e.target.name]: e.target.value
        }
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            densityList:arr
        }
        this.setState({
            densityList: arr,
            groupList
        },()=>{
            this.props.parent.getWeightSet(this, groupList);
        })
    }
    // 频段确认弹窗
    freqOk = ()=>{
        const {name,groupList,dbList,densityList,groupIndex  } = this.state;
        const numRegex = /^[+-]?\d+(\.\d+)?$/;
        if(dbList.length){
            for (let i = 0; i < dbList.length; i++) {
                let obj = dbList[i];
                if(obj.freq1 == '' || obj.freq2 == ''){
                    message.error('开始频率、结束频率必填!')
                    return false;
                }
                if (Number(obj.freq1) > Number(obj.freq2)) {
                    message.error('开始频率不能大于结束频率！');
                    return false;
                } 
                if(obj.value == ''){
                    message.error('权重不能为空!')
                    return false;
                }
           
            }
        }
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            dbList,
            densityList
        }
        
    }
    // ==========频段设置结束============
    // 删除
    delete = (record,index,type)=>{
        const {dbList,groupList,groupIndex} = this.state;
        let arr = [...dbList];
        arr.splice(index, 1);
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            dbList:arr,
        }
        this.setState({
            dbList: arr,
            groupList
        },()=>{
            this.props.parent.getWeightSet(this, groupList);
        })
    }
    delete1 = (record,index,type)=>{
        const {densityList,groupList,groupIndex} = this.state;
        let arr = [...densityList];
        arr.splice(index, 1);
        groupList[groupIndex] = {
            ...groupList[groupIndex],
            densityList:arr,
        }
        this.setState({
            densityList: arr,
            groupList
        },()=>{
            this.props.parent.getWeightSet(this, groupList);
        })
    }
    render(){
        const {id ,groupList,color ,densityList,dbList } = this.state;
        return (
            <div style={{width:'100%',marginTop:10}}>
                <div className={styles.weightWrap}>
                    <div style={{width:'45%'}}>
                        {
                            (dbList || []).map((item,index)=>{
                                return (
                                    <div key={index}>
                                        <div className={styles.freqFlexNew}>
                                            <Input name='freq1' addonBefore='开始频段' placeholder="请输入开始频段" value={item.freq1} style={{width:160}}
                                            addonAfter='Hz' onChange={this.inputChangeIndex.bind(this,index)}/>
                                            <Input  name='freq2' addonBefore='结束频段' addonAfter='Hz' placeholder="请输入结束频段" value={item.freq2}  style={{width:160,marginLeft:10}}
                                            onChange={this.inputChangeIndex.bind(this,index)}/>
                                            <Input addonBefore="能量权重" style={{width:160,marginLeft:10}} name='value' placeholder="请输入" value={item.value}
                                            onChange={this.inputChangeIndex.bind(this,index)}/>
                                            <Button type='danger' style={{width:'100',marginLeft:10}} onClick={()=>this.delete(item,index)}>删除</Button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                          <BtnWrap>
                            <Button type = "primary" onClick={()=>this.add(1)}> 新增能量权重 </Button>
                            <Button  style={{marginTop:10}} onClick={()=>this.copy(1)}> 复制到密度 </Button>
                        </BtnWrap>
                    </div>
                 
                    <div style={{width:'45%'}}>
                        {
                            (densityList || []).map((item,index)=>{
                                return (
                                    <div key={index}>
                                        <div className={styles.freqFlexNew}>
                                            <Input name='freq1' addonBefore='开始频段' placeholder="请输入开始频段" value={item.freq1} style={{width:160}}
                                            addonAfter='Hz' onChange={this.inputChangeIndex1.bind(this,index)}/>
                                            <Input  name='freq2' addonBefore='结束频段' addonAfter='Hz' placeholder="请输入结束频段" value={item.freq2}  style={{width:160,marginLeft:10}}
                                            onChange={this.inputChangeIndex1.bind(this,index)}/>
                                            
                                            <Input addonBefore="密度权重" style={{width:160,marginLeft:10}} name='value' placeholder="请输入" value={item.value}
                                            onChange={this.inputChangeIndex1.bind(this,index)}/>
                                            <Button type='danger' style={{width:'100',marginLeft:10}} onClick={()=>this.delete1(item,index)}>删除</Button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                            <BtnWrap>
                                <Button type = "primary" onClick={()=>this.add(2)}> 新增密度权重 </Button>
                                <Button  onClick={()=>this.copy(2)}> 复制到能量 </Button>
                            </BtnWrap>
                    </div>
                   
                </div>
          
                {/* <BtnWrap>
                    <Button type = "primary" onClick={()=>this.freqOk()}> 保存权重频段设置 </Button>
                </BtnWrap> */}

            </div>
        )
    }
}

export default bzFrequency;