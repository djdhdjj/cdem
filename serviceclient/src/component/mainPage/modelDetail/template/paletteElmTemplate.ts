
// 整理存着各种要素的模板

import * as go from 'gojs';
import 'gojs/extensions/Figures'
import COLOR, { elmType2Color, carrier2Color } from '../../../../data/Color';


const $ = go.GraphObject.make;
const EventNodeSize = 53;
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

const startNodeTemplate =
    $(go.Node, 'Vertical',
        $(go.Panel, 'Spot',
            $(go.Shape, 'Circle',  // Outer circle
                {
                    strokeWidth: 1,
                    stroke: EventDimensionStrokeColor,
                    name: 'SHAPE',
                    desiredSize: new go.Size(EventNodeSize, EventNodeSize),
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
                    fill: EventBackgroundColor
                },
            ),  // end main shape
        ),  // end Auto Panel
        $(go.TextBlock,
            { alignment: go.Spot.Center, textAlign: 'center', margin: 5, editable: true, text: '开始' },
            new go.Binding('text').makeTwoWay())

    );

const endNodeTemplate =
    $(go.Node, 'Vertical',
        $(go.Panel, 'Spot',
            $(go.Shape, 'Circle',  // Outer circle
                {
                    strokeWidth: EventNodeStrokeWidthIsEnd,
                    stroke: EventDimensionStrokeEndColor,
                    name: 'SHAPE',
                    desiredSize: new go.Size(EventNodeSize, EventNodeSize),
                    portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
                    fill: EventEndOuterFillColor
                },
            ),  // end main shape
        ),  // end Auto Panel
        $(go.TextBlock,
            { alignment: go.Spot.Center, textAlign: 'center', margin: 5, editable: true, text: '结束' },
            new go.Binding('text').makeTwoWay())

    );

const palscale = 2;
const taskNodeTemplate =
    $(go.Node, 'Vertical',
        {
            locationObjectName: 'SHAPE',
            locationSpot: go.Spot.Center,
            selectionAdorned: false
        },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            {
                name: 'PANEL',
                desiredSize: new go.Size(ActivityNodeWidth / palscale, ActivityNodeHeight / palscale)
            },
            $(go.Shape, 'Rectangle',  // the outside rounded rectangle
                {
                    name: 'SHAPE',
                    // fill: ActivityNodeFill, stroke: ActivityNodeStroke,
                    fill: 'white', stroke: COLOR.LIGHT_BLACK,
                    parameter1: 10 / palscale,  // corner size (default 10)
                    strokeWidth: 1
                },
            ),
            $(go.Shape, "Rectangle", {
                    strokeWidth: 1,
                    stroke: 'black',
                    alignment: go.Spot.TopLeft,
                    alignmentFocus: go.Spot.TopLeft,
                    width: 10,
                    height: 10,
                    fill: carrier2Color['Default']
                },
            )
        ), // End Spot panel
        $(go.TextBlock,  // the center text
            { alignment: go.Spot.Center, textAlign: 'center', margin: 2, 'text': '任务' },
            // new go.Binding('text', 'category')
        )
    );  // End Node

const gatewayNodeTemplateForPalette =
    $(go.Node, 'Vertical',
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
                    desiredSize: new go.Size(60, 60)
                    // desiredSize: new go.Size(GatewayNodeSize / 2, GatewayNodeSize / 2)
                }),
            $(go.Shape, 'NotAllowed',
                {
                    // 妥协改版
                    alignment: go.Spot.Center,
                    stroke: GatewayNodeSymbolStroke,
                    strokeWidth: 0, //GatewayNodeSymbolStrokeWidth,
                    fill: GatewayNodeSymbolStroke, //GatewayNodeSymbolFill,
                    desiredSize: new go.Size(30, 30)
                    // desiredSize: new go.Size(GatewayNodeSymbolSize / 2, GatewayNodeSymbolSize / 2)
                },
                new go.Binding('figure', 'category', function (s) {
                    return s === 'parallel' ?  'ThinCross' : (s === 'exclusive' ? 'ThinX' : 'NotAllowed')
                }),
                new go.Binding('strokeWidth', 'category', function (s) {
                    return s === 'parallel' ?  0 : (s === 'exclusive' ? 5 : 0)
                }),
                new go.Binding('desiredSize', 'category', function (s) {
                    return s === 'parallel' ?  new go.Size(30, 30) : new go.Size(20, 20)
                }),
            )
        ),

        $(go.TextBlock,
            { alignment: go.Spot.Center, textAlign: 'center', margin: 5, editable: false },
            new go.Binding('text', 'category', function (s) {
                return s === 'parallel' ?  '并行网关' : '互斥网关'
            }))
    );

// const dataObjectNodeTemplate =
//     $(go.Node, 'Vertical',
//         { locationObjectName: 'SHAPE', locationSpot: go.Spot.Center },
//         new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
//         $(go.Panel, 'Spot',
//             $(go.Shape, 'File',
//                 {
//                     name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
//                     fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize)
//                 }),
//         ),
//         $(go.TextBlock,
//             {
//                 margin: 5,
//                 editable: true
//             },
//             new go.Binding('text').makeTwoWay())
//     );

const dataObjectNodeTemplate =
    $(go.Node, 'Vertical',
        { locationObjectName: 'SHAPE', locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'File',
                {
                    name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize)
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
        $(go.TextBlock,
            {
                margin: 5,
                editable: true,
                'text':'数据'
            },
            )
    );


const currencyObjectNodeTemplate =
    $(go.Node, 'Vertical',
        { locationObjectName: 'SHAPE', locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'File',
                {
                    name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize)
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
        $(go.TextBlock,
            {
                margin: 5,
                editable: true,
                'text':'资金'
                
            },
            //new go.Binding('text').makeTwoWay()
            )
    );

const resourceObjectNodeTemplate =
    $(go.Node, 'Vertical',
        { locationObjectName: 'SHAPE', locationSpot: go.Spot.Center },
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
            $(go.Shape, 'File',
                {
                    name: 'SHAPE', portId: '', fromLinkable: true, toLinkable: true, cursor: 'pointer',
                    fill: DataFill, desiredSize: new go.Size(EventNodeSize * 0.8, EventNodeSize)
                }),
        ),
        $(go.TextBlock,
            {
                margin: 5,
                editable: true,
                'text':'资源'
            },
            //new go.Binding('text').makeTwoWay()
            )
    );




const object2map = (object) => {
    let map = new go.Map<string, go.Node>();
    for (let key in object) {
        map.add(key, object[key])
    }
    return map
}
// 在画布上的要素模板
const eventNodeTemplateMap = object2map({
    'start': startNodeTemplate,
    'end': endNodeTemplate
})
const gatewayNodeTemplateMap = object2map({
    'parallel': gatewayNodeTemplateForPalette,
    'exclusive': gatewayNodeTemplateForPalette
})
const taskNodeTemplateMap = object2map({
    '': taskNodeTemplate,
})
const objectNodeTemplateMap = object2map({
    'dataObject': dataObjectNodeTemplate,
    'currencyObject': currencyObjectNodeTemplate,
    'resourceObject': resourceObjectNodeTemplate,
})

export {
    eventNodeTemplateMap,
    taskNodeTemplateMap,
    gatewayNodeTemplateMap,
    objectNodeTemplateMap
}

