from typing import Dict

from rdflib import Namespace, Literal, Graph, BNode

from .owl import owl_namespace, owl_class, owl_objectProperty, owl_datatypeProperty, \
    rdf_namespace, rdf_type, rdfs_namespace, rdfs_domain, rdfs_range, xsd_namespace, xsd_string, rdfs_subClassOf, \
    owl_disjointWith, owl_equivalentClass, owl_inverseOf, rdfs_subPropertyOf, rdfs_label, rdfs_comment, \
    owl_propertyDisjointWith, owl_equivalentProperty

# custom part
csd_namespace = Namespace('http://www.cmsci.net/custom/Schema#')
cowl_namespace = Namespace('http://www.cmsci.net/custom/owl#')

"""
json转换成OWL文档
Example:
    json_data = file_manager.readJson(join(path, json_file))
    name = json_file.split('.')[0]
    converter = RDFConverter()
    converter.set_default_namespace(Namespace("http://dsp.owl/{}#".format(name)), '')
    converter.import_json(json_data)
    converter.convert()
    converter.save_rdf('{}.owl'.format(name))

说明:
    主要函数:
        set_default_namespace 设置默认命名空间
        import_json 导入json数据
        convert 转换json成OWL
        save_rdf 保存OWL文档
        get_rdf 获取OWL文档字符串

注意:
    1. 一个RDFConverter对象只能转换一个json数据, 转换下一个json数据需要新实例化一个RDFConverter
    2. 必须调用set_default_namespace设置默认命名空间
    3. 调用import_json导入json数据后才能转换
    4. 转换后可以获取OWL文档
    5. 假设出现的实体（类、属性 ...）, 可以在同一个json数据中找到（否则报异常KeyError）. 
       例如: 属性中域中出现的类不能在json中找到会报异常
    6. DataProperty中出现的非OWL特性自定义为注解标注在OWL文档中
    7. GraphData_Color自定义为注解标注在OWL文档中
    8. DataType 有5种, convert_data_type中进行转换, 不能识别的type会默认认为xsd:string.
       script类型定义为xsd:string类型
    9. 忽略Thing、topDataProperty、topObjectProperty的定义
"""


