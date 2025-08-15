import {
    Relation,
    META,
    RelationBean,
} from "../metaData";
import deepcopy from 'deepcopy'

// target_type: META.OBJECT
const default_rel_bean = {
    topObjectProperty: {
        dscp: '默认',
        Description: {
            'subPropertyOf': [],
        }
    },
    PartOf: {
        dscp: '是···的一部分',
        Characteristics: {
            Transitive: false,
        }
    },
    Possess: {
        dscp: '拥有资源',
        Description:{
            domain: [META.Participant],
            range: [META.Resource],
        }
    },
    CanUse: {
        dscp: '可使用资源',
        Description:{
            domain: [META.Participant],
            range: [META.Resource],
        }
    },
    Goals: {
        dscp: '目标是',
        Description:{
            domain: [META.Participant],
            range: [META.Goal],
        }
    },
    Implement: {
        dscp: '概念是',
        Description:{

        }
    },
    Involve: {
        dscp: '涉及的资源',
        Description:{
            domain: [META.Ability],
            range: [META.ResourceConcept, META.ParticipantConcept],
        }
    },
    Carriers: {
        dscp: '能力的载体',
        Description:{
            domain: [META.Ability],
            range: [META.ResourceConcept],
        }
    },
}
for (let key in default_rel_bean) {
    default_rel_bean[key].class_name = key
}

export default default_rel_bean
