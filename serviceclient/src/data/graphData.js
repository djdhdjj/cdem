class Company {
    constructor(graph) {
        this.id2obj = {}
        this.obj_set = new Set()
        this.graph = graph
    }
    get(id) {
        return this.id2obj[id]
    }

    clear() {
        this.id2obj = {}
        this.obj_set = new Set()
    }
    add(new_obj) {
        let id = new_obj.id
        if (this.id2obj[id] && this.id2obj[id] !== new_obj) {
            console.error(new_obj, this.id2obj[id], '的id重复了', new_obj.name, new_obj.id)
        }
        new_obj.graph = this.graph
        this.obj_set.add(new_obj)
        this.id2obj[id] = new_obj
    }
    remove(obj) {
        let id = obj.id
        if (!this.id2obj[id] || this.id2obj[id] !== obj) {
            // console.error(obj, '不存在')
            return
        }
        this.obj_set.delete(obj)
        delete this.id2obj[id]
    }
    get objs() {
        return [...this.obj_set]
    }
}


export default class Graph{
    constructor(){
        // this.elmStore = new Company(this)
        // this.relationStore = new Company(this)
        // this.groupStore = new Company(this)
    }
    // get(id) {
    //     let elm = this.elmStore.get(id)
    //     if (!elm)
    //         elm = this.relationStore.get(id)
    //     if (!elm) 
    //         elm = this.groupStore.get(id)
    //     return elm
    // }
    // get elms() {
    //     return this.elmStore.objs
    // }

    // get relations() {
    //     return this.relationStore.objs
    // }
    // get groups() {
    //     return this.groupStore.objs
    // }

} 