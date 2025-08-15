import React from "react";
import 'semantic-ui-css/semantic.min.css';
import {Button, Segment, Menu, Icon, Header, Dropdown, Item, Card, List, Sidebar, Label,Modal} from 'semantic-ui-react';
import './HomePage.css';
import { pageManage, PageType,focus_page } from "../manager/PageManage";
import MainPage from "./MainPage";
import COLOR from "../data/Color";
import { notification, Tree ,Divider,Slider} from 'antd';
import { CreditCardOutlined, DownOutlined } from '@ant-design/icons';
import { default_workspace } from "../data/workspaceData";
import {HomeAdd,ListAdd} from "./ui_component/Add";
import {WorkspaceAdd} from "./ui_component/AddWorkspace"
import {WorkspaceDelete} from "./ui_component/DeleteWorkspace"
import { OntologyGraph } from "../data/Ontology/ontology";
import TopMenu from "./ui_component/TopMenu";
import PatternData from "../data/patternData";
import AddSelect from "./ui_component/AddSelect";
import Simulator from "../data/simulator";
import ConsoleInfo from "./mainPage/ConsoleInfo";
import { BPMN_concepts, BPMN_properties, BPMN_relations }from "../data/Ontology/bpmnOntology";
import default_rel_bean from "../data/Ontology/default_relation_bean_data";
import { default_property_bean }from "../data/Ontology/default_property_bean_data";
import default_concept_bean from "../data/Ontology/default_concept_bean_data";
import AddMerge from "./ui_component/AddMerge";
import { consoleManage } from "../manager/consoleManage";
import axios from 'axios'
import ModalLogin from './Login'
import ModalHelp from './Help'
import ConceptEdit from "./mainPage/ConceptEdit";
import RelationEdit from "./mainPage/RelationEdit";
import PropertyEdit from "./mainPage/PropertyEdit";
import WorkspaceData from "../data/workspaceData"
import net_work from "../manager/netWork"
import background from "../data/background.png"

const defaultMenu = { left: 0, top: 0, visible: false, remove: false, 
    add: false, close: false, addSelect: false 
    ,addMerge:false,editEst:false,addLast:false};


