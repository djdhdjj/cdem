import META from "../nameConfig"

const BPMN_concepts = {
    Thing: {
        Description: {
            subClassOf: []
        },
    },
    BPMN_element:{
        dscp: 'BPMN要素',
        Description: {
            subClassOf: [META.Thing]
        },
    },
    Task: {
        dscp: '任务',
    },
    Process: {
        dscp: '过程',
    },
    Gateway: {
        dscp: '网关',
    },
    LaneSet: {
        dscp: '泳道图',
    },
    Lane: {
        dscp: '泳道',

    },
    Event: {
        dscp: '事件',
    },
    ExclusiveGateWay: {
        dscp: '互斥网关'
    },
    ParallelGateway: {
        dscp: '并行网关',
    }
}
for (let key in BPMN_concepts) {
    BPMN_concepts[key].class_name = key
    if(key ===META.BPMN_element || key== META.Thing)
        continue
    BPMN_concepts[key].Description = {
        'subClassOf': [META.BPMN_element],
    }
}

BPMN_concepts.ParallelGateway.Description.subClassOf = [META.Gateway]
BPMN_concepts.ExclusiveGateWay.Description.subClassOf = [META.Gateway]

BPMN_concepts['StartEvent'] = {
    dscp: 'StartEvent',
    class_name: 'StartEvent',
    Description: {
        subClassOf: [META.Event]
    },
}

BPMN_concepts['TimeDateEvent'] = {
    dscp: 'TimeDateEvent',
    class_name: 'TimeDateEvent',
    Description: {
        subClassOf: ['StartEvent']
    },
}

BPMN_concepts['TimeCycleEvent'] = {
    dscp: 'TimeCycleEvent',
    class_name: 'TimeCycleEvent',
    Description: {
        subClassOf: ['StartEvent']
    },
}

BPMN_concepts['TimeDurationEvent'] = {
    dscp: 'TimeDurationEvent',
    class_name: 'TimeDurationEvent',
    Description: {
        subClassOf: ['StartEvent']
    },
}

BPMN_concepts['EndEvent'] = {
    dscp: 'EndEvent',
    class_name: 'EndEvent',
    Description: {
        subClassOf: [META.Event]
    },
}

// BPMN_concepts['Task1'] = {
//     dscp: 'Task1',
//     class_name: 'Task1',
//     Description: {
//         subClassOf: [META.Task]
//     },
// }

// BPMN_concepts['Task2'] = {
//     dscp: 'Task2',
//     class_name: 'Task2',
//     Description: {
//         subClassOf: [META.Task]
//     },
// }

const BPMN_relations = {
    topObjectProperty: {
        class_name: META.topObjectProperty,
        Description: {
            subPropertyOf: []
        },
    },
    SequenceFlow: {
        class_name: META.SequenceFlow,
        dscp: '依赖',
        Description: {
            subPropertyOf: [META.topObjectProperty],
        },
    },
    dataFlow: {
        class_name: META.dataFlow,
        dscp: '数据流',
        Description: {
            subPropertyOf: [META.topObjectProperty],
        },
    },
    valueFlow: {
        class_name: META.valueFlow,
        dscp: '价值流',
        Description: {
            subPropertyOf: [META.topObjectProperty],
        },
    },
}

const BPMN_properties = {
    topDataProperty: {
        class_name: META.topDataProperty,
        Description: {
            subPropertyOf: []
        },
    },
    test: {
        class_name: 'test',
        dscp: 'test',
        Description: {
            subPropertyOf: [META.topDataProperty]
        },
    }
}

export {
    BPMN_concepts,
    BPMN_properties,
    BPMN_relations
}

