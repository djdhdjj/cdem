import * as go from 'gojs';
import COLOR, { elmType2Color } from '../../../../data/Color';
const $ = go.GraphObject.make;

const linkColor = COLOR.GRIEGE
const sequenceLinkTemplate =
    $(go.Link,
        {
            contextMenu: $<go.Adornment>('ContextMenu',
                {visible: true},
                new go.Binding('visible', '', function (d) {
                    return !!d.yesOrNo;
                }),
                $('ContextMenuButton',
                    $(go.TextBlock, "Set Yes",
                        { margin: 8, },
                    ),
                    {
                        click: (e, obj) => {
                            const contextmenu = obj.part
                            const part = contextmenu.adornedPart
                            const data = part.data
                            const model = obj.diagram.model
                            model.startTransaction("change" + data.key);
                            model.setDataProperty(data, 'controlFlowYes', true);
                            model.setDataProperty(data, 'controlFlowNo', false);
                            model.commitTransaction("change" + data.key);
                        }
                    }
                ),
                $('ContextMenuButton',
                    $(go.TextBlock, "Set No",
                        { margin: 8, },
                    ),
                    {
                        click: (e, obj) => {
                            const contextmenu = obj.part
                            const part = contextmenu.adornedPart
                            const data = part.data
                            const model = obj.diagram.model
                            model.startTransaction("change" + data.key);
                            model.setDataProperty(data, 'controlFlowYes', false);
                            model.setDataProperty(data, 'controlFlowNo', true);
                            model.commitTransaction("change" + data.key);
                        }
                    }
                )
                ),
            routing: go.Link.AvoidsNodes, curve: go.Link.JumpGap, corner: 10,
            // fromSpot: go.Spot.RightSide, toSpot: go.Spot.LeftSide,
            reshapable: true, relinkableFrom: true, relinkableTo: true, toEndSegmentLength: 20
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, { stroke: linkColor, strokeWidth: 1 }),
        $(go.Shape, { toArrow: 'Triangle', scale: 1.2, fill: linkColor, stroke: null }),
        $(go.Shape, { fromArrow: '', scale: 1.5, stroke: linkColor, fill: 'white' },
            new go.Binding('fromArrow', 'isDefault', function (s) {
                if (s === null) return '';
                return s ? 'BackSlash' : 'StretchedDiamond';
            }),
            new go.Binding('segmentOffset', 'isDefault', function (s) {
                return s ? new go.Point(5, 0) : new go.Point(0, 0);
            })),
        $(go.TextBlock, { // this is a Link label
                name: 'Label', editable: false, text: 'label', segmentOffset: new go.Point(-10, -10), //visible: false
                stroke: "#fff"
            },
            new go.Binding('text', '', function (d) {
                if (d.controlFlowYes) return "YES"
                if (d.controlFlowNo) return "NO"
            }),
            new go.Binding('visible', 'visible').makeTwoWay())
    );
const dataAssociationLinkTemplate =
    $(go.Link,
        {
            routing: go.Link.AvoidsNodes, curve: go.Link.JumpGap, corner: 10,
            fromSpot: go.Spot.AllSides, toSpot: go.Spot.AllSides,
            reshapable: true, relinkableFrom: true, relinkableTo: true
        },
        new go.Binding('points').makeTwoWay(),
        $(go.Shape, { stroke: linkColor, strokeWidth: 1, strokeDashArray: [1, 3] }),
        $(go.Shape, { toArrow: 'OpenTriangle', scale: 1, fill: null, stroke: linkColor })
    );
const object2map = (object) => {
    let map = new go.Map<string, go.Link>();
    for (let key in object) {
        map.add(key, object[key])
    }
    return map
}
const panelLinkTemplateMap = object2map({
    '': sequenceLinkTemplate,
    'controlFlow': sequenceLinkTemplate,

    'resourceFlowOut': dataAssociationLinkTemplate,
    'resourceFlowIn': dataAssociationLinkTemplate,
    'currencyFlowOut': dataAssociationLinkTemplate,
    'currencyFlowIn': dataAssociationLinkTemplate,
    'dataFlowOut': dataAssociationLinkTemplate,
    'dataFlowIn': dataAssociationLinkTemplate,
})
export {
    panelLinkTemplateMap
}
