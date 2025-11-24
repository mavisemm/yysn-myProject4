import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {
        name,
        createTime,
        receiverList,
        degree,
        degree2,
        sectionRate,dist
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
                        layout: { type: 'text', name: '听音器名称', width: 100, key: 'name' },
                    }}
                >
                    {name}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '计算稳定度', width: 100, key: 'degree' },
                    }}
                >
                    {degree}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '显示稳定度', width: 100, key: 'degree2' },
                    }}
                >
                    {degree2}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: '数据频度', width: 100, key: 'sectionRate' },
                    }}
                >
                    {sectionRate}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '是否展示距离', width: 100, key: 'dist' },
                    }}
                >
                    {dist == 1 ? '是' : '否'}
                </div>
                <div data-modallist={{ layout: { type: 'title', name: '听筒设置',key:'title' } }} />
         
                 {(receiverList || []).map(item => {
                    return   <div
                        data-modallist={{
                            layout: { type: 'text', name: '听筒信息', width: 100, key: item.id },
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
