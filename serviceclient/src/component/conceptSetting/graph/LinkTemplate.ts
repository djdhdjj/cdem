// 这里存了所有的模板
import * as go from 'gojs';
import COLOR from '../../../data/Color';

const $ = go.GraphObject.make;

const linkSelectionAdornmentTemplate = //线选中之后的颜色
  $(go.Adornment, "Link",
    $(go.Shape,
      // isPanelMain declares that this Shape shares the Link.geometry
      { isPanelMain: true, fill: null, stroke: COLOR.WHITE, strokeWidth: 0 })  // use selection object's strokeWidth
  );


const common_link_propety = (link_props) => [
  // new go.Binding("points").makeTwoWay(),
  { selectable: true, selectionAdornmentTemplate: linkSelectionAdornmentTemplate },
  { relinkableFrom: false, relinkableTo: false, reshapable: true },
  // 防止交叉
  {
    // routing: go.Link.AvoidsNodes,
    corner: 4,
    curve: go.Link.JumpGap,
    // curve: go.Link.Bezier,
    // curve: go.Link.Scale,
    reshapable: true,
    resegmentable: true,
    relinkableFrom: false,
    relinkableTo: false,
  },
]

// 这里都是常用的连线
// 普通的连线
const commonLinkTemplate = (link_props) =>
  $(go.Link,       // the whole link panel
    common_link_propety(link_props),
    $(go.Shape, { fill: null, stroke: COLOR.WHITE, strokeWidth: 2 }),  //定义线的颜色
    // isPanelMain declares that this Shape shares the Link.geometry
    // { isPanelMain: true, fill: COLOR.WHITE, stroke: COLOR.WHITE, strokeWidth: 0 }
    // ),  // use selection object's strokeWidth
    $(go.TextBlock,
      {
        textAlign: "center",
        font: "10pt helvetica, arial, sans-serif",
        stroke: COLOR.WHITE,
        margin: 2,
        minSize: new go.Size(10, NaN),
        // editable: true
      },
      new go.Binding("text").makeTwoWay(),
      // new go.Binding('text', '', data => {
      //   return data.category || '未设置'
      // }),
    ),
    // $(go.Shape,  // the arrowhead
    //   { fromArrow: "BackwardTriangle", stroke: COLOR.WHITE }
    // ),
    $(go.Shape,  // the arrowhead
      { toArrow: "Triangle", stroke: COLOR.WHITE }
    ),
  );

const object2map = (object) => {
  var map = new go.Map<string, go.Node>();
  for (let key in object) {
    map.add(key, object[key])
  }
  return map
}

// 在画布上的要素模板
const panelLinkTemplate = (link_props) => object2map({
  '': commonLinkTemplate(link_props),
})

export {
  panelLinkTemplate
}
