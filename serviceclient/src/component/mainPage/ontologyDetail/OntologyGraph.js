import React from "react";
import DiagramCtrler from "./diagramCtrler.ts";
import COLOR from "../../../data/Color";

export default class OntologyGraph extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            ddddd:"",
            dropdownVisible: false,
            dropdownValue: null,
            elmConceptData: null,
            insList: [],
            dropdownType: null
        }
    }
    componentDidMount() {
        //console.log("这里是树状图绘制区域")
        const { diagramDiv } = this.refs
        this.ontologyGraph = this.props.ontologyGraph
        this.controller = new DiagramCtrler(diagramDiv, this.ontologyGraph)
        this.controller.init()
        this.controller.draw_concept();
        this.controller.draw_realtion();
        this.controller.draw_property();
    }
    componentWillUpdate(props){
        //console.log(props.tip);
        switch(props.tip){
            case 1:
                this.controller.draw_addconcept(props.name);
                break;
            case 2:
                this.controller.draw_addrealtion(props.name);
                break;
            case 3:
                this.controller.draw_addproperty(props.name);
                break;
            case 4:
                this.controller.draw_concept();
                this.controller.draw_realtion();
                this.controller.draw_property();
                break;
            default:
                break;
        }
    }

    render() {
        return <div className='diagramDiv' ref="diagramDiv" style={{width: '100%', height: '100%' ,background:"#506273"}}/>
    }
}
