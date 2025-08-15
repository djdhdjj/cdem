import traceback
import copy
from collections import defaultdict

from mesa import Agent

from classes.nameConfig import name_config
from classes.selector import Selector
from tools.common_function import genUniqueId, dict_update


class InstanceBase:
    def __init__(self, workspace, config=None):
        if config is None:
            config = {}
        self.workspace = workspace
        self.config = config

        self.instances = Selector()  # set()
        self.groups = Selector()  # set()

        self.obj_properties = Selector()  # set()
        self.obj_property_index = defaultdict(Selector)
        return

    def __str__(self):
        return 'InstanceBase:[{}@@i:{}, g:{}, r:{}]'.format(self.workspace.name, len(self.instances), len(self.groups),
                                                            len(self.obj_properties))

    # 实际实例化
    def deploy(self):
        return

    def findByName(self, name):
        for i in self.instances:
            if i.name == name:
                return i

        for g in self.groups:
            i = g.findByName(name)
            if i is not None:
                return i

    def loadJson(self, data):
        self.config = data['config']
        for i_d in data['instances']:
            n_i = self.createInstance()
            n_i.loadJson(i_d)

        for g_d in data['groups']:
            n_g = self.createGroup()
            n_g.loadJson(g_d)

        for r_d in data['relations']:
            self.createRelation(r_d)

        self.checkValid()
        return

    def checkValid(self):
        # name不能重名
        names = Selector()  # set()
        for i in self.instances:
            if i.name in names:
                print('error', i, i.name, '重名')
            names.add(i.name)

    # todo:
    def toJson(self):
        return {
            'config': self.config,
            'instances': [elm.toJson() for elm in self.instances],
            'groups': [elm.toJson() for elm in self.groups],
            'relations': [elm.toJson() for elm in self.obj_properties],
        }

    def createInstance(self):
        new_i = Instance(self)
        self.instances.add(new_i)
        return new_i

    def removeInstance(self, name):
        instance = self.findByName(name)
        self.instances.remove(instance)

        # 删除该Instance指向的其他Instance
        relations = instance.all_relations
        for r in relations:
            self.removeInstance(r.target)

    def createRelation(self, data):
        new_r = ObjectProperty(self)
        new_r.loadJson(data)

        self.obj_properties.add(new_r)

        self.obj_property_index[new_r.source].add(new_r)
        self.obj_property_index[new_r.target].add(new_r)

        return new_r

    def deleteRelation(self, r):
        self.obj_property_index[r.source].remove(r)
        self.obj_property_index[r.target].remove(r)
        self.obj_properties.remove(r)

    def createGroup(self):
        new_g = InstanceGroup(self)
        self.groups.add(new_g)
        return new_g


class InstanceTopObject(Agent):
    def __init__(self, instance_base):
        super().__init__(genUniqueId(), None)
        self.instance_base = instance_base
        self.args = {}
        self.name2data_properties = {}
        self.data = {
            'data_properties': {},
        }

        self._init_instances = Selector()  # set()

        self.sim_instance_classes = Selector()  # 为了仿真在前端创建的实例
        self.unique_id = genUniqueId()
        return

    def toJson(self):
        return self.data

    @property
    def _id(self):
        return self.unique_id

    def __hash__(self):
        return hash(self._id)

    def __str__(self):
        return 'InstanceObject:[{}@{}@{}]'.format(self.name, self._id, self.data)

    def __getstate__(self):
        return self.__dict__

    def __setstate__(self, state):
        self.__dict__.update(state)

    def __setattr__(self, name, value):
        prefix = '基础领域术语库/'
        full_name = prefix + name

        if 'data' in self.__dict__: 
            if name in self.__dict__['data']:
                self.__dict__['data'][name] = value
                return

            if full_name in self.__dict__['name2data_properties']:
                data_property = self.__dict__['name2data_properties'][full_name]
                data_property.set_val(value)
                return

        self.__dict__[name] = value

    def __getattr__(self, name):
        prefix = '基础领域术语库/'
        full_name = prefix + name

        if name in self.__dict__:
            return self.__dict__[name]
        elif name in self.__dict__['data']:
            return self.__dict__['data'][name]
        elif full_name in self.__dict__['name2data_properties']:
            data_property = self.__dict__['name2data_properties'][full_name]
            return data_property.get_val()
        else:
            return None

    @property
    def beans(self):
        return [self.workspace.findByName(t) for t in self.data['type']]

    @property
    def props(self):
        return self.data['data_properties']

    @property
    def workspace(self):
        return self.instance_base.workspace

    def loadJson(self, data):
        copy_data = copy.deepcopy(data)
        dict_update(self.data, copy_data)

        for name, prop in self.props.items():
            self.name2data_properties[name] = DataProperty(name, prop, self.args)
        return

    def belongTo(self, concept_uri):
        return any([b.belongTo(concept_uri) for b in self.beans])


class InstanceGroup(InstanceTopObject, InstanceBase):
    def __init__(self, instance_base):
        InstanceTopObject.__init__(self, instance_base)
        InstanceBase.__init__(self, instance_base.workspace)
        return

    def loadJson(self, data):
        super().loadJson(data)
        for i_d in data['instances']:
            new_i = self.createInstance()
            new_i.loadJson(i_d)
            new_i.group = self

        for g_d in data['groups']:
            n_g = self.createGroup()
            n_g.loadJson(g_d)


