import json
from copy import deepcopy

from rdflib import Literal, Graph

from .json_converter import cowl_namespace, csd_namespace
from .owl import owl_namespace, owl_class, owl_objectProperty, owl_datatypeProperty, \
    rdf_type, rdfs_domain, rdfs_range, xsd_namespace, rdfs_subClassOf, \
    owl_disjointWith, owl_equivalentClass, owl_inverseOf, rdfs_subPropertyOf, rdfs_label, owl_equivalentProperty, \
    owl_propertyDisjointWith

"""
OWL文档转换成json
Example:
    converter = JsonConverter()
    converter.parse_file('test.owl')
    converter.convert()
    print(converter.json_string())
    converter.save_json('test.json')

说明:
    主要函数:
        parse_data 解析RDF的字符串
        parse_file 解析RDF文件
        convert 转换
        json_raw_data json原始数据
        json_string json字符串
        save_json 保存json文件

注意:
    1. 假定prop已经绑定data_property中的domain
    2. relation中的domain和range字段只有小写
    3. 没有class_name
    4. 颜色随机
    5. Thing, topDataProperty, topObjectProperty都是默认定义(_default_data)
"""


class RDFConverter:
    def __init__(self):
        """
        graph为RDF图
        """
        self._graph: Graph = Graph()

        self._concept_data = dict()
        self._property_data = dict()
        self._relation_data = dict()

    def parse_data(self, data: str):
        """
        解析RDF的字符串
        :param data: RDF的字符串（xml编码）
        """
        self._graph = Graph()
        self._graph.parse(data=data)

    def parse_file(self, file: str):
        """
        解析RDF文件
        :param file: RDF文件完整路径
        """
        self._graph = Graph()
        self._graph.parse(location=file)

    def convert(self):
        """
        RDF转换为json
        注意转换前先解析RDF
        :return: void
        """
        if self._graph is None:
            return
        self._default_data()
        self._convert_concept()
        self._convert_property()
        self._convert_relation()

    def json_raw_data(self) -> dict:
        """
        json原始数据（python中的字典）
        :return: 数据字典
        """
        return {'concept_data': self._concept_data,
                'property_data': self._property_data,
                'relation_data': self._relation_data,
                'config': {}}

    def json_string(self) -> str:
        """
        json字符串（pretty输出）
        :return: json字符串
        """
        return json.dumps(self.json_raw_data(), sort_keys=True, indent=4, ensure_ascii=False)

    def save_json(self, path: str):
        """
        保存json字符串（pretty输出）
        :param path: 保存json文件完整路径
        """
        with open(path, 'w', encoding='utf-8') as fp:
            json.dump(self.json_raw_data(), fp, sort_keys=True, indent=4, ensure_ascii=False)

    @staticmethod
    def _convert_literal_to_python(literal: Literal):
        if literal.datatype is None:
            xsd_type = None
        else:
            xsd_type = literal.datatype.split('#')[1]
        if xsd_type == 'int':
            return int(literal.value)
        elif xsd_type == 'double':
            return float(literal.value)
        elif xsd_type == 'float':
            return float(literal.value)
        elif xsd_type == 'string':
            return str(literal.value)
        elif xsd_type == 'boolean':
            return bool(literal.value)
        else:
            return str(literal.value)

    @staticmethod
    def _split_name(class_name: str):
        return class_name.split('#')[1]

    @staticmethod
    def _is_unnamed_class(class_name: str):
        return '#' not in class_name

    @staticmethod
    def _is_named_class(class_name: str):
        return '#' in class_name

    def _is_data_property(self, rdf_id) -> bool:
        return (rdf_id, rdf_type, owl_datatypeProperty) in self._graph

    def _get_restriction_cardinality(self, define_property_name: str):
        brs = self._graph.subjects(owl_namespace['onProperty'], define_property_name)
        brs = list(brs)
        if len(brs) > 0:
            for br in brs:
                literals = self._graph.objects(br, owl_namespace['minCardinality'])
                for literal in literals:
                    return int(literal.value)
        return 1

    def _get_description_label(self, rdf_id: str) -> str:
        labels = self._graph.objects(rdf_id, rdfs_label)
        labels = list(labels)
        if len(labels) > 0:
            return self._convert_literal_to_python(labels[0])
        return ""

    @staticmethod
    def _random_color():
        import random
        return "#" + hex(random.randint(0, 0xffffff))[2:]

    def _get_color_label(self, rdf_id: str) -> str:
        colors = self._graph.objects(rdf_id, cowl_namespace['color'])
        colors = list(colors)
        if len(colors) > 0:
            return self._convert_literal_to_python(colors[0])
        return self._random_color()

    @staticmethod
    def _convert_data_type(data_type):
        if data_type == xsd_namespace['boolean']:
            return 'BOOLEAN'
        elif data_type == xsd_namespace['string']:
            return 'TEXT'
        elif data_type == xsd_namespace['double']:
            return 'NUMERICAL'
        elif data_type == xsd_namespace['int']:
            return 'INT'
        elif data_type == csd_namespace['script']:
            return 'SCRIPT'
        else:
            return RDFConverter._split_name(data_type).upper()

    @staticmethod
    def _prototype(data_type):
        concept_prototype = {
            "Description": {
                "disjointWith": [],
                "equivalentClass": [],
                "subClassOf": []
            },
            "default_prop2value": {},
            "dscp": "",
            "graph_data": {
                "color": ""
            },
            "props": []
        }

        property_prototype = {
            "Characteristics": {
                "Functional": False,
                "cardinality": 1,
                "constrain_readonly": False,
                "not_null": False,
                "readonly": False,
                "unique": False
            },
            "Description": {
                "disjointWith": [],
                "domain": [],
                "equivalentClass": [],
                "range": [],
                "subPropertyOf": []
            },
            "dscp": "",
            "graph_data": {
                "color": ""
            }
        }

        relation_prototype = {
            "Characteristics": {
                "Asymmetric": False,
                "Functional": False,
                "InverseFunctional": False,
                "Irreflexive": False,
                "Reflexive": False,
                "Symmetric": False,
                "Transitive": False
            },
            "Description": {
                "domain": [],
                "InverseOf": [],
                "range": [],
                "disjointWith": [],
                "equivalentClass": [],
                "subPropertyOf": []
            },
            "dscp": "",
            "graph_data": {
                "color": ""
            }
        }

        if data_type == 'concept':
            return deepcopy(concept_prototype)
        elif data_type == 'property':
            return deepcopy(property_prototype)
        elif data_type == 'relation':
            return deepcopy(relation_prototype)
        else:
            return {}

    def _convert_concept(self):
        for triple in self._graph.triples((None, rdf_type, owl_class)):
            class_rdf_id = triple[0]
            if self._is_unnamed_class(class_rdf_id):
                continue
            concept_name = self._split_name(class_rdf_id)
            self._concept_data[concept_name] = self._prototype('concept')

            classes_disjoint_with = self._graph.objects(class_rdf_id, owl_disjointWith)
            classes_disjoint_with = list(map(self._split_name,
                                             filter(self._is_named_class, classes_disjoint_with)))

            classes_equivalent_class = self._graph.objects(class_rdf_id, owl_equivalentClass)
            classes_equivalent_class = list(map(self._split_name,
                                                filter(self._is_named_class, classes_equivalent_class)))

            classes_sub_class_of = self._graph.objects(class_rdf_id, rdfs_subClassOf)
            classes_sub_class_of = list(map(self._split_name,
                                            filter(self._is_named_class, classes_sub_class_of)))

            if len(classes_sub_class_of) == 0:
                classes_sub_class_of.append('Thing')

            self._concept_data[concept_name]['Description']['disjointWith'] = classes_disjoint_with
            self._concept_data[concept_name]['Description']['equivalentClass'] = classes_equivalent_class
            self._concept_data[concept_name]['Description']['subClassOf'] = classes_sub_class_of

            self._concept_data[concept_name]['dscp'] = self._get_description_label(class_rdf_id)

            self._concept_data[concept_name]['graph_data']['color'] = self._get_color_label(class_rdf_id)

            self._concept_data[concept_name]['default_prop2value'] = {}

            # 处理2: prop已经绑定data_property中的domain
            props = self._graph.subjects(rdfs_domain, class_rdf_id)
            props = filter(self._is_data_property, props)
            props = map(self._split_name, props)
            self._concept_data[concept_name]['props'] = list(props)
            # 处理1:

    def _check_custom_characteristics(self, define_property_name: str, custom_characteristics: str) -> bool:
        if (define_property_name, cowl_namespace[custom_characteristics], Literal(True)) in self._graph:
            return True
        else:
            return False

    def _convert_property(self):
        for triple in self._graph.triples((None, rdf_type, owl_datatypeProperty)):
            property_rdf_id = triple[0]
            if self._is_unnamed_class(property_rdf_id):
                continue
            property_name = self._split_name(property_rdf_id)
            self._property_data[property_name] = self._prototype('property')

            # Description
            properties_disjoint_with = self._graph.objects(property_rdf_id, owl_propertyDisjointWith)
            properties_disjoint_with = list(map(self._split_name,
                                                filter(self._is_named_class, properties_disjoint_with)))

            properties_equivalent_class = self._graph.objects(property_rdf_id, owl_equivalentProperty)
            properties_equivalent_class = list(map(self._split_name,
                                                   filter(self._is_named_class, properties_equivalent_class)))

            properties_sub_property_of = self._graph.objects(property_rdf_id, rdfs_subPropertyOf)
            properties_sub_property_of = list(map(self._split_name,
                                                  filter(self._is_named_class, properties_sub_property_of)))

            if len(properties_sub_property_of) == 0:
                properties_sub_property_of.append('topDataProperty')

            classes_domain = self._graph.objects(property_rdf_id, rdfs_domain)
            classes_domain = list(map(self._split_name,
                                      filter(self._is_named_class, classes_domain)))

            types_range = self._graph.objects(property_rdf_id, rdfs_range)
            types_range = list(map(self._convert_data_type, types_range))

            self._property_data[property_name]['Description']['disjointWith'] = properties_disjoint_with
            self._property_data[property_name]['Description']['equivalentClass'] = properties_equivalent_class
            self._property_data[property_name]['Description']['subPropertyOf'] = properties_sub_property_of
            self._property_data[property_name]['Description']['domain'] = classes_domain
            self._property_data[property_name]['Description']['range'] = types_range

            # Characteristics
            self._property_data[property_name]['Characteristics']['Functional'] = \
                self._check_owl_characteristics(property_rdf_id, 'FunctionalProperty')
            self._property_data[property_name]['Characteristics']['cardinality'] = \
                self._get_restriction_cardinality(property_rdf_id)
            self._property_data[property_name]['Characteristics']['constrain_readonly'] = \
                self._check_custom_characteristics(property_rdf_id, 'ConstrainReadonly')
            self._property_data[property_name]['Characteristics']['not_null'] = \
                self._check_custom_characteristics(property_rdf_id, 'NotNull')
            self._property_data[property_name]['Characteristics']['readonly'] = \
                self._check_custom_characteristics(property_rdf_id, 'Readonly')
            self._property_data[property_name]['Characteristics']['unique'] = \
                self._check_custom_characteristics(property_rdf_id, 'Unique')

            self._property_data[property_name]['dscp'] = self._get_description_label(property_rdf_id)

            self._property_data[property_name]['graph_data']['color'] = self._get_color_label(property_rdf_id)

    def _check_owl_characteristics(self, define_property_name: str, characteristics: str) -> bool:
        if (define_property_name, rdf_type, owl_namespace[characteristics]) in self._graph:
            return True
        else:
            return False

    def _convert_relation(self):
        for triple in self._graph.triples((None, rdf_type, owl_objectProperty)):
            property_rdf_id = triple[0]
            if self._is_unnamed_class(property_rdf_id):
                continue
            property_name = self._split_name(property_rdf_id)
            self._relation_data[property_name] = self._prototype('relation')

            # Description
            properties_disjoint_with = self._graph.objects(property_rdf_id, owl_propertyDisjointWith)
            properties_disjoint_with = list(map(self._split_name,
                                                filter(self._is_named_class, properties_disjoint_with)))

            properties_equivalent_class = self._graph.objects(property_rdf_id, owl_equivalentProperty)
            properties_equivalent_class = list(map(self._split_name,
                                                   filter(self._is_named_class, properties_equivalent_class)))

            properties_inverse_of = self._graph.objects(property_rdf_id, owl_inverseOf)
            properties_inverse_of = list(map(self._split_name,
                                             filter(self._is_named_class, properties_inverse_of)))

            properties_sub_property_of = self._graph.objects(property_rdf_id, rdfs_subPropertyOf)
            properties_sub_property_of = list(map(self._split_name,
                                                  filter(self._is_named_class, properties_sub_property_of)))
            if len(properties_sub_property_of) == 0:
                properties_sub_property_of.append('topObjectProperty')

            classes_domain = self._graph.objects(property_rdf_id, rdfs_domain)
            classes_domain = list(map(self._split_name,
                                      filter(self._is_named_class, classes_domain)))

            types_range = self._graph.objects(property_rdf_id, rdfs_range)
            types_range = list(map(self._split_name,
                                   filter(self._is_named_class, types_range)))

            self._relation_data[property_name]['Description']['disjointWith'] = properties_disjoint_with
            self._relation_data[property_name]['Description']['equivalentClass'] = properties_equivalent_class
            self._relation_data[property_name]['Description']['subPropertyOf'] = properties_sub_property_of
            self._relation_data[property_name]['Description']['domain'] = classes_domain
            self._relation_data[property_name]['Description']['range'] = types_range
            self._relation_data[property_name]['Description']['InverseOf'] = properties_inverse_of

            # Characteristics
            self._relation_data[property_name]['Characteristics']['Asymmetric'] = \
                self._check_owl_characteristics(property_rdf_id, 'AsymmetricProperty')
            self._relation_data[property_name]['Characteristics']['Functional'] = \
                self._check_owl_characteristics(property_rdf_id, 'FunctionalProperty')
            self._relation_data[property_name]['Characteristics']['InverseFunctional'] = \
                self._check_owl_characteristics(property_rdf_id, 'InverseFunctionalProperty')
            self._relation_data[property_name]['Characteristics']['Irreflexive'] = \
                self._check_owl_characteristics(property_rdf_id, 'IrreflexiveProperty')
            self._relation_data[property_name]['Characteristics']['Reflexive'] = \
                self._check_owl_characteristics(property_rdf_id, 'ReflexiveProperty')
            self._relation_data[property_name]['Characteristics']['Symmetric'] = \
                self._check_owl_characteristics(property_rdf_id, 'SymmetricProperty')
            self._relation_data[property_name]['Characteristics']['Transitive'] = \
                self._check_owl_characteristics(property_rdf_id, 'TransitiveProperty')

            self._relation_data[property_name]['dscp'] = self._get_description_label(property_rdf_id)

            self._relation_data[property_name]['graph_data']['color'] = self._get_color_label(property_rdf_id)

    def _default_data(self):
        self._concept_data['Thing'] = {
            "Description": {
                "disjointWith": [],
                "equivalentClass": [],
                "subClassOf": []
            },
            "default_prop2value": {},
            "dscp": "默认",
            "graph_data": {
                "color": self._random_color()
            },
            "props": []
        }

        self._property_data['topDataProperty'] = {
            "Characteristics": {
                "Functional": False,
                "cardinality": 1,
                "constrain_readonly": False,
                "not_null": False,
                "readonly": False,
                "unique": False
            },
            "Description": {
                "disjointWith": [],
                "domain": [],
                "equivalentClass": [],
                "range": [],
                "subPropertyOf": []
            },
            "dscp": "默认的",
            "graph_data": {
                "color": self._random_color()
            }
        }

        self._relation_data['topObjectProperty'] = {
            "Characteristics": {
                "Asymmetric": False,
                "Functional": False,
                "InverseFunctional": False,
                "Irreflexive": False,
                "Reflexive": False,
                "Symmetric": False,
                "Transitive": False
            },
            "Description": {
                "domain": [],
                "InverseOf": [],
                "range": [],
                "disjointWith": [],
                "equivalentClass": [],
                "subPropertyOf": []
            },
            "dscp": "默认",
            "graph_data": {
                "color": self._random_color()
            }
        }
