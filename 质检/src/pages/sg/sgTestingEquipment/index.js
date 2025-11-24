
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon } from 'antd';
const Option = Select.Option;

import NewItem from './components/Add';
import NewItemOne from './components/Add1';

import EditItem from './components/Add';
import EditItemOne from './components/Add1';
import ViewItem from './components/View';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;

const namespace = 'sgTestingEquipment';
function sgTestingEquipment({ dispatch, sgTestingEquipment, loading }) {
    const {
        searchParams,
        currentPage,
        pageSize,
        dataSource,
        total,
        selectedRowKeys,
        receiverList,
        editItem,
        editItemOne,
        newItem,
        newItemOne,
        viewItem,
    } = sgTestingEquipment;
    const act = (func, payload = {}, space = namespace) => {
        dispatch({
            type: `${space}/${func}`,
            payload,
        });
    };

    const updateState = obj => {
        dispatch({
            type: `${namespace}/updateState`,
            payload: {
                ...obj,
            },
        });
    };
    
    const getList = () => {
        act('updateQueryParams');
        act('getList');
    };
    // 表格
    const columns = [
        ['设备类型', 'type'],
        ['设备名称', 'name'],
        ['创建时间', 'createTime'],
        ['编辑时间', 'updateTime'],
        [
            '操作',
            'action',
            {
                renderButtons: () => {
                    let btns = [];
                    btns.push({
                        name: '查看',
                        onClick(rowData) {
                            updateState({
                                viewItem: {
                                    ...rowData,
                                },
                            });
                            updateViewWindow();
                        },
                    });
                    btns.push({
                        name: '编辑',
                        onClick(rowData) {
                            if(rowData.type == 'SOUND'){
                                updateState({
                                    editItem: {
                                        ...rowData,
                                    },
                                });
                                updateEditWindow();
                            }else{
                                updateState({
                                    editItemOne: {
                                        ...rowData,
                                    },
                                });
                                updateEditWindow1();
                            }
                         
                        },
                    });
                    return btns;
                },
                width: '160px',
            },
        ],
    ];



    let vtxDatagridProps = {
        columns: handleColumns(columns),
        dataSource,
        hideColumn: true,
        indexTitle: '序号',
        indexColumn: true,
        startIndex: (currentPage - 1) * pageSize + 1,
        autoFit: true,
        // headFootHeight: 150,
        loading: loading.effects[`${namespace}/getList`],
        // onChange(pagination, filters, sorter) {
        //     act('getList', {
        //         currentPage: pagination.current,
        //         pageSize: pagination.pageSize,
        //     });
        // },
        // pagination: {
        //     total,
        //     pageSize,
        //     current: currentPage,
        //     showSizeChanger: true,
        //     pageSizeOptions: ['10', '20', '30', '40', '50'],
        //     showQuickJumper: true,
        //     showTotal: total => `合计 ${total} 条`,
        // },
        rowSelection: {
            type: 'checkbox',
            selectedRowKeys,
            onChange(selectedRowKeys, selectedRows) {
                updateState({
                    selectedRowKeys,
                });
            },
        },
    };
     //----------------振动、红外新增------------------
     const updateNewWindow1 = (status = true) => {
         updateState({
             newItemOne: {
                 visible: status,
             },
         });
         if (!status) {
             act('initNewItem');
         }
     };
     const newItemProps1 = {
         updateWindow: updateNewWindow1,
         modalProps: {
             title: '检测设备 > 新增',
             visible: newItemOne.visible,
             onCancel: () => updateNewWindow1(false),
             width: 900,
         },
         contentProps: {
             ...newItemOne,
             loading: loading.effects[`${namespace}/saveOrUpdateOne`],
             btnType: 'add',
             updateItem(obj) {
                 updateState({
                     newItemOne: {
                         ...obj,
                     },
                 });
             },
             save() {
                 act('saveOrUpdateOne', {
                     btnType: 'add',
                     onSuccess: function () {
                         message.success('新增成功');
                         updateNewWindow1(false);
                     },
                     onError: function () {
                         message.error('新增失败');
                     },
                 });
             },
         },
     };
  
    //----------------新增------------------
    const updateNewWindow = (status = true) => {
        updateState({
            newItem: {
                visible: status,
            },
        });
        if (!status) {
            act('initNewItem');
        }
    };
    const newItemProps = {
        updateWindow: updateNewWindow,
        modalProps: {
            title: '检测设备 > 新增',
            visible: newItem.visible,
            onCancel: () => updateNewWindow(false),
            width: 900,
        },
        contentProps: {
            ...newItem,
            loading: loading.effects[`${namespace}/saveOrUpdate`],
            btnType: 'add',
            updateItem(obj) {
                updateState({
                    newItem: {
                        ...obj,
                    },
                });
            },
            save() {
                act('saveOrUpdate', {
                    btnType: 'add',
                    onSuccess: function() {
                        message.success('新增成功');
                        updateNewWindow(false);
                    },
                    onError: function() {
                        message.error('新增失败');
                    },
                });
            },
        },
    };
    //--------------编辑-----------------
    const updateEditWindow = (status = true) => {
        updateState({
            editItem: {
                visible: status,
            },
        });
    };
    const editItemProps = {
        updateWindow: updateEditWindow,
        modalProps: {
            title: '检测设备 > 编辑',
            visible: editItem.visible,
            onCancel: () => updateEditWindow(false),
            width: 800,
        },

        contentProps: {
            ...editItem,
            loading: loading.effects[`${namespace}/saveOrUpdate`],
            btnType: 'edit',
            updateItem(obj) {
                updateState({
                    editItem: {
                        ...obj,
                        
                    },
                });
            },
            queryMachine(id) {
                act('getMachine', { id }, 'common');
            },
            save() {
                act('saveOrUpdate', {
                    btnType: 'edit',
                    onSuccess: function() {
                        message.success('编辑成功');
                        updateEditWindow(false);
                    },
                    onError: function() {
                        message.error('编辑失败');
                    },
                });
            },
        },
    };
    // =======================振动、红外编辑===================== 
     const updateEditWindow1 = (status = true) => {
         updateState({
             editItemOne: {
                 visible: status,
             },
         });
     };
     const editItemProps1 = {
         updateWindow: updateEditWindow1,
         modalProps: {
             title: '检测设备 > 编辑',
             visible: editItemOne.visible,
             onCancel: () => updateEditWindow1(false),
             width: 800,
         },

         contentProps: {
             ...editItemOne,
             loading: loading.effects[`${namespace}/saveOrUpdateOne`],
             btnType: 'edit',
             updateItem(obj) {
                 updateState({
                     editItemOne: {
                         ...obj,

                     },
                 });
             },
             save() {
                 act('saveOrUpdateOne', {
                     btnType: 'edit',
                     onSuccess: function () {
                         message.success('编辑成功');
                         updateEditWindow1(false);
                     },
                     onError: function () {
                         message.error('编辑失败');
                     },
                 });
             },
         },
     };
    //--------------查看-----------------
    const updateViewWindow = (status = true) => {
        updateState({
            viewItem: {
                visible: status,
            },
        });
    };
    const viewItemProps = {
        updateWindow: updateViewWindow,
        modalProps: {
            title: '检测设备 > 查看',
            visible: viewItem.visible,
            onCancel: () => updateViewWindow(false),
            width: 800,
        },
        contentProps: {
            ...viewItem,
            btnType: 'view',
        },
    };
 

    //--------------删除------------------
    const deleteItems = () => {
        Modal.confirm({
            content: `确定删除选中的${selectedRowKeys.length}条数据吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk() {
                act('deleteItems', {
                    ids: selectedRowKeys,
                    onSuccess: function(ids) {
                        let page =
                            currentPage != 1 && ids.length === total - (currentPage - 1) * pageSize
                                ? currentPage - 1
                                : currentPage;
                        act('getList', {
                            selectedRowKeys: [],
                            currentPage: page,
                        });
                        message.success('删除成功');
                    },
                    onError: function(msg) {
                        message.error(msg);
                    },
                });
            },
        });
    };

    return (
        < Page title = "检测设备管理" >
            <Content top={28}>
                {/*按钮*/}
                <BtnWrap>
                    <Button icon="file-add" onClick={() => updateNewWindow()}>
                        新增声音检测仪
                    </Button>
                      <Button icon="file-add" onClick={() => updateNewWindow1()}>
                        新增设备
                    </Button>
                    <Button
                        icon="delete"
                        disabled={selectedRowKeys.length == 0}
                        onClick={deleteItems}
                    >
                        删除
                    </Button>
                </BtnWrap>
                <TableWrap top={48}>
                    <VtxDatagrid {...vtxDatagridProps} />
                </TableWrap>
            </Content>
             {/*新增声音*/}
             {newItem.visible && <NewItem {...newItemProps} />}

            {/* 新增振动、红外 */}
            {newItemOne.visible && <NewItemOne {...newItemProps1} />}

            {/*编辑*/}
            {editItem.visible && <EditItem {...editItemProps} />}

            {/*振动、红外编辑*/}
            {editItemOne.visible && <EditItemOne {...editItemProps1} />}

            {/*查看*/}
            {viewItem.visible && <ViewItem {...viewItemProps} />}
        </Page>
    );
}

export default connect(({ sgTestingEquipment, loading }) => ({ sgTestingEquipment, loading }))(
    sgTestingEquipment,
);
