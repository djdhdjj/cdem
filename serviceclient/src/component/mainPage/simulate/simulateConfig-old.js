
import React from "react";
import { Modal, Button, Icon, Input, Segment, Header, Divider, Item, Checkbox, Dropdown, Grid, Form, Card, Menu, Select } from 'semantic-ui-react'
import COLOR from "../../../data/Color";
import { text } from "d3";
import Add from "../../ui_component/Add";

export default class SimulateConfig extends React.Component {
    constructor(props) {
        super(props)
        const { bean } = this.props
        this.service_pattern = bean.service_pattern
        this.simulator = bean //全部数据
        this.workspace = this.service_pattern.workspace //图
        this.instance_base = this.simulator.instance_base //应该是Instance界面要的数据

        this.pattern_instance_base = this.simulator.pattern_instance_base //初始创建的模式
        this.state = {
            instance_base: this.instance_base,
            pattern_instance_base: this.pattern_instance_base,
            search_value: '',
            search_type: '',
            activeInstance: 'model',
            type_options: [],
            selectedInstance: {}
        }

        //console.log(this.pattern_instance_base, this.instance_base.toJson())

    }


    componentDidMount() {
        const { diagramDiv } = this.refs
        this.controller = this.service_pattern.initDiagram(diagramDiv)

        // todo: 这里不应该是这样的
        this.controller.init({handleSelectedChange: (d) => this.handleSelectedChange(d)}, null)
        // console.log
        // this.controller.drawModel(this.service_pattern._data)
        this.service_pattern.drawModel()
        this.diagram = this.controller.diagram
    }

    handleInstanceTypeChange(e, { value }) {
        this.setState({ activeInstance: value })
    }

    handleSelectedChange(selectedInstance) {
        this.setState({selectedInstance: selectedInstance})
    }

