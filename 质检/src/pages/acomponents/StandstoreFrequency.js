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
import { service } from './service';
import { SketchPicker } from 'react-color';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getContrastingColor } from 'react-color/lib/helpers/color';
const { tenantId, userId, token } = vtxInfo;
const CheckboxGroup = Checkbox.Group;
class frequency extends React.Component {
    state = {
        loading: false,
        qualityVisible:false,
        machineVisible:false,
        clickType:"",
        frequencyVisible:false,
        freqGrade:[],
        densityFilter: "",
        geometricVisible:false,
        geometricList:[],
        selectedRowKeys:[],
        selectedRows:[],
        conditionDtoList:[],
        db:"",
        density:"",
        index:"",
        dbLowerLimit:"",
        densityLowerLimit:"",
        standardfrequencyList:[],
        dbRange:"",
        densityRange:""
    }
    componentDidMount() {
        const {conditionDtoList = [],standardfrequencyList=[]} = this.props;
        this.setState({
            conditionDtoList,
            standardfrequencyList
        })
    }
    componentWillReceiveProps(props) {
        const {conditionDtoList = [],standardfrequencyList=[]} = props;
        if (standardfrequencyList.length && this.state.standardfrequencyList != standardfrequencyList) {
            this.setState({
                conditionDtoList,
                standardfrequencyList
            }, () => {
                this.changeBz(conditionDtoList, standardfrequencyList);
            })
        }

    }
    // 标准曲线变化的时候数值跟随改变
    changeBz = (conditionDtoList,standardfrequencyList)=>{
        let arr = [];
        for(let i = 0;i<conditionDtoList.length;i++){
            let temp = conditionDtoList[i];
            let result = this.caulateIndex(temp.freq1, temp.freq2, i, standardfrequencyList)
            arr.push({
                ...temp,
                dbRange: result.dbRange1,
                densityRange: result.densityRange1
            })
        }
        this.props.parent.getChild(this,arr);
        this.setState({
            conditionDtoList:arr
        })
    }

      caulateIndex = (freq1,freq2,index,standardfrequencyList)=>{
        const {densityRange,dbRange,conditionDtoList} = this.state;
        let arr = [...conditionDtoList];
        let tempArr = [];
        let index1 = '';
        let index2 = '';
        let dbRange1 = '';
        let densityRange1 = '';
        for(let i = 0;i<standardfrequencyList.length;i++){
            if(freq1.toFixed(0) == standardfrequencyList[i].freq1.toFixed(0)){
                index1 = i;
            }
            if (freq2.toFixed(0) == standardfrequencyList[i].freq2.toFixed(0)) {
                index2 = i+1;
            }

        }
        tempArr = standardfrequencyList.slice(index1,index2);
        let len = tempArr.length;
        let dbArr = this.sortByElement(tempArr,'db');
        let densityArr = this.sortByElement(tempArr, 'density');

        dbRange1 = dbArr[0].db + '-' + dbArr[len - 1].db;
        densityRange1 = densityArr[0].density + '-' + densityArr[len - 1].density;
        
        arr[index] = {
            ...arr[index],
            dbRange: dbRange1,
            densityRange: densityRange1
        }
        return {dbRange1, densityRange1}
    }

    inputChange=(e)=>{
        this.setState({
            [e.target.name]:e.target.value
        })
        
    }
    qualityCancel = (e) => {
        this.setState({
            qualityVisible: false,
            frequencyVisible:false,
            geometricVisible:false,
            densityFilter: "",
            db:"",
            density:"",
            dbLowerLimit:"",
            densityLowerLimit:""

        })
    }
    deleteQuality = (index) =>{
        const {conditionDtoList} = this.state;
        let arr = [...conditionDtoList];
        arr.splice(index, 1);
        this.setState({
            conditionDtoList: arr
        })
         this.props.parent.getChild(this, arr);
      }
    // 声音频段列表
    choosepd = () =>{
        this.setState({
            selectedRowKeys:[],
            selectedRows:[],
            geometricVisible:true
        })
    }

