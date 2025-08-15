

// 整理存着各种要素的模板

import * as go from 'gojs';
import 'gojs/extensions/Figures'
import COLOR, { elmType2Color, carrier2Color } from '../../../../data/Color';
// import {nodeMenuBottom} from "../../../component/graph_components/template/ElmTemplate.ts";

const $ = go.GraphObject.make;
const EventNodeSize = 42;
const EventNodeInnerSize = EventNodeSize - 6;
const EventNodeSymbolSize = EventNodeInnerSize - 14;
const EventEndOuterFillColor = 'pink';
const GradientLightGreen = $(go.Brush, 'Linear', { 0: '#E0FEE0', 1: 'PaleGreen' });
const GradientLightGray = $(go.Brush, 'Linear', { 0: 'White', 1: '#DADADA' });
const EventBackgroundColor = GradientLightGreen;
const EventSymbolLightFill = 'white';
const EventSymbolDarkFill = 'dimgray';
const EventDimensionStrokeColor = 'green';
const EventDimensionStrokeEndColor = 'red';
const EventNodeStrokeWidthIsEnd = 4;

const ActivityNodeFill = $(go.Brush, 'Linear', { 0: 'OldLace', 1: 'PapayaWhip' });
const ActivityNodeStroke = '#CDAA7D';
const ActivityMarkerStrokeWidth = 1.5;
const ActivityNodeWidth = 120;
const ActivityNodeHeight = 80;
const ActivityNodeStrokeWidth = 1;
const ActivityNodeStrokeWidthIsCall = 4;

const GatewayNodeSize = 80;
const GatewayNodeSymbolSize = 42;
const GradientYellow = $(go.Brush, 'Linear', { 0: 'LightGoldenRodYellow', 1: '#FFFF66' });
const GatewayNodeFill = GradientYellow;
const GatewayNodeStroke = 'darkgoldenrod';
const GatewayNodeSymbolStroke = 'darkgoldenrod';
const GatewayNodeSymbolFill = GradientYellow;
const GatewayNodeSymbolStrokeWidth = 3;
const DataFill = GradientLightGray;

const nodeMenuBottom = (name, props = {},onClick = (e: go.InputEvent, obj: go.GraphObject)=>{}) =>
    $('ContextMenuButton',
        $(go.TextBlock, name,
            { margin: 8, },
        ),
        props,
        {
            click: onClick,
        }
    )

const typeText = () => [
    $(go.TextBlock,
        {
            font: "10pt Helvetica, Arial, sans-serif",
            // margin: 5,
            // maxSize: new go.Size(160, NaN),
            isMultiline: false,
            wrap: go.TextBlock.WrapFit,
            fromLinkable: false,
            toLinkable: false,
            // editable: true,
            stroke: "#fff"
        },
        new go.Binding("text", "type")
    )
]

const nameText = () => [
    $(go.TextBlock,
        {
            font: "10pt Helvetica, Arial, sans-serif",
            margin: 5,
            // maxSize: new go.Size(160, NaN),
            isMultiline: false,
            wrap: go.TextBlock.WrapFit,
            fromLinkable: false,
            toLinkable: false,
            editable: true,
            stroke: "#fff"
        },
        new go.Binding("text", "name", ).makeTwoWay(val => {
            if (val === undefined || val === null || val === '') return '未命名';
            // console.log(val);
            return val;
        })
    )
]

const startNodeTemplate = (node_props) => {
    return $(go.Node, 'Vertical',
        $(go.Panel, 'Spot',
            $(go.Shape, 'Circle',  // Outer circle
                {
                    strokeWidth: 1,
                    stroke: EventDimensionStrokeColor,
                    name: 'SHAPE',
                    desiredSize: new go.Size(EventNodeSize, EventNodeSize),
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    // fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
                    fill: EventBackgroundColor
                },
            ),  // end main shape
            {contextMenu: nodeContextMenu(node_props, ['propsEdit'])},
        ),  // end Auto Panel
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        typeText(),
        nameText()
    );
}
const endNodeTemplate = (node_props) => {
    return $(go.Node, 'Vertical',
        $(go.Panel, 'Spot',
            $(go.Shape, 'Circle',  // Outer circle
                {
                    strokeWidth: EventNodeStrokeWidthIsEnd,
                    stroke: EventDimensionStrokeEndColor,
                    name: 'SHAPE',
                    desiredSize: new go.Size(EventNodeSize, EventNodeSize),
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    // fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
                    fill: EventEndOuterFillColor
                },
            ),  // end main shape
            {contextMenu: nodeContextMenu(node_props, ['propsEdit'])},
        ),  // end Auto Panel
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        typeText(),
        nameText()
    );
}

