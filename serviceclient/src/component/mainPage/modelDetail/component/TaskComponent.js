import React from "react";
import DiagramCtrler from "../func/diagramCtrler.ts";
import META from "../../../../data/nameConfig";
import {Button, Dropdown, Header, Icon, Input, Modal, Segment} from "semantic-ui-react";
import COLOR from "../../../../data/Color";
import {default_workspace} from "../../../../data/workspaceData";
import {PageType} from "../../../../manager/PageManage";
import {saveAs} from "file-saver";
import * as go from "gojs";
import model from "../../../../data/model";
import { pageManage } from "../../../../manager/PageManage";



var id_count = -1
const genUniqueID = () =>　{
    id_count++
    return (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() + id_count
}

export default class TaskComponent extends React.Component {
    constructor(props) {
        super(props)
        //console.log(this.props)
        this.state = {
            dropdownVisible: false,
            dropdownValue: null,
            elmConceptData: null,
            insList: [],
            dropdownType: null,
            aa:null
        }
    }  
    componentDidMount() {
        const { diagramDiv } = this.refs
        console.log(diagramDiv)
        this.workspace_data = this.props.workspace_data
        // this.addConcept = this.props.addConcept
        // this.removeConcept = this.props.removeConcept
        // this.controller = new DiagramCtrler(diagramDiv, this.props.workspace_data)
        this.service_pattern = this.props.localInfo.bean
        if(this.service_pattern._data.elements === undefined || this.service_pattern._data.elements === null){
            this.service_pattern._data['elements'] = {
                Participant:[], Carrier:[], Goal:[],Quota:[],resouceObject:[],currencyObject:[],dataObject:[],Task:[]
            }
        }

        console.log('TaskComponent中的service_pattern数据')
        console.log(this.service_pattern)
        this.paticipants = this.service_pattern._data.elements['Participant']

        // 将service_pattern中paticipants加载到_data中去 --开始
        // 首先添加Pool节点
        if(JSON.stringify(this.service_pattern._data.nodes) === "{}"){
            let poolkey = this.service_pattern.name + "/"+genUniqueID()
            let poolnode = {
                "category": "Pool",
                "isGroup": true,
                "key": poolkey,
                "name": "BPMN概念/LaneSet-1",
                "type": "BPMN概念/LaneSet"
            }
            this.service_pattern._data.nodes[poolkey] = poolnode

            for(let i in this.paticipants){
                console.log(this.paticipants[i])
                let tempkey = this.service_pattern.name + "/"+ genUniqueID()
                let temp = {
                    "category": "Lane",
                    "data_properties": {},
                    "goal": [],
                    "group": poolkey,
                    "isGroup": true,
                    "key": tempkey,
                    "name": this.paticipants[i],
                    "participant": this.paticipants[i],
                    "props": [],
                    "size": "800.8900633513015 283.37037048339846",
                    "superProps": {},
                    "text": this.paticipants[i],
                    "type": "BPMN概念/Lane"
                }
                this.service_pattern._data.nodes[tempkey] = temp
                console.log('tc_sp', this.service_pattern._data.nodes[tempkey])
            }
        }
        
        // 将service_pattern中paticipants加载到_data中去 --结束
        this.controller = this.service_pattern.initDiagram(diagramDiv)
        // new DiagramCtrler(diagramDiv, this.props.workspace_data)
        // console.log(this.props)
        this.controller.init({
            // addConcept: (c) => this.addConcept(c),
            // removeConcept: (c) => this.removeConcept(c),
        }, {
            instance: (data) => this.newDropdown(data, 'instance'),
            carrierBinding: (data) => this.newDropdown(data, 'carrierBinding'),
            dataBinding: (data) => this.newDropdown(data, 'dataBinding'),
            resourceBinding: (data) => this.newDropdown(data, 'resourceBinding'),
            currencyBinding: (data) =>this.newDropdown(data, 'currencyBinding'),
            taskBinding: (data) => this.newDropdown(data, 'taskBinding'),
            propsEdit: (data) => this.propsEdit(data)
        })
        // console.log
        this.service_pattern.drawModel()
        // this.controller.drawModel(this.service_pattern._data)
        this.diagram = this.controller.diagram
        // console.log(this.service_pattern.data)
    }

    // 当this.props改变的时候调用
    // componentWillReceiveProps(){
    //     const { diagramDiv } = this.refs
    //     this.diagramDiv.div = null 
    //     this.workspace_data = this.props.workspace_data
    //     this.service_pattern = this.props.localInfo.bean
    //     this.nodes = this.service_pattern._data.nodes

    //     if(this.service_pattern.elements === undefined || this.service_pattern.elements === null){
    //         this.service_pattern['elements'] = {
    //             Participant:[], Carrier:[], Goal:[],Quota:[],Resource:[],dataObject:[],Task:[]
    //         }
    //     }

    //     console.log('更新之后的TaskComponent中的service_pattern数据')
    //     console.log(this.service_pattern)
    //     this.paticipants = this.service_pattern.elements['Participant']

    //     this.controller = new DiagramCtrler(diagramDiv, this.workspace, this.service_pattern)
    //     // this.controller = this.service_pattern.initDiagram(diagramDiv)
    //     // new DiagramCtrler(diagramDiv, this.props.workspace_data)
    //     // console.log(this.props)
    //     this.controller.init({
    //         // addConcept: (c) => this.addConcept(c),
    //         // removeConcept: (c) => this.removeConcept(c),
    //     }, {
    //         instance: (data) => this.newDropdown(data, 'instance'),
    //         carrierBinding: (data) => this.newDropdown(data, 'carrierBinding'),
    //         dataBinding: (data) => this.newDropdown(data, 'dataBinding'),
    //         resourceBinding: (data) => this.newDropdown(data, 'resourceBinding'),
    //         taskBinding: (data) => this.newDropdown(data, 'taskBinding'),
    //         propsEdit: (data) => this.propsEdit(data)
    //     })
    //     // console.log
    //     this.service_pattern.drawModel()
    //     // this.controller.drawModel(this.service_pattern._data)
    //     this.diagram = this.controller.diagram
    // }

    //对属性编辑
    propsEdit(data) {
        
        const path = 'Props Edit: ' + data.key
        //const path = 'Props Edit: ' + data.name
        const newPage = pageManage.openPage(path, PageType.propsEdit)
        const strs = data.type.split('/')
        const ontologyName = strs[0]
        const conceptName = strs[1]
        const conceptData = this.workspace_data.ontologies[ontologyName].concept_data;
        const bean = conceptData[conceptName]
        
        newPage.localInfo.bean = bean
        console.log('!!!data',data,ontologyName,conceptName)
        console.log('key',data.key)
        //newPage.service_pattern_name = ''
        data.props = bean.bean_data.props.map(p => ontologyName + '/' + p)
        let superClassName = bean.bean_data.Description.subClassOf;
        let superProps = {};
        console.log('superP',superClassName)
        while (superClassName.length > 0) {
            let sc = {};
            superClassName.forEach(name => {
                const superBean = conceptData[name].bean_data
                console.log('superBean',superBean)
                superBean.props.forEach(prop => {
                    //superProps.push(ontologyName + '/' + prop)
                    superProps[ontologyName+ '/' + prop]=superBean.propsDefault[prop]
                })
                superBean.Description.subClassOf.forEach(name => {
                    sc[name] = ''
                })
            })
            superClassName = Object.keys(sc)
        }
        data.superProps = superProps
        newPage.localInfo.graph_data = data
        newPage.localInfo.controller = this.controller
        pageManage.refresh()
    }

    //在模式图中对某个新的节点进行类型的绑定
    newDropdown(data, type) {
        console.log('data,type',data, type)
        let insList = []
        let {type: dropdownValue} = data

        if (type === 'taskBinding')   {
            // insList = this.workspace_data.findAllSubclassesBelongTo('Task').map(elm => elm.id_name)// this.bpmnOntology.concept_data
            insList = this.service_pattern._data.elements['Task']
            // dropdownValue = data.category
        }
        if (type === 'carrierBinding') {
            // insList = this.workspace_data.findAllSubclassesBelongTo(META.Carrier).map(elm => elm.id_name)
            insList = this.service_pattern._data.elements['Carrier']
            // dropdownValue = ( data['objectProperty'] || {} )[META.CarrierIs]
            // dropdownValue = data.carrier
        }
        if (type === 'dataBinding') {
            insList = this.service_pattern._data.elements['dataObject']
            // insList = this.workspace_data.findAllSubclassesBelongTo(META.dataObject).map(elm => elm.id_name)
        }
        if(type === 'resourceBinding'){
            insList = this.service_pattern._data.elements['resourceObject']
            //insList = this.workspace_data.findAllSubclassesBelongTo(META.Resource).map(elm => elm.id_name)
        }
        if(type === 'currencyBinding'){
            insList = this.service_pattern._data.elements['currencyObject']
            //insList = this.workspace_data.findAllSubclassesBelongTo(META.Resource).map(elm => elm.id_name)
        }

        //console.log('---length',insList.length)
        if(typeof(insList) != 'undefined'){
            insList = insList.map(name => {
                return {
                    key: name,
                    text: name,
                    value: name,
                }
            })
            this.setState({
                dropdownVisible: true,
                elmConceptData: data,
                insList: insList,
                dropdownType: type,
                dropdownValue: dropdownValue
            })
        }
        else {
            alert('请在概念管理中选择要素')
        }
        
    }
    handleDropdownChange(event, data) {
        this.setState({
            dropdownValue: data.value
        })
    }

    submitDropdown() {
        const {elmConceptData, dropdownValue, dropdownType} = this.state
        if (elmConceptData && dropdownValue) {
            console.log(elmConceptData, dropdownValue, dropdownType)
            let diagram = this.diagram
            let editObject = diagram.model.findNodeDataForKey(elmConceptData.key)
            if (editObject) {

                diagram.model.startTransaction("edit");

                if(dropdownType === 'carrierBinding'){
                    let object_prop = editObject['objectProperty'] || {}
                    object_prop[META.CarrierIs] = dropdownValue
                    diagram.model.setDataProperty(editObject, 'objectProperty', object_prop);
                }else{
                    diagram.model.setDataProperty(editObject, 'type', dropdownValue);
                }

                // if (dropdownType === 'taskBinding')   {
                //     diagram.model.setDataProperty(editObject, 'category', dropdownValue);
                //     // diagram.model.setDataProperty(editObject, 'category', dropdownValue);
                //     // diagram.model.setDataProperty(editObject, 'task', this.bpmnOntology.concept_data[dropdownValue]);
                // }
                // if (dropdownType === 'carrierBinding') {
                //     // carrier
                //     diagram.model.setDataProperty(editObject, 'type', dropdownValue);
                // }
                // if (dropdownType === 'dataBinding' ) {
                //     diagram.model.setDataProperty(editObject, 'type', dropdownValue)
                // }
                diagram.model.commitTransaction("edit");
            }
        this.closeModel()
        }
    }

    closeModel() {
        this.setState({
            dropdownVisible: false,
            elmConceptData: null,
            dropdownValue: null
        })
    }

    export() {
        console.log('export 方法')
        const nodeDataArray = this.controller.diagram.model.nodeDataArray
        const linkDataArray = this.controller.diagram.model.linkDataArray
        let jsonNodeArray = []
        let jsonLinkArray = []
        nodeDataArray.forEach(node => {
            let jsonNode = {}
            Object.keys(node).forEach(key => {
                if (key  === 'participant') {
                    jsonNode[key] = node[key].id_name
                } else if (key === 'goal') {
                    jsonNode[key] = node[key].map(item => item.id_name)
                }
                else if (key !== 'type' && key !== '__gohashid') {
                    jsonNode[key] = node[key]
                }
            })
            jsonNodeArray.push(jsonNode)
        })
        linkDataArray.forEach(link => {
            let jsonLink = {}
            Object.keys(link).forEach(key => {
                if (key === 'points') {
                    jsonLink[key] = link[key].toArray().map(point => go.Point.stringify(point))
                } else if (key !== '__gohashid') {
                    jsonLink[key] = link[key]
                }
            })
            jsonLinkArray.push(jsonLink)
        })
        const data = {
            nodes: jsonNodeArray,
            links: jsonLinkArray
        }
        console.log("=============this.service_pattern.data===============  ")
        //console.log(this.service_pattern.data)
        // console.log(data)
        let blob = new Blob([JSON.stringify(data)], {type: ''});
        saveAs(blob, "model.json");
    }

    import() {
        const data = model
        this.service_pattern.loadData(data)
    }

    render() {
        
        const { dropdownVisible, insList, dropdownValue } = this.state
        return <div style={{position:'relative',width: '100%', height: '100%', background: COLOR.LIGHT_BLACK }}>
            <Modal open={dropdownVisible}>
                <Header content='选择概念' />
                <Modal.Content >
                    <Dropdown
                        search
                        selection
                        onChange={(e, d) => this.handleDropdownChange(e, d)}
                        options={insList}
                        value={dropdownValue}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button basic color='red'
                            onClick={() => this.closeModel()}
                    >
                        <Icon name='remove' /> No
                    </Button>
                    <Button color='green'
                            onClick={() => this.submitDropdown()}
                    >
                        <Icon name='checkmark' /> Yes
                    </Button>
                </Modal.Actions>
            </Modal>
           <div id="diagramDiv" className='diagramDiv' ref="diagramDiv" style={{width: '100%', height: '100%'}}/>
        </div>
    }
}