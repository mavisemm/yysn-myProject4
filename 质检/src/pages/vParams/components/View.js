import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button,Table } from 'antd';
    const columns = [
        {
            title: '开始频率(Hz)',
            dataIndex: 'freq1',
        },
        {
            title: '结束频率(Hz)',
             dataIndex: 'freq2',
        },
    ];
    const tableStyle = {
        bordered: true,
        loading: false,
        pagination: false,
        size: 'default',
        // rowSelection: {},
        scroll: undefined,
    }
function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {createTime,listenTime,startFrequency, endFrequency, frequencyCount,detailDtoList} = contentProps;
    return (
        <VtxModal
            {...modalProps}
            footer={[
                <Button
                    key="cancel"
                    size="large"
                    onClick={() => {
                        updateWindow(false);
                    }}
                >
                    取消
                </Button>,
            ]}
        >
            <VtxModalList>
                <div data-modallist={{layout: { type: 'text', name: '创建时间', width: 50, key: 'createTime' },}}>
                    {createTime}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '采音时间', width: 50, key: 'listenTime' },
                    }}
                >
                    {listenTime}s
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '开始频率', width: 50, key: 'startFrequency' },
                    }}
                >
                    {startFrequency}Hz
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '结束频率', width: 50, key: 'endFrequency' },
                    }}
                >
                    {endFrequency}Hz
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '分段数量', width: 50, key: 'frequencyCount' },
                    }}
                >
                    {frequencyCount}
                </div>
               <div data-modallist={{ layout: { width:'100' } }} >
                    周期分频段：
                    <Table rowKey='id' {...tableStyle} columns={columns} dataSource={detailDtoList} />
                </div>
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
