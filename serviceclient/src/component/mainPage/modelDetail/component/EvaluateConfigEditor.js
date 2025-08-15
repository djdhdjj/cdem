// import React from "react";
import React, { useContext, useState, useEffect, useRef } from 'react';
import DiagramCtrler from "../func/diagramCtrler.ts";
import META from "../../../../data/nameConfig";
import { Popup,Modal, Button, Icon, Input, Segment, Header, Divider, Item, Accordion, Checkbox, List, Select, Label, Dropdown ,Table} from 'semantic-ui-react'
import COLOR from "../../../../data/Color";
import {default_workspace} from "../../../../data/workspaceData";
import {PageType} from "../../../../manager/PageManage";
import {saveAs} from "file-saver";
import * as go from "gojs";
import model from "../../../../data/model";
import { pageManage } from "../../../../manager/PageManage";
import { tree } from 'd3';
import { default_evaluate_config, distribution } from '../../../../data/evaluateConfig';
import EstTab from '../component/estimateComponent'
import { Affix,Popover } from "antd"
import {TextFactory,evaluate_dictionary} from '../../../../data/dictionary'
import { Tooltip } from "antd";
import net_work  from '../../../../manager/netWork'
import { couldStartTrivia, createEmitAndSemanticDiagnosticsBuilderProgram } from 'typescript';
// 评估配置 （原来泳道图的侧边+ 上方的点击评估配置参数）
export default class EvaluateConfigEditor extends React.Component {
    constructor(props){
        super(props)
        const { bean: service_pattern } = this.props.page.localInfo
        //console.log('service_pattern',service_pattern)
        this.service_pattern = service_pattern
        this.workspace_data = this.props.workspace_data
        this.language = this.props.language
        this.parentPattern = this.props.page.path.split('\\')[1]//!!!
        //this.textFactory = new TextFactory(evaluate_dictionary,this.language)

        // console.log(service_pattern ===default_workspace.service_pattern['单级物流模式'])
        //console.log('评估配置',this.service_pattern)
    }
    state = {
        r: false,
        service_pattern: this.service_pattern
    }

    saveConfig(){

        this.workspace_data.service_pattern[this.props.bean.name].evaluate_config = this.props.page.localInfo.bean.evaluate_config
        // console.log(this.workspace_data)
        // 表单部分
        var  w = JSON.parse(JSON.stringify(this.props.page.localInfo.bean.evaluate_config))
        this.refs.estimateComponent.state.dataSource.forEach(item=>{
             w[item.index] = item
             console.log('witem',w[item.index])
        })
        //console.log('w',w)
        this.workspace_data.service_pattern[this.props.bean.name].evaluate_config = w
        // console.log(this.workspace_data.service_pattern[this.props.localInfo.bean.name].evaluate_config )
        // console.log(this.workspace_data.service_pattern)
        // 底下的部分
        // default_workspace = this.workspace_data
        //console.log('3',default_workspace)
        //default_workspace.saveByNetwork()
        this.workspace_data.saveByNetwork()
        //console.log('4',default_workspace)
        pageManage.refresh()
        //  
    }

