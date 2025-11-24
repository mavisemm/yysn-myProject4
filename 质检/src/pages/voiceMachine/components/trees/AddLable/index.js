import React, { Fragment } from 'react';
import { Card, Form, Button, Select, Input ,Checkbox} from 'antd';
import './index.less';


const FormItem = Form.Item;
const { Option } = Select;
/**
 * 标签树的标签详情modal
 */
@Form.create()
class AddlLabel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      generateType:"",
      name:"",
      parentTeeth:"",
      childTeeth:"",
      turns:"",
      cycle:"",
      checked:false,
      checked1:false,

    };
  }

  /**
   * 初始化请求数据
   */
  componentDidMount() {
    this.setState({
      generateType:"",
      name: "",
      parentTeeth: "",
      childTeeth: "",
      turns: "",
      cycle: "",
    })
    // this.getlabelDetail();
  }

  static getDerivedStateFromProps(props, state) {
    const { id } = props;
    if (id !== state.id) {
      return { id: props.id };
    }
    return null;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      // this.getlabelDetail();
    }
  }

  cancel = () => {
    this.setState({
      generateType: "",
      name:"",
      parentTeeth: "",
      childTeeth: "",
      turns: "",
      cycle: "",
      checked: false,
      checked1: false,
    })
    this.props.Cancel();
  };
  inputChange = e => {
      this.setState({
          name: e.target.value
      })
  }
  inputChange1 = e =>{
    this.setState({
        parentTeeth: e.target.value
    })
  }
  inputChange2 = e => {
    this.setState({
        childTeeth: e.target.value
    })
  }
  inputChange3 = e => {
    this.setState({
        turns: e.target.value
    })
  }
  inputChange4 = e => {
    this.setState({
        cycle: e.target.value
    })
  }
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { page, limit } = this.state;
    let formValue = {}
    // generateType 同级
    if(this.state.checked){
      // 齿轮
      formValue = {
          generateType: this.state.generateType,
          parentTeeth: this.state.parentTeeth,
          childTeeth: this.state.childTeeth,
          name: this.state.name,
          isGear:1
      };
    }else{
      // 非齿轮
      formValue = {
          generateType: this.state.generateType,
          turns: this.state.turns,
          cycle: this.state.cycle,
          name: this.state.name,
          isGear: 0
      };

    }
    this.props.addOk(formValue);
  };
  handleChange = (e) => {
    this.setState({
      generateType:e.target.value,
    })
  }
  boxchange = e =>{
    this.setState({
      checked:e.target.checked
    })
  }
  boxchange1 = e => {
    this.setState({
      checked1:e.target.checked
    })
  }

  render() {
    const {
      loading,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Card bordered={false} className='detailModal' loading={loading}>
        <div className='table-con'>
          <Form onSubmit={this.handleSearch}  className='search-form-con'>
            <FormItem label="部件类型">
              <select placeholder="请选择部件类型" style={{width:300}} onChange={this.handleChange.bind(this)}>
                  <option value="1">同级子部件</option>
                  <option value="2">下级子部件</option>
                </select>
            </FormItem>
            <FormItem label="部件名称">
              < Input placeholder = "请输入部件名称"  value={this.state.name}  onChange={this.inputChange.bind(this)}/>
            </FormItem>
            <FormItem label="">
                <Checkbox onChange={this.boxchange.bind(this)}>齿轮</Checkbox>
                <br/>
                上级齿数与下级齿数转速比为：
                <Input style={{width:100}} placeholder="请输入" value={this.state.parentTeeth}
                    onChange={this.inputChange1.bind(this)}/>
                    ~
                <Input style={{width:100}}  placeholder="请输入" value={this.state.childTeeth}
                    onChange={this.inputChange2.bind(this)}/>
            </FormItem>
            <FormItem label="">
              <Checkbox onChange={this.boxchange1.bind(this)}>非齿轮</Checkbox>
              <br/>
              上级轴承转动一转对应下级部件
              <Input style={{width:100}} placeholder="请输入" value={this.state.turns}
                  onChange={this.inputChange3.bind(this)}/>转
                  <br/>
              上级轴承转动一转对应传动部件
              <Input style={{width:100,marginTop:10}}  placeholder="请输入" value={this.state.cycle}
                  onChange={this.inputChange4.bind(this)}/>周期
            </FormItem>
            {/* <Divider /> */}
            <div style={{ overflow: 'hidden', textAlign: 'right' }}>
              <div>
                <Button style={{ marginRight: 20 }} onClick={this.cancel}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  确定
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </Card>
    );
  }
}

export default AddlLabel;
