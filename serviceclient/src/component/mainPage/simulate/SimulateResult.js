import React from "react";
import { Radio, Accordion, Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select, Label, Rail } from 'semantic-ui-react'
import "./simulateResult.css"
import echarts from 'echarts/lib/echarts';
import ReactEcharts from 'echarts-for-react';
import SimulateWatcher from "./simulateResultComponent/SimulateWatcher"
import { style } from "d3";
import SimulateResultMain from "./simulateResultComponent/SimulateResultMain"
import axios from "axios";
import {TextFactory,simulate_dictionary} from "../../../data/dictionary"

let simulateResultController = {}
export { simulateResultController };
let backendURL = 'http://183.129.253.170:6051/'


export default class SimulateResult extends React.Component {
    constructor(props) {
        super(props)
        this.language = this.props.language
        //this.textFactory=new TextFactory(simulate_dictionary,this.language)
        //console.log("SimulateResult页面启动")
        this.simulator = props.bean
        if (this.simulator ===undefined) {
            this.simulator = props.page.simulator
        }
        //console.log(this.simulator)
        //console.log(this)
        this.sim_id = this.props.page.sim_id //这是点“开始仿真”跳转到仿真结果页面时，获取sim_id的方法
        if (this.sim_id ===undefined) {
            this.sim_id = this.simulator.sim_id //这是点左侧菜单跳转到仿真结果页面，获取sim_id的方法
        }
        this.simulator.reg(this)

        this.state = {
            runtimeData: this.simulator.runtimeData,
            autoFetchStep: true
        }
        this.didMount=false
        //console.log("SimulateResult已初始化:")
        //console.log(this)
    }
    componentDidMount() {
        this.initProgressBar()
        // this.simulator.startPolling(this.sim_id) //启动轮询
        this.didMount=true
    }
    //初始化进度条
    initProgressBar() {
        //可以对echartsInstance使用任何echarts API
        this.echartsProgressBarInstance = this.reactEchartsProgressBar.getEchartsInstance();
        this.echartsProgressBarInstance.on('click', (params) => {
            let clickStep=params.name
            this.simulator.fetchStep(this.sim_id,clickStep)
            this.stopAutoFetch()
        })
        this.refreshProgressBar()
        //console.log("SimulateResult:echarts已初始化")
    }
    refreshProgressBar() {
        let d = this.state.runtimeData.processArray
        let highlightStep = this.state.runtimeData.showStep
        let x = []
        let dMax = Math.max(...d)
        let dShadow = [] //用来当阴影
        for (let i = 0; i < d.length; i++) {
            x.push(i)
            dShadow.push(dMax)
        }

        let option = {
            xAxis: {
                type: 'category',
                name: 'step',
                data: x
            },
            yAxis: {
                type: 'value',
                name: 'process',
                splitLine: {
                    show: false
                }
            },
            series: [
                {
                    data: dShadow,
                    type: 'bar',
                    barGap: '-100%',
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                let colorList = ['rgba(82,82,82, 0.9)', 'rgba(89,189,229,0.5)'] //背景条色
                                if (params.name ===highlightStep) {
                                    return colorList[1]
                                } else {
                                    return colorList[0]
                                }
                            }
                        }
                    },
                },
                {
                    data: d,
                    type: 'bar',
                    name: 'process',
                    showBackground: false,
                    itemStyle: {
                        normal: {
                            color: function (params) {
                                let colorList = ['rgb(124,146,164)', 'rgb(89,189,229)'] //前景条色
                                if (params.name ===highlightStep) {
                                    return colorList[1]
                                } else {
                                    return colorList[0]
                                }
                            }
                        }
                    },
                    //color: ['#bebebe'],
                    backgroundStyle: {
                        color: 'rgba(220, 220, 220, 0.8)'
                    },
                }
            ],
            dataZoom: [{
                type: 'inside'
            }, {
                type: 'slider'
            }],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function (params) {
                    //console.log(params); // 当想要自定义提示框内容时，可以先将鼠标悬浮的数据打印出来，然后根据需求提取出来即可
                    return 'step:'+params[1].dataIndex+'<br/>process:'+params[1].data
                }
            },
            grid: {
                top: '30px',
                left: '40px',
                right: '40px',
                bottom: '60px'
            }
        };
        this.echartsProgressBarInstance.setOption(option)

    }
    // WatcherEditor->SimulateWatcher->SimulateResult->Simulator
    addWatcher(quotaName,code,type,callback){
        //console.log("SimulateResult在添加监视:")
        //console.log(this)
        this.simulator.addWatcher(this.sim_id,quotaName,code,type,callback)
    }
    switchAutoFetch(){
        this.simulator.autoFetchStep=!this.state.autoFetchStep
        this.setState({autoFetchStep:!this.state.autoFetchStep})
    }
    stopAutoFetch(){
        this.simulator.autoFetchStep=false
        this.setState({autoFetchStep:false})
    }

    render() {
        let tf= new TextFactory(simulate_dictionary,this.props.language)
        return (
            <div className="component-container simulateResultPage" >
                <div className='SRGridBox controlBar headColor'>
                    <div style={{ float: 'left',paddingLeft:'6px',paddingTop:'4px' }}><Header as='h1' >{tf.str('Simulate result')}</Header></div>

                    <div style={{ float: 'right' }}>
        <Label  style={{ marginRight: '20px' }}>{tf.str('Completed steps:')}{this.state.runtimeData.completeStep}，{this.state.runtimeData.showStep==-1&&tf.str('Please select a step in the timeline.')||(tf.str('Current show step:')+this.state.runtimeData.showStep+tf.str('_step'),'当前运行进程:'+this.state.runtimeData.process)}</Label>
                        {this.state.runtimeData.status ==='running' && <Label color="green" style={{ marginRight: '20px' }}>{tf.str('Simulation running')}</Label>}
                        {this.state.runtimeData.status ==='suspend' && <Label color="yellow" style={{ marginRight: '20px' }}>{tf.str('Simulation suspended')}</Label>}
                        {this.state.runtimeData.status ==='stop' && <Label color="grey" style={{ marginRight: '20px' }}>{tf.str('Simulation finished')}</Label>}
                        {this.state.runtimeData.status ==='failed' && <Label color="red" style={{ marginRight: '20px' }}>{tf.str('Simulation failed')}</Label>}
                        {this.state.runtimeData.status ==='none' && <Label style={{ marginRight: '20px' }}>{tf.str('Simulation doesn\'t running')}</Label>}
                        
                            <Radio label=' ' checked={this.state.autoFetchStep} onClick={()=>this.switchAutoFetch()} toggle style={{paddingTop:'5px'}}/><span style={{paddingRight:'20px'}}>{tf.str('Auto refresh')}</span>
                        
                        <Button.Group icon>
                            <Button color='grey' disabled={this.state.runtimeData.status != 'suspend'} onClick={()=>this.simulator.continueSimulate(this.sim_id)}>
                                <Icon name='play' />{tf.str('Continue')}
                            </Button>
                            <Button  color='grey' disabled={this.state.runtimeData.status != 'running'} onClick={()=>this.simulator.suspendSimulate(this.sim_id)}>
                                <Icon name='pause' />{tf.str('Suspend')}
                            </Button>
                            <Button  color='grey' disabled={this.state.runtimeData.status != 'suspend'} onClick={()=>this.simulator.stepOver(this.sim_id)}>
                                <Icon name='sign-in' />{tf.str('Step by step')}
                            </Button>
                            <Button  color='grey' disabled={!(this.state.runtimeData.status ==='suspend' || this.state.runtimeData.status ==='running')} onClick={()=>this.simulator.stopSimulate(this.sim_id)}>
                                <Icon name='stop' />{tf.str('Terminate')}
                            </Button>
                        </Button.Group>
                    </div>
                </div>
                <div className='SRGridBox progressBar' id="progress-bar">
                    <ReactEcharts option={{}}
                        style={{ width: '100%', height: '100%' }}
                        ref={(e) => { this.reactEchartsProgressBar = e; }} 
                        />

                </div>

                <div className='SRGridBox watcherBox'>
                    <SimulateWatcher stepData={this.state.runtimeData.showStepData} addWatcher={(quotaName,code,type,callback)=>this.addWatcher(quotaName,code,type,callback)}/>
                </div>
                <div className='SRGridBox resultMainBox'>
                    <SimulateResultMain stepData={this.state.runtimeData.showStepData} patternInstanceBase={this.simulator.pattern_instance_base}/>
                </div>

            </div>
        )
    }
    refresh() {
        if(this.didMount){
            this.setState({})
            this.refreshProgressBar()
        }
    }
}
