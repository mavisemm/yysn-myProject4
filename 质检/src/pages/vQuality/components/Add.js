
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
import { VtxUtil } from '@src/utils/util';
import { service } from '../service';
import { SketchPicker } from 'react-color';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styles from '../vQuality.less';
const { tenantId, userId, token } = vtxInfo;
const CheckboxGroup = Checkbox.Group;
class Add extends React.Component {
    state = {
        loading: false,
        visible:false,
        GradeColor:"",
        commonVisible:false,
        qualityGradeList:[],
    }
    componentDidMount() {
    }
    //===== 质量等级模式====
    getMode(){
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
                this.props.parent.freshPage(this,true);
               this.setState({
                   qualityGradeList: res.ret.items,
               })
           } else {
               message.error(res.err)
           }
       })
    }

    inputChange = (index, e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        const {qualityGradeList = []} = this.state;
        let arr = qualityGradeList;
        arr[index] = {
            ...arr[index],
            [e.target.name]: e.target.value
        }
        this.setState({
            qualityGradeList: arr
        })
    }
    handleChangeComplete = (color) => {
        this.setState({
            GradeColor: color.hex
        });
    };
    addCommonMode = () => {
        this.getMode();
        this.setState({
            commonVisible: true
        })
    }
    addGrade = ()=>{
        let arr = [
            {
                name:'',
                color:'',
                sort:''
            }
        ]
        const {qualityGradeList=[]}=this.state;
        let arr1 = qualityGradeList;
        this.setState({
            qualityGradeList: arr1.concat(arr)
        })
    }
    qualityGradeOk = ()=>{
          let params = {
              tenantId,
              list: this.state.qualityGradeList,
          }
          service.save(VtxUtil.handleTrim(params)).then(res => {
              if (res.rc == 0) {
                this.props.parent.freshPage(this, true);
                  message.success(res.msg)
              } else {
                  message.error(res.err)
              }
          })
        this.setState({
            commonVisible:false
        })
    }
    qualityGradeCancel=()=>{
        this.setState({
            commonVisible: false
        })
    }
    copy = ()=>{
        message.success('已复制到剪贴板')
    }
    render(){
        return (
            <div style={{marginTop:100}}>
                 <h3 style={{margin:'20px 0',fontWeight:600,fontSize:'20px'}}>品质等级管理：</h3>
                <Button type = "primary" onClick={()=>this.addCommonMode()} style={{marginBottom:10}}> 新增、编辑品质等级管理 </Button>
                <Modal
                    title="品质等级管理"
                    visible={this.state.commonVisible}
                    onOk={this.qualityGradeOk}
                    onCancel={this.qualityGradeCancel}
                      okText = "确认"
                      cancelText = "取消"
                >
                 
                    {
                        (this.state.qualityGradeList || []).map((item,index)=>{
                            return (
                                <div key={index}>
                                    <div style={{margin:"10px 0",color:item.color}}>品质等级：{item.name}</div>
                                    <Input addonBefore="品质等级名称：" style={{marginTop:5}} name='name' placeholder="请输入品质等级名称" value={item.name}
                                    onChange={this.inputChange.bind(this,index)}/>
                                    <Input addonBefore="颜色：" style={{marginTop:15,}} name='color' placeholder="请选择颜色rgb值" value={item.color}
                                    onChange={this.inputChange.bind(this,index)}/>
                                    <Input addonBefore="排序：" style={{marginTop:15}} name='sort' placeholder="请输入排序" value={item.sort}
                                    onChange={this.inputChange.bind(this,index)}/>
                                </div>
                            )
                        })
                    }

                    <div className={styles.colorFlex}>
                        <SketchPicker
                            color={ this.state.color }
                            onChangeComplete={ this.handleChangeComplete }
                        />
                        <CopyToClipboard
                            text={this.state.GradeColor}	
                            onCopy={()=>{
                                message.success('已复制到剪贴板')
                            }}
                        >
                            <Button type='primary' onClick={()=>this.copy.bind(this)}>复制颜色</Button>
                        </CopyToClipboard> 
                    </div>

                       <Button type='primary' onClick={()=>{this.addGrade()}}>新增品质等级模式</Button>
                </Modal>
            </div>
          
        )
    }
}

export default Add;