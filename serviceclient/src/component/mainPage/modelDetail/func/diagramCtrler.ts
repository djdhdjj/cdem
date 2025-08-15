import * as go from 'gojs';
import { createUniqueId } from '../../../../data/metaData'
import { strSimply, parseLoc, genUniqueID } from "../../../../manager/commonFunction";
import META from '../../../../data/nameConfig';
import { panelNodeTemplateMap } from "../template/panelNodeTemplate.ts";
import { panelLinkTemplateMap } from "../template/panelLinkTemplate.ts";
import groupTemplateMap from '../template/panelGroupTemplate.ts';
import COLOR from '../../../../data/Color';

const $ = go.GraphObject.make;

export default class DiagramCtrler {
    diagram = undefined
    // ontologies = undefined
    diagram_props = undefined
    workspace = undefined
    patternData = undefined
    nameCount = {}
    nameSet = {}
    constructor(diagram, workspace, patternData) {
        this.diagram = diagram
        this.workspace = workspace
        this.patternData = patternData
        // this.ontologies = workspace.ontologies
    }


    // 初始化go，可以传入自定义的参数
    init(diagram_props, node_props) {
        const {workspace} = this
        const class_this = this
        this.diagram_props = diagram_props
        // These parameters need to be set before defining the templates.
        var MINLENGTH = 200;  // this controls the minimum length of any swimlane
        var MINBREADTH = 20;  // this controls the minimum breadth of any non-collapsed swimlane

        // some shared functions

        // this may be called to force the lanes to be laid out again 这可能会被调用以强制重新布置泳道
        function relayoutLanes() {
            diagram.nodes.each(function (lane) {
                if (!(lane instanceof go.Group)) return;
                if (lane.category === "Pool") return;
                lane.layout.isValidLayout = false;  // force it to be invalid
            });
            diagram.layoutDiagram();
        }

        // this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
        function relayoutDiagram() {
            diagram.layout.invalidateLayout();
            diagram.findTopLevelGroups().each(function (g) { if (g.category === "Pool") g.layout.invalidateLayout(); });
            diagram.layoutDiagram();
        }

        // compute the minimum size of a Pool Group needed to hold all of the Lane Groups
        function computeMinPoolSize(pool) {
            // assert(pool instanceof go.Group && pool.category === "Pool");
            var len = MINLENGTH;
            pool.memberParts.each(function (lane) {
                // pools ought to only contain lanes, not plain Nodes
                if (!(lane instanceof go.Group)) return;
                var holder = lane.placeholder;
                if (holder !== null) {
                    var sz = holder.actualBounds;
                    len = Math.max(len, sz.width);
                }
            });
            return new go.Size(len, NaN);
        }

        // compute the minimum size for a particular Lane Group
        function computeLaneSize(lane) {
            // assert(lane instanceof go.Group && lane.category !== "Pool");
            var sz = computeMinLaneSize(lane);
            if (lane.isSubGraphExpanded) {
                var holder = lane.placeholder;
                if (holder !== null) {
                    var hsz = holder.actualBounds;
                    sz.height = Math.max(sz.height, hsz.height);
                }
            }
            // minimum breadth needs to be big enough to hold the header
            var hdr = lane.findObject("HEADER");
            if (hdr !== null) sz.height = Math.max(sz.height, hdr.actualBounds.height);
            return sz;
        }

        // determine the minimum size of a Lane Group, even if collapsed
        function computeMinLaneSize(lane) {
            if (!lane.isSubGraphExpanded) return new go.Size(MINLENGTH, 1);
            return new go.Size(MINLENGTH, MINBREADTH);
        }


        // define a custom ResizingTool to limit how far one can shrink a lane Group
        function LaneResizingTool() {
            go.ResizingTool.call(this);
        }
        go.Diagram.inherit(LaneResizingTool, go.ResizingTool);

        LaneResizingTool.prototype.isLengthening = function () {
            return (this.handle.alignment === go.Spot.Right);
        };

        LaneResizingTool.prototype.computeMinSize = function () {
            var lane = this.adornedObject.part;
            // assert(lane instanceof go.Group && lane.category !== "Pool");
            var msz = computeMinLaneSize(lane);  // get the absolute minimum size
            if (this.isLengthening()) {  // compute the minimum length of all lanes
                var sz = computeMinPoolSize(lane.containingGroup);
                msz.width = Math.max(msz.width, sz.width);
            } else {  // find the minimum size of this single lane
                var sz = computeLaneSize(lane);
                msz.width = Math.max(msz.width, sz.width);
                msz.height = Math.max(msz.height, sz.height);
            }
            return msz;
        };

        LaneResizingTool.prototype.resize = function (newr) {
            var lane = this.adornedObject.part;
            if (this.isLengthening()) {  // changing the length of all of the lanes
                lane.containingGroup.memberParts.each(function (lane) {
                    if (!(lane instanceof go.Group)) return;
                    var shape = lane.resizeObject;
                    if (shape !== null) {  // set its desiredSize length, but leave each breadth alone
                        shape.width = newr.width;
                    }
                });
            } else {  // changing the breadth of a single lane
                go.ResizingTool.prototype.resize.call(this, newr);
            }
            relayoutDiagram();  // now that the lane has changed size, layout the pool again
        };
        // end LaneResizingTool class


        // define a custom grid layout that makes sure the length of each lane is the same
        // and that each lane is broad enough to hold its subgraph
        function PoolLayout() {
            go.GridLayout.call(this);
            this.cellSize = new go.Size(1, 1);
            this.wrappingColumn = 1;
            this.wrappingWidth = Infinity;
            this.isRealtime = false;  // don't continuously layout while dragging
            this.alignment = go.GridLayout.Position;
            // This sorts based on the location of each Group.
            // This is useful when Groups can be moved up and down in order to change their order.
            this.comparer = function (a, b) {
                var ay = a.location.y;
                var by = b.location.y;
                if (isNaN(ay) || isNaN(by)) return 0;
                if (ay < by) return -1;
                if (ay > by) return 1;
                return 0;
            };
        }
        go.Diagram.inherit(PoolLayout, go.GridLayout);

        PoolLayout.prototype.doLayout = function (coll) {
            var diagram = this.diagram;
            if (diagram === null) return;
            diagram.startTransaction("PoolLayout");
            var pool = this.group;
            if (pool !== null && pool.category === "Pool") {
                // make sure all of the Group Shapes are big enough
                var minsize = computeMinPoolSize(pool);
                pool.memberParts.each(function (lane) {
                    if (!(lane instanceof go.Group)) return;
                    if (lane.category !== "Pool") {
                        var shape = lane.resizeObject;
                        if (shape !== null) {  // change the desiredSize to be big enough in both directions
                            var sz = computeLaneSize(lane);
                            shape.width = (isNaN(shape.width) ? minsize.width : Math.max(shape.width, minsize.width));
                            shape.height = (!isNaN(shape.height)) ? Math.max(shape.height, sz.height) : sz.height;
                            var cell = lane.resizeCellSize;
                            if (!isNaN(shape.width) && !isNaN(cell.width) && cell.width > 0) shape.width = Math.ceil(shape.width / cell.width) * cell.width;
                            if (!isNaN(shape.height) && !isNaN(cell.height) && cell.height > 0) shape.height = Math.ceil(shape.height / cell.height) * cell.height;
                        }
                    }
                });
            }
            // now do all of the usual stuff, according to whatever properties have been set on this GridLayout
            go.GridLayout.prototype.doLayout.call(this, coll);
            diagram.commitTransaction("PoolLayout");
        };
        // end PoolLayout class

        const ctrl = this
        // this is called after nodes have been moved or lanes resized, to layout all of the Pool Groups again
        const diagram = $(go.Diagram, this.diagram,  // must name or refer to the DIV HTML element
            Object.assign(
                {
                    // 右键弹框
                    // contextMenu: diagramContextMenu,
                    // maxSelectionCount: 1,
                    nodeTemplateMap: panelNodeTemplateMap(node_props),
                    linkTemplateMap: panelLinkTemplateMap,
                    groupTemplateMap: groupTemplateMap,
                    // use a custom ResizingTool (along with a custom ResizeAdornment on each Group)
                    resizingTool: new LaneResizingTool(),
                    // use a simple layout that ignores links to stack the top-level Pool Groups next to each other
                    // layout: $(PoolLayout),
                    // don't allow dropping onto the diagram's background unless they are all Groups (lanes or pools)
                    mouseDragOver: function (e) {
                        if (!e.diagram.selection.all(function (n) { return n instanceof go.Group; })) {
                            e.diagram.currentCursor = 'not-allowed';
                        }
                    },
                    mouseDrop: function (e) {
                        // 静止拖拽到泳道图外
                        // if (!e.diagram.selection.all(function (n) { return n instanceof go.Group; })) {
                        //     e.diagram.currentTool.doCancel();
                        // }
                    },
                    // a clipboard copied node is pasted into the original node's group (i.e. lane).
                    "commandHandler.copiesGroupKey": true,
                    // automatically re-layout the swim lanes after dragging the selection
                    "SelectionMoved": function (e) {
                        relayoutDiagram()
                        let it = e.subject.iterator;
                        while (it.hasNext()) {
                            const item = it.value;
                            const {data} = item;
                            if (item instanceof go.Node) {
                                ctrl.patternData.modifyElement(data, 'node');
                            }
                            if (item instanceof  go.Link) {
                                ctrl.patternData.modifyElement(data, 'link');
                            }

                        }
                    },
                    "SelectionCopied": relayoutDiagram,
                    "animationManager.isEnabled": false,
                    // enable undo & redo
                    "undoManager.isEnabled": true,
                    "SelectionDeleted": function (e) {
                        let it = e.subject.iterator;
                        while (it.hasNext()) {
                            const item = it.value;
                            const {data} = item;
                            if (item instanceof go.Node) {
                                ctrl.patternData.modifyElement(data, 'node', true);
                            }
                            if (item instanceof  go.Link) {
                                ctrl.patternData.modifyElement(data, 'link', true);
                            }
                        }
                    },
                    "ExternalObjectsDropped": function (e) {
                        let it = e.subject.iterator;
                        while (it.hasNext()) {
                            const item = it.value;
                            const {category, data} = item;
                            const patternName = ctrl.patternData.name
                            const newKey = patternName + '/' + genUniqueID()
                            let type = undefined;
                            // let conceptPath = [];
                            switch (category) {
                                case 'start':
                                    type = 'BPMN概念/StartEvent' //ctrl.ontologies['BPMN概念'].concept_data['Event'];
                                    // conceptPath.push('BPMN概念');
                                    break;
                                case 'end':
                                    type = 'BPMN概念/EndEvent' //ctrl.ontologies['BPMN概念'].concept_data['Event'];
                                    // conceptPath.push('BPMN概念');
                                    break;
                                case 'parallel':
                                    type = 'BPMN概念/ParallelGateway' //ctrl.ontologies['BPMN概念'].concept_data['ParallelGateway'];
                                    // conceptPath.push('BPMN概念');
                                    break;
                                case 'exclusive':
                                    type = 'BPMN概念/ExclusiveGateWay' //ctrl.ontologies['BPMN概念'].concept_data['ExclusiveGateWay'];
                                    // conceptPath.push('BPMN概念');
                                    break;
                                case 'Pool':
                                    type = 'BPMN概念/LaneSet' //ctrl.ontologies['BPMN概念'].concept_data['LaneSet'];
                                    // conceptPath.push('BPMN概念');
                                    break;
                                case 'Lane':
                                    type = 'BPMN概念/Lane' //ctrl.ontologies['BPMN概念'].concept_data['Lane'];
                                    // conceptPath.push('BPMN概念');
                                    break;
                                case 'dataObject':
                                    // type = 'BPMN概念/dataObject' //ctrl.ontologies['基础领域概念库'].concept_data['dataObject'];
                                    // conceptPath.push('基础领域概念库');
                                    break;
                                case 'currencyObject':
                                    // type = 'BPMN概念/currencyObject' //ctrl.ontologies['基础领域概念库'].concept_data['currencyObject'];
                                    // conceptPath.push('基础领域概念库');
                                    break;
                                case'type' :
                                    break;
                                    // type = 'BPMN概念/Task' //ctrl.ontologies['BPMN概念'].concept_data['Task'];
                                    // conceptPath.push('BPMN概念');
                            }

                                // const ontology = ctrl.ontologies[conceptPath[0]]
                                // const addPath = (child) => {
                                //     console.log(workspace.findOntologyByIdName(child), child)
                                //     const subClassOf = workspace.findOntologyByIdName(child).subclasses
                                //     // .bean_data.Description.subClassOf
                                //     // workspace.findOntologyByIdName(child).bean_data.Description.subClassOf
                                //     // child.bean_data.Description.subClassOf
                                //     if (subClassOf && subClassOf.length > 0) {
                                //         // ontology.concept_data[]
                                //         addPath(subClassOf[0].id_name)
                                //     }
                                //     // .bean_data.class_name
                                //     conceptPath.push(child)
                                // }
                                // addPath(type)
                                // console.log(conceptPath)
                                // diagram_props.addConcept(conceptPath)

                            diagram.model.startTransaction("change" + item.key);
                            diagram.model.setDataProperty(data, 'key', newKey);
                            if (type) {
                                diagram.model.setDataProperty(data, 'type', type);
                                // diagram.model.setDataProperty(data, 'conceptPath', conceptPath);
                            }
                            let  count = ctrl.nameCount[type] === undefined ? 1 : (ctrl.nameCount[type]) + 1
                            let name = type + '-' + count;
                            while (ctrl.nameSet[name] !== undefined) {
                                count++;
                                name = type + '-' + count;
                            }
                            ctrl.nameCount[type] = count;
                            ctrl.nameSet[name] = name;
                            diagram.model.setDataProperty(data, 'name', name);
                            diagram.model.commitTransaction("change" + item.key);
                            ctrl.patternData.modifyElement(data, 'node');
                        }
                    },
                    "LinkDrawn": function (e) {
                        const {data} = e.subject
                        const {to, from} = data
                        const fromNode = ctrl.diagram.model.findNodeDataForKey(from)
                        const toNode = ctrl.diagram.model.findNodeDataForKey(to)
                        diagram.model.startTransaction("change" + data.key);
                        diagram.model.setDataProperty(data, 'key', ctrl.patternData.name + '/' + genUniqueID());
                        if (fromNode.category === 'dataObject') {
                            diagram.model.setDataProperty(data, 'category', 'dataFlowIn');
                        } else if (toNode.category === 'dataObject') {
                            diagram.model.setDataProperty(data, 'category', 'dataFlowOut');
                        } else if (fromNode.category === 'resourceObject') {
                            diagram.model.setDataProperty(data, 'category', 'resourceFlowIn');
                        } else if (toNode.category === 'resourceObject') {
                            diagram.model.setDataProperty(data, 'category', 'resourceFlowOut');
                        } else if (fromNode.category === 'currencyObject') {
                            diagram.model.setDataProperty(data, 'category', 'currencyFlowIn');
                        } else if (toNode.category === 'currencyObject') {
                            diagram.model.setDataProperty(data, 'category', 'currencyFlowOut');
                        } else {
                            diagram.model.setDataProperty(data, 'category', 'controlFlow');
                            if (fromNode.category === "exclusive") {
                                diagram.model.setDataProperty(data, 'yesOrNo', true);
                            }
                        }
                        diagram.model.commitTransaction("change" + data.key);
                        ctrl.patternData.modifyElement(data, 'link');
                    },
                    "LinkRelinked": function (e) {
                        const item = e.subject
                        const {data} = item
                        if (item instanceof go.Node) {
                            ctrl.patternData.modifyElement(data, 'node', true);
                        }
                        if (item instanceof  go.Link) {
                            ctrl.patternData.modifyElement(data, 'link', true);
                        }
                    },
                    "LinkReshaped": function (e) {
                        const item = e.subject
                        const {data} = item
                        if (item instanceof go.Node) {
                            ctrl.patternData.modifyElement(data, 'node', true);
                        }
                        if (item instanceof  go.Link) {
                            ctrl.patternData.modifyElement(data, 'link', true);
                        }
                    },
                    "ChangedSelection": function (e) {
                        if (ctrl.diagram_props && ctrl.diagram_props.handleSelectedChange) {
                            const selectedInstance = {}
                            e.subject.each(ins => {
                                if (ins.data.name) {
                                    selectedInstance[ins.data.name] = true
                                }
                            })
                            ctrl.diagram_props.handleSelectedChange(selectedInstance)
                        }
                    }
                }
            )
        );
        this.diagram = diagram

    // this is a Part.dragComputation function for limiting where a Node may be dragged
        // use GRIDPT instead of PT if DraggingTool.isGridSnapEnabled and movement should snap to grid
        function stayInGroup(part, pt, gridpt) {
            // don't constrain top-level nodes
            var grp = part.containingGroup;
            if (grp === null) return pt;
            // try to stay within the background Shape of the Group
            var back = grp.resizeObject;
            if (back === null) return pt;
            // allow dragging a Node out of a Group if the Shift key is down
            if (part.diagram.lastInput.shift) return pt;
            var p1 = back.getDocumentPoint(go.Spot.TopLeft);
            var p2 = back.getDocumentPoint(go.Spot.BottomRight);
            var b = part.actualBounds;
            var loc = part.location;
            // find the padding inside the group's placeholder that is around the member parts
            var m = grp.placeholder.padding;
            // now limit the location appropriately
            var x = Math.max(p1.x + m.left, Math.min(pt.x, p2.x - m.right - b.width - 1)) + (loc.x - b.x);
            var y = Math.max(p1.y + m.top, Math.min(pt.y, p2.y - m.bottom - b.height - 1)) + (loc.y - b.y);
            return new go.Point(x, y);
        }

        function groupStyle() {  // common settings for both Lane and Pool Groups
            return [
              {
                layerName: "Background",  // all pools and lanes are always behind all nodes and links
                background: "transparent",  // can grab anywhere in bounds
                movable: true, // allows users to re-order by dragging
                copyable: false,  // can't copy lanes or pools
                avoidable: false,  // don't impede AvoidsNodes routed Links
                minLocation: new go.Point(NaN, -Infinity),  // only allow vertical movement
                maxLocation: new go.Point(NaN, Infinity)
              },
              new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify)
            ];
          }

