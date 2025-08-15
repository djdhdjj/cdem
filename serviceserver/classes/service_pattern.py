import os
import re
import random
import traceback
from collections import defaultdict

from classes.instance_base import InstanceBase, Instance, ObjectProperty
from classes.nameConfig import name_config
from classes.selector import Selector
from tools.common_function import default_none
from tools.file_manager import file_manager


class ServicePattern(InstanceBase):
    def __init__(self, name, workspace, config=None):
        InstanceBase.__init__(self, workspace, config)

        if config is None:
            config = {}
        self.workspace = workspace

        self.key2node = defaultdict(default_none)
        self.key2rel = defaultdict(default_none)
        self.data = None
        self.name = name

        self.elements = {}
        # self.config = config

        self.evaluate_config = {}
        self.resource_config = {}
        return

    # 可能会深拷贝一些其他东西
    def clone(self):
        # workspace = self.workspace
        # self.workspace = None
        # new_s = deepcopy(self)

        # new_s.workspace = workspace
        # self.workspace = workspace 

        return self

    @property
    def start_events(self):
        return self.instances.findAll(lambda elm: name_config.StartEvent in elm.type)

    @property
    def json_path(self):
        return os.path.join(self.workspace.pattern_path, self.name) + '.json'

    def createInstance(self, data):
        category = data['category']
        key = data['key']
        new_n = category2class[category](self, data)

        self.instances.add(new_n)
        self.key2node[key] = new_n

        new_n._is_pattern_node = True
        return new_n

    def createRelation(self, data):
        new_r = PatternRelation(self, data)

        key = data['key']
        self.key2rel[key] = new_r

        self.obj_properties.add(new_r)
        self.obj_property_index[new_r.source].add(new_r)
        self.obj_property_index[new_r.target].add(new_r)

        return new_r

    def loadJson(self, data):
        if 'config' in data:
            self.config = data['config']

        if 'elements' in data:
            self.elements = data['elements']

        node_data = data['nodes']
        link_data = data['links']

        if 'evaluate_config' in data:
            self.evaluate_config = data['evaluate_config']

        if 'resource_config' in data:
            self.resource_config = data['resource_config']

        for n_d in node_data:
            if n_d is None:
                continue
            category = n_d['category']
            if category == 'Pool':
                self.data = n_d
                continue
            self.createInstance(n_d)

        for r_d in link_data:
            self.createRelation(r_d)

    def loadJsonFile(self):
        data = file_manager.readJson(self.json_path)
        self.loadJson(data)
        return

    def findNodeByCategory(self, category):
        return Selector([i for i in self.instances if i.category == category])

    def findRelByCategory(self, category):
        return Selector([r for r in self.obj_properties if r.category == category])

    def save(self):
        file_manager.save_json(self.toJson(), os.path.join(self.workspace.pattern_path, self.name + '.json'))

    def toJson(self):
        data = [n.toJson() for n in self.key2node.values() if n is not None]
        data.append(self.data)

        # 我也不知道为啥有None
        data = [n for n in data if n is not None]
        # print(data, self.key2node)
        return {
            'config': self.config,
            'nodes': data,
            'links': [r.toJson() for r in self.key2rel.values()],
            'evaluate_config': self.evaluate_config,
            'resource_config': self.resource_config,
            'elements': self.elements,
        }

    def super2Json(self):
        return InstanceBase.toJson(self)

    # funcs below are from XM
    # find the nodes with no subsequent nodes 
    def findNodeByOrder(self, order='last'):
        if order == 'first':
            node_list = [r.targetNode for r in self.findRelByCategory('controlFlow')]  # could be optimized by changing list to set
        else:  # find the last nodes by default
            node_list = [r.sourceNode for r in self.findRelByCategory('controlFlow')]  # could be optimized by changing list to set
        return self.instances.findAll(lambda elm: elm not in node_list)

    def findRelByType(self, type1):
        return self.obj_properties.findAll(lambda r: r.type == type1)

    @property
    def participant_classes(self):
        # print(self.findNodeByCategory('Lane'))
        return self.findNodeByCategory('Lane').map(lambda elm: elm.participant_class)