class JsonConverter:
    def __init__(self):
        """
        graph为RDF图
        """
        self._exist_relation = dict()
        self._exist_class = dict()
        self._exist_property = dict()

        self._concept_data = dict()
        self._property_data = dict()
        self._relation_data = dict()

        self._graph = Graph()
        self._graph.bind('rdf', rdf_namespace)
        self._graph.bind('rdfs', rdfs_namespace)
        self._graph.bind('xsd', xsd_namespace)
        self._graph.bind('owl', owl_namespace)
        self._default_namespace = None

        self._define_script = run_one_time(self._define_script)

        self._define_custom_data_characteristics = run_one_time(self._define_custom_data_characteristics)
        self._define_unique = run_one_time(self._define_unique)
        self._define_readonly = run_one_time(self._define_readonly)
        self._define_not_null = run_one_time(self._define_not_null)
        self._define_constrain_readonly = run_one_time(self._define_constrain_readonly)

        self._define_graph_data = run_one_time(self._define_graph_data)
        self._define_graph_data_color = run_one_time(self._define_graph_data_color)

    def set_default_namespace(self, namespace: Namespace, prefix: str = '') -> None:
        """
        设置文档的默认命名空间, 之后转换产生的结点会在这个默认命名空间下. 
        注意在转换之前设置默认命名空间
        :param namespace: 命名空间, 类型rdflib.Namespace
        :param prefix: 命名空间的缩写前缀, 默认无前缀, 类型str
        :rtype: None
        """
        self._default_namespace = namespace
        self._graph_bind(prefix, namespace)

    def import_json(self, json_dict: Dict) -> None:
        """
        加载json数据, 加载数据后才能转换
        :param json_dict:
        :rtype: None
        """
        self._concept_data = json_dict['concept_data']
        self._property_data = json_dict['property_data']
        self._relation_data = json_dict['relation_data']

    def convert(self) -> None:
        """
        转换加载的json数据为OWL(in RDF), 保存到_graph中
        :rtype: None
        """
        for k in self._concept_data.keys():
            if k == 'Thing':
                continue
            self._convert_concept_data(k)
        for k in self._property_data.keys():
            if k == 'topDataProperty':
                continue
            self._convert_property_data(k)
        for k in self._relation_data.keys():
            if k == 'topObjectProperty':
                continue
            self._convert_relation_data(k)

    def save_rdf(self, path: str) -> None:
        """
        保存RDF文件
        :param path: 文件完整路径
        :rtype: None
        """
        with open(path, 'wb') as f:
            f.write(self._graph.serialize(encoding='utf-8'))

    def get_rdf(self) -> str:
        """
        获取RDF的xml编码的字符串
        :rtype: str
        :return: RDF的xml编码的字符串
        """
        return self._graph.serialize(encoding='utf-8').decode('utf-8')

    def _graph_bind(self, prefix, namespace: Namespace):
        self._graph.bind(prefix, namespace)

    def _define_class(self, class_name: str, namespace: Namespace = None) -> str:
        if namespace is None:
            namespace = self._default_namespace
        return namespace[class_name]

    def _add_class(self, define_class: str):
        triple = (define_class, rdf_type, owl_class)
        self._graph.add(triple)

    def _define_graph_data(self):
        triple = (cowl_namespace['GraphData'], rdf_type, owl_namespace['AnnotationProperty'])
        self._graph.add(triple)

    def _define_graph_data_color(self):
        self._define_graph_data()
        triple = (cowl_namespace['color'], rdfs_subPropertyOf, cowl_namespace['GraphData'])
        self._graph.add(triple)

    def _add_graph_data_color(self, main: str, color: str):
        self._define_graph_data_color()
        triple = (main, cowl_namespace['color'], Literal(color, datatype=xsd_string))
        self._graph.add(triple)

    def _add_disjoint_with(self, main: str, other: str):
        triple = (main, owl_disjointWith, other)
        self._graph.add(triple)

    def _add_equivalent_class(self, main: str, other: str):
        triple = (main, owl_equivalentClass, other)
        self._graph.add(triple)

    def _add_sub_class_of(self, main: str, parent: str):
        triple = (main, rdfs_subClassOf, parent)
        self._graph.add(triple)

    def _add_label(self, main: str, content: str, lang: str):
        triple = (main, rdfs_label, Literal(content, lang=lang))
        self._graph.add(triple)

    def _add_comment(self, main: str, content: str, lang: str):
        triple = (main, rdfs_comment, Literal(content, lang=lang))
        self._graph.add(triple)

    def _convert_concept_data(self, concept_name: str):
        if concept_name not in self._concept_data:
            self._exception_handle(concept_name, 'concept')
            return
        if concept_name in self._exist_class:
            return
        concept = self._concept_data[concept_name]

        class_rdf_id = self._define_class(concept_name)
        self._exist_class[concept_name] = class_rdf_id
        self._add_class(class_rdf_id)

        # todo: 默认关系类在json中, 除Thing外
        owl_descriptions = concept['Description']
        for c in owl_descriptions["disjointWith"]:
            if c not in self._exist_class:
                self._convert_concept_data(c)
            self._add_disjoint_with(class_rdf_id, self._exist_class[c])
        for c in owl_descriptions['equivalentClass']:
            if c not in self._exist_class:
                self._convert_concept_data(c)
            self._add_equivalent_class(class_rdf_id, self._exist_class[c])
        for c in owl_descriptions['subClassOf']:
            if c == 'Thing':
                continue
            if c not in self._exist_class:
                self._convert_concept_data(c)
            self._add_sub_class_of(class_rdf_id, self._exist_class[c])

        dscp = concept['dscp']
        if dscp != '':
            self._add_label(class_rdf_id, dscp, 'zh')
        if 'graph_data' in concept and 'color' in concept['graph_data']:
            graph_data_color = concept['graph_data']['color']
            self._add_graph_data_color(class_rdf_id, graph_data_color)

        # todo: 原json没有prop和data_property中的domain绑定
        # 处理2: 绑定domain
        props = concept['props']
        for p in props:
            if p in self._property_data:
                if concept_name not in self._property_data[p]['Description']['domain']:
                    self._property_data[p]['Description']['domain'].append(concept_name)
            else:
                self._exception_handle(p, 'property')
                self._add_domain(self._exist_property[p], class_rdf_id)
        # 处理1: 定义标签

    def _define_data_property(self, property_name: str, namespace: Namespace = None) -> str:
        if namespace is None:
            namespace = self._default_namespace
        return namespace[property_name]

    def _add_data_property(self, define_data_property_name: str):
        triple = (define_data_property_name, rdf_type, owl_datatypeProperty)
        self._graph.add(triple)

    def _add_sub_property_of(self, main: str, parent: str):
        triple = (main, rdfs_subPropertyOf, parent)
        self._graph.add(triple)

    def _add_domain(self, define_property_name: str, define_class: str):
        triple = (define_property_name, rdfs_domain, define_class)
        self._graph.add(triple)

    def _add_range(self, define_property_name: str, define_class: str):
        triple = (define_property_name, rdfs_range, define_class)
        self._graph.add(triple)

    def _define_script(self):
        triple = (csd_namespace['script'], owl_equivalentClass, xsd_namespace['string'])
        self._graph.add(triple)

    def _convert_data_type(self, data_type_name):
        if data_type_name == 'BOOLEAN':
            return xsd_namespace['boolean']
        elif data_type_name == 'TEXT':
            return xsd_namespace['string']
        elif data_type_name == 'NUMERICAL':
            return xsd_namespace['double']
        elif data_type_name == 'INT':
            return xsd_namespace['int']
        elif data_type_name == 'SCRIPT':
            self._define_script()
            return csd_namespace['script']
        else:
            return xsd_namespace['string']

    def _add_functional(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['FunctionalProperty'])
        self._graph.add(triple)

    def _define_custom_data_characteristics(self):
        triple = (cowl_namespace['DataCharacteristics'], rdf_type, owl_namespace['AnnotationProperty'])
        self._graph.add(triple)

    def _define_constrain_readonly(self):
        self._define_custom_data_characteristics()
        triple = (cowl_namespace['ConstrainReadonly'], rdfs_subPropertyOf, cowl_namespace['DataCharacteristics'])
        self._graph.add(triple)

    def _add_constrain_readonly(self, define_property_name: str):
        self._define_constrain_readonly()
        triple = (define_property_name, cowl_namespace['ConstrainReadonly'], Literal(True))
        self._graph.add(triple)

    def _define_not_null(self):
        self._define_custom_data_characteristics()
        triple = (cowl_namespace['NotNull'], rdfs_subPropertyOf, cowl_namespace['DataCharacteristics'])
        self._graph.add(triple)

    def _add_not_null(self, define_property_name: str):
        self._define_not_null()
        triple = (define_property_name, cowl_namespace['NotNull'], Literal(True))
        self._graph.add(triple)

    def _define_readonly(self):
        self._define_custom_data_characteristics()
        triple = (cowl_namespace['Readonly'], rdfs_subPropertyOf, cowl_namespace['DataCharacteristics'])
        self._graph.add(triple)

    def _add_readonly(self, define_property_name: str):
        self._define_readonly()
        triple = (define_property_name, cowl_namespace['Readonly'], Literal(True))
        self._graph.add(triple)

    def _define_unique(self):
        self._define_custom_data_characteristics()
        triple = (cowl_namespace['Unique'], rdfs_subPropertyOf, cowl_namespace['DataCharacteristics'])
        self._graph.add(triple)

    def _add_unique(self, define_property_name: str):
        self._define_unique()
        triple = (define_property_name, cowl_namespace['Unique'], Literal(True))
        self._graph.add(triple)

    def _add_restriction_cardinality(self, define_class, define_property_name, cardinality):
        br = BNode()
        triples = [
            (br, rdf_type, owl_namespace['Restriction']),
            (br, owl_namespace['onProperty'], define_property_name),
            (br, owl_namespace['minCardinality'], Literal(cardinality)),
            (define_class, rdfs_subClassOf, br)
        ]
        for triple in triples:
            self._graph.add(triple)

    def _add_property_disjoint_with(self, main: str, other: str):
        triple = (main, owl_propertyDisjointWith, other)
        self._graph.add(triple)

    def _add_equivalent_property(self, main: str, other: str):
        triple = (main, owl_equivalentProperty, other)
        self._graph.add(triple)

    def _convert_property_data(self, property_name: str):
        if property_name not in self._property_data:
            self._exception_handle(property_name, 'property')
            return
        if property_name in self._exist_property:
            return
        data_property = self._property_data[property_name]

        property_rdf_id = self._define_data_property(property_name)
        self._exist_property[property_name] = property_rdf_id
        self._add_data_property(property_rdf_id)

        # todo: 默认关系类在json中, 除topDataProperty外
        owl_descriptions = data_property['Description']
        for p in owl_descriptions["disjointWith"]:
            if p not in self._exist_property:
                self._convert_property_data(p)
            self._add_property_disjoint_with(property_rdf_id, self._exist_property[p])
        for p in owl_descriptions['equivalentClass']:
            if p not in self._exist_property:
                self._convert_property_data(p)
            self._add_equivalent_property(property_rdf_id, self._exist_property[p])
        for p in owl_descriptions['subPropertyOf']:
            if p == 'topDataProperty':
                continue
            if p not in self._exist_property:
                self._convert_property_data(p)
            self._add_sub_property_of(property_rdf_id, self._exist_property[p])
        for c in owl_descriptions['domain']:
            if c not in self._exist_class:
                self._convert_concept_data(c)
            self._add_domain(property_rdf_id, self._exist_class[c])
        for t in owl_descriptions['range']:
            self._add_range(property_rdf_id, self._convert_data_type(t))

        owl_characteristics = data_property['Characteristics']
        if owl_characteristics['Functional']:
            self._add_functional(property_rdf_id)
        # constrain_readonly,not_null,readonly,unique非标准
        if owl_characteristics['constrain_readonly']:
            self._add_constrain_readonly(property_rdf_id)
        if owl_characteristics['not_null']:
            self._add_not_null(property_rdf_id)
        if owl_characteristics['readonly']:
            self._add_readonly(property_rdf_id)
        if owl_characteristics['unique']:
            self._add_unique(property_rdf_id)
        if 'cardinality' in owl_characteristics:
            cardinality = owl_characteristics['cardinality']
            if len(owl_descriptions['domain']) == 0:
                self._add_restriction_cardinality(owl_namespace['Thing'],
                                                  property_rdf_id,
                                                  cardinality)
            for c in owl_descriptions['domain']:
                self._add_restriction_cardinality(self._exist_class[c],
                                                  property_rdf_id,
                                                  cardinality)

        dscp = data_property['dscp']
        if dscp != '':
            self._add_label(property_rdf_id, dscp, 'zh')
        if 'graph_data' in data_property and 'color' in data_property['graph_data']:
            graph_data_color = data_property['graph_data']['color']
            self._add_graph_data_color(property_rdf_id, graph_data_color)

    def _define_object_property(self, relation_name: str, namespace: Namespace = None) -> str:
        if namespace is None:
            namespace = self._default_namespace
        return namespace[relation_name]

    def _add_object_property(self, define_object_property_name: str):
        triple = (define_object_property_name, rdf_type, owl_objectProperty)
        self._graph.add(triple)

    def _add_inverse_of(self, main: str, other: str):
        triple = (main, owl_inverseOf, other)
        self._graph.add(triple)

    def _add_inverse_functional(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['InverseFunctionalProperty'])
        self._graph.add(triple)

    def _add_symmetric(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['SymmetricProperty'])
        self._graph.add(triple)

    def _add_transitive(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['TransitiveProperty'])
        self._graph.add(triple)

    # in OWL2
    def _add_asymmetric(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['AsymmetricProperty'])
        self._graph.add(triple)

    def _add_reflexive(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['ReflexiveProperty'])
        self._graph.add(triple)

    def _add_irreflexive(self, define_property_name: str):
        triple = (define_property_name, rdf_type, owl_namespace['IrreflexiveProperty'])
        self._graph.add(triple)

    def _convert_relation_data(self, relation_name: str):
        if relation_name not in self._relation_data:
            self._exception_handle(relation_name, 'relation')
            return
        if relation_name in self._exist_relation:
            return
        object_property = self._relation_data[relation_name]

        object_property_rdf_id = self._define_object_property(relation_name)
        self._exist_relation[relation_name] = object_property_rdf_id
        self._add_object_property(object_property_rdf_id)

        # todo: 默认关系类在json中, 除topDataProperty外
        owl_descriptions = object_property['Description']
        for p in owl_descriptions["InverseOf"]:
            if p not in self._exist_relation:
                self._convert_relation_data(p)
            self._add_inverse_of(object_property_rdf_id, self._exist_relation[p])
        for p in owl_descriptions["disjointWith"]:
            if p not in self._exist_relation:
                self._convert_relation_data(p)
            self._add_property_disjoint_with(object_property_rdf_id, self._exist_relation[p])
        for p in owl_descriptions['equivalentClass']:
            if p not in self._exist_relation:
                self._convert_relation_data(p)
            self._add_equivalent_property(object_property_rdf_id, self._exist_relation[p])
        for p in owl_descriptions['subPropertyOf']:
            if p == 'topObjectProperty':
                continue
            if p not in self._exist_relation:
                self._convert_relation_data(p)
            self._add_sub_property_of(object_property_rdf_id, self._exist_relation[p])
        # todo: json中希望统一
        if 'domain' in owl_descriptions:
            for c in owl_descriptions['domain']:
                if c not in self._exist_class:
                    self._convert_concept_data(c)
                self._add_domain(object_property_rdf_id, self._exist_class[c])
        if 'range' in owl_descriptions:
            for c in owl_descriptions['range']:
                if c not in self._exist_class:
                    self._convert_concept_data(c)
                self._add_range(object_property_rdf_id, self._exist_class[c])

        owl_characteristics = object_property['Characteristics']
        if owl_characteristics['Functional']:
            self._add_functional(object_property_rdf_id)
        if owl_characteristics['InverseFunctional']:
            self._add_inverse_functional(object_property_rdf_id)
        if owl_characteristics['Symmetric']:
            self._add_symmetric(object_property_rdf_id)
        if owl_characteristics['Transitive']:
            self._add_transitive(object_property_rdf_id)
        # in OWL2
        if owl_characteristics['Asymmetric']:
            self._add_asymmetric(object_property_rdf_id)
        if owl_characteristics['Irreflexive']:
            self._add_irreflexive(object_property_rdf_id)
        if owl_characteristics['Reflexive']:
            self._add_reflexive(object_property_rdf_id)

        dscp = object_property['dscp']
        if dscp != '':
            self._add_label(object_property_rdf_id, dscp, 'zh')
        if 'graph_data' in object_property and 'color' in object_property['graph_data']:
            graph_data_color = object_property['graph_data']['color']
            self._add_graph_data_color(object_property_rdf_id, graph_data_color)

    def _exception_handle(self, error_key: str, where: str):
        if where == 'concept':
            print('json data error: cannot find {} in concept data'.format(error_key))
            error_rdf = self._define_class(error_key)
            self._add_class(error_rdf)
            self._exist_class[error_key] = error_rdf
        elif where == 'property':
            print('json data error: cannot find {} in property data'.format(error_key))
            error_rdf = self._define_data_property(error_key)
            self._add_data_property(error_rdf)
            self._exist_property[error_key] = error_rdf
        elif where == 'relation':
            print('json data error: cannot find {} in relation data'.format(error_key))
            error_rdf = self._define_object_property(error_key)
            self._add_object_property(error_rdf)
            self._exist_relation[error_key] = error_rdf
        else:
            error_rdf = None
        if error_rdf is not None:
            self._add_comment(error_rdf, '可能存在错误的实体', 'zh')


def run_one_time(func):
    class Record:
        def __init__(self):
            self.record = False

        def run(self):
            self.record = True

    r = Record()

    def wrapper(*args, **kw):
        if r.record is False:
            r.run()
            return func(*args, **kw)
        else:
            return

    return wrapper