          // hide links between lanes when either lane is collapsed
          function updateCrossLaneLinks(group) {
            group.findExternalLinksConnected().each(function(l) {
              l.visible = (l.fromNode.isVisible() && l.toNode.isVisible());
            });
          }

          // each Group is a "swimlane" with a header on the left and a resizable lane on the right

          var laneEventMenu =  // context menu for each lane
              node_props === null ? null :
          $<go.Adornment>('ContextMenu',
              $('ContextMenuButton',
                  $(go.TextBlock, '添加泳道', { margin: 8, }),
                  // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
                  {
                      click: (e: go.InputEvent, obj: go.GraphObject) => {
                          addLaneEvent((obj.part as go.Adornment).adornedObject as go.Node);
                      }
                  }),
              $('ContextMenuButton',
                  $(go.TextBlock, '属性编辑', { margin: 8, }),
                  // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
                  {
                      click: (e: go.InputEvent, obj: go.GraphObject)=>{
                          const contextmenu = obj.part
                          const part = contextmenu.adornedPart
                          node_props.propsEdit(part.data)
                      }
                  })
          );

        var poolEventMenu =  // context menu for each lane
            node_props === null ? null :
            $<go.Adornment>('ContextMenu',
                $('ContextMenuButton',
                    $(go.TextBlock, 'Props Edit', { margin: 8, }),
                    // in the click event handler, the obj.part is the Adornment; its adornedObject is the port
                    {
                        click: (e: go.InputEvent, obj: go.GraphObject)=>{
                            const contextmenu = obj.part
                            const part = contextmenu.adornedPart
                            node_props.propsEdit(part.data)
                        }
                    })
            );

