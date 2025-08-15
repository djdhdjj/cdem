import React from 'react';
import { genUniqueID } from "../../../manager/commonFunction";
import { Button, Grid, List, Divider } from "semantic-ui-react";
import { Checkbox, Spin, Table ,Select} from 'antd';
import 'echarts/dist/extension/dataTool'
//import { default_workspace } from "../../../data/workspaceData";
import axios from 'axios';
import { Switch } from 'antd';
import {TextFactory,evaluate_dictionary} from '../../../data/dictionary'
import { pageManage } from "../../../manager/PageManage";
import { PageType } from "../../../manager/PageManage";
import AssessedResults from "../../../data/assessedResult"
import EstimateResult from "./estimateResult"

const CheckboxGroup = Checkbox.Group;
const { Option } = Select;


// 模式评估页面
export default class estimateComponent extends React.Component {
    constructor(props) {
        super(props)
        console.log('estimatedetail',props)
        this.state = {
            //plainOptions: Object.keys(default_workspace.service_pattern), //所有的模式名称
            plainOptions: Object.keys(props.workspace_data.service_pattern),
            patternValue: [], //原子库
            fusionValue: [], //融合库
            estCheckVis: true,
            // 表格数据
            tableVis: false,
            tableCol: null,
            tableSour: null,
            estAllData:null,
            switchVis:true,
            ListVis:true,
            switchValue:true,
            //mergeOptions:this.getmergeOptions(default_workspace)
            mergeOptions:this.getmergeOptions(props.workspace_data),
            workspace_data:props.workspace_data
        }
        //console.log('prop',props)
        //console.log(props.page)
        //console.log('defalut_workspace',default_workspace)
        this.bean = props.bean
        if (this.bean ===undefined) {
            //console.log('111111')
            this.bean = props.localInfo.workspace_data.assessedResults
        }

        this.language = this.props.language
        this.textFactory = new TextFactory(evaluate_dictionary,this.language)
    }

    componentDidMount() {
        this.setState({workspace_data:this.props.workspace_data})
    }
    componentWillReceiveProps(nextProps){
        this.setState({workspace_data:nextProps.workspace_data})
      }

    getmergeOptions(workspace) {
        var arr = []
        Object.keys(workspace.fusion_pattern).map(item => {
            arr = arr.concat(Object.keys(workspace.fusion_pattern[item].final))
            arr = arr.concat(Object.keys(workspace.fusion_pattern[item].intermediate))
        })
        return arr
    }

     handlePatternChange(value) {
        this.setState({
            patternValue:value
        })
      }

      handleFusionChange(value) {
        this.setState({
            fusionValue:value
        })
      }
      
