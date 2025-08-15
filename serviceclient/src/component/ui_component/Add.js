import React from "react";
import { Modal, Button, Icon, Input, Menu, Label ,Checkbox} from 'semantic-ui-react'
import 'js-yaml'
import {TextFactory,simulate_dictionary} from "../../data/dictionary"
//import { default_workspace } from "../../data/workspaceData";
import { Tooltip } from "antd";


export default class Add extends React.Component {
    constructor(props) {
        super(props)
        console.log('add',props)
        this.state = {
            display: false,
            name: null,
            files: null,
            data: null,
            fathertype:'',
            nameError:false,
            workspace_data:props.workspace,
        }
        console.log('!!!',this.state.workspace_data)
        this.textFactory=new TextFactory(simulate_dictionary)
    }

    componentWillReceiveProps(nextProps){
        console.log('555',nextProps)
        this.setState({workspace_data:nextProps.workspace})
      }

    yes() {
        const {name} = this.state
        if (name !== null && name !== '') {
            this.setState({display: false})
            this.props.add(name)
        }
    }
    trigger() {
        return <Button secondary size='tiny' onClick={() => this.setState({display: true})}>
            {this.textFactory.str('Add')}
        </Button>
    }
    render() {
        const {display} = this.state
        return <Modal
            trigger={this.trigger()}
            open={display}
        >
            <Modal.Header>添加</Modal.Header>
            <Modal.Content>
            <Tooltip visible={this.state.nameError?true:false} 
                    placement="right" title="模式名冲突！"
                    color="red"
           >
                <Input label='名称： ' onChange={(e, d) => 
                    {
                        this.setState({name: d.value})
                        console.log(this.state.fathertype)
                        if(this.state.fathertype=='原子模式库'){
                            const service_pattern = this.state.workspace_data.service_pattern
                            var flag = 0
                            Object.keys(service_pattern).map((elm)=>{
                                if(d.value === elm){
                                //alert('模式名冲突！请重新填写模式名')
                                this.setState({nameError:true})
                                flag = 1
                                }
                            })
                            const fusion_pattern = this.state.workspace_data.fusion_pattern
                            Object.keys(fusion_pattern).map((elm)=>{
                                if(d.value === elm){
                                //alert('模式名冲突！请重新填写模式名')
                                this.setState({nameError:true})
                                flag = 1
                                }
                            })
                            if(flag ===0){
                                this.setState({nameError:false})
                            }
                        }
                }}/>
                </Tooltip>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red'
                        onClick={() => this.setState({display: false})}
                >
                    <Icon name='remove' /> 取消
                </Button>
                <Button color='green' onClick={() => this.yes()}>
                    <Icon name='checkmark' /> 确认
                </Button>
            </Modal.Actions>
        </Modal>
    }
  

    
}

class IconAdd extends Add{
    trigger() {
        return <Icon link name='add'
                     onClick={() => this.setState({display: true})}/>
    }
}
class ListAdd extends Add{
    trigger() {
        return  <Menu.Item
        name='添加'
        onClick={() => this.setState({display: true,fathertype:'原子模式库'})}/>
    }
}



