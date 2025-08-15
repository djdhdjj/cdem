import React from "react";
import {Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown} from 'semantic-ui-react'
import {constrains2type} from "../../data/metaData"
import META from "../../data/nameConfig";
import deepcopy from "deepcopy";
import './ConceptEdit.css'
import { default_workspace } from "../../data/workspaceData";
import COLOR from "../../data/Color";
import { Popover } from 'antd';
import { TextFactory, concept_base_dictionary } from "../../data/dictionary"
export default class ConceptEdit extends React.Component {
    constructor(props) {
        super(props)
        this.textFactory = new TextFactory(concept_base_dictionary)
        this.state = {
            bean_data: props.bean.bean_data,
            ontologyGraph: props.bean.ontology_graph
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.bean !== prevProps.bean) {
            this.setState({
                bean_data: this.props.bean.bean_data
            })
        }
    }

    save() {
        //console.log(default_workspace);
        const {bean_data, ontologyGraph} = this.state
        ontologyGraph.concept_data[bean_data.class_name].bean_data = bean_data
    }

    giveUp() {
        const bean_data = deepcopy(this.props.bean.bean_data)
        this.setState({
            bean_data: bean_data
        })
    }

    render() {
        let tf = this.textFactory;
        const {bean_data, ontologyGraph} = this.state
        //console.log('---------')
        //console.log(this.state.bean_data)
        //console.log('----------')
        return <div style={{width:"98%",marginLeft:"1%",background:'#e0dfe8'}}>
            <Header><font color="black">{tf.str("concept edit")}:{bean_data.class_name}</font></Header>
            <Divider/>
            {
                bean_data &&
                <div className='detail' key={bean_data.class_name}>
                     {/* style={{ background: COLOR.DIRTY_WHITE }} */}
                    <Segment vertical>
                        <Header as='h3'><font color="black">{bean_data.class_name}</font></Header>
                        <Header as='h5'>
                            <nobr><font color="black">{tf.str("property")}: </font>
                            <Popover content={tf.note('property')} >
                            <Icon fitted size="large" name='question circle outline'   style={{float:"right"}}/>
                            </Popover>
                            </nobr>
                        </Header>
                        <Dropdown
                            // text={key}
                            // placeholder={key}
                            // style={{background:"gray",borderWidth:"1px",borderColor:"white"}}
                            multiple
                            search
                            labeled
                            selection
                            value={bean_data.props ? bean_data.props : []}
                            options={Object.keys(ontologyGraph.property_data).map(prop => {
                                return {
                                    key: prop,
                                    text: prop,
                                    value: prop,
                                }
                            })}
                            onChange={(event, data)=>{
                                const {value} = data
                                let {bean_data} = this.state
                                bean_data.props = value
                                const oldDefault = bean_data.propsDefault === undefined ? {} : bean_data.propsDefault
                                let newDefault = {}
                                value.forEach(v => {
                                    newDefault[v] = oldDefault[v]
                                })
                                bean_data.propsDefault = newDefault
                                this.setState({bean_data: bean_data})
                            }}
                        />
                        <Header as='h5'>
                        <font color="black"><nobr>{tf.str("property default")}:&nbsp; 
                            <Popover content={tf.note('property default')} >
                            <Icon fitted  size="large" name='question circle outline'   style={{float:"right"}}/>
                            </Popover>
                            </nobr></font>
                        </Header>
                        {
                            bean_data.propsDefault &&
                                Object.keys(bean_data.propsDefault).map((key, index) => {
                                    return <Segment key={index} vertical>
                                        <MyInput text='color'
                                                 dict={bean_data.propsDefault}
                                                 key_name={key}
                                        />
                                    </Segment>
                                })
                        }
                        <Header as='h5'>
                        <font color="black"><nobr>{tf.str("description")}:&nbsp;
                            <Popover content={tf.note('description')} >
                            <Icon fitted  size="large" name='question circle outline'  style={{float:"right"}}/>
                            </Popover>
                            </nobr></font>
                        </Header>
                        {
                            Object.keys(bean_data.Description).map((key, index) => {
                                return<Segment key={index}  vertical>
                                    <font color="black"><nobr>{tf.str(key)}:&nbsp;
                                    <Popover content={tf.note(key)} >
                                    <Icon fitted  size="large" name='question circle outline'  style={{float:"right"}}/>
                                    </Popover>
                                    </nobr></font>
                                    <Dropdown
                                        // text={key}
                                        // placeholder={key}
                                        multiple
                                        search
                                        labeled
                                        selection
                                        value={bean_data.Description[key]}
                                        options={Object.keys(ontologyGraph.concept_data).map(prop => {
                                            return {
                                                key: prop,
                                                text: prop,
                                                value: prop,
                                            }
                                        })}
                                        onChange={(event, data)=>{
                                            const {value} = data
                                            let {bean_data} = this.state
                                            bean_data.Description[key] = value
                                            this.setState({bean_data: bean_data})
                                        }}
                                    />
                                </Segment>
                            })
                        }
                        <Header as='h5'>
                        <font color="white">  <nobr><font color="black">{tf.str("graph data")}: </font>
                            <Popover content={tf.note('graph data')} >
                            <Icon fitted size="large" name='question circle outline'  style={{float:"right"}}/>
                            </Popover>
                            </nobr>&nbsp;</font>
                        </Header>
                        <Segment vertical>
                            <MyInput text='color'
                                     dict={bean_data.graph_data}
                                     key_name='color'
                            />
                        </Segment>
                        {/*
                        <div style={{width: '45%', position: 'relative', marginTop: 10}}>
                            <Button.Group attached='top'>
                                <Button onClick={() => this.giveUp()}>{tf.str("Give Up")}</Button>
                                <Button.Or />
                                <Button onClick={() => this.save()}>{tf.str("Save")}</Button>
                            </Button.Group>
                        </div>
                        */}
                    </Segment>
                </div>
            }
        </div>
        
    }
}

