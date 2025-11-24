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
            showEdit:false,
            detailDtoList:[]
        };
    }

    modalListRef = ref => (this.modalList = ref);

    footerRender() {
        const { contentProps, updateWindow } = this.props;
        const { loading, save,soundList,updateItem } = contentProps;
        const {detailDtoList} = this.state;
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
                        updateItem({
                            detailDtoListARR: detailDtoList
                        })
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
        const {name,detailDtoList=[],soundList} = contentProps;
        this.setState({
            detailDtoList
        })
    }
    selectValue2 = (index, e) => {
        const { contentProps } = this.props;
        const { soundList } = contentProps;
        const { detailDtoList } = this.state;
    
        let temparr = [...detailDtoList];
    
        for (let i = 0; i < soundList.length; i++) {
            if (soundList[i].id == e) {
                temparr[index] = {
                    ...temparr[index],
                    detectorName: soundList[i].name + ' ',
                    detectorId: soundList[i].id
                };
                break;
            }
        }
    
        this.setState({
            detailDtoList: temparr
        });
    }
    addNew = ()=>{
        const {detailDtoList} = this.state;
        let tempArr = detailDtoList;
        let arr = [
            {
                detectorName: "",
                detectorId: "",
            }
        ]
        this.setState({
            detailDtoList: tempArr.concat(arr)
        })
    }
    deleteSound = (index) => {
        const {detailDtoList} = this.state;
        let arr = [...detailDtoList];
        arr.splice(index, 1);
        this.setState({
            detailDtoList: arr
        })
    }
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,name,updateItem,soundList} = contentProps;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '听音器设置' } }} />
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
                                name: '听音组名称',
                                width: 100,
                                key: 'name',
                            },
                            regexp: {
                                value: name,
                            },
                        }}
                    />
                    <div data-modallist={{ layout: { type: 'title', name: '绑定听音器' } }} />
                    {
                        this.state.detailDtoList.map((item, index) => {
                            return [ 
                                <div data-modallist={{ layout: { type: 'title', name: '听音器' + (index+1) } }} />,
                                <Select
                                    value={item.detectorName+' '}
                                    onChange={(e) => this.selectValue2(index, e)}
                                    data-modallist={{
                                        layout: {
                                            comType: 'input',
                                            name: '听音器',
                                            require: true,
                                            width: 100,
                                            key: 'detectorName',
                                        },
                                        regexp: {
                                            value: item.detectorName,
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
                                        (soundList || []).map((item, index) => {
                                            return (
                                                <Option key={item.id}>{item.name}</Option>
                                            )
                                        })
                                    }
                                </Select>  ,
                                <Button type='danger' onClick={()=>this.deleteSound(index)}>删除该听音器</Button>
                            ]
                        })
                    }
                    <div data-modallist={{ layout: { width:'100' } }} >
                        <BtnWrap>
                            <Button type="primary" onClick={()=>this.addNew()}>新增听音器</Button>
                        </BtnWrap>
                    </div>   
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
