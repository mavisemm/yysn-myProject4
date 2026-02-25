/**
 * 听音器及听筒设置
 * author : vtx shh
 * createTime : 2021-08-04 13:00:00
 */
import React from 'react';
import { connect } from 'dva';

import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon } from 'antd';
const Option = Select.Option;

import NewItem from './components/Add';

import EditItem from './components/Add';
import ViewItem from './components/View';

import { handleColumns, VtxTimeUtil } from '@src/utils/util';
import { vtxInfo } from '@src/utils/config';
const { tenantId, userId, token } = vtxInfo;
import SideBar from '@src/pages/sideBar';
import styles from './vSoundGroup.less';
const namespace = 'vSoundGroup';
function vSoundGroup({ dispatch, vSoundGroup, loading }) {
    const {
        searchParams,
        currentPage,
        pageSize,
        dataSource,
        total,
        selectedRowKeys,
        receiverList,
        editItem,
        newItem,
        viewItem,
        soundList
    } = vSoundGroup;
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

     const vtxGridParams = {
        // 名称
        nameProps: {
            value: searchParams.name,
            onChange(e) {
                updateState({
                    searchParams: {
                        name: e.target.value,
                    },
                });
            },
            placeholder: '请输入听音组名称',
            maxLength: '32',
        },

        query() {
            getList();
        },

        clear() {
            act('initQueryParams');
            act('getList');
        },
    };

    // 表格
    const columns = [
        ['听音组名称', 'name'],
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
                            updateState({
                                editItem: {
                                    ...rowData,
                                },
                            });
                            updateEditWindow();
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
        // autoFit 在窗口 resize 时可能反复抬高表体 minHeight，导致页面“越拉越高”
        autoFit: false,
        // 列宽超出时在表格内部横向滚动，避免右侧溢出（尤其是最后一列）
        scroll: { x: 'max-content' },
        // headFootHeight: 150,
        loading: loading.effects[`${namespace}/getList`],
        onChange(pagination, filters, sorter) {
            act('getList', {
                currentPage: pagination.current,
                pageSize: pagination.pageSize,
            });
        },
        pagination: {
            total,
            pageSize,
            current: currentPage,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '40', '50'],
            showQuickJumper: true,
            showTotal: total => `合计 ${total} 条`,
        },
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
            title: '听音器组管理 > 新增',
            visible: newItem.visible,
            onCancel: () => updateNewWindow(false),
            width: 900,
        },
        contentProps: {
            ...newItem,
            soundList,
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
            title: '听音器组管理 > 编辑',
            visible: editItem.visible,
            onCancel: () => updateEditWindow(false),
            width: 800,
        },

        contentProps: {
            ...editItem,
            soundList,
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
            title: '听音器组管理 > 查看',
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
        < Page title = "听音器组管理" className="pageLayoutRoot">
            <SideBar parent={this}></SideBar>
            <div className="pageLayoutRight">
                <div className="pageLayoutScroll">
                    <div className={styles.localFix}>
                <Content top={28}>
                    {/* <VtxGrid
                        titles={['听音组名称']}
                        gridweight={[2]}
                        confirm={vtxGridParams.query}
                        clear={vtxGridParams.clear}
                    >
                        <Input {...vtxGridParams.nameProps} />
                    </VtxGrid> */}
                        {/*按钮*/}
                        <BtnWrap>
                            <Button icon="file-add" onClick={() => updateNewWindow()}>
                                新增
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
                    {/*新增*/}
                    {newItem.visible && <NewItem {...newItemProps} />}
                    {/*编辑*/}
                    {editItem.visible && <EditItem {...editItemProps} />}
                    {/*查看*/}
            {viewItem.visible && <ViewItem {...viewItemProps} />}
                    </div>
                </div>
            </div>

        </Page>
    );
}

export default connect(({ vSoundGroup, loading }) => ({ vSoundGroup, loading }))(
    vSoundGroup,
);
