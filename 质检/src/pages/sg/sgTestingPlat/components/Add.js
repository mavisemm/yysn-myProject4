import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select } from 'antd';
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
        const {contentProps} = this.props;
        const {name,description,config,detailDtoList=[],btnType} = contentProps;
        if (btnType == 'edit'){
            let arr = [];
            for(let i = 0;i<detailDtoList.length;i++){
                arr.push({
                    ...detailDtoList[i],
                })
            }
            this.setState({
                detailDtoList:arr
            })
        }
    }
    selectValue = (index,e) => {
        const {contentProps} = this.props;
        const {equipmentList,updateItem} = contentProps;
        const {detailDtoList} = this.state;
        let arr = equipmentList;
        let temparr = detailDtoList;
        for(let i = 0;i<arr.length;i++){
            if(arr[i].id==e){
                temparr[index].name = arr[i].name;
                temparr[index].deviceId = arr[i].id;
            }
        }
        updateItem({
            detailDtoList: temparr
        })
        this.setState({
            detailDtoList: temparr
        })
    }
    addNew = ()=>{
        const {detailDtoList} = this.state;
        let tempArr = detailDtoList;
        let arr = [
            {
                name:"",
                deviceId:''
            }
        ]
        this.setState({
            detailDtoList: tempArr.concat(arr)
        })
    }
    deleteSound = (index) => {
        const {contentProps} = this.props;
        const {pointList,updateItem} = contentProps;
        const {detailDtoList} = this.state;
        let arr = [...detailDtoList];
        arr.splice(index, 1);
        this.setState({
            detailDtoList: arr
        })
        updateItem({
            detailDtoList: arr
        })
    }
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,name,updateItem,equipmentList} = contentProps;
          const {detailDtoList} = this.state;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <Input
                        value={name}
                        onChange={e => {
                            updateItem({
                                name: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '检测台名称',
                                width: 100,
                                key: 'name',
                            },
                            regexp: {
                                value: name,
                            },
                        }}
                    />
                    <div data-modallist={{ layout: { type: 'title', name: '绑定检测设备' } }} />

                    {
                        (detailDtoList || []).map((item,index)=>{
                            return [
                                <div data-modallist={{ layout: { type: 'title', name: '检测设备' + (index+1) } }} />,
                                <Select
                                    value={item.name}
                                    onChange={
                                        this.selectValue.bind(this, index)
                                    }
                                    data-modallist={{
                                        layout: {
                                            comType: 'input',
                                            name: '绑定检测设备',
                                            require: true,
                                            width: 100,
                                            key: 'name',
                                        },
                                        regexp: {
                                            value: item.name,
                                        },
                                    }}
                                >
                                    {
                                        (equipmentList || []).map((item, index) => {
                                            return (
                                                <Option key={item.id}>{item.name}</Option>
                                            )
                                        })
                                    }
                                </Select>,
                                <Button type='danger' onClick={()=>this.deleteSound(index)}>删除该检测设备</Button>
                            ]
                        })
                    }
                    <div data-modallist={{ layout: { width:'100' } }} >
                        <BtnWrap>
                            <Button type="primary" onClick={()=>this.addNew()}>新增绑定检测设备</Button>
                        </BtnWrap>
                    </div>   
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
