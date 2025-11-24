import React from 'react';
import { VtxModal, VtxDatagrid } from 'vtx-ui';
import styles from './styles.less';
class ImportInfo extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { importInfo, showImportInfo, onCancel } = this.props;
        let { data, loading } = importInfo;
        //Modal属性
        const modalProps = {
            title: `导入信息详情`,
            visible: showImportInfo,
            footer: null,
            width: 1000,
            className: styles.import,
            onCancel: onCancel,
        };

        const datagridProps = {
            autoFit: true,
            dataSource: data,
            columns: [
                {
                    title: '行号',
                    key: 'rowNum',
                    dataIndex: 'rowNum',
                    width: 100,
                },
                {
                    title: '错误说明',
                    key: 'message',
                    dataIndex: 'message',
                },
            ],
            loading: loading,
            pagination: false,
        };
        return (
            <VtxModal {...modalProps}>
                <div className={styles.datagrid}>
                    <VtxDatagrid indexTitle="序号" {...datagridProps} />
                </div>
            </VtxModal>
        );
    }
}

export default ImportInfo;
