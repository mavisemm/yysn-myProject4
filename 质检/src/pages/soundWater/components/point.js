import React,{ Component } from 'react';
import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
const { VtxUpload2 } = VtxUpload;
import { Tree,Icon,Modal,Input,Badge,message,Select,Form ,Checkbox,Tabs,Button,DatePicker,Table   } from 'antd';
import { vtxInfo } from '@src/utils/config';
const { MonthPicker, RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;
import moment from 'moment';
import {service} from '../service';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import styles from '../soundWater.less';
let singleTotalArr = [];
let myEchartsDb = null;
let myEchartsDensity = null;
let myEchartsDist = null;
let freqs = [];
import echarts from 'echarts';
import echartsOption from '@src/pages/acomponents/optionEcharts';
const plainOptions = ['密度', '能量', '距离'];
class Mulitipe extends Component {
    state = {
       wifiName:'',
       wifiPassword:"",
       visible:true,
       degree:0.3,
       degree2:0.3,
       selectedRowKeys:[],
       visibleList: ['密度', '距离'],
       dbVisible:false,
       densityVisible:true,
       distVisible:true,
       tableData:[],
       detailDtoList:[]
    };
    inputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
     }

    handleOk = e => {
        this.disposeEcharts();
        this.props.parent.getWifiMsg(this, this.state)
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        this.props.parent.getWifiMsg(this, false)
        this.setState({
            visible: false,
        });
    };
    componentDidMount(){

    }
    componentWillUnmount() {
        this.disposeEcharts();
    }
    disposeEcharts = () => {
        if (myEchartsDb) {
            myEchartsDb.dispose();
            myEchartsDb = null;
        }
        if (myEchartsDensity) {
            myEchartsDensity.dispose();
            myEchartsDensity = null;
        }
        if (myEchartsDist) {
            myEchartsDist.dispose();
            myEchartsDist = null;
        }

    }
    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0] + ' 00:00:00').valueOf(),
            endTime: moment(dateString[1] + ' 23:59:59').valueOf()
        })
    }
      chooseBox = (type) => {
        const {tableData} = this.state;
        let detailDtoList = [];
        let recordIdList = [];
        let selectedRowKeys = [];
        if(tableData.length == 0){
            message.error('请先查询数据！')
            return false;
        }
        // 1.全选，2全不选
        for (let i = 0; i < tableData.length; i++) {
            selectedRowKeys.push(tableData[i].id);
            detailDtoList.push({
                groupId: tableData[i].groupId,
                recordId: tableData[i].id
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
    pointChange = (e) => {
        const {pointList} = this.props;
        let temp = {};
        for(let i= 0;i<pointList.length;i++){
            if (pointList[i].id == e){
                temp = pointList[i];
            }
        }
        this.setState({
            pointId: e,
            receiverId:temp.receiverId,
            detectorId:temp.detectorId,
        })
    }
    getList = ()=>{
          const {cycleType,startTime,endTime,machineId,receiverId,speed,machineNo,pointId,
            detectorId} = this.state;
            let params = {
                startTime,
                endTime,
                machineNo,
                machineId:this.props.machineId,
                cycleType:0,
                speed:"",
                receiverId,
                detectorId,
                pointId
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
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }
     onSelectChange = (selectedRowKeys, selectedRows) => {
         let detailDtoList = [];
         for (let i = 0; i < selectedRows.length; i++) {
             detailDtoList.push({
                 groupId: selectedRows[i].groupId,
                 recordId: selectedRows[i].id,
             })
         }
         this.setState({
             selectedRowKeys,
             selectedRows,
             detailDtoList
         })
     }
    lookEcharts = ()=>{
        const {detailDtoList} = this.state;
        if (detailDtoList.length == 0) {
            message.error('请先选择数据')
            return false
        }
        let recordIdList = [];
        // 1.全选，2全不选
        for (let i = 0; i < detailDtoList.length; i++) {
            recordIdList.push(detailDtoList[i].recordId)
        }
    
        this.getSingle(recordIdList);
    }
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
        const {receiverId} = this.state;
        // console.log(recordIdListArr,'000')
        let params = {
            receiverId,
            recordIdList: recordIdListArr
        }
        service.findSimpleFrequencyList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {  
                    singleTotalArr = [];
                    let ret = res.ret.responseList || [];
                    freqs = res.ret.freqs.map(item => item.toFixed(2));
                    for(let i = 0;i<ret.length;i++){
                        let dbArray = ret[i].dbArray || [];
                        let densityArray = ret[i].densityArray || [];
                        let distArray = ret[i].distArray || [];
                        singleTotalArr.push({
                            id:ret[i].recordId,
                            detectTime: moment(ret[i].time).format('YYYY-MM-DD HH:mm:ss'),
                            machineNo: ret[i].machineNo || '',
                            densityArr: densityArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                            dbArr: dbArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                            distArr: distArray.map(item => (item === 0 ? undefined : item.toFixed(3))),
                        })
                    }
                    this.dealEcharts();
            } else {
                message.error(res.err);
            }
        })
       
    }
    dealEcharts = ()=>{
        this.disposeEcharts();
        let totaldbArr = [];
        let totaldensityArr = [];
        let totaldistArr = [];
     
        for (let j = 0; j < singleTotalArr.length; j++) {
            totaldbArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                data: singleTotalArr[j].dbArr
            })
            totaldensityArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                data: singleTotalArr[j].densityArr
            })
            totaldistArr.push({
                name: singleTotalArr[j].detectTime + '_' + singleTotalArr[j].machineNo,
                type: "line",
                data: singleTotalArr[j].distArr
            })
        }
        let that = this;
         if (that.echartsBoxDb) {
             if (myEchartsDb == null) {
                 myEchartsDb = echarts.init(that.echartsBoxDb);
             }
             if (myEchartsDb) {
                 let optionDb = JSON.parse(JSON.stringify(echartsOption.optionDb));
                 optionDb.xAxis[0].data = freqs || [];
                 optionDb.series = totaldbArr || [];
                 myEchartsDb.setOption(optionDb);
                //  myEchartsDb.on('finished', () => {
                //      if (myEchartsDb) {
                //          myEchartsDb.resize()
                //      }

                //  })
             }
         }

         if (that.echartsBoxDensity) {
             if (myEchartsDensity == null) {
                 myEchartsDensity = echarts.init(that.echartsBoxDensity);
             }
             if (myEchartsDensity) {
                 let optionDensity = JSON.parse(JSON.stringify(echartsOption.optionDensity));
                 optionDensity.xAxis[0].data = freqs || [];
                 optionDensity.series = totaldensityArr || [];
                 myEchartsDensity.setOption(optionDensity);
                //  myEchartsDensity.on('finished', () => {
                //      if (myEchartsDensity) {
                //          myEchartsDensity.resize()
                //      }

                //  })
             }
         }

        if (that.echartsBoxDist) {
             if (myEchartsDist == null) {
                 myEchartsDist = echarts.init(that.echartsBoxDist);
             }
             if (myEchartsDist) {
                 let optionDist = JSON.parse(JSON.stringify(echartsOption.optionDist));
                 optionDist.xAxis[0].data = freqs || [];
                 optionDist.series = totaldistArr || [];
                 myEchartsDist.setOption(optionDist);
                //  myEchartsDist.on('finished', () => {
                //      if (myEchartsDist) {
                //          myEchartsDist.resize()
                //      }

                //  })
             }
         }

    }
    echartsVisibleChange = (e)=>{
      let distExists = e.includes('距离');
      let densityExists = e.includes('密度');
      let energyExists = e.includes('能量');
      // 根据存在与否设置状态
      this.setState({
          distVisible: distExists,
          densityVisible: densityExists,
          dbVisible: energyExists, // 注意：这里假设'能量'的键是'dbVisible'
      });
        this.setState({
            visibleList:e
        },()=>{
            if (singleTotalArr.length == 0) {
                message.error('请先选择数据')
                return false;
            }
            this.dealEcharts();
        })
    }
  render() {
    const {wifiName,wifiPassword,degree,tableData ,machineNo} = this.state;
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
                title: '点位名称',
                dataIndex: 'pointName',
            },
        ];
        const { loading, selectedRowKeys ,dbVisible,densityVisible,distVisible} = this.state;
        const rowSelection = {
            selectedRowKeys,
            hideDefaultSelections:true,
            onChange: this.onSelectChange,
        };
    return (
        <div>
            <Modal
            title="历史数据"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            width='95%'
            okText="确认"
            cancelText="取消"
            >
                
                {
                    dbVisible && <div ref = {(c) => {this.echartsBoxDb = c}} style = {{width: '100%',height: '300px',}}/> 
                }
                {
                    densityVisible &&  <div ref = {(c) => { this.echartsBoxDensity = c}} style = { {width: '100%',height: '300px',}} />
                }
                {
                    distVisible && <div ref = {(c) => { this.echartsBoxDist = c}} style = { {width: '100%',height: '300px',}} />
                }
                
                <div style={{marginBottom:"10px"}}>
                    <RangePicker onChange={this.dateChange.bind(this)}
                    style={{width:200}}
                     ranges={{
                        今天: [moment().startOf('day').subtract(0, 'd'), moment().endOf('day')],
                        最近一周: [moment().startOf('day').subtract(6, 'd'), moment().endOf('day')],
                        最近一个月: [moment().startOf('day').subtract(30, 'd'), moment().endOf('day')],
                        最近三个月: [moment().startOf('day').subtract(90, 'd'), moment().endOf('day')],
                      }}
                      showTime={{
                        hideDisabledOptions: true,
                        defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                      }}
                        />
                    <Input addonBefore="请输入设备编号："  style={{width:'250px',marginLeft:"10px"}} placeholder="请输入编号:" value={machineNo} name='machineNo'
                     onChange={this.inputChange.bind(this)} />
                    <Select defaultValue='请选择点位' style={{ width: 120,marginLeft:10, outline: 'none' }} onChange={this.pointChange.bind(this)}>
                        {
                            (this.props.pointList || []).map((item, index) => {
                                return (
                                    <Option value ={item.id} key={index}> {item.pointName} </Option>
                                )
                            })
                        }
                    </Select>
                    <Button type = "primary"  style={{marginLeft:10}} onClick={()=>this.getList()}> 查询 </Button>

                </div>
                    <BtnWrap>
                    {
                        selectedRowKeys.length == 0 ? <Button type='primary' onClick={()=>this.chooseBox(1)}>全选</Button> : <Button type='primary'  onClick={()=>this.chooseBox(2)}>全不选</Button>
                    }
                    <Button style={{backgroundColor:'#F21360',color:'white'}} onClick={()=>this.lookEcharts()}>生成曲线图</Button>
                    <Button><CheckboxGroup options={plainOptions} value={this.state.visibleList} onChange={this.echartsVisibleChange} /></Button>
                </BtnWrap>
                 <Table {...tableStyle} rowSelection={rowSelection} rowKey={record => record.id} columns={columns} dataSource={tableData} />
            </Modal>
      </div>
    );
  }
}
export default Mulitipe;
