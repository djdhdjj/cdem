import { genUniqueID } from "../manager/commonFunction";
import PatternData from "./patternData";
import InstanceBase from "./Ontology/instanceBase";
import axios from "axios";
import { pageManage } from "../manager/PageManage";
import WatchJS from 'melanke-watchjs';

let backendURL='http://183.129.253.170:6051'

export default class Simulator{
    constructor(config, workspace){
        this.config = config || {}
        if(!this.config.id){
            this.config.id = genUniqueID()
        }

        let thisSimulator=this
        //挂载了个监视器，config.name一变化就会调用
        WatchJS.watch(thisSimulator,"config",function(prop, action, newvalue, oldvalue){
            thisSimulator.ask_sim_id(newvalue.name)
        })
        // this.service_pattern = new PatternData({},workspace)
        // this.service_pattern_name = undefined
        // this._service_pattern = undefined
        // this.pattern_instance_base  = undefined

        this.instance_base = new InstanceBase(workspace)
        this.instance_base.simulator = this
        this.pattern_instance_base = new InstanceBase(workspace)
        this.pattern_instance_base.simulator = this

        // 放点预制的数据
        // for (let index = 0; index < 10; index++) {
        //     let new_g = this.instance_base.createGroup()
        //     for(let index = 0; index < Math.random()*4; index++)
        //         new_g.createInstance()
        // }

        // for (let index = 0; index < 5; index++) {
        //     this.instance_base.createInstance()
        // }

        this.instance_base.simulator = this

        this.workspace = workspace
        this.work_service_pattern = workspace.service_pattern
        // 存储了模式之间的绑定关系
        this.node2binding_relations = {

        }

        this.intervalHandler = null
        this.simulateResultComponent=null
        //this.status = 'none' //仿真状态：suspend|stop|running|failed|none
        this.runtimeData={
            status:'none', //仿真状态：suspend|stop|running|failed|none
            completeStep:0,
            processArray:[],
            process:0,
            showStep:-1,
            showStepData:null
        }
        this.shareData={} //让组件往这里面存数据，如果组件销毁了，数据还能存在
        this.autoFetchStep=true
        this.sim_id = -1
        // console.log('simulator初始化')
        // console.log(this)
        // console.log(config)
        // console.log(this.config.name)
        this.ask_sim_id(this.config.name) // TODO
    }

    get service_pattern_name(){
        return this.service_pattern.name
    }

    toJson(){
         //console.log('tojsonsimu',this)
        // console.log(this.pattern_instance_base, this.pattern_instance_base.toJson())
        return {
            'config': this.config,
            'instance_base': this.instance_base.toJson(),
            'pattern_instance_base': this.pattern_instance_base.toJson(),
            'node2binding_relations': this.node2binding_relations,
            'service pattern': this.service_pattern.toJson(),
            'service_pattern_id': this.service_pattern_name,
        }
    }

    initPatternInstanceBase(){
        let {pattern_instance_base} = this
        pattern_instance_base.is_pattern = true  //属于服务模式的实例，不能删除
        pattern_instance_base.simulator = this
        const service_pattern_from_workspace = this.workspace.service_pattern
        //console.log('sp1',service_pattern_from_workspace)
        //console.log('sp2',this.service_pattern) 
        const s_data = this.service_pattern.data
        const {workspace} = this

        // 没有删除以前的
        s_data.nodes.forEach(elm => {
            // console.log(elm)
            const {category, type, name: id} = elm

            let new_i = pattern_instance_base.createInstance()

            new_i.type = [type].filter(elm => elm)
            new_i.id = id
            new_i.name = id

            
            let concept = workspace.findOntologyByIdName(type)
            
            if(concept && concept.props){
                concept.props.forEach(elm => {
                    new_i.data_properties[elm] = ''
                })
            }
            

        })
    }

    service_pattern_binding(patternName) {
        const sp = this.work_service_pattern
        let curpattern
        //console.log('!!!',sp[patternName])
        if(sp[patternName]!=undefined){
            curpattern = sp[patternName]
        }
        else{
            const fsp = this.workspace.fusion_pattern
            Object.keys(fsp).map((key)=>{
                const curfsp = fsp[key]
                const inter = curfsp.intermediate
                const final = curfsp.final
                if(inter[patternName]!=undefined){
                    curpattern = inter[patternName]
                }
                if(final[patternName]!=undefined){
                    curpattern = final[patternName]
                }
            })
            
        }
        //const pattern = this.workspace.service_pattern[patternName]
        const pattern = curpattern
        //console.log(pattern, patternName, this.workspace.service_pattern)
        if (pattern) {
            this.service_pattern = new PatternData({}, this.workspace)
            this.service_pattern.loadByJson(pattern.data)
            this.initPatternInstanceBase()
        }
    }


    get id(){
        return this.config.id
    }

    get name(){
        return this.config.name
    }

