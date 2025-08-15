import * as go from 'gojs';
import { panelNodeTemplate } from './ElmTemplate.ts';
import { panelLinkTemplate } from './LinkTemplate.ts';
import ForceSimulation from '../../../manager/forceSimulation';
import {createUniqueId} from '../../../data/metaData'
import {strSimply, toLoc} from "../../../manager/commonFunction";
import { META } from '../../../data/metaData';
const $ = go.GraphObject.make;


// 所有控制器的父类
export default class DiagramCtrler {
    diagram = undefined
    modelDscp = undefined

    constructor(diagram, modelDscp) {
        this.diagram = diagram
        this.modelDscp = modelDscp
    }


    // 初始化go，可以传入自定义的参数
    init(diagram_props = {}, node_props = {}, link_props = {}) {
        // this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
        const diagram = $(go.Diagram, this.diagram,  // must name or refer to the DIV HTML element
            Object.assign({
                    // 右键弹框
                    // contextMenu: diagramContextMenu,
                    // maxSelectionCount: 1,
                    nodeTemplateMap: panelNodeTemplate(node_props),
                    linkTemplateMap: panelLinkTemplate(link_props),
                    // groupTemplate: groupTemplate,
                    isReadOnly: true,
                    // linkingTool: new BPMNLinkingTool(), // defined in BPMNConceptes.js
                    // relinkingTool: new BPMNRelinkingTool(), // defined in BPMNConceptes.js
                    // 加格子
                    // grid: $(go.Panel, "Grid",
                    //   $(go.Shape, "LineH", { stroke: "#d3d3d3ab", strokeWidth: 0.5 }),
                    //   $(go.Shape, "LineH", { stroke: "lightgray", strokeWidth: 0.5, interval: 10 }),
                    //   $(go.Shape, "LineV", { stroke: "#d3d3d3ab", strokeWidth: 0.5 }),
                    //   $(go.Shape, "LineV", { stroke: "lightgray", strokeWidth: 0.5, interval: 10 })
                    // ),
                    // "draggingTool.dragsLink": true,
                    "draggingTool.isGridSnapEnabled": true,
                    "linkingTool.isUnconnectedLinkValid": false,
                    "linkingTool.portGravity": 40,
                    "relinkingTool.isUnconnectedLinkValid": false,
                    "relinkingTool.portGravity": 40,
                    "relinkingTool.fromHandleArchetype":
                        $(go.Shape, "Diamond", {
                            segmentIndex: 0,
                            cursor: "pointer",
                            desiredSize: new go.Size(8, 8),
                            fill: "tomato",
                            stroke: "darkred"
                        }),
                    "relinkingTool.toHandleArchetype":
                        $(go.Shape, "Diamond", {
                            segmentIndex: -1,
                            cursor: "pointer",
                            desiredSize: new go.Size(8, 8),
                            fill: "darkred",
                            stroke: "tomato"
                        }),
                    "linkReshapingTool.handleArchetype":
                        $(go.Shape, "Diamond", {desiredSize: new go.Size(7, 7), fill: "lightblue", stroke: "deepskyblue"}),
                    "rotatingTool.handleAngle": 270,
                    "rotatingTool.handleDistance": 30,
                    "rotatingTool.snapAngleMultiple": 15,
                    "rotatingTool.snapAngleEpsilon": 15,
                    "undoManager.isEnabled": true
                },
                diagram_props.props !== undefined ? diagram_props.props : {}
            )
        );
        this.diagram = diagram
    }

    drawModelDscp() {
        console.log(this.modelDscp)
        const elms = []
        const relations = []
        Object.keys(this.modelDscp.elm_bean).forEach(elm_bean => {
            const color = this.modelDscp.elm_bean[elm_bean].bean_data.graph_data.color
            elms.push({
                key: elm_bean,
                name: elm_bean,
                nameSimply: strSimply(elm_bean, 3),
                color: color ? color : "#fff"
            })
        })
        Object.keys(this.modelDscp.rel_bean).forEach(rel_bean => {
            const domain = this.modelDscp.rel_bean[rel_bean].bean_data.constrains.domain
            const range = this.modelDscp.rel_bean[rel_bean].bean_data.constrains.range
            if (domain && domain.length > 0 && range && range.length > 0) {
                domain.forEach(d => {
                    range.forEach(r => {
                        relations.push({
                            key: rel_bean + d + r,
                            from: d,
                            to: r,
                            text: rel_bean + ':(domain:' + domain +') -> (range:' + range + ')'
                        })
                    })
                })
            }
        })
        // this.modelDscp.elms.forEach(elm => {
        //     elms.push({
        //         key: elm.id,
        //         name: elm.name,
        //         nameSimply: elm.name ? strSimply(elm.name, 3) : '',
        //         category: elm.class_name,
        //         elm: elm,
        //         error: !elm.checkValid(),
        //         loc: elm.getGraphData('loc')
        //     })
        // })
        // this.modelDscp.relations.forEach(relation => {
        //     relations.push({
        //         key: relation.id,
        //         from: relation.source.id,
        //         to: relation.target.id,
        //         category: relation.class_name,
        //         relation: relation
        //     })
        // })
        this.diagram.model = new go.GraphLinksModel(elms, relations);
        this.diagram.model.linkKeyProperty = 'key'
        // 计算力引导
        this.forceSimulation()
    }

    forceSimulation(diagram = this.diagram, setLoc = null) {
        const nodes = diagram.model.nodeDataArray
        const links = diagram.model.linkDataArray
        const forceSimulation = new ForceSimulation(nodes, links)
        forceSimulation.onTicks((nodes, links) => {
            this.diagram.model.startTransaction("forceSimulation");
            // console.log(nodes)
            this.diagram.model.nodeDataArray.forEach(elm => {
                const node = forceSimulation.find(elm)
                if (node && !node.isGroup) {
                    this.diagram.model.setDataProperty(elm, 'loc', toLoc(node));
                }
            })
            this.diagram.model.commitTransaction("forceSimulation");
            this.diagram.zoomToFit()
        })
        forceSimulation.onEnd(() => {
            this.diagram.zoomToFit()
        })
    }

}
