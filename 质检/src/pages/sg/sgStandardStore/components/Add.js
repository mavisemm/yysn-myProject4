import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Checkbox  } from 'antd';
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
const CheckboxGroup = Checkbox.Group;
let defaultValueList = [];
class Add extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            plainOptions:[]
        };
    }
    modalListRef = ref => (this.modalList = ref);
    footerRender() {
        const { contentProps, updateWindow } = this.props;
        const { loading, save } = contentProps;
        const _t = this;
        return [
            <Button
                key="cancel"
                size="large"
                onClick={() => {
                    updateWindow(false);
                }}
            >
                取消
            </Button>,
            <Button
                key="submit"
                type="primary"
                size="large"
                loading={loading}
                onClick={() => {
                    _t.modalList.submit().then(state => {
                        state && save(); // 保存事件
                    });
                }}
            >
                保存
            </Button>,
        ];
    }
    componentDidMount = () =>{
        const {contentProps} = this.props;
        const {machineList,updateItem,btnType,machineTypeDtos} = contentProps;
        defaultValueList = [];
        let plainOptions = []
        if(btnType == 'edit'){
            for(let i = 0;i<machineTypeDtos.length;i++){
                defaultValueList.push(machineTypeDtos[i].id)
            }
        }
        for(let i = 0;i<machineList.length;i++){
            plainOptions.push({
                label:machineList[i].name,
                value:machineList[i].id,
                key: machineList[i].id,
            })
        }
        this.setState({
            plainOptions,
        })
    }
    
    onMachineChange = (checkedValues) => {
        const {contentProps} = this.props;
        const {machineList,updateItem} = contentProps;
         updateItem({
             machineIdList: checkedValues
         })
    }
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,name,updateItem,dbMax,dbMin,vibrationMax,vibrationMin,torqueMax,torqueMin,temperatureMax,temperatureMin,hydraulicMax,hydraulicMin,speed,power} = contentProps;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <Input
                        value={name}
                        onChange={e => {
                            updateItem({
                                name: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '标准名称',
                                width: 100,
                                key: 'name',
                            },
                            regexp: {
                                value: name,
                            },
                        }}
                    />
                    <Input
                        value={torqueMin}
                        onChange={e => {
                            updateItem({
                                torqueMin: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最小扭矩',
                                width: 50,
                                key: 'torqueMin',
                            },
                            regexp: {
                                value: torqueMin,
                            },
                        }}
                    />
                    <Input
                        value={torqueMax}
                        onChange={e => {
                            updateItem({
                                torqueMax: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最大扭矩',
                                width: 50,
                                key: 'torqueMax',
                            },
                            regexp: {
                                value: torqueMax,
                            },
                        }}
                    />
                     <Input
                        value={vibrationMin}
                        onChange={e => {
                            updateItem({
                                vibrationMin: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最小振动值',
                                width: 50,
                                key: 'vibrationMin',
                            },
                            regexp: {
                                value: vibrationMin,
                            },
                        }}
                    />
                    <Input
                        value={vibrationMax}
                        onChange={e => {
                            updateItem({
                                vibrationMax: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最大振动值',
                                width: 50,
                                key: 'vibrationMax',
                            },
                            regexp: {
                                value: vibrationMax,
                            },
                        }}
                    />
                    <Input
                        value={temperatureMin}
                        onChange={e => {
                            updateItem({
                                temperatureMin: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最小温度',
                                width: 50,
                                key: 'temperatureMin',
                            },
                            regexp: {
                                value: temperatureMin,
                            },
                        }}
                    />
                    <Input
                        value={temperatureMax}
                        onChange={e => {
                            updateItem({
                                temperatureMax: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最大温度',
                                width: 50,
                                key: 'temperatureMax',
                            },
                            regexp: {
                                value: temperatureMax,
                            },
                        }}
                    />
                     <Input
                        value={hydraulicMin}
                        onChange={e => {
                            updateItem({
                                hydraulicMin: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最小液压',
                                width: 50,
                                key: 'hydraulicMin',
                            },
                            regexp: {
                                value: hydraulicMin,
                            },
                        }}
                    />
                    <Input
                        value={hydraulicMax}
                        onChange={e => {
                            updateItem({
                                hydraulicMax: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '最大液压',
                                width: 50,
                                key: 'hydraulicMax',
                            },
                            regexp: {
                                value: hydraulicMax,
                            },
                        }}
                    />
                     <Input
                        value={dbMin}
                        onChange={e => {
                            updateItem({
                                dbMin: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '周期最小能量值',
                                width: 50,
                                key: 'dbMin',
                            },
                            regexp: {
                                value: dbMin,
                            },
                        }}
                    />
                    <Input
                        value={dbMax}
                        onChange={e => {
                            updateItem({
                                dbMax: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '周期最大能量值',
                                width: 50,
                                key: 'dbMax',
                            },
                            regexp: {
                                value: dbMax,
                            },
                        }}
                    />
                     <Input
                        value={speed}
                        onChange={e => {
                            updateItem({
                                speed: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '转速',
                                width: 50,
                                key: 'speed',
                            },
                            regexp: {
                                value: speed,
                            },
                        }}
                    />
                     <Input
                        value={power}
                        onChange={e => {
                            updateItem({
                                power: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '功率',
                                width: 50,
                                key: 'power',
                            },
                            regexp: {
                                value: power,
                            },
                        }}
                    />
                    <div
                        data-modallist={{
                            layout: { type: 'text', name: '绑定机型', width: 100, key: 'machine' },
                        }}
                    >
                        <CheckboxGroup options={this.state.plainOptions} key={defaultValueList} defaultValue={defaultValueList} onChange={this.onMachineChange} />
                    </div>
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
