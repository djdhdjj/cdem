import React from "react";
import { Table, Accordion, Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select, Label, Rail } from 'semantic-ui-react'
import WatcherEditor from "./WatcherEditor";
import {TextFactory,simulate_dictionary} from '../../../../data/dictionary'
import { Popover } from 'antd';
import '../simulateResult.css'

export default class SimulateWatcher extends React.Component {
    constructor(props) {
        super(props)
        this.textFactory = new TextFactory(simulate_dictionary)
        this.state = { promptHeader: '', promptContent: '', promptOpen: false }
    }
    openPrompt(header, content) {
        this.setState({
            promptHeader: header,
            promptContent: content,
            promptOpen: true
        })
    }
    render() {
        const tf = this.textFactory
        return (
            <div className="watcher">
                <Menu pointing secondary className='headColor'>
                    <Menu.Item header>
                        {tf.str('watcher')}&nbsp;
                        <Popover content={tf.note('watcher')} >
                            <Icon fitted name='question circle outline' />
                        </Popover>
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item><WatcherEditor addWatcher={(quotaName,code,type,callback)=>this.props.addWatcher(quotaName,code,type,callback)}/></Menu.Item>
                    </Menu.Menu>
                </Menu>
                <div style={{ overflowY: 'auto' }}>
                    <Table compact='very' celled fixed >
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>{tf.str('Quota name')}</Table.HeaderCell>
                                <Table.HeaderCell>{tf.str('Value')}</Table.HeaderCell>
                                <Table.HeaderCell>{tf.str('Operation')}</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {
                                this.props.stepData!=undefined&&this.props.stepData.data.quota[this.props.stepData.step].map((elm, i) => {
                                    return (
                                        <Table.Row>
                                            <Table.Cell title={elm.name}>{elm.name}</Table.Cell>
                                            <Table.Cell title={formatJson(elm.val)} onClick={() => this.openPrompt(tf.str('Show Data'), formatJson(elm.val))}>{stringify(elm.val)}</Table.Cell>
                                            <Table.Cell><Icon name="file code" title={tf.str('Show Code')} onClick={() => this.openPrompt(tf.str('Show Code'), elm.text)} /></Table.Cell>
                                        </Table.Row>
                                    )
                                })
                            }
                        </Table.Body>
                    </Table>
                    {/*这是一个简单的对话框，可以通过this.openPrompt方法调出 */}
                    <Modal
                        header={this.state.promptHeader}
                        content={<div className="content"><pre>{this.state.promptContent}</pre></div>}
                        open={this.state.promptOpen}
                        onClose={() => this.setState({ promptOpen: false })}
                        actions={['OK']}
                    />
                </div>
            </div>
        )
    }
}

var stringify=function(obj){
    if(typeof(obj)!='object'){
        return obj
    }
    return JSON.stringify(obj)
}

var formatJson = function(json, options) {
    if(typeof(json)!='object'){
        return json
    }
    var reg = null,
    formatted = '',
    pad = 0,
    PADDING = ' ';
  options = options || {};
  options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
  options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
  if (typeof json !== 'string') {
   json = JSON.stringify(json);
  } else {
   json = JSON.parse(json);
   json = JSON.stringify(json);
  }
  reg = /([\{\}])/g;
  json = json.replace(reg, '\r\n$1\r\n');
  reg = /([\[\]])/g;
  json = json.replace(reg, '\r\n$1\r\n');
  reg = /(\,)/g;
  json = json.replace(reg, '$1\r\n');
  reg = /(\r\n\r\n)/g;
  json = json.replace(reg, '\r\n');
  reg = /\r\n\,/g;
  json = json.replace(reg, ',');
  if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
   reg = /\:\r\n\{/g;
   json = json.replace(reg, ':{');
   reg = /\:\r\n\[/g;
   json = json.replace(reg, ':[');
  }
  if (options.spaceAfterColon) {
   reg = /\:/g;
   json = json.replace(reg, ':');
  }
  (json.split('\r\n')).forEach(function (node, index) {
     var i = 0,
       indent = 0,
       padding = '';
     if (node.match(/\{$/) || node.match(/\[$/)) {
      indent = 1;
     } else if (node.match(/\}/) || node.match(/\]/)) {
      if (pad !== 0) {
       pad -= 1;
      }
     } else {
      indent = 0;
     }
     for (i = 0; i < pad; i++) {
      padding += PADDING;
     }
     formatted += padding + node + '\r\n';
     pad += indent;
    }
  );
  return formatted;
};