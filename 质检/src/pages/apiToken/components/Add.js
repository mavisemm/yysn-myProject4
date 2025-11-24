import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Cascader  } from 'antd';
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxUtil } from '@src/utils/util';
import { service,service1 } from '../service';
import axios from 'axios';
class Add extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            soundList:[]
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
        this.getList();
    }
    getList = () =>{
        let that = this;
        var formdata = new FormData();
        formdata.append("page", 1);
        formdata.append("rows", 500);
        formdata.append("sort", 'asc');
        axios({
            method: "post",
            url: 'http://47.101.211.204:8003/cloud/management/tenant/pageList.sa',
            data: formdata,
            headers: {
            "Content-Type": "multipart/form-data",
            },
        }).then((res) => {
            const data = res.data;
            if (data && data.result== "0") {
                that.setState({
                    soundList:data.data.rows || []
                })
            } else {
            }
        });
    }
    selectValue = (e)=>{
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,useCount,updateItem,} = contentProps;
        const {soundList} = this.state;
        for(let i = 0;i<soundList.length;i++){
            if(e == soundList[i].id){
                updateItem({
                    tenantName: soundList[i].tenantName,
                    tenantId: soundList[i].id,
                })
            }
        }
    }

    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,useCount,updateItem,tenantName,btnType,remark} = contentProps;
        console.log(contentProps,'contentProps')
        const {soundList} = this.state;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '基本设置' } }} />
                    <Input
                        value={useCount}
                        onChange={e => {
                            updateItem({
                                useCount: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '月调用次数',
                                width: 100,
                                key: 'useCount',
                            },
                            regexp: {
                                value: useCount,
                            },
                        }}
                    />
                    
                    <Select
                        value={tenantName}
                        onChange = {this.selectValue.bind(this)}
                        disabled={btnType == 'add'? false:true}
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                name: '绑定租户',
                                require: true,
                                width: 100,
                                key: 'tenantName',
                            },
                            regexp: {
                                value: tenantName,
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
                                    <Option key={item.id}>{item.tenantName}</Option>
                                )
                            })
                        }
                    </Select>
                    <Input
                        value = {remark}
                        rows={3}
                        type="textarea"
                        style={{ resize: 'none' }}
                        onChange = {
                            e => {
                                updateItem({
                                    remark: e.target.value,
                            });
                        }
                    }
                        name = "remark"
                        placeholder="请输入描述"
                        maxLength="200"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                name: '描述',
                                width: 100,
                                maxNum: 200,
                                key: 'remark',
                            },
                            regexp: {
                                value:remark,
                            },
                        }}
                    />
                    
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
