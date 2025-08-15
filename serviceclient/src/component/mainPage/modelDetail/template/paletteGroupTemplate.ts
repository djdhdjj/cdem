

// 整理存着各种要素的模板

import * as go from 'gojs';
import 'gojs/extensions/Figures'
import COLOR, { elmType2Color } from '../../../../data/Color';
const $ = go.GraphObject.make;

const custom_r = 60
const poolTemplateForPalette =
    $(go.Group, 'Vertical',
    {
        locationSpot: go.Spot.Center,
        computesBoundsIncludingLinks: false,
        isSubGraphExpanded: false
    },
    $(go.Shape, 'Process',
        { fill: 'white', desiredSize: new go.Size(custom_r, custom_r / 2) }),
    $(go.Shape, 'Process',
        { fill: 'white', desiredSize: new go.Size(custom_r, custom_r / 2) }),
    $(go.TextBlock,
        { margin: 5, editable: true, 'text': '泳道' },
        // new go.Binding('text')
        )
    );

const LaneTemplateForPalette = $(go.Group, 'Vertical'); // empty in the palette, 直接在图中右键添加



const group = {
    Pool: poolTemplateForPalette,
    Lane: LaneTemplateForPalette,
}

const object2map = (object) => {
    let map = new go.Map<string, go.Node>();
    for (let key in object) {
        map.add(key, object[key])
    }
    return map
}

const palGroupTemplateMap = object2map(group)

export default palGroupTemplateMap