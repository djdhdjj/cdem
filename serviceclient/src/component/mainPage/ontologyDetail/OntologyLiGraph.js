import React from "react";
import OntologyData from "./OntologyData";
import * as d3 from 'd3';
import COLOR from "../../../data/Color";
import ForceSimulation from './forceSimulation';
import { Button, Checkbox, Menu, Icon, Header, Dropdown, Item, Grid } from 'semantic-ui-react';
export default class OntologyLiGraph extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            type:false,
        }
        this.type=false;
    }
    componentDidMount() {
        this.print();

    }
    print(){
        this.ontologyGraph = this.props.ontologyGraph
        this.controller = new OntologyData(this.ontologyGraph)
        this.controller.draw_concept();
        this.controller.draw_realtion();
        const data=this.controller.draw_property();
        this.forceSimulation = new ForceSimulation(data.elms,data.relations,this.type);
    }
    componentWillReceiveProps (props){
        switch(props.tip){
            case 0:
                break;
            default:
                this.forceSimulation.removeold();
                this.print();
                break;
        }
    }
    componentWillUpdate(){
        this.type=!this.type;
        this.forceSimulation.removeold();
        this.print();
    }

    render() {
        return  <div className='dialigramDiv' id="dialigramDiv" ref="dialigramDiv" style={{width: '100%', height: '100%' ,background:"#506273"}}>
                <font color="#EEFFFF"><Checkbox  style={{top:"2px"}} onClick={(e)=>this.setState({type:!this.state.type})}/>&nbsp;&nbsp;节点可拖拽</font>
                </div>
    }
}
