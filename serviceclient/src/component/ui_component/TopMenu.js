import React from "react";
import { Button, Segment, Menu, Icon, Header, Dropdown, Item, Grid } from 'semantic-ui-react';
import { autorun } from "mobx";
import { default_workspace } from "../../data/workspaceData";
import { pageManage, focus_page ,PageType} from "../../manager/PageManage";
import COLOR from "../../data/Color";
import WorkspaceData from "../../data/workspaceData"
import net_work from "../../manager/netWork"


export default class TopMenu extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            workspaceName: props.workspaceName
        }
        //this.workspace_data = ''
        this.workspace = props.workspace
        console.log('2222',this.workspace)
    }
    state = {
        focus_page: undefined
    }

    componentDidMount() {
        console.log(this)
        this.onFocusPageChangeListener = autorun(() => {
            let fp = focus_page.get()
            this.setState({ focus_page: fp })
            // console.log(fp)
        });

    }

    componentWillReceiveProps(nextProps){
        console.log('333',nextProps)
        this.workspace = nextProps.workspace
    }
    //关闭所有界面
    closeAllPage() {
        pageManage.closeAllPage()
        pageManage.refresh()
    }
    //关闭当前界面
    closeCurrentPage() {
        const { focus_page } = this.state
        let page = focus_page && focus_page.props.page
        if (page) {
            pageManage.closePage(page.path)
            pageManage.refresh()
        }
    }

    render() {
        const {editEstChange} = this.props
        const { focus_page } = this.state
        let page = focus_page && focus_page.props.page
        const inner_page = focus_page && focus_page.refs.detail
        let type = page && page.type.type
        console.log('type',page)
        //default_workspace.loadByNetwork()
        const workspace= this.workspace
        //workspace_data.loadByNetwork()
        const header = <Menu.Item header key='header'>菜单栏</Menu.Item>
        const save_button = <Menu.Item name='保存'
            key='save_button'
            onClick={() => {
                //console.log('wd',default_workspace)
                //console.log('save',default_workspace.toJson())
                //default_workspace.saveByNetwork()
                //console.log('wd',workspace)
                //console.log(typeof(workspace))
                workspace.saveByNetwork()
                //this.callingMethod('save')
            }} />
        const simulate_button = <Menu.Item name='仿真'  key='simulate_button'/>
        
        const est_button = <Menu.Item name='模式评估' key ='est_button'
            onClick={()=>{
            const path ='模式评估\\'+'模式评估'
            const new_page = pageManage.openPage(path,PageType.estimateConfig)
            //new_page.localInfo.workspace_data = default_workspace
            new_page.localInfo.workspace_data = workspace
            console.log('newpage',new_page.localInfo.workspace_data)
            new_page.localInfo.bean = new_page.localInfo.workspace_data.assessedResults
            pageManage.refresh()
        }}/>

        const page_management = (
            <Dropdown item text='页面管理' key='页面管理'>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={() => this.closeCurrentPage()}>关闭当前</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.closeAllPage()}>关闭全部</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        )

        let edit = null
        if (type === 'modelDetail') {
            edit = (
                <Dropdown item text='编辑' key='编辑'>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => this.callingMethod('import')}>导入</Dropdown.Item>
                        <Dropdown.Item onClick={() => this.callingMethod('export')}>导出</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }
        // console.log(type)
        edit = (
            <Dropdown item text='编辑'>
                <Dropdown.Menu>
                    <Dropdown.Item>推理</Dropdown.Item>
                    <Dropdown.Item>校验</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.callingMethod('import')}>导入</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.callingMethod('export')}>导出</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        )
        if (type === 'ontologyDetail') {
            edit = (
                <Dropdown item text='编辑'>
                    <Dropdown.Menu>
                        <Dropdown.Item>推理</Dropdown.Item>
                        <Dropdown.Item>校验</Dropdown.Item>
                        <Dropdown.Item onClick={() => this.callingMethod('import')}>导入</Dropdown.Item>
                        <Dropdown.Item onClick={() => this.callingMethod('export')}>导出</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }

        let nav_container = [
            header,
            edit,
            page_management,
            save_button,
            simulate_button,
            est_button
        ]

        if(type === 'modelDetail'){
            nav_container.push(
                <Menu.Item name='编辑评估参数' onClick={() => inner_page.showEvaluateConfig()}/>
            )
        }

        if(type === 'simulateConfig'){
            nav_container.push(
                <Menu.Item name='导出' onClick={() => console.log(JSON.stringify(inner_page.simulator.toJson()))}/>
            )
        }
        nav_container.push(
            <Menu.Item name='控制台' 
            key ='consoleDisplay'
            onClick={() => this.props.consoleDisplay()}/>
        )
        return (
            <Menu inverted style={{zIndex:'999',background:'#2F4050',margin:'0',border:0,padding:'0',height:'50px',borderRadius:0}}>
                {nav_container}
            </Menu>
        )
    }
}
