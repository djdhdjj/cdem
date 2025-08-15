// import React from "react";
import React, { useContext, useState, useEffect, useRef } from 'react';
import DiagramCtrler from "../func/diagramCtrler.ts";
import META from "../../../../data/nameConfig";
import {Table,Input,Button, Dropdown, Header, Icon, Modal, Segment} from "semantic-ui-react";
//import { Table,Form ,Input} from 'antd';
import COLOR from "../../../../data/Color";
import {default_workspace} from "../../../../data/workspaceData";
import {PageType} from "../../../../manager/PageManage";
import {saveAs} from "file-saver";
import * as go from "gojs";
import model from "../../../../data/model";
import { pageManage } from "../../../../manager/PageManage";
import { tree, group } from 'd3';
import { T } from 'antd/lib/upload/utils';

// 原子模式库--编辑评估参数
export default class estimateComponent extends React.Component {
    constructor(props) {
        super(props)
        var name = '参与者'
        console.log('props',this.props)
        var participentArr = this.props.localInfo.bean.data.nodes.filter(item => item.category=='Lane' )   //数组过滤取
        var participentArrNew = []
        participentArr.forEach(function(value,i){  　　
          // console.log(value)
               participentArrNew.push({
                   key:value.key,
                   name:value.name,
                   group:value.group
               }) 
            })
        console.log(participentArr,participentArrNew)
        //资源表头
        var resObj = this.props.localInfo.bean.data.nodes.filter(item => item.category==('resourceObject') )   //数组过滤取
        console.log('---------resObj--------',resObj)
        var resNew = []
        resObj.forEach(function(value,i){  　　
            resNew.push({
            // --------表头必备
            key:value.key,
            title:'res'+(i+1)+':'+value.name,
            dataIndex:value.key,
            editable:true
            }) 
        })
        
          let dataSourceArr = [] //表格填的数据
          for(let i = 0;i<participentArrNew.length;i++ ){
            dataSourceArr.push({
                  key:i,
                  name:participentArrNew[i].name,
                  index: participentArrNew[i].key
              })
             
              resNew.filter(function(item){
                dataSourceArr[i][item.key] = '1.0'
              })
          }
          console.log('-----dataSourceArr-------',dataSourceArr)
        for(let i = 0;i<dataSourceArr.length;i++){
          console.log(this.props.localInfo)
            //console.log(JSON.stringify(this.props.localInfo.bean.evaluate_config[dataSourceArr[i].index])) 
            //console.log(this.props.localInfo.bean.evaluate_config=='undefined')
            //console.log(this.props.localInfo.bean.evaluate_config== undefined )
          if(this.props.localInfo.bean.evaluate_config != undefined){
            console.log('in for',this.props.localInfo.bean.evaluate_config[dataSourceArr[i].index])
            dataSourceArr[i] = this.props.localInfo.bean.evaluate_config[dataSourceArr[i].index]
          }
        }

        let par2res = this.props.localInfo.bean._data.resource_config
        // console.log(dataSourceArr)
        this.parentPattern = this.props.page.path.split('\\')[1]
        //console.log(this.parentPattern)
        this.state = {
            dropdownVisible: true,
            // 模式名称，所有资源数组，参与者数组
            nameModel:null,
            participents:participentArr,
            resources:resObj,
            dataSource:dataSourceArr,
            par2res:par2res,
        }  
        //   如果   传过来的数据有值  需要覆盖
        this.columsArr = [
          {
              key:'name',
              title:name,
              dataIndex:'name',
              width: '30%',
          }
        ] 
      this.columsArr =  this.columsArr.concat(resNew)

    }

    componentDidMount() {
        const { diagramDiv } = this.refs
        this.workspace_data = this.props.workspace_data
        this.service_pattern = this.props.localInfo.bean
        //console.log('111',this.props.localInfo.bean)
        this.controller = this.service_pattern.initDiagram(diagramDiv)
   }


    // 保存编辑后的单元格
    handleSave = row => {
      const newData = [...this.state.dataSource];
      const index = newData.findIndex(item => row.key === item.key);
      const item = newData[index];
      newData.splice(index, 1, { ...item, ...row });
      //console.log('data',newData)
      this.setState({
        dataSource: newData,
      });
      newData.map((item)=>{
        //console.log('newdata',item)
        this.service_pattern._data.evaluate_config[item.index] = item
        /*
        if(this.parentPattern.indexOf("融合模式")!=-1){
            //this.service_pattern._data.evaluate_config[item.index] = item
        }
        else if(this.parentPattern.indexOf("原子模式")!=-1){
          console.log('原子模式',item)
         
        }*/
        //
      })
      //console.log('ec_service_pattern',this.service_pattern)
    };
   

