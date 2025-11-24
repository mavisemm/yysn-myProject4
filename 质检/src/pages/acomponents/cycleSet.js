import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Modal,Table  } from 'antd';
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
            freqDetailDtos:[],
            visible:false,
            currentIndex:"",
            btnType:'edit',
            freq1: "",
            freq2: "",
        };
    }
    componentDidMount() {
        const {freqDetailDtos = []} = this.props;
        this.setState({
            freqDetailDtos
        })
    }
    componentWillReceiveProps(newProps) {
        const {freqDetailDtos = [] } = {...newProps};
        this.setState({
            freqDetailDtos
        })
    }
    
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    editMode = (row, index) => {
        const {freq1,freq2,} = {...row};
        this.setState({
            freq1,
            freq2,
            currentIndex: index,
            btnType: 'edit',
            visible: true,

        })
     }
    deleteMode = (row, index) => {
        const {freqDetailDtos=[]} = this.state;
        let arr = [...freqDetailDtos];
        arr.splice(index, 1)
        this.setState({
            freqDetailDtos: arr,
            currentIndex: index,
        })
        this.props.parent.getCycleSet(this, arr);
    }
    addMode = ()=>{
        this.setState({
            btnType: 'add',
            freq1:"",
            freq2:"",
            visible: true,
        })
     }

     handleOk = (e) => {
         const {currentIndex,freqDetailDtos,freq1, freq2, btnType,} = this.state;
         if(freq1 == '' || freq2 == '' || freq1 == 0){
            message.error('内容不能为空，且开始频率不能为0')
            return false
         }
        if (Number(freq1) > Number(freq2) || Number(freq1) == Number(freq2)) {
            message.error('开始频率不能大于或等于结束频率！')
            return false
         }
        let arr = [...freqDetailDtos];
         if (btnType == 'edit') {
            arr[currentIndex] = {
                ...arr[currentIndex],
                freq1,
                freq2,
            };
         }else{
            arr.push({
                freq1,
                freq2,
            })
         }
   
        this.setState({
            freqDetailDtos: arr,
            visible: false,
            freq1:"",
            freq2:"",
        })
        this.props.parent.getCycleSet(this, arr);
     }
     handleCancel = (e) => {
         this.setState({
             visible: false,
         });
     }
    render() {
        const {freq1 ,freq2,freqDetailDtos = []} = this.state;
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
                title: '开始频率(Hz)',
                dataIndex: 'freq1',
            }, {
                title: '结束频率(Hz)',
                dataIndex: 'freq2',
            },{
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.editMode(record,index)}> 编辑 </Button>
                    <span className="ant-divider" />
                    < Button type='danger' onClick={()=>this.deleteMode(record,index)}> 删除 </Button>
                    </span>
                ),
            }
        ];
        return (
            <div  style={{width:'100%'}}>
                < Button onClick={()=>this.addMode()} type='primary'>周期声音检测频段设置</Button> 
                <Table rowKey={(record,index) => index} {...tableStyle} dataSource={freqDetailDtos || []} columns={columns}/>
                <Modal
                title='周期声音检测频段设置'
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                >
                    <Input  addonBefore="开始频率(Hz)：" name="freq1" placeholder="" value={freq1} style={{marginTop:10}}
                    onChange={this.inputChange.bind(this)}/>
                     <Input  addonBefore="结束频率(Hz)：" name="freq2" placeholder="" value={freq2} style={{marginTop:10}}
                    onChange={this.inputChange.bind(this)}/>
                </Modal>
            </div>
        );
    }
}

export default CommonCycle;
