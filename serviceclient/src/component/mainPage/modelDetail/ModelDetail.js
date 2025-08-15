import React from 'react';
import './ModelDetail.css';

import PaletteCanvas from './component/PaletteCanvas';
import COLOR from '../../../data/Color';
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Accordion, Checkbox, List, Select, Label, Dropdown ,Table} from 'semantic-ui-react'
import { Tree } from "antd";
import TaskComponent from "./component/TaskComponent";
import EstimateComponent from "./component/estimateComponent";
import output from "../../../data/output";
import { saveAs } from "file-saver";
import { default_evaluate_config, distribution } from '../../../data/evaluateConfig';
import { autorun } from 'mobx';

import { pageManage } from "../../../manager/PageManage";

export default class ModelDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            evaluateVis:false,
        }
        this.language = this.props.language
        const { bean: service_pattern } = this.props.page.localInfo
        console.log('model',this.props.page.localInfo)
        this.service_pattern = service_pattern
        this.workspace_data = this.props.workspace_data
    }

    componentDidMount() {

    }

    propsOpen() {
        const { page } = this.props;
        const { propsOpen } = page.localInfo
        page.localInfo.propsOpen = !propsOpen
        pageManage.refresh()
    }

    import() {
        this.refs['taskComponent'].import()
    }

    export() {
        this.refs['taskComponent'].export()
    }

    // showEvaluateConfig() {
    //     const { page } = this.props;
    //     const { bean: service_pattern } = page.localInfo
    //     service_pattern.refreshEvaluateConfig()
    //      // pan--------点击后编辑评估参数// 显示评估测试的table
    //     let { evaluateVis } = this.state
    //     this.setState({ evaluateVis: true })
    //     console.log('showEvaluateConfig')
    //     console.log('service_pattern.evaluate_config, page');
    //     console.log(service_pattern.evaluate_config, page)
    //     console.log("-------------------");
    // }

    render() {
        const { page } = this.props;
        const { concept_tree,evaluateVis } = this.state;
        const { propsOpen } = page.localInfo
        const title = page.localInfo.bean ? page.localInfo.bean.name : ""
        console.log('!!!page',page)
        const colStyle = {
            left: 0, right: 0, position: "relative", width: "100%",
            height: "100%", overflow: "hidden", display: "grid",
            gridTemplateRows: "100%",
            // gridTemplateColumns: '155px auto' + (propsOpen ? " 300px" : "")
            gridTemplateColumns: '155px auto '
            // gridTemplateColumns: '155px auto 300px'

        }
        return (
            <div className='modelDetail' style={colStyle}>
                {/* 侧边的图表样例  ---可复用 */}
                <div className='palette-div' style={{ background: COLOR.DIRTY_WHITE }}>
                    <PaletteCanvas ref='paletteCanvas' title={title}/>
                </div>

                {/* 泳道图区域  ---可复用 */}
                <TaskComponent
                    workspace_data={this.props.workspace_data}
                    // addConcept={(c) => this.addConcept(c)}
                    // removeConcept={(c) => this.removeConcept(c)}
                    ref='taskComponent'
                    localInfo={page.localInfo}
                />
                {/* {
                    // 侧边配置编辑
                    <EvaluateConfigEditor service_pattern={this.service_pattern} />
                } */}
                {
                    propsOpen &&
                    <Segment style={{ width: '100%', height: '100%', margin: 0, zIndex: 31 }}>
                        <Header as='h1'>模式属性</Header>
                        {/* <Segment vertical> */}
                        {/* 原子模式名  &nbsp; */}
                        <Input label='模式名' fluid value={page.text} />
                        {/* </Segment> */}
                        <Header as='h3'>涉及概念</Header>
                        <Tree
                            style={{ background: '#e0dfe8'}}
                            blockNode
                            treeData={concept_tree}
                            height={500}
                        />
                    </Segment>
                }
                {/*------pan ----     点击编辑评估参数显示表单  */}
                {
                    evaluateVis && 
                    <EstimateComponent
                        workspace_data={this.props.workspace_data}
                        // addConcept={(c) => this.addConcept(c)}
                        // removeConcept={(c) => this.removeConcept(c)}
                        ref='estimateComponent'
                        localInfo={page.localInfo}
                        page = {page}
                /> 
                }
            </div>
        )
    }
}

