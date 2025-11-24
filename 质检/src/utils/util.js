import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import _isEqual from 'lodash/isEqual';

/*
    时间util类
 */
export const VtxTime = {
    /*
        获取时间
        time: 指定时间,  可以是任何类型的时间 
            默认:当前时间
        format: YYYY/MM/DD/HH/mm/ss
            类型: String
            默认: YYYY-MM-DD
        return: 返回匹配的时间字符串
     */
    getFormatTime: ({ time = new Date(), format = 'YYYY-MM-DD' } = {}) => {
        return moment(time).format(format);
    },
    /*
        时间加减
        time: 指定时间,  可以是任何类型的时间
            默认:当前时间
        format: YYYY/MM/DD/HH/mm/ss
            默认: YYYY-MM-DD
            类型: String
        type: 加/减   
            默认: add
            类型: String
            参数: add/subtract
        num: 正整数
            默认: 0
            类型: Number
        dateType: 加减的类型,如y代表加减几年, 参数: y/M/w/d/h/m/s/ms  默认d (String)
        return: 返回匹配的时间字符串
     */
    operationTime: ({
        time = new Date(),
        format = 'YYYY-MM-DD',
        type = 'add',
        num = 0,
        dateType = 'd',
    } = {}) => {
        const parseNum = VtxNum.replaceInt(num);
        return moment(time, format)
            [type](parseNum, dateType)
            .format(format);
    },
    /*
        获取毫秒时间
        time: 需要转换的时间
            默认: 0
        return: 返回对应类型的时间
     */
    getMsTime: time => {
        if (time) {
            return new Date(time).getTime();
        } else {
            return new Date().getTime();
        }
    },
};
/*
    正则匹配
 */
