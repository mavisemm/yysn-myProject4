import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button,Table } from 'antd';

function View(props) {
    const { updateWindow, modalProps, contentProps } = props;
    const {
        name,
        createTime,
        machineTypeDtos,
        dbMax, dbMin, vibrationMax, vibrationMin, torqueMax, torqueMin, temperatureMax, temperatureMin, hydraulicMax, hydraulicMin, speed, power, detailDtoList
    } = contentProps;
    const columns = [
        {
            title: '频段名称',
            dataIndex: 'name',
        },
        {
            title: '开始频段(Hz)',
            dataIndex: 'freq1',
        }, {
            title: '结束频段(Hz)',
            dataIndex: 'freq2',
        },
        {
            title: '能量(db)',
            dataIndex: 'db',
        },
        {
            title: '密度(%)',
            dataIndex: 'density',
        },
    ];
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
                        layout: { type: 'text', name: '标准名称', width: 100, key: 'name' },
                    }}
                >
                    {name}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '最小扭矩', width: 50, key: 'torqueMin' },
                    }}
                >
                    {torqueMin}
                </div>
                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '最大扭矩', width: 50, key: 'torqueMax' },
                    }}
                >
                    {torqueMax}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: '最小振动值', width: 50, key: 'vibrationMin' },
                    }}
                >
                    {vibrationMin}
                </div>
                 <div
                    data-modallist={{
                        layout: { type: 'text', name: '最大振动值', width: 50, key: 'vibrationMax' },
                    }}
                >
                    {vibrationMax}
                </div>

                
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '最小温度', width: 50, key: 'temperatureMin' },
                    }}
                >
                    {temperatureMin}
                </div>
                 <div
                    data-modallist={{
                        layout: { type: 'text', name: '最大温度', width: 50, key: 'temperatureMax' },
                    }}
                >
                    {temperatureMax}
                </div>

                 <div
                    data-modallist={{
                        layout: { type: 'text', name: '最小液压', width: 50, key: 'hydraulicMin' },
                    }}
                >
                    {hydraulicMin}
                </div>
                 <div
                    data-modallist={{
                        layout: { type: 'text', name: '最大液压', width: 50, key: 'hydraulicMax' },
                    }}
                >
                    {hydraulicMax}
                </div>

                
                 <div
                    data-modallist={{
                        layout: { type: 'text', name: '周期最小能量值', width: 50, key: 'dbMin' },
                    }}
                >
                    {dbMin}
                </div>
                 <div
                    data-modallist={{
                        layout: { type: 'text', name: '周期最大能量值', width: 50, key: 'dbMax' },
                    }}
                >
                    {dbMax}
                </div>

                <div
                    data-modallist={{
                        layout: { type: 'text', name: '转速', width: 50, key: 'speed' },
                    }}
                >
                    {speed}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '功率', width: 50, key: 'power' },
                    }}
                >
                    {power}
                </div>
                <div
                    data-modallist={{
                        layout: { type: 'text', name: '绑定机型', width: 100, key: 'machine' },
                    }}
                >
                    {
                        (machineTypeDtos || []).map((item,index)=>{
                            return (
                                <div key={index}>{item.name},&nbsp;&nbsp;</div>
                            )
                        })
                    }
                </div>
            </VtxModalList>
        </VtxModal>
    );
}

export default View;
