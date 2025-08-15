// 仿真配置->模式要素->单个模式要素的组件

import React from "react";
import { Select,Input,Card, Form, Button, Divider, Icon, Header, Label } from "semantic-ui-react";
import TextEditor from "./TextEditor";
import {message,Popover} from "antd"
import {TextFactory,simulate_dictionary,concept_base_dictionary} from "../../../../data/dictionary"
import { flow } from "mobx";
import '../simulateConfig.css'
import SwimlaneDiagram from './SwimlaneDiagram'
import { color } from "echarts/lib/export";

const wrapInstanceOptions = elm => elm.map(elm => ({
    key: elm.name,
    text: elm.name,
    value: elm.name,
    //obj: elm,
})).filter(elm => elm.key && elm.key !== '')

const wrapConceptOptions = elm => Object.values(elm).map(elm => ({
    key: elm.id_name,
    text: elm.id_name,
    value: elm.id_name,
    obj: elm,
}))

export default class TypeElementInstanceComponent extends React.Component{
    constructor(props) {
        super(props)
        const instance = this.props.instance; //instance是引用,来自pattern_instance_base的instance
        this.instance=instance
        //console.log('模式要素')
        //console.log(this.instance)
        //debugger
        const workspace = instance.instance_base.workspace
        this.simulator=this.props.bean
        
        this.textFactory=new TextFactory(simulate_dictionary)
        this.textFactory2=new TextFactory(concept_base_dictionary)
        // 参考simulateConfig-old.js 301行
        let all_instance_options = wrapInstanceOptions(instance.instance_base.all_instances)

        /*
        //下面这段有问题，并不能真正地获知是否继承自原子模式库。
        //2020.8.10：不需要这个功能
        if(this.simulator.shareData.typeElementInheritInfo==undefined){
            // 标记出继承自原子模式库的data_properties，以供禁止修改
            this.inherit_data_properties_keys = Object.keys(instance.data_properties)
            // 标记出继承自原子模式库的object_properties，以供禁止修改
            this.inherit_out_relations_id = instance.out_relations.map(elm=>elm.id)
            this.simulator.shareData.typeElementInheritInfo={
                inherit_data_properties_keys:this.inherit_data_properties_keys,
                inherit_out_relations_id:this.inherit_out_relations_id
            }
        }else{
            this.inherit_data_properties_keys = this.simulator.shareData.typeElementInheritInfo.inherit_data_properties_keys
            this.inherit_out_relations_id = this.simulator.shareData.typeElementInheritInfo.inherit_out_relations_id
        }
        */
       this.inherit_data_properties_keys=[]//临时措施，不禁止修改任何内容
       this.inherit_out_relations_id=[]//临时措施，不禁止修改任何内容


        this.state = {
            instance: instance,
            all_instance_options:  all_instance_options,
            property_options: wrapConceptOptions(workspace.all_properties),
            concept_options: wrapConceptOptions(workspace.all_concepts),
            relation_options: wrapConceptOptions(workspace.all_relations),
            pattern_obj_options: [],
            //service_pattern_instance: this.props.instance, 
        }
    }
    render(){
        // 参考simulateConfig-old.js 316行
        const instance = this.instance
        const { data_properties, relations, type } = instance
        const { all_instance_options, property_options, concept_options, relation_options, pattern_obj_options } = this.state
        const { workspace } = instance.instance_base
        const { instance_base } = instance
        const { is_pattern, simulator } = instance_base
        const {node2binding_relations} = simulator
        const tf=this.textFactory
        const tf2=this.textFactory2
        // 参考simulateConfig-old.js 341行
        return(
            <div style={{padding:10}}>
                <Form className='customDark'>
                    <Form.Group widths='equal'>
                        <Form.Field>
                            <label style={{color:'black'}}>{tf.str('Instance Name')}</label>
                            <Input disabled value={this.state.instance.name} />
                        </Form.Field>
{/* 
                        <Form.Input
                            label={tf.str('Instance Name')}
                            fluid
                            value={this.state.instance.name}
                            disabled
                        /> */}
                        <Form.Field>
                            <label style={{color:'black'}}>{tf.str('Type')}</label>
                            <Select
                                style={{background: '#e0dfe8'}}
                                multiple
                                search
                                fluid
                                options={this.state.concept_options}
                                value={this.state.instance.type}
                                disabled
                            />
                        </Form.Field>
                        {/* <Form.Select
                            label={tf.str('Type')}
                            multiple
                            search
                            fluid
                            options={this.state.concept_options}
                            value={this.state.instance.type}
                            disabled
                        /> */}
                    </Form.Group>
                    <Divider />
                    <Header as='h5' >
                        {tf2.str('property')}
                        <Popover style={{color:'black'}} content={tf2.note('property')} >
                            <Icon style={{float:'right'}} fitted name='question circle outline' />
                        </Popover>
                    </Header>
                    {
                        Object.keys(data_properties).map(p_n=>{
                            return(
                            <Form.Group widths='equal'>
                                <Form.Select search fluid
                                    //placeholder='Select a type'
                                    options={property_options}
                                    value={p_n}
                                    disabled={this.inherit_data_properties_keys.indexOf(p_n)>-1}
                                    onChange={(e, { value }) => {
                                        if(data_properties.hasOwnProperty(value)){
                                            message.error(tf.str('already has this type'));
                                        }else{
                                            data_properties[value] = data_properties[p_n]
                                            delete data_properties[p_n]
                                            this.setState({ instance })
                                        }
                                    }}
                                    onClick={() => {
                                        const { all_properties } = workspace
                                        this.setState({
                                            property_options: wrapConceptOptions(all_properties),
                                        })
                                    }}
                                />
                                <Form.Input  
                                    value={data_properties[p_n].text}
                                    onChange={(e, { value }) => {
                                        data_properties[p_n].text = value
                                        this.setState({ instance })
                                    }} 
                                    style={{border:'0.5px black'}}
                                    color='black'
                                />
                                <TextEditor  data={data_properties[p_n]} update={()=>this.setState({instance})}/>
                                <Button color='red' icon='delete' style={{height:'fit-content'}} 
                                    onClick={()=>{
                                        delete data_properties[p_n]
                                        //console.log('pn',p_n)
                                        //console.log('node',this.simulator.service_pattern._data.nodes)
                                        //console.log('ins_name',instance.name)
                                        for(let item in this.simulator.service_pattern._data.nodes){
                                            if(this.simulator.service_pattern._data.nodes[item].name ===instance.name){
                                                if(this.simulator.service_pattern._data.nodes[item].data_properties[p_n]){
                                                    delete this.simulator.service_pattern._data.nodes[item].data_properties[p_n]
                                                    //console.log('1111111')
                                                    break
                                                }
                                            }
                                        }
                                        this.setState({ instance })
                                        //console.log('instance',instance)
                                        //console.log('node',simulator.service_pattern._data.nodes)
                                    
                                    }}/>
                            </Form.Group> 
                            )
                        })
                        
                    }

                    <Form.Button  size='small' 
                        onClick={() => {
                            instance.data_properties[''] = {type:"value",text:"",isPattern:true}
                            this.setState({ instance })
                        
                        }}
                        style={{color:'black'}}
                        border='black'
                        >
                        <Icon name='add circle' />{tf.str('add Data Property')}
                    </Form.Button>
                    <Divider />
                    <Header as='h5' >
                        {tf2.str('relation')}
                        <Popover content={tf2.note('relation')} >
                            <Icon style={{float:'right'}} fitted name='question circle outline' />
                        </Popover>
                    </Header>
                    
                    {
                        instance.out_relations.map(elm => (
                        <Form.Group widths='equal' key={elm.id}>
                            <Form.Select
                                placeholder='Select types'
                                multiple
                                search
                                fluid
                                disabled={this.inherit_out_relations_id.indexOf(elm.id)>-1}
                                options={relation_options}
                                onClick={() => {
                                    const { all_relations } = workspace
                                    this.setState({
                                        relation_options: wrapConceptOptions(all_relations),
                                    })
                                }}
                                onChange={(e, { value }) => {
                                    elm.type = value
                                    this.setState({ instance })
                                }}
                                value={elm.type}
                            />
                            <Form.Select
                                placeholder='Select an object'
                                search
                                fluid
                                disabled={this.inherit_out_relations_id.indexOf(elm.id)>-1}
                                options={all_instance_options}
                                value={elm.target}
                                onClick={() => {
                                    this.setState({
                                        all_instance_options: 
                                            wrapInstanceOptions(instance.instance_base.all_instances),
                                            //...wrapInstanceOptions(instance.group.instances)
                                        
                                    })
                                }}
                                onChange={(e, { value }) => {
                                    if (elm.source ===instance.name) {
                                        elm.target = value
                                    } else {
                                        elm.source = value
                                    }
                                    this.setState({ instance })
                                }}
                            />
                            <Button color='red' icon='delete' style={{height:'fit-content'}}
                                onClick={()=>{
                                    instance.instance_base.deleteRelationById(elm.id)
                                    this.setState({})
                                }} />
                        </Form.Group>
                        ))
                    }

                    <Form.Button size='small'
                        onClick={() => {
                            let new_r = instance_base.createRelation()
                            new_r.source = instance.name
                            this.setState({ instance })
                        }}
                        style={{color:'black'}}
                        border='black'
                    >
                        <Icon name='add circle' />{tf.str('add Object Property')}
                    </Form.Button>
                </Form>
            </div>
        )
    }
}