export const VtxRegex = {
    /*
        验证是几位浮点数 数字
        num 需要验证的数字
        n 是数字几位 例如2
     */
    checkFloatNumber(num, n) {
        let regex = new RegExp(`^-?(0|[1-9][0-9]*)(\.([0-9]?){${n}})?$`);
        return regex.test(num);
    },
    /*
        验证是否是数字
     */
    checkNumber(num) {
        let regex = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        return regex.test(num);
    },
    /*
        验证是否是正数
     */
    checkPositiveNumber(num) {
        let regex = /^(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        return regex.test(num);
    },
    /*
        验证是否是正整数
     */
    checkPositiveInteger(num) {
        let regex = /^(0|[1-9][0-9]*)$/;
        return regex.test(num);
    },
    /*
        验证是否是正几位小数
     */
    checkIntegerFloatNumber(num, n) {
        let regex = new RegExp(`^(0|[1-9][0-9]*)(\.([0-9]?){${n}})?$`);
        return regex.test(num);
    },
    /*
        验证是否是负数
     */
    checkNegativeNumber(num) {
        let regex = /^-(0|[1-9][0-9]*)(\.[0-9]*)?$/;
        return regex.test(num);
    },
    /*
        验证是否是负整数
     */
    checkNegativeInteger(num) {
        let regex = /^-(0|[1-9][0-9]*)$/;
        return regex.test(num);
    },
    /*
        验证是否是负几位小数
     */
    checkNegativeIntegerFloatNumber(num, n) {
        let regex = new RegExp(`^-(0|[1-9][0-9]*)(\.([0-9]?){${n}})?$`);
        return regex.test(num);
    },
    /*
        验证手机号码
        phone 需要验证的手机号码
     */
    checkCellphone(phone) {
        let regex = /^1\d{10}$/;
        return regex.test(phone);
    },
    /*
        验证号码
        tel 需要验证的号码
     */
    checkTelphone(tel) {
        let regex = /(^(\d{3,4}-)?\d*)$/;
        return regex.test(tel);
    },
    /*
        验证数组
        phone 需要验证的手机号码
     */
    checkArray(ary) {
        return ary instanceof Array;
    },
};

export class VtxTimeUtil {
    /**
     * 时间戳
     */
    static timeStamp(dateTime) {
        return moment(dateTime).valueOf();
    }

    /**
     * 时间比较
     * 场景：计算时间段相差的天数
     */
    static diff(startTime, endTime, fotmat = 'days') {
        return moment(endTime).diff(moment(startTime), fotmat);
    }

    /**
     * 判断时间跨度不能大于多少天/月/年
     * condition : gt大于  lt 小于 默认gt
     */
    static timeSpan(
        startTime,
        endTime,
        num,
        format = 'YYYY-MM-DD',
        condition = 'gt',
        conditionType = 'month',
    ) {
        let result = false;
        // 大于
        if (condition === 'gt') {
            result = !moment(
                moment(startTime)
                    .add(num, conditionType)
                    .format(format),
            ).isBefore(moment(endTime).format(format));
        }
        if (condition === 'lt') {
            result = !moment(
                moment(startTime)
                    .add(num, conditionType)
                    .format(format),
            ).isAfter(moment(endTime).format(format));
        }
        return result;
    }

    /**
     * type : { days, weeks, months, years...}
     */
    static subtractTime(value, type, format) {
        return moment()
            .subtract(value, type)
            .format(format);
    }

    /**
     * 检测是否年/月/日
     * date : 日期
     */
    static isDateType(date, format = 'YYYY-MM-DD') {
        return moment(date, format, true).isValid();
    }

    /**
     * 判断是否当前时间之后
     * disabledDate 场景使用
     */
    static isAfterDate(date, format = 'YYYY-MM-DD') {
        return moment(moment(date).format(format)).isAfter(moment().format(format));
    }

    /**
     * 判断是否当前时间之前
     * disabledDate 场景使用
     */
    static isBeforeDate(date, format = 'YYYY-MM-DD') {
        return moment(moment(date).format(format)).isBefore(moment().format(format));
    }

    static isAfter(startDate, endDate) {
        return moment(startDate).isAfter(endDate);
    }

    static isSame(date1, date2 = moment().format('YYYY-MM-DD'), dateType = 'day') {
        return moment(date1).isSame(date2, dateType);
    }

    /**
     * 获取指定日期所在星期的第一天和最后一天
     * date : String/moment
     */
    static getWeekStartAndEnd(date) {
        let startEnd = [];
        let currentWeekDay = moment(date).weekday();
        let startDate = moment(date)
            .subtract(currentWeekDay, 'days')
            .format('YYYY-MM-DD');
        let endDate = moment(date)
            .add(6 - currentWeekDay, 'days')
            .format('YYYY-MM-DD');
        startEnd = [startDate, endDate];
        return startEnd;
    }

    /**
     * 获取当月最后一天
     * return 默认“YYYY-MM-DD”
     */
    static getMonthLastDay(date, format = 'YYYY-MM-DD') {
        let yearNum = moment(date).year();
        // 获取当月是第几月， 从0开始
        let monthNum = moment(date).month();
        return moment([yearNum, 0, 31])
            .month(monthNum)
            .format(format);
    }

    static dateFormat(date, format = undefined) {
        if (!!format) {
            return moment(date).format(format);
        }
        return moment(date).format('ll');
    }
}
export const VtxNum = {
    /*
        字符串转成 float类型的字符串
        str: 需要处理的字符串 (String)
        return: 返回一个float类型的字符串
     */
    replaceFloat: str => {
        let b = str.toString().split('.');
        if (!b[1]) {
            if (str.indexOf('.') > -1) {
                return `${b[0].replace(/[^0-9]/g, '') || 0}.`;
            } else {
                return b[0].replace(/[^0-9]/g, '') || 0;
            }
        } else {
            if (!parseInt(b[1].replace(/[^0-9]/g, ''))) {
                if (parseInt(b[1].replace(/[^0-9]/g, '')) == 0) {
                    return `${b[0].replace(/[^0-9]/g, '') || 0}.${b[1].replace(/[^0-9]/g, '')}`;
                } else {
                    return b[0].replace(/[^0-9]/g, '') || 0;
                }
            } else {
                if (b[0].length > 1) {
                    return `${b[0].replace(/[^0-9]/g, '').replace(/^0*/g, '') || 0}.${b[1].replace(
                        /[^0-9]/g,
                        '',
                    )}`;
                } else {
                    return `${b[0].replace(/[^0-9]/g, '') || 0}.${b[1].replace(/[^0-9]/g, '')}`;
                }
            }
        }
    },
    /*
        字符串转成 Int类型的字符串
        str: 需要处理的字符串  支持number类型
        return: 返回一个Int类型的字符串
     */
    replaceInt: str => {
        return (
            str
                .toString()
                .split('.')[0]
                .replace(/[^0-9]/g, '')
                .replace(/^0*/g, '') || '0'
        );
    },
    /*
        取小数后几位
        num: 需要处理的 数字  支持String类型
        count: 需要保留的位数 Number
        return: 返回对应的float类型字符串
     */
    decimals: (num, count) => {
        let nary = VtxNum.replaceFloat(num)
                .toString()
                .split('.'),
            n = '';
        const decimal = parseInt(count);
        if (decimal > 0) {
            if (nary[1]) {
                n = `${nary[0]}.${nary[1].substr(0, decimal)}`;
                for (let i = 0; i < decimal - nary[1].length; i++) {
                    n = `${n}0`;
                }
            } else {
                n = nary[0];
                for (let j = 0; j < decimal; j++) {
                    if (j == 0) n = `${n}.0`;
                    else n = `${n}0`;
                }
            }
        } else {
            n = nary[0];
        }
        return n;
    },
};
/*
    其他公共方法
 */
export const VtxUtil = {
    /*
        获取url中 参数的值
        key: 参数前面的key
        return: 对应key的value
     */
    getUrlParam(key) {
        let paramObj = {};
        let matchList = window.location.href.match(/([^\?&]+)=([^&]+)/g) || [];
        for (let i = 0, len = matchList.length; i < len; i++) {
            let r = matchList[i].match(/([^\?&]+)=([^&]+)/);
            paramObj[r[1]] = r[2];
        }
        if (key) {
            return paramObj[key];
        } else {
            return paramObj;
        }
    },
    /*
        获取hash字符串
     */
    getHash() {
        let h = location.hash,
            xI = h.indexOf('/'),
            wI = h.indexOf('?');
        return h.substring(xI + 1, wI);
    },
    /*
        延迟时间
        time是延迟的时间  单位ms
     */
    delay: time => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },
    /*
     设置抬头
     title 设置的title名
     */
    setTitle: title => {
        document.title = title;
    },
    /*
        处理提交参数的前后空格
     */
    handleTrim(obj) {
        if (typeof obj == 'object') {
            let postData = {};
            for (let k in obj) {
                postData[k] = typeof obj[k] == 'string' ? obj[k].trim() : obj[k];
            }
            return postData;
        } else {
            return obj;
        }
    },
    /*
        数组去除重复
        只限 数组中值是字符串或number的
     */
    ArraywipeOffRepetition(ary = []) {
        let na = [];
        for (let i = 0; i < ary.length; i++) {
            if (na.indexOf(ary[i]) > -1) {
                continue;
            } else {
                na.push(ary[i]);
            }
        }
        return na;
    },
};

