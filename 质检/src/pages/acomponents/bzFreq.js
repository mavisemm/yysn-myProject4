import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon,Table,Checkbox,Tabs,Switch,Popconfirm } from 'antd';
const Option = Select.Option;
const TabPane = Tabs.TabPane;
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
import styles from './vQuality.less';
const { tenantId, userId, token } = vtxInfo;
let freq1 = '';
let freq2 = '';
class bzFrequency extends React.Component {
    state = {
        loading: false,
        freqVisible:false,
        groupId:"",
        name:"",
        color:'',
        qualityId:"",
        multiFreqStandardGroupDtoList:[],
        detailDtoList: [],
        btnType:'add',
        currentIndex:'',
        deleteIndex:'',
        typeList:[
            {
                id:'0',
                name: '能量'
            },
            {
                id: '1',
                name: '密度'
            },
        ],
        contentList:[
            {
                id: '0',
                name: '正偏离'
            }, {
                id: '1',
                name: '负偏离'
            },
    ]

    }
    componentDidMount() {
        const {multiFreqStandardGroupDtoList} = this.props;
        this.setState({
            multiFreqStandardGroupDtoList,
        }, () => {
        })
    }

     componentWillReceiveProps(newProps) {
        const {multiFreqStandardGroupDtoList} = newProps;
        this.setState({
            multiFreqStandardGroupDtoList,
        },()=>{
        })
     }
   
