
import React,{Component,useState } from 'react';
import { connect } from 'dva';
import ReactDOM from 'react-dom';
import { Page, Content, BtnWrap, TableWrap } from 'rc-layout';
import { VtxDatagrid, VtxGrid, VtxDate } from 'vtx-ui';
const { VtxRangePicker } = VtxDate;
import { Modal, Button, message, Input, Select, Icon ,Row, Col,Table,Progress,Checkbox,InputNumber,Spin,DatePicker,Switch   } from 'antd';
const { MonthPicker, RangePicker } = DatePicker;
import {service,service1} from './service';
import moment, { localeData } from 'moment';
import { vtxInfo } from '@src/utils/config';
const {  userId, token,tenantId } = vtxInfo;
import { VtxUtil } from '@src/utils/util';
import { times } from 'lodash';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import comm from '@src/config/comm.config.js';
message.config({
    top: 400,
    duration: 2,
});

// 查询品质等级维度
const queryTypeFind = () => {
    let params = {
        tenantId: VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId
    }
  return service.queryTypeFind(params)
    .then(res => {
      if (res.ret && res.rc === 0) {
          localStorage.status = JSON.stringify(res.ret);
      } else {
        message.error(res.err || '未知错误');
      }
      return res.ret;
    })
    .catch(error => {
      message.error('请求失败： ' );
      throw error;
    });
};

// 打标签列表
const getTagList = () => {
  let params = {
      tenantId: VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId
  }
return service1.getTagList(params)
  .then(res => {
    if (res.ret && res.rc === 0) {
        localStorage.tagList = JSON.stringify(res.ret);
    } else {
      message.error(res.err || '未知错误');
    }
    return res.ret;
  })
  .catch(error => {
    message.error('请求失败： ' );
    throw error;
  });
};

//查询机型
const queryMachine = () => {
    let params = {
        tenantId: VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId
    }
  return service.queryMachine(params)
    .then(res => {
             let arr = []
      if (res.ret && res.rc === 0) {
              let data = [];
              if (res.ret) {
                  data = res.ret;
                  data.map(item => {
                      if (item.machineList) {
                          arr = arr.concat(item.machineList)
                      }
                  })
              }
      } else {
        message.error(res.err || '未知错误');
      }
      return arr;
    })
    .catch(error => {
      message.error('请求失败： ' );
      throw error;
    });
};

// 查询听音器组列表
const getSoundGroupList = () => {
    let params = {
        tenantId: VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId
    }
  return service.getSoundGroupList(VtxUtil.handleTrim(params))
    .then(res => {
             let arr = []
      if (res.ret && res.rc === 0) {
            arr = res.ret;         
      } else {
        message.error(res.err || '未知错误');
      }
      return arr;
    })
    .catch(error => {
      message.error('请求失败： ' );
      throw error;
    });
};

// 点位列表
const getPointList = () => {
      let params = {
        filterPropertyMap: [
            {
                code: "tenantId",
                operate: "EQ",
                value: VtxUtil.getUrlParam('tenantId') ?  VtxUtil.getUrlParam('tenantId') : localStorage.tenantId
            },
        ],
        sortValueMap: [{
            code: 'point_name',
            sort: 'asc'
        }]
    }
    return service.getPointList(VtxUtil.handleTrim(params))
        .then(res => {
            let arr = []
            if (res.ret && res.rc === 0) {
                arr = res.ret.items || [];
            } else {
                message.error(res.err || '未知错误');
            }
            return arr;
        })
        .catch(error => {
            message.error('请求失败： ');
            throw error;
        });
};

export { queryTypeFind,queryMachine,getSoundGroupList,getPointList,getTagList };

