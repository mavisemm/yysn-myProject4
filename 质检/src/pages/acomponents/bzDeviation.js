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
import { service2,service3 } from './service';
const { tenantId, userId, token } = vtxInfo;
const CheckboxGroup = Checkbox.Group;
class BzDeviation extends React.Component {
    state = {
        loading: false,
        freqVisible:false,
        templateName: "",
        templateColor: '',
        templateId:"",
        standardDeviationGroupDtoList:[],
        userType:'add',
        currentIndex:'',
        viewVisible:false,
        viewInfo:{},
        deviationDetailDtos:[],
        relation:0,
        confirmFlag:false,
        deleteIndex:''
    }
    componentDidMount() {
        const {standardDeviationGroupDtoList} = this.props;
        this.setState({
            standardDeviationGroupDtoList
        })
    }
    componentWillReceiveProps(newProps) {
        const {standardDeviationGroupDtoList} = newProps;
        this.setState({
            standardDeviationGroupDtoList
        })
     }
    //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            templateName: "",
            templateColor: "",
            templateId: "",
            deviationDetailDtos: [],
            userType: 'add',
            freqVisible: true,
        })
    }
    // 新增偏离度参数组
    addParams = ()=>{
        const {deviationDetailDtos} = this.state;
        let arr = [...deviationDetailDtos];
        arr.push({
            conditionId: '',
            conditionName: "",
            thresholdValue:""
        })
        this.setState({
            deviationDetailDtos: arr
        })

    }
    modeChangeFreq = (e) => {
        const {qualityList} = this.props;
        let templateName = '';
        let templateColor = '';
        let templateId = '';
        for(let i = 0;i<qualityList.length;i++){
            if(qualityList[i].id == e){
                templateName = qualityList[i].name;
                templateColor = qualityList[i].color;
                templateId = qualityList[i].id;
            }
        }
        this.setState({
             templateName,
             templateColor,
             templateId,
        })
    }

    modeChangeParam = (indexp,e) =>{
        const {deviationList} = this.props;
        let tempArr = this.state.deviationDetailDtos;
        let conditionName = '';
        let conditionId = '';
        for (let i = 0; i < deviationList.length; i++) {
            if (deviationList[i].id == e) {
                conditionName = deviationList[i].name;
                conditionId = deviationList[i].id;
            }
        }
        tempArr[indexp] = {
            ...tempArr[indexp],
            conditionName,
            conditionId
        }
        this.setState({
             deviationDetailDtos: tempArr
        })
    }
    // =======================================
    // 编辑信息
    edit=(record,index)=>{
        const {relation,templateName,deviationDetailDtos,templateId,templateColor,confirmFlag} = record;
        // console.log(record, 'record')
        this.setState({
            currentIndex:index,
            relation, 
            templateName,
            templateId, templateColor,
            deviationDetailDtos,
            userType:'edit',
            confirmFlag,
            freqVisible:true,
        })
    }
    checkBoxChange = (e) => {
        this.setState({
            confirmFlag: e.target.checked
        })
    }
    // 频段确认弹窗
    freqOk = ()=>{
        const {templateName,standardDeviationGroupDtoList,deviationDetailDtos ,
        currentIndex, userType, relation, templateId, templateColor, confirmFlag
        } = this.state;

        if(deviationDetailDtos.length) {
            for (let i = 0; i < deviationDetailDtos.length; i++) {
                let obj = deviationDetailDtos[i];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        // 判断属性值是否为空
                        if (obj[key] === '' || obj[key] < 0) {
                            message.error('特殊品质等级中,请检查是否填写完整,所有值不能为负数')
                            return false
                        }
                    }
                }
            }
        }else{
             message.error('参数组不能为空')
        }
        
        if (templateName == '' || templateColor == '') {
            message.error('参数不能为空')
            return false
        }
        let arr = [...standardDeviationGroupDtoList];
        if(userType == 'add'){
            let tempArr = [{
                templateName,
                templateColor,
                templateId,
                confirmFlag,
                deviationDetailDtos
            }]
            let tempArr1 = standardDeviationGroupDtoList.concat(tempArr);
            this.setState({
                standardDeviationGroupDtoList: tempArr1,
           
                freqVisible:false,
            })
            this.props.parent.getDeviationSet(this, tempArr1);
         }else{
            // 编辑‘
            arr[currentIndex]={
                ...arr[currentIndex],
                relation,
                templateId,
                templateColor,
                relation,
                deviationDetailDtos,
                confirmFlag
            }
            this.setState({
                standardDeviationGroupDtoList:arr,
                freqVisible:false,
            })
            this.props.parent.getDeviationSet(this, arr);
         }  
       
        
    }
    freqCancel = ()=>{
        this.setState({
            freqVisible:false,
        })
    }
    inputChangeIndex = (indexp,e)=>{
        this.setState({
            [e.target.name]: e.target.value
        })
        const {deviationDetailDtos = []} = this.state;
        let arr = [...deviationDetailDtos];
        arr[indexp] = {
            ...arr[indexp],
            [e.target.name]: e.target.value
        }
        this.setState({
            deviationDetailDtos: arr
        })
    }
    // ==========频段设置结束============

    switchChangeOr = (checked)=>{
        this.setState({
           relation: checked ? 1 : 0,
        })
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 删除品质等级
    delete = (index)=>{
        const {standardDeviationGroupDtoList,deleteIndex} = this.state;
        let arr = [...standardDeviationGroupDtoList];
        arr.splice(deleteIndex, 1);
        this.setState({
            standardDeviationGroupDtoList: arr,
        })
        this.props.parent.getDeviationSet(this, arr);
    }

    deleteMode = (index)=>{
        this.setState({
            deleteIndex:index
        })
    }

    // 删除参数组
    deleteParam = (index)=>{
         const {deviationDetailDtos = []} = this.state;
        let arr = [...deviationDetailDtos];
        arr.splice(index, 1);
        this.setState({
            deviationDetailDtos: arr
        })
    }

    // =========================查看=============================
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

    render(){
        const {standardDeviationGroupDtoList,viewInfo,deviationDetailDtos,confirmFlag,templateColor,relation,templateId } = this.state;
        return (
            <div>
                <Button type = "primary" style={{margin:'10px 0'}} onClick={()=>this.add()}> 新增偏离度品质等级 </Button>
                {
                    (standardDeviationGroupDtoList || []).map((item,index)=>{
                        return (
                            <div key={index}>
                                <div>品质等级名称：{item.name} &nbsp;&nbsp;&nbsp;&nbsp;< Button type='primary' onClick={()=>this.view(item)}>查看 </Button> < Button type='primary' onClick={()=>this.edit(item,index)}> 编辑 </Button> 
                                <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                                 < Button type='danger' style={{marginLeft:10}} onClick={()=>this.deleteMode(index)}> 删除 </Button>
                                </Popconfirm> 
                                </div>
                            </div>
                        )
                    })
                }
           
                {/* 频段声音管理 */}
                <Modal
                    title="声音偏离度品质等级"
                    visible={this.state.freqVisible}
                    onOk={this.freqOk}
                    onCancel={this.freqCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    {
               
                        <div >
                            <div className={styles.gradeflex}>
                                <div style={{color:templateColor}}>品质等级名称：</div>
                                    <Select value={templateId} style={{ width: 300 }}  onChange={this.modeChangeFreq.bind(this)}>
                                    {
                                        (this.props.qualityList || []).map((item, index) => {
                                            return (
                                                <Option value={item.id} key={index}> {item.name} </Option>
                                            )
                                        })
                                    }
                                </Select>
                            </div>
                            {
                                (deviationDetailDtos || []).map(((itemp,indexp)=>{
                                    return (
                                        <div style={{margin:'10px 20px'}} key={indexp}>
                                            <div className={styles.gradeflex}>
                                                <div>偏离度参数组名称：</div>
                                                <Select value={itemp.conditionName} style={{ width: 300 }}  onChange={this.modeChangeParam.bind(this,indexp)}>
                                                    {
                                                        (this.props.deviationList || []).map((itemc, indexc) => {
                                                            return (
                                                                <Option value={itemc.id} key={indexc}> {itemc.name} </Option>
                                                            )
                                                        })
                                                    }
                                                </Select>
                                            </div>
                                            <div  style={{margin:'10px 0'}}>
                                                <Input addonBefore="偏离度(>=)" style={{width:'150px'}} name='thresholdValue' placeholder="请输入" value={itemp.thresholdValue}
                                                onChange={this.inputChangeIndex.bind(this,indexp)}/>
                                                <Button type='danger' style={{margin:'0 10px'}} onClick={()=>this.deleteParam(indexp)}>删除此参数组</Button>
                                            </div>
                                
                                        </div>
                                    )
                                }))
                            }

                            <Button onClick={()=>this.addParams()}> 新增偏离度参数组 </Button>
                            <div  style={{margin:'10px 0'}}>
                                偏离度参数组之间的关联性：
                                <Switch checked={relation == 0 ? false : true}  checkedChildren="且" unCheckedChildren="或"  onChange={this.switchChangeOr.bind(this)} />
                            </div>
                            <Checkbox checked={confirmFlag} onChange={this.checkBoxChange.bind(this)}>确定合格</Checkbox>
                        </div>
                    }
                </Modal>

                {/* 查看 */}
                  <Modal
                    title="声音偏离度品质等级"
                    visible={this.state.viewVisible}
                    onOk={this.viewCancel}
                    onCancel={this.viewCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
            
                    
            
                    <div style={{color:viewInfo.templateColor}}>品质等级名称：{viewInfo.templateName}</div>
                    {
                        (viewInfo?.deviationDetailDtos || []).map(((itemp, indexp) => {
                            return (
                                <div style={{margin:'10px 20px'}} key={indexp}>
                                    <div className={styles.gradeflex}>
                                        <div>偏离度参数组名称：{itemp.conditionName}</div>
                                    </div>
                                    <div  style={{margin:'10px 0'}}>
                                        偏离度大于等于:{itemp.thresholdValue}
                                    </div>
                                </div>
                            )
                        }))
                    }
                    <div  style={{margin:'10px 10px'}}>
                        偏离度参数组之间的关联性：{viewInfo.relation == 0 ? '或' : '且'}
                    </div>
                    <Checkbox checked={viewInfo?.confirmFlag} disabled>确定合格</Checkbox>

                </Modal>
            </div>
        )
    }
}

export default BzDeviation;