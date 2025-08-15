import React from 'react';
import '../modelDetail/ModelDetail.css'

import { Header, Segment, TableHeader, TableRow, List, Divider} from "semantic-ui-react";
import { Form ,Input,Checkbox,Spin,Table} from 'antd';
import PaletteCanvas from '../modelDetail/component/PaletteCanvas'
import TaskComponent from "../modelDetail/component/TaskComponent";

import COLOR from '../../../data/Color'
import {
    RightCircleOutlined
  } from '@ant-design/icons';
  
export default class MergeDetail extends React.Component {
    constructor(props) {
        super(props)
        this.state={
              
        }
        this.workspace_data = this.props.workspace_data
        //console.log(this.props)
    }
    
    render() {
        const { page,bean } = this.props;
        // const {estCheckVis,tableCol,tableSour,tableVis} =  this.state
        const colStyle = {
            left: 0, right: 0, position: "relative", width: "100%",
            height: "100%", overflow: "hidden", display: "grid",
            gridTemplateRows: "100%",
            // gridTemplateColumns: '155px auto' + (propsOpen ? " 300px" : "")
            gridTemplateColumns: 'auto 350px'
        }
        // 取 配置参数
        return(
            <div className='modelDetail' style={colStyle}>
                 {/* 泳道图区域  ---可复用 */}
                 <TaskComponent
                    workspace_data={this.props.workspace_data}
                    // addConcept={(c) => this.addConcept(c)}
                    // removeConcept={(c) => this.removeConcept(c)}
                    ref='taskComponent'
                    localInfo={page.localInfo}

                    style={{border:'2px solid red'}}

                />
               
                {
                    typeof(bean._data.fusion_args)!='undefined'&&<MergeParameter data={bean._data.fusion_args}></MergeParameter>

                }
           </div>
        ) 
    }
}

// 点击泳道图按钮显示的侧边参数信息
class MergeParameter extends React.Component{
    render(){
            const {data} =this.props
            const title_style = { fontSize:'18px' ,display:'inline-block',margin:'5px 0px' }//设置标题样式
            const relationMap = {
                'call':'调用',
                'exclusive':'互斥',
                'full_parallel':'完全并行',
                'semi_parallel':'半并行',
                'A-first':'模式1在前',
                'B-first':'模式2在前',
            }

            // console.log('mergedetail--------------')
            console.log(data)
           
        return(
            <Segment style={{ width: '100%', height: '100%', margin: 0, zIndex: 31, overflow: 'auto',backgroundColor:'white',color:'black' }}>
            <Header as='h2' style={{color:'black'}}>相关参数</Header>

            <Divider/>
            <List  >
                <List.Item >
                    <span style={title_style} >名称： &nbsp;&nbsp;</span>{data.name} 
                </List.Item>
                <Divider/>
               
                <List.Item>
                    <span style={title_style}>模式:</span>  &nbsp;  {data.patterns[0]}--{data.patterns[1]}  
                </List.Item>
                <Divider/>
              
                <List.Item>
                    <span style={title_style}>结构:&nbsp;&nbsp;</span>    {(data.structure==0 ? '并行':'串行')}
                </List.Item>
                <Divider/>
             
                <List.Item>
                    <span style={title_style}>关系:&nbsp;&nbsp;&nbsp;</span> {data.relation in relationMap? relationMap[data.relation] : data.relation}
                </List.Item>
                <Divider/>
       
                <List.Item>
                    <span style={title_style}>系数:&nbsp;&nbsp;&nbsp;&nbsp;</span>   {data.theta}
                </List.Item>
                <Divider/>
     
                <List.Item>
                    <span style={title_style}>参与者映射:</span><br/>
                    <br/>
                    {
                        Object.keys(data.name_mapping).map(index => {
                           var d_v = data.name_mapping[index]
                            return (
                                <span  > <RightCircleOutlined /> {index}---{d_v}<br/> </span>
                           
                               
                            )
                        })
                    }
                </List.Item>
                <Divider/>
            </List>
        </Segment>
  
        )
    }
}