    render() {
        const { instance_base, search_value, activeInstance, pattern_instance_base, search_type, type_options, selectedInstance } = this.state
        const { service_pattern, simulator, workspace, } = this
        if (!service_pattern || !simulator) {
            //console.error(service_pattern, simulator, '为空')
            return
        }

        // console.log(activeInstance)

        // const wrapOptions = elm => elm.map(elm => ({
        //     key: elm.name,
        //     text: elm.name,
        //     value: elm.name,
        //     obj: elm,
        // }))
        // , ...wrapOptions(instance_base.groups)
        let instance_options = [] //[...wrapOptions(all_instances)]

        let groups = [], instances = []

        switch (activeInstance) {
            // case 'all':
            //     groups = [...instance_base.groups, ...pattern_instance_base.groups]
            //     instances = [...instance_base.instances, ...pattern_instance_base.instances]
            //     break;
            case 'other':
                groups = instance_base.groups
                instances = instance_base.instances
                break;
            case 'model':
                groups = pattern_instance_base.groups
                instances = pattern_instance_base.instances
                break;
        }

        // console.log(activeInstance, groups, instances)
        // console.log(all_concepts, concept_options)

        return (
            <div className='component-container' style={{
                display: 'grid',
                gridTemplateRows: '45px 50% auto',
                background: COLOR.DIRTY_WHITE,
            }}>
                <div>
                    <Menu style={{ margin: 0 }} pointing secondary>
                        <Menu.Item>
                            {simulator.name + '(' + service_pattern.name + ')'}
                        </Menu.Item>

                        <Menu.Item
                            name='模式要素'
                            value='model'
                            active={activeInstance === 'model'}
                            onClick={this.handleInstanceTypeChange.bind(this)}
                        />
                        <Menu.Item
                            name='实例'
                            value='other'
                            active={activeInstance === 'other'}
                            onClick={this.handleInstanceTypeChange.bind(this)}
                        />
                        <Menu.Item
                            name='参数配置'
                            value='setting'
                            active={activeInstance === 'setting'}
                            onClick={this.handleInstanceTypeChange.bind(this)}
                        />
                        {/*<Menu.Item*/}
                            {/*name='全部'*/}
                            {/*value='all'*/}
                            {/*active={activeInstance === 'all'}*/}
                            {/*onClick={this.handleInstanceTypeChange.bind(this)}*/}
                        {/*/>*/}


                        <Menu.Menu position='right'>
                            <Menu.Item>
                                <Button basic
                                    onClick={() => {
                                        instance_base.createGroup()
                                        this.setState({ groups })
                                    }}
                                >添加Group</Button>
                                <Button basic
                                    onClick={() => {
                                        instance_base.createInstance()
                                        this.setState({ groups })
                                    }}
                                >添加Instance</Button>
                                <Button basic
                                        onClick={() => {
                                            instance_base.deleteSelection()
                                            this.setState({ groups })
                                        }}
                                >删除</Button>
                            </Menu.Item>
                            <Menu.Item>
                                <Input icon='search' placeholder='Search...'
                                value={search_value}
                                onChange={(e, {value})=>{
                                    this.setState({search_value: value})
                                }}
                                />
                            </Menu.Item>
                            {/* <Menu.Item>
                                <Select options={type_options} value={search_type}
                                    onClick={() => {
                                        let all_types = [...instance_base.all_instances, ...pattern_instance_base.all_instances].reduce((total, { type }) => [...total, ...type], [])
                                        all_types = new Set(all_types)
                                        all_types = [...all_types]
                                        this.setState({
                                            type_options: all_types.map(elm => ({
                                                'key': elm,
                                                'text': elm,
                                                'value': elm,
                                            }))
                                        })
                                    }}
                                    onChange={(e, { value }) => this.setState({ search_type, value })}
                                />
                            </Menu.Item> */}
                        </Menu.Menu>
                    </Menu>

                </div>

                <div style={{ width: '100%', height: '100%', overflowX: 'hidden', padding: 10, overflowY: 'auto', background: COLOR.DIRTY_WHITE, borderRadius: 10 }}>

                    {
                        activeInstance !== 'setting' ?
                        <Card.Group>
                            {
                                groups.filter(elm => {
                                    return search_value === '' || elm.name.indexOf(search_value) !== -1 || elm.instances.some(elm => elm.name.indexOf(search_value) !== -1)
                                }).map(elm => {
                                    return <GroupComp key={elm.id} group={elm}
                                    />
                                })
                            }
                            {
                                instances.filter(elm => search_value === '' || elm.name.indexOf(search_value) !== -1).map(elm => {
                                    return <InstanceComp key={elm.id} instance={elm} selectedInstance={selectedInstance}
                                    />
                                })
                            }
                        </Card.Group>
                            :
                            <SimulatorSetting simulator={simulator}/>
                    }

                </div>
                <div ref="diagramDiv" style={{ width: '100%', height: '100%', background: COLOR.LIGHT_BLACK, borderRadius: 10 }} />
            </div>
        )
    }
}

class GroupComp extends React.Component {
    constructor(props) {
        super(props)
        const { group, } = this.props
        this.state = {
            group: group
        }
    }
    render() {
        const { group, } = this.state
        const { instances } = group
        const { is_pattern } = group.instance_base
        // console.log(group)
        return (
            <Card style={{ width: instances.length * 401 + 401, padding: 10, paddingRight: 25 }}>
                <Grid columns={instances.length + 1} >
                    <Grid.Column>
                        <div style={{ width: 401, padding: 10 }}>
                            <Form fluid>
                                <Form.Input
                                    label='Group Name'
                                    fluid
                                    value={group.name}
                                    onChange={(e, { value }) => {
                                        group.name = value
                                        this.setState({ group })
                                    }}
                                />
                                <Form.Input
                                    label='Number'
                                    fluid
                                    value={group.number}
                                    onChange={(e, { value }) => {
                                        group.number = parseInt(value)
                                        this.setState({ group })
                                    }}
                                />
                                <Form.Button basic size='small'
                                    onClick={() => {
                                        group.createInstance()
                                        this.setState({ group })
                                    }}
                                >添加 Instance</Form.Button>
                            </Form>
                        </div>
                    </Grid.Column>
                    {instances.map(elm => {
                        return <Grid.Column key={elm.id}>
                            <InstanceComp instance={elm}
                            />
                        </Grid.Column>
                    })}
                </Grid>
                {!is_pattern && <Checkbox
                    size='large'
                    style={{ position: 'absolute', zIndex: 30, top: 4, right: 4 }}
                    onChange={(e, d) => {
                        group.selecting = d.checked
                    }}
                />}
            </Card >
        )
    }
}

