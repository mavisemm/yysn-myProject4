import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon,Table,Checkbox,Tabs,Switch } from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
import styles from './vQuality.less';
import { VtxUtil } from '@src/utils/util';
import { service2 } from './service';
const { tenantId, userId, token } = vtxInfo;
const CheckboxGroup = Checkbox.Group;
class bzSudden extends React.Component {
    state = {
        name: "",
        singleFreq1: "",
        singleFreq2: "",
        minDb: "",
        minDensity: "",
        milSeconds: "",
}
    componentDidMount() {
        const {name,singleFreq1,singleFreq2,minDb,minDensity,milSeconds} = this.props.suddenInfo;
        this.setState({
            name, singleFreq1, singleFreq2, minDb, minDensity, milSeconds
        }, () => {
        })
    }

     componentWillReceiveProps(newProps) {
        const {
            name,
            singleFreq1,
            singleFreq2,
            minDb,
            minDensity,
            milSeconds
        } = newProps.suddenInfo;
        this.setState({
           name, singleFreq1, singleFreq2, minDb, minDensity, milSeconds
        },()=>{
        })
     }

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        

    }
    saveStandardLine = ()=>{
        const {singleFreq1,singleFreq2,minDb,minDensity,milSeconds,name} = this.state;
        let obj = this.state;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 判断属性值是否为空
                if (obj[key] === undefined || obj[key] === '' || obj[key] < 0) {
                    message.error('请检查是否填写完整,所有值不能为负数')
                    return false
                }
            }
        }
        if(Number(singleFreq1) > Number(singleFreq2)){
            message.error('开始频率不能大于结束频率！');
            return false;
        }
        let params = {
            name,
            singleFreq1,
            singleFreq2,
            minDb,
            minDensity,
            milSeconds
        }
        this.props.parent.getSuddenSet(this,params);
    }

    render(){
        const {singleFreq1,singleFreq2,minDb,minDensity,milSeconds,name,updateVisible,} = this.state;
        return (
            <div>
                <Input name='name' addonBefore='突发声音名称' placeholder="请输入突发声音名称" value={name} style={{width:'400px'}}
                    onChange={this.inputChange.bind(this)}/>
                    <span style={{color:'red'}}>提示：突发声音中下方所选择的数据不计入计算结果 </span>
                <div className={styles.gradeflex}>
                    <Input addonBefore="开始频率：" name="singleFreq1" placeholder="" value={singleFreq1}
                        onChange={this.inputChange.bind(this)} style={{width:"200px"}} addonAfter='Hz'/>
                    <Input addonBefore="结束频率：" name="singleFreq2" placeholder="" value={singleFreq2}
                        onChange={this.inputChange.bind(this)} style={{width:"200px",margin:"0 10px"}} addonAfter='Hz'/>
                    <Input addonBefore="能量(>=)：" name="minDb" style={{width:"200px"}} placeholder="" value={minDb}
                        onChange={this.inputChange.bind(this)} addonAfter='db'/>    
                    <Input addonBefore="密度(>=)：" name="minDensity" style={{width:"200px",margin:"0 10px"}} placeholder="" value={minDensity}
                        onChange={this.inputChange.bind(this)} addonAfter='%'/>   
                    <Input addonBefore="持续时间(ms)：" name="milSeconds" style={{width:"200px"}} placeholder="" value={milSeconds}
                        onChange={this.inputChange.bind(this)}/>   
                </div>
                <Button  style={{backgroundColor:'green',color:'white'}} onClick={()=>this.saveStandardLine()}><Icon type="save" />保存</Button>
                
            </div>
        )
    }
}

export default bzSudden;