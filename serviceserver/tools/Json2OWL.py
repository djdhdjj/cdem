import xml.etree.ElementTree as ET


@DeprecationWarning
def convert2owl(_dict, owl_path):
    owl_name = 'owlname'

    # title_e = '<?xml version="1.0" encoding="UTF-8"?>'
    root_e = ET.Element('rdf:RDF', attrib={
        'xmlns': owl_name,
        'xml:base': owl_name,
        'xmlns:owl': "http://www.w3.org/2002/07/owl#",
        'xmlns:rdf': "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        'xmlns:xml': 'http://www.w3.org/XML/1998/namespace',
        'xmlns:xsd': "http://www.w3.org/2001/XMLSchema#",
        'xmlns:rdfs': "http://www.w3.org/2000/01/rdf-schema#",
        'xmlns:xmlns' + owl_name: "http://www.semanticweb.org/tansiwei/ontologies/2020/3/untitled-ontology-7#"
    })

    for property_name, property_data in _dict['relation_data'].items():
        dscp = property_data['dscp']
        characteristics = property_data['Characteristics']
        descriptions = property_data['Description']

        new_op = ET.SubElement(root_e, 'owl:ObjectProperty', attrib={
            'rdf:about': property_name
        })
        for c_name, c_value in characteristics.items():
            if c_value:
                new_c = ET.SubElement(new_op, 'rdf:type', attrib={
                    'rdf:resource': 'http://www.w3.org/2002/07/owl#' + c_name + 'Property'
                })
                new_c.text = 1

        for d_name, d_values in descriptions.items():
            if len(d_values) > 0:
                for d_value in d_values:
                    new_d = ET.SubElement(new_op, 'rdfs:' + d_name, attrib={
                        'rdf:resource': d_value
                    })

    for property_name, property_data in _dict['property_data'].items():
        dscp = property_data['dscp']
        characteristics = property_data['Characteristics']
        descriptions = property_data['Description']

        new_dp = ET.SubElement(root_e, 'owl:DatatypeProperty', attrib={
            'rdf:about': property_name
        })

        for c_name, c_value in characteristics.items():
            if c_value:
                prefix = 'rdf:'
                if c_name in ['cardinality']:
                    prefix = 'owl:'
                # cardinality
                # print(property_name, new_dp, c_name)
                new_c = ET.SubElement(new_dp, 'rdf:' + c_name, attrib={})
                new_c.text = str(c_value)

        for d_name, d_values in descriptions.items():
            if len(d_values) > 0:
                for d_value in d_values:
                    new_d = ET.SubElement(new_op, 'rdfs:' + d_name, attrib={
                        'rdf:resource': d_value
                    })

    for class_name, class_data in _dict['concept_data'].items():
        dscp = class_data['dscp']
        descriptions = class_data['Description']

        new_c = ET.SubElement(root_e, 'owl:Class', attrib={
            'rdf:about': class_name
        })
        for d_name, d_values in descriptions.items():
            # print(d_name, d_values)
            if len(d_values) > 0:
                for d_value in d_values:
                    prefix = 'owl:'
                    if d_name == 'subClassOf':
                        prefix = 'rdfs:'

                    new_d = ET.SubElement(new_c, prefix + d_name, attrib={
                        'rdf:resource': d_value
                    })

    root_e = ET.ElementTree(root_e)
    root_e.write(owl_path, encoding="utf-8", xml_declaration=True)
    return root_e
