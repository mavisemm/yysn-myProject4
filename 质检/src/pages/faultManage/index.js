
import React from 'react';
import { connect } from 'dva';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate,VtxUpload } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
const { VtxUpload2 } = VtxUpload;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Tabs,Checkbox,Radio} from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import styles from './faultManage.less';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { service,service1  } from './service';
import SideBar from '@src/pages/sideBar';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
class faultManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          faultName: "",
          btnType:"",
          faultVisible:false,
          linkVisible:false,
          id:"",
          faultList:[],
          currentIndex:"",
          qualityList:[],
          detailDto: {},
          boxVisible:false,
          machineId:"",
          faultIdList:[],
          qualityFaultMachineDtos:[]
        };
    }

    componentDidMount() {
        this.getMachineList();
        this.getFaultList();
        this.getMode();
    }
    getMode =()=>{
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
      service1.getMode(VtxUtil.handleTrim(params)).then(res => {
          if (res.rc == 0) {
              this.setState({
                  qualityList: res.ret.items || [],
              })
          } else {
              message.error(res.err)
          }
      })
    }
    getMachineList() {
        let params = {
            tenantId
        }
        service1.getList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let dataList = res.ret;
                    dataList.map(item => {
                        item.machineList.map(itemp => {
                            itemp.checked = false;
                        })
                    })
                    this.setState({
                        machineList: dataList
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    // 查询故障类型列表
    getFaultList = ()=>{
         let params = {
             tenantId
         }
      service.getFaultList(params).then(res => {
          if (res.rc == 0) {
              if (res.ret) {
                const {detailDto,faultTypeDtoList,qualityFaultMachineDtos} = res.ret;
                  this.setState({
                    detailDto:detailDto || {},
                    faultList:faultTypeDtoList || [],
                    qualityFaultMachineDtos:qualityFaultMachineDtos || [],
                  })
              }
          } else {
              message.error(res.err);
          }
      })
  }

    inputChange = (e) =>{
      this.setState({
          [e.target.name]:e.target.value
      })
    }

    showModal = (type,row)=>{
      if(type == 1){
        this.setState({
          btnType:'add',
          id:"",
          faultName:"",
          faultVisible: true,
        })
      }else{
        // 2编辑
        this.setState({
          btnType:'edit',
          faultVisible: true
        })
      }
    }

    // ========================故障类型===========================
    handleOk = ()=>{
      // 新增故障类型
      const {faultName,id} = this.state;
      if(!faultName){
        message.error('故障名称不能为空！');
        return false;
      }
        let params = {
            id,
            faultName,
            tenantId
        }
        service.save(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
              this.getFaultList();
              this.setState({
                faultVisible: false,
              })
                
            } else {
                message.error(res.err);
            }
        })
    }
    
    handleCancel = ()=>{
      this.setState({
        faultVisible: false,
        linkVisible:false,
        boxVisible:false
      })
    }

    faultModal = (item,index)=>{
      this.setState({
        id:item.id,
        faultName:item.faultName,
        btnType:'edit',
        currentIndex:index,
        faultVisible:true,
      })
    }
    // 删除故障类型
    delete = ()=>{
        const {id} = this.state;
        service.delete([id]).then(res => {
            if (res.rc == 0) {
              this.getFaultList();
              this.setState({
                faultVisible: false,
              })
            } else {
                message.error(res.err);
            }
        })
    }
    // ==========================故障类型===========================

    // ===============================故障类型绑定品质等级开始========================
    radioChange = (e)=>{
      this.setState({
        templateId:e.target.value
      })
    }
    bindTemplate = ()=>{
      const {detailDto,templateId} = this.state;
      let params = {
        id: detailDto?.id || '',
        templateId,
        tenantId
      }
      service.bindTemplate(VtxUtil.handleTrim(params)).then(res => {
          if (res.rc == 0) {
              this.getFaultList();
              this.setState({
                  linkVisible: false,
              })
          } else {
              message.error(res.err);
          }
      })
    }
    // 删除
    deleteTemplate = ()=>{
      const {detailDto,templateId} = this.state;
      let params = {
        id: detailDto?.id || '',
      }
      service.deletebindTemplate(params).then(res => {
          if (res.rc == 0) {
              this.getFaultList();
          } else {
              message.error(res.err);
          }
      })
    }

    //  ===============================故障类型绑定品质等级结束========================


    // ===================机型绑定故障类型====================

    boxChange = (checkedValues) =>{
        this.setState({
          faultIdList:checkedValues,
        })
    }

    boxChangeAll = ()=>{
      const {faultList} = this.state;
      let checkedValues = [];
      for(let i = 0;i<faultList.length;i++){
        checkedValues.push(faultList[i].id)
      }
      this.setState({
        faultIdList:checkedValues
      })

    }

    bindModal = (row)=>{
      const {qualityFaultMachineDtos} = this.state;
      let checkedArr = [];
      for(let i = 0;i<qualityFaultMachineDtos.length;i++){
        let temp = qualityFaultMachineDtos[i];
        if (temp.machineId == row.id){
          if (temp.faultTypeDtoList){
            for(let j = 0;j<temp.faultTypeDtoList.length;j++){
              checkedArr.push(temp.faultTypeDtoList[j].id)
            }
          }
        }
      }
      this.setState({
        machineId:row.id,
        faultIdList: checkedArr,
        boxVisible:true
      })
    }

    boxOk = ()=>{
       const {faultIdList,machineId} = this.state;
      let params = {
        machineId,
        faultIdList,
        tenantId
      }
      service.bindMachine(params).then(res => {
          if (res.rc == 0) {
            this.setState({
              boxVisible:false,
            })
              this.getFaultList();
          } else {
              message.error(res.err);
          }
      })
    }

    // ===================机型绑定故障类型结束=============================

    render(){
      const {faultName,btnType,faultList,currentIndex,qualityList,detailDto,faultIdList} = this.state;
      return (
        <Page title='故障类型管理' style={{width:'90%'}}>
            < SideBar parent = {this}></SideBar>
            <div>
                <div className={styles.tabletitle}>
                  <div className={styles.bd}></div>
                  <p>故障类型：</p>
                </div>
                <div>
                  <div className={styles.typeStyle}>
                    {
                      (faultList || []).map((item, index) => {
                        return (
                            <div onClick={()=>this.faultModal(item,index)}  key={index} className={index === currentIndex?'typeTitleactive': 'typeTitle'}> {item.faultName} </div>
                        )
                      })
                    }
                    <img src={require('@src/assets/voice/addicon.png')} onClick={()=>this.showModal(1)}  className={styles.ml10}/>

                  </div>

                </div>

                {/* 品质等级关联 */}
                <div style={{margin:'20px 0',fontWeight:600,fontSize:'20px'}}>品质等级关联：{detailDto?.qualityTemplate} <Button type='primary' style={{margin:'0 10px'}} onClick={()=>{this.setState({linkVisible:true})}}>编辑</Button><Button type='danger' onClick={()=>{this.deleteTemplate()}}>删除</Button></div>
            </div>

                {/* 机型关联 */}
                  <div className={styles.headerStyles}>
                    <div className={styles.tabletitle}>
                      <div className={styles.bd}></div>
                      <p>机型关联：</p>
                    </div>
                    <div>
                      <div className={styles.ml10} style={{marginBottom:10}}>
                        {
                          (this.state.machineList || []).map((item, index) => {
                            return (
                            <div  key={index}>
                              <div style={{fontWeight:600,fontSize:'20px'}}> {item.name}：</div>
                              <div className={styles.typeStyle}>
                                {
                                  (item.machineList || []).map((itemp,indexp)=>{
                                    return <div onClick={()=>this.bindModal(itemp)} key={indexp}  className={itemp.checked?'typeTitleactive': 'typeTitle'}> {itemp.name} </div>
                                  })
                                }
                              </div>
                          </div>
                            )
                          })
                        }
                      </div>

                    </div>
                </div>
              
                {/* 新增*/}
                <Modal
                title="操作"
                visible={this.state.faultVisible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                >
                  {
                     btnType == 'edit' ? <div>
                      <BtnWrap>
                        <Button type='danger' onClick={()=>this.delete()}>删除</Button>
                        <Button type='primary'>编辑</Button>
                      </BtnWrap>
                     </div> : ''
                  }
                    <Input addonBefore="故障类型名称：" placeholder="请输入名称" value={faultName}
                     onChange={this.inputChange.bind(this)} name='faultName'/> 
                   
                </Modal>

                {/* 品质等级关联弹窗 */}
                <Modal
                title="故障类型关联品质等级"
                visible={this.state.linkVisible}
                onOk={this.bindTemplate}
                onCancel={this.handleCancel}
                >
                   <RadioGroup name="radiogroup" onChange={this.radioChange}>
                    {
                      (qualityList || []).map((item,index)=>{
                        return <Radio value={item.id} key={index}>{item.name}</Radio>
                      })
                    }
                  </RadioGroup>
                </Modal>

                {/* 关联机型弹窗 */}
              <Modal
                title="机型关联故障类型"
                visible={this.state.boxVisible}
                onOk={this.boxOk}
                onCancel={this.handleCancel}
                >
                   <div>
                    <br />
                    <Checkbox.Group onChange={this.boxChange} value={faultIdList}>
                      {
                        (faultList || []).map((item,index)=>{
                          return (
                            <Checkbox value={item.id} key={index}>{item.faultName}</Checkbox>
                          )
                        })
                      }
                    </Checkbox.Group>
                  </div>
                </Modal>
                    
         </Page>
        );
    }
}

export default faultManage;

