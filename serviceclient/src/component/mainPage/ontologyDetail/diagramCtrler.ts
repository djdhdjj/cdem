import * as go from 'gojs';
import COLOR from '../../../data/Color';
import { panelLinkTemplateMap } from "../modelDetail/template/panelLinkTemplate.ts";
import {strSimply, toLoc} from "../../../manager/commonFunction";

const $ = go.GraphObject.make;

const reText = (source) => [
    $(go.TextBlock,
        {
            font: "10pt Helvetica, Arial, sans-serif",
            margin: 0,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            fromLinkable: false,
            toLinkable: false,
            // editable: true,
            stroke: "#fff"
        },
        new go.Binding("text", source).makeTwoWay()
    )
]
//一个普通的原型
const CircleNodeTemplate = (node_props) => {
    return $(go.Node, 'Auto',
        //new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Auto",
            $(go.Panel, "Auto",
                $(go.Shape, node_props,
                    { //第一个图案样式
                        width: 100,
                        height: 50,
                        stroke: null,
                        alignment: go.Spot.TopRight,
                        alignmentFocus: go.Spot.TopRight,
                        fill:"#1f2323",
                        strokeWidth: 1
                    },
                    new go.Binding('stroke', '', data => {
                        const color = data.color
                        return color || COLOR.GRIEGE
                    }),
                ),
                reText('name')
            ),
        ),
        // {contextMenu: nodeContextMenu(node_props, ['instance'])},
    )
};
const panelNodeTemplateMap = (node_props) => {
    let map = new go.Map<string, go.Node>();
    map.add("", CircleNodeTemplate(node_props));
    return map;
}


export default class DiagramCtrler {
    diagram = undefined
    ontologyGraph = undefined

    constructor(diagram, ontologyGraph) {
        this.diagram = diagram
        this.ontologyGraph = ontologyGraph
    }

