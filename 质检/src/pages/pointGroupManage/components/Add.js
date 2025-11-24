import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Cascader  } from 'antd';
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
class Add extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailDtoList:[]
        };
    }

    modalListRef = ref => (this.modalList = ref);

    footerRender() {
        const { contentProps, updateWindow } = this.props;
        const { loading, save } = contentProps;
        
        const _t = this;
        return [
            <Button
                key="cancel"
                size="large"
                onClick={() => {
                    updateWindow(false);
                }}
            >
                取消
            </Button>,
            <Button
                key="submit"
                type="primary"
                size="large"
                loading={loading}
                onClick={() => {
                    _t.modalList.submit().then(state => {
                        state && save(); // 保存事件
                    });
                }}
            >
                保存
            </Button>,
        ];
    }
    componentDidMount = () =>{
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,groupName,updateItem,pointId,pointList,machineList,machineId,btnType,detailDtoList} = contentProps;
        if (btnType == 'edit'){
            let arr = [];
            for(let i = 0;i<detailDtoList.length;i++){
                arr.push({
                    ...detailDtoList[i],
                    pointName: detailDtoList[i]?.pointDto?.pointName || ''
                })
            }
            this.setState({
                detailDtoList:arr
            })
        }
    }
     addNew = ()=>{
        const {detailDtoList} = this.state;
        let tempArr = detailDtoList;
        let arr = [
            {
                pointName: "",
                pointId: "",
            }
        ]
        this.setState({
            detailDtoList: tempArr.concat(arr)
        })
    }
     deletePoint = (index) => {
        const {contentProps} = this.props;
        const {pointList,updateItem} = contentProps;
        const {detailDtoList} = this.state;
        let arr = [...detailDtoList];
        arr.splice(index, 1);
        this.setState({
            detailDtoList: arr
        })
        updateItem({
            detailDtoList:arr
        })
    }
    selectValue = (index,e) => {
        const {contentProps} = this.props;
        const {pointList,updateItem} = contentProps;
        const {detailDtoList} = this.state;
        let arr = pointList;
        let temparr = detailDtoList;
        for(let i = 0;i<arr.length;i++){
            if(arr[i].id==e){
                temparr[index].pointName = arr[i].pointName;
                temparr[index].pointId = arr[i].id;
            }
        }
        updateItem({
            detailDtoList: temparr
        })
        this.setState({
            detailDtoList: temparr
        })
    }
    selectValue1 = (e)=>{
        const {contentProps} = this.props;
        const {machineList,updateItem} = contentProps;
        for(let i = 0;i<machineList.length;i++){
            if (machineList[i].id == e){
                updateItem({
                    machineName: machineList[i].name,
                    machineId:e
                })
            }
        }
    }

    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,groupName,updateItem,pointId,pointList,machineList,machineId,machineName} = contentProps;
        const {detailDtoList} = this.state;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '点位设置' } }} />
                    <Input
                        value={groupName}
                        onChange={e => {
                            updateItem({
                                groupName: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '点位组名称',
                                width: 100,
                                key: 'groupName',
                            },
                            regexp: {
                                value: groupName,
                            },
                        }}
                    />
                    <Select
                        value={machineName}
                        onChange={ this.selectValue1.bind(this)}
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                name: '绑定机型',
                                require: true,
                                width: 100,
                                key: 'machineName',
                            },
                            regexp: {
                                value: machineName,
                            },
                        }}
                        filterOption={(input, option) => {
                            // 确保 children 是字符串，并且调用 toLowerCase()
                            const childrenStr = option.props.children.toString().toLowerCase();
                            return childrenStr.indexOf(input.toLowerCase()) >= 0;
                        }}
                        optionFilterProp="children" showSearch
                    >
                        {
                            (machineList || []).map((item, index) => {
                                return (
                                    <Option key={item.id}>{item.name}</Option>
                                )
                            })
                        }
                    </Select>
                    {
                        (detailDtoList || []).map((item,index)=>{
                            return [
                                <div data-modallist={{ layout: { type: 'title', name: '点位' + (index+1) } }} />,
                                <Select
                                    value={item.pointName}
                                    onChange={
                                        this.selectValue.bind(this, index)
                                    }
                                    data-modallist={{
                                        layout: {
                                            comType: 'input',
                                            name: '绑定点位',
                                            require: true,
                                            width: 100,
                                            key: 'pointName',
                                        },
                                        regexp: {
                                            value: item.pointName,
                                        },
                                    }}
                                    filterOption={(input, option) => {
                                        // 确保 children 是字符串，并且调用 toLowerCase()
                                        const childrenStr = option.props.children.toString().toLowerCase();
                                        return childrenStr.indexOf(input.toLowerCase()) >= 0;
                                    }}
                                    optionFilterProp="children" showSearch
                                >
                                    {
                                        (pointList || []).map((item, index) => {
                                            return (
                                                <Option key={item.id}>{item.pointName}</Option>
                                            )
                                        })
                                    }
                                </Select>,
                                <Button type='danger' onClick={()=>this.deletePoint(index)}>删除该点位</Button>
                            ]
                        })
                    }
          
        
                    <div data-modallist={{ layout: { width:'100' } }} >
                        <BtnWrap>
                            <Button type="primary" onClick={()=>{
                              this.addNew()
                            }}>新增绑定点位</Button>
                        </BtnWrap>
                    </div>   
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
