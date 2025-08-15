import React from "react";
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown } from 'semantic-ui-react'
import deepcopy from "deepcopy";
import './ConceptEdit.css'
import {MyInput} from "./ConceptEdit";
import {default_property_range} from "../../data/Ontology/default_property_bean_data";
import { TextFactory, concept_base_dictionary } from "../../data/dictionary"
import { Popover } from 'antd';
export default class PropertyEdit extends React.Component {
    constructor(props) {
        super(props)
        //console.log('pro_edit',props)
        this.textFactory = new TextFactory(concept_base_dictionary);
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
        const { bean_data, ontologyGraph } = this.state
        ontologyGraph.property_data[bean_data.class_name].bean_data = bean_data
    }

    giveUp() {
        const bean_data = deepcopy(this.props.bean.bean_data)
        this.setState({
            bean_data: bean_data
        })
    }
    render() {
        let tf = this.textFactory;
        const { bean_data, ontologyGraph } = this.state
        //console.log('props',this.props)
        return <div style={{width:"98%",marginLeft:"1%"}}>
            <Header><font color="black">{tf.str("Property Edit")}: {bean_data.class_name}</font></Header>
            <Divider />
            {
                bean_data &&
                <div className='detail' key={bean_data.class_name}>
                    <Segment vertical>
                        <Header as='h3'><font color="black">{bean_data.class_name}</font></Header>
                        <Header as='h5'>
                        <nobr><font color="black">{tf.str("Characteristics")}:&nbsp;</font>
                            <Popover content={tf.note('Characteristics')} >
                            <Icon fitted size="large" name='question circle outline'   style={{float:"right"}}/>
                            </Popover>
                            </nobr>
                        </Header>
                        {
                            Object.keys(bean_data.Characteristics).map(constrain_name => {
                                return (
                                    <MyInput text='color'
                                        key={bean_data.class_name + constrain_name}
                                        dict={bean_data.Characteristics}
                                        key_name={tf.str(constrain_name)}
                                    />
                                )
                            })
                        }
                        <Header as='h5'>
                        <nobr><font color="black">{tf.str("description")}:&nbsp;</font>
                            <Popover content={tf.note('description')} >
                            <Icon fitted size="large" name='question circle outline'  style={{float:"right"}}/>
                            </Popover>
                            </nobr>
                        </Header>
                        {
                            Object.keys(bean_data.Description).map((key, index) => {
                                return <Segment key={index} vertical>
                                    {/* {key}:  &nbsp; */}
                                    <nobr><font color="black">{tf.str(key)}:&nbsp;</font>
                                        <Popover content={tf.note(key)} >
                                        <Icon fitted size="large" name='question circle outline'   style={{float:"right"}}/>
                                        </Popover>
                                        </nobr>
                                    <Dropdown
                                        // text={key}
                                        // placeholder={key}
                                        multiple
                                        search
                                        labeled
                                        selection
                                        value={bean_data.Description[key]}
                                        options={
                                            key === 'range' ?
                                                Object.keys(default_property_range).map(prop => {
                                                    return {
                                                        key: prop,
                                                        text: prop,
                                                        value: prop,
                                                    }}) :
                                                key === 'domain' ?
                                                    Object.keys(ontologyGraph.concept_data).map(prop => {
                                                        return {
                                                            key: prop,
                                                            text: prop,
                                                            value: prop,
                                                        }}) :
                                                    Object.keys(ontologyGraph.property_data).map(prop => {
                                                    return {
                                                        key: prop,
                                                        text: prop,
                                                        value: prop,
                                                    }})}
                                        onChange={(event, data) => {
                                            const { value } = data
                                            let { bean_data } = this.state
                                            bean_data.Description[key] = value
                                            this.setState({ bean_data: bean_data })
                                        }}
                                    />
                                </Segment>
                            })
                        }

                        {/*<div style={{width: '45%', position: 'relative', marginTop: 10 }}>
                            <Button.Group attached='top'>
                                <Button onClick={() => this.giveUp()}>{tf.str("Give Up")}</Button>
                                <Button.Or />
                                <Button onClick={() => this.save()}>{tf.str("Save")}</Button>
                            </Button.Group>
                    </div>*/}
                    </Segment>

                </div>
            }
        </div>
    }
}
