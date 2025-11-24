import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {groupName,updateTime,detailDtoList} = contentProps;
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
                        layout: { type: 'text', name: '更新时间', width: 50, key: 'updateTime' },
                    }}
                >
                    {updateTime}
                </div>
  
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '点位组名称', width: 100, key: 'pointName' },
                    }}
                >
                    {groupName}
                </div>
                <div data-modallist={{ layout: { type: 'title', name: '绑定点位名称',key:'title' } }} />
         
                 {(detailDtoList || []).map(item => {
                    return   <div
                        data-modallist={{
                            layout: { type: 'text', name: '点位名称', width: 100, key: item.detectorId },
                        }}
                    >
                        {item.pointDto.pointName}
                    </div> 
                })}
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
