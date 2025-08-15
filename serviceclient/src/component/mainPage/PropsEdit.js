import React from "react";
import {Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Form} from 'semantic-ui-react'
import {constrains2type} from "../../data/metaData"
import META from "../../data/nameConfig";
import deepcopy from "deepcopy";
import './ConceptEdit.css'
import {MyInput} from "./ConceptEdit";
import Add from "../ui_component/Add";
import {default_workspace} from "../../data/workspaceData";

export default class PropsEdit extends React.Component {
    constructor(props) {
        super(props)
        this.ontologyGraph = this.props.bean.ontology_graph
        this.workspace = this.ontologyGraph.workspace
        //console.log('local',this.props.localInfo)
        this.controller = this.props.localInfo.controller
        this.patternData = this.controller.patternData
        //console.log("PropsEdit中的patternData")
        //console.log(this.patternData,this.workspace.service_pattern)
        console.log('----patternData----',this.patternData)
        this.state = {
            bean_data: props.bean.bean_data,
            superProps: this.props.graph_data.superProps,
            props: props.graph_data.props,
            participant: props.graph_data.participant,
            goal: props.graph_data.goal || [],
            data_properties: this.patternData._data.nodes[this.props.localInfo.graph_data.key].data_properties || {}

        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.bean !== prevProps.bean) {
            this.ontologyGraph = this.props.bean.ontologyGraph
            this.setState({
                bean_data: this.props.bean.bean_data
            })
        }
        if (this.props.localInfo.controller !== prevProps.localInfo.controller) {
            this.controller = this.props.localInfo.controller
        }
        if (this.props.graph_data !== prevProps.graph_data) {
            this.setState({
                superProps: this.props.graph_data.superProps,
                props: this.props.graph_data.props,
                participant: this.props.graph_data.participant,
                goal: this.props.graph_data.goal ? this.props.graph_data.goal : [],
                //props: this.patternData_data.nodes[this.props.localInfo.graph_data.key].data_properties
                //data_properties:this.patternData._data.nodes[this.props.localInfo.graph_data.key].data_properties
            })
        }
    }

    save() {
        const {props, participant, goal} = this.state
        if (participant) {
            const model = this.controller.diagram.model
            model.startTransaction("edit");
            model.setDataProperty(this.props.graph_data, 'name', participant);
            model.commitTransaction("edit");
            this.props.graph_data.participant = participant
            this.props.graph_data.text = participant
            //console.log('1111',model)
        }
        this.props.graph_data.goal = goal
        this.props.graph_data.props = props
        for (let item in this.patternData.workspace.simulator){

        }
    }

    giveUp() {
        const props = deepcopy(this.props.graph_data.props)
        this.setState({
            props: props,
            participant: this.props.graph_data.participant,
            goal: this.props.graph_data.goal ? this.props.graph_data.goal : []
        })
    }

