import rdflib

owl_namespace = rdflib.OWL
owl_class = owl_namespace["Class"]
owl_objectProperty = owl_namespace["ObjectProperty"]
owl_datatypeProperty = owl_namespace["DatatypeProperty"]
owl_disjointWith = owl_namespace['disjointWith']
owl_equivalentClass = owl_namespace['equivalentClass']
owl_inverseOf = owl_namespace['inverseOf']
owl_propertyDisjointWith = owl_namespace['propertyDisjointWith']
owl_equivalentProperty = owl_namespace['equivalentProperty']

rdf_namespace = rdflib.RDF
rdf_property = rdf_namespace["Property"]
rdf_type = rdf_namespace["type"]

rdfs_namespace = rdflib.RDFS
rdfs_subClassOf = rdfs_namespace["subClassOf"]
rdfs_domain = rdfs_namespace["domain"]
rdfs_range = rdfs_namespace["range"]
rdfs_subPropertyOf = rdfs_namespace['subPropertyOf']
rdfs_label = rdfs_namespace['label']
rdfs_comment = rdfs_namespace['comment']

xsd_namespace = rdflib.XSD
xsd_string = xsd_namespace["string"]

"""
doc = Document()
doc.add_entity_definitions("vin", "http://www.w3.org/TR/2004/REC-owl-guide-20040210/wine#")
doc.add_entity_definitions("food", "http://www.w3.org/TR/2004/REC-owl-guide-20040210/food#")
print(doc.get_doctype())
"""


class Document:
    def __init__(self):
        self.entity_definitions = dict()
        pass

    def add_entity_definitions(self, name: str, namespace: str):
        self.entity_definitions[name] = namespace

    def remove_entity_definitions(self, key: str):
        self.entity_definitions.pop(key)

    def clear_entity_definitions(self):
        self.entity_definitions.clear()

    def get_doctype(self) -> str:
        if len(self.entity_definitions) == 0:
            return ""
        entities = map(lambda item: "\t<!ENTITY {name} \"{namespace}\">\n".format(name=item[0], namespace=item[1]),
                       self.entity_definitions.items())
        return "<!DOCTYPE rdf:RDF[\n" + ''.join(entities) + "]>"


class NameSpace:
    def __init__(self, namespace: str):
        self.namespace = namespace

    def __str__(self):
        return self.namespace

    def __getattr__(self, item: str):
        return self, item

    def __eq__(self, other):
        if type(self) == type(other):
            return self.__str__() == str(other)
        else:
            return False
