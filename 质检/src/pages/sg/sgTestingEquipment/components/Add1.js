import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select } from 'antd';
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
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,name,updateItem,type,btnType} = contentProps;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '设置' } }} />
                    {btnType == 'edit'? 
                        <div
                            data-modallist={{
                                layout: { type: 'text', name: '类型', width: 100, key: 'type' },
                            }}
                        >
                            {type}
                        </div> :              
                        <Select
                            value={type}
                            onChange={
                                e =>updateItem({
                                    type:e,
                                })
                            }
                            data-modallist={{
                                layout: {
                                    comType: 'input',
                                    name: '设备类型',
                                    require: true,
                                    width: 100,
                                    key: 'type',
                                },
                                regexp: {
                                    value: type,
                                },
                            }}
                        >
                            <Option key='VIBTE'>振动</Option>
                            <Option key='THERMAL'>红外</Option>
                        </Select>
                    }
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
                                name: '设备名称',
                                width: 100,
                                key: 'name',
                            },
                            regexp: {
                                value: name,
                            },
                        }}
                    />
                    {/* <Input
                        value={degree}
                        onChange={e => {
                            updateItem({
                                degree: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '计算稳定度',
                                width: 100,
                                key: 'degree',
                            },
                            regexp: {
                                value: degree,
                            },
                        }}
                    /> */}
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