      // console.log(diagram, view_name)
      // Add a lane to pool (lane parameter is lane above new lane)
      const addLaneEvent = (lane: go.Node) => {
          diagram.startTransaction('addLane');
          if (lane != null && lane.data.category === 'Lane') {
              // create a new lane data object
              const shape = lane.findObject('SHAPE');
              const size = new go.Size(shape ? shape.width : MINLENGTH, MINBREADTH);
              const new_lane_data = {
                  category: 'Lane',
                  text: 'New Lane',
                  color: COLOR.LIGHT_BLACK,
                  stroke: COLOR.DIRTY_WHITE,
                  isGroup: true,
                  loc: go.Point.stringify(new go.Point(lane.location.x, lane.location.y + 1)), // place below selection
                  size: go.Size.stringify(size),
                  group: lane.data.group,
                  type:  'BPMN概念/Lane',  //ctrl.ontologies['BPMN概念'].concept_data[]
              };
              // and add it to the model
              //console.log('new_lane_data',new_lane_data)
            diagram.model.addNodeData(new_lane_data);
              //console.log('diagram',diagram)
            const patternName = ctrl.patternData.name
            const newKey = patternName + '/' + genUniqueID()
            diagram.model.setDataProperty(new_lane_data, 'key', newKey);
            const type = 'BPMN概念/LaneSet'
            diagram.model.setDataProperty(new_lane_data, 'type', 'BPMN概念/LaneSet');
            let  count = ctrl.nameCount[type] === undefined ? 1 : (ctrl.nameCount[type]) + 1
            let name = type + '-' + count;
            while (ctrl.nameSet[name] !== undefined) {
                count++;
                name = type + '-' + count;
            }
            ctrl.nameCount[type] = count;
            ctrl.nameSet[name] = name;
            diagram.model.setDataProperty(new_lane_data, 'name', name);
            ctrl.patternData.modifyElement(new_lane_data, 'node');
          }
          diagram.commitTransaction('addLane');
          
      }