    render() {
     
        // default_workspace.loadByNetwork()
       //console.log('评估配置',this.props)
        const { page } = this.props;
        const  service_pattern  = page.localInfo.bean
        //console.log('pageinfo',page.localInfo.bean)
        //console.log('111',service_pattern._data.evaluate_config)
        //console.log('222',service_pattern.evaluate_config)
        service_pattern.evaluate_config = service_pattern._data.evaluate_config
        
        if (service_pattern) {
            //console.log('!!!!!sp',service_pattern)
            service_pattern.refreshEvaluateConfig()
            //console.log('!!!aftersp',service_pattern)
            // console.log(service_pattern.evaluate_config)
        }

        const distributionMap = {
          'constant':'常量',
          'binomial':'二项分布',
          'polynomial':'多项式',
          'poisson':'泊松分布',
          'uniform':'均匀分布',
          'exponential':'指数分布',
          'gaussian':'高斯分布',
        }

        const distribution_options = Object.keys(distribution).map(key => {
            return {
                text: key in distributionMap? distributionMap[key]:key,
                value: key,
                key: key,
            }
        })

        const  EvaSty= {
            left: 0, right: 0, 
            position: "relative", 
            width: "100%",
            height: "100%", 
            overflow: "auto", 
            display: "grid",
           zIndex: 31,
            padding:'50px 10px 0px 10px',
        }
        //let tf = this.textFactory
        let tf = new TextFactory(evaluate_dictionary,this.props.language)
        return (
            <div style={EvaSty}>
                {/* <Header as='h1'  style={{color:'white'}}>模式名称：{service_pattern.name}</Header> */}
                {console.log('------props',this.props)
                }
               <Header as='h1'  style={{color:'black'}}>{this.props.page.text}</Header>

                <br/> 
                {/* <Header as='h2' style={{color:'white'}}>评估配置编辑</Header> */}
              <Header as='h2' style={{color:'black'}}>参与者-资源价值矩阵</Header>
               <EstTab
                    workspace_data={this.props.workspace_data}
                    ref='estimateComponent'
                    localInfo={page.localInfo}
                    page = {page}  
                    style={{margin:'5px 0px'}}
               ></EstTab>
                <Divider   />
                {/* <Header as='h2' style={{color:'white'}}>评估配置编辑</Header> */}
                <Header as='h2' style={{color:'black'}}>{tf.str('evaluate_editor')}</Header>
                {/*console.log('sp',service_pattern)*/}
                {
                    
                    service_pattern && service_pattern._data.evaluate_config && Object.keys(service_pattern._data.evaluate_config).map(key => {
                        let elm_config = service_pattern._data.evaluate_config[key]
                        if(elm_config.duration){
                            return (
                                <div key={key}>
                                  {/* <Header as="h3" style={{color:'white'}}>  名字: &nbsp; &nbsp; {elm_config.name}  </Header> */}
                                  <Header as="h3" style={{color:'black'}}>  {tf.str('Name')}: &nbsp; &nbsp; {elm_config.name}  </Header>
                                  <List>
                                    {Object.keys(elm_config).map((c_k) => {
                                      if (
                                        c_k ==="duration" ||
                                        c_k ==="cost" ||
                                        c_k ==="throughput" ||
                                        c_k ==="reliability"
                                      ) {
                                        let value = elm_config[c_k];
                                        let { type: t } = value;
                                        //console.log('!!!!value',value)
                                        return (
                                          <div key={c_k}>
                                             
                                            <List.Item style={{ marginBottom: 10, font:'15px black ' }}   >
                                              {/* <span  style={{width:'130px',display:'inline-block',height:'100%',color:'white'}}>{c_k + "(" + "类型" + "): "} </span>    */}
                                              {c_k =="duration" &&    <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('duration')}&nbsp;
                                               <Popover content={tf.note('duration')} >
                                                    <Icon name='question circle outline' />
                                                </Popover>  &nbsp; : </span>   
                                              }
                                              {c_k =="cost" &&  <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('cost')} &nbsp;
                                              <Popover content={tf.note('cost')} >
                                                    <Icon fitted name='question circle outline' />
                                                </Popover>  &nbsp;:</span>   
                                                }
                                              {c_k =="reliability" &&  <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('reliability')}&nbsp;
                                              <Popover content={tf.note('reliability')} >
                                                    <Icon fitted name='question circle outline' />
                                                </Popover>  &nbsp;:</span> }  
                                              {c_k =="throughput" &&  <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('throughput')}&nbsp;
                                              <Popover content={tf.note('throughput')} >
                                                    <Icon fitted name='question circle outline' />
                                                </Popover>  &nbsp;:</span>}   
                                            </List.Item>
                                           
                                           
                                            <List.Item
                                                 style={{
                                                    marginBottom: 20,
                                                    display: "grid",
                                                    gridTemplateRows: "100%",
                                                    gridTemplateColumns: "8%  18%  8%  18% 18%",
                                                    marginTop:'10px',
                                                  }}
                                            >
                                             <span  style={{width:'50px',height:'20px',lineHeight:'30px',color:'black'}}>分布:</span>  
                                              <Dropdown
                                               selection
                                               options={distribution_options}
                                               defaultValue={t}
                                               fluid
                                               onChange={(e, { value: v }) => {
                                                 //console.log(this.state.r, value,v)
                                                 this.setState({ r: !this.state.r });
                                                 value.type = v;
                                                
                                               }}
                                               label="分布"
                                               style={{ width:'150px ',display:'inline-block',marginLeft:'40px'}}
                                             ></Dropdown>
                                           
                                             <span  style={{width:'50px',marginLeft:'50px',height:'20px',lineHeight:'30px',color:'black'}}>数值:</span>  
                                              {Object.keys(distribution[t]).map(
                                                (d_k) => {
                                                  //console.log('d_k',value[d_k])
                                                  let d_v =
                                                    value[d_k] || distribution[d_k];
                                                  if (d_v instanceof Array) {
                                                    d_v = d_v.join(",");
                                                  }
                                                  if(c_k=="reliability"&&value.type=="constant"){
                                                  return (
                                                    <div>
                                                    <Popup 
                                                      on='click'
                                                      content='请输入0-1之间的数值'
                                                      trigger={
                                                      <Input
                                                        key={d_k}
                                                        defaultValue={value[d_k]}
                                                        style={{ width:'150px ',marginLeft:'70px'}}
                                                        label={d_k}
                                                        onChange={
                                                          (e, { value: v }) => {
                                                          this.setState({
                                                            r: !this.state.r,
                                                            constantvalue: v,
                                                          });
                                                          value[d_k] = v;
                                                        }
                                                      }
                                                    />
                                                    }>
                                                    </Popup>
                                                    {/*c_k=="reliability"&&value.type=="constant"&&<Tooltip visible={true} 
                                                      placement="right" title="请填写0-1的数值！"
                                                      color="red"
                                                      ></Tooltip>
                                                  */}
                                                    </div>
                                                  );}
                                                  else{
                                                    return(
                                                      <div>
                                                      <Input
                                                        key={d_k}
                                                        defaultValue={value[d_k]}
                                                        style={{ width:'150px ',marginLeft:'70px'}}
                                                        label={d_k}
                                                        onChange={
                                                          (e, { value: v }) => {
                                                          this.setState({
                                                            r: !this.state.r,
                                                            constantvalue: v,
                                                          });
                                                          value[d_k] = v;
                                                        }
                                                      }
                                                    />
                                                    </div>
                                                    );}
                                                }
                                              )
                                              }
                                            </List.Item>
                                          </div>
                                        );
                                      }
                                    })}
                                  </List>
                                  <Divider />
                                </div>
                                
                              );

                        }
                        if(elm_config.amount){
                          return(
                          <div key={key}>
                             <Header as="h3" style={{color:'black'}}>  {tf.str('Name')}: &nbsp; &nbsp; {elm_config.name}  </Header>
                             <List>
                                    {Object.keys(elm_config).map((c_k) => {
                                      if (
                                        c_k ==="type" ||
                                        c_k ==="unit" ||
                                        c_k ==="amount" 
                                      ) {
                                        let value = elm_config[c_k];
                                        let { type: t } = value;
                                        return (
                                          <div key={c_k}>
                                             
                                            <List.Item style={{ marginBottom: 10, font:'15px black ' }}   >

                                              {c_k =="type" &&    <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('type')}&nbsp;
                                               <Popover content={tf.note('type')} >
                                                    <Icon fitted name='question circle outline' />
                                                </Popover>  &nbsp; : </span>   
                                              }
                                              {c_k =="unit" &&  <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('unit')} &nbsp;
                                              <Popover content={tf.note('unit')} >
                                                    <Icon fitted name='question circle outline' />
                                                </Popover>  &nbsp;:</span>   
                                                }
                                              {c_k =="amount" &&  <span  style={{width:'120px',display:'inline-block',height:'100%',color:'black'}}> {tf.str('amount')}&nbsp;
                                              <Popover content={tf.note('amount')} >
                                                    <Icon fitted name='question circle outline' />
                                                </Popover>  &nbsp;:</span> }  
             
                                            </List.Item>
                                           
                                           
                                            <List.Item
                                                 style={{
                                                    marginBottom: 20,
                                                    display: "grid",
                                                    gridTemplateRows: "100%",
                                                    gridTemplateColumns: "100%",
                                                    marginTop:'10px',
                                                  }}
                                            >
                                              {c_k =="type" && <div ><span  style={{width:'50px',height:'20px',lineHeight:'30px',color:'black'}}>数值:</span>
                                               <Input style={{ width:'150px ',display:'inline-block',marginLeft:'40px'}}  
                                               placeholder={value} 
                                               onChange={(e, { value: v }) => {
                                                this.setState({
                                                  r: !this.state.r,
                                                });
                                                elm_config[c_k] = v;
                                                //console.log('value',value);
                                                //console.log('service',service_pattern)
                                                }}></Input>
                                                </div>
                                              }
                                            {
                                               c_k =="unit" && <div><span  style={{width:'50px',height:'20px',lineHeight:'30px',color:'black'}}>数值:</span>
                                               <Input style={{ width:'150px ',display:'inline-block',marginLeft:'40px'}} 
                                                placeholder={value} 
                                                onChange={(e, { value: v }) => {
                                                  this.setState({
                                                  r: !this.state.r,
                                                });
                                                elm_config[c_k] = v;}}></Input>
                                              </div>
                                             }  
                                             {
                                               c_k =="amount" &&<div > 
                                              <span  style={{width:'50px',height:'20px',lineHeight:'30px',color:'black'}}>分布:</span>  
                                               <Dropdown
                                                selection
                                                options={distribution_options}
                                                defaultValue={t}
                                                fluid
                                                onChange={(e, { value: v }) => {
                                                  //console.log(this.state.r, value,v)
                                                  this.setState({ r: !this.state.r });
                                                  value.type = v;
                                                 
                                                }}
                                                label="分布"
                                                style={{ width:'150px ',display:'inline-block',marginLeft:'40px'}}
                                                  ></Dropdown> 
                                              {Object.keys(distribution[t]).map(
                                                (d_k) => {
                                                  let d_v =
                                                    value[d_k] || distribution[d_k];
                                                    //console.log('d_v',d_k,d_v)
                                                  if (d_v instanceof Array) {
                                                    d_v = d_v.join(",");

                                                  }
                                                  return (
                                                    
                                                    <Input
                                                      key={d_k}
                                                      defaultValue={value[d_k]}
                                                      style={{ width:'150px ',marginLeft:'70px'}}
                                                      label={d_k}
                                                      onChange={
                                                        
                                                        (e, { value: v }) => {
                                                        this.setState({
                                                          r: !this.state.r,
                                                        });
                                                        value[d_k] = v;
                                                        //console.log('value',value[d_k])
                                                        
                                                      }
                                
                                                    }
                                                    >
                                                    </Input>
                                                  );
                                                }
                                              )}
                                              </div>
                                             }
                                             
                                            </List.Item>
                                          </div>
                                        );
                                      }
                                    })}
                                  </List>
                                  <Divider />
                          </div>
                          )
                        }
                        
                      
                    })
                }

                
               <br/>
               <br/>
               <br/>
               <br/>
            </div>
        )

    }
}




