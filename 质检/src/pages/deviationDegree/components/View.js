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
          ratios,
          startFreq,
          endFreq,
          freqCount,
          startDb,
          endDb,
          dbCount,
          negRatio,
          dbP,
          freqQ,
          dbWeight,
          freqWeight
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
                        layout: { type: 'text', name: 'ratios', width: 50, key: 'ratios' },
                    }}
                >
                    {ratios}
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
                        layout: { type: 'text', name: 'startDb', width: 50, key: 'startDb' },
                    }}
                >
                    {startDb}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'endDb', width: 50, key: 'endDb' },
                    }}
                >
                    {endDb}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'dbCount', width: 50, key: 'dbCount' },
                    }}
                >
                    {dbCount}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'negRatio', width: 50, key: 'negRatio' },
                    }}
                >
                    {negRatio}
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
                        layout: { type: 'text', name: 'dbWeight', width: 50, key: 'dbWeight' },
                    }}
                >
                    {dbWeight}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: 'freqWeight', width: 50, key: 'freqWeight' },
                    }}
                >
                    {freqWeight}
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
