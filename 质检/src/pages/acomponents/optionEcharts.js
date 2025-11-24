
const echartsOption = {
    optionDb:{
        animation:false,
        title: {
            text: '能量曲线图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '20px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay:5000,
            confine:true,
        },
        legend: {
            data: ['能量'],
            left: 10,
        },
        large: true,
        dataZoom: [
            {
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                formatter: `{value}Hz`
            },
            interval: 1,
            data: []
        }],
        yAxis: [{
                name: '能量(db)',
                type: 'value',
                axisLabel: {
                    show: true,

                },
                scale:true
            },
        ],
        series: []
    },
    optionDensity:{
        animation: false,
        title: {
            text: '密度曲线图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '25px'
        },
        toolbox: {
            show: false
        },
        large: true,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay:5000,
            confine: true,
        },
        legend: {
            data: ['密度'],
            left: 10,
        },
        dataZoom: [{
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                formatter: `{value}Hz`
            },
            interval: 1,
            data: []
        }],
        yAxis: [{
                name: '密度(%)',
                type: 'value',
                axisLabel: {
                    show: true,
                },
                scale: true
            },
        ],
        series: []
    },
    optionDist: {
        animation: false,
        title: {
            text: '距离曲线图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '20px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay: 5000,
            confine: true,
        },
        legend: {
            data: ['距离'],
            left: 10,
        },
        large: true,
        dataZoom: [{
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 0,
                end: 100
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                formatter: `{value}Hz`
            },
            interval: 1,
            data: []
        }],
        yAxis: [{
            name: '距离',
            type: 'value',
            axisLabel: {
                show: true,

            },
            scale: true
        }, ],
        series: []
    },
    optionSingle:{
         animation: false,
        title: {
            text: '密度能量曲线图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '25px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
             hideDelay: 5000
        },
        legend: {
            data: ['密度', '能量'],
            left: 10,
        },
        dataZoom: [{
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                 formatter: `{value}Hz`
            },
            interval: 1,
            data:[]
        }],
        yAxis: [{
                name: '能量(db)',
                type: 'value',
                axisLabel: {
                    show: true,
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#fff'
                },
                scale:true

            },
            {
                name: '密度(%)',
             //    nameLocation: 'start',
                alignTicks: true,
                type: 'value',
                axisLabel: {
                    show: true,
               
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#fff'
                },
                splitLine: {
                    show: false
                },
             //    inverse: true
            },

        ],

        series: [{
                name: '能量',
                type: 'line',
                lineStyle: {
                    width: 1
                },
                axisLabel: {
                    show: true,
              
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#0090A3',
                        lineStyle: {
                            color: '#0090A3'
                        }
                    }
                },
             data: []
            },
            {
                name: '密度',
                type: 'line',
                yAxisIndex: 1,
                lineStyle: {
                    width: 1
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: 'pink',
                        lineStyle: {
                            color: 'pink'
                        }
                    }
                },
             data: []
            }
        ]
    },
    optionBuff:{
        animation: false,
        title: {
            text: '时序图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '25px'
        },
        toolbox: {
            show: false
        },
        large: true,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay:5000,
            confine: true,
        },
        legend: {
            data: ['value'],
            left: 10,
        },
        dataZoom: [{
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                formatter: `{value}s`
            },
            interval: 1,
            data: []
        }],
        yAxis: [{
                name: 'value',
                type: 'value',
                axisLabel: {
                    show: true,
                },
                scale: true
            },
        ],
        series: []
    },
    freqOptionListen:{
         animation: false,
        title: {
            text:'',
            left: 'right',
            textStyle: {
                color: 'white'
            }
        },
        grid: {
            bottom: 80,
            left: '40px',
            right: '30px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay: 5000
        },
        legend: {
            data:[],
                left: 10,
                textStyle: {
                    color: 'white'
                }
            },
            dataZoom: [{
                    show: true,
                    realtime: true,
                    start: 0,
                    end: 100
                },
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: 100
                }
            ],
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    onZero: false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    },
                    formatter: `{value}Hz`
                },
                interval: 1,
                data: []
            }
        ],
        yAxis: [
            {
                name: '能量(db)',
                type: 'value',
                scale: true,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    }
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#fff'
                },
            },
            {
                name: '密度(%)',
                alignTicks: true,
                type: 'value',
                scale: true,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    }
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#fff'
                },
                splitLine: {
                    show: false
                },
            },
        ],

        series: [
            {
                name: '密度',
                type: 'line',
                animation: false,
                smooth: true,
                yAxisIndex: 1,
                lineStyle: {
                    width: 1
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: 'red',
                        lineStyle: {
                            color: 'red'
                        }
                    }
                },
                data: []
            },
            {
                name: '能量',
                type: 'line',
                animation: false,
                lineStyle: {
                    width: 1
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    }
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#fabed4',
                        lineStyle: {
                            color: '#fabed4',
                        }
                    }
                },
                data: []
            },
      
   
        ]
    },
    freqOptionListenWhite:{
        animation: false,
       title: {
           text:'密度能量曲线图',
           left: 'center',
           textStyle: {
               color: 'black'
           }
       },
       grid: {
           bottom: 80,
           left: '40px',
           right: '30px'
       },
       toolbox: {
           show: false
       },
       tooltip: {
           trigger: 'axis',
           axisPointer: {
               type: 'cross',
               animation: false,
               label: {
                   backgroundColor: '#505765'
               }
           },
           hideDelay: 5000
       },
       legend: {
           data:[],
               left: 10,
            //    textStyle: {
            //        color: 'white'
            //    }
           },
           dataZoom: [{
                   show: true,
                   realtime: true,
                   start: 0,
                   end: 100
               },
               {
                   type: 'inside',
                   realtime: true,
                   start: 0,
                   end: 100
               }
           ],
           xAxis: [{
               type: 'category',
               boundaryGap: false,
               axisLine: {
                   onZero: false
               },
               axisLabel: {
                   show: true,
                //    textStyle: {
                //        color: 'white'
                //    },
                   formatter: `{value}Hz`
               },
               interval: 1,
               data: []
           }
       ],
       yAxis: [
           {
               name: '能量(db)',
               type: 'value',
               scale: true,
               axisLabel: {
                   show: true,
                //    textStyle: {
                //        color: 'white'
                //    }
               },
            //    nameTextStyle: { //y轴上方单位的颜色
            //        color: '#fff'
            //    },
           },
           {
               name: '密度(%)',
               alignTicks: true,
               type: 'value',
               scale: true,
               axisLabel: {
                   show: true,
                //    textStyle: {
                //        color: 'white'
                //    }
               },
            //    nameTextStyle: { //y轴上方单位的颜色
            //        color: '#fff'
            //    },
               splitLine: {
                   show: false
               },
           },
       ],

       series: [
           {
               name: '密度',
               type: 'line',
               animation: false,
               smooth: true,
               yAxisIndex: 1,
               lineStyle: {
                   width: 1
               },
               emphasis: {
                   focus: 'series'
               },
               itemStyle: {
                   normal: {
                       color: 'red',
                       lineStyle: {
                           color: 'red'
                       }
                   }
               },
               data: []
           },
           {
               name: '能量',
               type: 'line',
               animation: false,
               lineStyle: {
                   width: 1
               },
               axisLabel: {
                   show: true,
                //    textStyle: {
                //        color: 'white'
                //    }
               },
               emphasis: {
                   focus: 'series'
               },
               itemStyle: {
                   normal: {
                       color: '#fabed4',
                       lineStyle: {
                           color: '#fabed4',
                       }
                   }
               },
               data: []
           },
     
  
       ]
   },
    freqOptionListenNoZoom:{
        animation: false,
       title: {
           text:'',
           left: 'right',
           textStyle: {
               color: 'white'
           }
       },
       grid: {
           bottom: '20px',
           left: '40px',
           right: '30px'
       },
       toolbox: {
           show: false
       },
       tooltip: {
           trigger: 'axis',
           axisPointer: {
               type: 'cross',
               animation: false,
               label: {
                   backgroundColor: '#505765'
               }
           },
           hideDelay: 5000
       },
       legend: {
           data:[],
               left: 10,
               textStyle: {
                   color: 'white'
               }
           },
     
           xAxis: [{
               type: 'category',
               boundaryGap: false,
               axisLine: {
                   onZero: false
               },
               axisLabel: {
                   show: true,
                   textStyle: {
                       color: 'white'
                   },
                   formatter: `{value}Hz`
               },
               interval: 1,
               data: []
           }
       ],
       yAxis: [
           {
               name: '能量(db)',
               type: 'value',
               scale: true,
               axisLabel: {
                   show: true,
                   textStyle: {
                       color: 'white'
                   }
               },
               nameTextStyle: { //y轴上方单位的颜色
                   color: '#fff'
               },
           },
           {
               name: '密度(%)',
               alignTicks: true,
               type: 'value',
               scale: true,
               axisLabel: {
                   show: true,
                   textStyle: {
                       color: 'white'
                   }
               },
               nameTextStyle: { //y轴上方单位的颜色
                   color: '#fff'
               },
               splitLine: {
                   show: false
               },
           },
       ],

       series: [
           {
               name: '密度',
               type: 'line',
               animation: false,
               smooth: true,
               yAxisIndex: 1,
               lineStyle: {
                   width: 1
               },
               emphasis: {
                   focus: 'series'
               },
               itemStyle: {
                   normal: {
                       color: 'red',
                       lineStyle: {
                           color: 'red'
                       }
                   }
               },
               data: []
           },
           {
               name: '能量',
               type: 'line',
               animation: false,
               lineStyle: {
                   width: 1
               },
               axisLabel: {
                   show: true,
                   textStyle: {
                       color: 'white'
                   }
               },
               emphasis: {
                   focus: 'series'
               },
               itemStyle: {
                   normal: {
                       color: '#fabed4',
                       lineStyle: {
                           color: '#fabed4',
                       }
                   }
               },
               data: []
           },
         
       ]
   },
    optionBlackDist:{
         animation: false,
        title: {
            text:'',
            left: 'right',
            textStyle: {
                color: 'white'
            }
        },
        grid: {
            bottom: 80,
            left: '40px',
            right: '30px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay: 5000
        },
        legend: {
            data:[],
                left: 10,
                textStyle: {
                    color: 'white'
                }
            },
            dataZoom: [{
                    show: true,
                    realtime: true,
                    start: 0,
                    end: 100
                },
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: 100
                }
            ],
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    onZero: false
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    },
                    formatter: `{value}Hz`
                },
                interval: 1,
                data: []
            }
        ],
        yAxis: [
            {
                name: '距离',
                type: 'value',
                scale: true,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    }
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#fff'
                },
            },
            {
                name: '密度(%)',
                alignTicks: true,
                type: 'value',
                scale: true,
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    }
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#fff'
                },
                splitLine: {
                    show: false
                },
            },
        ],

        series: [
            {
                name: '密度',
                type: 'line',
                animation: false,
                smooth: true,
                yAxisIndex: 1,
                lineStyle: {
                    width: 1
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: 'red',
                        lineStyle: {
                            color: 'red'
                        }
                    }
                },
                data: []
            },
            {
                name: '距离',
                type: 'line',
                animation: false,
                lineStyle: {
                    width: 1
                },
                axisLabel: {
                    show: true,
                    textStyle: {
                        color: 'white'
                    }
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#fabed4',
                        lineStyle: {
                            color: '#fabed4',
                        }
                    }
                },
                data: []
            },
       
        ]
    },
    // 长时听音文件分析页面
    freqOptionListenBlack:{
         animation: false,
        title: {
            text:'',
            left: 'right',
        },
        grid: {
            bottom: 80,
            left: '60px',
            right: '60px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            // alwaysShowContent:true,
            hideDelay: 5000
        },
        legend: {
                data: ['密度','能量'],
                left: 10,
            },
            dataZoom: [{
                    show: true,
                    realtime: true,
                    start: 0,
                    end: 100
                },
                {
                    type: 'inside',
                    realtime: true,
                    start: 0,
                    end: 100
                }
            ],
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                axisLine: {
                    onZero: false
                },
                axisLabel: {
                    show: true,
                    formatter: `{value}Hz`
                },
                interval: 1,
                data: []
            }
        ],
        yAxis: [
       
            {
                name: '能量(db)',
                type: 'value',
                scale: true,
                axisLabel: {
                    show: true,
                },
                nameTextStyle: { //y轴上方单位的颜色
                    color: '#E53E30'
                },
            },
                 {
                     name: '密度(%)',
                     alignTicks: true,
                     type: 'value',
                     scale: true,
                     axisLabel: {
                         show: true,
                     },
                     nameTextStyle: { //y轴上方单位的颜色
                         color: '#19caad'
                     },
                     splitLine: {
                         show: false
                     },
                 },

        ],
        series: [
            {
                name: '密度',
                type: 'line',
                animation: false,
                smooth: true,
                yAxisIndex: 1,
                lineStyle: {
                    width: 1
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#19caad',
                        lineStyle: {
                            color: '#19caad'
                        }
                    }
                },
                data: []
            },
            {
                name: '能量',
                type: 'line',
                animation: false,
                lineStyle: {
                    width: 1
                },
                axisLabel: {
                    show: true,
                },
                emphasis: {
                    focus: 'series'
                },
                itemStyle: {
                    normal: {
                        color: '#E53E30',
                        lineStyle: {
                            color: '#E53E30',
                        }
                    }
                },
                data: []
            },
        ]
    },
    yDb:{

        animation:false,
        title: {
            text: '能量曲线图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '25px'
        },
        toolbox: {
            show: false
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay:5000,
            confine:true,
        },
        legend: {
            data: ['能量'],
            left: 10,
        },
        large: true,
        dataZoom: [
            {
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                formatter: `{value}Hz`
            },
            interval: 1,
            data: []
        }],
        yAxis: [
            {
                name: '能量(db)',
                type: 'value',
                axisLabel: {
                    show: true,

                },
                scale:true
            },
            {
                name: '权重',
                type: 'value',
                axisLabel: {
                    show: true,
                },
                scale: true,
            },
        ],
        series: []

    },
    yDensity:{
        animation: false,
        title: {
            text: '密度曲线图',
            left: 'center',
        },
        grid: {
            bottom: 60,
            left: '50px',
            right: '25px'
        },
        toolbox: {
            show: false
        },
        large: true,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
                animation: false,
                label: {
                    backgroundColor: '#505765'
                }
            },
            hideDelay:5000,
            confine: true,
        },
        legend: {
            data: ['密度'],
            left: 10,
        },
        dataZoom: [{
                show: true,
                realtime: true,
                start: 0,
                end: 100
            },
            {
                type: 'inside',
                realtime: true,
                start: 65,
                end: 85
            }
        ],
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
                onZero: false
            },
            axisLabel: {
                show: true,
                formatter: `{value}Hz`
            },
            interval: 1,
            data: []
        }],
        yAxis: [
            {
                name: '密度(%)',
                type: 'value',
                axisLabel: {
                    show: true,
                },
                scale: true
            },
            {
                name: '权重',
                type: 'value',
                axisLabel: {
                    show: true,
                },
                scale: true,
            },
        ],
        series: []
    },

}
export default echartsOption;
