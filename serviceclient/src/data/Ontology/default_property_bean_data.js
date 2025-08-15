import META from "../nameConfig";
import {typeOf} from "../../manager/commonFunction";
import {PropertyBean,} from "../metaData"
import deepcopy from 'deepcopy'

const default_property_range = {
    OBJECT: META.OBJECT,   //字典类型
    // VALUE: 'VALUE',
    SCRIPT: META.SCRIPT,
    // ANNOTATION: 'ANNOTATION',
    NUMERICAL: META.NUMERICAL,
    ENUM: META.ENUM,
    TEXT: META.TEXT,
    BOOLEAN: META.BOOLEAN,
    INT: META.INT,
    ARRAY: META.ARRAY,
    ARRAYTEXT: META.ARRAYTEXT,
}

// target_type: META.OBJECT
const default_property_bean = {
    topDataProperty: {
        dscp: '默认的',
        Description: {
            subPropertyOf: [],
        }
    },
    name: {
        dscp: '名字是',
        Characteristics: {
            unique: true,
            not_null: true,  //必须的
        },
        Description: {
            range: [default_property_range.TEXT],   //类型
        },
    },
    step: {
        dscp: '每次要做的',
        Description: {
            range: [default_property_range.SCRIPT],   //类型
        },
    },
    id: {
        dscp: 'id是',
        unique: true,
        Description: {
            range: [default_property_range.TEXT],   //类型
        }
    },
    unit: {
        dscp: '资源的最小单位',
        Description: {
            range: [default_property_range.NUMERICAL],   //类型
        },
    },
    role: {
        dscp: '输入对应的角色',
        Description: {
            range: [default_property_range.TEXT],   //类型
        },
    },
    amount:{
        dscp: '资源的量',
        Description: {
            range: [default_property_range.NUMERICAL],   //类型
        },
    },
    goal_dscp:{
        dscp: '目标描述',
        Description: {
            range: [default_property_range.SCRIPT],   //类型
        },
    },
    has_lock: {
        dscp: '资源时候含有锁',
        Description: {
            range: [default_property_range.BOOLEAN],   //类型
        },
    },
    divisible: {
        dscp: '资源时候不可分割',
        Description: {
            range: [default_property_range.BOOLEAN],   //类型
        },
    },
    lock: {
        dscp: '锁',
        Description: {
            range: [default_property_range.BOOLEAN],   //类型
        },
    },
    pre_condition: {
        dscp: '任务的前置条件',
        Description: {
            range: [default_property_range.SCRIPT],   //类型
        },
    },
    quota_dscp: {
        dscp: '描述了指标的变化',
        Description: {
            range: [default_property_range.SCRIPT],   //类型
        },
    },
    data_type: {
        dscp: '数据结构',
        Description: {
            range: [default_property_range.TEXT],
        }
    },
    data_size: {
        dscp: '数据大小',
        Description: {
            range: [default_property_range.INT],
        }
    }

}

for (let key in default_property_bean) {
    default_property_bean[key].class_name = key
}

let default_beam_data = default_property_bean.topDataProperty
for (let key in default_property_bean) {
    // let temp_data = Object.assign({}, default_beam_data)
    let temp_data = deepcopy(default_beam_data)
    default_property_bean[key] = Object.assign(temp_data, default_property_bean[key])
    if(key !== META.topDataProperty)
        default_property_bean[key].Description[META.subPropertyOf] = [META.topDataProperty]
}
// console.log(default_property_bean)

export {
    default_property_bean,
    default_property_range
}
