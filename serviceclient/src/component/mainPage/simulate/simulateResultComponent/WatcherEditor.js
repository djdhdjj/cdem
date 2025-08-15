import React from "react";
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select } from 'semantic-ui-react'
import COLOR from "../../../../data/Color";
import AceEditor from 'react-ace';
import { render } from "react-dom";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import {TextFactory,simulate_dictionary} from "../../../../data/dictionary"

export default class WatcherEditor extends React.Component {
    constructor(props) {
        super(props)
        this.textFactory=new TextFactory(simulate_dictionary)
        this.state = {
            open: false,
            //   quotaName:props.quotaName,
            //   val:props.val,
            //   code:props.code
        }
    }

    render() {
        const { open } = this.state
        const tf=this.textFactory
        const typeOptions = [
            //{ key: 'value', value: 'value', text: tf.str('TE_value') },
            { key: 'computed', value: 'computed', text: tf.str('TE_code(execute once)') },
            { key: 'normal', value: 'normal', text: tf.str('TE_code(execute many times)') },
        ]
        return (
            <Modal open={open}
                onOpen={() => {
                    this.setState({
                        open: true,
                        type: 'normal',
                        code:'',
                        quotaName:''
                    })
                }}
                onClose={() => { this.setState({ open: false }) }}
                trigger={<Button circular icon='add' size="tiny" inverted/>} closeIcon>
                <Header icon='file code' content={tf.str('Add watcher')} />
                <Modal.Content>
                    <Form>
                        <Form.Field>
                            <label>{tf.str('Quota name')}</label>
                            <Input value={this.state.quotaName}
                                onChange={(e, { value }) => {
                                    this.setState({ quotaName: value })
                            }}/>
                        </Form.Field>
                        <Form.Select
                            label={tf.str('WE_Type')}
                            fluid
                            options={typeOptions}
                            value={this.state.type}
                            onChange={(e, { value }) => {
                                this.setState({ type: value })
                            }}
                        />
                        <Form.Field>
                            <label>{tf.str('WE_code')}</label>
                        </Form.Field>
                        <div style={{ width: '100%', height: '300px' }}>
                            <AceEditor
                                mode="python"
                                theme="monokai"
                                fontSize={18}
                                width='100%'
                                height='100%'
                                value={this.state.code}
                                onChange={(newValue) => {
                                    this.setState({ code: newValue })
                                }}
                                name="UNIQUE_ID_OF_DIV"
                                editorProps={{ $blockScrolling: true }}
                            />
                        </div>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='green'
                        onClick={() => {
                            this.setState({ open: false })
                            this.props.addWatcher(this.state.quotaName,this.state.code,this.state.type)
                        }}>
                        <Icon name='checkmark' /> {tf.str('Confirm')}
              </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}