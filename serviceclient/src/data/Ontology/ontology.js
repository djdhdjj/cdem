import default_concept_bean from "./default_concept_bean_data"
import default_rel_bean from "./default_relation_bean_data"
import { default_property_bean } from "./default_property_bean_data"
import {HomeAdd,ListAdd} from "../../component/ui_component/Add";
import deepcopy from 'deepcopy'
import { META, Bean, RelationBean, createUniqueId, addUniqueId, ConceptBean, PropertyBean } from "../metaData"
import { genUniqueID } from "../../manager/commonFunction"

//本体构造函数
class OntologyGraph {
    constructor(config = {}, workspace = undefined) {
        this.config = config || {}
        if(!this.config.id){
            this.config.id = genUniqueID()
        }
        this.workspace = workspace

        this.concept_data = {}
        this.relation_data = {}
        this.property_data = {}
    }

    get id(){
        return this.config.id
    }
    
    get name(){
        return this.config.name
    }

    loadData(concept_data, relation_data, property_data) {
        const wrapper = (data, bean_constructor) => {
            let new_data = {}
            for (let key in data) {
                new_data[key] = new bean_constructor(data[key], this)
            }
            return new_data
        }

        this.concept_data = wrapper(concept_data, ConceptBean)
        this.relation_data = wrapper(relation_data, RelationBean)
        this.property_data = wrapper(property_data, PropertyBean)
    }

    loadByJson(data){
        this.config = data.config
        this.loadData(data.concept_data, data.relation_data, data.property_data)
    }

    init() {
        this.loadData(default_concept_bean, default_rel_bean, default_property_bean)
    }
    checkValid() {
        return true
    }
    toXML() {

    }
    toJson() {
        const unrwapper = (data) => {
            let new_data = {}
            for (let key in data) {
                // console.log()
                new_data[key] = data[key].bean_data
            }
            return new_data
        }

        return {
            concept_data: unrwapper(this.concept_data),
            relation_data: unrwapper(this.relation_data),
            property_data: unrwapper(this.property_data)
        }
    }
    //生成子树
    get concept_tree() {
        //concept_data是一个字典类型的数据，可以以key映射到value
        const { concept_data } = this
        const getSubClass = class_name => {
            let sub_classes = concept_data[class_name].subclasses;
            return sub_classes.map(subclass_name => ({
                title: subclass_name,
                key: class_name + '_' + subclass_name,
                object: concept_data[subclass_name],
                children: getSubClass(subclass_name),
                name: subclass_name,
            }))
        }
        //这里将没有父亲节点的元素设置为根节点
        let sum=0;
        let root={};
        for(let k in concept_data){
            let child_element=concept_data[k].bean_data.Description.subClassOf;
            if(child_element!=null && child_element.length ===0){
                root = {
                    title: k,
                    key: k,
                    children: getSubClass(k),
                    object: concept_data[k],
                    name: k
                }
                break;
            }
        }
        return root
    }
    //获得树的数据

    get relation_tree() {
        const { relation_data } = this
        const getSubClass = class_name => {
            // console.log(relation_data, class_name)
            let sub_classes = relation_data[class_name].subclasses
            return sub_classes.map(subclass_name => ({
                title: subclass_name,
                key: class_name + '_' + subclass_name,
                object: relation_data[subclass_name],
                children: getSubClass(subclass_name),
                name: subclass_name,
            }))
        }

        // const root = {
        //     title: "topObjectProperty",
        //     key: "topObjectProperty",
        //     children: getSubClass("topObjectProperty"),
        //     object: relation_data["topObjectProperty"],
        //     name: "topObjectProperty"
        // }
        let sum=0;
        let root={};
        for(let k in relation_data){
            let child_element=relation_data[k].bean_data.Description.subPropertyOf;
            if(child_element!=null && child_element.length ===0){
                root = {
                    title: k,
                    key: k,
                    children: getSubClass(k),
                    object: relation_data[k],
                    name: k
                }
                break;
            }
        }
        return root
    }


    get property_tree() {
        const { property_data } = this
        const getSubClass = class_name => {
            let sub_classes = property_data[class_name].subclasses
            return sub_classes.map(subclass_name => ({
                title: subclass_name,
                key: class_name + '_' + subclass_name,
                object: property_data[subclass_name],
                children: getSubClass(subclass_name),
                name: subclass_name,
            }))
        }

        let sum=0;
        let root={};
        for(let k in property_data){
            let child_element=property_data[k].bean_data.Description.subPropertyOf;
            if(child_element!=null && child_element.length ===0){
                root = {
                    title: k,
                    key: k,
                    children: getSubClass(k),
                    object: property_data[k],
                    name: k
                }
                break;
            }
        }
        return root
    }

    // toXML(){
    //     document.getElementsByTagName('header')
    // }
    // loadXML(){

    // }

    // 在概念库中添加一个新概念
    addConceptBean(newConcept, parent) {
        let bean_data = deepcopy(this.concept_data[META.Thing].bean_data)
        bean_data.class_name = newConcept
        delete bean_data.graph_data
        bean_data.Description[META.SubClassOf] = [parent]
        bean_data.props=this.concept_data[parent].bean_data.props;
        //console.log(this.concept_data[parent].bean_data)
        this.concept_data[newConcept] = new ConceptBean(bean_data, this)
    }

    removeConceptBean(oldConcept) {
        if (oldConcept === "Thing") return
        const root = this.concept_data[oldConcept]
        if (root) {
            root.subclasses.forEach(sub => this.removeConceptBean(sub))
            delete this.concept_data[oldConcept]
        }
    }

    addRelationBean(newRelation, parent) {
        let bean_data = deepcopy(this.relation_data[META.topObjectProperty].bean_data)
        bean_data.class_name = newRelation
        delete bean_data.graph_data
        bean_data.Description[META.subPropertyOf] = [parent]
        this.relation_data[newRelation] = new RelationBean(bean_data, this)
    }

    removeRelationBean(oldRelation) {
        if (oldRelation === "topObjectProperty") return
        const root = this.relation_data[oldRelation]
        if (root) {
            root.subclasses.forEach(sub => this.removeRelationBean(sub))
            delete this.relation_data[oldRelation]
        }
    }

    addPropertyBean(newProperty, parent) {
        let bean_data = deepcopy(this.property_data[META.topDataProperty].bean_data)
        bean_data.class_name = newProperty
        delete bean_data.graph_data
        bean_data.Description[META.subPropertyOf] = [parent]
        this.property_data[newProperty] = new PropertyBean(bean_data, this)
    }

    removePropertyBean(oldProperty) {
        if (oldProperty === "topDataProperty") return
        const root = this.property_data[oldProperty]
        if (root) {
            root.subclasses.forEach(sub => this.removePropertyBean(sub))
            // 删除concept里涉及的property
            Object.keys(this.concept_data).forEach(concept => {
                const bean_data = this.concept_data[concept].bean_data
                if (bean_data.props) {
                    const index = bean_data.props.indexOf(oldProperty)
                    if (index !== -1) {
                        bean_data.props.splice(index, 1)
                    }
                }
            })

            delete this.property_data[oldProperty]
        }
    }
}

export {
    OntologyGraph
}
