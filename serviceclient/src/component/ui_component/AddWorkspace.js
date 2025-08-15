import React from "react";
import { Modal, Button, Icon, Input, Menu, Label ,Checkbox} from 'semantic-ui-react'
import 'js-yaml'
import {TextFactory,simulate_dictionary} from "../../data/dictionary"
import { default_workspace } from "../../data/workspaceData";
import { Tooltip } from "antd";
import net_work from "../../manager/netWork"

export default class Add extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: false,
            name: null,
            nameError:false,
        }
        this.textFactory=new TextFactory(simulate_dictionary)
    }

    yes() {
        const {name} = this.state
        const _this = this
        var flag = 1
        if (name !== null && name !== '') {
            this.setState({display: false})
            return net_work.get('createWorkspace', { workspace: name })
            .then(data => {
                //console.log('---loadbynet',data)
                flag = data.status
            }).then(()=>{
                console.log('data',flag)
                if(flag === 0){
                    _this.props.parent.getChildrenMsg(this,name)
                    _this.setState({nameError:false})
                }
                else{
                    _this.setState({nameError:true})
                    alert('命名冲突！请重新添加')
                }
            })
        }
    }
    trigger() {
        return <Button secondary size='tiny' onClick={() => this.setState({display: true})}>
            {this.textFactory.str('Add')}
        </Button>
    }
    render() {
        const {display} = this.state
        let tf = this.textFactory
        return <Modal
            trigger={this.trigger()}
            open={display}
        >
            <Modal.Header>添加</Modal.Header>
            <Modal.Content>
                <Input label={tf.str('Add_Name')} onChange={(e, d) => 
                    {
                        this.setState({name: d.value})
                }}/>
            </Modal.Content>
            <Modal.Actions>
                <Button basic color='red'
                        onClick={() => this.setState({display: false})}
                >
                    <Icon name='remove' /> 取消
                </Button>
                <Button color='green' onClick={() => this.yes()}>
                    <Icon name='checkmark' /> 确认
                </Button>
            </Modal.Actions>
        </Modal>
    }
  

    
}


class WorkspaceAdd extends Add{
    trigger() {
        return  <Button
        style={{background:'#2F4050',color:'white'}} //没有改
        content='添加工作区'
        onClick={() => this.setState({display: true})}
        />
    }
}

export {
    WorkspaceAdd,
}
