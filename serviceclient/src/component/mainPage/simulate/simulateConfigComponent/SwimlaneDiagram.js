//渲染泳道图

import React from "react";
import COLOR from "../../../../data/Color";

export default class SwimlaneDiagram extends React.Component {
    constructor(props) {
        super(props);
        this.service_pattern=this.props.service_pattern;
    }
    handleSelectedChange(d){
        //console.log("泳道图选中：")
        //console.log(d)
        if(Object.keys(d).length>0)
            this.props.share.typeElementLeft.activateByName(Object.keys(d)[0])
    }
    componentDidMount() {
        const { diagramDiv } = this.refs
        this.controller = this.service_pattern.initDiagram(diagramDiv)
        this.controller.init({handleSelectedChange: (d) => this.handleSelectedChange(d)}, null)
        this.service_pattern.drawModel()
        this.diagram = this.controller.diagram
    }
    render(){
        return <div ref="diagramDiv" style={{ width: '100%', height: '100%', background: '#e0dfe8', borderRadius: 10 }} />
    }

}
