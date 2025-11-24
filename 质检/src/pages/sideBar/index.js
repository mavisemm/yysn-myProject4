
import React from 'react';
import { connect } from 'dva';
import { Modal, Button, message, Input, Icon } from 'antd';
import styles from './sideBar.less';
import { withRouter } from 'react-router-dom';
import { Page, Content, BtnWrap, TableWrap, Iframe } from 'rc-layout';
class SideBar extends React.Component {
    state = {
        loading: false,
        visible: false,
        editVisible: false,
        tenantId: '',
        oldPassword: '',
        password: '',
        userId: '',
        // 菜单分组
        menuGroups: [
    {
        title: "设备管理",
        items: [
                    {
                        name: "听音参数设置",
                        path: "/vParams",
                    },
                    {
                        name: "听音器及听筒管理",
                        path: "/vSound",
                    },
                    {
                        name: "听音器组管理",
                        path: "/vSoundGroup",
                    },
                    {
                        name: "机型管理",
                        path: "/voiceMachine",
                    },
                    {
                        name: "点位管理",
                        path: "/pointManage",
                    },
                    {
                        name: "品质等级管理",
                        path: "/vQuality",
                    },
                    {
                        name: "故障类型管理",
                        path: "/faultManage",
                    },
                    {
                        name: "标签管理",
                        path: "/labelManage",
                    },
                ]
        },
            {
                title: "数据分析",
                items: [
                            {
                                name: "标准库管理",
                                path: "/standardStore",
                            },
                            {
                                name: "历史标准库管理",
                                path: "/standardStoreHistory",
                            },
                        
                            {
                                name: "自动建标",
                                path: "/autoHistory",
                            },
                            {
                                name: "自动建标历史管理",
                                path: "/auto",
                            },
                ]
            },
            {
                title: "数据管理",
                items: [
                            {
                            name: "质量排序",
                            path: "/qualitySort",
                        },
                        {
                            name: "点位对比管理",
                            path: "/collectDataCompare",
                        },
                ]
            }
        ],
    }
    constructor(props) {
        super(props);
    }
    componentDidMount(){
        // 本地化部署，
        // 2.config.js中的租户id固定
        // sideBar打开，sidBar.less打开，
        // login页面调整
    }
    componentWillUnmount() {
       
    }
 
    barClick = (path,index) => {
        localStorage.sindex = index;
        if(this.props.history){
            this.props.history.push({
                pathname: path
            })
        }
    }
    GoPage = ()=>{
        window.open('http://115.236.25.110:8003/sound/#/login', '_blank');
    }
    render(){
        const {oldPassword,password,menuGroups} = this.state;
        return (
            <div>
                <div className={styles.sideBar}>
                    <div className={styles.sidebarHeader}>
                        后台管理系统
                    </div>
                    
                    {menuGroups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <div className={styles.menuGroupTitle}>
                                {group.title}
                            </div>
                            
                            <div className={styles.menuItems}>
                                {group.items.map((item, itemIndex) => {
                                    const uniqueIndex = `${groupIndex}-${itemIndex}`;
                                    return (
                                        <div 
                                            className={localStorage.sindex === uniqueIndex ? 'activesideBarName' : 'sideBarName'} 
                                            key={item.path} 
                                            onClick={() => this.barClick(item.path, uniqueIndex)}
                                        >
                                            {item.icon}
                                            {item.name}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))} 
                    {/* <BtnWrap>
                        <Button type='primary' onClick={()=>this.GoPage()}>
                            前往检测页面
                        </Button>
                    </BtnWrap> */}
                </div>
           
            </div>

        );
    }

}

export default withRouter(SideBar);
