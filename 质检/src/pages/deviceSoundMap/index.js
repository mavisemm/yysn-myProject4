import React from 'react';
import { connect } from 'dva';
import RouterComponent from '@src/utils/routerComponent';
import { Page, BtnWrap, Content } from 'rc-layout';
import { VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Select, Button, message, Alert, Modal } from 'antd';
const Option = Select.Option;
import { VtxUtil } from '@src/utils/util';
import { service,service1 } from './service';
import { windowToCanvas } from '@src/utils/util';
import comm from '@src/config/comm.config.js';
import styles from './index.less';

class DeviceSoundMap extends RouterComponent {
    constructor(props) {
        super(props);
        this.namespace = 'deviceSoundMap';
        
    }
    componentDidMount() {
        const [width, height] = this.getEditSize();
        $('#map').attr('width', width);
        $('#map').attr('height', height);

        this.act('getPoints', { init: true }).then(res => {
            this.initPoint(res, 'init');
        });
    }
    //清空画布
    clearCanvas = () => {
        /* let c = document.getElementById('map');
		c.height=c.height */
        if (!!$('#map')) {
            $('#map').remove();
            $('#editContent').append('<canvas id="map" style="position: absolute; inset: 0px;"/>');
            const [width, height] = this.getEditSize();
            $('#map').attr('width', width);
            $('#map').attr('height', height);
        }
    };
    //获取可编辑区域当前大小
    getEditSize = () => {
        return [$('#editContent').width(), $('#editContent').height()];
    };
    //渲染点位
    initPoint = (list = [], type) => {
        const { machineId, typeCode, deviceList,pointList,pointId, canAdd,pointName,mode } = this.props.deviceSoundMap;
        if(mode == 'query'){
            this.clearCanvas();
        }
        const t = this;
        const [width, height] = this.getEditSize();
        let canvas = document.getElementById('map');
        let ctx = canvas.getContext('2d');

        let list1 = [];
        for(let i = 0;i<list.length;i++){
            list1.push({
                ...list[i]
            })
        }
        let arr = [{
            horizontal: 1,
            vertical: 1,
        }]
        let list2 =  list1.concat(arr);
        // console.log(list2, 'list2')
        list2.map((item,index) => {
            let image = new Image();
            image.onload = function() {
                ctx.drawImage(image, item.horizontal * width, item.vertical * height);
            };
             ctx.globalCompositeOperation = "destination-over";
            image.src = require(`@src/assets/voiceIcon.png`);
            ctx.fillStyle = 'red';
            ctx.font = '600 20px normal';
            ctx.fillText(
                item.pointName || '',
                item.horizontal * width,
                item.vertical * height - 5,
            );
        });

     // ======编辑背景 todo
        const { imageid} = t.props.deviceSoundMap;
        var img = new Image();
        img.src = comm.downloadFileUrl+imageid;
        img.onload = function () {
            var pattern = ctx.createPattern(img, "no-repeat")
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height)
        }
        // ======
    };

    //新增点位
    addPoint = () => {
        const t = this;
        const [width, height] = t.getEditSize();
        const { machineId, typeCode, deviceList,pointList,pointId, canAdd,pointName } = t.props.deviceSoundMap;
        if (!canAdd) {
            return;
        }
        //1.清空画布
        t.clearCanvas();

        //2.设置鼠标监听事件，绘制点位
        let canvas = document.getElementById('map');
        let ctx = canvas.getContext('2d');
        let pointInfo = {};
        // // =====设置背景 todo
        const { imageid} = t.props.deviceSoundMap;
        var img = new Image();
        img.src = comm.downloadFileUrl+imageid;
        img.onload = function () {
            var pattern = ctx.createPattern(img, "no-repeat")
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height)
        }

        // // ===
        canvas.onmousedown = function(down) {
            //3.判断是否选定设备
            if (!pointId) {
                message.warn('请选择点位');
                return;
            }
            if (pointList.map(item => item.id).includes(pointId)) {
                message.warn('该点位已存在点位，可编辑修改点位');
                return;
            }
            canvas.onmouseup = function(up) {
                const { x, y } = windowToCanvas(canvas, up.clientX, up.clientY);
                //清除上次点位
                pointInfo.horizontal &&
                    ctx.clearRect(
                        pointInfo.horizontal * width,
                        pointInfo.vertical * height,
                        100,
                        100,
                    );
                //更新点位
                pointInfo = {
                    horizontal: x / width,
                    vertical: y / height,
                };
                t.initPoint([pointInfo]);
                t.updateState({
                    addPointInfo: pointInfo,
                });
            };
        };
    };

    //编辑点位
    editPoint = (point = {}) => {
        const t = this;
        const [width, height] = t.getEditSize();
        const { machineId, canEdit } = t.props.deviceSoundMap;
        if (!canEdit) {
            return;
        }
        //1.清空画布
        t.clearCanvas();
        Object.keys(point).length && t.initPoint([point]);

        //2.设置鼠标监听事件，绘制点位
        let canvas = document.getElementById('map');
        let ctx = canvas.getContext('2d');
        // // ======编辑背景 todo
        const { imageid} = t.props.deviceSoundMap;
        var img = new Image();
        img.src = comm.downloadFileUrl+imageid;
        img.onload = function () {
            var pattern = ctx.createPattern(img, "no-repeat")
            ctx.fillStyle = pattern;
            ctx.fillRect(0, 0, width, height)
        }
        // // ======
        let pointInfo = point;
        canvas.onmousedown = function(down) {
            if (!machineId) {
                message.warn('请选择设备');
                return;
            }
            canvas.onmouseup = function(up) {
                const { x, y } = windowToCanvas(canvas, up.clientX, up.clientY);
                //清除上次点位
                pointInfo.horizontal &&
                    ctx.clearRect(
                        pointInfo.horizontal * width,
                        pointInfo.vertical * height,
                        100,
                        100,
                    );
                //更新点位
                pointInfo = {
                    ...pointInfo,
                    horizontal: x / width,
                    vertical: y / height,
                };
                t.initPoint([pointInfo]);

                t.updateState({
                    editPointInfo: pointInfo,
                });
            };
        };
    };

    //开始新增
    toAdd = () => {
        this.updateState({
            mode: 'add',
            canAdd: true,
            canEdit: false,
        });
        // setTimeout(() => {
        //     this.addPoint();
        // }, 50);
        this.dealWay('add')
    };
    //开始编辑
    toEdit = () => {
        const { editPointInfo } = this.props.deviceSoundMap;
        this.updateState({
            mode: 'edit',
            canAdd: false,
            canEdit: true,
        });
        // setTimeout(() => {
        //     this.editPoint(editPointInfo);
        // }, 50);
        this.dealWay('edit')
    };
    //开始删除
    toDelete = () => {
        this.updateState({
            mode: 'delete',
            canAdd: false,
            canEdit: false,
        });
        this.dealWay('delete');
    };
    //取消
    cancel = () => {
        this.updateState({
            // mode: '',
            canAdd: false,
            canEdit: false,
            // detectorId: '',
            // machineId: '',
            // receiverId: '',
            // pointId:'',

        });
        this.act('initEditPointInfo');
        this.act('initAddPointInfo');
        this.clearCanvas();
        this.act('getPoints', { init: true }).then(res => {
            this.initPoint(res, 'init');
        });
    };

    // 根据机型查询点位
    query = ()=>{
        this.clearCanvas();
        this.updateState({
            mode: 'query',
            canAdd: false,
            canEdit: false,
        });
        const { dispatch, deviceSoundMap } = this.props;
        const {machineId,mode} = deviceSoundMap;
        if (!machineId) {
            message.warn('请先选择要查询的机型');
            return;
        }
        this.act('findByMachineId', { init: true }).then(res => {
            this.initPoint(res, 'init');
        });
        
    }
    saveImg = ()=>{
        let canvas = document.getElementById('map');
        var tempSrc = canvas.toDataURL("image/png");
        const { dispatch, deviceSoundMap } = this.props;
        const {machineId,mode} = deviceSoundMap;
        if (!mode) {
            message.warn('请先选择操作模式');
            return;
        }
        if (!machineId) {
            message.warn('请先选择要保存的机型');
            return;
        }
         let params = {
            id: machineId,
            pointBase64: tempSrc
         }
      
        service1.updateMachinePoint(VtxUtil.handleTrim(params)).then(res => {
            if (res.rc == 0) {
                message.success('保存成功')
            }else{
                message.error(res.msg)
            }
        })
    }

    dealWay = (mode)=>{
        // const { dispatch, deviceSoundMap } = this.props;
        // const {machineId,mode} = deviceSoundMap;
         switch (mode) {
            case 'add':
                setTimeout(() => {
                    this.addPoint();
                }, 50);
                break;
            case 'edit':
                this.act('getPoints').then(res => {
                    if (res.length) {
                        this.updateState({
                            editPointInfo: res[0],
                        });
                        setTimeout(() => {
                            this.editPoint(res[0]);
                        }, 50);
                    } else {
                        message.warn('该设备暂无点位，请先新增');
                    }
                });
                break;
            case 'delete':
                this.act('getPoints').then(res => {
                    if (res.length) {
                        let idList = [];
                        for(let i = 0;i<res.length;i++){
                            idList.push(res[i].id)
                        }
                        Modal.confirm({
                            content: `确定删除该设备点位吗`,
                            okText: '确定',
                            cancelText: '取消',
                            onOk: () => {
                                this.act('delete', {
                                    id: idList,
                                    onSuccess: () => {
                                        message.success('删除成功');
                                        this.cancel();
                                    },
                                });
                            },
                        });
                    } else {
                        message.warn('该设备暂无点位，请先新增');
                    }
                });
                break;
        
        }
    }

    render() {
        const { dispatch, deviceSoundMap } = this.props;
        const {
            pointList,
            classList,
            typeList,
            deviceList,
            objectInfo,
            classCode,
            typeCode,
            detectorId,
            machineId,
            receiverId,
            pointId,
            mode,
        } = deviceSoundMap;


        const deviceProps = {
            value: machineId || undefined,
            onChange: e => {
                if (!mode) {
                    message.warn('请先选择操作模式');
                    return;
                }
                for (let i = 0; i < deviceList.length; i++) {
                    if (e == deviceList[i].id) {
                        this.updateState({
                            machineFileId: deviceList[i].fileId,
                            machineFileName: deviceList[i].fileName,
                            machineFilePath: deviceList[i].filePath,
                            machineFileUrl: deviceList[i].fileUrl,
                            imageid: deviceList[i].fileId,
                            machineName: deviceList[i].name,
                            machineId: e,
                        });
                    }
                }

                   switch (mode) {
                     case 'query':
                        setTimeout(() => {
                            this.act('findByMachineId', { init: true }).then(res => {
                                this.initPoint(res, 'init');
                            });
                        }, 50);
                     break;
                }
            
            },
            placeholder: '请选择',
            style: {
                width: '200px',
            },
        };

        const classCodeProps = {
            value: pointId || undefined,
            onChange: e => {
                if (!mode) {
                    message.warn('请先选择操作模式');
                    return;
                }
                this.clearCanvas();
                for(let i = 0;i<pointList.length;i++){
                    if(e == pointList[i].id){
                        this.updateState({ 
                            pointId: e,
                            pointName: pointList[i].pointName,
                            detectorId:pointList[i].detectorId,
                            receiverId: pointList[i].receiverId,
                        });
                    }
                }

                this.dealWay(mode);
            },
            placeholder: '请选择',
            style: {
                width: '200px',
            },
        };

        return (
            <Page title="听筒点位管理">
                <BtnWrap>
                    <Button type="primary" onClick={() => this.toAdd()}>
                        新增点位
                    </Button>
                    <Button onClick={() => this.toEdit()}>修改点位</Button>
                    <Button type="danger" onClick={() => this.toDelete()}>
                        删除点位
                    </Button>
                    <Button onClick={() => this.query()} type='primary'>根据机型查询点位分布</Button>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                     
                    <Button
                        type="primary"
                        onClick={() =>
                            this.act('save', {
                                mode,
                                onSuccess: () => {
                                    message.success('保存成功');
                                    this.cancel();
                                },
                            })
                        }
                    >
                        保存
                    </Button>
                    <Button onClick={() => this.cancel()}>取消</Button>
                    <Button
                        type="primary"
                        onClick={() =>
                            this.saveImg()
                        }
                    >
                        保存点位图图片
                    </Button>

                </BtnWrap>

                <div className={styles.query}>
                    {/* 听音器：
                    <Select {...classCodeProps}>
                        {classList.map(item => {
                            return <Option key={item.id}>{item.name}</Option>;
                        })}
                    </Select> */}
                    {/* &nbsp;&nbsp;&nbsp;&nbsp; 听筒：
                    <Select {...typeCodeProps}>
                        {typeList.map(item => {
                            return <Option key={item.id}>{item.name}</Option>;
                        })}
                    </Select> */}
                    &nbsp;&nbsp;&nbsp;&nbsp; 机型：
                    <Select {...deviceProps}>
                        {deviceList.map(item => {
                            return <Option key={item.id}>{item.name}</Option>;
                        })}
                    </Select>
                    &nbsp;&nbsp;&nbsp;&nbsp;  点位：
                    <Select {...classCodeProps}>
                        {pointList.map(item => {
                            return <Option key={item.id}>{item.pointName}</Option>;
                        })}
                    </Select>
                </div>
                <Content top={96} className={styles.map} id="editContent">
                    <canvas
                        id="map"
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, }}
                    />
                </Content>
                {mode == 'add' && <Alert message="新增点位" banner />}
                {mode == 'edit' && <Alert message="编辑点位" banner />}
                {mode == 'delete' && <Alert message="删除点位" banner />}
                {mode == 'query' && <Alert message="根据机型查询点位分布" banner />}
            </Page>
        );
    }
}

export default connect(({ deviceSoundMap, loading }) => ({ deviceSoundMap, loading }))(DeviceSoundMap);
