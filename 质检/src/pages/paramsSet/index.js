
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch ,BackTop,Tabs } from 'antd';
import {service} from './service';
import styles from './paramsSet.less';
import SearchPage from '@src/pages/acomponents/searchPage';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'paramsSet';
const { MonthPicker, RangePicker } = DatePicker;
import echartsOption from '@src/pages/acomponents/optionEcharts';
import moment from 'moment';
import echarts from 'echarts';
const TabPane = Tabs.TabPane;
let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
let myEchartsFullScreen = null;
let singleTotalArr = [];
let filePath = '';
@connect(({paramsSet}) => ({paramsSet}))
class paramsSet extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            cycleType: '',
            machineId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            tableData:[],
            singleDataVisible:false,
            standardLineVisible:false,
            name:"",
            TableVisible:false,//列表形式查看标准曲线数据
            pointId:'',
            detectorId:"",
            total:0,
            switchShow:true,
            machineList:[],
            partCompareList:[],
            partCompareVisible:false,
            fullScreenVisible:false,
            startFrequency: "",
            endFrequency: "",
            frequencyCount: "",
            dbP: "",
            machineInfo:{},
        }
    }
    componentDidMount(){
        const {paramsSet} = this.props;
        const {machineList} = paramsSet;
        this.setState({
            machineList,
        })
    }
    componentWillReceiveProps(newProps) {
        const {paramsSet} = {...newProps};
        const {machineList} = paramsSet;
        this.setState({
            machineList,
        })
    }
    disposeEcharts = ()=>{
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }
        if (myEchartsDensity) {
            myEchartsDensity.dispose();
            myEchartsDensity = null;
        }
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
            
    }
    handleClose = () =>{
        this.setState({
            TableVisible:false,
            singleDataVisible:false,
            partCompareVisible:false,
            fullScreenVisible:false
        })
        if (myEchartsSingle) {
            myEchartsSingle.dispose();
            myEchartsSingle = null;
        }
        if (myEchartsFullScreen) {
            myEchartsFullScreen.dispose();
            myEchartsFullScreen = null;
        }
    }
      
    getList = (result,msg) =>{
        this.disposeEcharts();
        this.setState({
            standardLineVisible:false
        })
        const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,
            detectorId} = msg;
            let params = {
                ...msg
        }
        const {machineList } = this.state;
        for(let i = 0;i<machineList.length;i++){
            let temp = machineList[i];
            if(machineId == temp.id){
                const {startFrequency,endFrequency,frequencyCount,dbP} = temp;
                this.setState({
                    machineInfo:{
                        ...temp,
                    },
                    startFrequency, 
                    endFrequency, 
                    frequencyCount, 
                    dbP, 
                })
            }
        }
        service.getPointHistory(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let arr = [];
                if(res.ret){
                    let data = res.ret;
                    arr = data.map((item,index)=>{
                        return {
                            ...item,
                            index:index+1
                        }
                    })
                    this.setState({
                        tableData:arr,
                        total:arr.length,
                        cycleType,
                        machineId,
                        receiverId,
                        speed,
                        machineNo,
                        pointId,
                        detectorId
                    })
                }
           
            } else {
                message.error(res.err);
            }
        })
    }

    onSelectChange = (selectedRowKeys, selectedRows) => {
        if(selectedRows.length > 1){
            message.error('仅支持同时选择一条数据');
            return false
        }
        let recordIdList = []
        for (let i = 0; i < selectedRows.length; i++) {
            recordIdList.push(selectedRows[i].id)
        }
        if(selectedRows.length){
            this.getSingle(recordIdList);
            this.setState({
                selectedRowKeys,
            }, () => {
            });
        }else{
             this.setState({
                 selectedRowKeys,
             });
             this.disposeEcharts();
        }

    }
    getSingle = (recordIdList) => {
        singleTotalArr = [];
        const {receiverId} = this.state;
        let params = {
            receiverId,
            recordIdList
        }
         service.findFrequencyListByList(VtxUtil.handleTrim(params)).then(res => {
                 if (res.rc == 0) {       
                        let ret = res.ret;
                        let xArr = [];
                        let densityArr = [];
                        let dbArr = [];
                        for(let i = 0;i<ret.length;i++){
                            for(let j = 0;j<ret[i].frequencyDtoList.length;j++){
                                let temp = ret[i].frequencyDtoList[j];
                                xArr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                                densityArr.push(Number(temp.density.toFixed(3)));
                                if (temp.db == 0) {
                                    dbArr.push(undefined);
                                } else {
                                    dbArr.push(temp.db.toFixed(2));
                                }
                          
                            }
                        }
                        this.dealEcharts(xArr,densityArr,dbArr);
                 } else {
                     message.error(res.err);
                 }
             })
       
    }
    dealEcharts = (xArr, densityArr, dbArr) => {
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }
     
        if (this.echartsBoxDb) {
            if (myEchartsDb == null) {
                myEchartsDb = echarts.init(this.echartsBoxDb);
            }
            if (myEchartsDb) {
                let optionSingle = JSON.parse(JSON.stringify(echartsOption.optionSingle));
                optionSingle.xAxis[0].data = xArr || [];
                optionSingle.series[0].data = dbArr || [];
                optionSingle.series[1].data = densityArr || [];
                myEchartsDb.setOption(optionSingle)
                // myEchartsDb.on('finished', () => {
                //     if (myEchartsDb) {
                //         myEchartsDb.resize()
                //     }

                // })
            }
        }
    }

    // 保存
    calculateAgain = (record)=>{
        const { pointId,startFrequency, endFrequency, frequencyCount, dbP} = this.state;
        if (myEchartsDensity) {
            myEchartsDensity.dispose();
            myEchartsDensity = null;
        }
        let params = {
            recordId:record.id,
            receiverId: record.receiverId,
            tenantId,
            pointId,
            startFrequency, endFrequency, frequencyCount, dbP,
        };
        let obj = params;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                // 判断属性值是否为空
                if (obj[key] === '' || obj[key] === null) {
                message.error('请检查输入框内容是否填写完整')
                return false
                }
            }
        }
        service.calculateAgain(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                let frequencyDtoList = res.ret.frequencyDtoList;
                let xArr = [];
                let densityArr = [];
                let dbArr = [];
                for (let j = 0; j <frequencyDtoList.length; j++) {
                    let temp = frequencyDtoList[j];
                    xArr.push(Math.sqrt(Number(temp.freq1) * Number(temp.freq2)).toFixed(0));
                    densityArr.push(Number(temp.density.toFixed(3)));
                    if (temp.db == 0) {
                        dbArr.push(undefined);
                    } else {
                        dbArr.push(temp.db.toFixed(2));
                    }

                }
                if (this.echartsBoxDensity) {
                    if (myEchartsDensity == null) {
                        myEchartsDensity = echarts.init(this.echartsBoxDensity);
                    }
                    if (myEchartsDensity) {
                        let optionSingle = JSON.parse(JSON.stringify(echartsOption.optionSingle));
                        optionSingle.xAxis[0].data = xArr || [];
                        optionSingle.series[0].data = dbArr || [];
                        optionSingle.series[1].data = densityArr || [];
                        myEchartsDensity.setOption(optionSingle)
                        // myEchartsDensity.on('finished', () => {
                        //     if (myEchartsDensity) {
                        //         myEchartsDensity.resize()
                        //     }
                        // })
                    }
                }
            } else {
                message.error(res.err);
            }
        })
    }
    // 保存参数设置
    updateMachine = ()=>{
        const {startFrequency, endFrequency, frequencyCount, dbP,machineInfo} = this.state;
        let params = {
            ...machineInfo,
          startFrequency, endFrequency, frequencyCount, dbP
        }
        service.updateMachine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                 message.success('参数修改成功');
            } else {
                message.error(res.err);
            }
        })
    }
    
    // 查看某条记录的频率数据图
    lookData=(record,index)=>{
        filePath = record.filePath;
        this.setState({
            singleDataVisible:true
        })
        let params = {
            recordId:record.id,
            receiverId: record.receiverId
        }
        service.getSingleDataLine(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    let data = res.ret.frequencyDtoList || [];
                    let xArr = [];
                    let densityArr = [];
                    let dbArr = [];
                    for(let i = 0;i<data.length;i++){
                         xArr.push(Math.sqrt(Number(data[i].freq1) * Number(data[i].freq2)).toFixed(0));
                         densityArr.push(Number(data[i].density.toFixed(3)));
                         if (data[i].db == 0) {
                             dbArr.push(undefined);
                         } else {
                             dbArr.push(data[i].db.toFixed(2));
                         }
                    }
                    if (this.echartsBoxSingle) {
                        if (myEchartsSingle == null) {
                            myEchartsSingle = echarts.init(this.echartsBoxSingle);
                        }
                        if (myEchartsSingle) {
                             let optionSingle = JSON.parse(JSON.stringify(echartsOption.optionSingle));
                             optionSingle.xAxis[0].data = xArr || [];
                             optionSingle.series[0].data = dbArr || [];
                             optionSingle.series[1].data = densityArr || [];
                             myEchartsSingle.setOption(optionSingle)
                            //  myEchartsSingle.on('finished', () => {
                            //      if (myEchartsSingle) {
                            //          myEchartsSingle.resize()
                            //      }
                            //  })
                    }
                }
                    
                }
           
            } else {
                message.error(res.err);
            }
        })
    }

    // 分区声音比对
    partCompareData = (record,index)=>{
        const {pointId} = this.state;
        this.setState({
            partCompareVisible:true
        })
         let params = {
            recordId:record.id,
            pointId
        }
        service.comparePartition(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if(res.ret){
                    this.setState({
                        partCompareList: res.ret || [],
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    render(){
        const tableStyle = {
            bordered: true,
            loading: false,
            pagination: true,
            size: 'default',
            // rowSelection: {},
            scroll: undefined,
        }
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                title: '检测时间',
                dataIndex: 'detectTime',
                render: (text, record,index) => (
                    <span>
                        {record.detectTime ? moment(record.detectTime).format('YYYY-MM-DD HH:mm:ss') : ''}
                    </span>
                ),
            }, {
                title: '机型',
                dataIndex: 'machineTypeName',
            },
            {
                title: '采音时间(s)',
                dataIndex: 'listenTime',
            },
            
            {
                title: '设备编号',
                dataIndex: 'machineNo',
            },
            {
                title: '听音器名称',
                dataIndex: 'detectorName',
            },
            {
                title: '听筒名称',
                dataIndex: 'receiverName',
            },
            {
                title: '转速',
                dataIndex: 'speed',
            },
            {
                title: '正反转',
                dataIndex: 'type',
                render: (text, record,index) => (
                    <span>
                        {record.type == 0 ? '正转' : '反转'}
                    </span>
                ),
            },

            {
                title: '点位名称',
                dataIndex: 'pointName',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                        < Button onClick={()=>this.calculateAgain(record,index)}> 重新计算 </Button>
                        < span className = "ant-divider" />
                        < Button onClick={()=>this.lookData(record,index)}> 查看曲线图 </Button>
                        < span className = "ant-divider" />
                        < Button onClick={()=>this.partCompareData(record,index)}> 分区声音比对 </Button>
                    </span>
                ),
            }
        ];
         const columns1 = [
            {
                title: '频率(Hz)',
                dataIndex: '',
                render: (text, record,index) => (
                    <span>
                        {Math.sqrt(Number(record.freq1) * Number(record.freq2)).toFixed(0)}
                    </span>
                ),
            },
          
            {
                title: '能量(db)',
                dataIndex: 'db',
                render: (text, record,index) => (
                    <span>
                        {record.db.toFixed(2)}
                    </span>
                ),
            },
            {
                title: '密度(%)',
                dataIndex: 'density',
                render: (text, record,index) => (
                    <span>
                        {record.density.toFixed(3)}
                    </span>
                ),
            },
        ];
        
         const columnsPart = [
            {
                title: '开始频率(Hz)',
                dataIndex: 'startCount',
            },
            {
                title: '结束频率(Hz)',
                dataIndex: 'endCount',
            },
            {
                title: 'p',
                dataIndex: 'p',
            },
            {
                title: '度量值',
                dataIndex: 'value',
            },
    
        ];
        const { loading, selectedRowKeys} = this.state;
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections:true,
            onChange: this.onSelectChange,
        };

        const {
            tableData,
            standardfrequencyList,
            partCompareList,startFrequency,endFrequency,frequencyCount,dbP
        } = this.state;
    return (
            <div className={styles.body}>
                <SearchPage parent={this}></SearchPage>
                {/* 能量密度 */}
                <div className={styles.frequencyWidth} style={{border: '1px solid green' ,}}>
                    <div className={styles.frequencyWidthTitle}>能量、密度曲线</div>
                    <div className={styles.standStoreFlex}>
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDb = c
                                }
                            } 
                            style = {
                                {
                                    width: '100%',
                                    height: '300px',
                                }
                            }
                        /> 
                    </div>
                </div>

                 <div className={styles.frequencyWidth} style={{border: '1px solid green' ,}}>
                    <div className={styles.frequencyWidthTitle}>计算过后能量、密度曲线</div>
                    <div className={styles.standStoreFlex}>
                        <div ref = {
                                (c) => {
                                    this.echartsBoxDensity = c
                                }
                            }
                            style = {
                                {
                                    width: '100%',
                                    height: '300px',
                                }
                            }
                        /> 
                    </div>
                </div>
    
                <div className={styles.frequencyWidth} style={{border: '1px solid green' ,}}>
                    <div>
                        <Input addonBefore="开始频率(Hz)："  style={{width:200,}} placeholder="" value={startFrequency}
                            onChange={this.inputChange.bind(this)} name='startFrequency'/>
                        <Input addonBefore="结束频率(Hz)："   style={{margin:"0 10px",width:200,}} placeholder="" value={endFrequency}
                            onChange={this.inputChange.bind(this)} name='endFrequency'/>
                        <Input addonBefore="分段数量："    style={{width:200,}}  placeholder="" value={frequencyCount}
                            onChange={this.inputChange.bind(this)} name='frequencyCount'/>
                    </div>
                    <div style={{margin:"10px 0"}}>
                        <Input addonBefore="能量指数：" style={{width:200,}} placeholder="" value={dbP}
                            onChange={this.inputChange.bind(this)} name='dbP'/>
                    </div>
                   <Button  style={{backgroundColor:'green',color:'white',marginLeft:10}} onClick={()=>this.updateMachine()}><Icon type="save" />保存参数设置</Button>
                </div>
                <Table rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
                {/* 频率曲线图 */}
                < Modal title = "数据详情" 
                    visible = {this.state.singleDataVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                        <div className={styles.ZCAudioStyle}>
                            <audio  src={filePath} controls></audio>
                        </div>
                        
                        <div ref = {
                            (c) => {
                                this.echartsBoxSingle = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '400px',
                            }
                        }
                    /> 
                </Modal>

                {/* 标准库曲线 */}
                < Modal title = "标准曲线列表数据" 
                    visible = {this.state.TableVisible}
                    onOk = {()=>{this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                    <Table {...tableStyle}  columns={columns1} dataSource={standardfrequencyList} />
                </Modal>

                {/* 分区声音比对 */}
                < Modal title = "分区声音比对" 
                    visible = {this.state.partCompareVisible}
                    onOk = {()=>{this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="80%"
                    >
                    <Table {...tableStyle}  columns={columnsPart} dataSource={partCompareList} />
                </Modal>

                {/* 全屏查看 */}
                 < Modal title = "数据详情" 
                    visible = {this.state.fullScreenVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="98%"
                    >
                        <div ref = {
                            (c) => {
                                this.echartsBoxFullScreen = c
                            }
                        }
                        style = {
                            {
                                width: '100%',
                                height: '600px',
                            }
                        }
                    /> 
                </Modal>

                <BackTop />
             
            </div>
        )
    }
}

export default paramsSet;
