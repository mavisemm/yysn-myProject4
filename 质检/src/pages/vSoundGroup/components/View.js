import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {name,createTime,updateTime,detailDtoList} = contentProps;
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
                        layout: { type: 'text', name: '编辑时间', width: 50, key: 'createTime' },
                    }}
                >
                    {updateTime}
                </div>
  
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '听音组名称', width: 100, key: 'name' },
                    }}
                >
                    {name}
                </div>
                
                <div data-modallist={{ layout: { type: 'title', name: '绑定听音器',key:'title' } }} />
         
                 {(detailDtoList || []).map(item => {
                    return   <div
                        data-modallist={{
                            layout: { type: 'text', name: '听音器名称', width: 100, key: item.detectorId },
                        }}
                    >
                        {item.detectorName}
                    </div> 
                })}
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
