// 整理存着各种要素的模板

import * as go from 'gojs';
import 'gojs/extensions/Figures'
import COLOR, { elmType2Color } from '../../../data/Color';
import {createUniqueId, META} from '../../../data/metaData'
import {strSimply} from "../../../manager/commonFunction";
// 定义状态
// 选中的（有框）/未选中的
// 重点突出的(灰度)/没有重点突出的
// 填完的(虚线框，没有颜色)/没有填完的



const $ = go.GraphObject.make;
const custom_r = 75
const error_icon = 'M31.708 25.708c-0-0-0-0-0-0l-9.708-9.708 9.708-9.708c0-0 0-0 0-0 0.105-0.105 0.18-0.227 0.229-0.357 0.133-0.356 0.057-0.771-0.229-1.057l-4.586-4.586c-0.286-0.286-0.702-0.361-1.057-0.229-0.13 0.048-0.252 0.124-0.357 0.228 0 0-0 0-0 0l-9.708 9.708-9.708-9.708c-0-0-0-0-0-0-0.105-0.104-0.227-0.18-0.357-0.228-0.356-0.133-0.771-0.057-1.057 0.229l-4.586 4.586c-0.286 0.286-0.361 0.702-0.229 1.057 0.049 0.13 0.124 0.252 0.229 0.357 0 0 0 0 0 0l9.708 9.708-9.708 9.708c-0 0-0 0-0 0-0.104 0.105-0.18 0.227-0.229 0.357-0.133 0.355-0.057 0.771 0.229 1.057l4.586 4.586c0.286 0.286 0.702 0.361 1.057 0.229 0.13-0.049 0.252-0.124 0.357-0.229 0-0 0-0 0-0l9.708-9.708 9.708 9.708c0 0 0 0 0 0 0.105 0.105 0.227 0.18 0.357 0.229 0.356 0.133 0.771 0.057 1.057-0.229l4.586-4.586c0.286-0.286 0.362-0.702 0.229-1.057-0.049-0.13-0.124-0.252-0.229-0.357z'

const reText = () => [
    $(go.TextBlock,
        // new go.Binding("text", "key"),
        {
            font: "10pt Helvetica, Arial, sans-serif",
            margin: 10,
            maxSize: new go.Size(160, NaN),
            wrap: go.TextBlock.WrapFit,
            fromLinkable: false,
            toLinkable: false,
            // editable: true,
            stroke: "#fff"
        },
        new go.Binding("text", 'nameSimply').makeTwoWay()
    )
]

// 所有控件都包含的属性
const common_node_propety = (node_props) => [
    // new go.Binding("location", "location").makeTwoWay(),
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
    new go.Binding("portId").makeTwoWay(),
    new go.Binding('key', "id").makeTwoWay(),
    {
        fromLinkable: true,
        cursor: 'pointer',
        toLinkable: true,
        locationObjectName: 'SHAPE', locationSpot: go.Spot.Center,


        fromLinkableDuplicates: true,
        toLinkableDuplicates: true,

        fromSpot: go.Spot.AllSides,    // coming out from top side -- BAD!
        toSpot: go.Spot.AllSides,
    },
    {
        toolTip:
            $("ToolTip",
                $(go.TextBlock, { margin: 4 },
                    new go.Binding("text", "", function(data) {
                        return data.name
                    }))
            )
    }
]

const outter_props = { //第一个图案样式
    width: custom_r,
    height: custom_r,
    stroke: null,
    alignment: go.Spot.TopRight,
    alignmentFocus: go.Spot.TopRight,
    fill: COLOR.LIGHT_BLACK,
    strokeWidth: 2
}
const inner_props = { //第一个图案样式
    width: custom_r - 10,
    height: custom_r - 10,
    stroke: null,
    fill: null, // COLOR.LIGHT_BLACK,
    strokeWidth: 2
}

//一个普通的原型
const CircleNodeTemplate = (node_props) => {
    return $(go.Node, 'Auto',
        $(go.Panel, "Spot",
            $(go.Panel, "Spot",
                $(go.Shape, "Ellipse",
                    outter_props,
                    new go.Binding('stroke', 'color'),
                ),
                reText()
            ),
            $(go.Shape,
                { margin: 0, fill: COLOR.ORANGE, strokeWidth: 0,
                    width: 10,
                    height: 10,
                    alignment: go.Spot.TopRight,
                    alignmentFocus: go.Spot.TopRight,
                    geometry: go.Geometry.parse(error_icon, true)
                },
                new go.Binding('width', '', data => {
                    return data.error ? 10 : 0
                }),
            ),
        ),
        common_node_propety(node_props)
    )
}

const SetNodeTempplate = (node_props) => {
    return $(go.Node, 'Auto',
        $(go.Panel, "Auto",
            $(go.Shape, "Rectangle",
                {
                    width: custom_r * 2, height: custom_r / 1.5, margin: 4,
                },
                {fill: COLOR.LIGHT_BLACK, strokeWidth: 2},
                new go.Binding('stroke', '', data => {
                    const color = elmType2Color[data.category]
                    return color || COLOR.GRIEGE
                }),
            ),
        ),
        common_node_propety(node_props),
        $(go.TextBlock,
            // new go.Binding("text", "key"),
            {
                font: "10pt Helvetica, Arial, sans-serif",
                margin: 8,
                maxSize: new go.Size(160, NaN),
                wrap: go.TextBlock.WrapFit,
                fromLinkable: false,
                toLinkable: false,
                // editable: true,
                stroke: "#fff"
            },
            new go.Binding("text", 'name').makeTwoWay()
        )
    )
}

const object2map = (object) => {
    var map = new go.Map<string, go.Node>();
    for (let key in object) {
        map.add(key, object[key])
    }
    return map
}

// 在画布上的要素模板
const panelNodeTemplate = (node_props = {}) => {
    return object2map({
        '': CircleNodeTemplate(node_props),
        ResourceSet: SetNodeTempplate(node_props),
    })
}

export {
    panelNodeTemplate
}
