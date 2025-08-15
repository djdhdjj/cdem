import os
from copy import deepcopy
from functools import reduce
from typing import Dict, AnyStr

from classes.concept_base import ConceptBase
from classes.fusion_pattern import FusionPattern
from classes.service_pattern import ServicePattern
from classes.simulator import Simulator
from tools.common_function import is_null_or_whitespace, get_uuid1
from tools.file_manager import file_manager


class WorkSpace:
    def __init__(self, name='', config=None):
        if config is None:
            config = {}
        self.name = name
        self.concept_bases = {}
        self.service_patterns = {}
        self.config = config
        self.simulators = {
            # '': Simulator()
        }
        self.fusion_patterns: Dict[AnyStr, FusionPattern] = {}
        return

    @property
    def all_concepts(self):
        id2c = {}
        for cb in self.concept_bases.values():
            for c in cb.concept_beans.values():
                id2c[c.id_name] = c
        return id2c

    @property
    def all_data_props(self):
        id2p = {}
        for cb in self.concept_bases.values():
            for p in cb.data_prop_beans.values():
                id2p[p.id_name] = p
        return id2p

    @property
    def all_obj_props(self):
        id2p = {}
        for cb in self.concept_bases.values():
            for p in cb.obj_prop_beans.values():
                id2p[p.id_name] = p
        return id2p

    def findByName(self, name):
        if '/' in name:
            name = name.split('/')
            cb_name = name[0]
            name = name[1]
            return self.concept_bases[cb_name].findByName(name)

        for cb_name in self.concept_bases:
            c = self.concept_bases[cb_name].findByName(name)
            if c is not None:
                return c

        return None

    @property
    def path(self):
        return os.path.join('dataset', self.name)

    @property
    def concept_path(self):
        return os.path.join('dataset', self.name, 'concepts')

    @property
    def pattern_path(self):
        return os.path.join('dataset', self.name, 'patterns')

    @property
    def simulator_path(self):
        return os.path.join('dataset', self.name, 'simulator')

    @property
    def fusion_pattern_path(self):
        return os.path.join('dataset', self.name, 'fusions')

    @property
    def sim_result_path(self):
        return os.path.join('dataset', self.name, 'sim_results')

    @property
    def assess_result_path(self):
        return os.path.join('dataset', self.name, 'assess_results')

    def clean(self):
        self.concept_bases = {}
        self.service_patterns = {}
        self.config = {}
        self.simulators = {}
        self.fusion_patterns = {}

    def _sync_config_name(self):
        if 'name' in self.config and \
                is_null_or_whitespace(self.config['name']) is not True:
            self.name = self.config['name']
        elif is_null_or_whitespace(self.name) is not True:
            self.config['name'] = self.name
        else:
            name = get_uuid1()
            self.name = name
            self.config['name'] = name

    def _loadConfigFile(self):
        for name in file_manager.listdir(self.path):
            if name == 'config.json':
                config = file_manager.readJson(os.path.join(self.path, name))
                self.config = config
                break
        self._sync_config_name()

    def _loadConceptFile(self):
        for c_name in file_manager.listdir(self.concept_path):
            if '.json' not in c_name:
                continue
            c_name = c_name.replace('.json', '')
            new_cb = ConceptBase(c_name, self)
            new_cb.loadJsonFile()
            self.concept_bases[c_name] = new_cb

    def _loadPatternFile(self):
        # print(file_manager.listdir(self.pattern_path))
        # todo: 暂时注释掉
        for p_name in file_manager.listdir(self.pattern_path):
            if '.json' not in p_name:
                continue
            # print(p_name)
            p_name = p_name.replace('.json', '')
            new_s = ServicePattern(p_name, self)
            new_s.loadJsonFile()
            self.service_patterns[p_name] = new_s

    def _loadSimulatorFile(self):
        for s_name in file_manager.listdir(self.simulator_path):
            if '.json' not in s_name:
                continue
            # print(p_name)
            s_name = s_name.replace('.json', '')
            new_s = Simulator(s_name, self)
            new_s.loadJsonFile()
            self.simulators[s_name] = new_s

    def _loadFusionFile(self):
        json_files = []
        for root, dirs, files in os.walk(self.fusion_pattern_path):
            for file in files:
                name, ext = os.path.splitext(file)
                if ext == '.json':
                    json_files.append(name)
        for name in json_files:
            new_fusion = FusionPattern(name, self)
            new_fusion.loadJsonFile()
            self.fusion_patterns[name] = new_fusion

    def loadJsonFile(self):
        self.clean()
        self._loadConfigFile()
        self._loadConceptFile()
        self._loadPatternFile()
        self._loadSimulatorFile()
        self._loadFusionFile()
        return

    def _loadJsonData(self, data, field, instance_class, store_dict):
        if field in data:
            for n, d in data[field].items():
                instance = instance_class(n, self)
                instance.loadJson(d)
                store_dict[n] = instance

    def _loadFusionJsonData(self, data):
        if 'fusion_pattern' in data:
            for fusion_name, inner_dirs in data['fusion_pattern'].items():
                for inner_dir, fusion_data in inner_dirs.items():
                    for n, d in fusion_data.items():
                        instance = FusionPattern(n, self)
                        instance.loadJson(d)
                        self.fusion_patterns[n] = instance

    def loadByJsonData(self, data):
        self.clean()
        if 'config' in data:
            self.config = data['config']
        self._sync_config_name()

        self._loadJsonData(data, 'ontologies', ConceptBase, self.concept_bases)
        self._loadJsonData(data, 'service_pattern', ServicePattern, self.service_patterns)
        self._loadJsonData(data, 'simulator', Simulator, self.simulators)
        self._loadFusionJsonData(data)

    def save(self):
        self._sync_config_name()
        file_manager.save_json(self.config, os.path.join(self.path, 'config.json'))

        clean_dirs = [self.simulator_path, self.concept_path, self.pattern_path, self.fusion_pattern_path]
        list(map(lambda _dir: file_manager.cleanDir(_dir), clean_dirs))

        values = [self.concept_bases, self.service_patterns, self.simulators, self.fusion_patterns]
        values = reduce(lambda a, b: a + b, map(lambda v: list(v.values()), values))
        list(map(lambda v: v.save(), values))
        return

    def _fusion_to_json(self):
        json_data = {}
        default_data = {
            'intermediate': {},
            'final': {}
        }
        for n, d in self.fusion_patterns.items():
            if d.fusion_name not in json_data:
                json_data[d.fusion_name] = deepcopy(default_data)
            if d.final:
                json_data[d.fusion_name]['final'][n] = d.toJson()
            else:
                json_data[d.fusion_name]['intermediate'][n] = d.toJson()
        return json_data

    def _assessed_results_to_json(self):
        file_list = file_manager.listdir(self.assess_result_path)
        json_data = {
            i[:i.rindex('.')]: file_manager.readJson(os.path.join(self.assess_result_path, i))
            for i in file_list
        }
        return json_data

    def find_service_pattern(self, name):
        if name in self.service_patterns:
            return self.service_patterns[name]

        if name in self.fusion_patterns:
            return self.fusion_patterns[name]

        return None

    def toJson(self):
        self._sync_config_name()
        return {
            'config': self.config,
            'ontologies': {n: d.toJson() for n, d in self.concept_bases.items()},
            'service_pattern': {n: d.toJson() for n, d in self.service_patterns.items()},
            'simulators': {n: d.toJson() for n, d in self.simulators.items()},
            'fusion_pattern': self._fusion_to_json(),
            'assessed_results': self._assessed_results_to_json()
        }
