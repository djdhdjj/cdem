## ServiceClient
### 1. 服务地址配置
配置文件路径:serviceclient/src/manager/netWork.js

修改说明:在NetWork类的构造器中修改fetch_url字段：
```javascript
class NetWork {
    constructor() {
        // 设置后端服务IP地址及端口（格式：http://ip:port/）
        this.fetch_url = 'http://183.129.253.170:8000/'  // 修改此处配置
    }
    ...其他代码...
}
```

### 2. 启动客户端
```bash
yarn install
screen -L -S client yarn start
```