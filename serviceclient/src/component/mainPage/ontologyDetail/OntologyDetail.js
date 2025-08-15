import React from "react";
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Accordion, Checkbox, Menu, Label ,Grid} from 'semantic-ui-react'
import { PageType } from "../../../manager/PageManage";
import META from "../../../data/nameConfig";
import OntologyGraph from "./OntologyGraph";
import OntologyLiGraph from "./OntologyLiGraph"
import { saveAs } from "file-saver";
import output from "../../../data/output";
import { Tree, Popover, Steps } from 'antd';
import { pageManage, focus_page } from "../../../manager/PageManage";
import { IconAdd, ListAdd } from "../../ui_component/Add";
import { autorun } from "mobx";
import COLOR from "../../../data/Color";
import { TextFactory, concept_base_dictionary } from "../../../data/dictionary"
import ConceptEdit from "../../mainPage/ConceptEdit";
import RelationEdit from "../../mainPage/RelationEdit";
import PropertyEdit from "../../mainPage/PropertyEdit";
const defaultMenu = { left: 0, top: 0, visible: false, remove: false, add: false }
export default class OntologyDetail extends React.Component {
    constructor(props) {
        super(props)
        const { localInfo } = this.props
        const { bean } = localInfo
        this.Liopen=false;
        this.name={};
        this.tip=0;
        this.num=[];
        this.page = this.props.page
        this.ontologyGraph = bean
        
        // new OntologyGraph()
        // this.ontologyGraph.init()
        // console.log(JSON.stringify(this.ontologyGraph.toJson()))

        this.page.localInfo.ontologyGraph = this.ontologyGraph
        // console.log(this.ontologyGraph)
        this.page.localInfo.width = this.page.type.width*5
        
        console.log('ontologylanguage',this.language,this.textFactory)
        this.state = {
            menu: defaultMenu,
            concept_tree: [this.ontologyGraph.concept_tree],
            relation_tree: [this.ontologyGraph.relation_tree],
            property_tree: [this.ontologyGraph.property_tree],
            

        }
        this.language = this.props.language
        //this.textFactory = new TextFactory(concept_base_dictionary,this.language)
        this.concept=false;
        this.relation=false;
        this.property=false;
        this.newPage=null;
    }
    componentWillMount (){
        this.collect();
    }
    componentDidMount() {
        this.rect = this.refs.main.getBoundingClientRect()
    }
    /*
    componentWillReceiveProps(nextProps){
        this.language = nextProps.language
        //console.log(nextProps)
       // console.log('cwrp',this.language)
    }*/
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.rect = this.refs.main.getBoundingClientRect()
    }

    collect(){
        this.num[0]=0;
        for(let k in this.ontologyGraph.concept_data){
            this.num[0]++;
        }
        this.num[1]=0;
        for(let k in this.ontologyGraph.relation_data){
            this.num[1]++;
        }
        this.num[2]=0;
        for(let k in this.ontologyGraph.property_data){
            this.num[2]++;
        }
    }

    changeConcept(name) {
        const path = this.page.path + '\\' + 'Concept Edit: ' + name
        const newPage = pageManage.openPage(path, PageType.conceptEdit, this.page.path)
        //console.log(newPage);
        newPage.localInfo.bean = this.ontologyGraph.concept_data[name]
        this.page.localInfo.currentConcept = name
        this.newPage=newPage;
        pageManage.refresh()
        this.setState({
            currentConcept: name
        })
    }
    changeRelation(name) {
        const path = this.page.path + '\\' + 'Relation Edit: ' + name
        const newPage = pageManage.openPage(path, PageType.relationEdit,this.page.path)
        newPage.localInfo.bean = this.ontologyGraph.relation_data[name]
        this.page.localInfo.currentRelation = name;
        this.newPage=newPage;
        pageManage.refresh()
        this.setState({
            currentRelation: name
        })
    }
    changeProperty(name) {
        const path = this.page.path + '\\' + 'Property Edit: ' + name
        const newPage = pageManage.openPage(path, PageType.propertyEdit,this.page.path)
        newPage.localInfo.bean = this.ontologyGraph.property_data[name]
        this.page.localInfo.currentProperty = name;
        this.newPage=newPage;
        pageManage.refresh()
        this.setState({
            currentProperty: name
        })
    }
    //添加数据，间数据导入到页面视图中进行绘制
    add(name, parent, type) {
        if (type === 'concept') {
            this.ontologyGraph.addConceptBean(name, parent)
            this.setState({
                concept_tree: [this.ontologyGraph.concept_tree],
                menu: defaultMenu,
            })
            this.tip=1;
            this.name=this.ontologyGraph.concept_data[name];
            this.name.key=name;
        }
        if (type === 'relation') {
            this.ontologyGraph.addRelationBean(name, parent)
            this.setState({
                relation_tree: [this.ontologyGraph.relation_tree],
                menu: defaultMenu,
            })
            this.tip=2;
            this.name=this.ontologyGraph.relation_data[name];
            this.name.key=name;
        }
        if (type === 'property') {
            this.ontologyGraph.addPropertyBean(name, parent)
            this.setState({
                property_tree: [this.ontologyGraph.property_tree],
                menu: defaultMenu,
            })
            this.tip=3;
            this.name=this.ontologyGraph.property_data[name];
            this.name.key=name;
            //console.log(this.name);
        }
    }
    remove(type, name) {
        if (type === 'concept') {
            this.ontologyGraph.removeConceptBean(name)
            this.setState({
                concept_tree: [this.ontologyGraph.concept_tree],
                menu: defaultMenu
            })
            this.tip=4;
        }
        if (type === 'relation') {
            this.ontologyGraph.removeRelationBean(name)
            this.setState({
                relation_tree: [this.ontologyGraph.relation_tree],
                menu: defaultMenu
            })
            this.tip=4;
        }
        if (type === 'property') {
            this.ontologyGraph.removePropertyBean(name)
            this.setState({
                property_tree: [this.ontologyGraph.property_tree],
                menu: defaultMenu
            })
            this.tip=4;
        }
    }
    openOntologyGraph() {
        this.Liopen=false;
        //alert("树函数")
        if (this.page.localInfo.graphOpen) {
            return;
        } else {
            this.page.localInfo.graphOpen = true
        }
        pageManage.refresh()
    }
    openOntologyLiGraph(){
        //console.log("点集力导向图")
        this.page.localInfo.graphOpen = false
        if (this.Liopen) {
            return;
        } else {
            this.Liopen=true;
        }
        pageManage.refresh()
    }

    import() {
        const data = output
        // console.log(data)
        this.ontologyGraph.loadData(data.concept_data, data.relation_data, data.property_data)
        this.page.localInfo.currentConcept = null
        this.page.localInfo.currentRelation = null
        this.page.localInfo.currentProperty = null
        pageManage.closePage(this.page.path + '\\' + 'Concept Edit')
        pageManage.closePage(this.page.path + '\\' + 'Relation Edit')
        pageManage.closePage(this.page.path + '\\' + 'Property Edit')
        pageManage.refresh()
        this.setState({
            currentConcept: null,
            currentRelation: null,
            currentProperty: null,
            concept_tree: [this.ontologyGraph.concept_tree],
            relation_tree: [this.ontologyGraph.relation_tree],
            property_tree: [this.ontologyGraph.property_tree]
        })
    }

    export() {
        const data = JSON.stringify(this.ontologyGraph.toJson())
        let blob = new Blob([data], {type: ''});
        saveAs(blob, "output.json");
    }
    render() {
        //生成的默认界面，该界面是由ontologyGraph对象生成的
        //let tf = this.textFactory
        let tf = new TextFactory(concept_base_dictionary,this.props.language)
        //console.log('ontolanguage',this.props.language)
        const { page } = this.props;
        const { menu, concept_tree, relation_tree, property_tree } = this.state;
        const {ontologyGraph} =this;
        const { graphOpen } = this.page.localInfo
        const width = page.type.width - 20
        const name=this.name;
        const tip=this.tip;
        this.editvisible=false;
        const colStyle = {
            gridTemplateColumns: "700" + "px auto",
            display: "grid",
            height:"100%",
        }
        let concept=this.concept;
        let relation=this.relation;
        let property=this.property;
        let mwidth;
        if(!graphOpen&&!this.Liopen){
            if(concept||relation||property){
                mwidth="100%";
            }else{
                mwidth="100%";
            }

        }else{
            mwidth="100%";
        }
        //输出每一个概念页面
        return <div divided ref='main' style={colStyle}>
            <div style={{width:"100%",paddingRight:"10px"}}>
                <Header as='h1'>
                 {ontologyGraph && <font color="black">{ontologyGraph.name}</font>}
                </Header>
                <Divider />

                <Header as='h2'><nobr><font color="black">{tf.str("concept")}</font><Label as='a' circular color="black" content={this.num[0]-1}/> 
                <Popover content={tf.note('concept')} >
                <Icon fitted name='question circle outline'  style={{float:"right"}}/>
                </Popover>
                </nobr>
                </Header>

                <div style={{
                    position: 'absolute',
                    // width: '200px',
                    // height: '50px',
                    left: menu.left,
                    top: menu.top,
                    display: menu.visible ? 'inline' : 'none',
                    zIndex: 100
                }}>
                    <Menu inverted vertical
                    // onMouseOut={() => this.setState({ menu: defaultMenu })}
                    >
                        {
                            menu.remove &&
                            <Menu.Item
                                name='删除'
                                onClick={menu.remove}
                            />
                        }
                        {
                            menu.add &&
                            <ListAdd add={menu.add}/>
                        }
                        <Button icon='close' size='tiny' fluid secondary onClick={() => {
                            this.setState({ menu: defaultMenu })
                        }} />
                    </Menu>
                </div>
                <Tree
                    blockNode
                    defaultExpandAll
                    treeData={concept_tree}
                    height={250}
                    style={{
                        //background:"#2F4050",
                        color:"black",
                        background: '#e0dfe8',
                    }}
                    onSelect={(selectedKeys, info) => {
                        // console.log(info);
                        const { node } = info
                        this.state.tip=0;
                        // console.log('selected', selectedKeys, info, node.title);
                        this.concept=true;
                        this.relation=false;
                        this.property=false;
                        this.Liopen=false;
                        this.page.localInfo.graphOpen=false;
                        this.changeConcept(node.name)
                    }}
                    onRightClick={({ event, node }) => {
                        let menu = {
                            left: event.clientX + 30 - this.rect.x,
                            top: event.clientY - this.rect.y,
                            visible: true,
                            remove: () => this.remove('concept', node.name),
                            add: (name) => this.add(name, node.name, 'concept')
                        }
                        this.setState({ menu: menu })
                        this.state.tip=0;
                    }}
                />
                <Header as='h2'><nobr><font color="black">{tf.str("relation")}</font><Label as='a' circular color="black" content={this.num[1]-1}/>
                <Popover content={tf.note('relation')} >
                <Icon fitted name='question circle outline'  style={{float:"right"}}/>
                </Popover>
                </nobr></Header>
                <Tree
                    blockNode
                    defaultExpandAll
                    treeData={relation_tree}
                    height={250}
                    style={{
                        //background:"#333333",
                        color:"black",
                        background: '#e0dfe8'
                        
                    }}
                    onSelect={(selectedKeys, info) => {
                        this.state.tip=0;
                        const { node } = info
                        this.relation=true;
                        this.concept=false;
                        this.property=false;
                        this.Liopen=false;
                        this.page.localInfo.graphOpen=false;
                        this.changeRelation(node.name)
                    }}
                    onRightClick={({ event, node }) => {
                        let menu = {
                            left: event.clientX + 30 - this.rect.x,
                            top: event.clientY - this.rect.y,
                            visible: true,
                            remove: () => this.remove('relation', node.name),
                            add: (name) => this.add(name, node.name, 'relation')
                        }
                        this.setState({ menu: menu })
                        this.state.tip=0;
                    }}
                />

                <Header as='h2'><nobr><font color="black">{tf.str("property")}</font> <Label as='a' circular color="black" content={this.num[2]-1}/>
                <Popover content={tf.note('property')} >
                <Icon fitted name='question circle outline'  style={{float:"right"}}/>
                </Popover>
                </nobr></Header>

                <Tree
                    blockNode
                    defaultExpandAll
                    treeData={property_tree}
                    height={250}
                    style={{
                        //background:"#333333",
                        color:"black",
                        background: '#e0dfe8'
                    }}
                    onSelect={(selectedKeys, info) => {
                        const { node } = info
                        this.state.tip=0;
                        this.property=true;
                        this.concept=false;
                        this.relation=false;
                        this.Liopen=false;
                        this.page.localInfo.graphOpen=false;
                        this.changeProperty(node.name)
                    }}
                    onRightClick={({ event, node }) => {
                        let menu = {
                            left: event.clientX + 30 - this.rect.x,
                            top: event.clientY - this.rect.y,
                            visible: true,
                            remove: () => this.remove('property', node.name),
                            add: (name) => this.add(name, node.name, 'property')
                        }
                        this.setState({ menu: menu })
                        this.state.tip=0;
                    }}
                />
            </div>
            <div style={{width:mwidth,height:"100%",borderLeft:"1px solid black",paddingLeft:"5px",paddingRight:"3px", }}>
                <Menu inverted style={{background:'#2f4050',margin:0,border:0,padding:0,borderRadius:0}} >
                    <Menu.Item
                        name='树状图'
                        onClick={()=>this.openOntologyGraph()}
                    />
                    <Menu.Item
                        name='力导向图'
                        onClick={()=>this.openOntologyLiGraph()}
                    />
                </Menu>
            {(this.Liopen||graphOpen)&& <Segment basic vertical 
                                            className="component-container"
                                            style={{ width: '100%',
                                            height: '100%',
                                            overflow: 'auto',
                                            background:"#506273",//没有改
                                            }}>

                {
                    this.Liopen&&<OntologyLiGraph ontologyGraph={ontologyGraph} tip={this.tip} /> 
                }
                {
                    graphOpen && <OntologyGraph ontologyGraph={ontologyGraph} name={name} tip={this.tip} /> 
                }
            </Segment>
            }

            { !(this.Liopen||graphOpen)&& <Segment basic 
                                            vertical
                                            className="component-container"
                                            style={{ width: '100%',
                                            height: '100%',
                                            overflow: 'auto',
                                            background:"#e0dfe8",
                                            }}>
            {
                concept&&<ConceptEdit bean={this.newPage.localInfo.bean} localInfo={this.newPage.localInfo}  ref='detail'/>
            }
            {
                relation&&<RelationEdit bean={this.newPage.localInfo.bean} localInfo={this.newPage.localInfo} ref='detail'/>
            }
            {
                property&&<PropertyEdit bean={this.newPage.localInfo.bean} localInfo={this.newPage.localInfo} ref='detail'/>
            }
            </Segment>}
            </div>
        </div>
    }
}
