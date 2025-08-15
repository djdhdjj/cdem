from classes.instance_base import Instance

class Participant(Instance):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

class Resource(Instance):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

    def add(self):
        return
    
    def delete(self):
        return
    
    def giveTo(self, owner):
        return
    
    def lock(self):
        return
    
    def is_lock(self):
        return

class Carrier(Instance):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

class Data(Resource):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

class Goal(Instance):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

class Value(Instance):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

class Currency(Instance):
    def __init__(self, instance_base):
        super().__init__(instance_base)
        return

