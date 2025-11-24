import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Modal,Table,Popconfirm   } from 'antd';
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { service } from './service';
class CommonCycle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkPointDtoList:[],
            visible:false,
            currentIndex:"",
            btnType: 'edit',
            startFreq: "",
            endFreq: "",
            pointName: '',
            freqCount:"",
            deleteIndex:"",
            typeList:[
                {
                    id:0,
                    name:'听音点位'
                },
                {
                    id: 1,
                    name: '热成像点位'
                },
                {
                    id: 2,
                    name: '振动点位'
                },
            ],
            type:"4"
        };
    }
    componentDidMount() {
        // 点检机型中点位
        const {checkPointDtoList = []} = this.props;
        this.setState({
            checkPointDtoList
        })
    }
    componentWillReceiveProps(newProps) {
        const {checkPointDtoList = [] } = {...newProps};
        this.setState({
            checkPointDtoList
        })
    }
    
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    editMode = (row, index) => {
        const {startFreq,endFreq,pointName,freqCount,type} = {...row};
        this.setState({
            pointName,
            freqCount,
            startFreq,
            endFreq,
            currentIndex: index,
            type,
            btnType: 'edit',
            visible: true,

        })
     }
    deleteMode = (index) => {
        this.setState({
            deleteIndex: index,
        })
    }
    delete = () => {
        const {checkPointDtoList=[],deleteIndex} = this.state;
        let arr = [...checkPointDtoList];
        arr.splice(deleteIndex, 1)
        this.setState({
            checkPointDtoList: arr,
        })
        this.props.parent.getPointSet(this, arr);
    }
    addMode = ()=>{
        const {checkPointDtoList} = this.state;
        this.setState({
            btnType: 'add',
            pointName:"",
            freqCount:"",
            startFreq:"",
            endFreq:"",
            currentIndex: checkPointDtoList.length,
            type:'',
            visible: true,
        })
     }

     handleOk = (e) => {
         const {
             currentIndex,
             checkPointDtoList,
             startFreq,
             endFreq,
             btnType,
             freqCount,
             pointName,type
         } = this.state;
        if (pointName == '') {
            message.error('请检查是否填写完整')
            return false;
        }
         if(type == 0 || type == 2){
            if ( startFreq == '' || endFreq == '' || freqCount == '' || startFreq == 0) {
                message.error('请检查是否填写完整！开始频率不能为0')
                return false;
            }
            if (Number(startFreq) > Number(endFreq) || Number(startFreq) == Number(endFreq)) {
                message.error('开始频率不能大于或等于结束频率！')
                return false
            }
         }
  
        let arr = [...checkPointDtoList];
         if (btnType == 'edit') {
            arr[currentIndex] = {
                ...arr[currentIndex],
                startFreq,
                endFreq,
                pointName,
                freqCount,
                type
            };
         }else{
            arr.push({
                pointName,
                freqCount,
                startFreq,
                endFreq,
                 type
            })
         }
   
        this.setState({
            checkPointDtoList: arr,
            visible: false,
        })
        this.props.parent.getPointSet(this, arr);
     }
     handleCancel = (e) => {
         this.setState({
            type:"",
             visible: false,
         });
     }
    moveUp = (index)=>{
        if (index < 1) {
            return;
        }
        const dataSource = [...this.state.checkPointDtoList];
        const newIndex = index - 1;

        this.setState({
            checkPointDtoList: this.moveRow(index, newIndex, dataSource),
        });
    }
    moveDown = (index)=>{
        const dataSource = [...this.state.checkPointDtoList];
        const newIndex = index + 1;

        if (newIndex > dataSource.length - 1) {
            return;
        }

        this.setState({
            checkPointDtoList: this.moveRow(index, newIndex, dataSource),
        });

    }
    moveRow(currentIndex, targetIndex, dataSource) {
        // 如果目标位置和当前位置一样，则不进行任何操作
        if (currentIndex === targetIndex) {
            return dataSource;
        }

        // 将当前选中行从数组中删除，并保存到一个变量中
        const [removedRow] = dataSource.splice(currentIndex, 1);

        // 将选中行插入到目标位置
        dataSource.splice(targetIndex, 0, removedRow);
        // console.log(dataSource,'dataSource')

        // 返回新的数组
        return [...dataSource];
    }
    // =================================点位选择==============================
    pointChange = (e)=>{
        this.setState({
            type:Number(e)
        })
    }
    render() {
        const {startFreq ,endFreq,freqCount,pointName,checkPointDtoList = [],type,btnType} = this.state;
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
                title: '编号',
                dataIndex:'index',
                render: (text, record, index) => index + 1,
            },
            {
                title: '点位类型',
                dataIndex: 'type',
                    render: (text, record,index) => (
                    <span>
                        {record.type == 0 ? '听音': (record.type == 1 ? '热成像' : '振动')}
                    </span>
                ),
            },
            {
                title: '点位名称',
                dataIndex: 'pointName',
            },
            {
                title: '开始频率(Hz)',
                dataIndex: 'startFreq',
            },
            {
                title: '结束频率(Hz)',
                dataIndex: 'endFreq',
            },
            {
                title: '分段数量',
                dataIndex: 'freqCount',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.editMode(record,index)}> 编辑 </Button>
                    <span className="ant-divider" />
                    <Popconfirm placement="topLeft" title='确认删除吗？如果该机型已经生成过听音方案，点位变化之后需重新编辑听音方案' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                     < Button type='danger' onClick={()=>this.deleteMode(index)}> 删除 </Button>
                    </Popconfirm>
                    <span className="ant-divider" />
                    < Button  onClick={()=>this.moveDown(index)}> 下移 </Button>
                    <span className="ant-divider" />
                    < Button  onClick={()=>this.moveUp(index)}> 上移 </Button>
                    </span>
                ),
            }
        ];
        return (
            <div>
                < Button onClick={()=>this.addMode()} type='primary' style={{margin:'10px 0'}}>新增点位</Button> 
                <Table rowKey={record => record.id} {...tableStyle} dataSource={checkPointDtoList || []} columns={columns}/>
                <Modal
                    title='点位管理'
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >   
                    {
                        btnType == 'add' ? 
                            <Select value={type} style={{ width: 300 }} placeholder='请先选择点位类型'  onChange={this.pointChange.bind(this)}>
                            {
                                (this.state.typeList || []).map((item, index) => {
                                    return (
                                        <Option value={item.id} key={index}> {item.name} </Option>
                                    )
                                })
                            }
                        </Select> :""
                    }
              
                    {
                        (type === 0 || type == 2 ) && 
                            <div>
                                <Input  addonBefore="点位名称：" name="pointName" placeholder="" value={pointName} style={{marginTop:10}}
                                onChange={this.inputChange.bind(this)}/>
                                <Input  addonBefore="开始频率(Hz)：" name="startFreq" placeholder="" value={startFreq} style={{marginTop:10}}
                                onChange={this.inputChange.bind(this)}/>
                                <Input  addonBefore="结束频率(Hz)：" name="endFreq" placeholder="" value={endFreq} style={{marginTop:10}}
                                onChange={this.inputChange.bind(this)}/>
                                <Input  addonBefore="分段数量：" name="freqCount" placeholder="" value={freqCount} style={{marginTop:10}}
                                onChange={this.inputChange.bind(this)}/>
                        
                            </div>
                    }
                    {
                        (type == 1 ) && 
                            <div>
                                <Input  addonBefore="点位名称：" name="pointName" placeholder="" value={pointName} style={{marginTop:10}}
                                onChange={this.inputChange.bind(this)}/>
                            </div>
                    }
         
                </Modal>
            </div>
        );
    }
}

export default CommonCycle;
