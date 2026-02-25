
import React from 'react';
import { connect } from 'dva';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate,VtxUpload } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
const { VtxUpload2 } = VtxUpload;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Tabs,Checkbox,Popconfirm,DatePicker } from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
import styles from './voiceMachine.less';
import TreeList from './components/Tree';
import CycleList from './components/cycleList';
import CycleSet from '@src/pages/acomponents/cycleSet';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { service } from './service';
import moment from 'moment';
import SideBar from '@src/pages/sideBar';
class voiceMachineModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name:"",
            addType:0,
            groupId:'',
            btnType:"",
            machineVisible:false,
            timechecked:false,
            partchecked:false,
            machineList:[],
            machineVisible:false,
            managementType:1,
            speedList:[
            {
                speed:""
            },
            {
                speed: ""
            },
            {
                speed: ""
            },
            {
              speed:""
            },
            {
              speed: ""
            },
          ],
          startFrequency:"",
          endFrequency:"",
          frequencyCount:"",
          imageList:[],
          freqDetailDtos:[],
          dbP:"1.25",
          fileListVersion:1,
          pollingIntervalTime:"",
          machineCode:"",
          headThreshold:"",
          delayMs:"",
          extractDurationMs:""
        };
    }
    componentDidMount(){
      this.getList()
    }
    getList(){
      let params = {
          tenantId
      }
      service.getList(VtxUtil.handleTrim(params)).then(res => {
          if (res.rc == 0) {
              if(res.ret){
                this.setState({
                  machineList: res.ret
                })
              }
          } else {
              message.error(res.err);
          }
      })
    }

    // ==========================操作性========================
    inputChange = (e) =>{
      this.setState({
          [e.target.name]:e.target.value
      })
    }
    clear = ()=>{
      this.setState({
          name: "",
          speedList:[
            {
              speed:""
            },
            {
              speed: ""
            },
            {
                speed: ""
            },
            {
                speed: ""
            },
            {
                speed: ""
            },
          ],
          startFrequency: "",
          endFrequency: "",
          frequencyCount: "",
          imageList: [],
          managementType: 1,
          freqDetailDtos:[],
          machineVisible: false,
          groupVisible: false,
          dbP:'',
          listenTime:"5",
          pollingIntervalTime:'',
          machineCode:"",
          freqeditVisible:false,
      })
      this.getList()
    }
    getCycleSet = (result, msg) => {
        this.setState({
            freqDetailDtos: msg
        })
    }
    inputChangeIndex = (index, e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        const {
            speedList = []
        } = this.state;
        let arr = [...speedList];
        arr[index] = {
            ...arr[index],
            [e.target.name]: e.target.value
        }
        this.setState({
            speedList: arr
        })
    }
    handleCancle = () => {
        this.clear();
        this.setState({
            machineVisible: false,
            groupVisible: false
        })
    }
    // =============================操作性结束============================
  
  // ===========================机型管理===================================
    showMachineModal = (item, btnType) => {
      if(btnType == 'edit'){
          const {startFrequency, endFrequency, frequencyCount,
            fileId,fileName,filePath,fileUrl,dbP,speedList,
            id,groupId,name,managementType,freqDetailDtos =[],listenTime,pollingIntervalTime,machineCode,headThreshold,delayMs,extractDurationMs
          } = item;
          const {fileListVersion} = this.state;
          let speedArr = [];
          speedArr = [...speedList];
          let arr = [{
              speed: ''
          }, {
              speed: ""
          }, {
              speed: ''
          }];
        speedArr = speedArr.concat(arr);
        let imageList = [];
        if(fileId){
          imageList.push({
              id: fileId,
              name: fileName,
              fileId,
              fileName,
              filePath,
              fileUrl
          })
        }
        this.setState({
          groupId,
          machineId:id,
          name,
          managementType,
          freqDetailDtos,
          speedList: speedArr,
          startFrequency,
          endFrequency,
          frequencyCount,
          imageList,
          dbP,
          btnType,
          fileListVersion: Number(fileListVersion) + 1,
          listenTime,pollingIntervalTime,machineCode,
          machineVisible: true,headThreshold,delayMs,extractDurationMs
        })
      }else{
          this.setState({
              groupId: item,
              btnType,
              machineVisible: true,
          })
      }
    }
    fastAddMachine = ()=>{
      const {freqDetailDtos} = this.state;
      let freqDetailDtosArr = [];
      if (freqDetailDtos && freqDetailDtos.length) {
        for(let i = 0;i<freqDetailDtos.length;i++){
          let temp = freqDetailDtos[i];
          freqDetailDtosArr.push({
              freq1: temp.freq1,
              freq2:temp.freq2
          })
        }
    
      }
      this.setState({
        btnType:'add',
        name:"",
        imageList:[],
        freqDetailDtos:freqDetailDtosArr
      })
    }
    handleMachine = (e)=>{
      const {name,managementType,groupId,speedList,startFrequency,endFrequency,frequencyCount,imageList,freqDetailDtos,dbP,btnType,machineId,
        listenTime,pollingIntervalTime,startTime,endTime,freqeditVisible,machineCode,extractDurationMs,delayMs,headThreshold, } = this.state;
      let fileId = '';
      let fileName = '';
      let filePath = '';
      let fileUrl = '';
      if (imageList.length) {
          fileId = imageList[0].fileId;
          fileName = imageList[0].fileName;
          filePath = imageList[0].filePath;
          fileUrl = imageList[0].fileUrl;
      }
      if (name == '') {
        message.error('名称不能为空');
        return false;
      }
      if(Number(startFrequency) == 0 || Number(startFrequency) > Number(endFrequency)){
          message.error('开始频率不能为0，开始频率不能大于结束频率！');
          return false;
      }
      let speedArr = [];
      for (let i = 0; i < speedList.length; i++) {
          if (speedList[i].speed) {
              speedArr.push(speedList[i].speed)
          }
      }
      if (btnType == 'edit') {
        if(freqeditVisible){
          if(!startTime && !endTime){
            message.error('请选择要修改检测数据的时间范围')
            return false
          }
        }
          let params = {
            id: machineId,
            name,
            groupId,
            managementType,
            tenantId,
            speedList: speedArr,
            startFrequency, 
            endFrequency, 
            frequencyCount, 
            fileId, 
            fileName, 
            filePath, 
            fileUrl,
            freqDetailDtos,
            dbP,
            listenTime,pollingIntervalTime,machineCode,
            startTime,
            endTime,extractDurationMs,delayMs,headThreshold
        }
        service.updateMachine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.clear()
            } else {
                message.error(res.err);
            }
        })
      }else{
        let params = {
            name,
            groupId,
            managementType,
            tenantId,
            speedList: speedArr,
            startFrequency, 
            endFrequency, 
            frequencyCount, 
            fileId, 
            fileName, 
            filePath, 
            fileUrl,
            freqDetailDtos,
            dbP,machineCode,pollingIntervalTime,extractDurationMs,delayMs,headThreshold
        }
         service.addMachine(VtxUtil.handleTrim(params)).then(res => {
             if (res.rc == 0) {
                this.clear();
             } else {
                 message.error(res.err);
             }
         })
      }
     
    }
      deleteMachine = () => {
        let id = this.state.machineId;
        service.deleteMachine([id]).then(res => {
            if (res.rc == 0) {
                message.success('删除成功');
                this.clear()
            } else {
                message.error(res.err);
            }
        })
    }
    // ==========================管理机型======================
    manageMachine = (e) => {
      const {managementType} = this.state;
        if (managementType == 0){
            this.setState({
              partchecked:true,
              timechecked:false,
              machineVisible:false
            })
        }else{
          this.setState({
              timechecked: true,
              partchecked:false,
              machineVisible: false
          })
        }
    }
    partchange = e =>{
      this.setState({
        timechecked: !e.target.checked,
        partchecked: e.target.checked
      })
    }
    timechange = e =>{
      this.setState({
          timechecked: e.target.checked,
          partchecked: !e.target.checked
      })
    }
    // ================================管理机型结束=============================

     // ================================机型组管理开始 ====================
     showGroupModal = (item, btnType) => {
         this.setState({
             groupId: item.id || '',
             name: item.name || '',
             btnType,
             groupVisible: true
         })
     }
     handleGroupMachine = () => {
         const {name, groupId,btnType} = this.state;
         if (name == '') {
             message.error('名称不能为空');
             return false;
         }
         if (btnType == 'edit') {
             let params = {
                 id: groupId,
                 name,
                 tenantId
             }
             service.updateGroup(VtxUtil.handleTrim(params)).then(res => {
                 if (res.rc == 0) {
                     this.clear()
                 } else {
                     message.error(res.err);
                 }
             })
         } else {
             let params = {
                 name,
                 tenantId
             }
             service.addGroup(VtxUtil.handleTrim(params)).then(res => {
                 if (res.rc == 0) {
                     this.clear()
                 } else {
                     message.error(res.err);
                 }
             })
         }
     }

     deleteGroupMachine = () => {
         let id = this.state.groupId;
         service.deleteGroup([id]).then(res => {
             if (res.rc == 0) {
                 message.success('删除成功');
                 this.clear()
             } else {
                 message.error(res.err);
             }
         })
     }


     timeEditChange=(value, dateString)=> {
        this.setState({
              startTime: moment(dateString[0]).valueOf(),
              endTime: moment(dateString[1]).valueOf()
          })
    }

    timeOk=(value)=> {
    }
    freqEdit = ()=>{
      const {freqeditVisible} = this.state;
      this.setState({
        freqeditVisible:!freqeditVisible
      })
    }

     // =============================机型组管理结束================================
    render(){
      const {
          freqDetailDtos,imageList,
          name,startFrequency,endFrequency,
          frequencyCount, fileListVersion, dbP, speedList, btnType, listenTime,pollingIntervalTime,freqeditVisible,machineCode,
          headThreshold,delayMs,extractDurationMs
      } = this.state;
      return (
          < Page title = "机型管理" className="pageLayoutRoot" style={{width:'100%'}}>
            <SideBar parent={this}></SideBar>
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
            <div>
                <div className={styles.headerStyles}>
                    <div className={styles.tabletitle}>
                      <div className={styles.bd}></div>
                      <p>机型管理：</p>
                    </div>
                      < Button type = "primary" onClick={()=>this.showGroupModal('','add')} style={{marginTop:10,marginLeft:10}}> 新增组 </Button>
                      {/* 添加机组 */}
                    <div>
                      <div className={styles.ml10} style={{marginBottom:10}}>
                        {
                          (this.state.machineList || []).map((item, index) => {
                            return (
                            <div  key={index}>
                              <Button  type = "primary" ghost  onClick={()=>this.showGroupModal(item,'edit')} className={styles.headTitle}>{item.name}：</Button>
                              <div className={styles.typeStyle}>
                                {
                                  (item.machineList || []).map((itemp,indexp)=>{
                                    return <div onClick={()=>this.showMachineModal(itemp,'edit')} key={indexp}  className={styles.typeTitle}> {itemp.name} </div>
                                  })
                                }
                                <img src={require('@src/assets/voice/addicon.png')} onClick={()=>this.showMachineModal(item.id,'add')}  className={styles.ml10}/>
                              </div>
                          </div>
                            )
                          })
                        }
                      </div>

                    </div>
                </div>
            </div>
                <div >
                    {this.state.partchecked ?   <div>
                      <TreeList machineTypeId = {this.state.machineId}/>
                    </div> : '' }
                    {this.state.timechecked ?  <div>
                      < CycleList  machineTypeId = {this.state.machineId}/>
                  </div> :''}
                </div>
              
                {/* 新增机型 */}
                <Modal
                title="机型管理"
                visible={this.state.machineVisible}
                onOk={this.handleMachine}
                onCancel={this.handleCancle}
                >
                  {
                    btnType == 'edit' && <BtnWrap>
                      <Button onClick={() => this.manageMachine()}> 管理该机型</Button>
                      <Popconfirm placement="topLeft" title='确认删除该机型吗？' onConfirm={this.deleteMachine.bind(this)} okText="确定" cancelText="取消">
                        <Button type='danger'>删除该机型</Button>
                      </Popconfirm>
                      <Button onClick={() => this.fastAddMachine()}> 新增同类机型</Button>
                    </BtnWrap>
                  }
                    <Input addonBefore="名称：" placeholder="请输入机型名称" value={name}
                     onChange={this.inputChange.bind(this)} name='name'/>
                    {
                      speedList.map((item,index)=>{
                        return (
                              <Input key={index} addonBefore="转速(转/分钟)："  placeholder="选填" value={item.speed}
                            onChange={this.inputChangeIndex.bind(this,index)} name='speed' style={{marginTop:10}}/>
                        )
                      })
                    }
                      <Input addonBefore="头部阈值：" placeholder="请输入" value={headThreshold} style={{marginTop:10,width:200}}
                     onChange={this.inputChange.bind(this)} name='headThreshold'/>
                          <Input addonBefore="提前：" placeholder="请输入" value={delayMs} addonAfter='ms截取' style={{marginTop:10,width:200,marginLeft:10}}
                     onChange={this.inputChange.bind(this)} name='delayMs'/>
                          <Input addonBefore="截取：" placeholder="请输入" value={extractDurationMs} addonAfter='ms数据' style={{marginTop:10,width:200}}
                     onChange={this.inputChange.bind(this)} name='extractDurationMs'/>
                    {
                      btnType == 'edit' ? 
                      <BtnWrap>
                        <Button type='primary' onClick={()=>this.freqEdit()}>修改频率相关信息</Button>
                      </BtnWrap> : ''
                    }
                    {
                      freqeditVisible && <div style={{margin:"10px 0"}}>
                            修改时间范围：
                            <RangePicker
                              showTime={{ format: 'HH:mm' }}
                              format="YYYY-MM-DD HH:mm"
                              placeholder={['开始时间', '结束时间']}
                              onChange={this.timeEditChange}
                              onOk={this.timeOk}
                            />
                        </div>
                    }
           
                    <div style={{margin:"10px 0"}}>
                        <Input addonBefore="开始频率(Hz)：" disabled={ btnType == 'edit' && !freqeditVisible ? true : false} style={{width:200}} placeholder="选填" value={startFrequency}
                          onChange={this.inputChange.bind(this)} name='startFrequency'/>
                        <Input addonBefore="结束频率(Hz)：" disabled={ btnType == 'edit' && !freqeditVisible ? true : false}  style={{marginLeft:10,width:200}} placeholder="选填" value={endFrequency}
                          onChange={this.inputChange.bind(this)} name='endFrequency'/>
                    </div>
                    <div style={{margin:"10px 0"}}>
                      <Input addonBefore="分段数量：" disabled={ btnType == 'edit' && !freqeditVisible ? true : false} style={{width:200}} placeholder="选填" value={frequencyCount}
                        onChange={this.inputChange.bind(this)} name='frequencyCount'/>
                    </div>
                    <div style={{margin:"10px 0"}}>
                        <Input addonBefore="机型采音时间(s)：" placeholder="请输入" style={{width:200}} value={listenTime}
                            onChange={this.inputChange.bind(this)} name='listenTime'/> 
                        <Input addonBefore="能量指数："  style={{width:200,marginLeft:10}} placeholder="" value={dbP}
                        onChange={this.inputChange.bind(this)} name='dbP'/>
                    </div>
                    <div  style={{margin:"10px 0"}}>
                        <Input addonBefore="多路轮询间隔时间(s)：" placeholder="请输入" style={{width:200}} value={pollingIntervalTime}
                            onChange={this.inputChange.bind(this)} name='pollingIntervalTime'/> 
                             <Input addonBefore="机型代号："  style={{width:200,marginLeft:10}} placeholder="" value={machineCode}
                        onChange={this.inputChange.bind(this)} name='machineCode'/>
                    </div>

                    < CycleSet parent={this} freqDetailDtos={freqDetailDtos || []}/>

                    <div style={{margin:'10px 0'}}>上传机型图片(选填):</div>
                     <VtxUpload2
                        fileList={imageList}
                        fileListVersion={fileListVersion}
                        mode="multiple"
                        listType="picture-card"
                        action="/cloudFile/common/uploadFile"
                        downLoadURL="/cloudFile/common/downloadFile?id="
                        disabled={imageList.length >= 1 ? true : false}
                        multiple={true}
                         showUploadList={imageList.length == 0 ? false :true}
                        onSuccess={file => {
                            message.info(`${file.name} 上传成功.`);
                            let response = file.response.data[0]
                            this.setState({
                                imageList: [
                                    ...imageList,
                                    {
                                      id: file.id,
                                      name:file.name,
                                      fileId: response.id,
                                      fileName: response.fileName,
                                      fileUrl: response.fileUrl,
                                      filePath: response.downloadPath,
                                    },
                                ],
                            });
                        }}
                         onError={file => {
                                message.info(`${file.name} 上传失败.`);
                            }}
                            onRemove={file => {
                                let files = imageList.filter(item => item.id != file.id);
                                this.setState({ imageList: files });
                            }}
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                name: '图片',
                                width: 100,
                                key: 'imageList',
                            },
                            regexp: {
                                value: imageList.length > 0 ? '1' : '',
                            },
                        }}
                    />
                </Modal>
              <Modal
                  title="机型组管理"
                  visible={this.state.groupVisible}
                  onOk={this.handleGroupMachine}
                  onCancel={this.handleCancle}
                >
                  {
                    btnType == 'edit' && <BtnWrap>
                      <Popconfirm placement="topLeft" title='确认删除该机型组吗？' onConfirm={this.deleteGroupMachine.bind(this)} okText="确定" cancelText="取消">
                        <Button>删除组</Button>
                      </Popconfirm>
                    </BtnWrap>
                  }
                  <Input addonBefore="名称：" placeholder="请输入名称" style={{marginTop:10}} value={name}
                          onChange={this.inputChange.bind(this)} name='name'/> 
                </Modal>
                </div>
            </div>
           </Page>
        );
    }

}

export default voiceMachineModel;

