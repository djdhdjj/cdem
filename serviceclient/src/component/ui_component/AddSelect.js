import React from "react";
import {Modal, Button, Icon, Input, Menu, Dropdown, Header} from 'semantic-ui-react'
export default class AddSelect extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            display: false,
            name: null,
            select: null
        }
    }
    yes() {
        const {name, select} = this.state
        if (name !== null && name !== '' && select !== null && select !== '') {
            this.setState({display: false})
            this.props.add(name, select)
        }
    }
    trigger() {
        return <Menu.Item
            name='添加'
            onClick={() => this.setState({display: true})}/>
    }
    render() {
        const {display, select} = this.state
        const {options, selectName} = this.props
        return <Modal
            trigger={this.trigger()}
            open={display}
        >
            <Modal.Header>添加</Modal.Header>
            <Modal.Content>
                <Header as='h4'>
                    <Header.Content>
                        名称: &nbsp;
                        <Input onChange={(e, d) => this.setState({name: d.value})}/>
                        &nbsp;&nbsp;
                        {'模式'}:
                        &nbsp;
                        <Dropdown
                            labeled
                            selection
                            options={options.map(opt => {
                                return {
                                    key: opt,
                                    value: opt,
                                    text: opt,
                                }
                            })}
                            value={select}
                            onChange={(e, d) => this.setState({select: d.value})}
                        />
                    </Header.Content>
                </Header>
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
