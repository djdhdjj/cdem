import React from "react";
import { Modal, Button, Icon, Dropdown} from 'semantic-ui-react'
import 'js-yaml'
import {TextFactory,simulate_dictionary} from "../../data/dictionary"
import net_work from "../../manager/netWork"

export default class Delete extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: false,
            name: null,
            nameError:false,
            workspace_data : props.workspace_data,
            workspaceList : props.workspaceList,
            fatherWorkspaceName : props.workspaceName

        }
        this.textFactory=new TextFactory(simulate_dictionary)
    }

    componentWillReceiveProps(nextProps){
        console.log('delete',nextProps)
        this.setState({workspace_data:nextProps.workspace_data,
            workspaceList:nextProps.workspaceList,
            fatherWorkspaceName:nextProps.workspaceName
        })
    }

    deleteWorkspace = (e,{value})=>{
        console.log('deletevalue',value)
        this.setState({name:value})

    }

    yes() {
        const {name,fatherWorkspaceName,workspaceList} = this.state
        const _this = this
        var flag = 1
        if(name === fatherWorkspaceName){
            alert('当前工作区已打开，不可以删除！')
        }
        else if (name !== null && name !== '') {
            this.setState({display: false})
            workspaceList.splice(workspaceList.findIndex(item => item.key === name), 1);
            return net_work.get('deleteWorkspace', { workspace: name })
            .then(data => {
                console.log('---loadbynet',data)
                flag = data.status
            }).then(()=>{
                console.log('data',flag)
                if(flag === 0){
                    _this.props.parent.getDeleteWorkspaceList(_this,workspaceList)
                    //_this.setState({nameError:false})
                }
                else{
                    //_this.setState({nameError:true})
                    //alert('命名冲突！请重新添加')
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
        return <Modal
            trigger={this.trigger()}
            open={display}
        >
            <Modal.Header>删除</Modal.Header>
            <Modal.Content>
                <Dropdown
                    selection
                    options={this.state.workspaceList}
                //style={{color:'#2F4050',zIndex:'99999',height:'5px'}}
                //defaultValue={this.state.workspaceName}
                    onChange={this.deleteWorkspace}/>
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


class WorkspaceDelete extends Delete{
    trigger() {
        return  <Button
        style={{background:'#2F4050',color:'#e0dfe8'}} //没有改
        content='删除工作区'
        onClick={() => this.setState({display: true})}
        />
    }
}

export {
    WorkspaceDelete,
}
