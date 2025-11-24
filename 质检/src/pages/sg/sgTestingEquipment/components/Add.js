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
            receiverList:[]
        };
    }

    modalListRef = ref => (this.modalList = ref);

    footerRender() {
        const { contentProps, updateWindow } = this.props;
        const { loading, save } = contentProps;
        const {receiverList} = this.state;
        
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
                    localStorage.receiverList = JSON.stringify(receiverList);
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
        const {name,description,config,receiverList=[]} = contentProps;
        this.setState({
            receiverList
        })
    }
    inputChange1 = (e,index) => {
        const {receiverList} = this.state;
        let arr = receiverList;
        arr[index] = {
            ...arr[index],
            [e.target.name]:e.target.value
        }
        this.setState({
            receiverList: arr,
        })
    }
    addNew = ()=>{
        const {receiverList} = this.state;
        let tempArr = receiverList;
        let arr = [
            {
                name:"",
                x:"",
            }
        ]
        this.setState({
            receiverList: tempArr.concat(arr)
        })
    }
    deleteSound = (index) => {
        const {receiverList} = this.state;
        let arr = [...receiverList];
        arr.splice(index, 1);
        this.setState({
            receiverList: arr
        })
    }
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,name,y,z,degree,degree2,sectionRate,updateItem,} = contentProps;
        
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
                                name: '听音器名称',
                                width: 100,
                                key: 'name',
                            },
                            regexp: {
                                value: name,
                            },
                        }}
                    />
                    <Input
                        value={degree}
                        onChange={e => {
                            updateItem({
                                degree: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '计算稳定度',
                                width: 100,
                                key: 'degree',
                            },
                            regexp: {
                                value: degree,
                            },
                        }}
                    />
                    <Input
                        value={degree2}
                        onChange={e => {
                            updateItem({
                                degree2: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '显示稳定度',
                                width: 100,
                                key: 'degree2',
                            },
                            regexp: {
                                value: degree2,
                            },
                        }}
                    />
                                  <Input
                        value={sectionRate}
                        onChange={e => {
                            updateItem({
                                sectionRate: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '数据频度',
                                width: 100,
                                key: 'sectionRate',
                            },
                            regexp: {
                                value: sectionRate,
                            },
                        }}
                    />
                    <div data-modallist={{ layout: { type: 'title', name: '听筒设置' } }} />
                    {
                        this.state.receiverList.map((item, index) => {
                            return [ 
                                <div data-modallist={{ layout: { type: 'title', name: '听筒' + (index+1) } }} />,
                                    <Input
                                    value = {
                                        item.name
                                    }
                                    name='name'
                                    onChange={
                                        e => this.inputChange1(e, index)
                                   }
                                    style={{marginTop:5}}
                                    placeholder = "请输入听筒名称"
                                    maxLength="32"
                                    data-modallist={{
                                        layout: {
                                            comType: 'input',
                                            name: '听筒名称',
                                            width: 100,
                                            key: 'name',
                                            require:true,
                                            isFullLine:true
                                        },
                                        regexp: {
                                            value: item.name,
                                        },
                                    }}
                                />,
                                <Button type='danger' onClick={()=>this.deleteSound(index)}>删除该听筒</Button>
                            ]
                        })
                    }
                    <div data-modallist={{ layout: { width:'100' } }} >
                        <BtnWrap>
                            <Button type="primary" onClick={()=>this.addNew()}>新增听筒</Button>
                        </BtnWrap>
                    </div>   
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
