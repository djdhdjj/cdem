import React from "react";
import {  Divider, Form,Header, Label  } from 'semantic-ui-react'
import Add from "../../../ui_component/Add";
import {TextFactory,simulate_dictionary} from "../../../../data/dictionary"

export default class SimulatorSettings extends React.Component {
    constructor(props) {
        super(props)
        this.simulator = this.props.simulator
        this.textFactory=new TextFactory(simulate_dictionary)
        this.state = {
            simulator: this.simulator,
            newPropsName: '',
            newProps: this.getSettings()
        }
    }

    getSettings(){//
        if(Object.keys(this.simulator.config).length <= 2){
            Object.assign(this.simulator.config,{
                maxStep: null,
                maxTime: null,
            })
        }
        //console.log(this.simulator.config)
        return this.simulator.config
    }

    render() {
        const { simulator, newProps,newPropsName } = this.state
        const tf = this.textFactory
        return <Form fluid  className='customDark2'>
            <Form.Field>
                <label>{tf.str('Simulator Id')}</label>
                <Form.Input
                    //label={tf.str('Simulator Id')}
                    fluid
                    disabled
                    value={simulator.id}
                />
            </Form.Field>
            <Form.Field>
                <label>{tf.str('Simulator Name')}</label>
                <Form.Input
                    //label={tf.str('Simulator Name')}
                    fluid
                    value={simulator.name}
                    disabled
                />
            </Form.Field>

            <Divider />
            <Header as='h3' >{tf.str('Property Setting')}</Header>

            <Add 
                add={(name) => {
                    newProps[name] = null
                    this.setState({newProps: newProps})
            }}/>
            <Form.Input 
                    label={tf.str('max step')}
                    fluid
                    value={newProps['maxStep']}
                    onChange={(e, { value }) => {
                        newProps['maxStep'] = value
                        this.setState({ newProps: newProps })        
                    }}
                />
            {/*<Form.Input
                    label={tf.str('max time')}
                    fluid
                    value={newProps['maxTime']}
                    onChange={(e, { value }) => {
                        newProps['maxTime'] = value
                        this.setState({ newProps: newProps })
                    }}
                />*/}
            {
                Object.keys(newProps).map(key =>//config属性中name和id不是配置项，maxTime和maxStep是固有的，直接跳过
                    key === 'name'||key === 'id'||key === 'maxTime'||key === 'maxStep'||<Form.Input
                        label={key}
                        fluid
                        value={newProps[key]}
                        onChange={(e, { value }) => {
                            newProps[key] = value
                            this.setState({ newProps: newProps })
                            // console.log('aaa')
                            // console.log(this.simulator.config)
                        }}
                    />
                )
            }
            {/* <Form.Button basic size='small'
                         onClick={() => {
                             const {config} = simulator
                             Object.keys(newProps).forEach(key => {
                                 config[key] = newProps[key]
                             })
                         }}
            >{tf.str('Save')}</Form.Button> */}
        </Form>
    }
}