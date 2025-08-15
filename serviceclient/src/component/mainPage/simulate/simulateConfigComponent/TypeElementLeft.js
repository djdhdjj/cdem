import React from "react";
import { Accordion, Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select } from 'semantic-ui-react'
import TypeElementInstanceComponent from "./TypeElementInstanceComponent";

export default class TypeElementLeft extends React.Component {
  state = { activeIndex: 0 }
  constructor(props) {
    super(props)

    this.bean = this.props.bean
    this.instances = this.bean.pattern_instance_base.instances
    this.props.share.typeElementLeft=this
  }
  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state
    const newIndex = activeIndex === index ? -1 : index

    this.setState({ activeIndex: newIndex })
    //给Accordion.Title、Accordion.Content设置属性active={activeIndex === i}，可以控制展开与否
  }
  activateByName(instanceName){
    this.instances.map((elm, i) => {
      if(elm.id==instanceName){
        this.setState({activeIndex:i})
      }
    })
  }
  render() {
    const { activeIndex } = this.state;
    return (
      <Accordion fluid exclusive={false} >
        {this.instances.map((elm, i) => {
          return <div>
            <Accordion.Title
              active={activeIndex === i}
              index={i}
              onClick={this.handleClick}
              style = {{color:'black'}}
            >
              <Icon name='dropdown' />
              {elm.id}
            </Accordion.Title>
            <Accordion.Content active={activeIndex === i}>
              <TypeElementInstanceComponent key={elm.id} instance={elm} bean={this.props.bean}/>
            </Accordion.Content>
          </div>
        })}
      </Accordion>
    )
  }
}