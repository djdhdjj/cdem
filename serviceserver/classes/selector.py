def findIndex(elms, elm):
    for index, temp in enumerate(elms):
        if elm == temp:
            return index


def find(elms, func):
    for elm in elms:
        if func(elm):
            return elm


def findAll(elms, func):
    return Selector([elm for elm in elms if func(elm)])


def Selector(elms=None):
    if elms is not None and len(elms) != 0:
        elm = list(elms)[0]
        if isinstance(elm, list):
            print('使用了ListSelector需要开发')
            return ListSelector(elms)
    return SetSelector(elms)


# class

class ListSelector(list):
    def __init__(self, elms=None):
        if elms is None:
            elms = []
        list.__init__(self, elms)


class SetSelector(set):
    def __init__(self, elms=None):
        if elms is None:
            elms = []
        set.__init__(self, elms)
        if None in self:
            self.remove(None)

    def __getitem__(self, index):
        return list(self)[index]

    def __str__(self):
        return 'Selector:' + ''.join(['\n-----' + str(elm) for elm in self]) + '\n'

    def __eq__(self, value):
        if len(value) != len(self) or len(value.difference(self)) != 0 or len(self.difference(value)) != 0:
            return False
        return True

    def map(self, func):
        return Selector([func(elm) for elm in self])

    def all(self, func):
        for elm in self:
            func(elm)

    def toJson(self):
        def toJson(elm):
            # normal_type = Selector([str, float, int])
            if isinstance(elm, (str, float, int)):
                # normal_type.anyMatch(lambda e: elm isinstance e):
                return elm
            return elm.toJson()

        return [
            toJson(elm)
            for elm in self
        ]

    # def findById(self, value):
    #     return self.find(lambda elm: elm.id == value)

    # def findByClass(self, value):
    #     return self.find(lambda elm: elm.class_name == value)

    # def findByName(self, value):
    #     return self.find(lambda elm: elm.name == value)

    def clean(self, func):
        for elm in list(self):
            if func(elm):
                self.remove(elm)

    def findAll(self, func):
        return Selector(findAll(self, func))

    def find(self, func):
        return find(self, func)

    def __add__(self, other):
        return Selector(self.union(other))

    def __sub__(self, other):
        return Selector(self.difference(other))

    def allMatch(self, func):
        for elm in self:
            if not func(elm):
                return False
        return True

    def anyMatch(self, func):
        for elm in self:
            if func(elm):
                return True
        return False

    # def setProps(self, props):
    #     for elm in self:
    #         elm.setProps(props)

    def total(self, func, initial_value=0):
        value = initial_value
        for elm in self:
            value += func(elm)
        return value

    @property
    def length(self):
        return len(self)

    def append(self, elm):
        self.append(elm)
