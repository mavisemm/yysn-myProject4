/**
 * 领导看板
 * author : vtx shh
 * createTime : 2021-08-13 16:47:36
 */
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,DatePicker,Checkbox} from 'antd';

import {service} from './service';
import styles from './sgBoard.less';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';

const namespace = 'sgBoard';

@connect(({sgBoard}) => ({sgBoard}))
class sgBoard extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            machineList:[],
            subList:[],
        }
    }
    componentDidMount(){
        this.machineQ();
    }
    // 机型质量排名
    machineQ(){
        let params = {
            tenantId,
        }
        service.machineQ(VtxUtil.handleTrim(params)).then(res => {
            if(res.rc == 0){
                if(res.ret){
                    this.setState({
                        machineList: res.ret
                    })
                }else{
                    this.setState({
                        machineList:[]
                    })
                }
            }else{
                message.error(res.err)
            }
        })
    }
    render(){
        const columns = [
            {
                title: '机型',
                dataIndex: 'machineName',
            },
            {
                title: '排名',
                dataIndex: 'ranking',
            },
        ];
        const {sgBoard} = this.props;
        const {Source} = sgBoard;
        return (
                <div className={styles.body}>
                    <Row gutter={5}>
                        {
                            (Source || []).map(item=>{
                                return (
                                    <Col className="gutter-row" span={4} key={item.key}>
                                        <div className={styles.dataTitle}>
                                            <img src={require('@src/assets/voice/vpart.png')} className={styles.imgIcon}/>
                                            <div>
                                                <div className={styles.headertxt}>{item.name}</div>
                                                <div className={styles.headerNum}>{item.number}</div>
                                            </div>
                                        </div>
                                    </Col>
                                )
                            })
                        }
                    </Row>
                    <Row gutter={10} className={styles.mt20}>
                        <Col span={24}>
                            <div className={styles.machineQuality}>
                                <div className={styles.tabletitle}>
                                    <div className={styles.bd}></div>
                                    <p>机型质量排名（本月）</p>
                                </div>
                                <div className={styles.headerStyles}>
                                    <div>
                                        {/* 折线图 */}
                                        <Table  {...this.state} dataSource={this.state.machineList} columns={columns} pagination={false}/>
                                    </div>
                                </div>
                            </div>
                        
                        </Col>
                    </Row>
                </div>
            )
        }
}

export default sgBoard;