// class EvaluateConfigEditor extends React.Component {
//     state = {
//         r: false
//     }
//     render() {
//         const { service_pattern } = this.props
//         if (service_pattern) {
//             service_pattern.refreshEvaluateConfig()
//             // console.log(service_pattern.evaluate_config)
//         }

//         const distribution_options = Object.keys(distribution).map(key => {
//             return {
//                 text: key,
//                 value: key,
//                 key: key,
//             }
//         })
//         // console.log(distribution_options)
//         return (
//             <Segment style={{ width: '100%', height: '100%', margin: 0, zIndex: 31, overflow: 'auto' }}>
//                 <Header as='h1'>评估配置编辑</Header>
//                 {
//                     service_pattern && Object.keys(service_pattern.evaluate_config).map(key => {
//                         let elm_config = service_pattern.evaluate_config[key]
//                         return (
//                             <div key={key}>
//                                 <Divider />
//                                 <Header as='h3'>{key}</Header>
//                                 <List>
//                                     {
//                                         Object.keys(elm_config).map(c_k => {
//                                             let value = elm_config[c_k]
//                                             let { type: t } = value
//                                             // ctrl.diagram.model.findNodeDataForKey(from)
//                                             return (
//                                                 <div key={c_k}>
//                                                     <List.Item style={{ marginBottom: 10 }}>
//                                                         {c_k + '(' + '类型' + '): '}
//                                                         {/* compact fluid */}
//                                                     </List.Item>
//                                                     <List.Item style={{ marginBottom: 10 }}>

//                                                         <Dropdown selection placeholder='选择分布' options={distribution_options} defaultValue={t}
//                                                             fluid
//                                                             onChange={(e, { value: v }) => {
//                                                                 // console.log(this.state.r, value)
//                                                                 this.setState({ r: !this.state.r })
//                                                                 value.type = v
//                                                             }}
//                                                             label='分布'
//                                                         >

//                                                         </Dropdown>
//                                                     </List.Item>
//                                                     <List.Item style={{
//                                                         marginBottom: 20,
//                                                         display: 'grid',
//                                                         gridTemplateRows: "100%",
//                                                         gridTemplateColumns: '50% 50%'
//                                                     }}>
//                                                         {
//                                                             Object.keys(distribution[t]).map(d_k => {
//                                                                 let d_v = value[d_k] || distribution[d_k]
//                                                                 if (d_v instanceof Array) {
//                                                                     d_v = d_v.join(',')
//                                                                 }
//                                                                 return (
//                                                                     <Input key={d_k}
//                                                                         // style={{width: 70}}
//                                                                         // style={{ marginBottom: 5 }}
//                                                                         fluid
//                                                                         defaultValue={d_v}
//                                                                         onChange={(e, { value: v }) => {
//                                                                             this.setState({ r: !this.state.r })
//                                                                             value[d_k] = v
//                                                                         }}
//                                                                     >
//                                                                         <Label>{d_k + ': '}</Label>
//                                                                         <input />
//                                                                     </Input>
//                                                                 )
//                                                             })
//                                                         }

//                                                     </List.Item>

//                                                 </div>
//                                             )
//                                         })
//                                     }
//                                 </List>
//                             </div>
//                         )
//                     })
//                 }
//                 <datalist id='distribution'>
//                     {
//                         Object.keys(distribution).map(elm =>
//                             <option key={elm} value={elm} />
//                         )
//                     }
//                 </datalist>
//             </Segment>
//         )
//     }
// }

