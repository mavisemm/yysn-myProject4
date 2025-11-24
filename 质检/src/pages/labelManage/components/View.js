import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {tagName,updateTime,remark} = contentProps;
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
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '更新时间', width: 100, key: 'updateTime' },
                    }}
                >
                    {updateTime}
                </div>
  
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '标签名称', width: 100, key: 'tagName' },
                    }}
                >
                    {tagName}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '备注', width: 100, key: 'remark' },
                    }}
                >
                    {remark}
                </div>
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
