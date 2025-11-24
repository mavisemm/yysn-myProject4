import React,{ Component } from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';
// 子部件
import { Tree,Icon,Modal,Input,Badge,message,Select,Form ,Checkbox,Tabs } from 'antd';
import  './App.less';
import AddLable from './trees/AddLable';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import { vtxInfo } from '@src/utils/config';
import Mulitipe from './mulitipe';
const { tenantId, userId, token } = vtxInfo;
import styles from '../voiceMachine.less';
const { confirm } = Modal;
const { TreeNode } = Tree;
const { Option } = Select;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
@Form.create()
class TreeList extends Component {
  expandedKeys = [];
  state = {
    expandedKeys: [],
    data: [],
    editItem: {
      name: '',
      parentTeeth: '',
      key: '',
      parentKey: '',
      isAddVisible: false, //新增modla
      isEditable: false, //编辑mdoal
      isDelete: false, //删除modal
      isDetailVisible: false, //详情modal
      isOver: false,
      generateType: "",
      name: "",
      parentTeeth: "",
      childTeeth: "",
      turns: "",
      cycle: "",
    },
    generateType: "",
    name: "",
    parentTeeth: "",
    childTeeth: "",
    turns: "",
    cycle: "",
    checked: false,
    checked1: false,
    gearvisible:false,
    groupname:"",
    gearspeed: "",
    editType:"",
    rootid:"",
    activekey:2
  };

  getList(id){
    let params = {
        tenantId,
        machineTypeId:id || this.props.machineTypeId
    }
    service.nextgear(VtxUtil.handleTrim(params)).then(res => {
        if (res.rc == 0) {
            if (res.ret) {
                this.setState({
                    data: res.ret
                })
            }else{
                 this.setState({
                     data: []
                 })
            }
        }else{
          message.error(res.err)
        }
    })
  }
  componentWillMount() {
    
  }
  componentWillReceiveProps(props) {
    if (props.machineTypeId != this.props.machineTypeId){
      this.getList(props.machineTypeId);
    }
  }
  componentDidMount() {
    
    // Tip: Must have, or the parent node will not expand automatically when you first add a child node
    // this.onExpand([]); // 手动触发，否则会遇到第一次添加子节点不展开的Bug
  }
  onExpand = expandedKeys => {
    // console.log('onExpand', expandedKeys, this.data);
    this.expandedKeys = expandedKeys;
    this.setState({ expandedKeys: expandedKeys });
  };

