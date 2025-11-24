import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Modal,Table,Popconfirm  } from 'antd';
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { service } from './service';
import styles from './vQuality.less';
class CommonCycle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkPointGroupDtoList:[],
            visible:false,
            currentIndex:"",
            btnType: 'edit',
            groupName: '',
            detailDtoList:[],
            viewInfo:{},
            viewVisible:false,
            deleteIndex:''
        };
    }
    componentDidMount() {
        const {checkPointGroupDtoList = []} = this.props;
        this.setState({
            checkPointGroupDtoList
        })
    }
    componentWillReceiveProps(newProps) {
        const {checkPointGroupDtoList = [] } = {...newProps};
        this.setState({
            checkPointGroupDtoList
        })
    }
    
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    //=================================操作==================
    editMode = (row, index) => {
        const {groupName,detailDtoList} = {...row};
        let arr = [...detailDtoList];
        for (let i = 0; i < detailDtoList.length; i++) {
            // console.log(detailDtoList[i],'00-==')
            arr[i] = {
                ...detailDtoList[i],
                pointName: detailDtoList[i].pointDto?.pointName || detailDtoList[i]?.pointName
            }
        }
        this.setState({
            groupName,
            detailDtoList:arr,
            visible: true,
            currentIndex: index,
            btnType: 'edit'
        })
     }
     deleteMode = (index) => {
        this.setState({
            deleteIndex: index,
        })
    }
    delete = (record) => {
        const {checkPointGroupDtoList,deleteIndex} = this.state;
        let arr = [...checkPointGroupDtoList];
        arr.splice(deleteIndex, 1);
        this.setState({
            checkPointGroupDtoList: arr,
        })
        this.props.parent.getPointGroupSet(this, arr);
    }

    viewMode = (record) => {
        const {groupName,detailDtoList} = {...record};
        let arr = [...detailDtoList];
        for (let i = 0; i < detailDtoList.length; i++) {
            arr[i] = {
                ...detailDtoList[i],
                pointName: detailDtoList[i].pointDto?.pointName  || detailDtoList[i]?.pointName
            }
        }
        this.setState({
            groupName,
            detailDtoList:arr,
            viewVisible: true,
      
        })
    }
// =======================================================

     handleOk = (e) => {
         const {
             currentIndex,
             checkPointGroupDtoList,
             detailDtoList,
             groupName, btnType
         } = this.state;
         if (groupName == '' || detailDtoList.length == 0){
            message.error('名称不能为空，绑定点位不能为空！')
            return false;
         }
        let pointIdSet = new Set();
        for (let i = 0; i < detailDtoList.length; i++) {
            const pointId = detailDtoList[i].pointId;
            if (pointId === '') {
                message.error('绑定点位不能为空');
                return false;
            }
            if (pointIdSet.has(pointId)) {
                message.error('一个点位组中，同一个点位最多绑定一次！');
                return false;
            }
            pointIdSet.add(pointId);
        }
        let arr = [...checkPointGroupDtoList];
         if (btnType == 'edit') {
            arr[currentIndex] = {
                ...arr[currentIndex],
                groupName,
               detailDtoList
            };
         }else{
            arr.push({
                groupName,
                detailDtoList
            })
         }
   
        this.setState({
            checkPointGroupDtoList: arr,
            visible: false,
        })
        this.props.parent.getPointGroupSet(this, arr);
     }
     handleCancel = (e) => {
         this.setState({
             visible: false,
         });
     }

       //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            detailDtoList:[],
            groupName:'',
            btnType: 'add',
            visible: true,
        })
    }
    // 编辑信息
    edit=(record,index)=>{
        const {detailDtoList} = record;

        this.setState({
            currentIndex:index,
            detailDtoList,
            btnType:'edit',
            visible:true,
        })
    }

    // 新增品质等级
    addFreqGrade = () =>{
        let arr = [{
            pointId: "",
            pointName:""
        }]
        const {detailDtoList = []} = this.state;
        let arr1 = detailDtoList || [];
        this.setState({
            detailDtoList: arr1.concat(arr)
        })
    }
    modeChangeFreq = (index, e) => {
        const {detailDtoList,} = this.state;
        let arr = [...detailDtoList];
        let pointName = '';
        let checkPointDtoList = this.props.checkPointDtoList;
        for(let i = 0;i<checkPointDtoList.length;i++){
            if(e == checkPointDtoList[i].id){
                pointName = checkPointDtoList[i].pointName
            }
        }
        arr[index] = {
            ...arr[index],
            pointId:e,
            pointName,
        }
        this.setState({
            detailDtoList: arr,
        })
    }
    deleteDetail = (record,index)=>{
        const {btnType,detailDtoList} = this.state;
        let arr = [...detailDtoList];
        arr.splice(index, 1);
        this.setState({
            detailDtoList: arr
        })
      
    }
    // =======================================
    

    viewCancel = ()=>{
        this.setState({
            viewVisible:false
        })
    }
    render() {
        const {detailDtoList,viewInfo,groupName,checkPointGroupDtoList = []} = this.state;
        const tableStyle = {
            bordered: true,
            loading: false,
            pagination: false,
            size: 'default',
            // rowSelection: {},
            scroll: undefined,
        }
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
                render: (text, record, index) => index + 1,
            },
            {
                title: '点位组名称',
                dataIndex: 'groupName',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.viewMode(record,index)}> 查看 </Button>
                    <span className="ant-divider" />
                    < Button onClick={()=>this.editMode(record,index)}> 编辑 </Button>
                    <span className="ant-divider" />
                    <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                     < Button type='danger' onClick={()=>this.deleteMode(index)}> 删除 </Button>
                    </Popconfirm>
                    </span>
                ),
            }
        ];
        return (
            <div>
                < Button onClick={()=>this.add()} type='primary' style={{margin:'10px 0'}}>新增点位组</Button> 
                <Table rowKey={record => record.id} {...tableStyle} dataSource={checkPointGroupDtoList || []} columns={columns}/>

                <Modal
                title='点位组管理'
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                >   
                    <Input  addonBefore="点位组名称：" name="groupName" placeholder="" value={groupName} style={{marginTop:10}}
                    onChange={this.inputChange.bind(this)}/>
                       {
                        (detailDtoList || []).map((item,index)=>{
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div>点位名称：</div>
                                         <Select value={item.pointName} style={{ width: 300 }}  onChange={this.modeChangeFreq.bind(this,index)}>
                                            {
                                                (this.props.checkPointDtoList || []).map((item, index) => {
                                                    return (
                                                        <Option value={item.id} key={index}> {item.pointName} </Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </div>
                                    <Button type='danger' style={{width:'100%'}} onClick={()=>this.deleteDetail(item.id,index)}>删除此绑定点位</Button>
                                </div>
                            )
                        })
                    }

                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.addFreqGrade()}>新增绑定点位</Button>
                    </BtnWrap>
                </Modal>

                 {/* 查看 */}
                  <Modal
                    title="点位组管理"
                    visible={this.state.viewVisible}
                    onOk={this.viewCancel}
                    onCancel={this.viewCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div>点位组名称：{groupName}</div>
                    {
                        (detailDtoList || []).map((item, index) => {
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div>点位名称：{item.pointName}</div>
                                    </div>
                                </div>
                            )
                        })
                    }
           
                </Modal>
            </div>
        );
    }
}

export default CommonCycle;
