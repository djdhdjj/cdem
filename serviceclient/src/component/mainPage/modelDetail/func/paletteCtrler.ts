import * as go from 'gojs';
import palGroupTemplateMap from '../template/paletteGroupTemplate.ts';
const $ = go.GraphObject.make;
// 5月28日，创建一个可以切换的调色板
export default class PalatteCtrler{
    palette = undefined

    constructor(container, pallatteNodeTemplateMap){
        this.palette = $(go.Palette, container,
            {
              nodeTemplateMap: pallatteNodeTemplateMap,
            //   linkTemplateMap: this.palLinkTemplateMap,
            //   groupTemplateMap: this.palGroupTemplateMap,
              groupTemplateMap: palGroupTemplateMap,
              layout: $(go.GridLayout,{}),
            }
        )
    }
}
