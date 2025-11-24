import isObject from 'lodash/isObject';
import pickBy from 'lodash/pickBy';
import { VtxUtil } from './util';
import { message } from 'antd';

/**
 * 请求封装
 * 支持 Get 和 Post 请求
 */
class Http {
    constructor(config) {
        this.defaults = config;
    }

    /**
     * Get 请求
     * @param  {string} url
     * @param  {object} [options]
     * @return {object}
     */
    get(url, options) {
        const { body = {}, extraHeader, header } = options;
        const { headers, extraQs = {} } = this.defaults;
        const postData = isObject(body)
            ? pickBy(body, function(value) {
                  return value !== '' && value !== undefined && value !== null;
              })
            : {};

        const config = {
            url,
            type: 'get',
            data: { ...extraQs, ...postData },
            dataType: 'json',
            cache: false,
            headers: {
                ...headers,
                ...header,
                ...this._mergePeration(extraHeader),
            },
        };
        return this._request(config);
    }

    /**
     * Post 请求
     * @param {string} url
     * @param {object} options
     */
    post(url, options) {
        const { body, extraHeader } = options;
        const config = {
            url,
            data: body,
            type: 'post',
            cache: false,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };
        return this._request(config);
    }


    /**
     * 合并操作信息
     * @param {object} extraHeader 操作明细信息
     */
    _mergePeration(extraHeader) {
        const { OPERATE_INFO } = this.defaults;
        if (OPERATE_INFO && extraHeader) {
            return {
                operation: encodeURIComponent(
                    JSON.stringify({
                        ...JSON.parse(OPERATE_INFO),
                        operation: extraHeader.msg,
                    }),
                ),
            };
        }
        return {};
    }

    _request(options) {
        const t = this;
        return new Promise((resolve, reject) => {
            $.ajax({
                ...options,
                success: function(response) {
                    resolve(response);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    reject(XMLHttpRequest, textStatus, errorThrown);
                },
            });
        })
            .then(response => {
                if (options.noHandle) {
                    return response;
                }
                return t._responseHandler(response);
            })
            .catch(err => {
                t._errorHandler(err);
                return { data: null };
            });
    }

    /**
     * 响应处理
     * @param {*} res
     */
    _responseHandler(res) {
        if (res) {
            return res;
        } else {
            message.error('请求数据失败，请刷新重试！');
        }
        return false;
    }

    /**
     * 请求错误处理
     * @param {*} err
     */
    _errorHandler(err) {
        if (err) {
            let msg;
            switch (err.status) {
                case 404:
                    msg = '接口请求不存在！错误码【404】。';
                    break;
                case 500:
                    msg = '服务端应用接口异常！错误码【500】。';
                    break;
                default:
                    msg = '请求错误，请检查网络是否连接或刷新重试！';
                    break;
            }
            message.error(msg);
        }
    }
}

const token = VtxUtil.getUrlParam('token');
const tenantId = VtxUtil.getUrlParam('tenantId');

const http = new Http({
    // 全局变量，记录操作信息，在 public/index.ejs 定义
    OPERATE_INFO: 'OPERATE_INFO' in window ? OPERATE_INFO : '',
    extraQs: { tenantId },
    headers: {
        tenantId,
        Authorization: token ? `Bearer ${token}` : '',
    },
    timeout:100000
});

export default http;
