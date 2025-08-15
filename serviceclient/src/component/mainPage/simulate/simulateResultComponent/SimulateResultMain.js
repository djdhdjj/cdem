import React from "react";
import { Table, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select, Button } from 'semantic-ui-react'
import { select } from "d3";
import ReactEcharts from "echarts-for-react";
import simulateResultController from '../SimulateResult'
import { Tree } from 'antd';
import {TextFactory,simulate_dictionary, concept_base_dictionary} from '../../../../data/dictionary'
import '../simulateResult.css'

const isNumber = un =>{
    return (typeof un ==='string'||typeof un ==='number')&&!isNaN(un)
}

export default class SimulateResultMain extends React.Component {//主界面
    constructor(props){
        super(props)
        this.frame = props.stepData
        this.pattern_instance_base = props.patternInstanceBase
        this.currentStep = this.frame?this.frame.step:0
        this.chartList = []
        this.textFactory = new TextFactory(simulate_dictionary)
        this.state = { 
            activeItem: this.textFactory.str('chart') //当前显示的选项卡
        }
    }

    componentWillReceiveProps (nextProps){
        this.frame = nextProps.stepData
        this.pattern_instance_base = nextProps.patternInstanceBase
        this.currentStep = this.frame?this.frame.step:0
    }

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    getNameToTypes(){//因为后台传过来的是name，而process需要显示task(对应pattern_instance的type)
        return this.pattern_instance_base.instances.map(elm => {
            return {
                name:elm.name,
                type:elm.type
            }
        }) 
    }

    selectContent(selectedItem){
        const tf = this.textFactory
        switch(selectedItem){
            case tf.str('chart'):return <SimulateChart chartData={this.frame.data.quota} currentStep={this.currentStep} chartList={this.chartList}/>
            case tf.str('instance_list'):return <SimulateInstance instanceData={this.frame.data.instance_base}/>
            case tf.str('process'):return <SimulateProcess processData={this.frame.data.process} nameToTypes={this.getNameToTypes()}/>
            case tf.str('terminal'):return <SimulateTerminal terminalData={this.frame.message}/>
        }
    }

    render() {
        const { activeItem } = this.state
        const tf = this.textFactory
        //console.log(hasData)
        //console.log(this)
        return (
            <div style={{height:'100%'}}>
                <Menu tabular inverted style={{height:'46px'}}>
                    <Menu.Item
                        name={tf.str('chart')}
                        active={activeItem === tf.str('chart')}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name={tf.str('instance_list')}
                        active={activeItem === tf.str('instance_list')}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name={tf.str('process')}
                        active={activeItem === tf.str('process')}
                        onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name={tf.str('terminal')}
                        active={activeItem === tf.str('terminal')}
                        onClick={this.handleItemClick}
                    />
                </Menu>
            
                <div style={{ height: 'calc( 100% - 60px )' }}>
                    {        this.frame!=null&&this.selectContent(activeItem)           }
                </div>
            </div>

        )
        
  }
}

const tf = new TextFactory(simulate_dictionary)

const typeOptions = [//三种图表类型
    { key: 'bar', text: tf.str('bar'), value:'bar' },
    { key: 'line', text: tf.str('line'), value: 'line' },
    { key: 'pie', text: tf.str('pie'), value:'pie' }
]

class SimulateChart extends React.Component {//图表界面
    constructor(props){
        super(props)
        this.chartData = props.chartData //当前帧的所有和图表有关的数据（所有watcher数据）
        this.currentStep = props.currentStep //当前步骤
        this.chartList = props.chartList
        //this.textFactory = new TextFactory(simulate_dictionary)
        this.state = {
            chartType:'bar', //图表类型，默认选中bar
            y:'', 
            xList:[],
            yList:[],
            chartList:this.chartList
        }
    }
    
    componentWillReceiveProps (nextProps){
        this.chartData = nextProps.chartData //当前帧的所有和图表有关的数据（所有watcher数据）
        if(this.currentStep != nextProps.currentStep){
            this.onCurrentStepChanged(nextProps.currentStep)
        }
        this.currentStep = nextProps.currentStep //当前步骤
        this.chartList = nextProps.chartList
    }