const taskNodeTemplate = (node_props) => {
    return $(go.Node, 'Vertical',
        {
            locationObjectName: 'SHAPE', locationSpot: go.Spot.Center,
            resizable: true, resizeObjectName: 'PANEL',
            selectionAdorned: false,  // use a Binding on the Shape.stroke to show selection
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            {
                name: 'PANEL',
                minSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight),
                desiredSize: new go.Size(ActivityNodeWidth, ActivityNodeHeight)
            },
            $(go.Shape, 'Rectangle',  // the outside rounded rectangle
                {
                    name: 'SHAPE',
                    // fill: ActivityNodeFill, stroke: ActivityNodeStroke,
                    fill: 'white', stroke: COLOR.LIGHT_BLACK,
                    strokeWidth: 5,
                    parameter1: 10, // corner size
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    // fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide
                },
                new go.Binding('strokeWidth', 'isCall',
                    function (s) { return s ? ActivityNodeStrokeWidthIsCall : ActivityNodeStrokeWidth; }),

                {contextMenu: nodeContextMenu(node_props, ['taskBinding', 'propsEdit'])},
                // , 'propsEdit'
            ),
            $(go.Shape, "Rectangle", {
                    strokeWidth: 1,
                    stroke: 'black',
                    alignment: go.Spot.TopLeft,
                    alignmentFocus: go.Spot.TopLeft,
                    width: 30,
                    height: 30,
                },
                // Shape.fill is bound to Node.data.color
                new go.Binding("fill", "", data => {
                    const color = carrier2Color[data.carrier ? data.carrier : 'Default']
                    return color || carrier2Color['Default']
                }),
                {contextMenu: nodeContextMenu(node_props, ['carrierBinding'])}
            ),

            $(go.TextBlock,  // the center text
                {
                    alignment: go.Spot.Center, textAlign: 'center', margin: 12,
                    editable: false,
                    // stroke: "#000"
                },
                new go.Binding("text",'type'))
        ), // End Spot panel
        // typeText(),
        nameText()
    );  // End Node
}

const gatewayNodeTemplateForPalette = (node_props) => {
    return $(go.Node, 'Vertical',
        {
            resizable: false,
            locationObjectName: 'SHAPE',
            locationSpot: go.Spot.Center,
            resizeObjectName: 'SHAPE'
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'Diamond',
                {
                    // 妥协改版
                    strokeWidth: 3,//1,
                    fill: null, //GatewayNodeFill,

                    stroke: GatewayNodeStroke,
                    name: 'SHAPE',
                    desiredSize: new go.Size(60, 60),
                    // desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 2)
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    // fromSpot: go.Spot.NotLeftSide, toSpot: go.Spot.NotRightSide
                }),
            $(go.Shape, 'NotAllowed',
                {
                    alignment: go.Spot.Center,
                    stroke: GatewayNodeSymbolStroke,
                    strokeWidth: 0, //GatewayNodeSymbolStrokeWidth,
                    fill: GatewayNodeSymbolStroke, //GatewayNodeSymbolFill,
                    desiredSize: new go.Size(30, 30)
                    // desiredSize: new go.Size(GatewayNodeSymbolSize / 2, GatewayNodeSymbolSize / 2)
                },
                new go.Binding('figure', 'category', function (s) {
                    return s === 'parallel' ? 'ThinCross' : (s === 'exclusive' ? 'ThinX' : 'NotAllowed')
                }),
                new go.Binding('strokeWidth', 'category', function (s) {
                    return s === 'parallel' ? 0 : (s === 'exclusive' ? 5 : 0)
                }),
                new go.Binding('desiredSize', 'category', function (s) {
                    return s === 'parallel' ? new go.Size(30, 30) : new go.Size(20, 20)
                }),
            ),
            {contextMenu: nodeContextMenu(node_props, ['propsEdit'])},
        ),
        typeText(),
        nameText()
    );
}

const dataObjectNodeTemplate = (node_props) => {
    return $(go.Node, 'Vertical',
        {locationObjectName: 'SHAPE', locationSpot: go.Spot.Center},
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'File',
                {
                    name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize),
                    contextMenu: nodeContextMenu(node_props, ['dataBinding', 'propsEdit']),
                    // ['propsEdit']
                }),
                $(go.Shape, 'BPMNTaskMessage',
                {
                    alignment: go.Spot.TopLeft,
                    alignmentFocus: go.Spot.TopLeft,
                    width: 15,
                    height: 15,
                    fill: null
                }),
        ),
        typeText(),
        nameText()
    );
}

