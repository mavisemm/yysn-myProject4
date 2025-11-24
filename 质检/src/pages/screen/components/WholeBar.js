import React, {Component} from 'react';
import styles from '../screen.less';
import { vtxInfo } from '@src/utils/config';
import { VtxUtil } from '@src/utils/util';
import {service} from '../service';
import echarts from 'echarts';
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox} from 'antd';
import moment, { localeData } from 'moment';
import echartsOption from '@src/pages/acomponents/optionEcharts';
import comm from '@src/config/comm.config.js';
class WholeBar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            fullScreen:false,
            recordId:"",
            machineNo:"",
            machineId:"",
            recordDto: ""
        }
    }
    // 挂载完成之后，因为React初始化echarts时长宽可能会获取到顶层，所以延迟200去生成，不影响视觉效果
    componentDidMount() {
        const {receiverResponseList=[],recordDto} = {...this.props};
        const {machineId,machineNo,id} = recordDto;
        this.setState({
            receiverResponseList,
            recordId:id,
            machineNo,
            machineId,
            recordDto,
        })
    }
    render() {
        const {receiverResponseList,recordDto } = this.state;
        return (
            <div style={{width:'100%'}}>
               <div className={styles.echartsContentzc}>
                    {
                       receiverResponseList && (receiverResponseList || []).map((item, index) => {
                            return (
                                <div className={styles.Contentzc}  key={index}>
                                  
                                    <div className={styles.pointNameFlex}>
                                        <div><span style={{color:'#3F9CD2'}}>点位名称:</span>{item.pointName}  <span style={{color:item.qualityColor}}>{item.qualityName ? item.qualityName : '--'}</span>{item.faultName}</div>
                                    </div>

                                    <div className={styles.resultInfo}>
                                        <div><span>机型：</span>{recordDto.machineTypeName}</div>
                                        <div><span>检测时间：</span>{moment(recordDto.detectTime).format('YYYY-MM-DD HH:mm:ss')}</div>
                                        <div><span>设备编号：</span>{recordDto.machineNo}</div>
                                        <div><span>记录id：</span>{recordDto.id}</div>
                                    </div>
                                    <div style={{color:item.qualityColor,fontSize:30}}>{item.qualityName ? item.qualityName : '--'} {item.faultName}</div>
                                </div> 
                            )
                        })
                    }
                </div>
            </div>
        )
    }
}

export default WholeBar;