    loadByJson(data){
        // console.log(data, this)
        const {config, instance_base, name, node2binding_relations, pattern_instance_base, } = data
        this.config = config
        this.instance_base.loadByJson(instance_base)
        this.node2binding_relations = node2binding_relations
        this.pattern_instance_base.loadByJson(pattern_instance_base)
        this.service_pattern = new PatternData({}, this.workspace)
        this.service_pattern.loadByJson(data['service pattern'])

        // console.log(this)
        if(this.pattern_instance_base.instances.length ===0)
            this.initPatternInstanceBase()
    }

    // initBindingRelations(){
    //     const {node2binding_relations} =
    //     let pattern_data = this.service_pattern.data
    //     pattern_data.nodes.forEach( elm => {
    //         const {category, key, type} = elm

    //         if(!)
    //         this.node2binding_relations[key] = {
    //             'instances': []
    //         }
    //         if(!type){

    //         }
    //     });
    //     console.log(pattern_data)
    // }

    // 当打开“仿真过程”、“仿真结果”时，在这里注册一下
    reg(simulateResultComp){
        this.stopPolling()
        this.simulateResultComponent=simulateResultComp
        this.startPolling()
    }
    // 定时调用fetchStatus,ask_sim_id
    startPolling(sim_id){
        let _sim_id=sim_id
        if(sim_id==NaN || sim_id==undefined){
            _sim_id=this.sim_id
        }

        this.intervalHandler=setInterval(()=>{
            // TODO
            this.fetchStatus(_sim_id)
            this.ask_sim_id(this.config.name)
        },500)
    }
    stopPolling(){
        if(this.intervalHandler!=null){
            clearInterval(this.intervalHandler)
            this.intervalHandler=null
        }
    }
    refreshSimulateResultComponent(){
        if(this.simulateResultComponent!=null){
            this.simulateResultComponent.refresh()
        }
    }
    //下面是网络请求API调用
    ask_sim_id(simulatorName){
        axios.get(backendURL+'/api/simulate/query-by-name/'+simulatorName)
            .then((response)=>{
                //用于控制左侧导航
                if(response.data.status!='none'){
                    this.sim_id=response.data.sim_id
                    if(this.runtimeData.status!=response.data.status){
                        this.runtimeData.status=response.data.status
                        pageManage.refresh()
                    }
                }
                //pageManage.refresh()
        })
    }
    suspendSimulate(sim_id){
        axios.get(backendURL+'/api/simulate/'+sim_id+'/suspend-simulate')
    }
    continueSimulate(sim_id){
        axios.get(backendURL+'/api/simulate/'+sim_id+'/continue-simulate')
    }
    stopSimulate(sim_id){
        axios.get(backendURL+'/api/simulate/'+sim_id+'/stop-simulate')
    }
    stepOver(sim_id){
        axios.get(backendURL+'/api/simulate/'+sim_id+'/step-over')
    }
    addWatcher(sim_id,quotaName,code,type,callback){
        axios.post(backendURL+'/api/simulate/'+sim_id+'/watcher/add',{quotaName:quotaName,code:code,type:type})
            .then((resp)=>{
                
                if(callback!=undefined&&callback!=NaN){
                    callback(resp)
                }
            })
    }

    sum=(arr)=>{
        let s = 0
        for (var i=arr.length-1; i>=0; i--) {
            s += arr[i]
        }
        return s
    }

    fetchStatus(sim_id,callback){
        axios.get(backendURL+'/api/simulate/'+sim_id+'/status')
            .then((resp)=>{
                // 更新SimulateResult内容
                this.runtimeData.completeStep=resp.data.completeStep
                this.runtimeData.status=resp.data.status
                this.runtimeData.processArray=resp.data.processArray
                this.runtimeData.process = this.sum(resp.data.processArray)
                if(this.autoFetchStep==true){
                    this.fetchStep(sim_id,resp.data.processArray.length-1)
                }
                if(callback!=undefined){
                    callback(resp)
                }
                this.refreshSimulateResultComponent()
            })
    }
    //请求某帧（某步）内容
    fetchStep(sim_id,step){
        if(step>=0){
            axios.get(backendURL+'/api/simulate/'+sim_id+'/step/'+step)
            .then((resp)=>{
                //console.log("接收到step："+step+"的数据:")
                //console.log(resp)
                this.runtimeData.showStep=step
                this.runtimeData.showStepData=resp.data
                //this.runtimeData.process= 
            })
            /*axios.get(backendURL+'/api/simulate/'+sim_id+'/status')
            .then((resp)=>{
                this.runtimeData.processArray=resp.data.processArray
                this.runtimeData.process = this.sum(resp.data.processArray)
                if(this.autoFetchStep==true){
                    this.fetchStep(sim_id,resp.data.processArray.length-1)
                }
                this.refreshSimulateResultComponent()
            })*/
        }

    }

}
