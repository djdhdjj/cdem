import { OntologyGraph } from "./Ontology/ontology"
import { BPMN_concepts, BPMN_properties, BPMN_relations } from "./Ontology/bpmnOntology"
import META from "./nameConfig"
import InstanceBase from "./Ontology/instanceBase"
import PatternData from "./patternData"
import net_work from "../manager/netWork"
import { pageManage } from "../manager/PageManage"
import Simulator from "./simulator"
import SimulateConfig from "../component/mainPage/simulate/simulateConfig"
import { S_IFMT } from "constants"
import { consoleManage } from "../manager/consoleManage"
import { genUniqueID } from "../manager/commonFunction"
import AssessedResults from "./assessedResult"
//import { ObservableObjectAdministration } from "mobx/lib/internal"

// import Fusion from './fusionData'
// 要不以后还是每个给个id吧
class WorkspaceData {
    constructor(name = '未知', config = {}) {
        this.name = name
        //this.language = 'ch'
        this.config = config || {}
        this.ontologies = {}  //概念
        this.service_pattern = {}   //模式
        this.simulator = {}   //仿真
        this.fusion_pattern = {}   //融合
        this.assessedResults = {}

    }

    get id2service_pattern(){
        let id2service_pattern = {}
        for(let s in this.service_pattern){
            let {id} = this.service_pattern[s]
            id2service_pattern[id] = this.service_pattern[s]
        }
        return id2service_pattern
    }

    get all_concepts(){
        let all_concepts = {}
        for(let s in this.ontologies){
            for(let n in this.ontologies[s].concept_data){
                let c = this.ontologies[s].concept_data[n]
                all_concepts[c.id_name] = c
            }
        }
        return all_concepts
    }

    get all_properties(){
        let all_properties = {}
        for(let s in this.ontologies){
            for(let n in this.ontologies[s].property_data){
                let c = this.ontologies[s].property_data[n]
                all_properties[c.id_name] = c
            }
        }
        return all_properties
    }

    get all_relations(){
        let all_relations = {}
        for(let s in this.ontologies){
            for(let n in this.ontologies[s].relation_data){
                let c = this.ontologies[s].relation_data[n]
                all_relations[c.id_name] = c
            }
        }
        return all_relations
    }

    toJson() {
        let o = {}, s = {}, sim = {},fus={},er = [],ar={}
        Object.keys(this.ontologies).forEach(elm => {
            o[elm] = this.ontologies[elm].toJson()
        })
        Object.keys(this.service_pattern).forEach(elm => {
            s[elm] = this.service_pattern[elm].toJson()
            //console.log('wd to json',s[elm])
        })
        Object.keys(this.simulator).forEach(elm=>{
            //console.log('------typeof',typeof(this.simulator[elm]))
            sim[elm] = this.simulator[elm].toJson()
        })

        Object.keys(this.assessedResults).forEach(elm=>{
            //console.log('------typeof',typeof(this.assessedResults[elm]))
            ar[elm] = this.assessedResults[elm].toJson()
        })

        Object.keys(this.fusion_pattern).forEach(elm=>{
            fus[elm]={}

            Object.keys(this.fusion_pattern[elm]).forEach(elm_t=>{
                 fus[elm][elm_t]={}
                Object.keys(this.fusion_pattern[elm][elm_t]).forEach(elm_tt=>{
                    fus[elm][elm_t][elm_tt] = this.fusion_pattern[elm][elm_t][elm_tt].toJson()
                })
            })
        })

        this.config.name = this.name

        return {
            config: this.config,
            //language:this.language,
            ontologies: o,
            service_pattern: s,
            simulator: sim,
            fusion_pattern:fus,
            assessedResults:ar,
        }
    }

    loadByNetwork() {
        return net_work.get('readWorkspace', { workspace: this.name })
            .then(data => {
                console.log('---loadbynet',data)
                this.loadByJson(data)
            })
    }

    saveByNetwork(callback) { //林创伟：加了callback（可选）
        console.log('this',this)
        return net_work.post('saveWorkspace', this.toJson(), callback)
    }