/*
    前后端数据转换处理工具
    -----demo-----
    const yourMapping = {a:'b'}; // 映射关系：原始key为a，转换后key替换为b
    const rawData = {a:100,ss:500}; //原始数据（后端返回的数据）
    const carDataConverter = new DataConverter(yourMapping);
    const new_data = carDataConverter.getMappingData(rawData); // 结果： {b:100}
 */

export class DataConverter {
    constructor(mapping) {
        this.mapping = mapping;
        this.reverseMap = this.getReverseMap(mapping);
    }
    getReverseMap(mapping) {
        let new_map = {};
        for (let k in mapping) {
            new_map[mapping[k]] = k;
        }
        return new_map;
    }
    /* 获取转换完成后的数据
    data: 【Object】需要转换的数据
    reverse: 【Bool】按照映射关系反向转换数据（默认正向转换）
    filter:【Bool】是否只获取在映射关系表内的数据（true:只获取在映射关系表内的数据,false:除了转换数据保留原数据的其他属性）
     */
    getMappingData(data, reverse = false, filter = true) {
        let new_date = {};
        let mapping = reverse ? this.reverseMap : this.mapping;
        for (let k in data) {
            if (k in mapping) {
                new_date[mapping[k]] = data[k];
            } else if (!filter) {
                new_date[k] = data[k];
            }
        }
        return new_date;
    }
}

export function handleColumns(data) {
    return data.map(item => {
        if (item[1] == 'action' || item.length == 3) {
            return {
                title: item[0],
                key: item[1],
                ...item[2],
            };
        }
        return {
            title: item[0],
            dataIndex: item[1],
            key: item[1],
        };
    });
}

// 处理树数据
export const looTreeData = (treeData, type) => {
    const loop = (data, type) => {
        return data.map(item => {
            return {
                ...item,
                key: item.id,
                selectable: item.type == type || item.leaf,
                children: item.children && item.children.length ? loop(item.children, type) : null,
            };
        });
    };
    return loop(treeData, type);
};

export function deepEqual(a, b) {
    return _isEqual(a, b);
}

// 秒转化为时间的格式化字符串
export function secondToFormatTime(times) {
    if (!times) return '';
    let timeStr = '';
    let remain = parseInt(times);

    let days = parseInt(remain / (24 * 60 * 60));
    if (days) timeStr += `${days}天`;

    remain = remain % (24 * 60 * 60);
    let hours = parseInt(remain / (60 * 60));
    if (hours) timeStr += `${hours}小时`;

    remain = remain % (60 * 60);
    let minutes = parseInt(remain / 60);
    if (minutes) timeStr += `${minutes}分`;

    let seconds = remain % 60;
    timeStr += `${seconds}秒`;

    return timeStr;
}

export function windowToCanvas(canvas, x, y) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left * (canvas.width / rect.width),
        y: y - rect.top * (canvas.height / rect.height),
    };
}
