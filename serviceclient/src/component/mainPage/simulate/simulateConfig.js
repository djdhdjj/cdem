import React from "react";
import { Accordion, Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select } from 'semantic-ui-react'
import { Popover, Steps } from 'antd';
import TypeElementLeft from "./simulateConfigComponent/TypeElementLeft";
import InstanceTreeLeft from "./simulateConfigComponent/InstanceTreeLeft";
import InstanceEdit from "./simulateConfigComponent/InstanceEdit";
import SwimlaneDiagram from "./simulateConfigComponent/SwimlaneDiagram";
import SimulatorSettings from "./simulateConfigComponent/SimulateSettings";
import { pageManage } from "../../../manager/PageManage";
import { PageType } from "../../../manager/PageManage";
import { default_workspace } from "../../../data/workspaceData";
import { TextFactory, simulate_dictionary } from "../../../data/dictionary"
import axios from 'axios';
const { Step } = Steps;

export default class SimulateConfig extends React.Component {
    constructor(props) {
        super(props)
        this.bean = props.bean //bean就是simulator
        //console.log('simibean',props)
        this.language = this.props.language
        this.workspace_data = props.workspace_data
        //console.log('simulator',props)
        this.share = {}
        this.state = {
            step: 0
        }
    }
    /*
    componentWillReceiveProps(nextProps:any){
        this.language = nextProps.language
    }*/
    render() {
        let tf = new TextFactory(simulate_dictionary,this.props.language)
        //console.log('simulate',this.language)
        return (
            <div className="component-container" >
                <div>
                    <Menu  style={{ margin: 0 }} pointing secondary>
                        <Menu.Item header><Icon name="setting"  />{tf.str('simulate config')}</Menu.Item>
                        <Menu.Item
                            value='model'
                            active={this.state.step === 0}
                            onClick={() => this.setState({
                                step: 0
                            })}>
                            {tf.str('pattern definition')}&nbsp;
                            <Popover content={tf.note('pattern definition')} >
                                <Icon fitted name='question circle outline' />
                            </Popover>
                        </Menu.Item>
                        <Menu.Item><Icon name="angle right"/></Menu.Item>
                        <Menu.Item
                            value='other'
                            active={this.state.step === 1}
                            onClick={() => this.setState({
                                step: 1
                            })}>
                            {tf.str('instance definition')}&nbsp;
                            <Popover  content={tf.note('instance definition')} >
                                <Icon fitted name='question circle outline' />
                            </Popover>
                        </Menu.Item>
                        <Menu.Item><Icon name="angle right"/></Menu.Item>
                        <Menu.Item
                            value='setting'
                            active={this.state.step === 2}
                            onClick={() => this.setState({
                                step: 2
                            })}>
                            {tf.str('configuration')}&nbsp;
                            <Popover content={tf.note('configuration')} >
                                <Icon fitted name='question circle outline' />
                            </Popover>
                        </Menu.Item>
                        <Menu.Menu position='right'>
                            <Menu.Item>
                                {this.state.step > 0 &&
                                    <Button inverted style={{marginRight:'20px'}}
                                        onClick={() => {
                                            let step = this.state.step - 1
                                            if (step < 0) {
                                                step = 0
                                            }
                                            this.setState({
                                                step: step
                                            })
                                        }}>{tf.str('prev step')}
                                    </Button>
                                }

                                {this.state.step < 2 &&
                                    <Button color="green"
                                        onClick={() => {
                                            let step = this.state.step + 1
                                            if (step > 2) {
                                                step = 2
                                            }
                                            this.setState({
                                                step: step
                                            })
                                        }}>{tf.str('next step')}
                                    </Button>
                                }
                                {this.state.step === 2 &&
                                    <Button onClick={() => { }} color="green"
                                        onClick={() => {
                                            //保存
                                            this.workspace_data.saveByNetwork(() => {
                                                //console.log('sim_work',this.bean.workspace)
                                                axios.post('http://183.129.253.170:6051/api/simulate/start-simulate', { "work_space": this.bean.workspace.name, "simulator": this.bean.config.name })
                                                    .then((response) => {
                                                        //console.log('-----simres',response)
                                                        let sim_id = response.data.sim_id
                                                        //console.log("sim_id:", sim_id)
                                                        //打开仿真结果页面
                                                        const path = "result"
                                                        const newPage = pageManage.openPage(path, PageType.SimulateResult)
                                                        newPage.simulator = this.bean
                                                        this.bean.sim_id = sim_id
                                                        newPage.sim_id = sim_id
                                                        pageManage.refresh()
                                                    })
                                            })
                                        }

                                        }>
                                        {tf.str('start simulation')}
                                    </Button>
                                }
                            </Menu.Item>
                        </Menu.Menu>
                    </Menu>
                </div>
                <div style={{ height: 'calc( 100% - 50px )' }}>
                    <div style={{ float: 'left', width: '50%', height: '100%', overflow: 'auto', padding: '5px' }}>

                        <LeftView service_pattern={this.props.bean.service_pattern} step={this.state.step} bean={this.bean} share={this.share} />

                    </div>
                    <div style={{ float: 'left', width: '50%', height: '100%', overflowY: 'auto', padding: '5px',borderLeft:'1px solid #737373' }}>
                        <RightView step={this.state.step} bean={this.bean} share={this.share} />
                    </div>
                </div>
            </div>
        )
    }
}

// 该组件用于判断要在页面左侧区域显示什么组件
class LeftView extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        if (this.props.step ===0) {
            return <SwimlaneDiagram service_pattern={this.props.service_pattern} bean={this.props.bean} share={this.props.share} />
        } else if (this.props.step ===1) {
            return <InstanceTreeLeft bean={this.props.bean} share={this.props.share} />
        }
        else {
            return <SimulatorSettings bean={this.props.bean} simulator={this.props.bean} share={this.props.share} />
        }

    }
}

// 该组件用于判断要在页面右侧区域显示什么组件
class RightView extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        if (this.props.step ===0) {
            return <TypeElementLeft bean={this.props.bean} share={this.props.share} />
        } else if (this.props.step ===1) {
            return <InstanceEdit bean={this.props.bean} share={this.props.share} />
        }
        else {
            return null
        }
    }
}