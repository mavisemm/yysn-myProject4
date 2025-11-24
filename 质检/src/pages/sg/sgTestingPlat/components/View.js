import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {
        name,
        createTime,
        detailDtoList,
    } = contentProps;

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
                        layout: { type: 'text', name: '创建时间', width: 50, key: 'createTime' },
                    }}
                >
                    {createTime}
                </div>
  
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '检测台名称', width: 100, key: 'name' },
                    }}
                >
                    {name}
                </div>
                 {(detailDtoList || []).map(item => {
                    return   <div
                        data-modallist={{
                            layout: { type: 'text', name: '绑定检测设备名称', width: 100, key: item.id },
                        }}
                    >
                        {item.name}
                    </div> 
                })}
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
