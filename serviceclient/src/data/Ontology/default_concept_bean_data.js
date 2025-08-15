import {
    MetaObject,
    META,
    Bean,
    Concept,
} from "../metaData";
// import {
//     elmType2Color
// } from "./Color";
import deepcopy from 'deepcopy'

const default_concept_bean = {
    Thing: {
        dscp: '默认',
        Description: {
            'subClassOf': [],
        },
    },
    Resource: {
        dscp: '资源',
        props: [
            META.unit, META.amount, META.has_lock, META.divisible,
        ],
    },
    Ability: {
        dscp: '能力',
    },
    Task: {
        dscp: '任务',
    },
    Participant: {
        dscp: '参与者',
    },
    Goal: {
        dscp: '目标',
        props: [
            META.goal_dscp, 
            // META.is_global, META.priority, META.weight,
        ],
    },
    Environment: {
        dscp: '环境',
    },
    Carrier: {
        dscp: '载体',
    },
    Quota: {
        dscp: '指标',
        props: [
            META.quota_dscp,
        ],
    },
    Goal: {
        dscp: '目标',
        props: [
            META.goal_dscp
        ]
    }
    // BPMN_element: {
    //     dscp: 'BPMN用到的',
    //     props: [
    //         META.name,
    //     ]
    // }
}


// let default_beam_data =  default_concept_bean.Thing
// for (let key in  default_concept_bean) {
//     let temp_data = deepcopy(default_beam_data)
//     default_concept_bean[key].Description = temp_data.Description
// }
default_concept_bean[META.dataObject] = {
    dscp: '数据',
    Description: {
        'subClassOf': [META.Resource],
    },
    props: [
        'data_size',
    ]
}
default_concept_bean[META.currencyObject] = {
    dscp: '价值',
    Description: {
        'subClassOf': [META.Resource],
    }
}


// default_concept_bean[META.Carrier + 1] = {
//     Description: {
//         'subClassOf': [META.Carrier]
//     }
// }
// default_concept_bean[META.dataObject + 1] = {
//     Description: {
//         'subClassOf': [META.dataObject]
//     },
//     props: [
//         'data_size',
//     ]
// }
// default_concept_bean[META.Participant + 1] = {
//     Description: {
//         'subClassOf': [META.Participant]
//     }
// }
// default_concept_bean[META.Goal + 1] = {
//     Description: {
//         'subClassOf': [META.Goal]
//     }
// }

for (let key in default_concept_bean) {
    default_concept_bean[key].class_name = key
    // if( key ===META.Thing )
    //     continue
    // default_concept_bean[key].Description[META.SubClassOf] = [META.Thing]
}

export default default_concept_bean