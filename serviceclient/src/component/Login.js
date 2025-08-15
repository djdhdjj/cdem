import React from "react";
import 'semantic-ui-css/semantic.min.css';
import {Button, Segment, Menu, Icon, Header, Form,Input,Checkbox,Modal} from 'semantic-ui-react';
import axios from 'axios'
import net_work from "../manager/netWork"

export default class ModalLogin extends React.Component {
  constructor(props){
    super(props);
    this.state={
        open : true,
        //setOpen : false,
        login : false,
        userName: '',
        userPassword: '',
    }; 
 }

 handleChange = (e, { value }) => this.setState({ value })
 login(){
  let userName = this.state.userName
  let userPassword = this.state.userPassword
  const _this = this
  //console.log(userName,userPassword)
  net_work.post('login',{
      username:userName,
      password:userPassword
  })
  .then(function (response){
      //console.log('response',response)
      //console.log(response)
      if(response.status==true){
        _this.setState({open:false,login:true})
        let loginstate = true
        _this.props.parent.getLoginMsg(this,loginstate)
      }
      else{
        _this.setState({open:true,login:false})
        alert('用户名或密码错误')
      }
     
  })
  }

render(){
  return (
  <Modal
    //closeIcon
    open={this.state.open}
    trigger={<Button style={{background:'#2F4050',color:'white'}} icon='circle' content={this.state.login?'':'登录'} onClick={()=>{this.state.login?this.setState({login:false}):this.setState({login:false})}}></Button>}
    onClose={() => this.setState({open:false})}
    onOpen={() => {this.state.login?this.setState({open:false}):this.setState({open:true})}}
  >
    <Header icon='archive' content='登录页面' />
    <Modal.Content>
    <Form style={{position:'relative',left:'15%'}}>
            <Form.Field style={{width:'70%',zIndex:'999'}}>
            <label >用户名</label>
            <Input focus placeholder='请输入用户名' 
            onChange={(e,data)=>{
                const {value} = data
                this.setState({userName:value})
            }} ></Input>
            </Form.Field>
            <Form.Field style={{width:'70%',zIndex:'999'}}>
            <label>密码</label>
            <Input focus placeholder='请输入密码'
            onChange={(e,data)=>{
              const {value} = data
              this.setState({userPassword:value})
            }}
            type="password"></Input>
            </Form.Field>
            
    </Form>
    </Modal.Content>
    <Modal.Actions>
     {/* <Button color='green' onClick={() => this.setState({open:false,login:true})}>*/}
     <Button color='green' onClick={()=>{this.login()}}>
        <Icon name='checkmark' /> 登录
      </Button>
    </Modal.Actions>
  </Modal>
)
}
     
}