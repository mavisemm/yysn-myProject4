
import React from 'react';
import { connect } from 'dva';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate,VtxUpload } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
const { VtxUpload2 } = VtxUpload;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Tabs,Checkbox,Radio,Popconfirm} from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import styles from './machineManage.less';
import CycleSet from '@src/pages/acomponents/cycleSet';
import Point from '@src/pages/acomponents/point';
import PointGroup from '@src/pages/acomponents/pointGroup';
import CycleRange from '@src/pages/acomponents/cycleRange';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { service } from './service';
const RadioGroup = Radio.Group;
class machineManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name:"",
            btnType:'',
            groupId:'',
            machineVisible:false,
            groupVisible:false,
            machineId:"",
            machineList:[],
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
            photoDtoList:[],
            freqDetailDtos:[],
            cycleType:0,
            speedType:0,
            checkPointDtoList:[],
            checkPointGroupDtoList:[],
            imageList:[],
            listenTime:"5",
            fileListVersion:1,
            templateNameVisible:false,
            templateName:"",
            templateVisible:false,
            templateBtnType:'',
            title:'机型管理'
        };

    }
    componentDidMount() {
        this.getList();
        this.openTemplate();
    }
    getList() {
        let params = {
            tenantId
        }
        service.getList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    this.setState({
                        machineList: res.ret || []
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    handleCancle = ()=>{
       this.clear();
        this.setState({
          machineVisible:false,
          groupVisible:false,
          templateNameVisible:false,
        })
    }
    clear = ()=>{
      this.openTemplate();
      this.setState({
        name: "",
        imageList:[],
        photoDtoList:[],
        checkPointDtoList:[],
        checkPointGroupDtoList:[],
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
        speedType:0,
        cycleType:0,
        machineVisible: false,
        groupVisible: false,
        templateNameVisible:false,
      })
      this.getList()
    }
    // ================================机型组管理开始 ====================
    showGroupModal = (item,btnType) =>{
      this.setState({
        groupId: item.id || '',
        name:item.name || '',
        btnType,
        groupVisible:true
      })
    }
    handleGroupMachine  = ()=>{
      const {name,groupId,btnType } = this.state;
      if(name == ''){
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
      }else{
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

    deleteGroupMachine = ()=>{
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
    // =============================机型组管理结束================================
    // ===============================机型开始================================
    showMachineModal=(item,btnType)=>{
      if(btnType == 'edit'){
        const {groupId,id,name,cycleType,speedType,checkPointDtoList,checkPointGroupDtoList,freqDetailDtos,speedList,photoDtoList,listenTime} = item;
        const {fileListVersion} = this.state;
        let imageList = [];
        if(photoDtoList && photoDtoList.length){
          for(let i = 0;i<photoDtoList.length;i++){
            let temp = photoDtoList[i];
            imageList.push({
              id:temp.photoId,
              name:temp.photoName,
              photoId: temp.photoId,
              photoName: temp.photoName,
              photoPath: temp.photoPath,
              photoUrl: temp.photoUrl,

            })
          }
        }
        let speedArr = [];
          speedArr = [...speedList];
          let arr = [{speed:''},{speed:""},{speed:''}];
          speedArr = speedArr.concat(arr);
        this.setState({
          groupId,
          machineId:id,
          name,
          freqDetailDtos,
          speedType,
          cycleType,
          speedList: speedArr,
          photoDtoList,
          imageList,
          btnType,
          checkPointGroupDtoList,
          checkPointDtoList,
          listenTime,
          fileListVersion: Number(fileListVersion) + 1,
          templateBtnType: "",
          title:"机型管理",
          machineVisible: true,
        })
      }else{
        this.setState({
          groupId:item,
          btnType,
          templateBtnType: "",
          title: "机型管理",
          machineVisible: true,
        })
      }
    }

    handleMachine = ()=>{
      const {name,groupId,imageList,machineId,freqDetailDtos,speedType,cycleType,checkPointDtoList,btnType,
        speedList,checkPointGroupDtoList,photoDtoList,listenTime} = this.state;
      if (name == '' || checkPointDtoList.length == 0 || listenTime == '') {
          message.error('机型名称、点位、听音时间不能为空！');
          return false;
      }
      let speedListArr = [...speedList];
      let speedArr = [];
      if (speedType == 1) {
          for (let i = 0; i < speedListArr.length; i++) {
              if (speedListArr[i].speed != '') {
                  speedArr.push({
                      ...speedListArr[i]
                  })
              }
          }
          if(speedArr.length == 0){
             message.error('转速不能为空！');
             return false;
          }
      }
      let params = {
          name,
          cycleType,
          speedType,
          listenTime,
          groupId,
          tenantId,
          freqDetailDtos,
          speedList: speedArr,
          checkPointGroupDtoList,
      }
      let checkPointDtoListArr = [...checkPointDtoList];
      for (let i = 0; i < checkPointDtoListArr.length; i++) {
          checkPointDtoListArr[i] = {
              ...checkPointDtoListArr[i],
              sort: i + 1
          }
      }
    if(btnType == 'add'){
      let photoArr = [];
      if (imageList.length) {
        for (let i = 0; i < imageList.length; i++) {
          let temp = imageList[i];
          photoArr.push({
            photoId: temp.photoId,
            photoName: temp.photoName,
            photoPath: temp.photoPath,
            photoUrl: temp.photoUrl,
          })
        }
      }
          let typeparams = {
              checkPointDtoList: checkPointDtoListArr,
              checkPointGroupDtoList,
              photoDtoList: photoArr,
          }
          let mergedObject = Object.assign({}, params, typeparams);
          service.addMachine(VtxUtil.handleTrim(mergedObject)).then(res => {
              if (res.rc == 0) {
                  this.clear()
              } else {
                  message.error(res.err);
              }
          })
        
  
      }else{
        let imgArr = [];
        if(imageList.length){
          for(let i = 0;i<imageList.length;i++){
             let temp = imageList[i];
             imgArr.push({
                 photoId: temp.photoId,
                 photoName: temp.photoName,
                 photoPath: temp.photoPath,
                 photoUrl: temp.photoUrl,
             })
          }
          for(let i = 0;i<photoDtoList.length;i++){
            for (let j = 0; j < imgArr.length; j++) {
              let temp = imgArr[j];
              if(temp.photoId == photoDtoList[i].photoId){
                imgArr[j] = {
                   ...photoDtoList[i]
                }
              }else{
              }
            }
          }

        }
        let typeparams = {
            id: machineId,
            checkPointDtoList: checkPointDtoListArr,
            photoDtoList: imgArr,
        }
          let mergedObject = Object.assign({}, params, typeparams);
          service.updateMachine(VtxUtil.handleTrim(mergedObject)).then(res => {
              if (res.rc == 0) {
                  this.clear();
              } else {
                  message.error(res.err);
              }
          })
        
     
      }
     
    }

    deleteMachine = ()=>{
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

  // ===============================机型结束=============================
    inputChangeIndex = (index,e)=>{
        this.setState({
            [e.target.name]: e.target.value
        })
        const {speedList = []} = this.state;
        let arr = [...speedList];
        arr[index]={
            ...arr[index],
            [e.target.name]: e.target.value
        }
        this.setState({
            speedList: arr
        })
    }
    inputChange = (e) =>{
      this.setState({
          [e.target.name]:e.target.value
      })
    }
    turnOnChange = (e)=>{
      this.setState({
        cycleType:e.target.value
      })
    }
    speedOnChange = (e) => {
      this.setState({
          speedType:e.target.value
      })
    }
  // =============================================开始==========================
    getCycleSet = (result, msg) => {
      this.setState({
        freqDetailDtos: msg
      })
    }
    getPointSet = (result, msg) => {
      this.setState({
        checkPointDtoList: msg
      })
    }
    getPointGroupSet = (result, msg) => {
        this.setState({
            checkPointGroupDtoList: msg
        })
    }
    // =================================结束===============================

    // =====================================机型模板相关===========================
    openTemplate =()=>{
        let params = {
            tenantId
        }
        service.indexTemplate(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    this.setState({
                      templateList: res.ret,
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
    templateChange = (e)=>{
      this.setState({
        templateId:e
      })
    }
    showTemplate = (type) => {
      if(type == 'add'){
          this.setState({
              templateBtnType: type,
              templateName: "",
              templateNameVisible: true
          })
      }else{
        this.setState({
          btnType:"",
          title:'机型模板管理',
          templateBtnType: type,
          templateVisible: true

        })
      }
    
    }
    handleTemplateCancle = () => {
        this.setState({
            templateVisible: false,
            templateNameVisible: false
        })
    }
    // 确认使用某一模板
    okTemplate = ()=>{
      const {templateList,templateId,btnType,templateBtnType} = this.state;
      for(let i = 0;i<templateList.length;i++){
        let temp = templateList[i];
        if(temp.id == templateId){
           const {groupId,id,name,cycleType,speedType,checkPointDtoList,checkPointGroupDtoList,freqDetailDtos,speedList,photoDtoList,listenTime} = temp;
            const {fileListVersion} = this.state;
            let imageList = [];
            if(photoDtoList && photoDtoList.length){
              for(let i = 0;i<photoDtoList.length;i++){
                let temp = photoDtoList[i];
                imageList.push({
                  id:temp.photoId,
                  name:temp.photoName,
                  photoId: temp.photoId,
                  photoName: temp.photoName,
                  photoPath: temp.photoPath,
                  photoUrl: temp.photoUrl,
                })
              }
            }
            let speedArr = [];
            speedArr = [...speedList];
            let arr = [{speed:''},{speed:""},{speed:''}];
            speedArr = speedArr.concat(arr);
            this.setState({
              name: templateBtnType == 'edit' ? name : '',
              freqDetailDtos,
              speedType,
              cycleType,
              speedList: speedArr,
              photoDtoList,
              imageList,
              checkPointGroupDtoList,
              checkPointDtoList,
              listenTime,
              fileListVersion: Number(fileListVersion) + 1,
              machineVisible: true,
              templateVisible: false
            })
        }
      }
    }
    // 保存机型模板
    handleTemplate = ()=>{
         const {groupId,imageList,templateId,freqDetailDtos,speedType,cycleType,checkPointDtoList,btnType,
        speedList,checkPointGroupDtoList,photoDtoList,listenTime,templateBtnType,templateName,name} = this.state;

      let speedListArr = [...speedList];
      let speedArr = [];
      if (speedType == 1) {
          for (let i = 0; i < speedListArr.length; i++) {
              if (speedListArr[i].speed != '') {
                  speedArr.push({
                      ...speedListArr[i]
                  })
              }
          }
          if(speedArr.length == 0){
             message.error('转速不能为空！');
             return false;
          }
      }
      let params = {
          name: templateName || name,
          cycleType,
          speedType,
          listenTime,
          groupId,
          tenantId,
          freqDetailDtos,
          speedList: speedArr,
          checkPointGroupDtoList,
      }
      let checkPointDtoListArr = [...checkPointDtoList];
      for (let i = 0; i < checkPointDtoListArr.length; i++) {
        checkPointDtoListArr[i] = {
          ...checkPointDtoListArr[i],
           sort: i + 1
        }
      }
    if (templateBtnType == 'add') {
      let photoArr = [];
      if (imageList.length) {
        for (let i = 0; i < imageList.length; i++) {
          let temp = imageList[i];
          photoArr.push({
            photoId: temp.photoId,
            photoName: temp.photoName,
            photoPath: temp.photoPath,
            photoUrl: temp.photoUrl,
          })
        }
      }


          let typeparams = {
              checkPointDtoList: checkPointDtoListArr,
              checkPointGroupDtoList,
              photoDtoList: photoArr,
          }
          let mergedObject = Object.assign({}, params, typeparams);
          service.addMachineTemplate(VtxUtil.handleTrim(mergedObject)).then(res => {
              if (res.rc == 0) {
                  this.clear()
              } else {
                  message.error(res.err);
              }
          })
        
  
      }else{
        let imgArr = [];
        if(imageList.length){
          for(let i = 0;i<imageList.length;i++){
             let temp = imageList[i];
             imgArr.push({
                 photoId: temp.photoId,
                 photoName: temp.photoName,
                 photoPath: temp.photoPath,
                 photoUrl: temp.photoUrl,
             })
          }
          for(let i = 0;i<photoDtoList.length;i++){
            for (let j = 0; j < imgArr.length; j++) {
              let temp = imgArr[j];
              if(temp.photoId == photoDtoList[i].photoId){
                imgArr[j] = {
                   ...photoDtoList[i]
                }
              }else{
              }
            }
          }

        }
        let typeparams = {
            id: templateId,
            checkPointDtoList: checkPointDtoListArr,
            photoDtoList: imgArr,
        }
          let mergedObject = Object.assign({}, params, typeparams);
          service.updateMachineTemplate(VtxUtil.handleTrim(mergedObject)).then(res => {
              if (res.rc == 0) {
                  this.clear();
              } else {
                  message.error(res.err);
              }
          })
        
     
      }
    }
    // 删除机型模板
    deleteTemplateMachine = () => {
        let id = this.state.templateId;
        service.deleteMachineTemplate([id]).then(res => {
            if (res.rc == 0) {
                message.success('删除成功');
                this.clear();
                this.setState({
                  templateVisible:false,
                })
            } else {
                message.error(res.err);
            }
        })
    }
    render(){
      const { freqDetailDtos, imageList, name, groupId, machineId, cycleType, checkPointDtoList, speedList,
        btnType, checkPointGroupDtoList, listenTime, fileListVersion, templateName,templateBtnType,title,templateList} = this.state;
      return (
            <div className={styles.body}>
                    <BtnWrap>
                        < Button type = "primary" onClick={()=>this.showGroupModal('','add')} > 新增组 </Button>
                        < Button onClick={()=>this.showTemplate('edit')} > 编辑机型模板 </Button>
                    </BtnWrap>
                    
                    {/* 添加机组 */}
                      {
                        (this.state.machineList || []).map((item, index) => {
                          return (
                          <div  key={index}>
                            <Button  type = "primary" ghost style={{fontWeight:600,fontSize:16}}  onClick={()=>this.showGroupModal(item,'edit')}>{item.name}：</Button>
                            <div className={styles.machineFlex}>
                              {
                                (item.machineList || []).map((itemp,indexp)=>{
                                  return <div onClick={()=>this.showMachineModal(itemp,'edit')} key={indexp}  className={styles.typeTitle}> {itemp.name} </div>
                                })
                              }
                              <img src={require('@src/assets/voice/addicon.png')} style={{marginLeft:10}} onClick={()=>this.showMachineModal(item.id,'add')}/>
                            </div>
                        </div>
                          )
                        })
                      }

                
                <Modal
                  title={title}
                  visible={this.state.machineVisible}
                  width='90%'
                  footer={null}
                  onCancel={this.handleCancle}
                  zIndex={1000}
                >
                  {/* 机型模板 */}
             
                    <BtnWrap>
                      {templateBtnType != 'edit' &&  <Button  onClick={()=>{this.setState({
                        templateVisible:true
                      })}}>使用机型模板</Button>}
                      {
                        btnType == 'edit' && 
                        <Popconfirm placement="topLeft" title='确认删除该机型吗？' onConfirm={this.deleteMachine.bind(this)} okText="确定" cancelText="取消">
                          <Button type='danger'>删除该机型</Button>
                        </Popconfirm>
                      }
                    </BtnWrap>
                  
                        <div>
                            <Input addonBefore="名称：" placeholder="请输入名称" style={{margin:'10px 0'}} value={name}
                            onChange={this.inputChange.bind(this)} name='name'/> 
                            <div>
                              转向：
                              <RadioGroup defaultValue={0} onChange={this.turnOnChange} value={this.state.cycleType}>
                                <Radio value={0}>单转向</Radio>
                                <Radio value={1}>正反转</Radio>
                              </RadioGroup>
                            </div>
                            <div style={{margin:'10px 0'}}>
                              转速：
                              <RadioGroup defaultValue={0} onChange={this.speedOnChange} value={this.state.speedType}>
                                <Radio value={0}>单转速</Radio>
                                <Radio value={1}>多转速</Radio>
                              </RadioGroup>
                            </div>
                            {
                              this.state.speedType == 1 &&  <div>
                                {
                                  speedList.map((item,index)=>{
                                    return (
                                         <Input key={index} addonBefore="转速(转/分钟)："  placeholder="输入" value={item.speed}
                                        onChange={this.inputChangeIndex.bind(this,index)} name='speed' style={{marginLeft:10,marginTop:10,width:160}}/>
                                    )
                                  })
                                }
                             
                            </div>
                            }
          
                          <div style={{margin:'10px 0'}}>上传机型图片:</div>
                           < VtxUpload2
                            fileList={imageList}
                            fileListVersion={fileListVersion}
                            mode="multiple"
                            listType="picture-card"
                            action="/cloudFile/common/uploadFile"
                            downLoadURL="/cloudFile/common/downloadFile?id="
                            disabled={imageList.length >= 10 ? true : false}
                            multiple={true}
                            showUploadList={imageList.length == 0 ? false :true}
                            onSuccess={file => {
                              let response = file.response.data[0];
                                message.info(`${file.name} 上传成功.`);
                                this.setState({
                                    imageList: [
                                        ...imageList,
                                        {
                                            id: file.id,
                                            name: file.name,
                                            photoId:file.id,
                                            photoName: file.name,
                                            photoPath: response.downloadPath,
                                            photoUrl: response.fileUrl
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
                   
                         <Input addonBefore="机型采音时间(s)：" placeholder="请输入" style={{margin:'10px 0',width:200}} value={listenTime}
                            onChange={this.inputChange.bind(this)} name='listenTime'/> 
                          < Point parent={this} checkPointDtoList={checkPointDtoList}></Point>

                          <div className={styles.cycleFlex}>
                            <div  style={{width:'45%'}}>
                                 < CycleSet parent={this} freqDetailDtos={freqDetailDtos || []}/>
                            </div>
                            <div style={{width:'45%',marginLeft:20}}>
                              {
                                btnType == 'edit' && < CycleRange parent={this} machineTypeId={this.state.machineId}></CycleRange>
                              }
                            </div>
                          </div>
                        </div>
                        <div className={styles.modeFlex}>
                          <BtnWrap>
                            <Button onClick={()=>{this.handleCancle()}}>取消</Button>
                            {
                              (templateBtnType == 'edit')  ? <Button onClick={()=>{this.handleTemplate()}} type='primary'>保存</Button> :
                              <Button onClick={()=>{this.showTemplate('add')}} >保存机型模板</Button>
                            }
                            {
                              templateBtnType != 'edit' && <Button onClick={()=>{this.handleMachine()}} type='primary'>保存机型</Button>
                            }
                          </BtnWrap>
                        </div>
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
                        <Button type='danger'>删除组</Button>
                      </Popconfirm>
                    </BtnWrap>
                  }
                  <Input addonBefore="名称：" placeholder="请输入名称" style={{marginTop:10}} value={name}
                          onChange={this.inputChange.bind(this)} name='name'/> 
                </Modal>
              
              {/* 机型模板名称 */}
              <Modal
                  title="机型模板名称"
                  visible={this.state.templateNameVisible}
                  onOk={this.handleTemplate}
                  onCancel={this.handleTemplateCancle}
                >
                  <Input addonBefore="机型模板名称：" placeholder="请输入" style={{marginTop:10}} value={templateName}
                    onChange={this.inputChange.bind(this)} name='templateName'/> 
            
                </Modal>

                <Modal
                  title="机型模板列表"
                  visible={this.state.templateVisible}
                  zIndex={1001}
                  footer={null}
                   onCancel={this.handleTemplateCancle}
                >
                  <Select value={this.state.templateId} style={{ width: 300 }} placeholder='请先选择机型模板'  onChange={this.templateChange.bind(this)}>
                      {
                          (templateList || []).map((item, index) => {
                              return (
                                  <Option value={item.id} key={index}> {item.name} </Option>
                              )
                          })
                      }
                  </Select>
                  <BtnWrap  className={styles.modeFlex}>
                      <Popconfirm placement="topLeft" title='确认删除该机型模板吗？' onConfirm={this.deleteTemplateMachine.bind(this)} okText="确定" cancelText="取消">
                        <Button type='danger'>删除此机型模板</Button>
                      </Popconfirm>
                      <Button  onClick={()=>{this.handleTemplateCancle()}}>取消</Button>
                      <Button onClick={()=>{this.okTemplate()}} type='primary'>确认</Button>
                  </BtnWrap>
             
               
                </Modal>

                {
                    /* {
                          btnType == 'edit' && < PointGroup parent={this} checkPointDtoList={checkPointDtoList} checkPointGroupDtoList={checkPointGroupDtoList}></PointGroup>
                        } */
                }
            </div>
        );
    }

}

export default machineManage;

