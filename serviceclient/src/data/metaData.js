import deepcopy from 'deepcopy'
import { isArray } from 'util';
import META from './nameConfig'
import * as d3 from 'd3'
import { genUniqueID } from '../manager/commonFunction';
import {Instance, Relation, Property, GroupInstance, MetaObject} from './Ontology/instanceBase';


// 之后再Ontology加入默认的
const concept_bean_structure = {
    dscp: '',
    Description: {
        equivalentClass: [],
        // 'SubClass Of': [],
        // 'General class axioms': [],
        subClassOf: [META.Thing],
        // 'Target for Key': [],
        disjointWith: [],
        // 'Disjoint Union Of': [],
    },
    props: [],
    default_prop2value: {

    },
}

const relation_bean_structure = {
    dscp: '默认',
    Characteristics: {
        Functional: false,
        InverseFunctional: false,
        Transitive: false,
        Symmetric: false,
        Asymmetric: false,
        Reflexive: false,
        Irreflexive: false,
    },
    Description: {
        equivalentClass: [],
        subPropertyOf: [META.topObjectProperty],
        InverseOf: [],
        Domain: [],
        Range: [],
        disjointWith: [],
    }
}

const property_bean_structure = {
    dscp: '默认的',
    Characteristics: {
        Functional: false,
        // 我加的
        unique: false,
        cardinality: 1,
        readonly: false,
        constrain_readonly: false,
        not_null: false,
        default_value: undefined,
    },
    Description: {
        equivalentClass: [],
        subPropertyOf: [META.topDataProperty],
        domain: [],
        range: [],   //类型
        disjointWith: [],
    }
}


const colorList = d3.schemeCategory10
let colorList_point = 0
class Bean{
    constructor(bean_data, ontology_graph, default_bean_data){
        this.ontology_graph = ontology_graph

        // if(!bean_data.class_name){
        //     console.error(bean_data, '没有名字')
        // }

        this.bean_data = deepcopy(default_bean_data)
        this.setBeanData(bean_data)

        const {class_name, props, graph_data, constrains} = this.bean_data

        // if(!class_name){
        //     console.error(class_name, bean_data, '不存在')
        // }

        if(!graph_data){
            this.bean_data.graph_data = {
                color: colorList[(colorList_point++)%10]
            }
        }

        // this.concept_class = undefined
        this.inst_class = MetaObject

    }

    get workspace(){
        return this.ontology_graph.workspace
    }

    checkValid(){
        return true
    }

    setBeanData(bean_data){
        bean_data = deepcopy(bean_data)
        let old_data = deepcopy(this.bean_data)

        for(let key in old_data){
            let value = old_data[key]
            if(typeof(value) ==="object"){
                bean_data[key] = Object.assign(value, bean_data[key] || {})
            }else{
                bean_data[key] = bean_data[key] || value
            }
        }

        this.bean_data = bean_data
    }

    get name(){
        return this.bean_data.class_name
    }
    get id_name(){
        return this.ontology_graph.name + '/' + this.name
    }
}

class RelationBean extends Bean{
    constructor(bean_data, ontology_graph){
        super(bean_data, ontology_graph, relation_bean_structure)
        this.inst_class = Relation
    }
    get subclasses(){
        const {relation_data} = this.ontology_graph
        return Object.keys(relation_data).filter(sn => relation_data[sn].bean_data.Description.subPropertyOf.includes(this.bean_data. class_name))
    }

    get subclass_objects(){
        const {relation_data} = this.ontology_graph
        return this.subclasses.map(sc => relation_data[sc])
    }

    createInst(source, target){
        let new_inst = new Relation(this.workspace)
        new_inst.setBeans([this])
        new_inst.source = source
        new_inst.target = target
        return new_inst
    }
}

class PropertyBean extends Bean{
    constructor(bean_data, ontology_graph){
        super(bean_data, ontology_graph, property_bean_structure)
        this.inst_class = Property
    }
    get subclasses(){
        const {property_data} = this.ontology_graph
        return Object.keys(property_data).filter(sn => property_data[sn].bean_data.Description.subPropertyOf.includes(this.bean_data. class_name))
    }

    createInst(source, value){
        let new_inst = new Property(this.workspace)
        new_inst.setBeans([this])
        new_inst.source = source
        new_inst.value = value
        return new_inst
    }
}

class ConceptBean extends Bean{
    constructor(bean_data, ontology_graph){
        super(bean_data, ontology_graph, concept_bean_structure)
        this.inst_class = Instance
    }

    get subclasses(){
        const {concept_data} = this.ontology_graph
        return Object.keys(concept_data).filter(sn => concept_data[sn].bean_data.Description.subClassOf.includes(this.bean_data. class_name))
    }

    get subclass_objects(){
        const {concept_data} = this.ontology_graph
        return this.subclasses.map(sc => concept_data[sc])
    }

    createInst(){
        let new_inst = new Instance(this.workspace)
        new_inst.setBeans([this])
        return new_inst
    }
}





// 生成唯一的id
var id_pointer = 0
var time_stemp =  Date.now();
// console.log('当前时间',time_stemp)
const createUniqueId = () => {
    id_pointer++
    return time_stemp + '_' + id_pointer.toString()
}


const constrains2type = {
    dscp: META.TEXT,
    Functional: META.BOOLEAN,
    InverseFunctional:  META.BOOLEAN,
    Transitive:  META.BOOLEAN,
    Symmetric:  META.BOOLEAN,
    Asymmetric:  META.BOOLEAN,
    Reflexive:  META.BOOLEAN,
    Irreflexive:  META.BOOLEAN,
    equivalentClass: META.ARRAYTEXT,
    subPropertyOf: META.ARRAYTEXT,
    Domain: META.ARRAYTEXT,
    Range: META.ARRAYTEXT,   //类型
    disjointWith: META.ARRAYTEXT,
    not_null: META.BOOLEAN,
    default_value: META.TEXT,

    // 'SubClass Of': META.ARRAYTEXT,
    // 'General class axioms': META.ARRAYTEXT,
    // 'SubclassOf': META.ARRAYTEXT,
    // 'Target for Key': META.ARRAYTEXT,
    // 'Disjoint Union Of': META.ARRAYTEXT,
    props: META.ARRAYTEXT,

    is_state: META.BOOLEAN,
    cardinality: META.INT,

    allValuesFrom: META.ARRAYTEXT,
    allValuesTo: META.ARRAYTEXT,

    range: META.ARRAYTEXT,   //对象
    domain: META.ARRAYTEXT,    //作用域

    // 可以修改的
    constrain_readonly: META.BOOLEAN,
    readonly: META.BOOLEAN,

    required: META.BOOLEAN,  //必须的
    color: META.TEXT,

    propety_type: META.TEXT,  //函数属性(Functional Property)、 反函数属性(InverseFunctional Property)、传递属性(Transitive Property)、对称属性(Symmetric Property)

    is_transitive: META.BOOLEAN,
    is_symmetric: META.BOOLEAN,
    inverse_propety: META.TEXT, //对应的反函数属性
    // domain2range
    read_only: META.BOOLEAN, //不能修改

    someValuesFrom: META.ARRAYTEXT,

    name: META.TEXT,

    unique: META.BOOLEAN,
    input_value: META.TEXT,
}


export {
    META,

    createUniqueId,

    Bean,
    RelationBean,
    PropertyBean,
    ConceptBean,

    constrains2type,

}