class PatternObject(Instance):
    def __init__(self, service_pattern, data=None):
        if data is None:
            data = {}
        Instance.__init__(self, service_pattern)

        self.service_pattern = service_pattern

        self.loadJson(data)

        self.sim_instance_classes = Selector()  # 用于存仿真的实例对应的class
        return

    # 所在的泳道
    @property
    def swimlane(self):
        if 'group' not in self.data:
            return None
        # todo:为啥self.group不能用
        return self.service_pattern.key2node[self.data['group']]

    # 获得participant的type
    @property
    def participant_class(self):
        if self.swimlane is None:
            return Selector()
        return self.swimlane.participant_class

    # 获得仿真中给participant的创建的实例
    @property
    def participant_instances(self):
        if self.swimlane is None:
            return Selector()
        return self.swimlane.participant_instances

    # 获得仿真过程中的真实实例
    @property
    def deployed_participant_instances(self):
        ret = self.participant_instances.total(lambda elm: elm._init_instances, Selector())
        return ret

    def __str__(self):
        return 'PatternObject[{}@{}@{}]'.format(self.service_pattern.name, self.type, self.name)

    def execution(self, arg=None):
        self.args.update(arg)

        name = '基础领域术语库/execution'
        if name in self.name2data_properties:
            self.name2data_properties[name].get_val()

    @property
    def nexts(self):
        s_p = self.service_pattern
        cfs = s_p.findRelByCategory('controlFlow')
        return cfs.findAll(lambda r: r.sourceNode == self)

    # todo: 应该要结合环境判断,如何duration还没到就会返回自身
    def getProcessNexts(self, process, token):
        # print(self, self.nexts)
        return self.nexts.map(lambda elm: elm.targetNode)

    # 对应概念, todo: 以后应该是可以多选的
    @property
    def type(self):
        # print(self.data['type'])
        if 'type' not in self.data:
            print('error', self.name, '没有type')
            return []
        # []
        return self.data['type']  # 就很奇怪出现过[[type]]

    def toJson(self):
        return self.data

    # funcs below are from XM
    # find the subsequent nodes in the controlflow
    @property
    def nextNodes(self):
        return [r.targetNode for r in self.service_pattern.findRelByCategory('controlFlow') if r.sourceNode is self]

    # find the target nodes for an object
    @property
    def targetNodes(self):
        return [r.targetNode for r in self.service_pattern.key2rel.values() if r.sourceNode is self]

    # find the source nodes in an object
    @property
    def sourceNodes(self):
        return [r.sourceNode for r in self.service_pattern.key2rel.values() if r.targetNode is self]

    def getAssessParams(self, param_name):
        s_p = self.service_pattern
        try:
            source_dict = s_p.evaluate_config[self.data['key']][param_name]
            result_dict = {}
            result_dict['distribution'] = source_dict['type']
            result_dict['ratio'] = 1
            if source_dict['type'] == 'polynomial' or source_dict['type'] == 'binomial':
                temp_list = re.split('[.,; \[\]\(\)\{\}]', source_dict['array'])
                try:
                    result_dict['param_list'] = [float(i) for i in temp_list if i != '']
                except:
                    result_dict['param_list'] = [i for i in temp_list if i != '']
            elif source_dict['type'] == 'poisson' or source_dict['type'] == 'exponential' or source_dict['type'] == 'constant':
                result_dict['param_list'] = [float(source_dict['n'])]
            elif source_dict['type'] == 'uniform':
                result_dict['param_list'] = []
                result_dict['param_list'].append(float(source_dict['n']))
                result_dict['param_list'].append(float(source_dict['m']))
            elif source_dict['type'] == 'gaussian':
                result_dict['param_list'] = []
                result_dict['param_list'].append(float(source_dict['mu']))
                result_dict['param_list'].append(float(source_dict['sigma']))
            else:
                raise
        except:
            # print('distribution not included or parameters wrong')
            result_dict = {
                "distribution": "uniform",
                "param_list": [0.5, 1.0],
                "ratio": 1
                }
        return result_dict


    @property
    def duration_params(self):
        return self.getAssessParams('duration')

    @property
    def cost_params(self):
        return self.getAssessParams('cost')

    @property
    def carrier(self):
        # todo: 没有CarrierIs的鲁棒
        if 'objectProperty' not in self.data or 'CarrierIs' not in self.data['objectProperty']:
            return 'default'
        return self.data['objectProperty']['CarrierIs']

    @property
    def throughput_params(self):
        return self.getAssessParams('throughput')

    @property
    def reliability_params(self):
        return self.getAssessParams('reliability')

    @property
    def laneTypes(self):
        g = self.data['group']
        return self.service_pattern.key2node[g].type