const wrapInstanceOptions = elm => elm.map(elm => ({
    key: elm.name,
    text: elm.name,
    value: elm.name,
    obj: elm,
})).filter(elm => elm.key && elm.key !== '')

const wrapConceptOptions = elm => Object.values(elm).map(elm => ({
    key: elm.id_name,
    text: elm.id_name,
    value: elm.id_name,
    obj: elm,
}))

class InstanceComp extends React.Component {
    constructor(props) {
        super(props)
        const { instance } = this.props
        const { workspace, is_pattern, simulator } = instance.instance_base

        // console.log(instance)
        let all_instance_options = wrapInstanceOptions(instance.instance_base.instances)
        if(instance.group){
            all_instance_options = [...wrapInstanceOptions(instance.group.instances), ...all_instance_options]
        }
        this.state = {
            instance: instance,
            all_instance_options:  all_instance_options,
            property_options: wrapConceptOptions(workspace.all_properties),
            concept_options: wrapConceptOptions(workspace.all_concepts),
            relation_options: wrapConceptOptions(workspace.all_relations),
            pattern_obj_options: [],
            // wrapInstanceOptions(this.props.instance.instance_base.instances),
        }
    }
    render() {
        const { instance, } = this.props
        const { data_properties, relations, type } = instance
        const { all_instance_options, property_options, concept_options, relation_options, pattern_obj_options } = this.state
        const { workspace } = instance.instance_base
        const { instance_base } = instance
        const { is_pattern, simulator } = instance_base
        const {node2binding_relations} = simulator
        const color = this.props.selectedInstance && this.props.selectedInstance[instance.name] ? 'blue' : undefined
        // console.log(type)
        // console.log(instance)
        return (
            <Card color={color} style={{ width: 401, padding: 10 }}>
                {
                    !is_pattern && <Checkbox
                        size='large'
                        name='delete'
                        style={{ position: 'absolute', zIndex: 30, top: 4, right: 4 }}
                        onChange={(e, d) => {
                            instance.selecting = d.checked
                        }}
                    />
                }
                <Form>
                    <Form.Group widths='equal'>
                        <Form.Input
                            label='Instance Name'
                            fluid
                            value={instance.name}
                            onChange={(e, { value }) => {
                                instance.name = value
                                this.setState({ instance })
                            }}
                        />
                        <Form.Select
                            style={{background: '#e0dfe8'}}
                            label='Type'
                            options={concept_options}
                            value={type}
                            multiple
                            search
                            onChange={(e, { value }) => {
                                instance.type = value
                                this.setState({ instance })
                            }}
                            fluid
                            onClick={() => {
                                const { all_concepts } = workspace
                                this.setState({
                                    concept_options: wrapConceptOptions(all_concepts),
                                })
                            }}
                        />
                    </Form.Group>
                    <Form.Button basic size='small' fluid
                        onClick={() => {
                            instance.data_properties[''] = ''
                            this.setState({ instance })
                        }}>
                        添加 Data Property
                    </Form.Button>
                    {
                        Object.keys(data_properties).map(p_n => {
                            // console.log(p_n, data_properties, data_properties[p_n])
                            return (
                                <Form.Group widths='equal' key={p_n}>
                                    <Form.Select options={property_options} value={p_n} fluid
                                        search
                                        onChange={(e, { value }) => {
                                            data_properties[value] = data_properties[p_n]
                                            delete data_properties[p_n]
                                            //console.log(instance)
                                            this.setState({ instance })
                                        }}
                                        onClick={() => {
                                            const { all_properties } = workspace
                                            this.setState({
                                                property_options: wrapConceptOptions(all_properties),
                                            })
                                        }}
                                    />
                                    <Form.Input fluid value={data_properties[p_n]}
                                        onChange={(e, { value }) => {
                                            data_properties[p_n] = value
                                            this.setState({ instance })
                                        }} />
                                </Form.Group>
                            )
                        })
                    }

                    <Form.Button basic size='small' fluid
                        onClick={() => {
                            let new_r = instance_base.createRelation()
                            new_r.source = instance.name
                            this.setState({ instance })
                        }}
                    >添加 Object Property</Form.Button>
                    {
                        instance.out_relations.map(elm => (
                            <Form.Group widths='equal' key={elm.id}>
                                <Form.Select options={relation_options} fluid
                                    search
                                    onClick={() => {
                                        const { all_relations } = workspace
                                        this.setState({
                                            relation_options: wrapConceptOptions(all_relations),
                                        })
                                    }}
                                    value={elm.type}
                                    multiple
                                    onChange={(e, { value }) => {
                                        elm.type = value
                                        this.setState({ instance })
                                    }}
                                />
                                <Form.Select options={all_instance_options} fluid
                                    search
                                    value={elm.target}
                                    onClick={() => {
                                        this.setState({
                                            all_instance_options: [
                                                ...wrapInstanceOptions(instance.instance_base.instances),
                                                ...wrapInstanceOptions(instance.group.instances)
                                            ],
                                        })
                                    }}
                                    onChange={(e, { value }) => {
                                        if (elm.source ===instance.name) {
                                            elm.target = value
                                        } else {
                                            elm.source = value
                                        }
                                        //console.log(instance)
                                        this.setState({ instance })
                                    }}
                                />
                            </Form.Group>
                        ))
                    }
                    {
                        is_pattern && (
                            <Form.Select
                                search
                                fluid
                                multiple
                                label='Bind to'
                                options={pattern_obj_options}
                                placeholder='Bind to'
                                value={node2binding_relations[instance.name] || []}
                                onChange={(e, {value})=> {
                                    node2binding_relations[instance.name] = value
                                    this.setState({instance})
                                }}
                                onClick={() => {
                                    const { instance_base } = simulator
                                    const { instances } = instance_base
                                    this.setState({ pattern_obj_options: wrapInstanceOptions(instances) })
                                }}
                            />
                        )
                    }
                </Form>
            </Card>
        )
    }
}

class SimulatorSetting extends React.Component {
    constructor(props) {
        super(props)
        this.simulator = this.props.simulator
        this.state = {
            simulator: this.simulator,
            newPropsName: '',
            newProps: {
                maxStep: null,
                maxTime: null,
            }
        }
    }
    render() {
        const { simulator, newProps,newPropsName } = this.state
        return <Form fluid>
            <Form.Input
                label='Id'
                fluid
                disabled
                value={simulator.id}
            />
            <Form.Input
                label='Name'
                fluid
                value={simulator.name}
                disabled
            />
            <Add add={(name) => {
                newProps[name] = null
                this.setState({newProps: newProps})
            }}/>
            {
                Object.keys(newProps).map(key =>
                    <Form.Input
                        label={key}
                        fluid
                        value={newProps[key]}
                        onChange={(e, { value }) => {
                            newProps[key] = value
                            this.setState({ newProps: newProps })
                        }}
                    />
                )
            }
            <Form.Button basic size='small'
                         onClick={() => {
                             const {config} = simulator
                             Object.keys(newProps).forEach(key => {
                                 config[key] = newProps[key]
                             })
                         }}
            >保存</Form.Button>
        </Form>
    }
}
