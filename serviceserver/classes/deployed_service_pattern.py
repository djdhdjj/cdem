from classes.instance_base import InstanceBase, Instance, ObjectProperty
from classes.service_pattern import ServicePattern, PatternObject, PatternRelation


class DeployedServicePattern(ServicePattern, InstanceBase):
    def __init__(self, name, workspace, config=None):
        super().__init__(name, workspace, config)
        if config is None:
            config = {}
        return

    def loadJson(self, pattern_data, instance_data):
        # InstanceBase.loadJson(self, instance_data)
        # pattern_data.
        return


class DeployedPatternObject(Instance, PatternObject):
    def __init__(self, deployed_service_pattern, pattern_data, instance_data):
        Instance.__init__(self, deployed_service_pattern)
        PatternObject.__init__(self, deployed_service_pattern, pattern_data)
        Instance.loadJson(self, instance_data)
        return


class DeployedPatternRelation(ObjectProperty, PatternRelation):
    def __init__(self, deployed_service_pattern, pattern_data, instance_data):
        ObjectProperty.__init__(self, )
