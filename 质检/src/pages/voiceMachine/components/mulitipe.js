import React,{ Component } from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';
// 子部件
import { Tree,Icon,Modal,Input,Badge,message,Select,Form ,Checkbox,Tabs } from 'antd';
import  './App.less';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import styles from '../voiceMachine.less';

@Form.create()
class Mulitipe extends Component {
    state = {
        speed: "",
        editVisible:false,
        list:[
            {
                name:'一级传动',
                sort:1,
                childTeeth:"",
                parentTeeth:"",
                period: "",
                checked:false,
            },
            {
                name: '二级传动',
                sort: 2,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
            {
                name: '三级传动',
                sort: 3,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
            {
                name: '四级传动',
                sort: 4,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
            {
                name: '五级传动',
                sort:5,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
            {
                name: '六级传动',
                sort: 6,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },

            {
                name: '七级传动',
                sort: 7,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
            {
                name: '八级传动',
                sort: 8,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
            {
                name: '九级传动',
                sort: 9,
                childTeeth: "",
                parentTeeth: "",
                period: "",
                checked: false,
            },
        ]
    };
    componentWillMount() {

    }
    componentWillReceiveProps(props) {
        if (props.activekey ==1){
            this.getList(props.machineTypeId);
        }
    }
    componentDidMount() {
        this.getList();
    }
    getList(id) {
        let params = {
            tenantId,
            machineTypeId: id || this.props.machineTypeId
        }
        service.manageByMultistage(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let arr = this.state.list;
                    for (let i = 0; i < res.ret.list.length; i++) {
                        arr[i] = res.ret.list[i],
                        arr[i].checked = true;
                    }
                    this.setState({
                        list: arr,
                        speed: parseInt(Number(res.ret.speed) * 60),
                        editVisible: true
                    })
                } else {
                    this.setState({
                        editVisible: false
                    })
                }
            } else {
                message.error(res.err)
            }
        })
    }
    inputChange1 = (e,index) => {
        let arr = this.state.list;
        arr[index].parentTeeth = e.target.value;
        this.setState({
            list:arr
        })
         this.calMultistageCycle(index)
    }
    inputChange2 = (e,index) => {
            let arr = this.state.list;
        arr[index].childTeeth = e.target.value;
        this.setState({
            list:arr
        })
        this.calMultistageCycle(index)
    }
    inputSpeed = e => {
        this.setState({
            speed: e.target.value
        })
    }
    //计算周期
    calMultistageCycle(index) {
        let arr = this.state.list;
        let newarr = [];
        if (arr[index].parentTeeth && arr[index].childTeeth) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].parentTeeth == '' || arr[i].childTeeth == '') {} else {
                    newarr.push(arr[i])
                }
            }
            let params = {
                list: newarr,
                speed: (Number(this.state.speed)/60).toFixed(2),
                tenantId,
                machineTypeId: this.props.machineTypeId
            }
            service.calMultistageCycle(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {
                    if (res.ret) {
                        let arr = this.state.list;
                        for (let i = 0; i < res.ret.length; i++) {
                            arr[i].period = res.ret[i]
                            arr[i].checked = true;
                        }
                    }
                    this.setState({
                        list: arr
                    })
                } else {
                    message.error(res.err)
                }
            })
        }
    }
    checkGroup = (item, index) => {
        let dataList = this.state.list;
        dataList[index].checked = !dataList[index].checked;
        this.setState({
            list: dataList
        })
    }
    // 提交
  submitMulitity = () =>{
    let arr = this.state.list;
    let newarr = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].parentTeeth == '' || arr[i].childTeeth == '') {

        } else {
            if(arr[i].checked){
                newarr.push(arr[i])
            }
        }
    }

    if (this.state.editVisible){
        // 编辑
        let dataArr = [];
        for (let j = 0; j < newarr.length; j++) {
                dataArr.push({
                    id:newarr[j].id || '',
                    name: newarr[j].name,
                    sort: newarr[j].sort,
                    period: newarr[j].period,
                    childTeeth: newarr[j].childTeeth,
                    parentTeeth: newarr[j].parentTeeth,
                })
        }
        let params = {
            list: dataArr,
            speed: (Number(this.state.speed)/60).toFixed(2),
            tenantId,
            machineTypeId: this.props.machineTypeId
        }
        service.updateMultistage(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('提交成功')
            } else {
                message.error(res.err)
            }
        })
    }else{
        let params = {
            list: newarr,
            speed: (Number(this.state.speed)/60).toFixed(2),
            tenantId,
            machineTypeId: this.props.machineTypeId
        }
        service.addMultistage(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('提交成功')
            } else {
                message.error(res.err)
            }
        })
    }

  }
    // 计算周期
  render() {
    const {list} = this.state;
    return (
        <div className='treeList' style={{marginTop:10}}>
            <Input addonBefore="转速(转/分钟)：" placeholder="请输入转速" style={{width:200}} value={this.state.speed}
                onChange={this.inputSpeed.bind(this)}/>
            <div className={styles.machineTable}>
                <div className={styles.machineTableTitle}>
                    <div style={{width:'10%'}}></div>
                    <div style={{width:'15%'}}>级数</div>
                    <div style={{width:'30%'}}>上级齿数</div>
                    <div style={{width:'30%'}}>下级齿数</div>
                    <div style={{width:'15%'}}>周期(ms)</div>
                </div>
                {/* 一级 */}
                {
                    list.map((item,index)=>{
                        return (
                            <div className={styles.machineTableList} key={index}>
                                <div style={{width:'10%'}}>
                                    {
                                        item.checked ? <img src={require('@src/assets/voice/checked.png')} className = {styles.checkedicon}    onClick={()=>this.checkGroup(item,index)}/> :
                                        <img src={require('@src/assets/voice/uncheck.png')} className = {styles.checkedicon}    onClick={()=>this.checkGroup(item,index)}/>
                                    }
                                    
                                </div>
                                <div style={{width:'15%'}}>{item.name}</div>
                                <Input placeholder="请输入上级齿数" style={{width:150}} 
                                    onChange = {
                                        e => this.inputChange1(e,index)
                                    }
                                    value = {
                                        item.parentTeeth
                                    }
                                    />
                                <Input placeholder="请输入下级齿数" style={{width:150,marginLeft:20}} 
                                        onChange = {
                                            e => this.inputChange2(e,index)
                                        }
                                        value = {
                                            item.childTeeth
                                        }
                                    />
                                <div style={{width:'20%'}}>{item.period}</div>
                            </div>
                        )
               
                    })
                }
            </div>
            < Button type = "primary" style={{margin:'20px'}} onClick={()=>this.submitMulitity()}>  提交 </Button>
        </div>
    );
  }
}
export default Mulitipe;