    onCurrentStepChanged(nextStep){
        const chartList = this.state.chartList
        /*let newChartList = */chartList.map(chart => {
            if(chart.series[0].type === 'pie'){
                let yList = this.chartData[nextStep].filter(elm => {
                    return chart.series[0].data.find(x => x.name === elm.name)
                }).map(elm => {
                    return {
                        name:elm.name,
                        value:parseFloat(elm.val)
                    }
                })
                chart.series[0].data = yList
                //return chart
            }else{
                let chartData = this.chartData
                let yList = [],xList = []
                for(let i=0;i<=nextStep;i++){
                    for(let j=0;j<chartData[i].length;j++){
                        if(chartData[i][j].name === chart.yAxis.name){
                            yList.push(parseFloat(chartData[i][j].val))
                            xList.push(i)
                            break
                        }
                    }
                }
                chart.xAxis.data = xList
                chart.series[0].data = yList
                //return chart
            }

        })
        console.log(chartList)
        this.setState({chartList})
    }

    getYOptions(step = this.currentStep){
        const chartData = this.chartData
        
            let res = chartData[step].filter(elm => {
                return isNumber(elm.val)         
            }).map(elm => {
                return {
                    key:elm.name,
                    text:elm.name,
                    value:elm.name
                }
            })
            return res
         
    }

    createChartOptions(chartType){ //创建图表
        const {y,xList,yList} = this.state
        if(chartType === 'pie'){//饼图
            return {
                tooltip: {//悬浮窗
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend: {
                    orient: 'vertical',
                    left: 10,
                    data: xList
                },
                series: [
                    {
                        name:'currentStep:'+this.currentStep,
                        type: 'pie',
                        radius: ['50%', '70%'],
                        avoidLabelOverlap: false,
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '20',
                                fontWeight: '400'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: yList
                    }
                ]
                
            }
        }
        return {//柱状图或折线图
            tooltip: {
                trigger: 'item',
            },
            xAxis: {
                name:'step',
                data:xList
            },
            yAxis: {
                name:y,       
            },
            series: [{
                type: chartType,
                data: yList
            }]
        }
    }

    render(){
        const {chartType,y,xList,yList,chartList} = this.state
        //const step = this.step
        //const tf = this.textFactory
        return (
            <div style={{height:'100%', paddingLeft:10}}>
                <div >
                <Form inverted>
                <Form.Group  inline style={{color: 'black'}}>
                    <Form.Select  
                        width={5}
                        options={typeOptions} 
                        //placeholder={tf.str('select_a_chart_type')}
                        label={tf.str('chart_type')+':'}
                        value={chartType}
                        style={{color: 'black'}}
                        onChange={(e, { value }) => {  this.setState({chartType:value})  }}
                    />
                    {chartType !='pie'&&
                        <Form.Input 
                            width={3}
                            label='X:'
                            style={{color: 'black'}}
                            value={'step'}
                            disabled
                            />
                    }
                    {chartType !='pie'&&
                        <Form.Select
                            width={5}
                            options={this.getYOptions()} 
                            //placeholder='选择Y轴属性'
                            label='Y:'
                            value={y}
                            style={{color: 'black'}}
                            onChange={(e, { value }) => {                  
                                this.setState({
                                    y:value,
                                })  
                            }}
                        />
                    }
                    {chartType ==='pie'&&
                        <Form.Select
                            width={8}
                            multiple
                            label={tf.str('data_set') + ':'}
                            options={this.getYOptions()} 
                            //value={xList}
                            //placeholder='选择饼状图数据'
                            onChange={(e, { value }) => {  
                                this.setState({
                                    xList:value,
                                })
                            }}
                            />
                    }
                    <Form.Button content={tf.str('add_chart')}
                        //fluid
                        width={3}
                        onClick={() => {
                            if((chartType!='pie'&&y.length>0)){//画折线图或柱状图
                                let chartData = this.chartData
                                let yList = [],xList = []
                                for(let i=0;i<=this.currentStep;i++){
                                    for(let j=0;j<chartData[i].length;j++){
                                        if(chartData[i][j].name === y){//有value监视的才画图
                                            yList.push(parseFloat(chartData[i][j].val))
                                            xList.push(i)
                                            break
                                        }
                                    }
                                }
                                //console.log('step:'+this.currentStep)
                                this.state.xList = xList
                                this.state.yList = yList
                                const chartOptions = this.createChartOptions(chartType)
                                chartList.push(chartOptions)
                                this.setState({ chartList })
                                //console.log(chartList)
                            }else if(chartType==='pie'&&xList.length>0){
                                this.state.yList = this.chartData[this.currentStep].filter(elm => {
                                    return xList.find(x => x === elm.name)
                                }).map(elm => {
                                    return {
                                        name:elm.name,
                                        value:parseFloat(elm.val)
                                    }
                                })
                                const chartOptions = this.createChartOptions(chartType)
                                chartList.push(chartOptions)
                                this.setState({ chartList })
                            }
                            
                        }}>
                    </Form.Button>
                </Form.Group>
                </Form>
                </div>
                <div style={{ height: '100%', overflow:'auto' }}>
                <Grid columns='two' divided>
                    {chartList.map((elm,index,list) => {//一行画两个
                        //console.log(elm)
                        if(index%2 === 0 && index != list.length-1){
                            return(<Grid.Row>
                                <Grid.Column>
                                    <ReactEcharts
                                        option={JSON.parse(JSON.stringify(elm))}//immutable方式更新,否则不会实时更新
                                        theme='dark'
                                        //notMerge={true}
                                    />
                                </Grid.Column>

                                <Grid.Column>
                                    <ReactEcharts
                                        option={JSON.parse(JSON.stringify(list[index+1]))}
                                        theme='dark'
                                        //notMerge={true}
                                    />
                                </Grid.Column>        
                            </Grid.Row>)                      
                        }else if(index%2 === 0 && index === list.length-1){//最后一行只有一个的情况
                            return(<Grid.Row>
                                <Grid.Column>
                                    <ReactEcharts
                                        option={JSON.parse(JSON.stringify(elm))}
                                        theme='dark'
                                        //notMerge={true}
                                    />
                                </Grid.Column>        
                            </Grid.Row>)   
                        }        
                    })}              
                </Grid>
                </div>
            </div>
        )
    }
}

class SimulateInstance extends React.Component { //参考instanceTree和instanceEdit组件，注释我就不写了
    constructor(props){
        super(props)
        this.instanceData = props.instanceData
        this.textFactory2 = new TextFactory(concept_base_dictionary)
        this.state={
            treeData:[],
            selected:null
        }
    }

