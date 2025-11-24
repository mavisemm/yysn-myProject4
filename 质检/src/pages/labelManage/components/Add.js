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
    }

    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,tagName,updateItem,remark} = contentProps;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '标签设置' } }} />
                    <Input
                        value={tagName}
                        onChange={e => {
                            updateItem({
                                tagName: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '标签名称',
                                width: 100,
                                key: 'tagName',
                            },
                            regexp: {
                                value: tagName,
                            },
                        }}
                    />
                     <Input
                        value={remark}
                        onChange={e => {
                            updateItem({
                                remark: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: false,
                                name: '备注',
                                width: 100,
                                key: 'remark',
                            },
                            regexp: {
                                value: remark,
                            },
                        }}
                    />
            
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
