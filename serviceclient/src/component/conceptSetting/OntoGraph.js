import React from "react";
import { ResizeObserver } from "resize-observer";
import DiagramCtrler from "./graph/diagramCtrler.ts";
import COLOR from "../../data/Color";

export default class OntoGraph extends React.Component {
    componentDidMount() {
        const { diagramDiv } = this.refs
        this.modelDscp = this.props.modelDscp
        this.controller = new DiagramCtrler(diagramDiv, this.modelDscp)
        this.controller.init()
        this.controller.drawModelDscp()
        this.diagram = this.controller.diagram
        this.addResizeListener()
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.modelDscp !== this.props.modelDscp) {
            this.modelDscp = this.props.modelDscp
            this.controller.modelDscp = this.modelDscp
            this.controller.drawModelDscp()
        }
    }

    // 使图像在拖动的时候强制刷新
    addResizeListener() {
        if (!this.ro) {
            const ro = new ResizeObserver((event, value) => {
                const { diagram } = this
                // const { height, width } = event[0].contentRect
                diagram.requestUpdate()
                // diagram.zoomToFit()
                // this.setState({width: width, height: height})
            })
            ro.observe(this.refs.diagramDiv)
            this.ro = ro
        }
    }

    render() {
        return <div className='diagramDiv' ref="diagramDiv" style={{ height: '100vh', background: COLOR.LIGHT_BLACK }}/>
    }
}