class PatternRelation(PatternObject, ObjectProperty):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    @property
    def source(self):
        return self.sourceNode

    @property
    def target(self):
        return self.targetNode

    @property
    def sourceNode(self):
        s_p = self.service_pattern
        return s_p.key2node[self.data['from']]

    @property
    def targetNode(self):
        s_p = self.service_pattern
        return s_p.key2node[self.data['to']]

    @property
    def type(self):
        target, source = type(self.targetNode), type(self.sourceNode)

        tt_st_rt = [
            (Task, ResourceObject, 'resourceFlowOut'),
            (Task, DataObject, 'dataFlowOut'),
            (Task, CurrencyObject, 'currencyFlowOut'),

            (ResourceObject, Task, 'resourceFlowIn'),
            (DataObject, Task, 'dataFlowIn'),
            (CurrencyObject, Task, 'currencyFlowIn'),
        ]

        for t_t, s_t, r_t in tt_st_rt:
            if target is t_t and source is s_t:
                return r_t

        return 'controlFlow'


class SwimLane(PatternObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    @property
    def participant_class(self):
        return self.service_pattern.findByName(self.data['participant'])

    @property
    def participant_instances(self):
        return Selector(self.sim_instance_classes)


class Task(PatternObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    # todo: 之后应该不能用了，改用participant_class
    @property
    def participant(self):
        g = self.data['group']
        s_p = self.service_pattern
        return s_p.key2node[g]


class GateWay(PatternObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return


class ParallelGateWay(GateWay):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return


class ExclusiveGateWay(GateWay):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    @property
    def nexts(self):
        s_p = self.service_pattern
        condition = self.condition

        print('exclusive ', condition)
        cfs = s_p.findRelByCategory('controlFlow')
        if condition:
            return cfs.findAll(lambda r: r.sourceNode == self and r.controlFlowYes)
        else:
            return cfs.findAll(lambda r: r.sourceNode == self and r.controlFlowNo)


class Event(PatternObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return


class StartEvent(Event):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    def assignRole(self, participant, p_role):

        # 之后不应该只有随机
        role = {p.name: random.choice(p.deployed_participant_instances) for p in
                self.service_pattern.participant_classes}
        role[p_role] = participant

        return role

    def needStart(self, participant, model):
        step_count = model.step_count

        #  todo: 暂时的
        return True

        # todo: get请求可能有问题
        if self.circle_time is not None:
            if step_count % self.circle_time == 0:
                return True

        if self.date_time is not None:
            if step_count == self.date_time:
                return True

        if self.condition is not None:
            try:
                match_condition = eval(self.condition, {
                    'self': participant,
                    'start_event': self,
                    'model': model,
                })

                if match_condition:
                    return True
            except:
                traceback.print_exc()

        return False


class EndEvent(Event):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return


class ResourceObject(PatternObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    @property
    def volume_params(self):
        return self.getAssessParams('amount')


class DataObject(ResourceObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    @property
    def volume_params(self):
        return self.getAssessParams('amount')

class CurrencyObject(ResourceObject):
    def __init__(self, service_pattern, data=None):
        super().__init__(service_pattern, data)
        if data is None:
            data = {}
        return

    @property
    def volume_params(self):
        return self.getAssessParams('amount')

category2class = {
    'Lane': SwimLane,
    'task': Task,
    'dataObject': DataObject,
    'currencyObject': CurrencyObject,
    'resourceObject': ResourceObject,
    'parallel': ParallelGateWay,
    'exclusive': ExclusiveGateWay,
    'start': StartEvent,
    'end': EndEvent,
}
