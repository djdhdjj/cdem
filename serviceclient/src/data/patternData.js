// import Graph from "./graphData";
import DiagramCtrler from '../component/mainPage/modelDetail/func/diagramCtrler.ts'
import deepcopy from 'deepcopy'
import { default_evaluate_config } from './evaluateConfig'
import { genUniqueID } from '../manager/commonFunction'
// data = {

// }

export default class PatternData {
    constructor(config = {}, workspace = undefined) {
        if (!config.id) {
            config.id = genUniqueID()
        }

        this.workspace = workspace

        // this.diagram = undefined
        this._data = {
            'nodes': {},
            'links': {},
            'config': config || {},
            'elements': {},
            'evaluate_config':{},
            'resource_config':{},
        }
        this.evaluate_config = {}
        // this.elements = {}
    }

    // get elements(){
    //     return this._data.elements
    // }
    get config() {
        return this._data.config
    }

    get id() {
        return this.config.id
    }

    get name() {
        return this.config.name
    }

/*
    refreshEvaluateConfig() {
        
        
        if(JSON.stringify(this._data.evaluate_config) !== "{}"){
            this.evaluate_config = this._data.evaluate_config
         }else{
            const { evaluate_config } = this
            const { nodes } = this.data
            nodes.forEach(elm => {
                const { category, key, name } = elm
                //console.log('category',category,key,name)
                if (!evaluate_config[key]) {
                    switch (category) {
                        case 'Lane':
                            evaluate_config[key] = deepcopy(default_evaluate_config['Lane'])
                            break;
                        case 'task':
                            evaluate_config[key] = deepcopy(default_evaluate_config['task'])
                            break
                        case 'start':
                        case 'end':
                            evaluate_config[key] = deepcopy(default_evaluate_config['event'])
                            break
                        case 'exclusive':
                        case 'parallel':
                            evaluate_config[key] = deepcopy(default_evaluate_config['gateway'])
                            break
                        case 'dataObject':
                            evaluate_config[key] = deepcopy(default_evaluate_config['dataObject'])
                        case 'resourceObject':
                            evaluate_config[key] = deepcopy(default_evaluate_config['resourceObject'])
                        case 'currencyObject':
                            evaluate_config[key] = deepcopy(default_evaluate_config['currencyObject'])
                    }
                    if (!evaluate_config[key]) {
                        evaluate_config[key] = {}
                    }
                    evaluate_config[key].name = name
                }
            });
            this._data.evaluate_config = evaluate_config
            console.log('data_eva', this._data.evaluate_config)
    }

        return
    }
*/

    refreshEvaluateConfig() {
        let evaluate_config 
        if(JSON.stringify(this._data.evaluate_config) !== "{}"){
            evaluate_config = this._data.evaluate_config
            console.log('1111')
            console.log(JSON.stringify(this._data.evaluate_config))
            //this.evaluate_config = this._data.evaluate_config
         }else{
            evaluate_config  = this.evaluate_config
        }

            const { nodes } = this.data
            nodes.forEach(elm => {
                const { category, key, name } = elm
                if (!evaluate_config[key]){
                    switch (category) {
                        case 'Lane':
                            evaluate_config[key] = deepcopy(default_evaluate_config['Lane'])
                            break;
                        case 'task':
                            evaluate_config[key] = deepcopy(default_evaluate_config['task'])
                            break
                        case 'start':
                        case 'end':
                            evaluate_config[key] = deepcopy(default_evaluate_config['event'])
                            break
                        case 'exclusive':
                        case 'parallel':
                            evaluate_config[key] = deepcopy(default_evaluate_config['gateway'])
                            break
                        case 'dataObject':
                            evaluate_config[key] = deepcopy(default_evaluate_config['dataObject'])
                        case 'resourceObject':
                            evaluate_config[key] = deepcopy(default_evaluate_config['resourceObject'])
                        case 'currencyObject':
                            evaluate_config[key] = deepcopy(default_evaluate_config['currencyObject'])
                    }
                    if (!evaluate_config[key]) {
                        evaluate_config[key] = {}
                    }
                    evaluate_config[key].name = name
                }
                
            });
            this._data.evaluate_config = evaluate_config
            console.log('data_eva', this._data.evaluate_config)
    
    }

    loadByJson(data) {
        this.loadData(data)
    }

    initDiagram(diagramDiv) {
        this.controller = new DiagramCtrler(diagramDiv, this.workspace, this)
        return this.controller
    }
    get diagram() {
        return this.controller && this.controller.diagram
    }
    loadData(data) {
        const newData = {
            config: data.config,
            nodes: {},
            links: {},
            fusion_args: {},
            evaluate_config: {},
            resource_config:{},
            elements: {}
        }
        data.nodes.forEach(node => {
            newData.nodes[node.key] = node
        })
        data.links.forEach(link => {
            newData.links[link.key] = link
        })
        newData.evaluate_config = data.evaluate_config
        newData.fusion_args = data.fusion_args
        newData.elements = data.elements
        newData.resource_config = data.resource_config
        //console.log(data, newData)
        this._data = newData
        this.drawModel()
    }

    drawModel() {
        if (this.controller) {
            this.controller.drawModel(this.data)
        }
    }

    get data() {
        //console.log('this._data.nodes',this._data.nodes)
        //console.log('nodes',Object.values(this._data.nodes))
        return {
            config: this._data.config,
            nodes: Object.values(this._data.nodes),
            links: Object.values(this._data.links),
            fusion_args: typeof (this._data.fusion_args) ==='undefined' ? {} : this._data.fusion_args,
            evaluate_config: typeof (this._data.evaluate_config) ==='undefined' ? {} : this._data.evaluate_config,
            resource_config: typeof (this._data.resource_config) ==='undefined' ? {} : this._data.resource_config,
            elements: typeof (this._data.elements) ==='undefined' ? {} : this._data.elements,
        }
    }

    toJson() {

        //console.log('====================patten----tojson',this.data)
        return this.data
    }

    modifyElement(data, type, isRemove = false) {
        let source = null;
        if (type === 'node') {
            source = "nodes"
        }
        if (type === 'link') {
            source = 'links'
        }
        if (isRemove) {
            delete this._data[source][data.key]
        } else {
            this._data[source][data.key] = data
        }
    }
}
