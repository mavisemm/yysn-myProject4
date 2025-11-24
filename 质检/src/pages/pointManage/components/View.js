import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {pointName,updateTime,detectorName,receiverName} = contentProps;
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
                        layout: { type: 'text', name: '点位名称', width: 100, key: 'pointName' },
                    }}
                >
                    {pointName}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '听音器名称', width: 100, key: 'detectorName' },
                    }}
                >
                    {detectorName}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '听筒名称', width: 100, key: 'receiverName' },
                    }}
                >
                    {receiverName}
                </div>
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
