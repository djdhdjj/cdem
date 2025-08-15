## 运行后台
```bash
python manage.py runserver 127.0.0.1:8000
```

## 结构
* test.py: 示例代码
* test_siwei.py: 谭思危再用的测试代码
* classes: 存了当前每个部分的类
   * workspace.py 存了总的数据，包括概念数据和服务模式，每次都要读这个
   * service_pattern.py: BPMN以及模式相关的数据
   * concept_base.py: 存了概念(术语)集合对应的类
   * instance_base.py: 实例集合对应的类
   * selector.py: 一个选择器，现在还没有用到
   * fusion_service_pattern.py: 模式融合对应的类
* dataset: 存了数据文件，里面一个文件夹对应一个工作区，如new
   * new: 一个workspace, 加载方式
      * concepts: 存了概念(术语)文件,文件名是术语库的名字, 对应ConceptBase类
      * patterns: 存了服务模式数据, 对应ServicePattern类
      * simulators: 存了一次仿真的配置数据，对应Simulator类
* tools: 存了一些共用的工具类
* servicesyserver: django里面存路由配置之类的文件夹
   * url.py: 存路由配置文件
   * view.py: 存暴露在http请求下的函数


# 一些示例
## 加载一个工作区，会读取工作区底下的所有概念、模式和仿真
   ```python
   work_space = WorkSpace('
   工作区的文件夹名', {})
   work_space.loadJsonFile()
   ```

# 未完成的工作
## 概念部分
* 校验
* 推理
## 模式部分
* 校验
* 融合
* 评估
## 仿真的部分
* 仿真的运行

    

## 模式融合
* 2020.06.28
* fusion_service_pattern.py 
* 目前完成：
  * 可以跑通，返回的是初始的测试数据格式，最后的结果由merge()函数返回内存数据
  * test.py 注明了调用方式
  * 返回结果为一个模式（还没做多个）
  * 参数说明：pattern_name1,pattern_name2,workspace,participant_dic,seq,rel,topic=None,theta=None,
     * pattern_name1: 模式1的文件名
     * pattern_name2: 模式2的文件名
     * workspace: 已实例化的工作区对象
     * participant_dic：两个模式的参与者映射（即模式1中的参与者a对应模式2中的参与者b）
     * seq: 两个模式的执行顺序（0表示同阶段，1表示模式1先执行，2表示模式2先执行）
     * rel:两个模式的关系（完全并行full_parallel、半并行semi_parallel、互斥exclusive、调用call,其中完全并行是并行执行且独立，半并行是指并行执行且会发生交叉）
     * topic: 暂时先不管（后续想做的改进，目前设置的是可选参数）
     * theta: 相似度阈值（还要再考虑怎么定值）
  * 目前测试数据集上做的修改：
     * 给每个节点加了text，specificCategory(比如lane代表参与者，但还可细分为消费者 提供者 监管者)
     * 给每条边加了type（原始的Link数据有的有category,有的没有，其实这两个属性意义相似，到时候看一下有没有必要整合）
* 后续要做的：
  * 在前端页面搞两个真实的模式，来做测试
  * 提高正确性与合理性（目前只是和测试数据做好衔接，有些东西为了衔接已删去，要在真实数据上跑一下再看看可不可以改进）
  * 根据参数的调节 返回多个模式结果（4个左右？）
  * 加入基于topic的模式匹配
  * 相似度阈值估计
  * 可视化布局算法（看看能不能搞出来，尽力！）