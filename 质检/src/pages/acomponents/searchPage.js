import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon, Row, Col, Table, DatePicker, Checkbox, Pagination, Switch, BackTop, Tabs } from 'antd';
import { service } from './service2';
import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
const { MonthPicker, RangePicker } = DatePicker;
import moment from 'moment';
import RViewerJS from 'viewerjs-react';
let dateString = '';
const Option = Select.Option;
import comm, { hostIp1 } from '@src/config/comm.config.js';
const dateFormat = 'YYYY-MM-DD HH:mm:ss'; // 支持时分秒格式

class SearchPage extends React.Component {
    state = {
        cycleType: 0,
        endTime: '',
        machineId: '', // 存储实际传递的机型ID
        receiverId: '',
        recordId: "",
        pointId: "", // 存储实际传递的点位ID
        qualityId: "", // 品质等级ID
        speed: '',
        startTime: '',
        tableData: [],
        total: 0,
        machineList: [],
        pointList: [],
        pointFileUrl: "",
        imgVisible: false,
        machineName: "",
        pointName: "",
        qualityList: [],
        speedList: [],
        judgeType: "", // 标签类型
        selectedDateRange: null,
        // 新增：存储默认选中项的显示名称（用于回显）
        defaultMachineName: '',
        defaultPointName: ''
    }

    componentDidMount() {
        this.getMachineList();
        this.getPointList();
        this.getMode();
    }

