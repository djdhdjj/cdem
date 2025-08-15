import {arrayRemove, genUniqueID} from "../../manager/commonFunction"
import { formatTimeStr } from "antd/lib/statistic/utils"
import {TextFactory, simulate_dictionary} from '../dictionary'

const tf = new TextFactory(simulate_dictionary)
// 存了实例的数据
class InstanceBase{ //对应一个仿真的全部instance和group，在结构上与group相似
    constructor(workspace, config = {}){
        this.workspace = workspace
        this.name = 'root'
        // this.id = this.name
        this.instances = []
        // this.properties = []
        this.relations = []
        this.groups = []
        this.config = config || {}
    }


    findInstanceByName(name){ //递归查找instance实例
        let t = this.instances.find(elm => elm.name === name)
        if(!t){
            for (let index = 0; index < this.groups.length; index++) {
                const g = this.groups[index];
                t = g.findInstanceByName(name)
                if(t){
                    return t
                }
            }
        }
        return t
    }

    findGroupByName(name){//递归查找Group实例
        let t = this.groups.find(elm => elm.name === name)
        if(!t){
            for (let index = 0; index < this.groups.length; index++) {
                const g = this.groups[index];
                t = g.findGroupByName(name)
                if(t){
                    return t
                }
            }
        }
        return t
    }

    toJson(){
        return {
            'config': this.config,
            'instances': this.instances.map(elm =>  elm.toJson()),
            'groups': this.groups.map(elm => elm.toJson()),
            'relations': this.relations.map(elm => elm.toJson()),
        }
    }

 

    get all_instances(){
        // let res = this.instances
        // for(let i=0;i<this.groups.length;i++){
        //     const g = this.groups[i]
        //     res = res.concat(g.instances,g.all_instances)
        // }
        // let res = ({...this.instances, ..t.this.groups.map(elm => elm.all_instances)})
        // console.log(res)
        return [...this.instances, ...this.groups.map(elm => elm.all_instances)]
    }

    hasInstance(instance){
        return this.instances.has(instance)
    }

    loadByJson(data){
        // console.log(data)
        const {groups, instances, config, relations} = data
        instances.forEach(elm => {
            let new_e = this.createInstance()
            new_e.loadByJson(elm)
        })
        groups.forEach(elm => {
            let new_e = this.createGroup()
            new_e.loadByJson(elm)
        })

        // console.log(relations)
        relations.forEach(elm => {
            let new_e = this.createRelation()
            new_e.loadByJson(elm)
        })
    }

    deleteInstance(instance){     //删除instance，同时删除关联的relations  
        arrayRemove(this.instances, instance)     
        this.findRelatedRelations(instance).forEach(elm => this.deleteRelation(elm))
    }

    createInstance(){ //创建一个instance，parent默认（instance_base）
        let new_i = new Instance(this)
        this.instances.push(new_i)
        return new_i
    }

    // deleteSelection() { 不再需要
    //     for (let index = 0; index < this.instances.length; ) {
    //         const ins = this.instances[index]
    //         if (ins.selecting) {
    //             this.deleteInstance(ins)
    //         } else {
    //             index++;
    //         }
    //     }
    //     for (let index = 0; index < this.groups.length; ) {
    //         const grp = this.groups[index]
    //         if (grp.selecting) {
    //             this.deleteGroup(grp);
    //         } else {
    //             grp.deleteSelection();
    //             index++;
    //         }
    //     }
    // }

    // addProperty(property){
    //     this.properties.push(property)
    // }
    // deleteProperty(property){
    //     // this.properties.delete(property)
    // }
    // findRelatedProperties(instance){
    //     return [...this.properties].filter(elm => elm.source === instance)
    // }

    createRelation(){
        let new_r = new Relation(this)
        this.relations.push(new_r)
        return new_r
    }
    // addRelation(relation){
    //     this.relations.push(relation)
    // }
    deleteRelationById(relation_id){ // Add By LinChuangwei
        //console.log('删除relation: id:',relation_id)
        this.relations.forEach((elm,i)=>{
            if(elm.id===relation_id){
                this.relations.splice(i,1)
                //console.log('删除成功')
            }
        })
    }
    deleteRelation(relation){
        this.relations.remove(relation)
    }

    findRelatedRelations(instance){
        // console.log(this, instance)
        return this.relations.filter(elm => elm.source === instance || elm.target === instance || elm.source === instance.name || elm.target === instance.name)
    }

    findOutRelations(instance){
        return this.relations.filter(elm => elm.source === instance || elm.source === instance.name)
    }

    createGroup(){ //创建一个group，parent默认（instance_base）
        //console.log('instance_base.createGroup')
        let n_g = new GroupInstance(this)
        this.groups.push(n_g)
        return n_g
    }

    deleteGroup(group){
        arrayRemove(this.groups, group)
    }

    deleteByName(name){ //输入name（） 输出 被删除的instance或group
        let g = this.findGroupByName(name)
        if(g != null){
            let parent = g.parent
            parent.deleteGroup(g)
            return g
        }
        let i = this.findInstanceByName(name)
        if(i != null){
            let parent = i.parent
            parent.deleteInstance(i)
            return i
        }
        return null
    }

