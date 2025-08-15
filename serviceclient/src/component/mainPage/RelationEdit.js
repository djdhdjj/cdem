import React from "react";
import {Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown} from 'semantic-ui-react'
// import COLOR from "../../data/Color";
import deepcopy from "deepcopy";
import './ConceptEdit.css'
import {MyInput} from "./ConceptEdit";
import { Popover } from 'antd';
import { TextFactory, concept_base_dictionary } from "../../data/dictionary"
export default class RelationEdit extends React.Component {
    constructor(props) {
        super(props)
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
        const {bean_data, ontologyGraph} = this.state
        ontologyGraph.relation_data[bean_data.class_name].bean_data = bean_data
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
        return <div style={{width:"98%",marginLeft:"1%"}}>
            <Header><font color="black">{tf.str("Relation Edit")}:{bean_data.class_name}</font></Header>
            <Divider/>
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
                                    <MyInput text='black'
                                             key={bean_data.class_name + constrain_name}
                                             dict={bean_data.Characteristics}
                                             key_name={tf.str(constrain_name)}
                                    >{console.log('cn------',constrain_name)}
                                    </MyInput>
                                )
                            })
                        }
                        <Header as='h5'>
                        <nobr><font color="black">{tf.str("description")}:&nbsp;</font>
                            <Popover content={tf.note('description')} >
                            <Icon fitted size="large" name='question circle outline' style={{float:"right"}}/>
                            </Popover>
                            </nobr>
                        </Header>
                        {
                            Object.keys(bean_data.Description).map((key, index) => {
                                //console.log('!!!!key',key)
                                return<Segment key={index} vertical>
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
                                        options={Object.keys(ontologyGraph.relation_data).map(prop => {
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

                        {/*<div style={{width: '45%', position: 'relative', marginTop: 10}}>
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
