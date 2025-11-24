import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Cascader  } from 'antd';
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
class Add extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
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
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,pointName,updateItem,soundList,btnType,detectorId} = contentProps;
        if(btnType == 'edit'){
            for(let i = 0;i<soundList.length;i++){
                if(soundList[i].id == detectorId){
                     updateItem({
                         receiverList: soundList[i].receiverList,
                     })
                }
            }
        }
    }
    selectValue = (e)=>{
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,pointName,updateItem,soundList,} = contentProps;
        for(let i = 0;i<soundList.length;i++){
            if(e == soundList[i].id){
                updateItem({
                    detectorName: soundList[i].name,
                     receiverList: soundList[i].receiverList,
                     detectorId: soundList[i].id
                })
            }
        }
    }
    selectValue1 = (e)=>{
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,pointName,updateItem,receiverList} = contentProps;
        for (let i = 0; i < receiverList.length; i++) {
            if (e == receiverList[i].id) {
                updateItem({
                    receiverName: receiverList[i].name,
                     receiverId: receiverList[i].id,
                })
            }
        }
    }
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,pointName,updateItem,soundList,receiverName,receiverList,detectorName} = contentProps;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '点位设置' } }} />
                    <Input
                        value={pointName}
                        onChange={e => {
                            updateItem({
                                pointName: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '点位名称',
                                width: 100,
                                key: 'pointName',
                            },
                            regexp: {
                                value: pointName,
                            },
                        }}
                    />
                    <Select
                        value={detectorName}
                        onChange = {this.selectValue.bind(this)}
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                name: '绑定听音器',
                                require: true,
                                width: 100,
                                key: 'detectorName',
                            },
                            regexp: {
                                value: detectorName,
                            },
                        }}
                        filterOption={(input, option) => {
                            // 确保 children 是字符串，并且调用 toLowerCase()
                            const childrenStr = option.props.children.toString().toLowerCase();
                            return childrenStr.indexOf(input.toLowerCase()) >= 0;
                        }}
                        optionFilterProp="children" showSearch
                    >
                        {
                            (soundList || []).map((item, index) => {
                                return (
                                    <Option key={item.id}>{item.name}</Option>
                                )
                            })
                        }
                    </Select>
                    <Select
                        value={receiverName}
                        onChange = {this.selectValue1.bind(this)}
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                name: '绑定听筒',
                                require: true,
                                width: 100,
                                key: 'receiverName',
                            },
                            regexp: {
                                value: receiverName,
                            },
                        }}
                    >
                        
                        {
                            (receiverList || []).map((item, index) => {
                                return (
                                    <Option key={item.id}>{item.name}</Option>
                                )
                            })
                        }
                    </Select>,
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
