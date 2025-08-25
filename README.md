## 代码安装
```bash
git clone git@github.com:djdhdjj/cdem.git
```

## ServiceClient
### 1. 服务地址配置
修改说明: 将183.129.253.170:6051改为192.168.9.26:8000（实际ip地址与server端运行时使用的端口号）。


### 2. 启动客户端
```bash
cd serviceclient
yarn install
screen -L -S client yarn start
```

## ServiceServer
### 1. 数据集下载与配置
**下载地址**: [https://github.com/djdhdjj/Service-Dataset]

**存放位置**: serviceserver\dataset

### 2. 词向量模型配置
**下载地址**: [https://pan.baidu.com/s/1QRt3_rWF4VKpyY1ERpVl_g]

**提取码**: 69tv

**存放位置**: 
- 将下载的 word2vec文件夹所包含内容，放置于 serviceserver\word2vec目录下。
- 将下载的 word2vec_back文件夹所包含内容，放置于 serviceserver\word2vec\word2vec_back目录下。
### 3. 安装环境
```bash
pip3 install -r requirements.txt
```

### 4. 运行后台
```bash
screen -L -S server 
# 绑定到指定IP（183.129.253.170）和端口（8000）
python3 manage.py runserver 183.129.253.170:8000
```
