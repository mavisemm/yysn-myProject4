import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {useCount,remark,tenantName,clientId} = contentProps;
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
                        layout: { type: 'text', name: '租户名称', width: 100, key: 'tenantName' },
                    }}
                >
                    {tenantName}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'clientId', width: 100, key: 'clientId' },
                    }}
                >
                    {clientId}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '月调用次数', width: 100, key: 'useCount' },
                    }}
                >
                    {useCount}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '描述', width: 100, key: 'remark' },
                    }}
                >
                    {remark}
                </div>
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
