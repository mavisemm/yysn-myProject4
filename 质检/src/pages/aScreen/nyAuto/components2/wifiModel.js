import React,{ Component } from 'react';
import { VtxModal, VtxModalList, VtxUpload } from 'vtx-ui';
const { VtxUpload2 } = VtxUpload;
import { Tree,Icon,Modal,Input,Badge,message,Select,Form ,Checkbox,Tabs,Button } from 'antd';
import { vtxInfo } from '@src/utils/config';
class Mulitipe extends Component {
    state = {
       wifiName:'',
       wifiPassword:"",
       visible:true,
       degree:0.3,
       degree2:0.3

    };
    inputWifi = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
     }

    handleOk = e => {
        this.props.parent.getWifiMsg(this, this.state)
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        this.props.parent.getWifiMsg(this, false)
        this.setState({
            visible: false,
        });
    };
    componentDidMount(){
        const {degree,degree2} = this.props;
        this.setState({
            degree,
            degree2
        })
    }
  render() {
    const {wifiName,wifiPassword,degree,degree2} = this.state;
    const {wifiType,} = this.props;
    return (
        <div>
            <Modal
            title="设置"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            okText="确认"
            cancelText="取消"
            >
                <div>
                    <Input addonBefore="计算稳定度：" name="degree"  placeholder="请输入" style={{width:400}} value={degree}
                                    onChange={this.inputWifi.bind(this)}/>
                    <Input addonBefore="显示稳定度：" name="degree2"  placeholder="请输入" style={{width:400,marginTop:20}} value={degree2}
                                onChange={this.inputWifi.bind(this)}/>
                </div> 
                
            </Modal>
      </div>
    );
  }
}
export default Mulitipe;
