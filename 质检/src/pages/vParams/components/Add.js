import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Switch } from 'antd';
import CycleSet from '@src/pages/acomponents/cycleSet';
const { Option } = Select;

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

    getCycleSet = (result, msg) => {
        const { dispatch, modalProps, contentProps } = this.props;
        const { updateItem } = contentProps;
        updateItem({
          detailDtoList: msg
        })
    }

    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {
            listenTime,
            updateItem,
            startFrequency,
            endFrequency,
            frequencyCount,
            detailDtoList,
        } = contentProps;

        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    {/* <div data-modallist={{ layout: { type: 'title', name: '基础设置' } }} /> */}
                    <Input
                        value={listenTime}
                        onChange={e => {
                            updateItem({
                                listenTime: e.target.value,
                            });
                        }}
                        placeholder="请输入"
                        maxLength="32"
                        addonAfter='s'
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                 require: true,
                                name: '采音时间',
                                width: 50,
                                key: 'listenTime',
                            },
                            regexp: {
                                value: listenTime,
                            },
                        }}
                    />
                    <Input
                        value={startFrequency}
                        onChange={e => {
                            updateItem({
                                startFrequency: e.target.value,
                            });
                        }}
                        placeholder="请输入"
                        maxLength="32"
                        addonAfter='Hz'
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                 require: true,
                                name: '开始频率',
                                width: 50,
                                key: 'startFrequency',
                            },
                            regexp: {
                                value: startFrequency,
                            },
                        }}
                    />
                        <Input
                        value={endFrequency}
                        onChange={e => {
                            updateItem({
                                endFrequency: e.target.value,
                            });
                        }}
                        placeholder="请输入"
                        maxLength="32"
                        addonAfter='Hz'
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                 require: true,
                                name: '结束频率',
                                width: 50,
                                key: 'endFrequency',
                            },
                            regexp: {
                                value: endFrequency,
                            },
                        }}
                    />
                        <Input
                        value={frequencyCount}
                        onChange={e => {
                            updateItem({
                                frequencyCount: e.target.value,
                            });
                        }}
                        placeholder="请输入"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                 require: true,
                                name: '分段数量',
                                width: 50,
                                key: 'frequencyCount',
                            },
                            regexp: {
                                value: frequencyCount,
                            },
                        }}
                    />
                    <div data-modallist={{ layout: { width:'100' } }} >
                        < CycleSet parent={this} freqDetailDtos={detailDtoList || []}/>
                    </div>
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
