import {strSimply, toLoc} from "../../../manager/commonFunction";
export default class OntologyData {
    constructor(ontologyGraph){
        this.ontologyGraph = ontologyGraph;
        this.relations = [];
        this.data={};
        this.data.elms={};
        this.data.elms.concept=[];
        this.data.elms.relation=[];
        this.data.elms.property=[];
    }

    draw_concept() {
        const elms = [];
        //初始化concept_data画图数据
        Object.keys(this.ontologyGraph.concept_data).forEach(key => {
            const bean_data = this.ontologyGraph.concept_data[key].bean_data
            const color = bean_data.graph_data.color
            elms.push({
                key: key,
                name: key,
                nameSimply: strSimply(key, 3),
                color: color ? color : "#fff",
                category:"Concept",
            })
            bean_data.Description.subClassOf.forEach(parent => {
                this.relations.push({
                    key: "has subclass:" + parent + "-" + key,
                    from: parent,
                    to: key,
                    text:"子概念"
                })
            })
        })
        this.data.elms.concept=elms;
    }
    draw_realtion(){
        const elms = [];
        //初始化relation画图数据
        Object.keys(this.ontologyGraph.relation_data).forEach(key => {
            const bean_data = this.ontologyGraph.relation_data[key].bean_data
            const color = bean_data.graph_data.color
            elms.push({
                key: key,
                name: key,
                nameSimply: strSimply(key, 3),
                color: color ? color : "#fff",
                category:"Relation",
            })
            let {domain}=bean_data.Description;
            if(typeof domain!="undefined"){
                domain.forEach(parent => {
                    this.relations.push({
                        key: "has relation:" + parent + "-" + key,
                        from: parent,
                        to: key,
                        text:"domain"
                    })
                })
            }
            let {range}=bean_data.Description;
            if(typeof range!="undefined"){
                range.forEach(parent => {
                    this.relations.push({
                        key: "has relation:" + parent + "-" + key,
                        from: parent,
                        to: key,
                        text: "包含"
                    })
                })
            }
            bean_data.Description.subPropertyOf.forEach(parent => {
                this.relations.push({
                    key: "has subPropertyOf:" + parent + "-" + key,
                    from: parent,
                    to: key,
                    text:"子属性"
                })
            })
        })
        this.data.elms.relation=elms;
    }
    draw_property(){
        //初始化property画图数据
        const elms = [];
        Object.keys(this.ontologyGraph.property_data).forEach(key => {
            const bean_data = this.ontologyGraph.property_data[key].bean_data
            const color = bean_data.graph_data.color
            elms.push({
                key: key,
                name: key,
                nameSimply: strSimply(key, 3),
                color: color ? color : "#fff",
                category:"Property",
            })
            let {domain}=bean_data.Description;
            if(typeof domain!="undefined"){
                domain.forEach(parent => {
                    this.relations.push({
                        key: "has relation:" + parent + "-" + key,
                        from: parent,
                        to: key,
                        text:"domain"
                    })
                })
            }
            // let {range}=bean_data.Description;
            // if(typeof range!="undefined"){
            //     range.forEach(parent => {
            //         this.relations.push({
            //             key: "has relation:" + parent + "-" + key,
            //             from: parent,
            //             to: key,
            //             text: parent + "-- has relation ->" + key
            //         })
            //     })
            // }
            bean_data.Description.subPropertyOf.forEach(parent => {
                this.relations.push({
                    key: "has subPropertyOf:" + parent + "-" + key,
                    from: parent,
                    to: key,
                    text: "子属性"
                })
            })
        })
        // this.diagram.model = new go.GraphLinksModel(this.elms, this.relations);
        // this.diagram.model.linkKeyProperty = 'key';
        this.data.elms.property=elms;
        this.data.relations=this.relations;
        return this.data;

    }
}
