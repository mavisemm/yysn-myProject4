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
        modeId:"",
        groupId:"",
        name:"",
        color:'',
        templateId:"",
        standardFrequencyDtoList:[],
        detailDtoList: [],
        detailSpecialDtoList: [],
        userType:'add',
        currentIndex:'',
        startFrequency:"",
        endFrequency:"",
        standardfrequencyList:[],
        startplArr:[],
        endplArr:[],
        dbRangeLow:'',
        dbRange:'',
        densityRangeLow:'',
        densityRange:'',
        dbForwardMaxValue: '',
        dbForwardMinValue: '',
        dbReverseMaxValue: '',
        dbReverseMinValue: '',
        densityForwardMaxValue: '',
        densityForwardMinValue: '',
        densityReverseMaxValue: '',
        densityReverseMinValue: '',
        qualityType:"",
        confirmFlag:false,
        deleteIndex:''
    }
    componentDidMount() {
        const {standardFrequencyDtoList,standardfrequencyList} = this.props;
        this.setState({
            standardFrequencyDtoList,
            standardfrequencyList,
        }, () => {
            this.dealMax(standardfrequencyList)
        })
    }

     componentWillReceiveProps(newProps) {
        const {standardFrequencyDtoList,standardfrequencyList} = newProps;
        this.setState({
            standardFrequencyDtoList,
            standardfrequencyList,
        },()=>{
            this.dealMax(standardfrequencyList)
        })
     }
    //  处理开始频率，结束频率
    dealMax = (standardfrequencyList) => {
        let freq1Arr = [];
        let freq2Arr = [];
        if (standardfrequencyList.length){
            for (let i = 0; i < standardfrequencyList.length; i++) {
                let temp = standardfrequencyList[i];
                freq1Arr.push(temp.freq1);
                freq2Arr.push(temp.freq2);
            }
        }
        this.setState({
            freq1Arr,
            freq2Arr
        },()=>{
            this.caculateInitial();
        })
    }
    //  =========频段设置开始===========
     // 新增频段名称
    add = ()=>{
        this.setState({
            startFrequency:"",
            endFrequency:"",
            dbRange:'',
            dbRangeLow:"",
            densityRangeLow:"",
            densityRange:"",
            ignoreDensity:"",
            detailDtoList:[],
            detailSpecialDtoList:[],
            freqVisible: true,
            userType:'add'
        })
    }
    // 编辑信息
    edit=(record,index,type)=>{
        const {startFrequency,endFrequency,ignoreDensity,detailDtoList,detailSpecialDtoList,confirmFlag} = record;
        // console.log(record,'record')
        this.setState({
            currentIndex:index,
            startFrequency,
            endFrequency,
            ignoreDensity,
            detailDtoList,
            detailSpecialDtoList,
            userType:'edit',
            qualityType:'normal',
            confirmFlag,
            freqVisible:true,
        },()=>{
            this.caculate(startFrequency, endFrequency, index)
        })

    }

    // 新增品质等级
    addQuality = (type) =>{
        if(type){
            let arr = [{
                name:"",
                color:"",
                templateId:"",
                externalRelation:0,
                dbForwardMaxValue: '',
                dbForwardMinValue: '',
                dbReverseMaxValue: '',
                dbReverseMinValue: '',
                densityForwardMaxValue: '',
                densityForwardMinValue: '',
                densityReverseMaxValue: '',
                densityReverseMinValue: '',
            }]
            const {detailSpecialDtoList = []} = this.state;
            let arr1 = [...detailSpecialDtoList] || [];
            this.setState({
                detailSpecialDtoList: arr1.concat(arr),
            })
        }else{
            let arr = [{
                name:"",
                color:"",
                templateId:"",
                externalRelation:0,
                dbForwardValue:"",
                dbReverseValue:"",
                densityForwardValue:"",
                densityReverseValue:"",
            }]
            const {detailDtoList = []} = this.state;
            let arr1 = [...detailDtoList] || [];
            this.setState({
                detailDtoList: arr1.concat(arr),
            })
        }
   
    }
    modeChangeFreq = (index,type, e) => {
        const {detailDtoList,detailSpecialDtoList} = this.state;
        const {qualityList} = this.props;
        let name = '';
        let color = '';
        let templateId = '';
        for(let i = 0;i<qualityList.length;i++){
            if(qualityList[i].id == e){
                name = qualityList[i].name;
                color = qualityList[i].color;
                templateId = qualityList[i].id;
            }
        }
        if(type == 'special'){
            let arr1 = [...detailSpecialDtoList];
            arr1[index] = {
                ...arr1[index],
                name,
                color,
                templateId,
            }
            this.setState({
                detailSpecialDtoList: arr1,
            }) 
        }else{
            let arr1 = [...detailDtoList];
            arr1[index] = {
                ...arr1[index],
                name,
                color,
                templateId,
            }
            this.setState({
                detailDtoList: arr1,
            }) 
        }
     
    }
    // =======================================
    checkBoxChange = (e)=>{
        this.setState({
            confirmFlag: e.target.checked
        })
    }
    // 频段确认弹窗
    freqOk = ()=>{
        const {name,ignoreDensity,standardFrequencyDtoList,detailDtoList ,
        currentIndex,userType,startFrequency,endFrequency,dbRange,
        dbRangeLow,densityRange,densityRangeLow, detailSpecialDtoList,confirmFlag} = this.state;
          const numRegex = /^[+-]?\d+(\.\d+)?$/;
        if (startFrequency == '' || endFrequency == '' || ignoreDensity == '') {
            message.error('请检查声音频段是否填写!可忽略密度值是否填写！')
            return false;
        }
        if (!numRegex.test(startFrequency) || !numRegex.test(endFrequency) || !numRegex.test(ignoreDensity)) {
            message.error('开始频率、结束频率、可忽略密度值必须是合法的数字（包括浮点数）！');
            return;
        }
        if (Number(startFrequency) > Number(endFrequency)) {
            message.error('开始频率不能大于结束频率！');
            return false;
        }

        if(detailDtoList.length){
            for (let i = 0; i < detailDtoList.length; i++) {
                let obj = detailDtoList[i];
                if ((obj.dbForwardValue == '' && obj.dbReverseValue == '' && obj.densityForwardValue == '' && obj.densityReverseValue == '') || obj.templateId == '') {
                     message.error('请检查品质等级相关条件是否还未设置！');
                     return false;
                }
                for (var key in obj) {
                    if (key === 'name' || key === 'color') {

                    } else {
                        if (obj[key]) {
                            if (!numRegex.test(obj[key])) {
                                message.error('请检查输入是否合法!')
                                return false;
                            }
                        }
                    }

                }
            }
        }
        if(detailSpecialDtoList.length){
            for (let i = 0; i < detailSpecialDtoList.length; i++) {
                let obj = detailSpecialDtoList[i];
                if ((obj.dbForwardMaxValue == '' && obj.dbForwardMinValue == '' && obj.dbReverseMaxValue == '' && obj.dbReverseMinValue == '' && obj.densityForwardMaxValue == '' && obj.densityForwardMinValue == '' 
                && obj.densityReverseMaxValue == '' && obj.densityReverseMinValue == '') || obj.templateId == '') {
                    message.error('请检查特殊品质等级相关条件是否还未设置！');
                    return false;
                }
                for (var key in obj) {
                  if (key === 'name' || key === 'color') {
                
                   }else{
                        if (obj[key]) {
                            if (!numRegex.test(obj[key])) {
                                message.error('请检查输入是否合法!')
                                return false;
                            }
                        }
                   }
            
                }

            }
        }

        if(detailDtoList.length == 0 && detailSpecialDtoList.length == 0){
            message.error('品质等级或者特殊品质等级未设置！')
            return false;
        }
  
       
        if(userType == 'add'){
            let arr = [...standardFrequencyDtoList];
            let paramsArr = [{
                startFrequency,
                endFrequency,
                ignoreDensity,
                detailDtoList,
                detailSpecialDtoList,
                dbRange,
                dbRangeLow,
                densityRange,
                densityRangeLow,
                confirmFlag,
                show:false,
            }]
            this.setState({
                standardFrequencyDtoList:arr.concat(paramsArr),
                freqVisible:false,
            })
            // console.log(arr.concat(paramsArr),'提交参数')
            // return false;
            this.props.parent.getFreqSet(this, arr.concat(paramsArr));
         }else{
            // 编辑
            let arr = [...standardFrequencyDtoList];
            arr[currentIndex]={
                ...arr[currentIndex],
                startFrequency,
                endFrequency,
                ignoreDensity,
                detailDtoList,
                detailSpecialDtoList,
                confirmFlag
            }
            this.setState({
                standardFrequencyDtoList:arr,
                freqVisible:false,
            })
            this.props.parent.getFreqSet(this, arr);
         }  
       
        
    }
    freqCancel = ()=>{
        this.setState({
            freqVisible:false,
        })
    }
    inputChangeIndex = (index,type,e)=>{
        const {detailDtoList = [],detailSpecialDtoList=[]} = this.state;
        let arr = [];
        if(type == 'special'){
            arr = [...detailSpecialDtoList];
            arr[index]={
                ...arr[index],
                [e.target.name]: e.target.value
            }
            this.setState({
                detailSpecialDtoList: arr
            })
        }else{
            arr = [...detailDtoList];
            arr[index]={
                ...arr[index],
                [e.target.name]: e.target.value
            }
            this.setState({
                detailDtoList: arr
            })
        }
    }
    // ==========频段设置结束============

    switchChangeOr = (index,type,checked)=>{
        const {detailSpecialDtoList=[]} = this.state;
        let arr = [];
        if(type == 'special'){
            arr = [...detailSpecialDtoList];
            arr[index]={
                ...arr[index],
                externalRelation:checked ? 1 : 0,
            }
            this.setState({
                detailSpecialDtoList: arr
            })
        }
    }
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })

    }
    caculateInitial = () =>{
        const {standardFrequencyDtoList} = this.state;
        for(let i = 0;i<standardFrequencyDtoList.length;i++){
            let temp = standardFrequencyDtoList[i];
            this.caculate(temp.startFrequency,temp.endFrequency,i);
        }
    }

    caculateClick = () => {
        const {freq1Arr,freq2Arr,standardfrequencyList,startFrequency,endFrequency } = this.state;
        if (startFrequency == '' || endFrequency == '') {
            message.error('请检查声音频段是否填写!')
            return false;
        }
        if (Number(startFrequency) > Number(endFrequency)) {
            message.error('开始频率不能大于结束频率！');
            return false;
        }
        this.caculate(startFrequency,endFrequency);
       
    }

    caculate = (startFrequency, endFrequency,index) => {
        const {freq1Arr,freq2Arr,standardfrequencyList,standardFrequencyDtoList} = this.state;
        let arr = [...standardFrequencyDtoList];
        if (freq1Arr.length) {
            freq1 = this.findClosestNumberInArray(startFrequency, freq1Arr);
            freq2 = this.findClosestNumberInArray(endFrequency, freq2Arr);
            if (freq1 && freq2) {
                let k = 0;
                let m = 0;
                for (let i = 0; i < standardfrequencyList.length; i++) {
                    let temp = standardfrequencyList[i];
                    if (freq1 == temp.freq1) {
                        k = i;
                    }
                    if (freq2 == temp.freq2) {
                        m = i;
                    }
                }
                let tempArr = standardfrequencyList.slice(k, m);
                let len = tempArr.length;
                let dbArr = this.sortByElement(tempArr, 'db');
                let densityArr = this.sortByElement(tempArr, 'density');
                if (tempArr.length) {
                    let dbRangeLow = dbArr[0].db;
                    let dbRange = dbArr[len - 1].db;
                    let densityRangeLow = densityArr[0].density;
                    let densityRange = densityArr[len - 1].density;
                    if(index || index == 0){
                        arr[index] = {
                            ...arr[index],
                            dbRangeLow,
                            dbRange,
                            densityRangeLow,
                            densityRange
                        }
                        this.setState({
                            standardFrequencyDtoList:arr,
                            dbRangeLow,
                            dbRange,
                            densityRangeLow,
                            densityRange,
                        })
                    }else{
                        this.setState({
                            dbRangeLow,
                            dbRange,
                            densityRangeLow,
                            densityRange,
                        })
                    }
             
                }

            }

        }
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

    findClosestNumberInArray =(target, arr)=> {
        // 先对数组进行排序
        arr.sort(function (a, b) {
            return a - b;
        });

        var minDiff = Infinity;
        var closest;

        // 遍历数组，找到与target差值最小的元素
        for (var i = 0; i < arr.length; i++) {
            var diff = Math.abs(arr[i] - target);
            if (diff < minDiff) {
                minDiff = diff;
                closest = arr[i];
            }
        }

        return closest;
    }

    // 删除频率明细
    deleteQualityFreqDetail = (record,index,type)=>{
        const {userType,detailDtoList,detailSpecialDtoList} = this.state;
        if(type){
            let arr = [...detailSpecialDtoList];
            arr.splice(index, 1);
            this.setState({
                detailSpecialDtoList: arr
            })
        }else{
            let arr = [...detailDtoList];
            arr.splice(index, 1);
            this.setState({
                detailDtoList: arr
            })
        }
    }

    delete = () => {
        const {standardFrequencyDtoList,deleteIndex} = this.state;
        let arr = [...standardFrequencyDtoList]
        arr.splice(deleteIndex, 1);
        this.setState({
            standardFrequencyDtoList: arr,
        })

        this.props.parent.getFreqSet(this, arr);
    }

    deleteMode = (index)=>{
        this.setState({
            deleteIndex:index
        })
    }

    // 展开查看
    open = (item,index,type)=>{
        const {standardFrequencyDtoList} = this.state;
        let arr = [...standardFrequencyDtoList];
        arr[index] = {
            ...arr[index],
            show:!item.show
        }
        this.setState({
            standardFrequencyDtoList:arr
        })
       
    }

    render(){
        const columnFreq = [
            {
                title: '品质等级',
                dataIndex: 'name',
            },
            {
                title: '能量正偏离>=(db)',
                dataIndex: 'dbForwardValue',
            }, {
                title: '能量负偏离>=(db)',
                dataIndex: 'dbReverseValue',
            },
            {
                title: '密度正偏离>=(%)',
                dataIndex: 'densityForwardValue',
            }, {
                title: '密度负偏离>=(%)',
                dataIndex: 'densityReverseValue',
            },
       
        ];
        const columnFreqSpecial = [
            {
                title: '特殊品质等级',
                dataIndex: 'name',
            },
            {
                title: '能量正偏离(db)',
                dataIndex: 'dbForwardMinValue',
                render: (text, record,index) => (
                    <span>
                        {record.dbForwardMinValue} ~ {record.dbForwardMaxValue}
                    </span>
                ),
            }, 
            {
                title: '能量负偏离(db)',
                dataIndex: 'dbReverseMinValue',
                render: (text, record,index) => (
                    <span>
                         {record.dbReverseMinValue} ~ {record.dbReverseMaxValue}
                    </span>
                ),
            },
            {
                title: '密度正偏离(%)',
                dataIndex: 'densityForwardMinValue',
                render: (text, record,index) => (
                    <span>
                           {record.densityForwardMinValue} ~ {record.densityForwardMaxValue}
                    </span>
                ),
            }, {
                title: '密度负偏离(%)',
                dataIndex: 'densityReverseMinValue',
                render: (text, record,index) => (
                    <span>
                         {record.densityReverseMinValue} ~ {record.densityReverseMaxValue}
                    </span>
                ),
            },
            {
            title: '能量、密度关联性',
            dataIndex: 'externalRelation',
            render: (text, record,index) => (
                <span>
                    {record.externalRelation == 0 ? '或' : '且'}
                </span>
            ),
            },
       
        ];
        const {ignoreDensity,name,id ,standardFrequencyDtoList,detailDtoList,startFrequency,endFrequency,densityRange,
        dbRange,dbRangeLow,densityRangeLow,detailSpecialDtoList,confirmFlag } = this.state;
        return (
            <div style={{width:'100%',fontSize:16}}>
                <BtnWrap>
                    <Button type = "primary" onClick={()=>this.add()}> 新增频段品质等级 </Button>
                </BtnWrap>
                {
                    (standardFrequencyDtoList || []).map((item,index)=>{
                        return (
                            <div key={index} style={{marginBottom:5}}>
                                <div>{item.startFrequency} - {item.endFrequency}Hz &nbsp;&nbsp;&nbsp;&nbsp;< Button type='primary' onClick={()=>this.open(item,index,'')}>展开 </Button> < Button type='primary' onClick={()=>this.edit(item,index,'')}> 编辑 </Button>
                                <Popconfirm placement="topLeft" title='确认删除吗？' onConfirm={this.delete.bind(this)} okText="确定" cancelText="取消">
                                 < Button type='danger' style={{marginLeft:10}} onClick={()=>this.deleteMode(index)}> 删除 </Button>
                                 </Popconfirm> 
                                </div>
                                {
                                    item?.show  && 
                                    <div>
                                        <div>标准能量范围：{item.dbRangeLow} ~ {item.dbRange},标准密度范围：{item.densityRangeLow} ~ {item.densityRange}&nbsp;&nbsp; <Checkbox checked={item?.confirmFlag} disabled>确定合格</Checkbox></div>
                                        {
                                            (item.detailDtoList && item.detailDtoList.length!=0) && <Table rowKey={record => record.id}  columns={columnFreq} dataSource={item.detailDtoList || []} pagination={false}/>
                                        }
                                        {
                                            (item.detailSpecialDtoList && item.detailSpecialDtoList.length!=0) && <Table rowKey={record => record.id}  columns={columnFreqSpecial} dataSource={item.detailSpecialDtoList || []} pagination={false}/>
                                        }
                                    </div>
                                }
                                

                            </div>
                        )
                    })
                }

                {/* 频段声音管理 */}
                <Modal
                    title="声音频段品质等级"
                    visible={this.state.freqVisible}
                    onOk={this.freqOk}
                    onCancel={this.freqCancel}
                    okText = "确认"
                    cancelText = "取消"
                >
                    <div className={styles.freqFlex}>
                        <Input name='startFrequency' addonBefore='开始频段' placeholder="请输入开始频段" value={startFrequency} style={{width:'200px'}}
                        addonAfter='Hz' onChange={this.inputChange.bind(this)}/>
                        <div>~</div>
                        <Input  name='endFrequency' addonBefore='结束频段' addonAfter='Hz' placeholder="请输入结束频段" value={endFrequency}  style={{width:'200px'}}
                        onChange={this.inputChange.bind(this)}/>
                    </div>
                    <Input addonBefore="可忽略密度值小于：" addonAfter='%' style={{width:'250px',marginTop:5}} name='ignoreDensity' placeholder="请输入" value={ignoreDensity}
                    onChange={this.inputChange.bind(this)}/>
                    <div style={{marginTop:5}}><Button type='primary' onClick={()=>{this.caculateClick()}}>计算标准范围</Button> 标准能量范围(db)：{dbRangeLow} ~ {dbRange}&nbsp; &nbsp;&nbsp;&nbsp;标准密度范围(%)：{densityRangeLow} ~ {densityRange}</div>
                    {
                        (detailDtoList || []).map((item,index)=>{
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div style={{color:item.color}}>品质等级名称：</div>
                                         <Select value={item.name} style={{ width: 300 }}  onChange={this.modeChangeFreq.bind(this,index,'normal')}>
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
                                       <Checkbox  className={styles.gradeflex} checked={item.dbForwardValue ? true :false}>
                                         <Input addonBefore="能量正偏离值(>=)" style={{width:'200px',}} name='dbForwardValue' placeholder="请输入" value={item.dbForwardValue}
                                        addonAfter='db'  onChange={this.inputChangeIndex.bind(this,index,'normal')}/>
                                       </Checkbox> 
                                    }
                                    {
                                        <Checkbox   className={styles.gradeflex} checked={item.dbReverseValue ? true :false}>
                                           <Input addonBefore="能量负偏离值(>=)" style={{width:'200px'}} name='dbReverseValue' placeholder="请输入" value={item.dbReverseValue}
                                            addonAfter='db'  onChange={this.inputChangeIndex.bind(this,index,'normal')}/>
                                       </Checkbox> 
                                    }
                                    {
                                        <Checkbox  className={styles.gradeflex} checked={item.densityForwardValue ? true :false}>
                                          <Input addonBefore="密度正偏离值(>=)" style={{width:'200px'}} name='densityForwardValue' placeholder="请输入" value={item.densityForwardValue} addonAfter='%'
                                            onChange={this.inputChangeIndex.bind(this,index,'normal')}/> 
                                       </Checkbox> 
                                    }
                                    {
                                         <Checkbox  className={styles.gradeflex} checked={item.densityReverseValue ? true :false}>
                                            <Input addonBefore="密度负偏离值(>=)" style={{width:'200px'}} name='densityReverseValue' placeholder="请输入" value={item.densityReverseValue} addonAfter='%'
                                            onChange={this.inputChangeIndex.bind(this,index,'normal')}/> 
                                       </Checkbox> 
                                    }
                                    <Button type='danger' style={{width:'100%'}} onClick={()=>this.deleteQualityFreqDetail(item,index)}>删除此等级</Button>
                                </div>
                            )
                        })
                    }



                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.addQuality()}>新增品质等级信息</Button>
                    </BtnWrap>
                    

                    {
                        (detailSpecialDtoList || []).map((item,index)=>{
                            return (
                                <div key={index}>
                                    <div className={styles.gradeflex}>
                                        <div style={{color:item.color}}>特殊品质等级名称：</div>
                                            <Select value={item.name} style={{ width: 300 }}  onChange={this.modeChangeFreq.bind(this,index,'special')}>
                                            {
                                                (this.props.qualityList || []).map((item, index) => {
                                                    return (
                                                        <Option value={item.id} key={index}> {item.name} </Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    </div>
                                    <div className={styles.freqFlexSpecial}>
                                        <div>能量正偏离值范围：</div>
                                        <Input name='dbForwardMinValue'  placeholder="请输入" value={item.dbForwardMinValue} style={{width:'100px'}}
                                        addonAfter='db' onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                        <div>&nbsp;&nbsp;~&nbsp;&nbsp;</div>
                                        <Input name='dbForwardMaxValue' addonAfter='db' placeholder="请输入" value={item.dbForwardMaxValue}  style={{width:'100px'}}
                                        onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                    </div>
                                    <div className={styles.freqFlexSpecial}>
                                        <div>能量负偏离值范围：</div>
                                        <Input name='dbReverseMinValue'  placeholder="请输入" value={item.dbReverseMinValue} style={{width:'100px'}}
                                        addonAfter='db' onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                        <div>&nbsp;&nbsp;~&nbsp;&nbsp;</div>
                                        <Input name='dbReverseMaxValue' addonAfter='db' placeholder="请输入" value={item.dbReverseMaxValue}  style={{width:'100px'}}
                                        onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                    </div>
                                    <div className={styles.freqFlexSpecial}>
                                        <div>密度正偏离值范围：</div>
                                        <Input name='densityForwardMinValue'  placeholder="请输入" value={item.densityForwardMinValue} style={{width:'100px'}}
                                        addonAfter='%' onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                        <div>&nbsp;&nbsp;~&nbsp;&nbsp;</div>
                                        <Input name='densityForwardMaxValue' addonAfter='%' placeholder="请输入" value={item.densityForwardMaxValue}  style={{width:'100px'}}
                                        onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                    </div>
                                    <div className={styles.freqFlexSpecial}>
                                        <div>密度负偏离值范围：</div>
                                        <Input name='densityReverseMinValue'  placeholder="请输入" value={item.densityReverseMinValue} style={{width:'100px'}}
                                        addonAfter='%' onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                        <div>&nbsp;&nbsp;~&nbsp;&nbsp;</div>
                                        <Input name='densityReverseMaxValue' addonAfter='%' placeholder="请输入" value={item.densityReverseMaxValue}  style={{width:'100px'}}
                                        onChange={this.inputChangeIndex.bind(this,index,'special')}/>
                                    </div>
                                    <div  style={{margin:'10px 0'}}>
                                        能量偏离与密度偏离的关联性：
                                        <Switch checked={item.externalRelation == 0 ? false : true}  checkedChildren="且" unCheckedChildren="或"  onChange={this.switchChangeOr.bind(this,index,'special')} />
                                    </div>
                                    <Button type='danger' style={{width:'100%'}} onClick={()=>this.deleteQualityFreqDetail(item,index,'special')}>删除此特殊品质等级</Button>
                                </div>
                            )
                        })
                    }

                    <BtnWrap>
                        <Button type='primary' onClick={()=>this.addQuality('special')}>新增特殊品质等级信息</Button>
                        <span style={{color:'red'}}>提示：特殊品质等级的优先级高于上方品质等级的设置 </span>
                    </BtnWrap>

                    <Checkbox checked={confirmFlag} onChange={this.checkBoxChange.bind(this)}>确定合格</Checkbox>

                </Modal>

           

            </div>

          
        )
    }
}

export default bzFrequency;