    //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            qualityId:"",
            color:"",
            detailDtoList:[],
            freqVisible: true,
            btnType:'add'
        })
    }
    // 编辑信息
    editMode = (record, index,type) => {
        const {qualityId,detailDtoList,qualityName,color} = record;
        this.setState({
            qualityId,
            color,
            qualityName,
            currentIndex:index,
            detailDtoList,
            btnType:'edit',
            freqVisible: type == 1 ? false : true,
            viewVisible: type == 1 ? true : false,
        },()=>{
        })

    }

    // 新增品质等级
    addBig = (type) =>{
        let arr = [{
            freq1:"",
            freq2: "",
            itemDtoList:[],
            ignoreDensity:"",
        }]
        const {detailDtoList = []} = this.state;
        let arr1 = [...detailDtoList] || [];
        this.setState({
            detailDtoList: arr1.concat(arr),
        })
   
    }
    addSmall = (index)=>{
        let arr = [{
            type: "",
            min: "",
            max:"",
            numericalRange: '',
        }]
         const {detailDtoList = []} = this.state;
         let tempArr = [...detailDtoList];
         let arr1 = tempArr[index].itemDtoList || [];
         tempArr[index] = {
            ...tempArr[index],
            itemDtoList: arr1.concat(arr),
         }
        this.setState({
            detailDtoList: tempArr,
        })

    }
    typeChange=(index,indexp,e)=>{
        const {detailDtoList = []} = this.state;
         let tempArr = [...detailDtoList];
         let arr1 = tempArr[index].itemDtoList || [];
         arr1[indexp] = {
            ...arr1[indexp],
            type:e
         }
         tempArr[index] = {
            ...tempArr[index],
            itemDtoList: arr1,
         }
        this.setState({
            detailDtoList: tempArr,
        })
    }
   typeChange1=(index,indexp,e)=>{
        const {detailDtoList = []} = this.state;
         let tempArr = [...detailDtoList];
         let arr1 = tempArr[index].itemDtoList || [];
         arr1[indexp] = {
            ...arr1[indexp],
            numericalRange:e
         }
         tempArr[index] = {
            ...tempArr[index],
            itemDtoList: arr1,
         }
        this.setState({
            detailDtoList: tempArr,
        })
    }
    qqualityChange = (e) => {
          const {qualityList} = this.props;
             let qualityName = '';
             let color = '';
             let qualityId = '';
             for (let i = 0; i < qualityList.length; i++) {
                 if (qualityList[i].id == e) {
                     qualityName = qualityList[i].name;
                     color = qualityList[i].color;
                     qualityId = qualityList[i].id;
                 }
             }
            this.setState({
                qualityName,
                color,
                qualityId,
            }) 
     
    }
    // =======================================
    // 频段确认弹窗
    freqOk = ()=>{
        const {name,ignoreDensity,multiFreqStandardGroupDtoList,detailDtoList ,
        currentIndex,btnType,freq1,freq2,qualityId,qualityName,color} = this.state;
        if (qualityId == '') {
            message.error('请检查品质等级是否填写!')
            return false;
        }
     
        const numRegex = /^[+-]?\d+(\.\d+)?$/;
        if(detailDtoList.length){
            for (let i = 0; i < detailDtoList.length; i++) {
                let obj = detailDtoList[i];
                if(obj.freq1 == '' || obj.freq2 == '' || obj.ignoreDensity == ''){
                    message.error('开始频率、结束频率、可忽略密度值必填!')
                    return false;
                }
                if (!numRegex.test(obj.freq1) || !numRegex.test(obj.freq2) || !numRegex.test(obj.ignoreDensity)) {
                    message.error('开始频率、结束频率、可忽略密度值必须是合法的数字（包括浮点数）！');
                    return;
                }
                if (Number(obj.freq1) > Number(obj.freq2)) {
                    message.error('开始频率不能大于结束频率！');
                    return false;
                }
                  if(obj.itemDtoList.length == 0){
                    message.error('参数还未设置！')
                    return false;
                  }

                let itemDtoList = obj.itemDtoList;
                for(let j = 0;j<itemDtoList.length;j++){
                    let a = itemDtoList[j];
                    if(a.type === '' || a.numericalRange === ''){
                        message.error('缺少必填参数!')
                        return false;
                    }
                    if (a.min === '' && a.max === '') {
                        message.error('范围不能同时为空!')
                        return false;
                    }
                    if(a.min){
                        if (!numRegex.test(a.min)) {
                            message.error('请检查较小值范围输入是否合法!')
                            return false;
                        }
                    }
                      if (a.max) {
                          if (!numRegex.test(a.max)) {
                              message.error('请检查较大值范围输入是否合法!')
                              return false;
                          }
                      }
                      if(a.min && a.max){
                        if(Number(a.min)>Number(a.max)){
                             message.error('较小值应该小于较大值!')
                             return false;
                        }
                      }
                }
            }
        } else {
            message.error('品质等级相关条件还未设置！')
            return false;
        }
       
        if(btnType == 'add'){
            let arr = [...multiFreqStandardGroupDtoList];
            let paramsArr = [{
                qualityName,
                qualityId,
                color,
                detailDtoList,
                show:false,
            }]
            this.setState({
                multiFreqStandardGroupDtoList:arr.concat(paramsArr),
                freqVisible:false,
            })
            // console.log(arr.concat(paramsArr),'提交参数')
            // return false;
            this.props.parent.getCompareSet(this, arr.concat(paramsArr));
         }else{
            // 编辑
            let arr = [...multiFreqStandardGroupDtoList];
            arr[currentIndex]={
                ...arr[currentIndex],
                qualityName,
                qualityId,
                color,
                detailDtoList,
            }
            this.setState({
                multiFreqStandardGroupDtoList:arr,
                freqVisible:false,
            })
            this.props.parent.getCompareSet(this, arr);
         }  
       
        
    }
    freqCancel = ()=>{
        this.setState({
            freqVisible:false,
            viewVisible:false,
        })
    }
    inputChangeIndex = (index,e)=>{
   
        const {detailDtoList = []} = this.state;
        let arr = [...detailDtoList];
        arr[index]={
            ...arr[index],
            [e.target.name]: e.target.value
        }
        this.setState({
            detailDtoList: arr
        })
    }
    inputChangeIndexSmall = (index,indexp,e)=>{
        const {detailDtoList = []} = this.state;
        let arr = [...detailDtoList];
        let arr1 = arr[index].itemDtoList || [];
            arr1[indexp] = {
                ...arr1[indexp],
                [e.target.name]: e.target.value
            }
            arr[index] = {
                ...arr[index],
                itemDtoList:arr1
            }
            this.setState({
                detailDtoList: arr
            })
    }
    // ==========频段设置结束============
    // 删除
    deleteBig = (record,index,type)=>{
        const {btnType,detailDtoList} = this.state;
        let arr = [...detailDtoList];
        arr.splice(index, 1);
        this.setState({
            detailDtoList: arr
        })
    }
    deleteSmall= (index,indexp)=>{
        const {btnType,detailDtoList} = this.state;
        let arr = [...detailDtoList];
        let arr1 = arr[index].itemDtoList || [];
        arr1.splice(indexp, 1);
        arr[index] = {
            ...arr[index],
            itemDtoList:arr1
        }
        this.setState({
            detailDtoList: arr
        })
    }


    // =================table表格删除
    delete = () => {
        const {multiFreqStandardGroupDtoList,deleteIndex} = this.state;
        let arr = [...multiFreqStandardGroupDtoList]
        arr.splice(deleteIndex, 1);
        this.setState({
            multiFreqStandardGroupDtoList: arr,
        })

        this.props.parent.getCompareSet(this, arr);
    }

    deleteMode = (index)=>{
        this.setState({
            deleteIndex:index
        })
    }
    //==================== table表格删除结束================
    render(){
        const column = [
            {
                title: '品质等级',
                dataIndex: 'qualityName',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                    < Button onClick={()=>this.editMode(record,index,1)}> 查看 </Button>
                    <span className="ant-divider" />
                    < Button onClick={()=>this.editMode(record,index,'')} type='primary'> 编辑 </Button>
                    <span className="ant-divider" />
                    <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                        < Button type='danger' style={{marginLeft:10}} onClick={()=>this.deleteMode(index)}> 删除 </Button>
                    </Popconfirm> 
                    </span>
                ),
            }
       
        ];
        const {id ,multiFreqStandardGroupDtoList,detailDtoList,contentList,typeList,color ,qualityId,qualityName,btnType } = this.state;
        return (
            <div style={{width:'50%'}}>
                <BtnWrap>
                    <Button type = "primary" onClick={()=>this.add()}> 新增多频段对比品质等级 </Button>
                </BtnWrap>
                {
                    (multiFreqStandardGroupDtoList && multiFreqStandardGroupDtoList.length != 0) &&  <Table rowKey={record => record.id}  columns={column} dataSource={multiFreqStandardGroupDtoList || []} pagination={false}/>
                }
               
                {/* 频段声音管理 */}
                <Modal
                    title="多频段对比品质等级"
                    visible={this.state.freqVisible}
                    onOk={this.freqOk}
                    onCancel={this.freqCancel}
                    width='60%'
                    okText = "确认"
                    cancelText = "取消"
                >
                       <div className={styles.gradeflex}>
                            <div style={{color:color}}>品质等级名称：</div>
                                <Select value={qualityId}  style={{ width: 300 }}  onChange={this.qqualityChange.bind(this)}>
                                {
                                    (this.props.qualityList || []).map((item, index) => {
                                        return (
                                            <Option value={item.id} key={index}> {item.name} </Option>
                                        )
                                    })
                                }
                            </Select>
                        </div>
                        {
                            (detailDtoList || []).map((item,index)=>{
                                return (
                                    <div style={{border:'1px solid grey',padding:'5px 5px',marginBottom:10,borderRadius:5}} key={index}>
                                        <div className={styles.freqFlexNew}>
                                            <Input name='freq1' addonBefore='开始频段' placeholder="请输入开始频段" value={item.freq1} style={{width:180}}
                                            addonAfter='Hz' onChange={this.inputChangeIndex.bind(this,index)}/>
                                            <Input  name='freq2' addonBefore='结束频段' addonAfter='Hz' placeholder="请输入结束频段" value={item.freq2}  style={{width:180,marginLeft:5}}
                                            onChange={this.inputChangeIndex.bind(this,index)}/>
                                            <Input addonBefore="可忽略密度值小于：" addonAfter='%' style={{width:200,marginLeft:5}} name='ignoreDensity' placeholder="请输入" value={item.ignoreDensity}
                                            onChange={this.inputChangeIndex.bind(this,index)}/>
                                        </div>
                                        
                                        {
                                            (item.itemDtoList || []).map((itemp,indexp)=>{
                                                return (
                                                    <div key={indexp}>
                                                        <div className={styles.freqFlexNew}>
                                                            <Select value={btnType == 'edit' ? itemp.type.toString() : itemp.type} style={{ width: 100 }}  onChange={this.typeChange.bind(this,index,indexp)}>
                                                                {
                                                                    (typeList || []).map((item, index) => {
                                                                        return (
                                                                            <Option value={item.id} key={index}> {item.name} </Option>
                                                                        )
                                                                    })
                                                                }
                                                            </Select>
                                                            <Select value={btnType == 'edit' ? itemp.numericalRange.toString() : itemp.numericalRange} style={{ width: 100,marginLeft:10 }}  onChange={this.typeChange1.bind(this,index,indexp)}>
                                                                {
                                                                    (contentList || []).map((item, index) => {
                                                                        return (
                                                                            <Option value={item.id} key={index}> {item.name} </Option>
                                                                        )
                                                                    })
                                                                }
                                                            </Select>
                                                            <div className={styles.freqFlexNew} style={{marginLeft:10}}>
                                                                <div>偏离值范围：</div>
                                                                <Input name='min' placeholder="请输入" value={itemp.min} style={{width:'120px'}}
                                                                addonAfter={itemp.type == 0 ? 'db' : '%'} onChange={this.inputChangeIndexSmall.bind(this,index,indexp)}/>
                                                                <div>~</div>
                                                                <Input  name='max' addonAfter={itemp.type == 0 ? 'db' : '%'} placeholder="请输入" value={itemp.max}  style={{width:'120px'}}
                                                                onChange={this.inputChangeIndexSmall.bind(this,index,indexp)}/>
                                                            </div>
                                                               <Button type='danger' style={{marginLeft:10}} onClick={()=>this.deleteSmall(index,indexp)}>删除参数设置</Button>  
                                                        </div>

                                                    </div>
                                                )
                                            })
                                        }   
                                        <BtnWrap>
                                            <Button type='primary' onClick={()=>this.addSmall(index)}>新增参数设置</Button>
                                        </BtnWrap> 
                                        <Button type='danger' style={{width:'100%'}} onClick={()=>this.deleteBig(item,index)}>删除相关频段设置</Button>

                                    </div>
                                )
                            })
                        }



                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.addBig()}>新增相关频段设置</Button>
                    </BtnWrap>

                </Modal>
            
            {/* 查看弹窗 */}
                <Modal
                    title="多频段对比详情"
                    visible={this.state.viewVisible}
                    onOk={this.freqCancel}
                    onCancel={this.freqCancel}
                    width='40%'
                    okText = "确认"
                    cancelText = "取消"
                >
                     <div className={styles.gradeflex} style={{fontSize:20}}>
                            <div>品质等级名称：{qualityName}</div>
                        </div>
                        {
                            (detailDtoList || []).map((item,index)=>{
                                return (
                                    <div style={{border:'1px solid #E33B2F',padding:'5px 5px',marginBottom:10,borderRadius:5,fontSize:16}} key={index}>
                                        <div>开始频段~结束频段(Hz):{item.freq1}~{item.freq2}</div>
                                        <div>可忽略密度值小于(%)：{item.ignoreDensity}%</div>
                                        
                                        {
                                            (item.itemDtoList || []).map((itemp,indexp)=>{
                                                return (
                                                    <div key={indexp}>
                                                        <div>{itemp.type == 0? '能量' :'密度'} {itemp.numericalRange == 0? '正':"负"}偏离值范围：{itemp.min}~{itemp.max}{itemp.type == 0 ? 'db' : '%'}</div>
                                                    </div>
                                                )
                                            })
                                        }   

                                    </div>
                                )
                            })
                        }

                </Modal>

            </div>

          
        )
    }
}

export default bzFrequency;