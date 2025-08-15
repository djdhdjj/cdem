import React from "react";
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select } from 'semantic-ui-react'
import COLOR from "../../../../data/Color";
import AceEditor from 'react-ace';
import { render } from "react-dom";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/theme-github";
import {TextFactory,simulate_dictionary} from "../../../../data/dictionary"


export default class TextEditor extends React.Component{
    constructor(props) {
        super(props)
        this.textFactory=new TextFactory(simulate_dictionary)
        this.state={
          open:false,
          type:props.data.type,
          text:props.data.text
        }
    }

    render(){
        const { open } = this.state
        const tf=this.textFactory
        const typeOptions=[
            { key: 'value', value: 'value', text: tf.str('TE_value') },
            { key: 'computed', value: 'computed', text: tf.str('TE_code(execute once)') },
            { key: 'normal', value: 'normal', text: tf.str('TE_code(execute many times)') },
        ]
        return(
            <Modal open={open}
            onOpen={()=>{this.setState({
              open:true,
              type:this.props.data.type,
              text:this.props.data.text})}} 
            onClose={()=>{this.setState({open:false})}} 
            trigger={<Button icon='file code' style={{height:'fit-content'}} />} closeIcon>
            <Header icon='file code' content={tf.str('editor')} />
            <Modal.Content>
              <Form>
                <Form.Select
                    label={tf.str('Select value type')}
                    fluid
                    options={typeOptions}
                    value={this.state.type}
                    onChange={(e,{value})=>{
                      this.setState({type:value})
                    }}
                />
                <div style={{width:'100%',height:'400px'}}>
                <AceEditor
                    mode="python"
                    theme="monokai"
                    fontSize={18}
                    width='100%'
                    height='100%'
                    value={this.state.text}
                    onChange={(newValue)=>{
                      this.setState({text:newValue})
                    }}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: true }}
                    //style={{border:'black'}}
                />
                </div>
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button color='green'
                onClick={()=>{
                  this.props.data.type=this.state.type
                  this.props.data.text=this.state.text
                  this.props.update()
                  this.setState({open:false})
                }}>
                <Icon name='checkmark'/> {tf.str('Confirm')}
              </Button>
            </Modal.Actions>
          </Modal>
        )
    }
}

