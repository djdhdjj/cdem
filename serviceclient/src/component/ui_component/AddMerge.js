import React from "react";
import { Modal, Button, Icon, Input, Menu, Dropdown } from "semantic-ui-react";
import { Slider, Form, Select, Space, Popover,Tooltip } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import net_work from "../../manager/netWork"
import "./AddMerge.css";
import { default_workspace } from "../../data/workspaceData";
// import net_work from '../../manager/netWork'
import axios from "axios";

import { TextFactory, fusion_dictionary } from "../../data/dictionary";

const { Option } = Select;

export default class AddMerge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false, //添加的显示和隐藏
      name: null,
      select: [], //pattern
      thetaValue: [0.2, 0.4],
      structureSelect: null,
      structureOption: [
        { key: "0", text: "并行", value: "0" },
        { key: "1", text: "顺序", value: "1" },
      ],
      relationSelect: null,
      relationOption: null,
      participantOptions1: [],
      participantOptions2: [],
      partSelcet: null,
      getFieldDecorator: null,
      nameError:false,
      workspace_data:props.workspace,
    };
    this.textFactory = new TextFactory(fusion_dictionary);
  }
  // 确认提交融合模式
  componentWillReceiveProps(nextProps){
    console.log('444',nextProps)
    this.setState({workspace_data:nextProps.workspace})
  }

  yes() {
    const _this = this;
    const {
      name,
      select,
      structureSelect,
      thetaValue,
      relationSelect,
      partSelcet,
      participantOptions1,
      participantOptions2,
    } = this.state;
    if (
      name !== null &&
      participantOptions1 !== null &&
      participantOptions2 !== null &&
      structureSelect !== null &&
      thetaValue !== null &&
      relationSelect !== null &&
      partSelcet !== null &&
      partSelcet.participant_mapping[0]!== undefined
    ) {
      var mapping = {};
      
      partSelcet.participant_mapping.map(
        (item) => (mapping[item.first] = item.last)
      );

      //console.log(partSelcet);
      var req = {
        name: name,
        //workspace: default_workspace.toJson(),
        workspace: this.state.workspace_data.toJson(),
        patterns: select,
        structure: structureSelect,
        relation: relationSelect,
        mapping: mapping,
        theta: thetaValue,
      };

      axios
        .post("http://183.129.253.170:6051/fusion", req)
        .then(function (res) {
          //console.log(res);
          _this.props.add(Object.keys(res.data)[0]);
          _this.setState({
            display: false,
          });
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      console.log(this.state);
      alert("填写不对");
    }
  }

  trigger() {
    return (
      <Menu.Item name="添加" onClick={() => this.setState({ display: true })} />
    );
  }

  // Pattern原子库选择导致particpant值变化
  onPatternChange(e, d, flag) {
    console.log('!!!!d',d)
    var arr = this.state.select;
    const _this = this;
    var parArr = [];
    var temp;
    if(Object.keys(this.state.workspace_data.service_pattern).find(item => item == d.value)){
      temp = this.state.workspace_data.service_pattern[d.value].data.nodes.filter(
        (item) => item.category === "Lane"
      );
    }
    else{
      var fusion_name = d.value.split('_选定')[0]
      console.log('fusion_name',fusion_name)
      console.log(this.state.workspace_data.fusion_pattern[fusion_name].final[d.value])
      temp = this.state.workspace_data.fusion_pattern[fusion_name].final[d.value].data.nodes.filter(
        (item) => item.category === "Lane"
      );
    }
    
    temp.forEach(function (value, i) {
      parArr.push({
        key: value.key,
        name: value.name,
      });
    });
    if (flag === 1) {
      arr[0] = d.value;
      _this.setState({
        participantOptions1: parArr,
        select: arr,
      });
    } else {
      arr[1] = d.value;

      _this.setState({
        participantOptions2: parArr,
        select: arr,
      });
      
    }

    if(this.state.select.length==2){
      this.setState({
        //顺序
        relationOption: [
          {
            key: "4",
            //text: this.state.select[0]+"-first",
            text: "模式1-first",
            value: "A-first",
            disabled: false,
          },
          {
            key: "5",
            //text: this.state.select[1]+"-first",
            text: "模式2-first",
            value: "B-first",
            disabled: false,
          },
        ],
      });
    }
    else{
      this.setState({
        //顺序
        relationOption: [
          {
            key: "4",
            text: "模式1-first",
            value: "A-first",
            disabled: false,
          },
          {
            key: "5",
            text: "模式2-first",
            value: "B-first",
            disabled: false,
          },
        ],
      });
    }

    // console.log(this.state)
  }

  // slider 值变化
  onSlisererAfterChange(value) {
    console.log("onAfterChange: ", value);
  }
  // structure
  structureChange(e, d) {
    console.log('----d',d);
    console.log('-----e',e);
    const { structureSelect, relationOption } = this.state;
    this.setState({ structureSelect: d.value });
    console.log('ssel',structureSelect);
    if (d.value === "0") {
      //并行
      this.setState({
        relationOption: [
          {
            key: "0",
            text: "调用",
            value: "call",
            disabled: false,
          },
          {
            key: "1",
            text: "互斥",
            value: "exclusive",
            disabled: false,
          },
          {
            key: "2",
            text: "完全并行",
            value: "full_parallel",
            disabled: false,
          },
          {
            key: "3",
            text: "半并行",
            value: "semi_parallel",
            disabled: false,
          },
        ],
      });
    } else {
      
      this.setState({
        //顺序
        relationOption: [
          {
            key: "4",
            text: "模式1在前",
            value: "A-first",
            disabled: false,
          },
          {
            key: "5",
            text: "模式2在前",
            value: "B-first",
            disabled: false,
          },
        ],
      });
      
    }
  }

  render() {
    let tf = this.textFactory;

    const {
      display,
      select,
      thetaValue,
      structureSelect,
      structureOption,
      relationSelect,
      relationOption,
      participantOptions1,
      participantOptions2,
      partSelcet,
    } = this.state;
    const { options, mergeName } = this.props;
    console.log('------thisprops',this.props)

    return (
      <Modal trigger={this.trigger()} open={display}>
        <Modal.Header>添加</Modal.Header>
        <Modal.Content>
          {/* name------------------ */}
          {tf.str("Name")}&nbsp;
          <Popover content={tf.note("Name")}>
            <Icon fitted name="question circle outline" />
          </Popover>
          : &nbsp; &nbsp; &nbsp;&nbsp;
          <Tooltip visible={this.state.nameError?true:false} 
          placement="right" title="模式名冲突！"
           color="red"
           >
          <Input 
          
          onChange={(e, d) => 
            {
              this.setState({ name: d.value })
              //const service_pattern = default_workspace.service_pattern
              const service_pattern = this.state.workspace_data.service_pattern
              var flag = 0
              Object.keys(service_pattern).map((elm)=>{
                if(d.value === elm){
                  //alert('模式名冲突！请重新填写模式名')
                  this.setState({nameError:true})
                  flag = 1
                }
              })
              //const fusion_pattern = default_workspace.fusion_pattern
              const fusion_pattern = this.state.workspace_data.fusion_pattern
              Object.keys(fusion_pattern).map((elm)=>{
                if(d.value === elm){
                  //alert('模式名冲突！请重新填写模式名')
                  this.setState({nameError:true})
                  flag = 1
                }
              })
              if(flag ===0){
                this.setState({nameError:false})
              }
              
            }} 
            />
          </Tooltip>

          &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         
          {/* pattern------------------ */}
          {tf.str("Atomic patterns")}&nbsp;
          <Popover content={tf.note("Atomic patterns")}>
            <Icon fitted name="question circle outline" />
          </Popover>
          : &nbsp;
         模式1：<Select
            placeholder="请选择"
            onChange={(e, d) => this.onPatternChange(e, d, 1)}
          >
            {options.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
       </Select>
          &nbsp;&nbsp;&nbsp;
          模式2：<Select
            placeholder="请选择"
            onChange={(e, d) => this.onPatternChange(e, d, 2)}
          >
            {options.map((opt) => (
              <Option key={opt} value={opt}>
                {opt}
              </Option>
            ))}
          </Select>
          <br /> <br />
         
         
          {/* theta */}
          {tf.str("Similarity threshold")}&nbsp;
          <Popover content={tf.note("Similarity threshold")}>
            <Icon fitted name="question circle outline" />
          </Popover>
          : &nbsp; &nbsp; &nbsp; &nbsp;
          <Slider
            style={{
              width: "250px",
              display: "inline-block",
              marginTop: "5px",
            }}
            range
            step={0.1}
            defaultValue={[0.2, 0.4]}
            min={0}
            max={1}
            onChange={(e) => this.setState({ thetaValue: e })}
            onAfterChange={(e) => this.onSlisererAfterChange(e)}
          />
          <br />
          <br />
          {/* structure： */}
          {//console.log('partition',participantOptions1,participantOptions2)
            console.log('select',select)
          }
          {tf.str("Structure")}&nbsp;
          <Popover content={tf.note("Structure")}>
            <Icon fitted name="question circle outline" />
          </Popover>
          :
          <Dropdown
            labeled
            selection
            options={structureOption}
            value={structureSelect}
            // onChange={(e, d) => this.setState({structureSelect: d.value})}
            onChange={(e, d) => this.structureChange(e, d)}
          />
          &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; 
          
          关系: &nbsp;
          <Dropdown
            labeled
            selection
            options={relationOption}
            value={relationSelect}
            onChange={(e, d) => this.setState({ relationSelect: d.value })}
          />
          <br />
          <br />
          {/* participant_mapping */}
          {tf.str("Participant mapping")}&nbsp;
          <Popover content={tf.note("Participant mapping")}>
            <Icon fitted name="question circle outline" />
          </Popover>
          :
          <br />
          <Form
            name="participant_mapping"
            onValuesChange={(a, b) => this.setState({ partSelcet: b })}
          >
            <Form.List name="participant_mapping">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field) => (
                      <Space key={field.key} style={{ marginBottom: 8 }}>
                        <Form.Item
                          {...field}
                          name={[field.name, "first"]}
                          fieldKey={[field.fieldKey, "first"]}
                          noStyle
                        >
                          <Select
                            style={{ width: "220px" }}
                            placeholder="请选择参与者"
                          >
                            {participantOptions1.map((d) => (
                              <Option key={d.key}>{d.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          noStyle
                          name={[field.name, "last"]}
                          fieldKey={[field.fieldKey, "last"]}
                        >
                          <Select
                            style={{ width: "220px" }}
                            placeholder="请选择参与者"
                          >
                            {participantOptions2.map((d) => (
                              <Option key={d.key}>{d.name}</Option>
                            ))}
                          </Select>
                        </Form.Item>

                        {fields.length > 1 ? (
                          <MinusCircleOutlined
                            className="dynamic-delete-button"
                            style={{ margin: "0 8px" }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </Space>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          add();
                        }}
                      >
                        <PlusOutlined />   {tf.str("Add")}
                      </Button>
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button
            basic
            color="red"
            onClick={() => this.setState({ display: false })}
          >
            <Icon name="remove" />  {tf.str("Cancel")}
          </Button>
          <Button color="green" onClick={() => this.yes()}>
            <Icon name="checkmark" />  {tf.str("Submit")}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}