class DataProperty:
    def __init__(self, name, data, args):
        self.name = name
        self.data = data
        self.scope = args

    @property
    def prop_name(self):
        pos = self.name.index('/') + 1
        return self.name[pos:]

    def get_constant_func_str(self, val):
        return 'def ' + self.prop_name + '():\n    return ' + str(val)

    def get_func_str(self, func_body):
        func_name = 'def ' + self.prop_name + '():\n    '
        statements = func_body.strip().split('\n')
        joined = '\n    '.join(statements)

        # 不填内容时设置函数体为pass
        if len(joined) == 0:
            joined = 'pass'

        return func_name + joined

    def init_func(self):
        if self.data['type'] == 'value':
            val = eval(self.data['text'])
            func_str = self.get_constant_func_str(val)
        else:
            func_str = self.get_func_str(self.data['text'])

        try:
            exec(func_str, self.scope)
        except:
            print('In Init Func')
            print(self.name)
            print(self.data)
            traceback.print_exc()

        if self.data['type'] == 'computed':
            val = self.scope[self.prop_name]()
            exec(self.get_constant_func_str(val), self.scope)

    def set_val(self, n_val):
        if self.data['type'] == 'value':
            new_constant_func_str = self.get_constant_func_str(n_val)
            exec(new_constant_func_str, self.scope)

            self.data['text'] = str(n_val)

    def get_val(self):
        if self.prop_name not in self.scope:
            self.init_func()

        try:
            ret = self.scope[self.prop_name]()
            return ret
        except:
            print(self.name + ': Exception in data property')
            print('data: ', self.data)
            traceback.print_exc()
            return None


# todo: 现在还不能group套group
class ObjectProperty(InstanceTopObject):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        self.group = None
        return

    def clone(self):
        new_r = ObjectProperty(self.instance_base)
        new_r.loadJson(self.data)
        return new_r

    def loadJson(self, data):
        super().loadJson(data)
        if isinstance(self.source, str):
            self.source = self.instance_base.findByName(self.source)
        if isinstance(self.target, str):
            self.target = self.instance_base.findByName(self.target)

    # 是否是group内部的
    @property
    def is_inner(self):
        instances = self.group.instances
        return self.group is not None and self.source in instances and self.target in instances

    def toJson(self):
        j = dict_update({}, super().toJson())

        j.update({
            'source': self.source.name,
            'target': self.target.name,
        })
        return j

    def selfDelete(self):
        return self.instance_base.deleteRelation(self)


class Instance(InstanceTopObject):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        self.group = None

        # todo: 未来加上类型判断
        self._is_resource = False
        self._is_value = False
        self._is_participant = False
        self._is_goal = False
        self._is_task = False
        self._is_carrier = False

        self._is_pattern_node = Selector()

        self.using_process = Selector()

        self.args = {
            'self': self,
            'instance_base': self.instance_base
        }
        return

    def loadJson(self, data):
        super().loadJson(data)

    def clone(self):
        new_i = Instance(self.instance_base)

        rels = self.all_relations.map(lambda elm: elm.clone())

        def replace(rel):
            if rel.source == self:
                rel.source = new_i
            if rel.target == self:
                rel.target = new_i

        rels.all(replace)
        return new_i

    # 每个都有
    def step(self):
        name = '基础领域术语库/step'
        if name in self.name2data_properties:
            self.name2data_properties[name].get_val()

    @property
    def all_relations(self):
        instance_base = self.instance_base
        return instance_base.obj_property_index[self]

    def findRelByType(self, _type):
        relations = self.all_relations
        return Selector([r for r in relations if _type in r.type])

    def findInRelByType(self, _type):
        return self.findRelByType(_type).findAll(lambda elm: elm.target == self)

    def findOutRelByType(self, _type):
        return self.findRelByType(_type).findAll(lambda elm: elm.source == self)

    # 参与者
    @property
    def own_resource(self):
        rs = self.findOutRelByType(name_config.Possess)
        return rs.map(lambda elm: elm.target)

    @property
    def all_quotas(self):
        rs = self.findOutRelByType(name_config.QuotaIs)
        return rs.map(lambda elm: elm.target)

    # 资源
    def giveTo(self, participant):
        # todo: 未来补上判断
        # if not self.belongTo('Resource'):
        #     raise Exception(self, 'is not resource')
        rels = self.findInRelByType(name_config.Possess)
        for rel in rels:
            rel.selfDelete()

        # # todo: 不用name可能会更好
        new_belong_relation = self.instance_base.createRelation({
            'source': participant,
            'target': self,
            'type': [name_config.Possess]
        })

        return new_belong_relation

    @property
    def owner(self):
        return self.findInRelByType(name_config.Possess).map(lambda elm: elm.source)

    # 没有debug的代码
    def lock(self, process):
        self.using_process.add(process)
        return

    def unlock(self, process):
        if process in self.using_process:
            self.using_process.remove(process)

    @property
    def is_lock(self):
        # return self.has_lock and len(self.using_process) != 0
        return len(self.using_process) != 0

    # def isUsedBy(self):
    #     return

    def split(self, amount):
        self.amount -= amount
        new_r = self.clone()
        new_r.amount = amount
        return new_r

    # 价值

    # 目标