    caulate = ()=>{
        const {standardfrequencyList,freq1,freq2,densityRange,dbRange} = this.state;
        let tempArr = [];
        let index1 = '';
        let index2 = '';
        let dbRange1 = '';
        let densityRange1 = '';
        for(let i = 0;i<standardfrequencyList.length;i++){
            if(freq1 == standardfrequencyList[i].freq1){
                index1 = i;
            }
            if (freq2 == standardfrequencyList[i].freq2) {
                index2 = i+1;
            }

        }
        tempArr = standardfrequencyList.slice(index1,index2);
        let len = tempArr.length;

        let dbArr = this.sortByElement(tempArr,'db');
        let densityArr = this.sortByElement(tempArr, 'density');

        dbRange1 = dbArr[0].db + '-' + dbArr[len - 1].db;
        densityRange1 = densityArr[0].density + '-' + densityArr[len - 1].density;
        this.setState({
            selectedRowKeys:[],
            selectedRows:[],
            dbRange: dbRange1,
            densityRange:densityRange1,
            geometricVisible:false
        })
    }

    sortByElement(arr, element) {
        let newArr = arr.slice(); // 复制传入的数组，避免改变原数组
        newArr.sort(function (a, b) {
            if (a[element] < b[element]) {
                return -1;
            } else if (a[element] > b[element]) {
                return 1;
            } else {
                return 0;
            }
        });
        return newArr;
    }
    // 处理频段范围
   
    // 频段确认弹窗
    qualityFreqOk = ()=>{
        const {densityFilter,freq1,freq2,db,dbLowerLimit,density,conditionDtoList,clickType,index,densityLowerLimit,dbRange,densityRange} = this.state;
         let arr = [...conditionDtoList];
        
         if(freq1 == '' || freq2 == '' || db == '' || dbLowerLimit == '' || density == '' || densityLowerLimit == ''){
            message.error('请检查输入框内容是否填写完整！')
            return false;
         }
        if (clickType == 1){
            // 新增
            arr.push({
                densityFilter,
                densityLowerLimit,
                freq1,
                freq2,
                db,
                dbLowerLimit,
                density,
                dbRange,
                densityRange
            })
         
        }else{
            // 编辑
            arr[index] = {
                ...arr[index],
                densityFilter,
                densityLowerLimit,
                freq1,
                freq2,
                db,
                dbLowerLimit,
                density,
                  dbRange,
                  densityRange
            }
        }
        this.setState({
            conditionDtoList: arr,
            frequencyVisible: false,
            freq1:'',
            freq2:"",
            db:"",
            dbLowerLimit:"",
            density:"",
            densityFilter:"",
            densityLowerLimit:"",
            dbRange:"",
            densityRange:""
        })
         this.props.parent.getChild(this, arr);
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let arr = selectedRows;
        let freq1 = '';
        let freq2 = '';
        for(let i = 0;i<arr.length;i++){
            freq1 = arr[0].freq1;
            freq2 = arr[i].freq2;
        }
        this.setState({
            freq1,
            freq2,
            selectedRowKeys,
            selectedRows
        })
    }
    start = () => {
        this.setState({ loading: true });
        setTimeout(() => {
        this.setState({
            selectedRowKeys: [],
            loading: false,
        });
        }, 1000);
    }
    addMode = (row,type,index)=>{
        const {standardfrequencyList} = this.state;
        if(type == 1){
            // 新增
            if (standardfrequencyList.length){
                this.setState({
                    frequencyVisible: true,
                    clickType: 1
                })
            }else{
                message.error('您还未选择任何数据！')
            }
        
        }else{
            const {densityFilter,freq1,freq2,db,dbLowerLimit,density,densityLowerLimit,  dbRange,
                densityRange,} = row;
            this.setState({
                densityFilter,
                freq1,
                freq2,
                db,
                dbLowerLimit,
                density,
                clickType:2,
                index,
                densityLowerLimit,
                dbRange,
                densityRange,
                frequencyVisible: true,
            })
        }
        
    }