    // 修复：加载机型列表后，自动匹配「上海交运刀具」的ID并设置默认值
    getMachineList = () => {
        let params = {
            tenantId
        };
        service.getMachineList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let data = res.ret;
                    let arr = []
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].machineList) {
                            arr = arr.concat(data[i].machineList)
                        }
                    }

                    // 核心：查找名称为「上海交运刀具」的机型
                    const targetMachine = arr.find(item => item.name === '上海交运刀具');
                    const defaultMachineId = targetMachine ? targetMachine.id : '';
                    const defaultMachineName = targetMachine ? targetMachine.name : '';

                    this.setState({
                        machineList: arr,
                        machineId: defaultMachineId, // 设置实际传递的ID
                        defaultMachineName: defaultMachineName, // 设置显示名称
                        // 同步加载默认机型的转速列表和点位图
                        speedList: targetMachine ? (targetMachine.speedList || []) : [],
                        pointFileUrl: targetMachine ? targetMachine.pointFileUrl : "",
                        machineName: defaultMachineName
                    });
                }
            } else {
                message.error(res.err);
            }
        })
    }

    // 修复：加载点位列表后，自动匹配「上海交运刀具」的ID并设置默认值
    getPointList = () => {
        let params = {
            filterPropertyMap: [
                {
                    code: "tenantId",
                    operate: "EQ",
                    value: tenantId
                },
            ],
            sortValueMap: [{
                code: 'point_name',
                sort: 'asc'
            }]
        }
        service.getPointList(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let pointList = res.ret.items.map(item => ({
                        ...item,
                        key: item.id,
                    }));

                    // 核心：查找名称为「上海交运刀具」的点位
                    const targetPoint = pointList.find(item => item.pointName === '上海交运刀具');
                    const defaultPointId = targetPoint ? targetPoint.id : '';
                    const defaultPointName = targetPoint ? targetPoint.pointName : '';

                    this.setState({
                        pointList: pointList,
                        pointId: defaultPointId, // 设置实际传递的ID
                        defaultPointName: defaultPointName, // 设置显示名称
                        // 同步点位关联的参数
                        receiverId: targetPoint ? targetPoint.receiverId : '',
                        detectorId: targetPoint ? targetPoint.detectorId : '',
                        pointName: defaultPointName
                    });
                }
            } else {
                message.error(res.err);
            }
        })
    }

    getMode = () => {
        let params = {
            filterPropertyMap: [{
                code: "tenantId",
                operate: "EQ",
                value: tenantId
            }],
        }
        service.getMode(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                if (res.ret) {
                    let arr = [{
                        name: "不限",
                        id: ""
                    }]
                    let qualityList = res.ret.items.map(item => ({
                        ...item,
                        key: item.id,
                    }));
                    this.setState({
                        qualityList: arr.concat(qualityList)
                    })
                }
            } else {
                message.error(res.err);
            }
        })
    }

    // 修复：时间选择器逻辑 - 结束时间限制为当前时刻
    dateChange = (dates, dateStrings) => {
        if (dates && dates.length === 2) {
            const [startDate, endDate] = dates;
            const today = moment().startOf('day');

            // 判断结束日期是否是今天
            const isEndDateToday = endDate.isSame(today, 'day');
            let finalEndDate = endDate;

            // 如果是今天，将结束时间修正为当前时刻（不允许选未来时间）
            if (isEndDateToday) {
                const now = moment();
                // 如果选择的结束时间晚于当前时间，强制改为当前时间
                if (endDate.isAfter(now)) {
                    finalEndDate = now;
                }
            }

            this.setState({
                startTime: startDate.valueOf(),
                endTime: finalEndDate.valueOf(),
                selectedDateRange: [startDate, finalEndDate] // 同步修正后的日期
            })
        }
    }

    chooseMachine = (e) => {
        const { machineList } = this.state;
        const targetMachine = machineList.find(item => item.id === e);
        if (targetMachine) {
            this.setState({
                speedList: targetMachine.speedList || [],
                machineId: e,
                pointFileUrl: targetMachine.pointFileUrl,
                machineName: targetMachine.name,
                defaultMachineName: targetMachine.name // 更新显示名称
            })
        }
    }

    pointChange = (e) => {
        const { pointList } = this.state;
        const targetPoint = pointList.find(item => item.id === e);
        if (targetPoint) {
            this.setState({
                pointId: e,
                receiverId: targetPoint.receiverId,
                detectorId: targetPoint.detectorId,
                pointName: targetPoint.pointName,
                defaultPointName: targetPoint.pointName // 更新显示名称
            })
        }
    }

    qualityChange = (e) => {
        this.setState({ qualityId: e })
    }

    inputChange = (e) => {
        this.setState({ [e.target.name]: e.target.value })
    }

    modeChange = (e) => {
        this.setState({ cycleType: e })
    }

    judgeChange = (e) => {
        this.setState({ judgeType: e })
    }

    chooseSpeed = (e) => {
        this.setState({ speed: e })
    }

    getImage = () => {
        this.setState({ imgVisible: true })
    }

    handleClose = () => {
        this.setState({ imgVisible: false })
    }

    // 修复：查询前打印参数，方便调试，确保参数有值
    getList = () => {
        const {
            cycleType, startTime, endTime, machineId, receiverId, speed,
            machineNo, pointId, qualityId, detectorId, recordId, judgeType
        } = this.state;

        // 调试：打印参数，你可以在控制台查看是否有值
        console.log('子组件传递的参数：', {
            machineId, pointId, startTime, endTime, cycleType, speed
        });

        // 校验：如果默认值没找到，提示用户
        if (!machineId) {
            message.warning('未找到「上海交运刀具」机型，请手动选择！');
        }
        if (!pointId) {
            message.warning('未找到「上海交运刀具」点位，请手动选择！');
        }

        let params = {
            cycleType,
            endTime,
            machineId,
            receiverId,
            speed,
            startTime,
            machineNo,
            pointId,
            qualityId,
            detectorId,
            recordId,
            judgeType
        };

        // 传递给父组件
        this.props.parent.getList(this, params);
    }

    render() {
        // 修复核心：补充所有用到的state变量到解构赋值中
        const {
            machineList, pointList, speedList, machineNo,
            speed, qualityList, recordId, pointFileUrl,
            selectedDateRange, defaultMachineName, defaultPointName,
            qualityId, // 新增：品质等级ID
            judgeType  // 新增：标签类型
        } = this.state;

        return (
            <div>
                <div style={{ marginBottom: "10px" }}>
                    {/* 时间选择器（修复后：结束时间限制为当前时刻） */}
                    <RangePicker
                        value={selectedDateRange}
                        onChange={this.dateChange.bind(this)}
                        style={{ width: 300 }}
                        ranges={{
                            今天: [
                                moment().startOf('day'),
                                moment() // 关键：今天的结束时间直接设为当前时刻
                            ],
                            最近一周: [
                                moment().startOf('day').subtract(6, 'd'),
                                moment() // 结束时间也设为当前时刻
                            ],
                            最近一个月: [
                                moment().startOf('day').subtract(30, 'd'),
                                moment()
                            ],
                            最近三个月: [
                                moment().startOf('day').subtract(90, 'd'),
                                moment()
                            ],
                        }}
                        showTime={{
                            hideDisabledOptions: true,
                            // 动态设置默认时间：如果是今天，结束时间默认当前时刻；否则默认23:59:59
                            defaultValue: (selectedDateRange && selectedDateRange[1]?.isSame(moment(), 'day'))
                                ? [moment('00:00:00', 'HH:mm:ss'), moment()]
                                : [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]
                        }}
                        // 限制结束时间不能超过当前时刻
                        disabledDate={(current) => {
                            return current && current > moment().endOf('day');
                        }}
                        // 进一步限制时间选择：今天的结束时间不能选未来时间
                        disabledTime={(date, type) => {
                            if (type !== 'end') return {};
                            const now = moment();
                            const momentDate = date ? moment(date) : now;
                            // 只有结束日期是今天时，才限制时间
                            if (!momentDate.isSame(now, 'day')) return {};

                            // 统一禁用所有晚于当前时间的时分秒（Antd 内置逻辑更简洁）
                            return {
                                disabledHours: () => Array.from({ length: 24 }, (_, i) => i).filter(h => h > now.hour()),
                                disabledMinutes: (hour) => hour === now.hour()
                                    ? Array.from({ length: 60 }, (_, i) => i).filter(m => m > now.minute())
                                    : [],
                                disabledSeconds: (hour, minute) => (hour === now.hour() && minute === now.minute())
                                    ? Array.from({ length: 60 }, (_, i) => i).filter(s => s > now.second())
                                    : []
                            };
                        }}
                        format={dateFormat}
                    />

                    {/* 机型选择框：绑定value，确保显示和值一致 */}
                    <Select
                        value={defaultMachineName} // 显示选中的名称
                        placeholder='请选择机型'
                        style={{ marginLeft: "10px", width: '200px', marginTop: "10px" }}
                        onChange={this.chooseMachine.bind(this)}
                        filterOption={(input, option) => {
                            const childrenStr = option.props.children.toString().toLowerCase();
                            return childrenStr.indexOf(input.toLowerCase()) >= 0;
                        }}
                        optionFilterProp="children"
                        showSearch
                    >
                        {
                            (machineList || []).map((item, index) => (
                                <Option value={item.id} key={index}> {item.name} </Option>
                            ))
                        }
                    </Select>

                    {/* 转速选择框 */}
                    {
                        speedList.length != 0 &&
                        <Select
                            value={speed || ''}
                            placeholder='转速'
                            style={{ marginLeft: "10px", width: '60px', marginTop: "10px" }}
                            onChange={this.chooseSpeed.bind(this)}
                        >
                            <Option value={''} > 不限 </Option>
                            {
                                (speedList || []).map((item, index) => (
                                    <Option value={item.speed} key={index}> {item.speed} </Option>
                                ))
                            }
                        </Select>
                    }

                    {/* 正反转 */}
                    <Select
                        value="0"
                        placeholder="正反转"
                        style={{ marginLeft: "10px", width: '60px',marginTop:'10px'}}
                        onChange={this.modeChange.bind(this)}
                    >
                        <Option value='0' key='0'>正转</Option>
                        <Option value='1' key='1'>反转</Option>
                    </Select>

                    {/* 设备编号 */}
                    <Input
                        addonBefore="设备编号："
                        style={{ width: '250px', marginLeft: "10px",marginTop:'10px' }}
                        placeholder="请输入编号:"
                        value={machineNo}
                        name='machineNo'
                        onChange={this.inputChange.bind(this)}
                    />

                    {/* 点位选择框：绑定value，确保显示和值一致 */}
                    <Select
                        value={defaultPointName} // 显示选中的名称
                        placeholder='请选择点位'
                        style={{ width: 120, marginLeft: 10, outline: 'none',marginTop:'10px' }}
                        onChange={this.pointChange.bind(this)}
                        filterOption={(input, option) => {
                            const childrenStr = option.props.children.toString().toLowerCase();
                            return childrenStr.indexOf(input.toLowerCase()) >= 0;
                        }}
                        optionFilterProp="children"
                        showSearch
                    >
                        {
                            (pointList || []).map((item, index) => (
                                <Option value={item.id} key={index}> {item.pointName} </Option>
                            ))
                        }
                    </Select>

                    {/* 品质等级 */}
                    <Select
                        value={qualityId || ''}
                        placeholder='品质等级'
                        style={{ width: 80, marginLeft: 10, outline: 'none',marginTop:'10px' }}
                        onChange={this.qualityChange.bind(this)}
                    >
                        {
                            (qualityList || []).map((item, index) => (
                                <Option value={item.id} key={index}> {item.name} </Option>
                            ))
                        }
                    </Select>

                    {/* 标签 */}
                    <Select
                        value={judgeType || "0"}
                        placeholder="标签"
                        style={{ marginLeft: "10px", width: '80px',marginTop:'10px' }}
                        onChange={this.judgeChange.bind(this)}
                    >
                        <Option value='0' key='0'>所有标签</Option>
                        <Option value='1' key='1'>误判</Option>
                        <Option value='2' key='2'>漏判</Option>
                    </Select>

                    {/* 记录ID */}
                    <Input
                        addonBefore="记录id："
                        style={{ width: '250px', marginLeft: "10px" ,marginTop:'10px'}}
                        placeholder="请输入id:"
                        value={recordId}
                        name='recordId'
                        onChange={this.inputChange.bind(this)}
                    />

                    {/* 查询按钮 */}
                    <Button type="primary" style={{ marginLeft: 10,marginTop:'10px' }} onClick={() => this.getList()}> 查询 </Button>
                    <Button type="primary" style={{ marginLeft: 10,marginTop:'10px' }} onClick={() => this.getImage()}> 查看机型点位分布 </Button>
                </div>

                {/* 点位分布图弹窗 */}
                <Modal
                    title="机型听筒点位分布图"
                    visible={this.state.imgVisible}
                    onOk={() => { this.handleClose() }}
                    onCancel={() => { this.handleClose() }}
                    width="80%"
                >
                    {
                        pointFileUrl ?
                            <RViewerJS>
                                <img src={`${hostIp1}:36051/jiepai/hardware/device/type/das/soundDetector/wav-steam?fileName=${pointFileUrl}`} />
                            </RViewerJS>
                            : '还未上传！'
                    }
                </Modal>
            </div>
        )
    }
}

export default SearchPage;