class MyInput extends React.Component {
    constructor(props) {
        super(props)
        const { key_name, dict, } = props
        this.textFactory = new TextFactory(concept_base_dictionary)
        let type = constrains2type[key_name]
        if (!type) {
            console.warn(key_name, '没有定义类型')
            type = META.TEXT
        }


        this.state = {
            value: dict[key_name],
            type: type,
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const { key_name, dict } = nextProps
        const { value } = this.state
        if (dict[key_name] !== value) {
            this.setState({
                value: dict[key_name]
            })
        }
    }

    render() {
        let tf=this.textFactory;
        const { key_name, dict, onChange } = this.props
        const { value, type } = this.state
        // console.log(value)
        return <font color="black">
            <Segment vertical className='constrain'>
               
                <div className='constrain_name'>
                    {/*{tf.str(key_name)}没有中文对应词典*/}
                    <font color="black">{key_name}: </font>
                </div>
                {
                    (type === META.INT || type === META.NUMERICAL || type === META.TEXT || type === META.ARRAYTEXT) &&
                    <Input placeholder={key_name} fluid
                           onChange={(event, props) => {
                               let { value } = props
                               if (value === "") {

                               }else if( type === META.INT){
                                   value = parseInt(value)
                               }else if(type === META.NUMERICAL){
                                   value = parseFloat(value)
                               }else if(type === META.ARRAYTEXT){
                                   value = value.split(';')
                               }

                               dict[key_name] = value
                               this.setState({
                                   value: value
                               })
                               onChange && onChange(event, props)
                           }}
                           value={value && (type === META.ARRAYTEXT?value.join(';'):value)}
                           style={{ top: -10 }}
                    />
                }
                {
                    type === META.BOOLEAN &&
                    <Checkbox
                        checked={value}
                        onChange={(event, props) => {
                            const { checked } = props
                            dict[key_name] = checked
                            this.setState({
                                value: checked
                            })
                            onChange && onChange(event, props)
                        }}
                    />
                }

                {
                    key_name === 'color' && (
                        <Icon style={{paddingLeft: 5, color: value}} size='large' name='circle'/>
                    )
                }
            </Segment>
            </font>
    }
}

export {
    MyInput
}
