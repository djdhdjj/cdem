## ServiceClient
### 1. 服务地址配置
修改说明: 将183.129.253.170:6051改为192.168.9.26:8000（实际ip地址与server端运行时使用的端口号）。


### 2. 启动客户端
```bash
cd serviceclient
yarn install
screen -L -S client yarn start
```