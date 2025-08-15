import React from "react";
import 'semantic-ui-css/semantic.min.css';
import {Button, Segment, Menu, Icon, Header, Form,Input,Checkbox,Modal} from 'semantic-ui-react';
import COLOR from "../data/Color";
//import help from "../../public/help"

export default class ModalHelp extends React.Component {
  constructor(props){
    super(props);
    this.state={
    }
    
 }

render(){
  return (
  <Modal
    closeIcon
    open={this.state.open}
    trigger={<Button style={{background:'#2F4050',color:'white'}}  icon='question circle outline' content='帮助'></Button>}
    onClose={() => this.setState({open:false})}
    onOpen={() => this.setState({open:true})}
  >
    <Header icon='archive' content='用户手册' />
    <Modal.Content>
    <a href="http://183.129.253.170:6052/help/%E7%B3%BB%E7%BB%9F%E8%AF%B4%E6%98%8E.pptx" target="_blank">操作说明</a>
    <br/><br/><br/><br/>
    </Modal.Content>
 
  </Modal>
)
}
     
    }