    render(){
        const {selectedRowKeys ,loading,freqGrade,id,conditionDtoList ,densityFilter,db,density,dbLowerLimit,densityLowerLimit ,dbRange,densityRange} = this.state;
        const columns = [
            {
                title: '开始频段(Hz)',
                dataIndex: 'freq1',
            }, {
                title: '结束频段(Hz)',
                dataIndex: 'freq2',
            },
            {
                title: '标准能量范围(db)',
                dataIndex: 'dbRange',
            },
            {
                title: '标准密度范围(%)',
                dataIndex: 'densityRange',
            },
            {
                title: '能量正偏离值(db)(>=)',
                dataIndex: 'db',
            },
            {
                title: '能量负偏离值(db)(>=)',
                dataIndex: 'dbLowerLimit',
            },
    
            {
                title: '密度正偏离值(%)(>=)',
                dataIndex: 'density',
            },
            {
                title: '密度负偏离值(%)(>=)',
                dataIndex: 'densityLowerLimit',
            },
            {
                title: '可忽略密度值(%)(<)',
                dataIndex: 'densityFilter',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.addMode(record,2,index)} type='primary'> 编辑 </Button>
                    <span className="ant-divider" />
                    < Button onClick={()=>this.deleteQuality(index)} type='danger'> 删除 </Button>
                    </span>
                ),
            }
        ];
 
        const columnFrequency = [{
            title: '开始频段(Hz)',
            dataIndex: 'freq1',
            }, {
            title: '结束频段(Hz)',
            dataIndex: 'freq2',
        }];
        const rowSelection = {
            preserveSelectedRowKeys:true,
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <div>
                <Button type = "primary" onClick={()=>this.addMode('',1)}> 新增声音频段告警 </Button>(说明：预警值为红色)
                <Table rowKey={record => record.freq1}  columns={columns} dataSource={conditionDtoList}/>

                {/* 频段周期声音管理 */}
                <Modal
                    title="声音频段"
                    visible={this.state.frequencyVisible}
                    onOk={this.qualityFreqOk}
                    onCancel={this.qualityCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div>
                          <Button type='primary' style={{margin:'10px 0'}} onClick={()=>this.choosepd()}>选择频段</Button>
                           <span  style={{margin:'0 10px'}}>{this.state.freq1}~{this.state.freq2}(Hz)</span> 
                           <div style={{margin:'10px 0'}}>标准能量范围(db):{dbRange}</div>
                           <div>标准密度范围(%):{densityRange}</div>
                    </div>
                    <Input addonBefore="能量正偏离值(>=)：" style={{width:'300px',marginTop:"10px"}} name='db' placeholder="请输入" value={db} addonAfter='db'
                    onChange={this.inputChange.bind(this)}/>
        
                     <Input addonBefore="能量负偏离值(>=)：" style={{width:'300px',marginTop:"10px"}} name='dbLowerLimit' placeholder="请输入" value={dbLowerLimit}
                     addonAfter='db' onChange={this.inputChange.bind(this)}/>

                    <Input addonBefore="密度正偏离值(>=)：" style={{width:'300px',marginTop:"10px"}} name='density' placeholder="请输入" value={density} addonAfter='%'
                    onChange={this.inputChange.bind(this)}/> 
                    <Input addonBefore="密度负偏离值(>=)：" style={{width:'300px',marginTop:"10px"}} name='densityLowerLimit' placeholder="请输入" value={densityLowerLimit} addonAfter='%'
                    onChange={this.inputChange.bind(this)}/> 
     
                    <Input addonBefore="可忽略密度值(<)：" style={{width:'300px',marginTop:"10px"}} name='densityFilter' placeholder="请输入" value={densityFilter}  addonAfter='%'
                    onChange={this.inputChange.bind(this)}/>
              
                
                </Modal>

                {/* 等比频段列表 */}
                <Modal
                    title="选择频段"
                    visible={this.state.geometricVisible}
                     okText = "确认"
                     cancelText = "取消"
                    onOk={()=>{
                       this.caulate()
                    }}
                    onCancel={()=>{
                        this.setState({
                            geometricVisible:false
                        })
                    }}
                >
                    <div style={{ marginBottom: 16 }}>
                        <Button
                            type="primary"
                            onClick={this.start}
                            disabled={!hasSelected}
                            loading={loading}
                        >
                            清空
                        </Button>
                        <span style={{ marginLeft: 8 }}>
                            {hasSelected ? `选择了 ${selectedRowKeys.length} 项` : ''}
                        </span>
                         <span  style={{margin:'0 10px'}}>频率范围：{this.state.freq1}~{this.state.freq2}</span> 
                    </div>
                    <Table  rowKey={record =>record.freq1} rowSelection={rowSelection} preserveSelectedRowKeys={true} columns={columnFrequency} dataSource={this.state.standardfrequencyList} />
                </Modal>

            </div>

          
        )
    }
}

export default frequency;