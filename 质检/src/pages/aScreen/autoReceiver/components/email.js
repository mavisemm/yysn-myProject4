import React, {Component} from 'react';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,DatePicker} from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import moment, { localeData } from 'moment';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
let t = null;
let myEcharts1 = null;
let myEcharts = null;
const { tenantId, userId, token } = vtxInfo;
let echartsArr = [];
let filePath = '';
let pojoList = [];
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            staticsTimeVisible:false,
            receiverMail:"",
            startTime:"",
            endTime:"",
            receiverGroupId:'',
            receiverMail:"",
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
          const {receiverGroupId} = {...this.props};
        this.setState({
            staticsTimeVisible:true,
            receiverGroupId
        },()=>{
            this.getCode()
        })
    }
    componentWillUnmount(){

    }
    closeModal = ()=>{
        this.setState({
            staticsTimeVisible:false
        })
          this.props.parent.closeEmail(this, false);
    }
    sendMail  = ()=>{
        const {receiverGroupId,startTime,endTime,receiverMail} = this.state;
        let params = {}
        params = {
            startTime,
            endTime,
            tenantId: localStorage.tenantId,
            receiverMail,
            receiverGroupIdList: [receiverGroupId]
        }
        service.sendMail(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
            this.closeModal();
             message.success('邮件已发送');
            } else {
                message.error(res.err);
            }
        })
    }

    dateChange = (date, dateString) => {
        this.setState({
            startTime: moment(dateString[0]).valueOf(),
            endTime: moment(dateString[1]).valueOf()
        })
    }
    inputChange = (e)=>{
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    render() {
        const {receiverMail } = this.state;
        return (
            <div>
                   <Modal
                        title="发送邮件"
                        visible={this.state.staticsTimeVisible}
                        onOk = {()=>this.sendMail()}
                        onCancel={this.closeModal}
                        okText="确定发送"
                        cancelText="取消"
                        >
                            <div>
                                <h2>邮箱号：</h2>
                                <Input placeholder="请输入邮箱号"  onChange={this.inputChange.bind(this)} name='receiverMail'/>
                            </div>
                            <div style={{marginTop:10}}>
                                <h2>数据统计时间：</h2>
                                <RangePicker
                                    showTime={{ format: 'HH:mm' }}
                                    format="YYYY-MM-DD HH:mm"
                                    placeholder={['开始时间', '结束时间']}
                                    onChange={this.dateChange}
                                />
                            </div>
                    </Modal>

            </div>
        )
    }
}

export default WholeBar;