const currencyObjectNodeTemplate = (node_props) => {
    return $(go.Node, 'Vertical',
        {locationObjectName: 'SHAPE', locationSpot: go.Spot.Center},
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'File',
                {
                    name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize),
                    contextMenu: nodeContextMenu(node_props, ['currencyBinding', 'propsEdit']),
                    // ['propsEdit']
                }),
            $(go.TextBlock,
                {
                    alignment: go.Spot.TopLeft,
                    alignmentFocus: go.Spot.TopLeft,
                    margin: 5,
                    editable: false,
                    font: '20px sans-serif'
                },
                new go.Binding("text", "", data => '$'),
            )
        ),
        typeText(),
        nameText()
    );
}

const resourceObjectNodeTemplate = (node_props) => {
    return $(go.Node, 'Vertical',
        {locationObjectName: 'SHAPE', locationSpot: go.Spot.Center},
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'File',
                {
                    name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize),
                    contextMenu: nodeContextMenu(node_props, ['resourceBinding', 'propsEdit']),
                    // ['propsEdit']
                }),
        ),
        typeText(),
        nameText()
    );
}

// 创建右侧导航栏
const nodeContextMenu = (node_props, list) => {
    if (node_props === null) return null;
    let buttonList = list.map(buttonName => {
        // let select_event =
        // (e: go.InputEvent, obj: go.GraphObject)=>{
        //     const contextmenu = obj.part
        //     const part = contextmenu.adornedPart
        //     node_props.dataBinding(part.data)
        // }
        switch (buttonName) {
            // case 'currencyBinding': return nodeMenuBottom('选择', {}, select_event)
            case 'dataBinding': return nodeMenuBottom('选择数据', {}, (e, obj)=>{
                const contextmenu = obj.part
                const part = contextmenu.adornedPart
                node_props.dataBinding(part.data)
            })
            case 'resourceBinding': return nodeMenuBottom('选择资源', {}, (e, obj)=>{
                const contextmenu = obj.part
                const part = contextmenu.adornedPart
                node_props.resourceBinding(part.data)
            })
            case 'currencyBinding': return nodeMenuBottom('选择货币', {}, (e, obj)=>{
                const contextmenu = obj.part
                const part = contextmenu.adornedPart
                node_props.currencyBinding(part.data)
            })
            case 'taskBinding': return nodeMenuBottom('选择任务', {},  (e, obj)=>{
                const contextmenu = obj.part
                const part = contextmenu.adornedPart
                node_props.taskBinding(part.data)
            });

            //这个之后要没了
            case 'propsEdit':  return nodeMenuBottom('编辑属性',
                new go.Binding('visible', '', data => {
                    return data.type !== undefined
                }),
                (e, obj)=>{
                    const contextmenu = obj.part
                    const part = contextmenu.adornedPart
                    console.log('e,obj',e,obj)
                    node_props.propsEdit(part.data)
            });
            case 'carrierBinding': return nodeMenuBottom('选择载体', {},  (e, obj)=>{
                const contextmenu = obj.part
                const part = contextmenu.adornedPart
                node_props.carrierBinding(part.data)
            });
        }
    })
    return $<go.Adornment>('ContextMenu', buttonList)
}

//一个普通的原型
const CircleNodeTemplate = (node_props) => {
    return $(go.Node, 'Auto',
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, "Spot",
            $(go.Panel, "Spot",
                $(go.Shape, "Ellipse",
                    { //第一个图案样式
                        width: 75,
                        height: 75,
                        stroke: null,
                        alignment: go.Spot.TopRight,
                        alignmentFocus: go.Spot.TopRight,
                        fill: COLOR.LIGHT_BLACK,
                        strokeWidth: 2
                    },
                    new go.Binding('stroke', '', data => {
                        const color = elmType2Color[data.category]
                        return color || COLOR.GRIEGE
                    }),
                ),
                typeText(),
                nameText()
            ),
        ),
        // {contextMenu: nodeContextMenu(node_props, ['taskBinding'])},
    )
}
const object2map = (object) => {
    let map = new go.Map<string, go.Node>();
    for (let key in object) {
        map.add(key, object[key])
    }
    return map
}
// 在画布上的要素模板
const panelNodeTemplateMap = (node_props) => {
    return object2map({
        'start': startNodeTemplate(node_props),
        'end': endNodeTemplate(node_props),
        'parallel': gatewayNodeTemplateForPalette(node_props),
        'exclusive': gatewayNodeTemplateForPalette(node_props),
        //'ParticipantConcept': CircleNodeTemplate(node_props),
        // 'ResourceConcept': CircleNodeTemplate(node_props),
        'Participant': CircleNodeTemplate(node_props),
        // 'Resource': CircleNodeTemplate(node_props),
        'dataObject': dataObjectNodeTemplate(node_props),
        'currencyObject': currencyObjectNodeTemplate(node_props),
        'task': taskNodeTemplate(node_props),
        'resourceObject': resourceObjectNodeTemplate(node_props),
    })
}

export {
    panelNodeTemplateMap
}

