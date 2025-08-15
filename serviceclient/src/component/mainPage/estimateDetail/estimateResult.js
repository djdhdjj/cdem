import React from 'react';
import { Button, Grid, List, Divider } from "semantic-ui-react";
import { Checkbox, Spin, Table ,Select} from 'antd';
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
import ReactEcharts from 'echarts-for-react';
import 'echarts/dist/extension/dataTool'
//import { default_workspace } from "../../../data/workspaceData";
import axios from 'axios';
import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';
import {TextFactory,evaluate_dictionary} from '../../../data/dictionary'
import { pageManage } from "../../../manager/PageManage";
import { PageType } from "../../../manager/PageManage";

const CheckboxGroup = Checkbox.Group;
const { Option } = Select;

export default class EstimateResult extends React.Component{

    constructor(props) {
        super(props)
        const key = Object.keys(props.page.assessedResults)[0]
        this.state = {
            estCheckVis: false,
            // 表格数据
            tableVis: true,
            tableCol: null,
            tableSour: null,
            estAllData:props.page.assessedResults[key],
            //estAllData:props.localInfo,
            switchVis:true,
            ListVis:true,
            switchValue:true,
        }
        this.assessedResults = props.bean
        if (this.assessedResults ===undefined) {
            this.assessedResults = props.page.assessedResults
            //this.assessedResults = props.localInfo
        }
        console.log('er_prop',props)
        //console.log(props.page.assessedResults)
        //console.log('er_defalut_workspace',default_workspace)
        this.language = this.props.language
        this.textFactory = new TextFactory(evaluate_dictionary,this.language)
        //console.log('er_prop2',this.props)
        this.ar_id = this.props.page.ar_id //这是点“开始仿真”跳转到仿真结果页面时，获取sim_id的方法
        if (this.ar_id ===undefined) {
            this.ar_id = this.assessedResults.ar_id //这是点左侧菜单跳转到仿真结果页面，获取sim_id的方法
            //console.log('left', this.ar_id)
            this.type = this.props.page.type
        }
        //this.assessedResults.reg(this)
        //console.log("estimateResult已初始化:")
        //console.log(this)
    }
    
    
        render(){
            const tf = this.textFactory

            const { estCheckVis, tableVis,estAllData } = this.state
            
            //console.log('estAllData',estAllData)
            return(
            <div>
            {
            !estCheckVis && !tableVis && <Spin size="large"  style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translateX(-50%) translateY(-50%)' }} />
            }
            {
            !estCheckVis && tableVis &&  <EstimateTable tableSour={ estAllData  } ></EstimateTable>
        }
        {
            !estCheckVis && tableVis &&  <Boxplot boxSour = {estAllData}></Boxplot>
        }
            </div> 
            )
        }

}

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
            title: '模式名称',
            dataIndex: 'Name',
            key: 'Name'
        }, {
            title: '模式熵',
            dataIndex: 'P_entropy',
            key: 'P_entropy'
        },
        {
            title: '成本',
            dataIndex: 'cost',
            key: 'cost'
        }, {
            title: '现金传递效率',
            dataIndex: 'currency_efficiency',
            key: 'currency_efficiency'
        }, {
            title: '数据传递效率',
            dataIndex: 'data_efficiency',
            key: 'data_efficiency'
        }, {
            title: '时耗',
            dataIndex: 'duration',
            key: 'duration'
        }, {
            title: '可靠性',
            dataIndex: 'reliability',
            key: 'reliability'
        }, {
            title: '资源传递效率',
            dataIndex: 'resource_efficiency',
            key: 'resource_efficiency'
        }, {
            title: '价值',
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

        data1.name = '模式熵'
        data2.name = '成本'
        data3.name = '资金传递效率'
        data4.name = '数据传递效率'
        data5.name = '时耗'
        data6.name = '可靠性'
        data7.name = '资源传递效率'
        data8.name = '价值'
        //console.log('eR',this.props)
        var xdata = this.props.boxSour.map(item=>{
            //console.log('item.name',item.name)
            return item.name
        })


        return (
            <Grid columns={2} divided>
                <br/>
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

}