    loadByJson(data) {
        //console.log('---------wokspaceData-------loadByJson----')
        //console.log(data)


        let { config, ontologies, service_pattern, simulators,fusion_pattern,assessed_results  } = data
        console.log('-------workdata',data)
        //console.log('this',this)
        this.config = config
        for (let o_n in ontologies) {
            let new_o = new OntologyGraph({}, this)
            this.ontologies[o_n] = new_o
            new_o.loadByJson(ontologies[o_n])
            if(!new_o.name){
                new_o.config.name = o_n
            }
        }
        for (let s_n in service_pattern) {
            let new_s = new PatternData({}, this)
            this.service_pattern[s_n] = new_s
            new_s.loadByJson(service_pattern[s_n])
            if(!new_s.name){
                new_s.config.name = s_n
            }
        }
        // console.log(simulators)
        for(let sim_n in simulators){
            let new_sim = new Simulator({}, this)
            this.simulator[sim_n] = new_sim
            new_sim.loadByJson(simulators[sim_n])
            if(!new_sim.name){
                new_sim.config.name = sim_n
            }
        }

        for(let ar in assessed_results){
            let new_ar = new AssessedResults({}, this)
            this.assessedResults[ar] = new_ar
            //console.log('-----ar',ar)
            new_ar.loadByJson(ar,assessed_results[ar])
            /*if(!new_ar.name){
                new_ar.config.name = ar
            }*/
        }
        //debugger

        for (let fus_n in fusion_pattern) {
            const _this = this;
            // console.log(fus_n)
            this.fusion_pattern[fus_n] = {}
            for (let t in fusion_pattern[fus_n]) {
                this.fusion_pattern[fus_n][t] = {}
                for (let tt in fusion_pattern[fus_n][t]) {
                    this.fusion_pattern[fus_n][t][tt] = {}
                    let new_fus = new PatternData({}, _this)
                    // console.log('new_fus')
                    // console.log(new_fus)
                    this.fusion_pattern[fus_n][t][tt] = new_fus
                    new_fus.loadByJson(fusion_pattern[fus_n][t][tt])
                }
            }
        }

    }


    findOntologyByIdName(id_name) {
        if(!id_name){
            return undefined
        }
        // console.log(id_name)
        id_name = id_name.split('/')
        let ontology_name = id_name[0]
        if (!this.ontologies[ontology_name]) {
            //console.error(id_name, '没有对应的领域概念库')
            return undefined
        }

        let { concept_data, relation_data, property_data } = this.ontologies[ontology_name]
        let item_name = id_name[1]
        let search_item = concept_data[item_name] || relation_data[item_name] || property_data[item_name]

        return search_item
    }

    findConceptByName(name) {
        let concepts = []
        for (let o_n in this.ontologies) {
            let { concept_data, relation_data, property_data } = this.ontologies[o_n]
            if (concept_data[name]) {
                concepts.push(concept_data[name])
            }
        }
        return concepts
    }

    // 找所有本体里面的关键元素的比如task那些，传入的参数是（Task,Carrier等等 ）
    findAllSubclassesBelongTo(concept_name) {
        return this.findConceptByName(concept_name).reduce((all, c) => {
            return [...all, ...c.subclass_objects]
        }, [])
    }