    //开始评估   
    startEst() {
        const _this=this;    //先存一下this，以防使用箭头函数this会指向我们不希望它所指向的对象。
        this.setState({
            estCheckVis: false,
            tableVis:false,
            ListVis:false,
            switchVis:false
        })

        var estData = {
            workspace: this.state.workspace_data.toJson(),
            patterns: []
        }

        this.state.patternValue.map(function(value){
            estData.patterns.push({
                lib:'pattern',
                name:value
            })
        });
        this.state.fusionValue.map(function(value){
            estData.patterns.push({
                lib:'fusion',
                name:value
            })
        });
        //console.log('----estdata',estData)
        let key,value
        axios.post('http://183.129.253.170:6051/assessment',estData)
        .then(function (res) {
            //console.log('assess',res)
            key = Object.keys(res.data)[0]
            value = res.data[key]
            //console.log(key,value)
            _this.setState({
                estAllData:value,
                estCheckVis: true,
                tableVis: false ,
                switchValue:true,
                switchVis:true,
            });
            let ar_id = key
            console.log(ar_id)
            const path = "评估结果\\"+ar_id
            const newPage = pageManage.openPage(path, PageType.estimateShow)
            //console.log('-----newpage',newPage)
            newPage.assessedResults = res.data
            newPage.localInfo = res.data
            const ar = new AssessedResults(res.data)
            //console.log('----ar',ar)
            //default_workspace.assessedResults[ar_id] = ar
            //console.log(_this.state.workspace_data)
            _this.state.workspace_data.assessedResults[ar_id] = ar
            
            //default_workspace.saveByNetwork()
            _this.state.workspace_data.saveByNetwork()
            //console.log('-----dewo',_this.state.workspace_data)

            newPage.ar_id = ar_id
            pageManage.refresh()  
            //default_workspace.assessedResults[ar_id] = res.data
           
        })
          .catch(function (error) {
            //console.log(error);
          })
    }
    render() {
        const tf = this.textFactory
        
        const { plainOptions, estCheckVis, tableVis,estAllData,mergeOptions,switchVis,ListVis,switchValue } = this.state

        return (
            <div style={{ width: '100%', height: '100%', position: 'relative' ,padding:'30px 10px',backgroundColor:"#e0dfe8",overflow:'auto'}}>
                {switchVis &&  <Switch checkedChildren="开启注释" unCheckedChildren="关闭注释"   defaultChecked={switchValue} onChange={()=>this.setState({ListVis:!ListVis})}/>}
                <br/>
                {   ListVis&&
                     <List style={{padding: '6px', }}>
                        <List.Item style={{}}>服务模式评估通过工作流、数据流、资源流、现金流四个方面对服务模式进行量化建模，从时间、成本、效率、价值、可靠性五个方面对服务模式进行全方位的评估。</List.Item>
                        <List.Item>这个模块可以： 1. 产生服务模式的特定评估结果    2. 对不同服务模式进行全方位的比较    3. 量化服务模式迭代所带来的影响</List.Item>
                        <Divider/>
                        <List.Item>参数：</List.Item>
                        <List.Item>Duration：该服务模式下一次执行所需要时间的期望。包括服务执行所需的时间、多参与者协作引入的协作时间，以及多平台交互引入的交互时间。</List.Item>
                        <List.Item>Cost：改服务模式下一次执行所需要的成本的期望。包括服务运行所需要的基础成本，以及服务等待过程中出现的等待成本。</List.Item>
                        <List.Item>Data Efficiency：数据的传输效率，是数据量与数据从释放到使用的时间的商。</List.Item>
                        <List.Item>Resource Efficiency：资源的传输效率，是资源量与资源从释放到使用的时间的商。</List.Item>
                        <List.Item>Cash Efficiency：现金的传输效率，是现金量与现金从释放到使用的时间的商。</List.Item>
                        <List.Item>Reliability：该服务模式下服务一次运行成功的概率。</List.Item>
                        <List.Item>Value：改服务模式下一次运行通过资源传递创造的现金量。</List.Item>
                        <List.Item>Pattern Entropy：表示模式中每个节点每成功运行一次获得单位收益带来的损失。</List.Item>
                        <Divider/>
                    </List>
                }
               
                {estCheckVis && !tableVis &&
                   <div style={{ position: 'absolute', paddingLeft:'10px' ,width:'100%',}}>    
                    原子模式库： 
                    <Select   mode="multiple"
                            style={{ width: '90%' }}
                            placeholder="Please select"
                            onChange={(value)=>this.handlePatternChange(value)}>
                            {plainOptions.map(d => <Option key={d}>{d}</Option>)}
                    </Select>
                        <br /><br /> <br />
                    融合模式库：  
                    <Select   mode="multiple"
                            style={{ width: '90%' }}
                            placeholder="Please select"
                            onChange={(value)=>this.handleFusionChange(value)}>
                            {mergeOptions.map(d => <Option key={d}>{d}</Option>)}
                    </Select>
                     <br /><br /> <br />
                    <Button onClick={() => this.startEst()}>开始评估</Button>
                    
                    </div>
                }

                {

                    //!estCheckVis && !tableVis && <Spin size="large"  style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translateX(-50%) translateY(-50%)' }} />
                }

                {
                    //!estCheckVis && tableVis &&  <EstimateTable tableSour={ estAllData  } ></EstimateTable>
                }
               <br /> <br /> <br /> <br />
                {
                    //!estCheckVis && tableVis &&  <Boxplot boxSour = {estAllData}></Boxplot>
                }
            </div>
        )
    }
}