  renderTreeNodes = data =>
    (data || []).map(item => {
      if (!item.isOpera) {
        item.title = (
          <div className="isOpera" key={item.id}>
            <span className='item-label  item-deep'>
              {' '}
              {item.name}
            </span>
          </div>
        );
      } else {
        item.title = (
          <div className='titleContainer' key={item.id}>
            <span className='item-label'>
              {' '}
              <Badge color={item.status ? '#87d068' : '#aaa'} />
              {item.name}
            </span>
            <span className='operationField'>
              {item.status && (
                <Icon className='icon' type="read" />
              )}
              <Icon className='icon' type="plus" onClick={() => this.onAdd(item)} />
              <Icon
                className='icon'
                type="edit"
                onClick={() => this.onEdit(item.key, item)}
              />

              {item.parentKey === '0' ? null : (
                <Icon
                  className='icon'
                  type="minus"
                  onClick={() => this.onDelete(item.id)}
                />
              )}
            </span>
          </div>
        );
      }

      if (item.childList) {
        return (
          <TreeNode title={item.title} key={item.id} dataRef={item}>
            {this.renderTreeNodes(item.childList)}
          </TreeNode>
        );
      }

      return <TreeNode {...item} />;
    });
// 新增
  addCancel = () => {
    this.setState({
      isAddVisible: false,
      
    });
  };
  addOk = e => {
    let { node, addValue } = this.state;
    let params = {}
    // console.log(node, 'nodenodenode')
    params = {
      ...e,
      machineTypeId: this.props.machineTypeId,
      tenantId,
      // managementType:0
    }
    if (e.generateType == 1) {
      // 同级标签
      params.parentId = node.parentId;
      if (node.parentId == 0) {
         message.error('根子部件不可添加同级部件');
         return false;
      }
    }else{
      params.parentId = node.id;
    }
    delete params.generateType;
    service.addgear(VtxUtil.handleTrim(params)).then(res=>{
      if(res.rc == 0){
          this.setState({
              isAddVisible: false,
          });
          this.getList();
      }else{
        message.error(res.err)
      }
       
    })
  };
  onAdd = e => {
    // 防止expandedKeys重复
    // Tip: Must have, expandedKeys should not be reduplicative
    if (this.state.expandedKeys.indexOf(e.key) === -1) {
      this.expandedKeys.push(e.key);
    }
    this.setState({
      isAddVisible: true,
      node: e,
      expandedKeys: this.expandedKeys,
    });
  };
  /**
   * 删除
   */
  onDelete = key => {
    const { dispatch } = this.props;
    confirm({
      title: '确认删除此节点吗?',
      icon: <Icon type="exclamation-circle" />,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        this.deleteNode(key);
      },
    });
  };
  deleteNode = (id) =>{
    let params = [id];
    service.deleteparts(params).then(res => {
        if (res.rc == 0) {
          message.success('删除成功');
          this.getList();
        }else{
          message.error(res.err)
        }
    })
  }
  // 编辑子部件
  onEdit = (key, item) => {
    this.setState({
      editVisiable: true,
      key,
      editItem: item,
      name: item.name,
      parentTeeth: item.parentTeeth,
      childTeeth: item.childTeeth,
      turns: item.turns,
      cycle:item.cycle
    });
    if (item.isGear){
      // 齿轮
      this.setState({
        checked:true
      })
    }else{
      this.setState({
          checked1: true
      })
    }
  };
  onSave = item => {
    // console.log(item, 'itemitem')
    let params = {};
     if (this.state.checked == true) {
         params = {
             name: this.state.name,
             tenantId,
             machineTypeId: this.props.machineTypeId,
             isGear: 1,
             parentTeeth: this.state.parentTeeth,
             childTeeth: this.state.childTeeth,
             id:item.id
            
         }
     } else {
         params = {
             machineTypeId: this.props.machineTypeId,
             tenantId,
             isGear: 0,
             name: this.state.name,
             turns: this.state.turns,
             cycle: this.state.cycle,
            id: item.id
         }
     }
  
    service.updategear(VtxUtil.handleTrim(params)).then(res => {
        if (res.rc == 0) {
            this.getList()
        }else{
          message.error(res.err)
        }
    })
    this.setState({
      editVisiable: false,
    });
  };;
  /**
   * 取消编辑
   */
  onClose = (key, value) => {
    this.setState({
      editVisiable: false,
    });
  };
