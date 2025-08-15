## ServiceClient
### 启动客户端
```bash
yarn install
screen -L -S client yarn start
```

## ServiceServer
### 安装依赖
```bash
pip3 install -r requirements.txt  -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 运行后台
```bash
screen -L -S server 
python3 manage.py runserver 192.168.9.26:8000
```