export default class HomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //页面链表
            pageList: [],
            //默认菜单
            menu: defaultMenu,
            activePage : undefined,
            //结构树
            structure_tree: [],//honmepage中的Struct_tree
            consoleVisible: false,
            language:'ch',
            workspaceList:[],
            workspaceName:'阿里巴巴',
            display_tree: false,
            login:false,
            
        }
        this.editpage=[];
        this.workspace_data = '';
        this.allPattern = [];
        this.ontologies_final_pattern = [];
        //this.defaultExpandedKeys = ['模式库'];
        
        //this.workspaceName='飞猪';
    }

    componentDidMount() {
        const _this = this
        this.workspace_data = new WorkspaceData(this.state.workspaceName)
        console.log('!!!login',this.state.login)
        if(this.state.login){
            this.workspace_data.loadByNetwork()
            .then(()=>{
                pageManage.refresh = () => this.refresh()
                this.setState({
                    structure_tree: this.workspace_data.structure_tree,
                    display_tree: true,
                })
            })
            let workspaceList = []
            return net_work.get('getWorkspaceList', { })
                .then(data => {
                    //console.log('getworklist',data)
                    data.map((elm)=>{
                        let workspace={
                            key:elm,
                            value:elm,
                            text:elm,
                        }
                        workspaceList.push(workspace)
                    })
                    //console.log('wl',workspaceList)
                    _this.setState({workspaceList:workspaceList})
                })
        }
 
    }

    

    componentWillUnmount(){
        const _this = this
        this.workspace_data = new WorkspaceData(this.state.workspaceName)
        this.workspace_data.loadByNetwork()
        .then(()=>{
            pageManage.refresh = () => this.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
            })
        })
        let workspaceList = []
        return net_work.get('getWorkspaceList', { })
            .then(data => {
                //console.log('getworklist',data)
                data.map((elm)=>{
                    let workspace={
                        key:elm,
                        value:elm,
                        text:elm,
                    }
                    workspaceList.push(workspace)
                })
                //console.log('wl',workspaceList)
                _this.setState({workspaceList:workspaceList})
            })
    }

    //获取创建的workspace的名字
    getChildrenMsg = (result, msg,list) => {
        console.log('result',msg)
        this.setState({workspaceName:msg})
        this.workspace_data = new WorkspaceData(this.state.workspaceName)
        this.workspace_data.loadByNetwork()
        .then(()=>{
            pageManage.refresh = () => this.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
            })
        })
        const _this = this
        let workspaceList = []
        net_work.get('getWorkspaceList', { })
            .then(data => {
                data.map((elm)=>{
                    let workspace={
                        key:elm,
                        value:elm,
                        text:elm,
                    }
                    workspaceList.push(workspace)
                })
                _this.setState({workspaceList:workspaceList})
        })
    }
    
    getLoginMsg = (reslut,msg)=>{
        console.log('login',msg);
        const _this = this
        if(msg){
            console.log('this')
            this.setState({login:true})
            this.workspace_data.loadByNetwork()
            .then(()=>{
                pageManage.refresh = () => this.refresh()
                _this.setState({
                    structure_tree: this.workspace_data.structure_tree,
                    display_tree: true,
                })
            })
            let workspaceList = []
            return net_work.get('getWorkspaceList', { })
                .then(data => {
                    //console.log('getworklist',data)
                    data.map((elm)=>{
                        let workspace={
                            key:elm,
                            value:elm,
                            text:elm,
                        }
                        workspaceList.push(workspace)
                    })
                    //console.log('wl',workspaceList)
                    _this.setState({workspaceList:workspaceList})
                })
        }
        else{
            this.setState({login:false})
        }
    }

    getDeleteWorkspaceList = (result,msg)=>{
        //console.log('delete',msg)
        this.setState({workspaceList:msg})
    }

    chooseWorkspace = (e,{value})=>{
        pageManage.closeAllPage()
        pageManage.refresh()
        this.setState({workspaceName:value})
        //console.log('workname',value)
        this.workspace_data = new WorkspaceData(value)
        this.workspace_data.loadByNetwork()
        .then(()=>{
            pageManage.refresh = () => this.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
            })
        })
        

    }

    //刷新界面
    refresh() {
       
        this.setState({
            structure_tree: this.workspace_data.structure_tree,
            //重置开始界面
            pageList: pageManage.page_list
        })
    }
    fusion_Last(key){
        var finalData = {
                final_key:key,
                workspace: this.workspace_data.toJson()
        }
        const _this = this
        axios.post('http://183.129.253.170:6051/fusion/final',finalData)
        .then(function (res) {
            

            
            if(res.data.message =="success"){

                _this.workspace_data.loadByNetwork()
                .then(() => {
                    _this.setState({
                    structure_tree: _this.workspace_data.structure_tree,
                    menu: defaultMenu
                    });
                    pageManage.refresh()
                })
                                // default_workspace.loadByNetwork()
                // console.log( _this.workspace_data.structure_tree)
               

                 

            }
          })
          .catch(function (error) {
            console.log(error);
          })


    }
    //添加一个新的概念，可以导入
    addLib(type, name, concept_data,relation_data,property_data,owl_data,pattern) {
        if (type === '领域概念库') {
            this.workspace_data.ontologies[name] = new OntologyGraph({ name: name })//name=概念时，这个字典对象对应的一个数据
            //如果没有数据导入则添加的是默认界面，否则添加导入数据生成的界面
            let sum=0;
            if(JSON.stringify(concept_data)!="{}")sum=sum+4;
            if(JSON.stringify(relation_data)!="{}")sum=sum+2;
            if(JSON.stringify(property_data)!="{}")sum=sum+1;
            if(JSON.stringify(owl_data)!="{}")sum=8;
            switch(sum){
                case 0:
                    this.workspace_data.ontologies[name].init();
                    break;
                case 1:
                    this.workspace_data.ontologies[name].loadData(default_concept_bean, default_rel_bean, property_data);
                    break;
                case 2:
                    this.workspace_data.ontologies[name].loadData(default_concept_bean, relation_data, default_property_bean);
                    break;
                case 3:
                    this.workspace_data.ontologies[name].loadData(default_concept_bean, relation_data, property_data);
                    break;
                case 4:
                    this.workspace_data.ontologies[name].loadData(concept_data, default_rel_bean, default_property_bean);
                    break;
                case 5:
                    this.workspace_data.ontologies[name].loadData(concept_data, default_rel_bean, property_data);
                    break;
                case 6:
                    this.workspace_data.ontologies[name].loadData(concept_data, relation_data, default_property_bean);
                    break;
                case 7:
                    this.workspace_data.ontologies[name].loadData(concept_data, relation_data, property_data);
                    break;
                case 8:
                    this.workspace_data.ontologies[name].loadData(owl_data.concept_data,owl_data.relation_data,owl_data.property_data);
                    break;
                default:
                    alert("错误");
            }
            this.setState({
                //结构树
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
        if (type === '原子模式库') {
            this.workspace_data.service_pattern[name] =  new PatternData({ name: name }, this.workspace_data)
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
        if (type === '仿真库') {
            const simulator = new Simulator({name: name}, this.workspace_data);
            simulator.service_pattern_binding(pattern);
            //simulator.initPatternInstanceBase()
            this.workspace_data.simulator[name] = simulator;
            //console.log('simulator',simulator)
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
       
        if(type === '融合模式库'){
            
            this.workspace_data.loadByNetwork()
            .then(() => {
                 //this.workspace_data = default_workspace
                this.setState({
                    structure_tree: this.workspace_data.structure_tree,
                    menu: defaultMenu
                })
                pageManage.refresh = () => this.refresh()
            })
        }
        if(type === '模式评估库'){
            //console.log('模式评估库')

            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
            
        }
    }

    removeLib(type, name) {//删除词条
        if (type === '领域概念库') {
            delete this.workspace_data.ontologies[name]
            pageManage.closePage('领域概念库' + '\\' + name)
            pageManage.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
        if (type === '原子模式库') {
            delete this.workspace_data.service_pattern[name]
            pageManage.closePage('原子模式库' + '\\' + name)
            pageManage.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
        if (type === '仿真') {
            const newName = name.split('仿真')[1]
            //console.log('newName',newName)
            delete this.workspace_data.simulator[newName]
            pageManage.closePage('仿真' + '\\' + newName)
            pageManage.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
        if(type === '模式评估'){
            //console.log('shanchu',name)
            delete this.workspace_data.assessedResults[name]
            //console.log(this.workspace_data.assessedResults)
            pageManage.closePage('模式评估' + '\\' + name)
            pageManage.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
        if(type === '融合模式'){
            //console.log(name)
            //console.log(this.workspace_data.fusion_pattern)
            delete this.workspace_data.fusion_pattern[name]
            //pageManage.closePage('仿真' + '\\' + name)
            pageManage.refresh()
            this.setState({
                structure_tree: this.workspace_data.structure_tree,
                menu: defaultMenu
            })
        }
    }

    consoleDisplay() {
        const {consoleVisible} = this.state
        this.setState({consoleVisible: !consoleVisible})
    }

    onWorkflowTreeSelect(selectedKeys, { node }){
        var path = '', new_page = undefined
        console.log('selectnode',node)
        switch(node.type){
            case '领域概念库':
                path = '领域概念库' + '\\' + node.key
                //console.log('path',path)
                //console.log('node',node)
                new_page = pageManage.openPage(path, PageType.ontologyDetail)
                new_page.localInfo.bean = this.workspace_data.ontologies[node.key]
                break
            case '概念管理':
                path = '原子模式库' + '\\' + node.key
                // console.log("**************path*********" + path)
                new_page = pageManage.openPage(path, PageType.editKeyPartComponet)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.modelname = node.key
                new_page.localInfo.bean = node.bean
                break
            case '模式绘制':
                path = '原子模式库' + '\\' + node.key
                new_page = pageManage.openPage(path, PageType.modelDetail)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
                break
            case '仿真配置':
                path = '仿真配置\\' + node.key
                new_page = pageManage.openPage(path, PageType.simulateConfig)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
                break
            case '仿真过程':
                path = '仿真结果\\'+ node.key
                new_page = pageManage.openPage(path, PageType.SimulateResult)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
                break
            case '仿真结果':
                path = '仿真结果\\'+ node.key
                new_page = pageManage.openPage(path, PageType.SimulateResult)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
                break
            case '模式评估':
                path ='模式评估\\' + node.key
                //console.log('模式评估',node.key)
                new_page = pageManage.openPage(path,PageType.estimateShow)
                new_page.localInfo.bean = node.bean
                new_page.assessedResults = node.bean.assessedResultData
                break
            case '推荐结果':
                if(!node.title)
                    break
                path = '融合模式库推荐\\'+node.title
                new_page = pageManage.openPage(path,PageType.mergeMidShow)
                //console.log(new_page)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
                break
            case '选定结果':
                if(!node.title)
                    break
                if(JSON.stringify(node.bean.final) =="{}")
                    break
                path = '融合模式库选定\\'+node.title
                new_page = pageManage.openPage(path,PageType.mergeMidShow)
                //console.log(new_page)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
            case '融合模式库':
                break
            case '评估配置':
                path = '评估配置\\' + node.key
                new_page = pageManage.openPage(path,PageType.configShow)
                new_page.localInfo.workspace_data = this.workspace_data
                new_page.localInfo.bean = node.bean
                //console.log('nodebean',node.bean)
                // console.log(new_page.localInfo.bean ===default_workspace.service_pattern['单级物流模式'])
                break
            default:
                break
        }
        pageManage.refresh()
        
    }

    

    render() { //渲染    
        let { pageList, menu, structure_tree, consoleVisible, activePage , language,display_tree } = this.state
        const mainPageList = pageList.filter(page => page.visible)//只保留可见页面
        const {workspace_data} = this
        //const {defaultExpandedKeys} = this
        //console.log('--------',defaultExpandedKeys)
        //console.log('default_work',workspace_data)
        //控制编辑界面的显隐,conceptedit
        //
        for(let k in pageList){
            switch(pageList[k].type){
                case PageType.conceptEdit:
                case PageType.relationEdit:
                case PageType.propertyEdit:
                    delete pageManage.pageList[pageList[k].path];
                    pageList.splice(k,1);
                    break;
                default:
            }
        }
        //console.log('pagelist',pageList);
        //console.log(pageManage.pageList)
        let width = 100
        pageList.forEach(page => {
            //console.log('page!!!!',page)
            width += page.localInfo.width ? page.localInfo.width : page.type.width//计算页面总宽度？
        })
        const title_style = { color: 'white', background: '#2F4050', padding: 8, margin: 0, marginBottom: 20 }//设置标题样式

        return (
            <div className='HomePage' style={{ background: '#e0dfe8' }}>
                {/* 整个侧边栏part */}
                <div className='Explorer' style={{ background: '#2F4050' }}>
                    {/* 侧边page navifator    点击会有显隐的变化 */}
                    {/* 侧边workspace */}
                    <div className='workspace-nav' >
                        <Header as='h3' style={title_style}>钱塘天枢服务模式分析与计算系统</Header>
                        {/* {workspace_data.name} */}
                        {display_tree&&<Tree
                            height={800}
                            className='workspace-tree'
                            defaultExpandedKeys={['模式库','领域概念库','仿真库']}
                            style={{ background: '#2F4050', color: 'white' }}
                            treeData={structure_tree}
                            onSelect= {this.onWorkflowTreeSelect.bind(this)}//获得点击属性                      
                            onRightClick={({ event, node }) => {
                                console.log("触发鼠标右键",node)
                                if (node.key !== '无') { 
                                    let allPattern = []
                                    let ontologies_final_pattern = []
                                    allPattern = Object.keys(this.workspace_data.service_pattern)
                                    ontologies_final_pattern = Object.keys(this.workspace_data.service_pattern)
                                    Object.keys(this.workspace_data.fusion_pattern).map((elm)=>{
                                        const subFusion = this.workspace_data.fusion_pattern[elm].intermediate
                                        const selectFusion = this.workspace_data.fusion_pattern[elm].final
                                        console.log('select',selectFusion)
                                        Object.keys(subFusion).map((item)=>{
                                            allPattern.push(item)
                                        })
                                        selectFusion && Object.keys(selectFusion).map((item)=>{
                                            allPattern.push(item)
                                            ontologies_final_pattern.push(item)
                                        })

                                    })
                                    //console.log('allpattern',allPattern)
                                    let menu = {
                                        left: event.clientX + 30,
                                        top: event.clientY,
                                        visible: (node.title === '模式库'||node.title === '评估结果'||node.title === '仿真配置'||node.title ==='无'||node.title === '概念管理'||node.title === '评估配置'||node.title === '模式绘制'||node.title==='推荐结果'||node.title==='选定结果')?false : true,
                                        // 修改---部分是不显示删除的---
                                        remove: (node.type === '领域概念库' || node.type === '原子模式库' || node.type === '仿真'||node.type === '模式评估'||node.type==='融合模式') ? () => this.removeLib(node.type, node.key) : false,
                                        //从add函数传过来的name属性
                                        homeadd: (node.key === "领域概念库" )
                                            ? (data) => this.addLib(node.key,data.name,data.AddedConcept_data,
                                                data.AddedRelation_data,data.AddedProperty_data,data.AddedOwl_data) : false,
                                        add:(node.key === "原子模式库")?(name) => this.addLib(node.key, name) : false,
                                        addSelect: node.key === '仿真库' ? {
                                            func: (name, pattern) => this.addLib(node.key, name, {}, {}, {}, {}, pattern),
                                            //options: Object.keys(this.workspace_data.service_pattern),
                                            options:allPattern,
                                            selectName: 'Pattern'
                                        }: false,

                                        addMerge:node.key === '融合模式库' ? {
                                            func: (name, pattern) => this.addLib(node.key, name, {}, {}, {}, {}, pattern),
                                            
                                            //options: Object.keys(this.workspace_data.service_pattern),
                                            options: ontologies_final_pattern,
                                            selectName: 'Pattern'}
                                            : false,
                                        addLast:node.type ==='推荐结果' ?() => this.fusion_Last(node.key) : false,
                                    }
                                    //console.log('menu',menu)
                                    //console.log('node',node)
                                    this.setState({ menu: menu })
                                }
                            }}
                        />}
                        <div style={{
                            position: 'absolute',
                            width: '130px',
                            height: '50px',
                            left: menu.left,
                            top: menu.top,
                            display: menu.visible ? 'inherit' : 'none',
                            zIndex: 30,
                            background: '#2F4050',
                        }}>
                            <Menu inverted vertical
                                // onMouseOut={()=> this.setState({ menu: defaultMenu })}
                            >
                                {
                                     menu.close &&
                                     <Menu.Item name='关闭' onClick={menu.close}/>
                                }
                                {
                                    menu.remove &&
                                    <Menu.Item name='删除' onClick={menu.remove}/>
                                }
                                {
                                    menu.add && <ListAdd add={menu.add} workspace={this.workspace_data}/>
                                }
                                {
                                    menu.homeadd && <HomeAdd add={menu.homeadd} workspace={this.workspace_data}/>
                                }
                                {
                                    menu.addSelect && <AddSelect
                                        workspace={this.workspace_data}
                                        selectName={menu.addSelect.selectName}
                                        add={menu.addSelect.func}
                                        options={menu.addSelect.options}/>
                                }
                                {/* option addmerge的拿的是 */}
                                {
                                    menu.addMerge &&  <AddMerge
                                        workspace={this.workspace_data}
                                        selectName={menu.addMerge.mergeName}
                                        add={menu.addMerge.func}
                                        options={menu.addMerge.options}
                                        participantOptions={[1,2,3,4]}
                                        />
                                }
                                {/* 添加到最终结果 */}
                                {
                                    menu.addLast &&
                                    <Menu.Item name='添加到选定结果' onClick={menu.addLast}/>
                                }
                                <Button icon='close' size='tiny' fluid secondary onClick={() => {
                                    this.setState({ menu: defaultMenu })
                                }} />
                            </Menu>
                        </div>
                    </div>
                </div>
                {/*main   包含顶部的TopMenu 、下方主画布 Sidebar.Pushable   */}
                <div className='main-part' >
                    <div className='Page-Navigator' style={{height: '50px',width:'100%',}}>
                    <Menu tabular style={{height: '50px',width:'100%',}}>
                    <Menu.Menu  tabular  style={{width:'100%',overflowY:'auto'}}>
                        { 
                            pageList.map(elm => {
                                return (
                                <Menu.Item
                                    active={activePage ===elm}
                                    style={{
                                        color: 'white',
                                        background: elm.visible? '#3B7BB1': '#2F4050',
                                        //border: 'nonoe',
                                        borderRightColor:'#808080',
                                        borderWidth:'1px'
                                    }}
                                    key = {elm.text}
                                   
                                    onClick={()=>{
                                        /*
                                       pageList.unshift(elm)
                                       let pos = pageList.indexOf(elm,1)
                                       pageList.splice(pos,1)
                                       //console.log('!!!',this.pageList)*/
                                       let curPage = elm
                                       for(let key in pageList){
                                          const p = pageList[key]
                                          if(p!=curPage){
                                              p.changeVisible(false)
                                          }
                                          else{
                                              p.changeVisible(true)
                                              //console.log('p:',p)
                                          }
                                       }
                                       this.setState({pageList})
                                    }}
                                >
                                    {elm.text}
                                    <Label
                                    color={'#3B7BB1'}//不知道是哪里
                                    style={{
                                        cursor: 'pointer',
                                        zIndex:'999'
                                    }}
                                    onClick={(e)=>{
                                        // console.log(elm)
                                        pageManage.closePage(elm.path)
                                        pageManage.refresh()
                                        e.stopPropagation()
                                    }}
                                    >X</Label>
                                </Menu.Item>
                                )
                            })
                        }
                        </Menu.Menu>
                        <Menu.Item position='right' size='mini'>
                            <Button style={{background:'#2F4050',color:'white'}}>选择工作区:  </Button>
                            <Dropdown
                             //placeholder='选择备份' 
                             selection
                             options={this.state.workspaceList}
                             style={{color:'#2F4050',zIndex:'99999',height:'20px'}}
                             //defaultValue={this.state.workspaceName}
                             onChange={this.chooseWorkspace}
                            >
                            </Dropdown>
                            <WorkspaceAdd parent={this}></WorkspaceAdd>
                            <WorkspaceDelete parent={this} workspaceList={this.state.workspaceList}
                            workspace_data={this.workspace_data} workspaceName = {this.state.workspaceName}
                            ></WorkspaceDelete>
                            {/*<Button 
                            style={{background:'#2F4050',color:'white'}} //没有改
                            content={this.state.language=='ch'?'英文':'中文'}
                            onClick={()=>{this.state.language=='ch'?this.setState({language:'en'}):this.setState({language:'ch'})}}
                            >
                            </Button>*/}
                            <ModalHelp />
                            <ModalLogin parent={this}/>
                            
                        </Menu.Item>
                    </Menu>
                    </div>
                    <TopMenu 
                        workspaceName = {this.state.workspaceName}
                        workspace = {this.workspace_data}
                       //控制台显示隐藏   
                        consoleDisplay={() =>this.consoleDisplay()}
                        // 编辑评估参数显示
                        editEstChange = {()=>this.setState({ editEst: true })}
                    />
                    <Sidebar.Pushable>
                        {/* 控制台 */}
                        <Sidebar
                            // as={Card.Group}
                            animation='overlay'
                            icon='labeled'
                            inverted='true'
                            direction='right'
                            // onHide={() => setVisible(false)}
                            vertical='true'
                            visible={consoleVisible}
                            // width='thin'
                            width = 'very wide'
                            // style={{width: 500}}
                        >
                            <ConsoleInfo/>
                        </Sidebar>
                        {/* 主要控制界面的显隐，用以控制其他界面的显隐 */}
                        <Sidebar.Pusher>
                            <div style={{ position: 'relative',width: '100%', height: '91vh', overflowX: "auto", overflowY: 'hidden' }}>
        
                                <div style={{ background:'white',position: 'relative', width: '100%', height: '100%' }}>
                                    {
                                        pageList.length==0&&<div style={{ backgroundImage: "url(" + require( '../data/background.png') + ")",backgroundPosition: 'center',backgroundSize: 'cover',paddingTop: 100,marginLeft:380,width: '100%', height: '91vh', overflowY: 'hidden'}}>
                                        </div>
                                    }
                                    {
                                             pageList.length==0&&<div style={{fontSize:'50px',color:'#6C63FF',height:'10px',
                                             width: '1000px',
                                             position: 'absolute',
                                             top: '90px',
                                             left: '27px', fontWeight: 'bold' }}>新型服务模型与跨界服务模式</div>
                                    }
                                    
                                    {
                                        pageList.map((page, index) => <MainPage key={page.page_id} page={page} workspace={this.workspace_data} language={language}/>)
                                    }
                                </div>
                            </div>
                        </Sidebar.Pusher>
                    </Sidebar.Pushable>
                </div>
            </div>
        )
    }
}