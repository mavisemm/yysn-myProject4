
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch ,BackTop,Tabs } from 'antd';

import {service} from './service';
import styles from './standardStore.less';
import SearchPage from '@src/pages/acomponents/report';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'standardStore';
const { MonthPicker, RangePicker } = DatePicker;
import echartsOption from '@src/pages/acomponents/optionEcharts';
import moment from 'moment';
import echarts from 'echarts';
import { result } from 'lodash';
const TabPane = Tabs.TabPane;
import SideBar from '@src/pages/sideBar';
import comm from '@src/config/comm.config.js';
let myEchartsDensity = null;
let myEchartsDb = null;
let myEchartsSingle = null;
let myEchartsFullScreen = null;
let singleTotalArr = [];
let filePath = '';


let XARR = [];
let finallydbArr = [];
let finallydensityArr = [];
let echartsClickData = [];

@connect(({standardStore}) => ({standardStore}))
class standardStore extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            selectedRowKeysCycle:[],
            loading: false,
            cycleType: '',
            machineId: '',
            receiverId: '',
            recordId: "",
            speed: '',
            tableData:[],
            singleDataVisible:false,
            standardLineVisible:false,
            detailDtoList:[],//选定记录列表
        }
    }
    componentDidMount(){
        const {standardStore} = this.props;
        const {qualityList,deviationList,pointList} = standardStore;
        this.setState({
            qualityList,
            deviationList,
            pointList
        })
    }
    componentWillReceiveProps(newProps) {
        const {standardStore} = {...newProps};
        const {qualityList,deviationList,pointList} = standardStore;
        this.setState({
            qualityList,
            deviationList,
            pointList
        })
    }
    componentWillUnmount() {
        this.disposeEcharts();
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
            singleDataVisible:false,
            partCompareVisible:false,
            fullScreenVisible:false,
            allDataVisible:false,
            clickChartVisible:false,
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
   
    lookEcharts = ()=>{
        const {detailDtoList} = this.state;
        let recordIdList = [];
        // 1.全选，2全不选
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        this.getSingle(recordIdList);
    }

    chooseBox = (type) => {
        const {tableData} = this.state;
        let detailDtoList = [];
        let recordIdList = [];
        let selectedRowKeys = [];
        // 1.全选，2全不选
        for (let i = 0; i < tableData.length; i++) {
            selectedRowKeys.push(tableData[i].id);
            detailDtoList.push({
                groupId: tableData[i].groupId,
                recordId: tableData[i].id,
                 receiverId: tableData[i].receiverId
            })
            recordIdList.push(tableData[i].id)
        }
        if(type == 1){
            this.setState({
                selectedRowKeys,
                detailDtoList,
                selectedRows:tableData,
            })
        }else{
            this.setState({
                selectedRowKeys:[],
                detailDtoList: [],
                allCaculteData:[]
            })
            singleTotalArr = [];
        }
    }
    onSelectChange = (selectedRowKeys, selectedRows) => {
        let detailDtoList = [];
        for(let i = 0;i<selectedRows.length;i++){
            detailDtoList.push({
                groupId: selectedRows[i].groupId,
                recordId: selectedRows[i].id,
                receiverId:selectedRows[i].receiverId
            })
        }
        this.setState({
            selectedRowKeys,
            selectedRows,
            detailDtoList
        })
    }
    onSelectChangeAll = (selectedRowKeys, selectedRows) => {
        // console.log(selectedRowKeys,selectedRows)
        this.setState({
            selectedRowKeysAll:selectedRowKeys,
            allCaculteDataChecked:selectedRows,
        })
    }


    // // 示例用法
    // const originalArray = [1, 2, 2, 3, 4, 4, 5];
    // const uniqueArray = removeDuplicates(originalArray);
    // console.log(uniqueArray); // 输出 [1, 2, 3, 4, 5]

    getSingle = (recordIdList) => {
        let recordIdListArr = [];
        const {switchAllShow,allCaculteData,selectedRows,allCaculteDataChecked} = this.state;
        if(switchAllShow){
            let result = this.findDifferentIds(selectedRows,allCaculteData);
            let newArr = result.concat(allCaculteDataChecked);
            for(let i = 0;i<newArr.length;i++){
                recordIdListArr.push(newArr[i].id)
            }
        }else{
            recordIdListArr = recordIdList;
        }

        this.setState({
            standardLineVisible: false
        })
        singleTotalArr = [];
        let cycleList= [];
        const {receiverId} = this.state;
        // console.log(recordIdListArr,'000')
        let params = {
            receiverId,
            recordIdList: this.removeDuplicates(recordIdListArr)
        }
        if(recordIdListArr.length){
            service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {  
                     singleTotalArr = [];
                       let ret = res.ret.responseList || [];
                       let freqs = res.ret.freqs || [];
                       XARR = freqs.map(item => (item.toFixed(0)));
                       for(let i = 0;i<ret.length;i++){
                           cycleList = cycleList.concat(ret[i].cycleList || []);
                           let dbArray = ret[i].dbArray || [];
                           let densityArray = ret[i].densityArray || [];
                           singleTotalArr.push({
                               id:ret[i].recordId,
                               detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                               machineNo: ret[i].machineNo || '',
                               densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                               dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(5)))
                           })
                       }
                         this.setState({
                            cycleList
                         })
                        this.dealEcharts();
                } else {
                    message.error(res.err);
                }
            })
        }else{
             this.dealEcharts();
        }
        
       
    }

    dealEcharts = ()=>{
        this.disposeEcharts();
        const {AvgLineShow} = this.state;
        if (AvgLineShow){
            this.dealLine();
        }
        let that = this;
       
       
    }

   
    // 全屏查看
    lookFullScreen = (type)=>{
        this.setState({
            fullScreenVisible:true,
        },()=>{
             if (type == 1) {
                 // 能量频率曲线
                 if (this.echartsBoxFullScreen) {
                     if (myEchartsFullScreen == null) {
                         myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                     }
                     if (myEchartsFullScreen) {
                         let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                         optionDb.xAxis[0].data = XARR || [];
                         optionDb.series = finallydbArr || [];
                         myEchartsFullScreen.setOption(optionDb)
                        //  myEchartsFullScreen.on('finished', () => {
                        //      if (myEchartsFullScreen) {
                        //          myEchartsFullScreen.resize()
                        //      }

                        //  })
                     }
                 }
             } else {
                 // 密度频率曲线
                 if (this.echartsBoxFullScreen) {
                     if (myEchartsFullScreen == null) {
                         myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                     }
                     if (myEchartsFullScreen) {
                         let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                         optionDensity.xAxis[0].data = XARR || [];
                         optionDensity.series = finallydensityArr || [];
                         myEchartsFullScreen.setOption(optionDensity)
                        //  myEchartsFullScreen.on('finished', () => {
                        //      if (myEchartsFullScreen) {
                        //          myEchartsFullScreen.resize()
                        //      }

                        //  })
                     }
                 }
             }
        })
       
    }


   
    // 播放声音
    playAudio = (record,index)=>{
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
       this.setState({
        filePath
       })
    }
    // 查看某条记录的频率数据图
    lookData=(record,index)=>{
        filePath = comm.audioUrl + '?recordId=' + record.id + '&receiverId=' + record.receiverId;
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
                             dbArr.push(data[i].db.toFixed(5));
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

    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }
  
    render(){
        const tableStyle = {
            bordered: false,
            loading: false,
            pagination:{
                defaultPageSize:30,
            },
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
                title: '品质等级',
                dataIndex: 'qualityName',
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record,index) => (
                    <span>
                        < Button onClick={()=>this.lookData(record,index)}> 查看曲线图 </Button>
                        < span className = "ant-divider" />
                        < Button onClick={()=>this.playAudio(record,index)}> 播放声音 </Button>
                    </span>
                ),
            }
        ];
         
        const { loading, selectedRowKeys ,selectedRowKeysCycle,selectedRowKeysAll,} = this.state;
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections:true,
            onChange: this.onSelectChange,
        };

        const rowSelectionAll = {
            selectedRowKeys:selectedRowKeysAll,
            hideDefaultSelections:true,
            onChange: this.onSelectChangeAll,
        };
        const rowSelectionCycle = {
            selectedRowKeys:selectedRowKeysCycle,
            onChange: this.onSelectChangeCycle,
        }
        const {
            tableData,
            filePath,customerName
        } = this.state;
    return (
        <Page title='报告导出' className="pageLayoutRoot">
            {/* < SideBar parent={this}></SideBar>
            <div className={styles.body} style={{marginLeft:160,width:'90%'}}> */}
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
            <div className={styles.body}>
            <div style={{marginLeft:10}}>
                <div className={styles.typeflex}>
                    <div>客户名称：</div>
                    <Input style={{width:200}} placeholder="请输入" name="customerName" value={customerName}
                    onChange={this.inputChange.bind(this)}/>
                </div>
                <div className={styles.typeflex}>
                    <div>测试对象：</div>
                    <Input style={{width:200}} placeholder="请输入" name="customerName" value={customerName}
                    onChange={this.inputChange.bind(this)}/>
                </div>
                <div className={styles.typeflex}>
                    <div>测试时长：</div>
                    <Input style={{width:200}} placeholder="请输入" name="customerName" value={customerName}
                    onChange={this.inputChange.bind(this)}/>
                </div>
                <div className={styles.typeflex}>
                    <div>测试转速：</div>
                    <Input style={{width:200}} placeholder="请输入" name="customerName" value={customerName}
                    onChange={this.inputChange.bind(this)}/>
                </div>
            </div>
                <SearchPage parent={this}></SearchPage>
                {/* 能量密度 */}
                <BtnWrap>
                    {
                        selectedRowKeys.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                    }
                </BtnWrap>
                <Table {...tableStyle} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
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

             
            </div>
                </div>
            </div>
        </Page>
        
        )
    }
}

export default standardStore;
