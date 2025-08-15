import re
from os.path import join
from typing import Dict, Any, AnyStr

from classes.service_pattern import ServicePattern
from tools.file_manager import file_manager

name_pattern = re.compile(r'(.+?)_(推荐|选定)(_[0-9]+)?')


class FusionPattern(ServicePattern):
    def __init__(self, name, workspace, fusion_args: Dict[AnyStr, Any] = None, config=None):
        m = name_pattern.match(name)
        if m is None:
            raise ValueError('invalid name: {}'.format(name))
        super().__init__(name, workspace, config)
        if fusion_args is None:
            fusion_args = {}
        self._fusion_args = fusion_args
        self._fusion_name = m.group(1)
        self._final = True if m.group(3) is None else False
        self._id = m.group(3)

    @property
    def json_path(self):
        if self._final:
            inner_dir = 'final'
        else:
            inner_dir = 'intermediate'
        return join(self.workspace.fusion_pattern_path, self.fusion_name, inner_dir, self.name + '.json')

    def save(self):
        file_manager.save_json(self.toJson(), self.json_path)

    def toJson(self):
        graph_data = super(FusionPattern, self).toJson()
        graph_data['fusion_args'] = self._fusion_args
        return graph_data

    def loadJson(self, data):
        super(FusionPattern, self).loadJson(data)
        if 'fusion_args' in data:
            self._fusion_args = data['fusion_args']

    @property
    def final(self):
        return self._final

    @property
    def fusion_name(self):
        return self._fusion_name

    @final.setter
    def final(self, final):
        self._final = final
        self.name = '{}_{}{}'.format(self.fusion_name,
                                     '选定' if self._final else '推荐',
                                     '' if self._final else '_{}'.format(self._id))
