import React from "react";
import { Form, Button, Divider, Icon, Header,} from "semantic-ui-react";
import TextEditor from "./TextEditor";
import { select } from "d3";
import {TextFactory,simulate_dictionary,concept_base_dictionary} from "../../../../data/dictionary"
import '../simulateConfig.css'

const wrapInstanceOptions = elm => elm.map(elm => ({
    key: elm.name,
    text: elm.name,
    value: elm.name,
    obj: elm,
})).filter(elm => elm.key && elm.key !== '')

const wrapConceptOptions = elm => Object.values(elm).map(elm => ({
    key: elm.id_name,
    text: elm.id_name,
    value: elm.id_name,
    obj: elm,
}))

const wrapModelOptions = elm => elm.map(elm => ({
    key: elm.name,
    text: elm.name,
    value: elm.name,
    obj: elm,
})).filter(elm => elm.key && elm.key !== '')

const flatten = arr => { //扁平化数据
    var res = []; 
    for(var i=0;i<arr.length;i++){
      if(Array.isArray(arr[i])){
        res = res.concat(flatten(arr[i]));
      }else{
        res.push(arr[i]);
      } 
    } 
    return res; 
};

export default class InstanceEdit extends React.Component{
    constructor(props) {
        super(props)
        this.props.share.instanceEdit=this
        this.bean = this.props.bean
        this.instance_base = this.bean.instance_base //实例
        this.pattern_instance_base = this.bean.pattern_instance_base
        this.instanceTreeLeft = this.props.share.instanceTreeLeft
        this.workspace = this.bean.instance_base.workspace
        this.textFactory = new TextFactory(simulate_dictionary)
        this.textFactory2 = new TextFactory(concept_base_dictionary) 

        let all_instance_options = wrapInstanceOptions(this.instance_base.all_instances)
        let all_model_options = wrapModelOptions(this.pattern_instance_base.instances)
        //console.log(all_instance_options)
        
        this.state = {
            //inheritDataPropertiesNum:0, //继承自模式要素的data_pro数量，用于锁定data_pro
            all_instance_options:all_instance_options, 
            all_model_options:all_model_options,
            whichType:'root',
            selected:this.instance_base,
            path:["root"],
            property_options: wrapConceptOptions(this.workspace.all_properties),
            concept_options: wrapConceptOptions(this.workspace.all_concepts),
            relation_options: wrapConceptOptions(this.workspace.all_relations),
        }

    }

    exist_relations_objects(){
        let res = []    
        let selected = this.state.selected 
        while(selected.parent != this.instance_base){
            selected = selected.parent
            res.push.apply(res,selected.instances)
        }
        res.push.apply(res,this.instance_base.instances)
        //console.log(res)
        return res
    }