    render() {
        //console.log('graph',this.props.graph_data.props)
        const {bean_data, props, superProps, participant, goal,} = this.state;
        //console.log('bean_data',bean_data)
        //console.log('element',this.patternData)
        let nodeName = bean_data.class_name+'/'+this.patternData._data.nodes[this.props.localInfo.graph_data.key].name
        let propOptions = [];
        let {data_properties} = this.state

        //this.patternData._data.nodes[this.props.localInfo.graph_data.key].data_properties={}
        //let data_properties = this.patternData._data.nodes[this.props.localInfo.graph_data.key].data_properties      
        Object.keys(this.workspace.ontologies).forEach(ontoName => {
            const ontology = this.workspace.ontologies[ontoName];
            Object.keys(ontology.property_data).forEach(pName => {
                propOptions.push(ontoName + '/' + pName);
            })
        });
        propOptions = propOptions.map ((prop, index) => {
            return {
                key: index,
                text: prop,
                value: prop,
            }
        });
        return <div className='component-container'>
            <Header style={{color:'black'}}>属性编辑: {nodeName}</Header>
            {
                bean_data &&
                <div className='detail' key={bean_data.class_name}>
                    {/* style={{ background: COLOR.DIRTY_WHITE }} */}
                    <Segment vertical>
                        {
                            bean_data.class_name === 'Lane' &&
                            [
                                this.patternData._data.elements['Participant']&&<Segment key="Participant" vertical>
                                    参与者:  &nbsp;
                                    <Dropdown
                                        labeled
                                        selection
                                        value={participant}
                                        options={this.patternData._data.elements['Participant']
                                            .map((value) => {
                                                return {
                                                    key: value,
                                                    text: value,
                                                    value: value,
                                                }
                                            })}
                                        onChange={(event, data) => {
                                            const {value} = data
                                            this.setState({participant: value})
                                        }}
                                    />
                                </Segment>,
                                this.patternData._data.elements['Goal']&&<Segment key="Goal"  vertical>
                                    目标:  &nbsp;
                                    <Dropdown
                                        labeled
                                        selection
                                        multiple
                                        value={goal}
                                        // options={this.workspace.findAllSubclassesBelongTo("Goal")
                                        options={this.patternData._data.elements['Goal']
                                            .map((value) => {
                                                return {
                                                    key: value,
                                                    text: value,
                                                    value: value,
                                                }
                                            })}
                                        onChange={(event, data)=>{
                                            const {value} = data
                                            this.setState({goal: value})
                                        }}
                                    />
                                </Segment>,
                            ]
                        }
                        <Header as='h5' style={{color:'black'}}>
                            继承属性：  &nbsp;
                        </Header>
                        {/*
                        <Dropdown
                            labeled
                            selection
                            multiple
                            disabled
                            value={superProps}
                            options={propOptions}
                            onChange={(event, data)=>{
                                const {value} = data
                                this.setState({props: value})
                            }}
                        />*/}
                        {
                            Object.keys(superProps).map((item)=>{
                                return(
                                    <Segment vertical className='constrain'>
                                        <label style={{color:'black'}}>{item}: </label>
                                        <Input value={superProps[item]} disabled="disabled"></Input>
                                    </Segment>
                                )
                            })
                    }
                        <Header as='h5' style={{color:'black'}}>
                            属性：  &nbsp;
                        </Header>
                        
                        <Dropdown
                            labeled
                            selection
                            //search
                            multiple
                            value={Object.keys(data_properties)}
                            options={propOptions}
                            onChange={(event, data)=>{
                                const {value} = data
                                const oldDefault = data_properties === undefined ? {} : data_properties
                                let newDefault = {}
                                value.forEach(
                                    v => {
                                        newDefault[v] = oldDefault[v]
                                    }
                                )
                                data_properties = newDefault
                                this.patternData._data.nodes[this.props.localInfo.graph_data.key].data_properties = newDefault
                                this.setState({data_properties:data_properties})
                            }}
                        />
                        <Header as='h5' style={{color:'black'}}>
                            编辑属性：  &nbsp;
                        </Header>
                        <Form >
                        {console.log('data_prop',data_properties)}
                         {Object.keys(data_properties).map(p_n=>{
                            return(
                            <Form.Group widths='equal'>
                                {/*<Form.Select search fluid
                                    placeholder='Select a props'
                                    options={propOptions}
                                    value={p_n}
                                    //disabled={this.inherit_data_properties_keys.indexOf(p_n)>-1}
                                    onChange={(e, { value }) => {
                                        if(data_properties.hasOwnProperty(value)){
                                            //message.error(tf.str('already has this type'));
                                        }else{
                                            data_properties[value] = ''
                                            //delete data_properties[p_n]
                                            //this.setState({ props:value })
                                        }
                                    }}
                                    onClick={() => {
                                        //const { all_properties } = workspace
                                        this.setState({
                                            //property_options: wrapConceptOptions(all_properties),
                                        })
                                        console.log('p_n',p_n)
                                    }}
                                />*/}
                                <Form.Input fluid 
                                    label ={p_n}
                                    defaultValue={data_properties[p_n]}
                                    onChange={(e, { value }) => {
                                        data_properties[p_n] = value
                                        this.setState({ data_properties:data_properties })
                                        this.patternData._data.nodes[this.props.localInfo.graph_data.key].data_properties = data_properties
                                        //console.log('data_properties[p_n]',data_properties[p_n])
                                        //console.log('sp',this.patternData)
                                    }} 
                                    style = {{width:'200px'}}
                                />
                                </Form.Group>
                                )
                                })}
                        </Form>
                        {/*<Header as='h5'>*/}
                            {/*Description:  &nbsp;*/}
                        {/*</Header>*/}
                        {/*{*/}
                            {/*this.ontologyGraph &&*/}
                            {/*Object.keys(bean_data.Description).map((key, index) => {*/}
                                {/*return<Segment key={index}  vertical>*/}
                                    {/*{key}:  &nbsp;*/}
                                    {/*<Dropdown*/}
                                        {/*// text={key}*/}
                                        {/*// placeholder={key}*/}
                                        {/*disabled*/}
                                        {/*multiple*/}
                                        {/*search*/}
                                        {/*labeled*/}
                                        {/*selection*/}
                                        {/*value={bean_data.Description[key]}*/}
                                        {/*options={Object.keys(this.ontologyGraph.concept_data).map(prop => {*/}
                                            {/*return {*/}
                                                {/*key: prop,*/}
                                                {/*text: prop,*/}
                                                {/*value: prop,*/}
                                            {/*}*/}
                                        {/*})}*/}
                                        {/*onChange={(event, data)=>{*/}
                                            {/*const {value} = data*/}
                                            {/*let {bean_data} = this.state*/}
                                            {/*bean_data.Description[key] = value*/}
                                            {/*this.setState({bean_data: bean_data})*/}
                                        {/*}}*/}
                                    {/*/>*/}
                                {/*</Segment>*/}
                            {/*})*/}
                        {/*}*/}

                       {/*<div style={{width: '98%', position: 'relative', marginTop: 10}}>
                            <Button.Group attached='top'>
                                <Button onClick={() => this.giveUp()}>Give Up</Button>
                                <Button.Or />
                                <Button onClick={() => this.save()}>Save</Button>
                            </Button.Group>
                                        </div>*/}

                    </Segment>
                </div>
            }
        </div>
    }
}

