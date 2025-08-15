import React from 'react';
import PaletteCtrler from '../func/paletteCtrler.ts';
import './PaletteCanvas.css'

import {eventNodeTemplateMap, taskNodeTemplateMap, gatewayNodeTemplateMap,objectNodeTemplateMap} from '../template/paletteElmTemplate.ts'
import {Card, Icon, List, Divider, Header} from 'semantic-ui-react'
import * as go from 'gojs';

export default class PaletteCanvas extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    componentDidMount() {
        // 其实大家用一个模板没事的
        const {eventNode} = this.refs
        const eventNodeCtrler = new PaletteCtrler(eventNode, eventNodeTemplateMap)
        eventNodeCtrler.palette.model = new go.GraphLinksModel([
            {category: 'start'}, {category: 'end'}
            ], []);
        this.eventNodeCtrler = eventNodeCtrler

        const {gatewayNode} = this.refs
        const gatewayNodeCtrler = new PaletteCtrler(gatewayNode, gatewayNodeTemplateMap)
        gatewayNodeCtrler.palette.model = new go.GraphLinksModel([
            {category: 'parallel'}, {category: 'exclusive'}
        ], []);
        this.gatewayNodeCtrler = gatewayNodeCtrler

        const {swimLaneNode} = this.refs
        const swimLaneNodeCtrler = new PaletteCtrler(swimLaneNode, gatewayNodeTemplateMap)
        swimLaneNodeCtrler.palette.model = new go.GraphLinksModel([
            { key: 1, text: "Pool", isGroup: true, category: "Pool", },
            { key: 2, text: "Lane", isGroup: true, category: "Lane", group: 1 },
            { key: 3, text: "Lane", isGroup: true, category: "Lane", group: 1 },
        ], []);
        this.swimLaneNodeCtrler = swimLaneNodeCtrler

        const {object} = this.refs
        const objectCtrler = new PaletteCtrler(object, objectNodeTemplateMap)
        objectCtrler.palette.model = new go.GraphLinksModel([
            {category: 'dataObject', text: 'dataObject'},{category: 'currencyObject', text: 'currencyObject'},{category: 'resourceObject', text: 'resourceObject'}
        ], []);
        this.objectCtrler = gatewayNodeCtrler

        const {taskNode} = this.refs
        const taskNodeCtrler = new PaletteCtrler(taskNode, taskNodeTemplateMap)
        taskNodeCtrler.palette.model = new go.GraphLinksModel([
            {category: 'task'}
        ], []);
        this.taskNodeCtrler = gatewayNodeCtrler
    }

    render() {
        const {title} = this.props
        return (
            <div className='palette'>
                <Header as='h3'>
                    {title}
                </Header>
                <List divided relaxed key='eventNode'>
                    <List.Item>
                        <List.Content>
                            <List.Header>事件:</List.Header>
                            <List.Description>
                                <div className='palette-canvas' ref='eventNode' style={{height: 200}}/>
                            </List.Description>
                        </List.Content>
                        <Divider />
                    </List.Item>
                </List>
                <List divided relaxed key='gatewayNode'>
                    <List.Item>
                        <List.Content>
                            <List.Header>网关:</List.Header>
                            <List.Description>
                                <div className='palette-canvas' ref='gatewayNode' style={{height: 200}}/>
                            </List.Description>
                        </List.Content>
                        <Divider />
                    </List.Item>
                </List>
                <List divided relaxed key='swim lane'>
                    <List.Item>
                        <List.Content>
                            <List.Header>泳道:</List.Header>
                            <List.Description>
                                <div className='palette-canvas' ref='swimLaneNode' style={{height: 100}}/>
                            </List.Description>
                        </List.Content>
                        <Divider />
                    </List.Item>
                </List>
                <List divided relaxed key='dataObject'>
                    <List.Item>
                        <List.Content>
                            <List.Header>对象 :</List.Header>
                            <List.Description>
                                <div className='palette-canvas' ref='object' style={{height: 280}}/>
                            </List.Description>
                        </List.Content>
                        <Divider />
                    </List.Item>
                </List>
                <List divided relaxed key='taskNode'>
                    <List.Item>
                        <List.Content>
                            <List.Header>任务 :</List.Header>
                            <List.Description>
                                <div className='palette-canvas' ref='taskNode' style={{height: 70}}/>
                            </List.Description>
                        </List.Content>
                        <Divider />
                    </List.Item>
                </List>
            </div>
        )
    }
}
