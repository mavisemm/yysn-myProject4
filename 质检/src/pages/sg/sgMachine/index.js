import React from 'react';
import { connect } from 'dva';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate,VtxUpload } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
const { VtxUpload2 } = VtxUpload;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Tabs,Checkbox} from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import styles from './sgMachine.less';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { service,service1 } from './service';
let title = '';
class sgMachine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            name: "",
            clickType:0,
            groupId:'',
            adminVisible:false,
            operateType:1,
            editInput:false,
            adminID:"",
            adminType:'',
            machineList:[],
            machineVisible:false,
            startFrequency:"",
            endFrequency:"",
            frequencyCount:"",
            standardList:[],
            libraryId:'',
            libraryName:"",
            title:""
        };

    }
    componentDidMount() {
        this.getList();
        this.getStandList();
    }
    // 标准库列表
    getStandList = ()=>{
      let params = {
          filterPropertyMap: [{
              code: "tenantId",
              operate: "EQ",
              value: tenantId
          }],
          pageIndex: 0,
          pageSize:100,
      }
      service1.getStandList(params).then(res => {
        if(res.rc == 0){
          this.setState({
            standardList:res.ret.items || []
          })
        } else {
            message.error(res.err);
        }
      })
    }
    showModal = (type, id) => {
      // 0,新增组，1，新增机型
      if(type == 0){
        title = '新增组别';
      } else if (type == 1) {
        title = '新增机型'
      }else{

      }
       this.setState({
          clickType: type,
          groupId: id || '',
          machineVisible: true,
          startFrequency:"",
          endFrequency:'',
          frequencyCount:"",
          name:"",
          libraryId:"",
          libraryName:""
       })
    }
    inputChange = (e) =>{
      this.setState({
          [e.target.name]:e.target.value
      })
    }
    // 操作弹窗
    adminDialog=(item,type)=>{
      // type0,组，type1，机型
      const {startFrequency, endFrequency, frequencyCount,id,name,libraryName,libraryId} = item;
      this.setState({
          adminVisible: true,
          adminID:id,
          name,
          adminType: type,
          startFrequency,
          endFrequency,
          frequencyCount,
          libraryName,
          libraryId
      })

      let dataList = this.state.machineList;
      dataList.map(itema=>{
        itema.machineList.map(itemp=>{
          itemp.checked = false;
          if(item.id == itemp.id){
            itemp.checked = true;
          }
        })
      })
      this.setState({
        machineList: dataList
      })
    }
    // 删除组/机型
    delete=()=>{
      const {adminID,adminType} = this.state;
      let params = [];
      params.push(adminID)
      if (adminType == 1) {
        // 删除组
        service.deleteGroup(params).then(res => {
            if (res.rc == 0) {
                message.success('删除成功');
                this.getList()
            } else {
                message.error(res.err);
            }
        })
      } 
      if (adminType == 2) {
        // 删除机型
         service.deleteMachine(params).then(res=>{
           if(res.rc == 0){
               message.success('删除成功');
             this.getList()
           } else {
               message.error(res.err);
           }
         })
      }
    }
    modeChange = (e) =>{
        const {standardList} = this.state;
        let libraryName = '';
        for(let i =0;i<standardList.length;i++){
          if(standardList[i].id == e){
            libraryName = standardList[i].name;
          }
        }
        this.setState({
          libraryId: e,
          libraryName
        })
    }
    edit(){
      const {name,adminID,adminType,startFrequency,libraryId,endFrequency,
            frequencyCount} = this.state;
      if (name) {
        
      }else{
        message.error('名称不能为空')
        return false;
      }
      let params = {
          name,
          id: adminID,
          tenantId,
          startFrequency,
          endFrequency,
          frequencyCount,
          libraryId
      }
        if(adminType == 1){
          // 修改组别
          service.updateGroup(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0){
              this.getList()
            } else {
                message.error(res.err);
            }
          })
        }else{
          // 修改机型
          service.updateMachine(VtxUtil.handleTrim(params)).then(res => {
               if (res.rc == 0) {
                   this.getList()
               } else {
                   message.error(res.err);
               }
          })

        }
    }
    handleCancel = (e) => {
        this.setState({
            visible: false,
        });
    }
    // 新增组别、机型方法
    handleMachineOk = (e)=>{
      const {name,groupId,startFrequency,endFrequency,frequencyCount,libraryId,clickType} = this.state;
      if (name) {
       
      }else{
        message.error('名称不能为空');
        return false;
      }

      let params = {
          name,
          groupId,
          tenantId,
          startFrequency, 
          endFrequency, 
          frequencyCount, 
          libraryId
      }
      let params0 = {
          name,
          tenantId
      }
      if (clickType == 0){
        // 新增组别
        service.addGroup(VtxUtil.handleTrim(params0)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    name: "",
                    machineVisible: false,
                })
                this.getList()
            } else {
                message.error(res.err);
            }
        })
      }else{
        // 新增机型
        service.addMachine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    machineVisible: false,
                })
                this.getList()
            } else {
                message.error(res.err);
            }
        })
      }

    }
    handleMachineCancel = (e) => {
        this.setState({
            machineVisible: false,
        });
    }
    // 机型操作确认弹窗
    okmachine = (e) =>{
      if (this.state.operateType == 2){
        this.delete();
      }else {
        this.edit();
      }
      this.setState({
        adminVisible:false
      })
    }
    cancelMachine = (e) => {
      this.setState({
        adminVisible: false,
        editInput:false
      })
    }
    // 操作弹窗
    operate=(type)=>{
      this.setState({
          editInput: false,
          operateType: type
      })
      if(type == 3){
        this.setState({
            editInput: true
        })
      }
    }
    getList=()=>{
      let params = {
          tenantId
      }
      service.getList(VtxUtil.handleTrim(params)).then(res => {
          if (res.rc == 0) {
              if(res.ret){
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

    render(){
      const {adminType,standardList,libraryName,name,clickType,startFrequency,endFrequency,frequencyCount} = this.state;
      return (
            <div className={styles.body}>
                <div>
                    <div className={styles.headerStylessg}>
                        <div className={styles.tabletitle}>
                          <div className={styles.bd}></div>
                          <p>机型管理：</p>
                        </div>
                          < Button type = "primary" onClick={()=>this.showModal(0,'')} style={{marginTop:10,marginLeft:10}}> 新增组 </Button>
                          {/* 添加机组 */}
                        <div>
                          <div className={styles.ml10} style={{marginBottom:10}}>
                            {
                              (this.state.machineList || []).map((item, index) => {
                                return (
                                <div  key={index}>
                                  <Button  type = "primary" ghost  onClick={()=>this.adminDialog(item,1)} className={styles.headTitle}>{item.name}：</Button>
                                  <div className={styles.typeStyle}>
                                    {
                                      (item.machineList || []).map((itemp,indexp)=>{
                                        return <div onClick={()=>this.adminDialog(itemp,2)} key={indexp}  className={itemp.checked?'typeTitleactive': 'typeTitle'}> {itemp.name} </div>
                                      })
                                    }
                                    <img src={require('@src/assets/voice/addicon.png')} onClick={()=>this.showModal(1,item.id)}  className={styles.ml10}/>
                                  </div>
                              </div>
                                )
                              })
                            }
                          </div>

                        </div>
                    </div>
                </div>
                {/* 新增机型 */}
                <Modal
                title={title}
                visible={this.state.machineVisible}
                onOk={this.handleMachineOk}
                onCancel={this.handleMachineCancel}
                >
                  {
                     (clickType == 0) ? <Input addonBefore="名称：" placeholder="请输入组别名称" value={name} required='true'
                     onChange={this.inputChange.bind(this)} name='name'/> : 
                      <div>
                        <Input addonBefore="名称：" placeholder="请输入名称" value={name} required='true'
                        onChange={this.inputChange.bind(this)} name='name'/> 
                        请选择标准：
                        <Select placeholder="请选择标准" value={libraryName} style={{width:'300px',marginTop:"10px"}} onChange={this.modeChange.bind(this)} >
                          {
                            standardList.map(item=>{
                              return  <Option value ={item.id} key={item.id}>{item.name}</Option>
                            })
                          }
                        
                        </Select>
                        <Input addonBefore="开始频率(Hz)："  style={{marginTop:"10px"}} placeholder="选填" value={startFrequency}
                        onChange={this.inputChange.bind(this)} name='startFrequency'/>
                        <Input addonBefore="结束频率(Hz)："  style={{marginTop:"10px"}} placeholder="选填" value={endFrequency}
                        onChange={this.inputChange.bind(this)} name='endFrequency'/>
                        <Input addonBefore="分段数量："  style={{marginTop:"10px"}} placeholder="选填" value={frequencyCount}
                        onChange={this.inputChange.bind(this)} name='frequencyCount'/>
                      </div> 
                   }
                </Modal>
                
                {/* 点击机型管理 */}
                <Modal
                title="操作弹窗"
                visible={this.state.adminVisible}
                onOk={this.okmachine}
                onCancel={this.cancelMachine}
                >
                  {/* 1，组，2、机型 */}
                  <Button onClick={() => this.operate(2)} className={styles.ml10} type='danger'>   {
                    adminType == 1 ? '删除组' : '删除该机型'
                  }  </Button>
                   <Button onClick={() => this.operate(3)} className={styles.ml10}>  {
                    adminType == 1 ? '编辑组' : '编辑该机型'
                  } </Button>
             
                   {
                     (this.state.editInput && adminType == 2) ?
                        <div>
                            <Input addonBefore="名称：" placeholder="请输入名称" style={{marginTop:10}} value={name} name='name'
                            onChange={this.inputChange.bind(this)}/> 
                            请选择标准：
                            <Select placeholder="请选择标准" value={libraryName} style={{width:'300px',marginTop:"10px"}} onChange={this.modeChange.bind(this)} >
                              {
                                standardList.map(item=>{
                                  return  <Option value ={item.id} key={item.id}>{item.name}</Option>
                                })
                              }
                            
                            </Select>
                            <Input addonBefore="开始频率(Hz)："  style={{marginTop:"10px"}} placeholder="" value={startFrequency}
                            onChange={this.inputChange.bind(this)} name='startFrequency'/>
                            <Input addonBefore="结束频率(Hz)："  style={{marginTop:"10px"}} placeholder="" value={endFrequency}
                            onChange={this.inputChange.bind(this)} name='endFrequency'/>
                            <Input addonBefore="分段数量："  style={{marginTop:"10px"}} placeholder="" value={frequencyCount}
                            onChange={this.inputChange.bind(this)} name='frequencyCount'/>
                        </div>
                     :''
                   }

                    {
                     (this.state.editInput && adminType == 1) ?
                        <div>
                            <Input addonBefore="名称：" placeholder="请输入名称" style={{marginTop:10}} value={name} name='name'
                            onChange={this.inputChange.bind(this)}/> 
                        </div>
                     :''
                   }
                </Modal>
            </div>
        );
    }

}

export default sgMachine;