    componentWillReceiveProps (nextProps){
        this.instanceData = nextProps.instanceData 
        this.state.treeData = this.toTreeJson(this.instanceData)
    }

    toTreeJson(instanceData){
        let groups = instanceData.groups.map(elm =>{
            return{
                'title':elm.name,
                'key':elm.name,
                'children':this.toTreeJson(elm)
            }
        })
        let instances = instanceData.instances.map(elm => {
            return {
                'title':elm.name,
                'key':elm.name,
                'isLeaf':true,
            }
        })
        return groups.concat(instances)
    }

    findInstanceByName(name,instanceData){
        let instance = instanceData.instances.find(elm => elm.name === name)
        if(!instance){
            for (let index = 0; index < instanceData.groups.length; index++) {
                const group = this.groups[index];
                instance = this.findInstanceByName(name,group)
                if(instance){
                    return instance
                }
            }
        }
        //console.log(instance)
        return instance
    }

    onSelect(selectedNode){ ////
        let instance = this.findInstanceByName(selectedNode.key,this.instanceData)    
        //console.log('oko')
        //console.log(instance)
        this.setState({
            selected:instance,
        })
    }

    render(){
        const {treeData,selected} = this.state
        const tf2 = this.textFactory2
        return(
            <div style={{height:'100%'}}>
                <div style={{paddingTop:10,paddingRight:10,float: 'left', width:'29%', height:'100%', overflow:'auto'}}>       
                    <Tree
                     style={{background:'#464646',color:'rgb(255,255,255)'}}
                        blockNode
                        defaultExpandAll
                        treeData={treeData}
                        onSelect={(selectedKeys, info) => {
                            const { node } = info
                            if(node.isLeaf){
                                this.onSelect(node)
                            }
                            }
                        } 
                    />
                </div>

                {selected&&<div style={{paddingBottom:10,float: 'left', width:'70%', height:'100%', overflow:'auto'}}>
                   
                <Form inverted style={{paddingLeft:8,paddingRight:8}} className='customDark3'>
                    <Header inverted as='h4'>{tf.str('Basic Information')}</Header>
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <label>{tf.str('Instance Name')}</label>
                            <Form.Input 
                                //label={tf.str('Instance Name')}
                                fluid
                                value={selected.name}
                            disabled
                            /> 
                        </Form.Field>
                        <Form.Field>
                            <label style={{color:'black'}}>{tf.str('Type')}</label>
                            <Form.Select
                                //label={tf.str('Type')}
                                options={selected.type.map(elm => {
                                    return {
                                        value:elm,
                                        text:elm
                                    }
                                })}
                                multiple
                                value={selected.type }                    
                                fluid
                                disabled
                            />
                        </Form.Field>
                        <Form.Field>
                            <label>{tf.str('Bind To')}</label>
                            <Form.Select                          
                            fluid
                            multiple
                            //label={tf.str('Bind To')}
                            options = {selected.bindTo.map(elm => {
                                return {
                                    text:elm,
                                    value:elm
                                }
                            })}
                            value={selected.bindTo}
                            disabled
                            />
                        </Form.Field>
                    </Form.Group>
                    <Divider />
                    <Header inverted as='h4'> {tf2.str('property')}</Header>
                    {Object.keys(selected.data_properties).map(key => { return (
                        <Form.Group widths='equal'>
                        <Form.Select  fluid
                            options={[{value:key,text:key}]}
                            value={key}
                            disabled
                            />
                        <Form.Input fluid 
                            value={selected.data_properties[key].text}
                            disabled 
                            />     
                        </Form.Group>
                    )    
                        }
                    )}
                    
                    <Divider />  
                    <Header inverted as='h4'>{tf2.str('relation')}</Header>
                    {selected.object_properties.map(elm => ( <Form.Group widths='equal'>
                        <Form.Select  fluid
                            options={elm.type.map(el => {           
                                return {
                                    text:el,
                                    value:el
                                }
                            })}
                            value={elm.type}
                            multiple
                            disabled
                            />
                        <Form.Input fluid 
                            value={elm.target}
                            disabled 
                            />     
                    </Form.Group>   
                    ))}
                         
                </Form>
                
                </div>
                }
            </div>
        )
    }

}

class SimulateProcess extends React.Component {
    constructor(props){
        super(props)
        this.process = []
        this.nameToTypes = []//name到task的转换，实际上应该在后台处理好再发过来
        this.textFactory = new TextFactory(simulate_dictionary)

        //console.log(this.processData)

    }