// 编辑标签
   inputChange = e => {
       this.setState({
           name: e.target.value
       })
   }
   inputChange1 = e => {
       this.setState({
           parentTeeth: e.target.value
       })
   }
   inputChange2 = e => {
       this.setState({
           childTeeth: e.target.value
       })
   }
   inputChange3 = e => {
       this.setState({
           turns: e.target.value
       })
   }
   inputChange4 = e => {
       this.setState({
           cycle: e.target.value
       })
   }
  inputChange5 = e => {
      this.setState({
          groupname: e.target.value
      })
  }
    inputSpeed = e => {
        this.setState({
            gearspeed: e.target.value
        })
    }
   handleSearch = e => {
       e.preventDefault();
       const {
           dispatch,
           form
       } = this.props;
       const {
           page,
           limit
       } = this.state;
       let formValue = {
           generateType: this.state.generateType,
           parentTeeth: this.state.parentTeeth,
           childTeeth: this.state.childTeeth,
           name: this.state.name,
           checked: this.state.checked,
           checked1: this.state.checked1,
       };
       this.props.addOk(formValue);
   };
   handleChange = value => {
       this.setState({
           generateType: value,
       })
   }
   boxchange = e => {
       this.setState({
           checked: e.target.checked
       })
   }
   boxchange1 = e => {
       this.setState({
           checked1: e.target.checked
       })
   }
 showModal = (type) => {
    // 编辑根子部件
    this.setState({
        gearvisible: true
    });
    this.setState({
      editType:type
    })
    if(type == 2){
      this.setState({
        groupname:this.state.data[0].name,
        gearspeed:parseInt(Number(this.state.data[0].speed)*60) ,
        rootid: this.state.data[0].id,
      })
    }
 }
  handleOk = (e) => {
      this.setState({
        gearvisible: false,
      });
      if (this.state.editType == 1){
        // 新增根子组件
        let params = {
            name: this.state.groupname,
            speed:(Number(this.state.gearspeed)/60).toFixed(2),
            tenantId,
            machineTypeId: this.props.machineTypeId
        }
        service.addRoot(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
              this.getList();
              this.setState({
                  groupname: "",
                  gearspeed: "",

              })
            }else{
              message.error(res.err)
            }
        })
      }else{
        // 编辑根子组件
        let params = {
            name: this.state.groupname,
            speed: (Number(this.state.gearspeed)/60).toFixed(2),
            tenantId,
            id: this.state.rootid,
            machineTypeId: this.props.machineTypeId
        }
        service.updateRoot(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.getList();
                this.setState({
                    groupname: "",
                    gearspeed: ""
                })
            }else{
                message.error(res.err)
            }
        })
    }

  }
  handleCancel = (e) => {
      this.setState({
          gearvisible: false,
          groupname:"",
          gearspeed:"",

      });
  }
   callback = (key) => {
     if(key == 2){
         this.getList();
     }
     this.setState({
       activekey:key
     })
  }
  render() {
    const {
      isAddVisible,
      editVisiable,
      editItem,
      isDetailVisible,
      id,
    } = this.state;
    return (
        <div className='treeList' style={{marginTop:10}}>
          {/*  */}
           <Tabs defaultActiveKey="1" onChange={this.callback}>
            <TabPane tab="多级齿轮传动" key="1">
                <Mulitipe machineTypeId={this.props.machineTypeId} activekey={this.state.activekey}></Mulitipe>
            </TabPane>
            <TabPane tab="综合性齿轮传动" key="2">
               < Button type = "primary"  onClick={()=>this.showModal(1)}>  新增根子部件 </Button>
              < Button type = "primary"  onClick={()=>this.showModal(2)} style={{marginLeft:10}}>  编辑根子部件 </Button>
              <Tree
                className='draggable-tree'
                defaultExpandAll={true}
                showLine
                // expandedKeys={this.state.expandedKeys}
                selectedKeys={[]}
                onExpand={this.onExpand}
                draggable
                blockNode
              >
                {this.renderTreeNodes(this.state.data)}
              </Tree>
            </TabPane>
          </Tabs>
         
          {/* 新增 */}
          <Modal
            title="新增"
            visible={isAddVisible}
            destroyOnClose={true}
            onCancel={this.addCancel}
            onOk={this.addOk}
            footer={null}
            centered
            width="500px"
          >
            <AddLable Cancel={this.addCancel} addOk={this.addOk}  />
          </Modal>
          {/* 编辑 */}
          <Modal
            title="编辑"
            visible={editVisiable}
            destroyOnClose={true}
            onCancel={() => this.onClose()}
            onOk={() => this.onSave(editItem)}
            centered
            // width="800px"
          >
            <div className='modifyModal'>
              <div className='modifyform'>
                <Form onSubmit={this.handleSearch} className='search-form-con'>
                  <FormItem label="部件名称">
                    < Input placeholder = "请输入部件名称"  value={this.state.name}  onChange={this.inputChange.bind(this)}/>
                  </FormItem>
                  <FormItem label="">
                    <Checkbox onChange={this.boxchange.bind(this)} defaultChecked={this.state.checked}>齿轮</Checkbox>
                    <br/>
                    上级齿数与下级齿数转速比为：
                    <Input style={{width:100}} placeholder="请输入" value={this.state.parentTeeth}
                        onChange={this.inputChange1.bind(this)}/>
                        ~
                      <Input style={{width:100}}  placeholder="请输入" value={this.state.childTeeth}
                        onChange={this.inputChange2.bind(this)}/>
                  </FormItem>
                  <FormItem label="">
                      <Checkbox onChange={this.boxchange1.bind(this)} defaultChecked={this.state.checked1}>非齿轮</Checkbox>
                      <br/>
                      上级轴承转动一转对应下级部件
                      <Input style={{width:100}} placeholder="请输入" value={this.state.turns}
                          onChange={this.inputChange3.bind(this)}/>转
                          <br/>
                      上级轴承转动一转对应传动部件
                      <Input style={{width:100,marginTop:10}}  placeholder="请输入" value={this.state.cycle}
                        onChange={this.inputChange4.bind(this)}/>周期
                  </FormItem>
              </Form>
            </div>
            </div>
          </Modal>
          {/* 新增子根部件 */}
            <Modal
              title="根子部件"
              visible={this.state.gearvisible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              >
                <Input addonBefore="部件名称：" placeholder="请输入部件名称" value={this.state.groupname}
                  onChange={this.inputChange5.bind(this)}/>
                <Input addonBefore="默认转速：" style={{marginTop:10}} placeholder="请输入默认转速" value={this.state.gearspeed}
                  onChange={this.inputSpeed.bind(this)}/>
            </Modal>
        </div>
    );
  }
}



export default TreeList;