    // 初始化go，可以传入自定义的参数
    init(diagram_props = {}, node_props = "", link_props = {}) {
        // this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
        this.diagram = $(go.Diagram, this.diagram,  // must name or refer to the DIV HTML element
            Object.assign({
                    linkTemplateMap: panelLinkTemplateMap,
                    layout: $(go.TreeLayout),
                },
                // diagram_props.props !== undefined ? diagram_props.props : {}
                ));
        //添加节点样式
        this.diagram.nodeTemplateMap.add("Concept",
            $(go.Node, "Spot",
                    $(go.Panel, "Auto",
                        $(go.Shape, "Ellipse", {
                            //minSize: new go.Size(80, 40),
                            width: 100,
                            height: 61.8,
                            stroke: null,
                            minSize: new go.Size(40, 40),
                            alignment: go.Spot.TopRight,
                            alignmentFocus: go.Spot.TopRight,
                            fill:"#506273",
                            strokeWidth: 1
                        },
                        new go.Binding('stroke', '', data => {
                            const color = data.color
                            return color || COLOR.GRIEGE
                        }),),
                        reText("name"),
                     )
                 )//go.Node的括号
         );
        this.diagram.nodeTemplateMap.add("Relation",
            $(go.Node, "Auto",
                    $(go.Panel, "Auto",
                        $(go.Shape, "Diamond", {
                            //minSize: new go.Size(80, 40),
                            width: 100,
                            height: 61.8,
                            stroke: null,
                            minSize: new go.Size(40, 40),
                            alignment: go.Spot.TopRight,
                            alignmentFocus: go.Spot.TopRight,
                            fill:"#506273",
                            strokeWidth: 1
                        },
                        new go.Binding('stroke', '', data => {
                            const color = data.color
                            return color || COLOR.GRIEGE
                        }),
                        ),
                        reText("name"),
                     )
                 )//go.Node的括号
         );
         this.diagram.nodeTemplateMap.add("Property",
         $(go.Node, "Spot",
                 $(go.Panel, "Auto",
                    $(go.Shape, "Octagon", {
                        // minSize: new go.Size(80, 40),
                         width: 100,
                         height:61.8,
                         stroke: null,
                         minSize: new go.Size(40, 40),
                         alignment: go.Spot.TopRight,
                         alignmentFocus: go.Spot.TopRight,
                         fill: "#506273",
                         strokeWidth: 1
                     },
                    new go.Binding('stroke', '', data => {
                        const color = data.color
                        return color || COLOR.GRIEGE
                    }),
                     ),
                    reText('name'),
                  )
              )//go.Node的括号
      );
    }
    relations = [];
    elms = []
    draw_concept() {
        this.elms=[];
        this.relations=[];
        //初始化concept_data画图数据
        Object.keys(this.ontologyGraph.concept_data).forEach(key => {
            const bean_data = this.ontologyGraph.concept_data[key].bean_data
            const color = bean_data.graph_data.color
            this.elms.push({
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
                    text: parent + "-- has subclass ->" + key
                })
            })
        })
    }
    draw_realtion(){
        //const elms=[];
        //初始化relation画图数据
        Object.keys(this.ontologyGraph.relation_data).forEach(key => {
            const bean_data = this.ontologyGraph.relation_data[key].bean_data
            const color = bean_data.graph_data.color
            this.elms.push({
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
                        text: parent + "-- has relation ->" + key
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
                        text: parent + "-- has relation ->" + key
                    })
                })
            }
            bean_data.Description.subPropertyOf.forEach(parent => {
                this.relations.push({
                    key: "has subPropertyOf:" + parent + "-" + key,
                    from: parent,
                    to: key,
                    text: parent + "-- has subPropertyOf ->" + key
                })
            })
        })
    }
    draw_property(){
        //初始化property画图数据
        Object.keys(this.ontologyGraph.property_data).forEach(key => {
            const bean_data = this.ontologyGraph.property_data[key].bean_data
            const color = bean_data.graph_data.color
            this.elms.push({
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
                        text: parent + "-- has relation ->" + key
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
                        text: parent + "-- has relation ->" + key
                    })
                })
            }
            bean_data.Description.subPropertyOf.forEach(parent => {
                this.relations.push({
                    key: "has subPropertyOf:" + parent + "-" + key,
                    from: parent,
                    to: key,
                    text: parent + "-- has subPropertyOf ->" + key
                })
            })
        })
        this.diagram.model = new go.GraphLinksModel(this.elms, this.relations);
        this.diagram.model.linkKeyProperty = 'key';
    }
    //画出新添加的边和节点。
    draw_addconcept(name){
        let elm={};
        const bean_data = name.bean_data
        const color = bean_data.graph_data.color
        console.log(name.key);
        elm={
            key: name.key,
            name: name.key,
            nameSimply: strSimply(name.key, 3),
            color: color ? color : "#fff",
            category:"Concept",
        }
        this.diagram.model.addNodeData(elm);
        bean_data.Description.subClassOf.forEach(parent => {
            this.diagram.model.addLinkData({
                key: "has subclass:" + parent + "-" + name.key,
                from: parent,
                to: name.key,
                text: parent + "-- has subclass ->" + name.key
            })
        })
    }

    draw_addrealtion(name){
            const bean_data = name.bean_data
            const color = bean_data.graph_data.color
            //添加新的节点
            this.diagram.model.addNodeData({
                key: name.key,
                name:name.key,
                nameSimply: strSimply(name.key, 3),
                color: color ? color : "#fff",
                category:"Relation",
            });
            //添加节点关联的边
            // let {domain}=bean_data.Description;
            // if(typeof domain!="undefined"){
            //     domain.forEach(parent => {
            //         this.diagram.model.addLinkData({
            //             key: "has relation:" + parent + "-" + name.key,
            //             from: parent,
            //             to: name.key,
            //             text: parent + "-- has relation ->" + name.key
            //         })
            //     })
            // }
            // let {range}=bean_data.Description;
            // if(typeof range!="undefined"){
            //     range.forEach(parent => {
            //         this.diagram.model.addLinkData({
            //             key: "has relation:" + parent + "-" + name.key,
            //             from: parent,
            //             to: name.key,
            //             text: parent + "-- has relation ->" + name.key
            //         })
            //     })
            // }
            bean_data.Description.subPropertyOf.forEach(parent => {
                this.diagram.model.addLinkData({
                    key: "has relation:" + parent + "-" + name.key,
                    from: name.key,
                    to: parent,
                    text: parent + "-- has relation ->" + name.key
                })
            })
    }
    draw_addproperty(name){
        const bean_data = name.bean_data
        const color = bean_data.graph_data.color
        this.diagram.model.addNodeData({
            key: name.key,
            name:name.key,
            nameSimply: strSimply(name.key, 3),
            color: color ? color : "#fff",
            category:"Property",
        });
        // let {domain}=bean_data.Description;
        // if(typeof domain!="undefined"){
        //     domain.forEach(parent => {
        //         this.diagram.model.addLinkData({
        //             key: "has relation:" + parent + "-" + name.key,
        //             from: parent,
        //             to: name.key,
        //             text: parent + "-- has relation ->" + name.key
        //         })
        //     })
        // }
        // let {range}=bean_data.Description;
        // if(typeof range!="undefined"){
        //     range.forEach(parent => {
        //         this.diagram.model.addLinkData({
        //             key: "has relation:" + parent + "-" + name.key,
        //             from: parent,
        //             to: name.key,
        //             text: parent + "-- has relation ->" + name.key
        //         })
        //     })
        // }
        bean_data.Description.subPropertyOf.forEach(parent => {
            this.diagram.model.addLinkData({
                key: "has subPropertyOf:" + parent + "-" + name.keykey,
                from: parent,
                to: name.key,
                text: parent + "-- has subPropertyOf ->" + name.key
            })
        })
}
    // forceSimulation(diagram = this.diagram, setLoc = null) {
    //     const nodes = diagram.model.nodeDataArray
    //     const links = diagram.model.linkDataArray
    //     const forceSimulation = new ForceSimulation(nodes, links);
    //     forceSimulation.onTicks((nodes, links) => {
    //         this.diagram.model.startTransaction("forceSimulation");
    //         // console.log(nodes)
    //         this.diagram.model.nodeDataArray.forEach(elm => {
    //             const node = forceSimulation.find(elm)
    //             if (node && !node.isGroup) {
    //                 this.diagram.model.setDataProperty(elm, 'loc', toLoc(node));
    //             }
    //         })
    //         this.diagram.model.commitTransaction("forceSimulation");
    //         this.diagram.zoomToFit()
    //     })
    //     forceSimulation.onEnd(() => {
    //         this.diagram.zoomToFit()
    //     })
    // }
}
