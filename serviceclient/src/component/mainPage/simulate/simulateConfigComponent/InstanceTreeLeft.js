import { reaction } from "mobx"
import React from "react";
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Accordion, Checkbox, Menu, Form, Label } from 'semantic-ui-react'
import { Tree } from 'antd';
import {TextFactory,simulate_dictionary} from "../../../../data/dictionary"

/**这个页面是模式实例界面左边的树结构 */

const defaultMenu = { left: 0, top: 0, visible: false, remove: false, addInstance: false, addGroup:false}
export default class InstanceTreeLeft extends React.Component {
    constructor(props) {
        super(props)
        this.bean = this.props.bean
        this.props.share.instanceTreeLeft = this
        this.instance_base = this.bean.instance_base //实例
        this.pattern_instance_base = this.bean.pattern_instance_base //模式要素
        this.textFactory=new TextFactory(simulate_dictionary)
        this.state = {
            menu:defaultMenu,
            treeData:this.instance_base.toTreeJson(),
            instance_base: this.instance_base,
            pattern_instance_base: this.pattern_instance_base,
            //selectedNode:this.selectedNode
        }
    }

    componentDidMount() {
        this.rect = this.refs.diagramDiv.getBoundingClientRect()
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.rect = this.refs.diagramDiv.getBoundingClientRect()
    }

    add(type, parentNode = null) {
        if(type ==="Instance"){
            if(parentNode === null){//根目录下
                this.instance_base.createInstance()
            }else{
                const g = this.instance_base.findGroupByName(parentNode.key)//某个目录下
                g.createInstance()
            }
            
        }else{ //type ==="Group"
            if(parentNode === null){//根目录下
                this.instance_base.createGroup()
            }else{
                const g = this.instance_base.findGroupByName(parentNode.key)//某个目录下
                g.createGroup()
            }
        }
        this.setState({
            treeData: this.instance_base.toTreeJson(),
            menu: defaultMenu
        })
       // console.log(this.state.treeData)
    }

    remove(removeNode) {
        // if(removeNode.key ===this.instance_base.id){//删除根节点
        //     //提示 非法操作
        // }else{
            this.instance_base.deleteByName(removeNode.key)//某个目录下
       // }
        this.setState({
            menu:defaultMenu,
            treeData:this.instance_base.toTreeJson()
        })
    }
t
    onSelect(selectedNode){ ////
        var t,type
        if(selectedNode.isLeaf){//instance有这个属性，而group没有
            t = this.instance_base.findInstanceByName(selectedNode.key)
            type = 'instance'
        // }else if(selectedNode.key ==='root'){
        //     //点击了根节点，目前设置了根节点不可点击，不会触发
        }
        else {//点击了group节点
            t = this.instance_base.findGroupByName(selectedNode.key)
            type = 'group'
        }
        let path = []
        let p = t
        while(p.name != 'root'){
            path.push(p.name)
            p = p.parent
        }
        path.push('root')
        this.props.share.instanceEdit.setState({
            whichType:type,
            selected:t,
            path:path.reverse()
        })
    }

    render() {
        const{menu,treeData} = this.state
        const tf=this.textFactory
        return <div className='component-InstanceTree' ref='diagramDiv' >
                <div style={{height:'50px',paddingTop:9}}>
                    <Header as='h3'  style={{float:'left', width:'49%', fontWeight:'600',fontSize:'28px'}}>{tf.str('Instances Structure')}</Header>
                    <Button  style={{float:'left', width:'24%',height:'40px'}} content={tf.str('add Group')}
                        onClick={() => {                     
                            this.add("Group")
                        }}  
                    ></Button>
                    <Button  style={{float:'left', width:'24%',height:'40px'}} content={tf.str('add Instance')}
                        onClick={() => {                     
                            this.add("Instance")
                        }}  
                    ></Button>
                </div>

                    <Divider />

                    <div style={{ //右键的菜单，默认是隐藏的
                        position: 'absolute',
                        left: menu.left,
                        top: menu.top,
                        display: menu.visible ? 'inline' : 'none',
                        zIndex: 100
                        }}>
                        <Menu  vertical>
                            {
                                menu.addInstance &&
                                <Menu.Item
                                    name={tf.str('add Instance')}
                                    onClick={menu.addInstance}
                                />    
                            }
                            {
                                menu.addGroup &&
                                <Menu.Item
                                    name={tf.str('add Group')}
                                    onClick={menu.addGroup}
                                />    
                            }
                            {
                                menu.remove &&
                                <Menu.Item
                                    name={tf.str('delete')}
                                    onClick={menu.remove}
                                />
                            }
                            
                            <Button icon='close' size='tiny' fluid secondary onClick={() => {
                                this.setState({ menu: defaultMenu })
                            }} />
                        </Menu>
                    
                    </div>
            <div>
                <Tree className='instanceTree'
                    style={{fontSize:"1.2em",background:'#e0dfe8',color:'black'}}
                    blockNode
                    defaultExpandAll
                    treeData={treeData}
                    //height={250}
                    //loadData={this.onLoadData}
                    
                    onSelect={(selectedKeys, info) => {
                        const { node } = info
                        this.onSelect(node)
                        }
                    }

                    onRightClick={({ event, node }) => {
                        let menu 
                        if(node.isLeaf){
                            menu = {
                                left: event.clientX + 30 - this.rect.x,
                                top: event.clientY + 50 - this.rect.y,
                                visible: true,
                                remove: () => this.remove(node),
                            }
                        }else{
                            menu = {
                                left: event.clientX + 30 - this.rect.x,
                                top: event.clientY + 50 - this.rect.y,
                                visible: true,
                                remove: () => this.remove(node),
                                addInstance: () => this.add("Instance",node),
                                addGroup:() =>this.add("Group",node)  
                            }
                        }
                        this.setState({ menu: menu })
                    }}    
                />
            </div>
        </div>
    }
}

