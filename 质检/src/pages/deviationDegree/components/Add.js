import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button, Input, message, Select,Tree } from 'antd';
const TreeNode = Tree.TreeNode;
const { Option } = Select;
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
class Add extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showEdit:false,
            xpandedKeys: [],
            autoExpandParent: true,
            checkedKeys: [],
            detailDtoList:[]
        };
    }

    modalListRef = ref => (this.modalList = ref);

    footerRender() {
        const { contentProps, updateWindow } = this.props;
        const { loading, save,updateItem,machineList,btnType,detailDtoList } = contentProps;
        const {checkedKeys} = this.state;
        let detailDtoListArr = [];
        for (let i = 0; i < machineList.length;i++){
            detailDtoListArr = [];
            for(let j = 0;j<checkedKeys.length;j++){
                if (checkedKeys[j] == machineList[i].key){
          
                }else{
                    detailDtoListArr.push({
                        machineId: checkedKeys[j]
                    })
                }
            }
        }
        if(btnType == 'edit'){
            for(let i = 0;i<detailDtoListArr.length;i++){
                for(let j = 0;j<detailDtoList.length;j++){
                    if (detailDtoListArr[i].machineId == detailDtoList[j].machineId) {
                        detailDtoListArr[i] = {
                            ...detailDtoList[j],
                            ...detailDtoListArr[i]
                        }
                    }
                }
            }
        }
        
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
                    updateItem({
                        detailDtoList: detailDtoListArr
                    })
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
            let checkedKeys = [];
            for(let i = 0;i<detailDtoList.length;i++){
                checkedKeys.push(detailDtoList[i].machineId.toString())
            }
            this.setState({
                detailDtoList,
                checkedKeys
            })
        }
    }
    onExpand = (expandedKeys) => {
        this.setState({
          expandedKeys,
          autoExpandParent: false,
        });
    }
    onCheck = (checkedKeys) => {
        // console.log('onCheck', checkedKeys);
        this.setState({ checkedKeys });
    }
    renderTreeNodes = (data) => {
        return data.map((item) => {
          if (item.children) {
            return (
              <TreeNode title={item.title} key={item.key} dataRef={item}>
                {this.renderTreeNodes(item.children)}
              </TreeNode>
            );
          }
          return <TreeNode {...item} />;
        });
      }
    render() {
        const { dispatch, modalProps, contentProps } = this.props;
        const {id,machineList,name,updateItem,ratios,startFreq,endFreq,freqCount,startDb,endDb,dbCount,negRatio,dbP,freqQ,dbWeight,freqWeight} = contentProps;
        return (
            <VtxModal {...modalProps} footer={this.footerRender()}>
                <VtxModalList isRequired visible={modalProps.visible} ref={this.modalListRef}>
                    <div data-modallist={{ layout: { type: 'title', name: '偏差参数设置' } }} />
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
                                name: '参数组名称',
                                width: 100,
                                key: 'name',
                            },
                            regexp: {
                                value: name,
                            },
                        }}
                    />
                    <Input
                        value={ratios}
                        onChange={e => {
                            updateItem({
                                ratios: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: '过滤值',
                                width: 50,
                                key: 'ratios',
                            },
                            regexp: {
                                value: ratios,
                            },
                        }}
                    />
                    <Input
                        value={startFreq}
                        onChange={e => {
                            updateItem({
                                startFreq: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'startFreq',
                                width: 50,
                                key: 'startFreq',
                            },
                            regexp: {
                                value: startFreq,
                            },
                        }}
                    />
                    <Input
                        value={endFreq}
                        onChange={e => {
                            updateItem({
                                endFreq: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'endFreq',
                                width: 50,
                                key: 'endFreq',
                            },
                            regexp: {
                                value: endFreq,
                            },
                        }}
                    />

                     <Input
                        value={freqCount}
                        onChange={e => {
                            updateItem({
                                freqCount: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'freqCount',
                                width: 50,
                                key: 'freqCount',
                            },
                            regexp: {
                                value: freqCount,
                            },
                        }}
                    />
                    {/* <Input
                        value={startDb}
                        onChange={e => {
                            updateItem({
                                startDb: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'startDb',
                                width: 50,
                                key: 'startDb',
                            },
                            regexp: {
                                value: startDb,
                            },
                        }}
                    />
                    
                     <Input
                        value={endDb}
                        onChange={e => {
                            updateItem({
                                endDb: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'endDb',
                                width: 50,
                                key: 'endDb',
                            },
                            regexp: {
                                value: endDb,
                            },
                        }}
                    />

                 
                    <Input
                        value={dbCount}
                        onChange={e => {
                            updateItem({
                                dbCount: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'dbCount',
                                width: 50,
                                key: 'dbCount',
                            },
                            regexp: {
                                value: dbCount,
                            },
                        }}
                    />

                     <Input
                        value={negRatio}
                        onChange={e => {
                            updateItem({
                                negRatio: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'negRatio',
                                width: 50,
                                key: 'negRatio',
                            },
                            regexp: {
                                value: negRatio,
                            },
                        }}
                    />
                    <Input
                        value={dbP}
                        onChange={e => {
                            updateItem({
                                dbP: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'db_p',
                                width: 50,
                                key: 'dbP',
                            },
                            regexp: {
                                value: dbP,
                            },
                        }}
                    />
                    <Input
                        value={freqQ}
                        onChange={e => {
                            updateItem({
                                freqQ: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'freq_q',
                                width: 50,
                                key: 'freqQ',
                            },
                            regexp: {
                                value: freqQ,
                            },
                        }}
                    />
                    <Input
                        value={dbWeight}
                        onChange={e => {
                            updateItem({
                                dbWeight: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'dbWeight',
                                width: 50,
                                key: 'dbWeight',
                            },
                            regexp: {
                                value: dbWeight,
                            },
                        }}
                    />
                    <Input
                        value={freqWeight}
                        onChange={e => {
                            updateItem({
                                freqWeight: e.target.value,
                            });
                        }}
                        placeholder="请输入（必填项）"
                        maxLength="32"
                        data-modallist={{
                            layout: {
                                comType: 'input',
                                require: true,
                                name: 'freqWeight',
                                width: 50,
                                key: 'freqWeight',
                            },
                            regexp: {
                                value: freqWeight,
                            },
                        }}
                    /> */}
                    <div data-modallist={{ layout: { type: 'title', name: '绑定机型' } }} />
                    <Tree
                        checkable
                        onExpand={this.onExpand}
                        expandedKeys={this.state.expandedKeys}
                        autoExpandParent={this.state.autoExpandParent}
                        onCheck={this.onCheck}
                        checkedKeys={this.state.checkedKeys}
                    >
                        {this.renderTreeNodes(machineList)}
                    </Tree>
                
                  
                </VtxModalList>
            </VtxModal>
        );
    }
}

export default Add;