    render() {
      const {dataSource,resources,participents} = this.state
      let {par2res} = this.state
      const columsArr = this.columsArr
      console.log('par2res',par2res)
      return(
        <div>
          <Table compact celled definition>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell/>
              {
                resources.map(res =>{
                  console.log('res',res)
                  return(
                    <Table.HeaderCell>{res.name}</Table.HeaderCell>
                  )
                })
              }
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                participents.map(par =>{
                    console.log('par',par)
                    return(
                      <Table.Row>
                        <Table.Cell>{par.name}</Table.Cell>
                        {
                          resources.map(res=>{
                            return(
                                <Table.Cell>
                                  <Input defaultValue={(par2res[par.key]&&par2res[par.key][res.key])?par2res[par.key][res.key]:0}
                                    onChange={(e,data)=>{
                                      const {value} = data
                                      let pk = par.key
                                      let rk = res.key
                                      if(par2res[pk]&&par2res[pk][rk]){
                                          par2res[pk][rk] = value
                                      }
                                      else if(par2res[pk]){
                                        par2res[pk][rk] = value
                                      }
                                      else{
                                        console.log('rk',rk)
                                        par2res[pk]={} 
                                        par2res[pk][rk] = value
                                        console.log(par2res[pk])
                                      }
                                      this.setState({par2res:par2res})
                                  }}
                                  >
                                  </Input>
                                </Table.Cell>
                            )
                          })
                        }
                      </Table.Row>
                    )
                  })
              }
            </Table.Body>
          </Table>
        </div>
      )
    }
}

/*
const {dropdownVisible,dataSource} = this.state
        // console.log(dataSource)
        // 如果传过来的数据
        // 可编辑的行
        const EditableContext = React.createContext();
        const EditableRow = ({ index, ...props }) => {
            const [form] = Form.useForm();
            return (
              <Form form={form} component={false}>
                <EditableContext.Provider value={form}>
                  <tr {...props} />
                </EditableContext.Provider>
              </Form>
            );
          };

        // 可编辑单元格
          const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
            const [editing, setEditing] = useState(false);
            const inputRef = useRef();
            const form = useContext(EditableContext);
            console.log('-----editing',editing)
            useEffect(() => {
              if (editing) {
                inputRef.current.focus();
              }
            }, [editing]);

            // 文本框点击后显示输入框 
            const toggleEdit = () => {
              console.log('------toggle-------')
              setEditing(true);
              console.log('editing',editing)
              form.setFieldsValue({
                [dataIndex]: record[dataIndex],
              });
              console.log('record[dataIndex]',record[dataIndex])
            };
          
            // 输入框输入后的保存
            const save = async e => {
              try {
                const values = await form.validateFields();
               
                toggleEdit();
               
                handleSave({ ...record, ...values });
              } catch (errInfo) {
                //console.log('Save failed:', errInfo);
              }
            };
          
            let childNode = children;
            console.log('----editable-----',editable)
            if (editable) {
              
              childNode = editing ? (
                <Form.Item   style={{  margin: 0, }}  name={dataIndex}  >
                  <Input ref={inputRef} onPressEnter={save} onBlur={save} />
                </Form.Item>
              ) : (
                <div className="editable-cell-value-wrap"  style={{ paddingRight: 24, }}  onClick={toggleEdit} >
                    {children}
                </div>
              );
              childNode = 
                    (<Form.Item   style={{  margin: 0, }}  name={dataIndex} onClick={toggleEdit} >
                      <Input ref={inputRef} onPressEnter={save} onBlur={save} defaultValue={record[dataIndex]}/>
                    </Form.Item>)
              }
            //console.log('childnode',childNode)
            return <td {...restProps}>{childNode}</td>;
          };

            // table属性 components 覆盖默认的 table 元素
            const  components = {
                body:{
                    row: EditableRow,
                    cell: EditableCell,
                }
            }
            const columns=this.columsArr.map(col =>{
                    console.log('col.editable',col.editable)
                    if(!col.editable){ //不可编辑直接返回
                        return col
                    }
                    return { //可编辑
                        ...col,
                        onCell : record =>({
                            record,
                            editable: col.editable,
                            dataIndex: col.dataIndex,
                            title: col.title,
                            children: 0.0,
                            handleSave: this.handleSave,
                        })
                    }
               })
        return(
          <div>
             <Table 
                        components = {components}
                        bordered
                        pagination	={false}
                        dataSource={dataSource} 
                        columns={columns} 
                        style={{border:'1ps solid red',background:'white'}}
                        />


            {//<Button onClick={()=>this.submitEst()}>保存</Button> }
          </div>  

        )  
*/ 
