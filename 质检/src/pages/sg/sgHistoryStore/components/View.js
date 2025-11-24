import React from 'react';

import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Button } from 'antd';
import styles from './index.less'

function View(props) {

	const { updateWindow, modalProps, contentProps } = props;
	
	const { typeName, facilityName, time,eventTypeCode,dataJson }  = contentProps;
	let data = dataJson?JSON.parse(dataJson):{}
	let head = eventTypeCode.slice(0,9)
	let heatmapFileIdList = data?.heatmapFileIdList || []
	let heatmapFile = heatmapFileIdList.map((item)=>{
		return {
			id:item
		}
	})
	let imageFileIdList = data?.imageFileIdList || []
	let imageFile = imageFileIdList.map((item)=>{
		return {
			id:item
		}
	})

	// 
	  let areaList = [{width:"",height:'',top:'',left:''}];
		if (data.area) {
			let area = data.area[0];
			let point1 = area.split(',');
			let point = [[point1[0],point1[1]],[point1[2],point1[3]],[point1[4],point1[5]],[point1[6],point1[7]]]
			areaList[0].width = (parseFloat(point[2][0]) * 100 - parseFloat(point[0][0]) * 100) + "%"
			areaList[0].height = (parseFloat(point[2][1]) * 100 - parseFloat(point[0][1]) * 100) + "%"
			areaList[0].top = parseFloat(point[0][1]) * 100 + "%"
			areaList[0].left = parseFloat(point[0][0]) * 100 + "%"
		}

	return (
		<VtxModal
			{...modalProps}
			footer={[
				<Button key="cancel" size="large" onClick={()=>{
					updateWindow(false);
				}}>取消</Button>
			]}
		>
			<div className={styles.modalList}>
			<VtxModalList>
				<div
					data-modallist={{
					    layout: {type: 'text', name: '发生时间', width: 50, key: 'time'}
					}}
				>{time}</div>
				<div
					data-modallist={{
					    layout: {type: 'text', name: '报警类型', width: 50, key: 'typeName'}
					}}
				>{typeName}</div>
				<div
					data-modallist={{
					    layout: {type: 'text', name: '报警对象', width: 50, key: 'facilityName'}
					}}
				>{facilityName}</div>
				{eventTypeCode=='CART_TEMPERATURE'&&<div
					data-modallist={{
					    layout: {type: 'text', name: '报警区域', width: 50, key: 'distance'}
					}}
				>{data?.position?data?.position=='0'?'底部':data?.position=='1'?'中部':'顶部':''}</div>}
				{(eventTypeCode=='TEMPERATURE'||eventTypeCode=='FIXED_POINT_TEMPERATURE'||eventTypeCode=='CART_TEMPERATURE')&&<div
					data-modallist={{
					    layout: {type: 'text', name: '报警温度', width: 50, key: 'maxTemperature'}
					}}
				>{eventTypeCode=='FIXED_POINT_TEMPERATURE'?data?.maxTemperature:data?.value}</div>}

				{eventTypeCode=='RANGE_FINDING'&&<div
					data-modallist={{
					    layout: {type: 'text', name: '测距距离', width: 50, key: 'distance'}
					}}
				>{data?.value}</div>}
				{eventTypeCode=='CART_ORE_ACCUMULATION'&&<div
					data-modallist={{
					    layout: {type: 'text', name: '积矿高度', width: 50, key: 'height'}
					}}
				>{data?.value}</div>}
				{eventTypeCode=='CART_COLLISION_AVOIDANCE_TIMEOUT'&&<div
					data-modallist={{
					    layout: {type: 'text', name: '防撞超时时间', width: 50, key: 'overtime'}
					}}
				>{data?.value}</div>}
				{head=='AI_IMAGE_'&&<div
					data-modallist={{
					    layout: {type: 'text', name: '数值', width: 50, key: 'value'}
					}}
				>{data?.value}</div>}
				{(eventTypeCode=='TEMPERATURE'||eventTypeCode=='FIXED_POINT_TEMPERATURE'||eventTypeCode=='CART_TEMPERATURE')&&<div
				    data-modallist={{
					    layout: {type: 'text', name: '红外热图', width: 100, key: 'heatmapFileId'}
					}}
				>
				    <VtxUpload2
				        showUploadList={true}
				        fileList={eventTypeCode=='FIXED_POINT_TEMPERATURE'?data?.heatmapFileId?[{id:data.heatmapFileId}]:[]:heatmapFile||[]}
						mode="multiple"
						listType='picture-card'
				        action="/cloudFile/common/uploadFile"
				        downLoadURL="/cloudFile/common/downloadFile?id="
				        viewMode={true}
				    />
				</div>}
				{head=='AI_IMAGE_'&&<div
				    data-modallist={{
					    layout: {type: 'text', name: '照片', width: 100, key: 'imageFileId'}
					}}
				>
				    {/* <VtxUpload2
				        showUploadList={true}
				        fileList={data?.imageFileId?[{id:data.imageFileId}]:[]}
						mode="multiple"
						listType='picture-card'
				        action="/cloudFile/common/uploadFile"
				        downLoadURL="/cloudFile/common/downloadFile?id="
				        viewMode={true}
				    /> */}
					
					 <div style={{width:"100%",height:"100%",position:"relative"}}>
						<img style={{width:"100%",height:"100%",display:"block"}} src={'http://192.168.72.205:9095/cloudFile/common/downloadFile?id=' + data.imageFileId}></img>
						{
							(areaList || []).map((item, index) => {
								return <div key={index} style={{position:"absolute",top:item.top,left:item.left,width:item.width,height:item.height,border:"3px solid red",fontSize:"12px",wordBreak:"break-all"}}>
								</div>
							})
						}
					</div>

				</div>}
				{eventTypeCode=='CART_TEMPERATURE'&&<div
				    data-modallist={{
					    layout: {type: 'text', name: '拍照附件', width: 100, key: 'imageFileIdList'}
					}}
				>
				    <VtxUpload2
				        showUploadList={true}
				        fileList={data?.imageFileIdList?imageFile:[]}
						mode="multiple"
						listType='picture-card'
				        action="/cloudFile/common/uploadFile"
				        downLoadURL="/cloudFile/common/downloadFile?id="
				        viewMode={true}
				    />
				</div>}

				{(eventTypeCode=='TEMPERATURE'||eventTypeCode=='CART_TEMPERATURE')&&<div
				    data-modallist={{
					    layout: {type: 'text', name: '录音', width: 100, key: 'audioFileId'}
					}}
				>
					<div styles={{height:'54px',width:'300px'}}>
						<audio src={`/cloudFile/common/downloadFile?id=${data?.audioFileId}`} controls controlsList="nodownload"></audio>
					</div>
				</div>}
			</VtxModalList>
			</div>
		</VtxModal>
	)
}

export default View;