    componentWillReceiveProps (nextProps){
        this.process = this.formatData(nextProps.processData)
        this.nameToTypes = nextProps.nameToTypes
    }
    

    formatData(processData){
        return processData.map( (elm,index) => {
            let roleString = JSON.stringify(elm.role).replace('{','').replace('}','')
            let task = '预备'
            if(elm.tokens.length > 0){//name到task的转换，实际上应该在后台处理好的
                //后台传给我的是name，但是任务那一栏要显示的是他的type
                task = elm.tokens.map(token => {
                    let name = token.BPMN_node
                    for(let element of this.nameToTypes){
                        if(element.name === name){
                            return element.type
                        }
                    }
                    return name                                             
                }).toString()
            }
            return{
                id:index,
                role:roleString,
                task:task
            }
        } )

    }

    render(){
        const process = this.process
        const tf = this.textFactory
        //console.log(process)
        return(
            <div style={{padding:10, height:'100%', overflow:'auto'}}>
                <Table celled inverted>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{tf.str('process_id')}</Table.HeaderCell>
                            <Table.HeaderCell>{tf.str('process_role')}</Table.HeaderCell>
                            <Table.HeaderCell>{tf.str('process_task')}</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {
                            process.map((process) => {
                                return(
                                    <Table.Row>
                                        <Table.Cell title={process.id}>{process.id}</Table.Cell>
                                        <Table.Cell title={process.role.replace(',','\n')}>{process.role}</Table.Cell>
                                        <Table.Cell title={process.task.replace(',','\n')}>{process.task}</Table.Cell>
                                    </Table.Row>
                                    )
                                
                            })
                        }               
                       
                    </Table.Body>
                </Table>
    </div>
        )
    }
}

class SimulateTerminal extends React.Component {
    constructor(props){
        super(props)
        //this.terminalData = []
        this.state = {
            code:'',
            terminalContent:[]
        }

    }
    
    componentWillReceiveProps (nextProps){
        this.state.terminalContent.push(nextProps.terminalData)
    }
    
  componentDidMount () {
    this.refs.input.focus()
    this.scrollToBottom();
  }
  
  componentDidUpdate() {
    this.scrollToBottom();
  }

  scrollToBottom(){//滚屏
    //this.messagesEnd.scrollIntoView({ behavior: "smooth" });//自动滚屏
  }

    render(){
        const {code,terminalContent} = this.state
        return(
            <div style={{padding:10,height:'100%'}}>
                <Input fluid style={{height:'40px'}} ref='input'
                    value={code}
                    onChange= {(e, { value }) => {
                        this.setState({ code:value })
                    }} 
                    onKeyDown = {(e) => {
                        if(e.nativeEvent.keyCode === 13){                         
                            //console.log(code)
                            terminalContent.push(code)
                            this.setState({ code:'' })
                        }
                    }}>
                </Input>
                    <Segment style={{height:'calc( 100% - 50px )'}}> 
                        <div style={{height:'100%',overflow:'auto'}} >
                        {terminalContent.map(elm => (
                            <p>{elm}</p>
                        ))}
                        {/**在content最后的隐形div，用于自动滚屏 */}
                        <div style={{ float:"left", clear: "both" }}
                            ref={(el) => { this.messagesEnd = el; }}>
                        </div>
                        </div>
                    </Segment>
            </div>
        )
    }

}