          const swimLanesGroupTemplate =
            $(go.Group, "Horizontal", groupStyle(),
              {
                contextMenu: laneEventMenu,
                selectionObjectName: "SHAPE",  // selecting a lane causes the body of the lane to be highlit, not the label
                resizable: true, resizeObjectName: "SHAPE",  // the custom resizeAdornmentTemplate only permits two kinds of resizing
                layout: $(go.LayeredDigraphLayout,  // automatically lay out the lane's subgraph
                  {
                    isInitial: false,  // don't even do initial layout
                    isOngoing: false,  // don't invalidate layout when nodes or links are added or removed
                    direction: 0,
                    columnSpacing: 10,
                    layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
                  }),
                computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
                computesBoundsIncludingLinks: false,  // to reduce occurrences of links going briefly outside the lane
                computesBoundsIncludingLocation: true,  // to support empty space at top-left corner of lane
                handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
                mouseDrop: function(e, grp) {  // dropping a copy of some Nodes and Links onto this Group adds them to this Group
                //   if (!e.shift) return;  // cannot change groups with an unmodified drag-and-drop
                  // don't allow drag-and-dropping a mix of regular Nodes and Groups
                  if (!e.diagram.selection.any(function(n) { return n instanceof go.Group; })) {
                    var ok = grp.addMembers(grp.diagram.selection, true);
                    if (ok) {
                      updateCrossLaneLinks(grp);
                    } else {
                      grp.diagram.currentTool.doCancel();
                    }
                  } else {
                    e.diagram.currentTool.doCancel();
                  }
                  relayoutDiagram()
                },
                subGraphExpandedChanged: function(grp) {
                  var shp = grp.resizeObject;
                  if (grp.diagram.undoManager.isUndoingRedoing) return;
                  if (grp.isSubGraphExpanded) {
                    shp.height = grp._savedBreadth;
                  } else {
                    grp._savedBreadth = shp.height;
                    shp.height = NaN;
                  }
                  updateCrossLaneLinks(grp);
                }
              },
              new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),
              // the lane header consisting of a Shape and a TextBlock
              $(go.Panel, "Horizontal",
                {
                  name: "HEADER",
                  angle: 270,  // maybe rotate the header to read sideways going up
                  alignment: go.Spot.Center
                },
                $(go.Panel, "Horizontal",  // this is hidden when the swimlane is collapsed
                  new go.Binding("visible", "isSubGraphExpanded").ofObject(),
                  $(go.Shape, "Diamond",
                    { width: 8, height: 8, fill: "white" },
                    new go.Binding("fill", "color")),
                  $(go.TextBlock,  // the lane label
                    { font: "bold 13pt sans-serif", editable: false, margin: new go.Margin(2, 0, 0, 0), stroke: COLOR.DIRTY_WHITE, },
                    new go.Binding("text", "name").makeTwoWay())
                ),
                $("SubGraphExpanderButton", { margin: 5 })  // but this remains always visible!
              ),  // end Horizontal Panel
              $(go.Panel, "Auto",  // the lane consisting of a background Shape and a Placeholder representing the subgraph
                $(go.Shape, "Rectangle",  // this is the resized object
                  { name: "SHAPE", fill: COLOR.LIGHT_BLACK, stroke: COLOR.DIRTY_WHITE,},
                  new go.Binding("fill", "color"),
                  new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify)),
                $(go.Placeholder,
                  { padding: 12, alignment: go.Spot.TopLeft }),
                $(go.TextBlock,  // this TextBlock is only seen when the swimlane is collapsed
                  {
                    stroke: COLOR.DIRTY_WHITE,
                    name: "LABEL",
                    font: "bold 13pt sans-serif", editable: true,
                    angle: 0, alignment: go.Spot.TopLeft, margin: new go.Margin(2, 0, 0, 4)
                  },
                  new go.Binding("visible", "isSubGraphExpanded", function(e) { return !e; }).ofObject(),
                  new go.Binding("text", "name").makeTwoWay())
              )  // end Auto Panel
            );  // end Group
            diagram.groupTemplate = swimLanesGroupTemplate
          // define a custom resize adornment that has two resize handles if the group is expanded
          diagram.groupTemplate.resizeAdornmentTemplate =
            $(go.Adornment, "Spot",
              $(go.Placeholder),
              $(go.Shape,  // for changing the length of a lane
                {
                  alignment: go.Spot.Right,
                  desiredSize: new go.Size(7, 50),
                  fill: "lightblue", stroke: "dodgerblue",
                  cursor: "col-resize"
                },
                new go.Binding("visible", "", function(ad) {
                  if (ad.adornedPart === null) return false;
                  return ad.adornedPart.isSubGraphExpanded;
                }).ofObject()),
              $(go.Shape,  // for changing the breadth of a lane
                {
                  alignment: go.Spot.Bottom,
                  desiredSize: new go.Size(50, 7),
                  fill: "lightblue", stroke: "dodgerblue",
                  cursor: "row-resize"
                },
                new go.Binding("visible", "", function(ad) {
                  if (ad.adornedPart === null) return false;
                  return ad.adornedPart.isSubGraphExpanded;
                }).ofObject())
            );

          diagram.groupTemplateMap.add("Pool",
            $(go.Group, "Auto", groupStyle(),
              { // use a simple layout that ignores links to stack the "lane" Groups on top of each other
                layout: $(PoolLayout, { spacing: new go.Size(0, 0) })  // no space between lanes
              },
              $(go.Shape,
                { fill: COLOR.LIGHT_BLACK, stroke: COLOR.DIRTY_WHITE,},
                new go.Binding("fill", "color")),
              $(go.Panel, "Table",
                { defaultColumnSeparatorStroke: COLOR.DIRTY_WHITE,  contextMenu: poolEventMenu },
                $(go.Panel, "Horizontal",
                  { column: 0, angle: 270},
                  $(go.TextBlock,
                    { font: "bold 16pt sans-serif", editable: true, margin: new go.Margin(2, 0, 0, 0), stroke: COLOR.DIRTY_WHITE, },
                    new go.Binding("name").makeTwoWay()),
                ),
                $(go.Placeholder,
                  { column: 1 })
              )
            ));
        groupTemplateMap.add('Lane', swimLanesGroupTemplate)
    }



    drawModel(jsonData = undefined) {
        let nodes = []
        let links = []
        if (jsonData) {
            // nodes = jsonData.nodes.map(node => {
            //     // if (node.conceptPath) {
            //     //     this.diagram_props.addConcept(node.conceptPath)
            //     //     node.type = node.conceptPath[node.conceptPath.length - 1]
            //             // this.ontologies[node.conceptPath[0]]
            //             // .concept_data[node.conceptPath[node.conceptPath.length - 1]]
            //     // }
            //     if (node.participant) {
            //         node.participant = this.workspace.findOntologyByIdName(node.participant)
            //     }
            //     if (node.goal) {
            //         node.goal = node.goal.map(goal => this.workspace.findOntologyByIdName(goal))
            //     }
            //     return node
            // })
            nodes = jsonData.nodes
            nodes.forEach(node => {
                if (node.name) {
                    this.nameSet[node.name] = node.name
                }
            })
            links = jsonData.links
        }
        this.diagram.model = new go.GraphLinksModel(nodes, links);
        this.diagram.model.linkKeyProperty = 'key'
    }


    get structureTree() {
        const root = {
            ontologies: {}
        };
        this.diagram.model.nodeDataArray.forEach(node => {
            const { type } = node;
            if (type) {
                const str = type.split('/');
                const ontologyName = str[0];
                const conceptName = str[1];
                if (root.ontologies[ontologyName] ===null) {
                    root.ontologies[ontologyName] = {
                        conceptData: {},
                        child: {}
                    };
                }
                const child = root.ontologies[ontologyName].child;
                const conceptData = root.ontologies[ontologyName].conceptData;
                const ontology = this.workspace.ontologies[ontologyName];
                const build = (name) => {
                    if (conceptData[name] != null) {
                        return conceptData[name]
                    }
                    const item = {};
                    conceptData[name] = item;
                    const concept = ontology.concept_data[name];
                    const subClassOf = concept.bean_data.Description.subClassOf;
                    if (subClassOf.length ===0) {
                        child[name] = item;
                    } else {
                        subClassOf.forEach(parent => {
                            build(parent)[name] = item
                        })
                    }
                    return item;
                };
                build(conceptName);
            }
        });
        const getSub = (obj, onto) => {
            return Object.keys(obj).map(key => {
                return {
                    title: key,
                    key: onto + '/' + key,
                    children: getSub(obj[key], onto),
                }
            })
        }

        return Object.keys(root.ontologies).map(onto => {
            return {
                title: onto,
                key: onto,
                children: getSub(root.ontologies[onto].child, onto)
            }
        });
    }

}