    get structure_tree() {
        const wrapNone = elm => elm.length === 0 ? [{ title: '无', key: genUniqueID() }] : elm
        //console.log('stree',this.service_pattern)
        return [
            {
                title: '领域概念库',
                key: '领域概念库',
                children: wrapNone(Object.keys(this.ontologies).map(elm => ({
                    title: elm,
                    key: elm,
                    type: '领域概念库',
                    bean: this.ontologies[elm],
                })))
            },
            {
                title: '模式库',
                key: '模式库',
                children: [
                    {
                        title: '原子模式库',
                        key: '原子模式库',
                        children: wrapNone(Object.keys(this.service_pattern).map(elm => ({
                            title: elm,
                            key: elm,
                            type: '原子模式库',
                            bean: this.service_pattern[elm],
                            children: [
                                {
                                    title: '概念管理',
                                    key: elm + '概念管理',
                                    type: '概念管理',
                                    bean: this.service_pattern[elm],
                                },
                                {
                                    title: '模式绘制',
                                    key: elm + '模式绘制',
                                    type: '模式绘制',
                                    bean: this.service_pattern[elm],
                                },
                                {
                                    title: '评估配置',
                                    key: elm + '原子模式评估配置',
                                    type: '评估配置',
                                    bean: this.service_pattern[elm],
                                },
                            ]
                        })))
                    },
                    {
                        title: '融合模式库',
                        key: '融合模式库',
                        children: wrapNone(Object.keys(this.fusion_pattern).map(elm => ({
                            title: elm,
                            key: elm,
                            type: '融合模式',
                            bean: this.fusion_pattern[elm],
                            children: [
                                {
                                    title: '推荐结果',
                                    key: '推荐结果'+elm,
                                    // type: '中间结果',
                                    bean: this.fusion_pattern[elm],
                                    children: wrapNone(Object.keys(this.fusion_pattern[elm].intermediate).map((t,index) => ({
                                        title: '推荐'+(index+1),
                                        key: t,
                                        type: '推荐结果',
                                        bean: this.fusion_pattern[elm].intermediate[t],
                                        children:[
                                            {
                                                title:'评估配置',
                                                key:t+'融合模式评估配置',
                                                type:'评估配置',
                                                bean:this.fusion_pattern[elm].intermediate[t],
                                            }
                                        ]
                                       
                                    })))
                                },
                                {
                                    title: '选定结果',
                                    key:  '选定结果'+elm,
                                    type: '选定结果',
                                    bean: this.fusion_pattern[elm],
                                    children: wrapNone(Object.keys(this.fusion_pattern[elm].final).map((t,index) => ({
                                        title: '选定'+(index+1),
                                        key: t,
                                        type: '选定结果',
                                        bean: this.fusion_pattern[elm].final[t],
                                        children:[
                                            {
                                                title:'评估配置',
                                                key:t+'融合模式评估配置',
                                                type:'评估配置',
                                                bean:this.fusion_pattern[elm].final[t],
                                            }
                                        ]
                                    })))
                                },
                            ]
                        })))
                    },
                    //console.log('wdar',this.assessedResults),
                    {
                        title: '评估结果',
                        key: '评估结果',
                        //children: wrapNone([]),
                        children:wrapNone(Object.keys(this.assessedResults).map(elm=>({
                            title:elm,
                            key:elm,
                            type:'模式评估',
                            bean:this.assessedResults[elm],
                           
                    })))

                    }
                    
                ]
            },
            
            {
                title: '仿真库',
                key: '仿真库',
                children: wrapNone(Object.keys(this.simulator).map(id => {
                    const {status} = this.simulator[id].runtimeData
                    let childrenList = [];
                    if(status=='running' || status=='suspend'){
                        childrenList=[
                            {
                                title: '仿真配置',
                                key: id + '仿真配置',
                                type: '仿真配置',
                                bean: this.simulator[id],
                            },
                            {
                                title: '仿真过程',
                                key: id + '仿真过程',
                                type: '仿真过程',
                                bean: this.simulator[id],
                            }
                        ]
                    }else if(status=='stop' || status=='failed'){
                        childrenList=[
                            {
                                title: '仿真配置',
                                key: id + '仿真配置',
                                type: '仿真配置',
                                bean: this.simulator[id],
                            },
                            {
                                title: '仿真结果',
                                key: id + '仿真结果',
                                type: '仿真结果',
                                bean: this.simulator[id],
                            }
                        ]
                    }else{
                        childrenList=[
                            {
                                title: '仿真配置',
                                key: id + '仿真配置',
                                type: '仿真配置',
                                bean: this.simulator[id],
                            }
                        ]
                    }
                    return {
                        title: this.simulator[id].name,
                        key: '仿真' + id,
                        type: '仿真',
                        bean: this.simulator[id],
                        children: childrenList
                    }
                }))
            },
        ]
    }

    loadTestData() {
        this.ontologies['基础领域概念库'] = new OntologyGraph({ name: '基础领域概念库' }, default_workspace)
        this.ontologies['基础领域概念库'].init()
        this.ontologies['电商概念'] = new OntologyGraph({ name: '电商概念' }, default_workspace)
        this.ontologies['电商概念'].init()

        const bpmn_ontology = new OntologyGraph({ name: 'BPMN概念' }, default_workspace)
        this.ontologies['BPMN概念'] = bpmn_ontology
        bpmn_ontology.loadData(BPMN_concepts, BPMN_relations, BPMN_properties)

        this.service_pattern['test'] = new PatternData({ name: 'test' }, default_workspace)
    }
}

// 设置一个默认的
const default_workspace = new WorkspaceData('阿里巴巴')
default_workspace.loadByNetwork()
.then(() => {
    console.log('!!!!!!defaultwork',default_workspace)
    pageManage.closeAllPage()
    pageManage.refresh()
})

export default WorkspaceData
export {
    default_workspace
}
