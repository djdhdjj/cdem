import numpy

from classes.workspace import WorkSpace


class FusionRequest:
    def __init__(self, request_dict):
        self.step = 0.1
        self.fusion_name = str(request_dict['name'])

        self.workspace = WorkSpace()
        self.workspace.loadByJsonData(request_dict['workspace'])
        self.workspace.save()

        self.patterns = list(request_dict['patterns'])
        self.structure = int(request_dict['structure'])
        self.relation = str(request_dict['relation'])
        self.mapping = dict(request_dict['mapping'])
        self.theta = tuple(request_dict['theta'])

    def kwargs(self):
        seq = None
        rel = None
        if self.structure == 0:
            seq = 0
            if self.relation in {"call", "exclusive", "full_parallel", "semi_parallel"}:
                rel = self.relation
        elif self.structure == 1:
            if self.relation == 'A-first':
                seq = 1
            elif self.relation == 'B-first':
                seq = 2
            rel = ''
        if seq is None or rel is None:
            return None
        kwargs_for_fusion = {
            'pattern_name1': self.patterns[0],
            'pattern_name2': self.patterns[1],
            'workspace': self.workspace,
            'newName': self.fusion_name,
            'participant_dic': self.mapping,
            'seq': seq,
            'rel': rel,
            'theta': None
        }
        kwargs_list = []
        start, stop = self.theta
        for t in numpy.arange(start, stop, self.step):
            _kwargs = kwargs_for_fusion.copy()
            _kwargs['theta'] = float(t)
            kwargs_list.append(_kwargs)
        return kwargs_list

    def _find_name_by_key(self, key, pattern_name):
        p = self.workspace.find_service_pattern(pattern_name)
        if key not in p.key2node:
            key = int(key)
        if key not in p.key2node:
            key = float(key)
        if key not in p.key2node:
            return None
        return p.key2node[key].data['name']

    def request_args(self):
        return {
            'name': self.fusion_name,
            'patterns': self.patterns,
            'structure': self.structure,
            'relation': self.relation,
            'mapping': self.mapping,
            'name_mapping': {self._find_name_by_key(a, self.patterns[0]): self._find_name_by_key(b, self.patterns[1])
                             for a, b in self.mapping.items()}
        }