//领域概念库中调用的添加组件
class HomeAdd extends Add{
    constructor(props) {
        super(props)
        this.state = {
            display: false,
            name: null,
            files: null,
            type:null,
            //导入概念的三个不同的数据
            AddedConcept_data:{},
            AddedRelation_data:{},
            AddedProperty_data:{},  
            AddedOwl_data:{},
        }
    }
    trigger() {
        return  <Menu.Item
        name='添加概念库'
        onClick={() => this.setState({display: true})}/>
    }
    render() {
        const {display} = this.state
        return <Modal
            trigger={this.trigger()}
            open={display}
        >
            <Modal.Header>添加概念库</Modal.Header>
            <Modal.Content>
                <Input label='名称: ' onChange={(e,d) => this.setState({name: d.value})}/>
                {/*上传文件模块*/}
                <br/><br/> 
                <Label color='green' >请选择导入文件的格式</Label>
                <br/><br/> 
                <Checkbox label="owl" checked={this.state.type === 'owl'} onClick={(e)=>this.setState({type:"owl"})}/>
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <Checkbox label="yml" checked={this.state.type === 'yml'} onClick={(e)=>this.setState({type:"yml"})}/>
                <br></br>
                <br></br>
                <Input 
                id={this.state.type}
                icon='file' 
                iconPosition='left'  
                type='file'  
                placeholder='Concept'
                onChange={this.Upload_data}/>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red'
                        onClick={() => this.setState({display: false})}
                >
                    <Icon name='remove' /> 取消
                </Button>
                <Button color='green' onClick={() => this.yes()}>
                    <Icon name='checkmark' /> 确认
                </Button>
            </Modal.Actions>
        </Modal>
    }
    //确定导入数据，此时数据被传到原始的Onright事件的位置
    yes() {
        const {name} = this.state
        const {AddedConcept_data}=this.state;
        const {AddedRelation_data}=this.state;
        const {AddedProperty_data}=this.state;
        const {AddedOwl_data}=this.state;
        if (name !== null && name !== '') {
            this.setState({display: false})
            let data={};
            data.name=name;
            data.AddedConcept_data=AddedConcept_data;
            data.AddedRelation_data=AddedRelation_data;
            data.AddedProperty_data=AddedProperty_data;
            data.AddedOwl_data=AddedOwl_data;
            this.props.add(data);
        }
    }
    Upload_data=event=>{
        const readedfile=event.target.files[0];
        let reader=new FileReader();
        reader.readAsText(readedfile, "UTF-8");
        if(this.state.type==="owl"){
            reader.onload=(evt)=>{
            let fileContent=reader.result;
            this.Upload_owl(fileContent)}
            this.state.type="";
        }else if(this.state.type==="yml"){
            //yml数据处理
            reader.onload=(evt)=>{
            let fileContent=reader.result;
            let yaml =require('js-yaml');
            var doc =yaml.safeLoad(fileContent);
            let count=0
            for(let k in doc){
                    if(count===0)this.Upload_Concept("Thing",doc[k]);
                    if(count===1)this.Upload_Relation("topObjectProperty",doc[k]);
                    if(count===2)this.Upload_Property("topDataProperty",doc[k]);
                count++;
            }
            }
            this.state.type="";
        }else{
            alert(" 输入文件格式错误，请重新输入")
        }
    }
    //上传concept后的处理函数
    Upload_Concept=(key,doc)=>{
        //迭代设置子数组的基本信息以及父节点
        const search_ConceptElement=(parent,list)=>{
            for(let k in list){ 
                if(k>"50"||k<"0"){
                    this.state.AddedConcept_data[k]= {
                        dscp: k,
                        Description: {
                            'subClassOf': [parent]
                        }}  
                    search_ConceptElement(k,list[k])
                }  
                else
                search_ConceptElement(parent,list[k])
            }
            return;
        }
    //数据解析
    //将JSON数据中的concept元素解析成词条，并设置其父子关系，用于后续生成树
    //通过search_ConceptElement函数循环设置JSON数据中每个子元素数组的基本信息以及父亲节点
    this.state.AddedConcept_data["Thing"]={
        dscp: key,
        Description: {
            'subClassOf': []
        }}  
    for(let k in doc){
        search_ConceptElement("Thing",doc[k])
    }
    let data=this.state.AddedConcept_data;
    for (let n in data) {
        data[n].class_name = n
    }
    this.setState({AddedConcept_data:data})
    //console.log(this.state.AddedConcept_data)
    };
    search_RelationElement=(parent,list)=>{
        for(let k in list){ 
            if(k>"50"||k<"0"){
                this.state.AddedRelation_data[k]= {
                    dscp: k,
                    Description: {
                        'subPropertyOf': [parent]
                    },
                    class_name:k,
                }  
                this.search_RelationElement(k,list[k])
            }  
            else
            this.search_RelationElement(parent,list[k])
        }
        return;
    }
    Upload_Relation=(key,doc)=>{
        //初始化根节点数据
        let parent="topObjectProperty";
        this.state.AddedRelation_data[parent]={
            dscp: key,
            Description: {
                'subPropertyOf': [],
            },
            class_name:parent
        }
        //数据解析
        //将JSON数据中的concept元素解析成词条，并设置其父子关系，用于后续生成树
        //通过search_ConceptElement函数循环设置JSON数据中每个子元素数组的基本信息以及父亲节点
        for(let k in doc){
            this.search_RelationElement(parent,doc[k])
        }
    };

    search_PropertyElement(parent,list){
        for(let k in list){ 
            if(k>"50"||k<"0"){
                this.state.AddedProperty_data[k]= {
                    dscp: k,
                    Characteristics: {
                        unique: true,
                        not_null: true,  //必须的
                    },
                    Description: {
                        range: [],   //类型
                        subPropertyOf: [parent],
                    },
                    class_name:k
                }  
                this.search_PropertyElement(k,list[k])
            }  
            else
            this.search_PropertyElement(parent,list[k])
        }
        return;
    }

    Upload_Property=(key,doc)=>{
    //初始化根节点数据
    let parent="topDataProperty";
    this.state.AddedProperty_data[parent]= {
        dscp: key,
        Characteristics: {
            unique: true,
            not_null: true,  //必须的
        },
        Description: {
            range: [],   //类型
            subPropertyOf: [],
        },
        class_name:parent,
    }  
    //数据解析
    //将JSON数据中的property元素解析成词条，并设置其父子关系，用于后续生成树
    //通过search_PropertyElement函数循环设置JSON数据中每个子元素数组的基本信息以及父亲节点
    for(let k in doc){
        this.search_PropertyElement(parent,doc[k])
    }
    }   
    Upload_owl=(Owl_data)=>{
        //读取文件，这里的event是获取组件的值
        console.log("componentDidMount---->");
        //后端提供的处理文件接口是URL
        const url = 'http://183.129.253.170:6051/owl';
        console.log("loading data..."); 
        //fetch方法传递读入的txt文件给后端处理
        fetch(url, {
            method: 'POST',
            body: Owl_data,
        }).then(response => response.json()
        ).then(data => {
            for(let k in data){
                for(let n in data[k]){
                    data[k][n].class_name=n;
                }
            }
            this.state.AddedOwl_data=data;
        });
    }
}
export {
    IconAdd,
    ListAdd,
    HomeAdd,

}
