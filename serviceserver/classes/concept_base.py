import os

from tools.common_function import toJson
from tools.file_manager import file_manager


class ConceptBase:
    def __init__(self, name, workspace, config=None):
        if config is None:
            config = {}
        self.workspace = workspace
        self.name = name
        self.config = config
        self.concept_beans = {}
        self.obj_prop_beans = {}
        self.data_prop_beans = {}
        return

    def findByName(self, name):
        if '/' in name:
            return self.workspace.findByName(name)

        if name in self.concept_beans:
            return self.concept_beans[name]
        if name in self.obj_prop_beans:
            return self.obj_prop_beans[name]
        if name in self.data_prop_beans:
            return self.data_prop_beans[name]

        return None

    @property
    def json_path(self):
        return os.path.join(self.workspace.concept_path, self.name) + '.json'

    def loadJson(self, data):
        if 'config' in data:
            self.config = data['config']

        concept_data = data['concept_data']
        obj_prop_data = data['relation_data']
        data_prop_data = data['property_data']

        for c_name, c_data in concept_data.items():
            new_c = ConceptBean(self)
            new_c.loadJson(c_data)
            self.concept_beans[c_name] = new_c

        for o_name, o_data in obj_prop_data.items():
            new_o = ObjectPropertyBean(self)
            new_o.loadJson(o_data)
            self.obj_prop_beans[o_name] = new_o

        for d_name, d_data in data_prop_data.items():
            new_d = DataPropertyBean(self)
            new_d.loadJson(d_data)
            self.data_prop_beans[d_name] = new_d

    def loadJsonFile(self):
        data = file_manager.readJson(self.json_path)
        self.loadJson(data)
        return

    def toJson(self):
        # print(self.config,)
        return {
            'config': self.config,
            'concept_data': {c_n: c.toJson() for c_n, c in self.concept_beans.items()},
            'relation_data': {o_n: o.toJson() for o_n, o in self.obj_prop_beans.items()},
            'property_data': {d_n: d.toJson() for d_n, d in self.data_prop_beans.items()},
        }

    def save(self):
        file_manager.save_json(self.toJson(), os.path.join(self.workspace.concept_path, self.name + '.json'))


# 现在还没加默认的
class Bean:
    def __init__(self, concept_base):
        self.bean_data = {}
        self.concept_base = concept_base
        return

    def loadJson(self, data):
        self.bean_data = data
        return

    @property
    def descrption(self):
        return self.bean_data['Description']

    @property
    def class_name(self):
        return self.bean_data['class_name']

    def characteristics(self):
        return self.bean_data['Characteristics']

    def __str__(self):
        return str('@' + self.id_name + ':' + toJson(self.bean_data))

    @property
    def workspace(self):
        return self.concept_base.workspace

    # todo: 要不要都叫name好了
    @property
    def name(self):
        return self.class_name

    @property
    def id_name(self):
        return self.concept_base.name + '/' + self.class_name

    def toJson(self):
        return self.bean_data

    @property
    def father_classes(self):
        return []

    @property
    def sub_classes(self):
        return []

    # todo: 怎么解决resource那些有equal的
    # 可以考虑动态规划
    def belongTo(self, concept_uri):
        # print(self.name, concept_uri, [str(i) for i in self.father_classes], self.descrption['subClassOf'])
        return concept_uri == self.id_name or concept_uri == self.name \
               or concept_uri in [c.id_name for c in self.father_classes] \
               or concept_uri in [c.name for c in self.father_classes] \
               or any([c.belongTo(concept_uri) for c in self.father_classes])


class ConceptBean(Bean):
    def __init__(self, concept_base):
        super().__init__(concept_base)
        return

    @property
    def sub_classes(self):
        return [_o for _o in self.workspace.all_concepts.values() if self.class_name in _o.descrption['subClassOf']]

    @property
    def father_classes(self):
        return [self.concept_base.findByName(_n) for _n in self.descrption['subClassOf']]


class ObjectPropertyBean(Bean):
    def __init__(self, concept_base):
        super().__init__(concept_base)
        return

    @property
    def sub_classes(self):
        return [_o for _o in self.workspace.all_obj_props.values() if self.class_name in _o.descrption['subPropertyOf']]

    @property
    def father_classes(self):
        return [self.concept_base.findByName(_n) for _n in self.descrption['subPropertyOf']]


class DataPropertyBean(Bean):
    def __init__(self, concept_base):
        super().__init__(concept_base)
        return

    @property
    def sub_classes(self):
        return [_o for _o in self.workspace.all_data_props.values() if
                self.class_name in _o.descrption['subPropertyOf']]

    @property
    def father_classes(self):
        return [self.concept_base.findByName(_n) for _n in self.descrption['subPropertyOf']]