    render(){
        const {whichType, selected, path} = this.state
        const tf = this.textFactory
        if(whichType === 'instance'){
            const { data_properties, type } = selected
            const { all_instance_options, property_options, concept_options, relation_options,all_model_options} = this.state
            const { workspace,simulator } = selected.instance_base
            const {node2binding_relations} = simulator
            const tf2 = this.textFactory2
            return(
                <div style={{padding:10}} className='customDark2'>
                    <Form  >
                        <Form.Group> {//最上面的路径字符串
                        }
                        <Header >{path.join('->')}</Header>
                        </Form.Group>
    
                        <Divider />
    
                        <Form.Group widths='equal'>{//name编辑
                        }
                            <Form.Input
                                label={tf.str('Instance Name')}
                                fluid
                                value={selected.name}
                                onChange={(e, { value }) => {
                                    node2binding_relations[value] = node2binding_relations[selected.name]
                                    delete node2binding_relations[selected.name]
                                    selected.name = value
                                    path.splice(path.length-1,1,selected.name)
                                    this.setState({
                                        path,
                                        selected,
                                        //pathString:this.joinPath(path)
                                    })
                                    this.props.share.instanceTreeLeft.setState({
                                        treeData:this.instance_base.toTreeJson(),
                                    })
                                }}
                            /> 
                            <Form.Select
                                label={tf.str('Type')}
                                options={concept_options}
                                value={type}
                                multiple
                                search
                                onChange={(e, { value }) => {
                                    selected.type = value
                                    //console.log(value)
                                    this.setState({ selected })
                                }}
                                fluid
                                onClick={() => {
                                    const { all_concepts } = workspace
                                    this.setState({
                                        concept_options: wrapConceptOptions(all_concepts),
                                    })
                                }}
                            />
                        </Form.Group>
    
                        <Divider />
                        
                        <Form.Select
                            search
                            fluid
                            multiple
                            label={tf.str('Bind To')}
                            options={all_model_options}
                            //placeholder='Bind to'
                            value={node2binding_relations[selected.name] || []}
                            onChange={(e, {value})=> {
                                node2binding_relations[selected.name] = value
                                selected.bindTo = node2binding_relations[selected.name]
                                //console.log(value)
                                value.forEach(elm => {//继承model的data_pro
                                    //console.log("name:"+elm.key)
                                    let i = simulator.pattern_instance_base.findInstanceByName(elm)
                                    let i_copy = JSON.parse(JSON.stringify(i.data_properties))
                                    //深拷贝data_pro,因为它是一个嵌套的对象，直接assign会使instance和model的data_pro重合
                                    Object.assign(data_properties,i_copy)
                                })
                                
                                this.setState({
                                    selected,
                                })
                            }}
                            // onClick={() => {
                            //     const { instance_base } = simulator
                            //     const { instances } = instance_base
                            //     this.setState({ all_model_options: wrapModelOptions(instances) })
                            // }}
                        />
    
                        <Divider />
    
                        <Header as='h5' >{tf2.str('property')}</Header>      
                    {     
                        Object.keys(data_properties).map(p_n=>{
                            return(
                            <Form.Group widths='equal' >
                                <Form.Select search fluid 
                                    //placeholder='Select a type'
                                    options={property_options}
                                    value={p_n}
                                    disabled = {data_properties[p_n].isPattern}
                                    onChange={(e, { value }) => {
                                        data_properties[value] = data_properties[p_n]
                                        delete data_properties[p_n]
                                        this.setState({ selected })
                                    }}
                                    onClick={() => {
                                        const { all_properties } = workspace
                                        this.setState({
                                            property_options: wrapConceptOptions(all_properties),
                                        })
                                    }}
                                />
                                <Form.Input fluid 
                                    value={data_properties[p_n].text}
                                    onChange={(e, { value }) => {
                                        data_properties[p_n].text = value
                                        this.setState({ selected })
                                    }} 
                                />
                                <TextEditor data={data_properties[p_n]} update={()=>this.setState({selected})}/>
                                <Button color='red' icon='delete' style={{height:'fit-content'}} 
                                    onClick={()=>{
                                        if(!data_properties[p_n].isPattern){
                                            delete data_properties[p_n]
                                            this.setState({ selected })
                                        }
                                    }}/>
                            </Form.Group> 
                            )
                        })
                        // TODO 添加按钮动作，各种按钮动作
                    }

                    <Form.Button basic size='small' fluid 
                        onClick={() => {
                            selected.data_properties[''] = {type:"value",text:"",isPattern:false}
                            this.setState({ selected })
                            // TODO 阻止选择重复类型的property
                        }}>
                        <Icon name='add circle' />{tf.str('add Data Property')}
                    </Form.Button>

                    <Divider />

                    <Header as='h5' >{tf2.str('relation')}</Header>
                    {   
                        selected.out_relations.map(elm => (  
                        <Form.Group widths='equal' key={elm.id}>
                            <Form.Select
                                placeholder='Select types'
                                multiple
                                search
                                fluid
                                options={relation_options}
                                onClick={() => {
                                    const { all_relations } = workspace
                                    this.setState({
                                        relation_options: wrapConceptOptions(all_relations),
                                    })
                                }}
                                onChange={(e, { value }) => {
                                    elm.type = value
                                    this.setState({ selected })
                                }}
                                value={elm.type}
                            />
                            <Form.Select
                                placeholder='Select an object'
                                search
                                fluid
                                /*这里可选的object有所限制，只能有一对多和一对一关系
                                只能选择所有直系父group中的instance*/
                                options={all_instance_options}
                                onClick={() => {
                                    //console.log(selected.out_relations)
                                    this.setState({
                                        all_instance_options: wrapInstanceOptions(this.exist_relations_objects())
                                    })
                                }}
                                onChange={(e, { value }) => {
                                    //console.log(':')
                                    elm.target = value
                                    //console.log(all_instance_options)
                                    //console.log(selected.out_relations)
                                    this.setState({ selected })
                                }}
                                value={elm.target}
                            />
                            <Button color='red' icon='delete' style={{height:'fit-content'}}
                                onClick={()=>{
                                    selected.instance_base.deleteRelationById(elm.id)
                                    this.setState({})
                                }} />
                        </Form.Group>
                        ))
                    }

                    <Form.Button basic size='small' fluid 
                        onClick={() => {
                            let new_r = selected.instance_base.createRelation()
                            new_r.source = selected.name
                            this.setState({ selected })
                        }}>
                        <Icon name='add circle' />{tf.str('add Object Property')}
                    </Form.Button>

                    </Form>
                </div>
            )
        }else if(whichType === 'group'){
            return(
                <div style={{padding:10}}>
                    <Form >
                        <Form.Group> {//最上面的路径字符串
                        }
                        <Header >{path.join('->')}</Header>
                        </Form.Group>
    
                        <Divider />
                        {/**name 编辑 */}
                        <Form.Input
                            label={tf.str('Group Name')}
                            fluid
                            value={selected.name}
                            onChange={(e, { value }) => {
                                selected.name = value
                                path.splice(path.length-1,1,selected.name)
                                this.setState({
                                    path,
                                    selected,
                                })
                                this.props.share.instanceTreeLeft.setState({
                                    treeData:this.instance_base.toTreeJson(),
                                })
                            }}
                        />

                        <Divider />
                        {/**name 编辑 */}
                        <Form.Input
                                label={tf.str('Number')}
                                fluid
                                value={selected.num}
                                // onBlur = {(e, {value})=>{
                                //     let i = parseInt(value)
                                //     selected.num = isNaN(i)?1:i
                                //     this.setState({
                                //         selected,
                                //     })
                                // }}
                                onChange={(e, { value }) => {
                                    selected.num = parseInt(value)?parseInt(value):1
                                    // if(selected.num ===NaN){
                                    //     selected.num = 1
                                    // }
                                    this.setState({
                                        selected,
                                    })
                                }}
                            />
     
                        
                    </Form>
                </div>
            )
        }
        return null//实际上不会触发
    }
}
