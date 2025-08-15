import React from "react";
import { Header, Divider, Dropdown,Button } from 'semantic-ui-react'
import {Label } from 'semantic-ui-react'

// 功能：展示所有使用到的要素，提供添加七大要素元素
export default class EditKeyPartComponet extends React.Component {
    constructor(props){
        super(props)
        this.workspace_data = this.props.localInfo.workspace_data
        this.service_pattern_name = this.props.localInfo.bean ? this.props.localInfo.bean.name : ""
        this.thisServicePattern = this.workspace_data.service_pattern[this.service_pattern_name]

        this.thisServicePattern._data.elements = this.thisServicePattern._data.elements || {
            Participant:[],
            Carrier:[],
            Goal:[],
            Quota:[],
            resourceObject:[],
            dataObject:[],
            currencyObject:[],
            Task:[]
        }

        let currentElements = this.thisServicePattern._data.elements 


        this.state = {
            element_options: [],
            currentElements: currentElements,
            // selected_element: {
            //     Participant:[],
            //     Carrier:[],
            //     Goal:[],
            //     Quota:[],
            //     resourceObject:[],
            //     dataObject:[],
            //     currencyObject:[],
            //     Task:[]
            // },
            // // 存储要素数据
            // elements: {
            //     Participant:[],
            //     Carrier:[],
            //     Goal:[],
            //     Quota:[],
            //     resourceObject:[],
            //     dataObject:[],
            //     currencyObject:[],
            //     Task:[]
            // }
        }
    }

    componentWillMount(){
        this.getAllElements()
        // if(this.thisServicePattern._data.elements === undefined || this.thisServicePattern._data.elements === null){
        //     this.thisServicePattern._data.elements = {
        //         Participant:[],
        //         Carrier:[],
        //         Goal:[],
        //         Quota:[],
        //         resourceObject:[],
        //         dataObject:[],
        //         currencyObject:[],
        //         Task:[]
        //     }
        // }

    }

    // 获取到所有的元素
    getAllElements(){
        let index = 0
        let concept_op = []
        const workspace_data = this.workspace_data;
        for(let concept_key in workspace_data.ontologies){
            concept_op[index] = concept_key
            index = index + 1
        }
        // console.log('!!!!cp',concept_op)
        let i = 0
        let newelement = []
        for(let currentConcept in concept_op){
            // 获取对应概念的子类
            let ontologygraph = workspace_data.ontologies[concept_op[currentConcept]]
            // 获取到对应的概念数据
            let concept_data = ontologygraph['concept_data']
            //console.log('!!!!cd',concept_data)
            for(let element in concept_data){
                if(element === 'Ability' || element === 'Carrier' ||element === 'Environment'
                   ||element === 'Goal' || element === 'Participant' ||element === 'Quota' 
                   ||element === 'Resource'||element === 'Task' ||element === 'Thing'||element === 'currencyObject')
                   continue
                newelement[i]= concept_op[currentConcept] + '/' + element
                i++;
            }
        }
        this.setState({element_options : newelement})
    }

    // /**
    //  * 将添加的要素数据放在service_pattern中
    //  * @param {添加要素的类型} type 
    //  * @param {添加的具体数据} data 
    //  */
    // addElementsToServicePattern(type, data) {
    //     const {elements} = this.state
    //     // console.log("=============thisServicePattern_name====================")
    //     // console.log(service_pattern_name)
    //     let thisWorkspace_data = this.workspace_data
    //     // 获取到本服务模式
    //     let thisServicePattern = this.thisServicePattern
        
    //     // TODO 判断是否已经添加过elements字段了
    //     if(thisServicePattern._data.elements === undefined || thisServicePattern._data.elements === null){
    //         thisServicePattern._data.elements = {}
    //     }
    //     thisServicePattern._data.elements = elements
    //     thisServicePattern._data.elements[type] = data[type]
    //     // console.log("=============thisServicePattern====================")
    //     // console.log(thisServicePattern)
    //     // console.log("=============workspace====================")
    //     // console.log(thisWorkspace_data)
    // }

    render() {
        const { page } = this.props;
        const title = page.localInfo.bean ? page.localInfo.bean.name : ""
        const {element_options, currentElements} = this.state
        return(
            <div>
                <Header as='h4'><font color="black">
                    <Label color='teal' horizontal>{title}</Label>模式展示和编辑要素</font></Header>
                    <Divider />
                    {/*下面是展示具体的七个要素同时具备添加功能*/}
                    <div>
                        <Header as='h5'><font color="black">请选择参与者要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['Participant'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['Participant']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择载体要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['Carrier'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['Carrier']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择目标要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['Goal'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['Goal']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择指标要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['Quota'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['Quota']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择数据要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['dataObject'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['dataObject']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    {/* <div>
                        <Header as='h5'><font color="black">请选择currencyObject要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['currencyObject'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {this.thisServicePattern._data.elements ? this.thisServicePattern._data.elements['currencyObject']: []}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div> */}
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择资源要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['resourceObject'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['resourceObject']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择资金要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['currencyObject'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['currencyObject']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
                    <div>
                        <Header as='h5'><font color="black">请选择任务要素</font></Header>
                        <Dropdown
                            multiple
                            search
                            labeled
                            selection
                            onChange={(event, data)=>{
                                currentElements['Task'] = data.value
                                this.setState({currentElements: currentElements})
                            }}
                            value= {currentElements['Task']}
                            options={element_options.map((opt) => {
                                return {
                                key: opt,
                                value: opt,
                                text: opt,
                            };
                        })} />
                    </div>
                    <br/>
            </div>
        );
    }
}
