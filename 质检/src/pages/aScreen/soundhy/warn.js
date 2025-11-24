import React, {Component} from 'react';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service1,service} from '../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,DatePicker} from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import moment, { localeData } from 'moment';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
import { BtnWrap } from 'rc-layout';
let t = null;
let myEcharts1 = null;
let myEcharts = null;
let echartsArr = [];
let filePath = '';
let pojoList = [];
const tenantId = VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId;
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            warnVisible:false,
            warnCount:"",
            path:"",
            qualityList:[],
            qualityId:"",
            id:""
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        this.getMode();
        // this.getCode();
        this.getWarnList();
        this.setState({
            warnVisible:true
        })
     
    }
    componentWillUnmount(){

    }
    getMode =()=>{
        let params = {
            filterPropertyMap: [{
                code: 'tenantId',
                operate: 'EQ',
                value: tenantId,
            }, ],
            sortValueMap: [{
                code: 'sort',
                sort: 'asc',
            }, ],
        }
        service.getMode(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                this.setState({
                    qualityList: res.ret.items || [],
                })
            } else {
                message.error(res.err)
            }
        })
    }
     getCode = ()=>{
        let uuid = this.getUuid();
        let params={
            uuid,
            tenantId
        }
        service1.getCode({...params}).then(res => {
            if(res && res.ticket){
                this.setState({
                    path:res.path,
                })
            }
        })
    }
    getUuid = ()=>{
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    closeModal = (type)=>{
        this.setState({
            warnVisible:false
        })
          this.props.parent.closeEmail(this, type );
    }
    saveWarn = () => {
        const {qualityId,warnCount,id} = this.state;
        let params = {}
        params = {
            id,
            warnCount,
            qualityId,
            tenantId,
        }
        service1.saveWarn(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
            this.closeModal();
             message.success('设置成功');
            } else {
                message.error(res.err);
            }
        })
    }

    inputChange = (e)=>{
        this.setState({
            [e.target.name]: e.target.value
        })
    }
    getMode =()=>{
      let params = {
          filterPropertyMap: [{
              code: 'tenantId',
              operate: 'EQ',
              value: tenantId,
          }, ],
          sortValueMap: [{
              code: 'sort',
              sort: 'asc',
          }, ],
      }
      service.getMode(VtxUtil.handleTrim(params)).then(res => {
          if (res.rc == 0) {
              this.setState({
                  qualityList: res.ret.items || [],
              })
          } else {
              message.error(res.err)
          }
      })
    }

    qualityChange = (e)=>{
        this.setState({
            qualityId:e
        })
    }
    getWarnList = () => {
        let params = {
            tenantId
        }
        service1.getWarnList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0 && res.ret) {
            const {warnCount,qualityId,id} = res.ret;
            this.setState({
                qualityId,
                warnCount,
                id
            })
                
            } else {
                message.error(res.err)
            }
        })
    }

    render() {
        const {warnCount ,path,qualityList,qualityId   } = this.state;
        return (
            <div>
                {/* 推送设置 */}
                <Modal
                    title="推送设置"
                    visible={this.state.warnVisible}
                    onOk={this.saveWarn}
                    onCancel={this.closeModal}
                    okText="保存"
                    cancelText="取消"
                    >
                        <div>
                            <Input addonBefore="单工位连续：" placeholder="请输入" style={{width:200}} value={warnCount}
                            onChange={this.inputChange.bind(this)} addonAfter='次' name='warnCount'/>  
                            <Select value={qualityId} style={{ width: 120,marginLeft:10,marginRight:10, outline: 'none' }} onChange={this.qualityChange.bind(this)}>
                                {
                                    (qualityList || []).map((item, index) => {
                                        return (
                                            <Option value ={item.id} key={index}> {item.name} </Option>
                                        )
                                    })
                                }
                            </Select>
                            推送告警
                        </div>

                        {/* <div>
                             <img src={path} style={{width:250,height:250,margin:'0 auto'}}/>
                             <div>微信扫描二维码，手机推送告警信息</div>
                        </div> */}
                        <BtnWrap>
                            <Button type='danger' onClick={()=>this.closeModal(1)}>取消报警状态</Button>
                        </BtnWrap>
                </Modal>

            </div>
        )
    }
}

export default WholeBar;
