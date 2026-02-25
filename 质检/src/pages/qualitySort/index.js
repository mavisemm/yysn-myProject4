
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox,Pagination,Switch ,BackTop,Tabs,Popconfirm,Spin  } from 'antd';

import {service} from './service';
import styles from './auto.less';
import SearchPage from '@src/pages/acomponents/searchPage';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const namespace = 'auto';
const { MonthPicker, RangePicker } = DatePicker;

import echartsOption from '@src/pages/acomponents/optionEcharts';
import WeightAuto from '@src/pages/acomponents/weightAuto';
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

@connect(({qualitySort}) => ({qualitySort}))
class QualitySort extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            selectedRowKeys:[],
            loading: false,
            tableData:[],
            total:0,
            selectedRows:[],
            receiverId:'',
            groupList:[],
            juleiVisible:false,
            groupIndex:'',
            juleiData:[],
            detailDtoList:[],
            freqs:[]
        }
    }
    componentDidMount(){
  
    }
    componentWillReceiveProps(newProps) {
   
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
            fullScreenVisible:false,
            clickChartVisible:false,
            autoVisible:false
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
     // 处理echarts图数据
     echartsClick = (dataIndex, seriesName,type) => {
        echartsClickData = [];
        for (let i = 0; i < finallydbArr.length; i++) {
            echartsClickData.push({
                freq: seriesName,
                name: finallydbArr[i].name,
                db: finallydbArr[i].data[dataIndex],
                density: finallydensityArr[i].data[dataIndex],
            })
        }
        if (type == 'db') {
            echartsClickData.sort(this.compareEchartsClick('db'))
        } else {
            echartsClickData.sort(this.compareEchartsClick('density'))
        }
        this.setState({
            clickChartVisible: true
        })
    }
    compareEchartsClick = (property) => {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];

            return value2 - value1;
        }
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
                         let optionDb = JSON.parse(JSON.stringify(echartsOption.yDb));
                         optionDb.xAxis[0].data = XARR || [];
                         optionDb.series = finallydbArr || [];
                         myEchartsFullScreen.setOption(optionDb)
            
                     }
                 }
             } else {
                 // 密度频率曲线
                 if (this.echartsBoxFullScreen) {
                     if (myEchartsFullScreen == null) {
                         myEchartsFullScreen = echarts.init(this.echartsBoxFullScreen);
                     }
                     if (myEchartsFullScreen) {
                         let optionDensity = JSON.parse(JSON.stringify(echartsOption.yDensity));
                         optionDensity.xAxis[0].data = XARR || [];
                         optionDensity.series = finallydensityArr || [];
                         myEchartsFullScreen.setOption(optionDensity)
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
                    data.forEach(({ freq1, freq2, density, db }) => {
                        xArr.push(Math.sqrt(freq1 * freq2).toFixed(0));
                        densityArr.push(density.toFixed(3));
                        dbArr.push(db === 0 ? undefined : db.toFixed(5));
                    });

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
      
    getList = (result,msg) =>{
        this.disposeEcharts();
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
    lookEcharts = (type)=>{
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

    getSingle = (recordIdList) => {
        singleTotalArr = [];
        const {receiverId} = this.state;
        let params = {
            receiverId,
            recordIdList
        }
        if(recordIdList.length){
            service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
                if (res.rc == 0) {  
                     singleTotalArr = [];
                       let ret = res.ret.responseList || [];
                       let freqs = res.ret.freqs || [];
                       XARR = freqs.map(item => (item.toFixed(0)));
                       for(let i = 0;i<ret.length;i++){
                           let dbArray = ret[i].dbArray || [];
                           let densityArray = ret[i].densityArray || [];
                           singleTotalArr.push({
                               id:ret[i].recordId,
                               detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                               machineNo: ret[i].machineNo || '',
                               densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                               dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(5))),
                               qualityId:ret[i].qualityId
                           })
                       }
                       this.setState({
                        freqs
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
        this.drawEcharts()
    }

    drawEcharts = ()=>{
         let totaldbArr = [];
         let totaldensityArr = [];
         
         for (let j = 0; j < singleTotalArr.length; j++) {
             totaldbArr.push({
                 name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                 type: "line",
                 yAxisIndex: 0,
                 data: singleTotalArr[j].dbArr,
                 lineStyle: {
                    // color:'red',
                    width: 1,
                    type: 'solid'
                },
             })
             totaldensityArr.push({
                 name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                 type: "line",
                 yAxisIndex: 0,
                 data: singleTotalArr[j].densityArr,
                 lineStyle: {
                    // color:'red',
                    width: 1,
                    type: 'solid'
                },

             })
         }
         finallydbArr = [];
         finallydensityArr = [];
     
        let that = this;
         setTimeout(() => {
            finallydbArr = [ ...totaldbArr];
            finallydensityArr = [...totaldensityArr];
              
              if (that.echartsBoxDb) {
                  if (myEchartsDb == null) {
                      myEchartsDb = echarts.init(that.echartsBoxDb);
                  }
                  if (myEchartsDb) {
                      let optionDb = JSON.parse(JSON.stringify(echartsOption.yDb));
                      optionDb.xAxis[0].data = XARR || [];
                      optionDb.series = finallydbArr || [];
                      myEchartsDb.setOption(optionDb);
                      myEchartsDb.on('click', function (params) {
                        const dataIndex = params.dataIndex;
                            if (params.componentType === 'series') {
                                that.echartsClick(dataIndex, params.name,'db')
                            }
                      });
           
                  }
              }
              if (that.echartsBoxDensity) {
                  if (myEchartsDensity == null) {
                      myEchartsDensity = echarts.init(that.echartsBoxDensity);
                  }
                  if (myEchartsDensity) {
                      let optionDensity = JSON.parse(JSON.stringify(echartsOption.yDensity));
                      optionDensity.xAxis[0].data = XARR || [];
                      optionDensity.series = finallydensityArr || [];
                      myEchartsDensity.setOption(optionDensity);
                      myEchartsDensity.on('click', function (params) {
                        const dataIndex = params.dataIndex;
                        if (params.componentType === 'series') {
                            that.echartsClick(dataIndex, params.name,'db')
                        }
                      });
                  }
              }

         }, 500);
    }
    // 
    errorsRank = ()=>{
        this.setState({
            groupList:[],
            juleiVisible:true,
        })
        // 聚类
        const {receiverId} = this.state;
        const {detailDtoList,groupValue,groupList,freqs} = this.state;

        if(groupValue == ''){
            message.error('分组数量不能为空')
            return false;
        }
        let recordIdList = [];

        // 从全部数据直接选择过来
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
        const uniqueArr = recordIdList.filter((item, index) => recordIdList.indexOf(item) === index);
        let params = {
            receiverId,
            count:groupValue,
            recordIdList:uniqueArr
        }
        service.errorsRank(VtxUtil.handleTrim(params)).then(res => {
            this.setState({
                juleiVisible:false
            })
            if (res.rc == 0) {  
                let data = res.ret.sort((a, b) => b.rankList.length - a.rankList.length);
                this.setState({
                    groupList:data,
                })
            } else {
                message.error(res.err);
            }
        })
    }

    // 
    groupClick=(item,index)=>{
        const {receiverId,groupList} = this.state;
        let rankList = item.rankList;
        // 点击某一个数据集
        this.setState({
            groupIndex:index,
            rankList:item.rankList,
        })
        let detailDtoList = [];
        let recordIdList = [];
        for(let i = 0;i<rankList.length;i++){
            recordIdList.push(rankList[i].recordId);
            detailDtoList.push({
                receiverId,
                recordId:rankList[i].recordId
            })
        }
        let params = {
            receiverId,
            recordIdList,
            detailDtoList
        }
        service.findListByIdListNew(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                // 假设 juleiData 和 rankList 已经定义
                let juleiData = (res.ret || []).map((item, index) => ({
                    ...item,
                    index: index + 1 // 从1开始计数
                }));

                // 遍历 rankList，将 error 值赋值到 juleiData 中对应的记录
                for (let i = 0; i < rankList.length; i++) {
                    const rankItem = rankList[i];
                    const targetItem = juleiData.find(item => item.id === rankItem.recordId); // 找到对应的记录
                    if (targetItem) {
                        targetItem.error = rankItem.error; // 赋值 error
                    }
                }

                this.setState({
                    juleiData,
                })
            } else {
                message.error(res.err);
            }
        })
    }

    lookEcharts1 = ()=>{
        const {rankList} = this.state;
        if(rankList.length){
            let idArr = [];
            for(let i= 0;i<rankList.length;i++){
                idArr.push(rankList[i].recordId)
            }
            this.getSingle(idArr)
        }else{
            message.error('还未选中组！')
        }
    }

    render(){
        const { loading, selectedRowKeys ,selectedRowKeysCycle,selectedRowKeysAll,callKey,groupList} = this.state;

        const tableStyle = {
            bordered: false,
            loading: false,
            pagination:{
                defaultPageSize:30,
            },
            size: 'default',
            // rowSelection: {},
            // 当列总宽度超过容器时，启用表格内部横向滚动条
            scroll: { x: 'max-content' },
        }
        const columns = [
            {
                title: '序号',
                dataIndex: 'index',
            },
            {
                title: '偏差值',
                dataIndex: 'error',
            },
            {
                title: '记录id',
                dataIndex: 'id',
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
                title: '标签',
                dataIndex: 'judgeType',
                render: (text, record,index) => (
                    <span>
                        {record.judgeType == 1 ? '漏判' : (record.judgeType == 2 ? '误判' : '')}
                    </span>
                ),
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
         const columnsEcharts = [{
                 title: '频率(Hz)',
                 dataIndex: 'freq',
             },
             {
                 title: '曲线名称',
                 dataIndex: 'name',
             },
             {
                 title: '能量(db)',
                 dataIndex: 'db',
             },
             {
                 title: '密度(%)',
                 dataIndex: 'density',
             },

         ];
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections:true,
            onChange: this.onSelectChange,
        };
        const {tableData,filePath,groupValue,juleiVisible,juleiData,groupIndex 
        } = this.state;
        
    return (
        <Page title='质量排序' className="pageLayoutRoot">
            < SideBar parent={this}></SideBar>
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
            <div className={styles.body}>
                <SearchPage parent={this}></SearchPage>
                {/* 能量密度 */}
               <div className={styles.frequencyWidth}>
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
                    <BtnWrap>
                        <Button type='primary' onClick={()=>{
                            this.lookFullScreen(1)
                        }}>全屏能量曲线</Button>
                        <Button type='primary' style={{marginLeft:10,marginTop:'10px'}} onClick={()=>{
                            this.lookFullScreen(2)
                        }}>全屏密度曲线</Button>
                        <br/>
                         <span style={{color:'red'}}>提示：数据量大时可以通过点击具体频率查看所选数据对应的能量、密度 </span>
                    </BtnWrap>
                   
                </div>

                <div className={styles.frequencyWidth}>
                    <div className={styles.standStoreFlex}>
                        <BtnWrap style={{marginTop:'-10px'}}>
                            <Button style={{backgroundColor:'#F21360',color:'white'}} onClick={()=>this.lookEcharts()}>生成曲线图</Button>
                            <Button style={{marginTop:'10px'}}  onClick={()=>this.lookEcharts1()}>生成排序曲线图</Button>
                        </BtnWrap>
                        <audio  src={filePath} autoPlay controls style={{width:300,height:30,marginLeft:100}}></audio>
                    </div>
                    <div>
                        <Input addonBefore="分组数量" style={{width:'200px',marginLeft:10,marginTop:'10px'}} name='groupValue' placeholder="请输入" value={groupValue}
                        onChange={this.inputChange.bind(this)}/>
                        <Button type='primary' style={{marginLeft:10,marginTop:'10px'}} onClick={()=>this.errorsRank()}>开始排序</Button>
                    </div>
                </div>
                
                <Tabs type="card">
                    <TabPane tab="全部数据" key="1">
                        <BtnWrap>
                            {
                                selectedRowKeys.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                            }
                        </BtnWrap>
                        <Table {...tableStyle} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
                    </TabPane>   

                    <TabPane tab="排序详情 " key="4">
                        {
                            juleiVisible ?   <Spin tip="聚类中,请稍等..." style={{width:400,height:400,margin:'100px auto'}}></Spin> : ''
                        }
                        <BtnWrap>
                            {
                                (groupList || []).map((item,index)=>{
                                    return (
                                        <Button key={index} className={groupIndex === index ? 'activeBtn' : 'passiveBtn'} onClick={()=>this.groupClick(item,index)}>第{item.count+1}组__{item.rankList.length}</Button>
                                    )
                                })
                            }
                        </BtnWrap>
                        <Table {...tableStyle} rowKey={record => record.id} columns={columns} dataSource={juleiData} />
                    </TabPane>
                </Tabs>
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

                {/* 点击对应的坐标轴数据数值 */}
                < Modal title = "图表点击对应频率数据"
                    visible = {this.state.clickChartVisible}
                    onOk = {() => {this.handleClose()}}
                    onCancel = {() => {this.handleClose()}}
                    width="60%"
                    >
                    <Table pagination={false} rowKey={record => record.id} columns={columnsEcharts} dataSource={echartsClickData} />  
                </Modal>  
          
                
            </div>
                </div>
            </div>
        </Page>
        
        )
    }
}

export default QualitySort;
