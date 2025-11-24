import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
      const {
          id,
          detailDtoList,
          name,
          updateItem,
          startFreq,
          endFreq,
          freqCount,
          gamma,
          bj,
          kaoshi,
          dbP,
          freqQ,
          alpha,
          r
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
                {/* <div
                    data-modallist={{
                        layout: { type: 'text', name: '创建时间', width: 50, key: 'createTime' },
                    }}
                >
                    {createTime}
                </div> */}
  
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '参数组名称', width: 100, key: 'name' },
                    }}
                >
                    {name}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'startFreq', width: 50, key: 'startFreq' },
                    }}
                >
                    {startFreq}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'endFreq', width: 50, key: 'endFreq' },
                    }}
                >
                    {endFreq}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'freqCount', width: 50, key: 'freqCount' },
                    }}
                >
                    {freqCount}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'gamma', width: 50, key: 'gamma' },
                    }}
                >
                    {gamma}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'bj', width: 50, key: 'bj' },
                    }}
                >
                    {bj}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'kaoshi', width: 50, key: 'kaoshi' },
                    }}
                >
                    {kaoshi}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'db_p', width: 50, key: 'dbP' },
                    }}
                >
                    {dbP}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'freq_q', width: 50, key: 'freqQ' },
                    }}
                >
                    {freqQ}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'alpha', width: 50, key: 'alpha' },
                    }}
                >
                    {alpha}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'r', width: 50, key: 'r' },
                    }}
                >
                    {r}
                </div>
                <div data-modallist={{ layout: { type: 'title', name: '绑定机型',key:'title' } }} />
         
                 {(detailDtoList || []).map(item => {
                    return item.machineName && < div
                        data-modallist={{
                            layout: { type: 'text', name: '机型名称', width: 100, key: item.machineId },
                        }}
                    >
                        {item.machineName}
                    </div> 
                })}
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
