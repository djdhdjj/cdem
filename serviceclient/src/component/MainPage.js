import React from "react";
import {Modal, Button, Icon, Input, Segment} from 'semantic-ui-react'
import {PageType, PageInfo, focus_page} from "../manager/PageManage";
import ModelDetail from "./mainPage/modelDetail/ModelDetail";
import OntologyDetail from "./mainPage/ontologyDetail/OntologyDetail";
import PropsEdit from "./mainPage/PropsEdit";
import OntologyGraph from "./mainPage/ontologyDetail/OntologyGraph";
import { autorun } from "mobx";
import output from "../data/output";
import {saveAs} from "file-saver";
import { pageManage } from "../manager/PageManage";
import SimulateConfig from "./mainPage/simulate/simulateConfig";
import SimulateResult from "./mainPage/simulate/SimulateResult";
import COLOR from "../data/Color";
import EstimateDetail from "./mainPage/estimateDetail/estimateDetail";
import EditKeyPartComponet from "./mainPage/modelDetail/component/EditKeyPartComponent";
//import InstanceTree from "./mainPage/simulate/InstanceTree";
import MergeDetail from '../component/mainPage/mergeDetail/MergeDetail'
import EvaluateConfigEditor from '../component/mainPage/modelDetail/component/EvaluateConfigEditor'
//import { default_workspace } from "../data/workspaceData";
import EstimateResult from "./mainPage/estimateDetail/estimateResult";
export default class MainPage extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            language : this.props.language,
            workspace_data:props.workspace
        }
        console.log('mainprops',this.props)
        //console.log('!!!!lan',this.language)
    }

    state = {
        focused: false
    }

    componentDidMount() {//第一次渲染后调用
    
        this.onFocusPageChangeListener = autorun(() => {
            const {focused} = this.state
            let fp = focus_page.get()
            if(fp ===this && !focused)
                this.setState({ focused: true })
            else if(fp != this && focused)
                this.setState({ focused: false })
        });
    }
    componentWillReceiveProps(nextProps){
        this.setState({
            language:nextProps.language,
            workspace_data:nextProps.workspace
        })
    }
    render() {
        const {page} = this.props
        const {type, localInfo} = page
        const {focused} = this.state
        const language = this.state.language

        let segment_style = {
            width: '100%',
            height: '100%',
            overflow: 'auto',
            background: '#e0dfe8',
            // border: 'none',
        }
        if(type === PageType.modelDetail){
            segment_style.padding = 0
        }
        if(!focused){
            segment_style.border = '5 px solid black'
        }


        let render = () => {
            {
                //console.log('mainlanguage',language)
                switch (type) {
                    case PageType.ontologyDetail:
                        return <OntologyDetail ref='detail' page={page} localInfo={localInfo} language={language}/>
                    // case PageType.conceptEdit:
                    //     return <ConceptEdit bean={localInfo.bean} localInfo={localInfo}  ref='detail'/>
                    // case PageType.relationEdit:
                    //     return <RelationEdit bean={localInfo.bean} localInfo={localInfo} ref='detail'/>
                    // case PageType.propertyEdit:
                    //     return <PropertyEdit bean={localInfo.bean} localInfo={localInfo} ref='detail'/>
                    case PageType.modelDetail:
                        return <ModelDetail page={page} workspace_data={localInfo.workspace_data} bean={localInfo.bean} localInfo={localInfo} ref='detail'/>
                    case PageType.propsEdit:
                        return <PropsEdit bean={localInfo.bean} graph_data={localInfo.graph_data} localInfo={localInfo}  ref='detail'/>
                    case PageType.simulateConfig:
                        return <SimulateConfig bean={localInfo.bean} graph_data={localInfo.graph_data} localInfo={localInfo} language={language} workspace_data={localInfo.workspace_data} ref='detail'/>
                    case PageType.SimulateResult:
                        return <SimulateResult page={page} bean={localInfo.bean} localInfo={localInfo} language={language}  ref='detail'/>
                    case  PageType.estimateConfig:
                        return <EstimateDetail page={page} bean={localInfo.bean} localInfo={localInfo} language={language} workspace_data={localInfo.workspace_data} ref='detail'/>
                    case  PageType.estimateShow:
                        return <EstimateResult page={page} bean={localInfo.bean} localInfo={localInfo} language={language} ref='detail'/>
                    {/*添加了展示和编辑要素页面 */}
                    case  PageType.editKeyPartComponet:
                        return <EditKeyPartComponet page={page} bean={localInfo.bean} workspace_data={localInfo.workspace_data} localInfo={localInfo} ref='editkeypartcomponent'/>
                    case PageType.mergeMidShow:
                        return <MergeDetail page={page} bean={localInfo.bean} workspace_data={localInfo.workspace_data} localInfo={localInfo}  ref='merge'></MergeDetail>

                    // 模式库--原子库--评估配置
 	                case PageType.configShow:
                          return <EvaluateConfigEditor page={page} workspace_data={localInfo.workspace_data} bean={localInfo.bean} localInfo={localInfo} language={language}  ref='detail'></EvaluateConfigEditor>
                        
                }
            }
        }
        
        return <div  style={{
            //width: type==pageManage.ontologyDetail?type.width:"100%",
            width:"100%",
            height: '100%',//91vh
            position: 'relative',
            //margin: '1vh 5px',
            float: 'left',
            background:'#e0dfe8',
            display: page.visible ? 'grid' : 'none',
            margin:0,border:0,paddingTop:'0.5%',
            // top: '5px'
        }}>
            <Segment style={segment_style}
                      onClick={() => {
                          focus_page.set(this);
                      }}
            >
                {
                    render()
                }
            </Segment>
        </div>

    }
}