    toTreeJson(){ //返回Tree需要的Json结构,递归生成
        if(this.groups.length === 0 && this.instances.length === 0){
            return [{
                'title':'空',
                'key':'空&空',//无意义，防止用户创建的节点重名
                'isLeaf':true,
                'disabled':true
            }]
        }
        const children = this.groups.map(elm => elm.toTreeJson()).concat(this.instances.map(elm => elm.toTreeJson())) 
        return children
        
    }

}


// todo: 现在这样重命名了，所有的边都会丢到
// bean就是现在ontology的xml
class MetaObject {
    constructor(instance_base) {
        this.name = genUniqueID()
        this.instance_base = instance_base
        this._graph_data = {}  //存作图时的信息，不需要在意
        this.graph_data = {}
        // this.beans = []
        this.id = this.name//genUniqueID()

        this.data_properties = {
        }

        this.type = []
    }

    loadByJson(data){
        Object.assign(this, data)
    }

    toJson(){
        return {
            'config': this.config || {},
            'name': this.name,
            'graph_data': this.graph_data,
            'id': this.id,
            'type': this.type,
            'data_properties': this.data_properties,
        }
    }

    get workspace(){
        return this.instance_base.workspace
    }

    // get types(){
    //     return this.beans.map(elm => elm.id_name)
    // }

    // setBeans(beans){
    //     this.beans = [...beans]
    // }
}


class Instance extends MetaObject{
    constructor(instance_base){
        super(instance_base)
        this.parent = this.instance_base //parent节点，默认是instance_base
        this.bindTo = []//这两个变量为了好在仿真结果页面显示
        this.object_properties = []
    }

    get all_instances(){
        return this
    }

    get relations(){
        return this.instance_base.findRelatedRelations(this)
    }

    get out_relations(){
        return this.instance_base.findOutRelations(this)
    }


    toJson(){
        let j = super.toJson()
        return Object.assign(j,{
            'bindTo':this.bindTo,
            'object_properties':this.out_relations.map(elm => {
                return {
                    type:elm.type,
                    target:elm.target
                }
            })
        })
    }

    toTreeJson(){//返回Tree需要的Json结构
        return{
            'title':tf.str('Instance')+':'+this.name,
            'key':this.name,
            'isLeaf':true
        }
    }
}

// 类似于group的概念
class GroupInstance extends MetaObject{
    constructor(instance_base){
        super(instance_base)
        this.instances = []
        this.parent = this.instance_base
        this.groups = [] //group可以嵌套
        this.num = 1
    }

    get all_instances(){
        return [...this.instances, ...this.groups.map(elm => elm.all_instances)]
    }

    findInstanceByName(name){
        let t = this.instances.find(elm => elm.name === name)
        if(!t){
            for (let index = 0; index < this.groups.length; index++) {
                const g = this.groups[index];
                t = g.findInstanceByName(name)
                if(t){
                    return t
                }
            }
        }
        return t
    }

    findGroupByName(name){
        let t = this.groups.find(elm => elm.name === name)
        if(!t){
            for (let index = 0; index < this.groups.length; index++) {
                const g = this.groups[index];
                t = g.findGroupByName(name)
                if(t){
                    return t
                }
            }
        }
        return t
    }

    createInstance(){ //创建一个instance，parent设置为自己
        let new_i = new Instance(this.instance_base)
        new_i.parent = this
        this.instances.push(new_i)
        return new_i
    }

    createGroup(){
        let new_g = new GroupInstance(this.instance_base)
        new_g.parent = this
        this.groups.push(new_g)
        return new_g
    }

    deleteInstance(ins) {
        arrayRemove(this.instances, ins)
    }

    deleteGroup(group) {
        arrayRemove(this.groups, group)
    }

    deleteByName(name){ //输入 name 输出 被删除的instance或group
        let g = this.findGroupByName(name)
        if(g != null){
            let parent = g.parent
            parent.deleteGroup(g)
            return g
        }
        let i = this.findInstanceByName(name)
        if(i != null){
            let parent = i.parent
            parent.deleteInstance(i)
            return i
        }
        return null
    }

    loadByJson(data){
        super.loadByJson(data)
        this.instances = this.instances.map(elm => {
            let new_e = this.createInstance()
            new_e.loadByJson(elm)
            return new_e
        
        })
        this.groups = this.groups.map(elm => {
            let new_e = this.createGroup()
            new_e.loadByJson(elm)
            return new_e
        })
    }

    toJson(){
        let j = super.toJson()
        // console.log(this.groups)
        j = Object.assign(j, {
            'instances': this.instances.map(elm => elm.toJson()),
            'groups':this.groups.map(elm => elm.toJson()),
            'num': this.num
        })
        return j
    }

    toTreeJson(){//返回Tree需要的Json结构，递归生成
        //console.log('this.groups')
        //console.log(this.groups)
        const children = this.groups.map(elm => elm.toTreeJson()).concat(this.instances.map(elm => elm.toTreeJson()))
        return{
            'title':tf.str('Group')+':'+this.name,
            'key':this.name,
            'children':children
        }
    }
}

class Relation extends MetaObject {
    source = undefined
    target = undefined
    // type = []

    toJson(){
        let j = super.toJson()
        j = Object.assign(j, {
            'source': this.source,
            'target': this.target,
        })
        return j
    }

    loadByJson(data){
        super.loadByJson(data)
        // console.log(this)
    }
}

class Property extends MetaObject {
    source = undefined
    value = undefined
}


export default InstanceBase
export {
    Instance,
    Relation,
    Property,
    GroupInstance,
    MetaObject,
}
