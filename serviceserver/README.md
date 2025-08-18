## ServiceServer
### 1. 数据集下载与配置
**下载地址**: [https://github.com/djdhdjj/Service-Dataset]

**存放位置**: serviceserver\dataset

### 2. 词向量模型配置
**下载地址**: [https://pan.baidu.com/s/1YmnvFtRoMuW1M-1-PMOL0Q]

**提取码**: 4kx8 

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
# 绑定到指定IP（192.168.9.26）和端口（8000）
python3 manage.py runserver 192.168.9.26:8000
```
