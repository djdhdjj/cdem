

// 整理存着各种要素的模板

import * as go from 'gojs';
import 'gojs/extensions/Figures'
import COLOR, { elmType2Color } from '../../../../data/Color';
// import {nodeMenuBottom} from "../../../component/graph_components/template/ElmTemplate.ts";

const $ = go.GraphObject.make;

const groupTemplateMap = new go.Map<string, go.Group>();

export default groupTemplateMap