/*
// table 组件
// 一个模式是有两行数据的  第一行为均值，第二行为方差
export class EstimateTable extends React.Component {
    constructor(props) {
        super(props)
        this.textFactory = new TextFactory(evaluate_dictionary)

    }
    // 均值
    getAvg(numbers, digit = 3) {
        // 修复js浮点数精度误差问题
        const formulaCalc = function formulaCalc(formula, digit) {
            let pow = Math.pow(10, digit);
            return parseInt(formula * pow, 10) / pow;
        };
        let len = numbers.length;
        let sum = (a, b) => formulaCalc(a + b, digit);
        // 平均值
        let avg = numbers.reduce(sum) / len;
        return avg.toFixed(digit)
    }

    // 方差
    getVar(numbers, digit = 3) {
        // 修复js浮点数精度误差问题
        const formulaCalc = function formulaCalc(formula, digit) {
            let pow = Math.pow(10, digit);
            return parseInt(formula * pow, 10) / pow;
        };
        let len = numbers.length;
        let sum = (a, b) => formulaCalc(a + b, digit);
        // 平均值
        let avg = numbers.reduce(sum) / len;
        // 计算方差
        let variance = numbers.map(n => (n - avg) * (n - avg)).reduce(sum) / len;
        return variance.toFixed(digit)
    }

    render() {
        const tf = this.textFactory

        
        let dataSource = []
        let key = 0;
        for(var i in this.props.tableSour){
            // console.log(this.props.tableSour[i])
            dataSource.push({
            'key':key++,
            'Name':  this.props.tableSour[i].name+'均值',
            'P_entropy': this.getAvg(this.props.tableSour[i].data.P_entropy),
            'cost': this.getAvg(this.props.tableSour[i].data.cost),
            'currency_efficiency': this.getAvg(this.props.tableSour[i].data.currency_efficiency),
            'data_efficiency': this.getAvg(this.props.tableSour[i].data.data_efficiency),
            'duration': this.getAvg(this.props.tableSour[i].data.duration),
            'reliability': this.getAvg(this.props.tableSour[i].data.reliability),
            'resource_efficiency': this.getAvg(this.props.tableSour[i].data.resource_efficiency),
            'value': this.getAvg(this.props.tableSour[i].data.value),
            })
            dataSource.push({
            'key':key++,
            'Name': this.props.tableSour[i].name+'方差',
            'P_entropy': this.getVar(this.props.tableSour[i].data.P_entropy),
            'cost': this.getVar(this.props.tableSour[i].data.cost),
            'currency_efficiency': this.getVar(this.props.tableSour[i].data.currency_efficiency),
            'data_efficiency': this.getVar(this.props.tableSour[i].data.data_efficiency),
            'duration': this.getVar(this.props.tableSour[i].data.duration),
            'reliability': this.getVar(this.props.tableSour[i].data.reliability),
            'resource_efficiency': this.getVar(this.props.tableSour[i].data.resource_efficiency),
            'value': this.getVar(this.props.tableSour[i].data.value),
        }) 

        }


        const columns = [{
            title: 'name',
            dataIndex: 'Name',
            key: 'Name'
        }, {
            title: 'p_entropy',
            dataIndex: 'P_entropy',
            key: 'P_entropy'
        },
        {
            title: 'cost',
            dataIndex: 'cost',
            key: 'cost'
        }, {
            title: 'currency_efficiency',
            dataIndex: 'currency_efficiency',
            key: 'currency_efficiency'
        }, {
            title: 'data_efficiency',
            dataIndex: 'data_efficiency',
            key: 'data_efficiency'
        }, {
            title: 'duration',
            dataIndex: 'duration',
            key: 'duration'
        }, {
            title: 'reliability',
            dataIndex: 'reliability',
            key: 'reliability'
        }, {
            title: 'resource_efficiency',
            dataIndex: 'resource_efficiency',
            key: 'resource_efficiency'
        }, {
            title: 'value',
            dataIndex: 'value',
            key: 'value'
        }]


        return <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false} />
    }
}



// 箱型图的部分
export class Boxplot extends React.Component {
    constructor(props) {
        super(props)
    }

    //   八张图的渲染   
    getOption = ( d,xdata) => {
        // console.log(d)
        var data = d
        
        // console.log(xdata)
        // console.log(data.boxData)
        var option = {
            title: [
                {
                    text: data.name,
                    left: 'center',
                },
            ],
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '10%',
                right: '10%',
                bottom: '15%'
            },
            xAxis: {
                type: 'category',
                data: xdata,
                boundaryGap: true,
                nameGap: 30,
                splitArea: {
                    show: false
                },
                axisLabel: {
                    formatter: '{value}'
                },
                splitLine: {
                    show: false
                }
            },
            yAxis: {
                type: 'value',
                splitArea: {
                    show: true
                }
            },
            series: [
                {
                    name: 'boxplot',
                    type: 'boxplot',
                    data: data.boxData,
                    tooltip: {
                        formatter: function (param) {
                            return [
                                'Experiment ' + param.name + ': ',
                                'upper: ' + param.data[5],
                                'Q3: ' + param.data[4],
                                'median: ' + param.data[3],
                                'Q1: ' + param.data[2],
                                'lower: ' + param.data[1]
                            ].join('<br/>');
                        }
                    }
                },
                {
                    name: 'outlier',
                    type: 'scatter',
                    data: data.outliers
                }
            ]
        }
       
          
                
        return option;
    }

    render() {
        var data1=[], data2=[],data3=[],data4=[],  data5=[], data6=[], data7=[], data8=[]

        for(var i in this.props.boxSour){
            data1.push(this.props.boxSour[i].data.P_entropy)
            data2.push(this.props.boxSour[i].data.cost)
            data3.push(this.props.boxSour[i].data.currency_efficiency)
            data4.push(this.props.boxSour[i].data.data_efficiency)
            data5.push(this.props.boxSour[i].data.duration)
            data6.push(this.props.boxSour[i].data.reliability)
            data7.push(this.props.boxSour[i].data.resource_efficiency)
            data8.push(this.props.boxSour[i].data.value)
        }

        data1 = echarts.dataTool.prepareBoxplotData(data1)
        data2 = echarts.dataTool.prepareBoxplotData(data2)
        data3 = echarts.dataTool.prepareBoxplotData(data3)
        data4 = echarts.dataTool.prepareBoxplotData(data4)
        data5 = echarts.dataTool.prepareBoxplotData(data5)
        data6 = echarts.dataTool.prepareBoxplotData(data6)
        data7 = echarts.dataTool.prepareBoxplotData(data7)
        data8 = echarts.dataTool.prepareBoxplotData(data8)

        data1.name = 'p_entropy'
        data2.name = 'cost'
        data3.name = 'currency_efficiency'
        data4.name = 'data_efficiency'
        data5.name = 'duration'
        data6.name = 'reliability'
        data7.name = 'resource_efficiency'
        data8.name = 'value'

        var xdata = this.props.boxSour.map(item=>{
            return item.name
        })


        return (
            <Grid columns={2} divided>
                <Grid.Row>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data1,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data2,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data3,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data4,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data5,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data6,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data7,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactEcharts
                            option={this.getOption(data8,xdata)}
                            notMerge={true}
                            lazyUpdate={true}
                            theme={"theme_name"}
                        />
                    </Grid.Column>
                </Grid.Row>
            </Grid>


        )
    }

}*/