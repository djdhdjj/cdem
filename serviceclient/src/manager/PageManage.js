import { genUniqueID } from "./commonFunction";
import { observable, action, computed } from "mobx";
//import { Instance } from "../data/Ontology/instanceBase";

const PageType = {
    ontologyDetail: {
        type: 'ontologyDetail',
        width: 350
    },
    modelDetail: {
        type: 'modelDetail',
        width: 1500
    },
    conceptEdit: {
        type: 'conceptEdit',
        width: 600
    },
    relationEdit: {
        type: 'relationEdit',
        width: 600
    },
    propertyEdit: {
        type: 'propertyEdit',
        width: 600
    },
    propsEdit: {
        type: 'propsEdit',
        width: 350
    },
    simulateConfig: {
        type: 'simulateConfig',
        //width: 1600
        width: 1150
    },
    SimulateResult: {
        type: 'SimulateResult',
        //width: 1600
        width: 1150
    },
    estimateConfig:{
        type:'estimateConfig',
        width:1100
    },
    estimateShow:{
        type:'estimateShow',
        width:1100
    },
    /*添加了展示和编辑要素页面 */
    editKeyPartComponet:{
        type:'editKeyPartComponet',
        width:600
    },
    /*融合模式中间结果*/ 
    mergeMidShow:{
        type:'mergeMidShow',
        width:1200
    },

    // 模式库--原子模式库--评估配置
    configShow: {
        type: 'configShow',
        width: 1200
    }
    
}

class PageInfo {
    index;
    path = '';
    visible = false;
    localInfo = {};
    assessedResults = {};
    text;
    type;
    constructor(path, type, index, visible, localInfo = {},assessedResults = {}) {
        this.path = path;
        this.type = type;
        this.visible = visible;
        this.index = index;
        this.localInfo = localInfo;
        this.text = path === '' ? '': path.split('\\').pop();
        this.assessedResults = assessedResults;
        this.page_id = genUniqueID()
    }
    changeVisible (visible = null) {
        if (visible === null) {
            this.visible = !this.visible;
        } else {
            this.visible = visible
        }
       
    }
}
class PageManage {
    index;
    pageList;
    constructor() {
        this.pageList = {}
        this.index = 1
        // this.top_page
    }

    refresh(){
        
    }

    openPage(path, type, former_path = undefined) {
        let thisPage = this.pageList[path]
        for(let key in this.pageList){
            const elm = this.pageList[key]
            switch(type){
                case PageType.conceptEdit:
                case PageType.relationEdit:
                case PageType.propertyEdit:
                break;
                default:
                    if(elm != thisPage){
                        elm.changeVisible(false)
                     }
            }
        }
        if (thisPage) {                            
            thisPage.changeVisible(true)
            //this.closePage(path)
        } else{
            thisPage = new PageInfo(path, type, this.index+1, true)
            this.pageList[path] = thisPage
            this.index++;
        } 
        return thisPage
    }
    changeVisible(path) {
        this.pageList[path].changeVisible()

    }

    closePage(path) {
        if (path !== '') {
            Object.keys(this.pageList)
                .filter(key=> key.indexOf(path + '\\')!== -1)
                .forEach(key => {
                    delete this.pageList[key]
            })
            delete this.pageList[path]
        }
    }

    closeAllPage() {
        Object.keys(this.pageList).forEach(key => {
            delete this.pageList[key]
        })
    }

    get page_list() {
        return Object.keys(this.pageList)
            .map(key => this.pageList[key])
            .sort((a, b) =>{return a.index - b.index})
    }
}

let focus_page = observable.box(undefined)
let page_manager = new PageManage()

const pageManage = new PageManage()

export {
    PageInfo,
    PageType,
    pageManage,
    focus_page
}
