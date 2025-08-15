部署在服务器的代码

	npm run build
	nohup serve -s build -l 6052&
## 目前还要做的
<!-- * ~~模式的数据导入导出~~ -->
<!-- * ~~右键菜单栏的样式~~ -->
<!-- * ~~模式中实例的属性编辑(在concept里面有默认值)~~ -->
* 模式融合
<!-- * ~~加一个sub_process是不是就好ami了~~ -->
* 模式仿真
<!-- * ~~领域概念库~~ -->
<!-- * ~~目标，资源和人绑定~~ -->
<!-- * ~~全局属性的确定：名字，涉及的概念~~ -->
* 参与者的name，目标，资源，组织
<!-- * ~~载体（所属机构）~~ -->
<!-- * ~~资金流，价值流，数据流(单进单出,size,type[json]), 加一个resource object~~ -->
<!-- * ~~value是最后算出来的，现在的叫currency~~ -->
<!-- * ~~跟已有的证明 ~~ -->
* 中间事件，里程碑
<!-- * ~~加上关闭某个页面~~ -->
* 完成村淘的case
<!-- * ~~key前面要加一个 模式名/key~~ -->
* ~~data_object选择之后能选的属性好少呀，也没有继承原来的属性~~
<!-- * ~~导入的时候有问题~~ -->
<!-- * ~~拖动task后会报错~~ -->
<!-- * ~~导入数据之后没有图像~~ -->
<!-- * ~~现在模式的页面一关就没有保存~~ -->
<!-- * ~~模式的page没加名字~~ -->
<!-- * ~~以后所有的查找都要用id_name~~ -->
<!-- * ~~还需要有校验的功能~~ -->
* 现在还没有考虑一致性（改名）的问题
<!-- * ~~给现在的BPMN的node加一个默认的type~~ -->
<!-- * ~~评估参数配置~~ -->
* BPMN的node的type是多选的
<!-- * ~~创建物流概念库报bug~~ -->
* 现在task锚点只有左右俩个
<!-- * ~~资源那几个object给个默认的文字，不然拖不动~~ -->
* gateway 那要加“是否”两个接口
* 线上文字可编辑，现在的线有点乱
<!-- * ~~仿真参数配置~~ -->
* 线类型的category应该改成概念上对应的
* 没有添加默认的值
* 仿真参数配置还需要完善
* BPMN概念不能改
* 根据领域/根据七个属性
* 只显示资源,价值
* 代码编辑功能
* 导入概念功能
* 默认的如amount不要放在其他概念库里面了
* 实例编辑没有删除
* 实例编辑太丑了
* start_event可以编辑子类
* 仿真定义那的num不管用
* 选择了参与者后自动生成泳道
* 定义脚本属性（一次性的/动态的）
* 应该还有个触发器的start event(or属性都加上，。混合类型的event)
* 跨group依然能选relation
* 加个保存反馈

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br/>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
