import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import {
    Router, Route
} from 'react-router-dom'
// import createHashHistory from 'history/createBrowserHistory';
import {createBrowserHistory, createHashHistory, createMemoryHistory} from 'history'
import HomePage from './component/HomePage'
import Login from './component/Login'
// import { OntologyGraph } from './data/Ontology/ontology';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
// import App from './App';

// var test = new OntologyGraph()
// test.init()
// console.log(test)
const hashHistory = createHashHistory();

// 路由
const MyRouter = ()=> (
    <Router history={hashHistory}>
        <div style={{width:'100%', height:'100%'}}>
            <Route match exact path="/" component={HomePage}/>
            {/* <Route match exact path="/test" component={App}/> */}
        </div>
    </Router>
)

ReactDOM.render(<MyRouter/>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
