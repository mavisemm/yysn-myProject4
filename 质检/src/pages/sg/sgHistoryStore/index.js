import React from 'react';
import { connect } from 'dva';
import { Page, Content, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, } from 'vtx-ui';
import { message, Input, Select} from 'antd';
const Option = Select.Option;
import ViewItem from './components/View';
import { handleColumns } from '@src/utils/util';
import { VtxDatePicker } from 'vtx-ui/lib/VtxDate';
import moment from 'moment'

const namespace = 'sgHistoryStore';
function sgHistoryStore({ dispatch, sgHistoryStore, loading }) {
	const {
		searchParams, currentPage, pageSize, dataSource, total, typeList, statusList, viewItem, alarmObjectList,deviceNameList
	} = sgHistoryStore;

	const act = (func, payload = {}) => {
		dispatch({
			type: `${namespace}/${func}`,
			payload
		})
	}

	const updateState = (obj) => {
		dispatch({
			type: `${namespace}/updateState`,
			payload: {
				...obj
			}
		})
	}

    const getList = () => {
		act('updateQueryParams')
		act('getList')
    }

    const vtxGridParams = {
		// 报警对象
		codeProps: {
			value: searchParams.facilityName,
			onChange(e) {
				updateState({
		            searchParams: {
		                facilityName: e.target.value
		            }
		        })
			},
			placeholder: '请输入报警对象',
			maxLength: '32'
		},

		//报警开始时间
		startTimeProps:{
			value:searchParams.startTime,
			onChange(date,dateString) {
				if(searchParams.endTime&&moment(dateString).isAfter(searchParams.endTime)){
					message.error('开始时间不能在结束时间后')
				}else{
					updateState({
						searchParams: {
							startTime:dateString
						}
					})
				}
				
			},
			showTime:true,
			maxLength: '32'
		},
		//报警结束时间
		endTimeProps:{
			value:searchParams.endTime,
			onChange(date,dateString) {
				if(searchParams.startTime&&moment(dateString).isBefore(searchParams.startTime)){
					message.error('结束时间不能在开始时间前')
				}else{
					updateState({
						searchParams: {
							endTime:dateString
						}
					})
				}
				
			},
			showTime:true,
			maxLength: '32'
		},

		// // 类型
		// typeProps: {
		// 	value: searchParams.eventTypeCode || undefined,
		// 	onChange(e) {
		// 		updateState({
		//             searchParams: {
		//                 eventTypeCode: e
		//             }
		//         })
		// 	},
		// 	allowCLear:true,
		// 	showSearch: true,
		// 	optionFilterProp: "children",
		// 	placeholder: '请选择报警类型',
		// 	style: {
		// 		width: '100%'
		// 	}
		// },

		// // 报警对象类型
		// alarmObjectProps: {
		// 	value: searchParams.alarmObject || undefined,
		// 	onChange(e) {
		// 		updateState({
		//             searchParams: {
		//                 alarmObject: e
		//             }
		//         })
		// 	},
		// 	allowCLear:true,
		// 	showSearch: true,
		// 	optionFilterProp: "children",
		// 	placeholder: '请选择报警对象',
		// 	style: {
		// 		width: '100%'
		// 	}
		// },
		// // 设备名称
		// deviceNameProps:{
		// 	value: searchParams.deviceId || undefined,
		// 	    onChange(e) {
		// 	        updateState({
		// 	            searchParams: {
		// 	                deviceId: e
		// 	            }
		// 	        })
		// 	    },
		// 	    allowCLear: true,
		// 	    showSearch: true,
		// 	    optionFilterProp: "children",
		// 	    placeholder: '请选择设备名称',
		// 	    style: {
		// 	        width: '100%'
		// 	    }
		// },
        query() {
            getList();
        },

        clear() {
			act('initQueryParams')
			act('getList')
        }
    };

	// 表格
	const columns = [
		['检测时间', 'detectTime'],
		['机型', 'machineTypeName'],
		['检测台', 'platformName'],
		['温度', 'temperature'],
		['转速', 'rotateSpeed'],
		['扭矩', 'torque'],
		['液压', 'hydraulic'],
		['功率', 'power'],
		['振动', 'vibration'],
		// ['操作', 'action', { renderButtons : () => {
		// 	let btns = [];
	    // 	btns.push({
	    // 		name: '查看',
	    // 		onClick(rowData) {
		// 			updateState({
	    //                 viewItem: {
		// 					...rowData
	    //                 }
	    //             })
	    //             updateViewWindow();
	    // 		}
	    // 	})
	    // 	return btns;
		// }, width: '120px'}]
	];

	let vtxDatagridProps = {
		columns: handleColumns(columns),
		dataSource,
		hideColumn: true,
		indexColumn: true,
		startIndex: ( currentPage - 1 )*pageSize+1,
		indexTitle:'序号',
	    autoFit: true,
	    // headFootHeight: 150,
	    loading: loading.effects[`${namespace}/getList`],
	    onChange(pagination, filters, sorter){
			act('getList',{
				currentPage: pagination.current,
	            	pageSize: pagination.pageSize
			})
	    },
	    pagination:{
	   		total,
	    	pageSize,
	    	current: currentPage,
	        showSizeChanger: true,
	        pageSizeOptions: ['10', '20', '30', '40','50'],
	        showQuickJumper: true,
	        showTotal: total => `合计 ${total} 条`
		},
	};
	

	//--------------查看-----------------
    const updateViewWindow = (status = true) => {
		updateState({
            viewItem: {
                visible: status
            }
        })
    }
    const viewItemProps = {
        updateWindow: updateViewWindow,
        modalProps: {
            title: '查看',
            visible: viewItem.visible,
            onCancel: () => updateViewWindow(false),
            width: 900
        },
        contentProps: {
            ...viewItem,
            btnType: 'view'
        }
    };
    
  

	return (
		<Page title="设备报警">
            <VtxGrid
               titles={['开始时间','结束时间','报警类型', '报警对象','状态','设备名称']}
               gridweight={[1, 1, 1, 1, 1,1]}
               confirm={vtxGridParams.query}
               clear={vtxGridParams.clear}
            >
				<VtxDatePicker {...vtxGridParams.startTimeProps}/>
				<VtxDatePicker {...vtxGridParams.endTimeProps}/>
				{/* <Select {...vtxGridParams.typeProps}>
					{
						typeList.map((item)=>{
							return <Option key={item.key}>{item.text}</Option>
						})
					}
				</Select> */}
				{/*报警对象*/}
				{/* <Input {...vtxGridParams.codeProps}/> */}
				{/* <Select {...vtxGridParams.alarmObjectProps}>
					{
						alarmObjectList.map((item) => {
							return <Option key={item.key}>{item.text}</Option>
						})
					}
				</Select>
				<Select {...vtxGridParams.statusProps}>
					{
						statusList.map((item)=>{
							return <Option key={item.key}>{item.text}</Option>
						})
					}
				</Select> */}
		
            </VtxGrid>
			<Content top={48}>
				<TableWrap top={0}>
					<VtxDatagrid {...vtxDatagridProps}/>
				</TableWrap>
			</Content>
            {/*查看*/}
            {viewItem.visible && <ViewItem {...viewItemProps}/>}
		</Page>
	)
}

export default connect(
	({sgHistoryStore, loading}) => ({sgHistoryStore, loading})
)(sgHistoryStore);