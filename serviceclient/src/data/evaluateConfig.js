// const { genUniqueID } = require("../manager/commonFunction")

// {
//     node_name: {
//         duration: {
//             type: ,
//             array: [],
//         }
//     }   
// }

var distribution = {
    binomial: {
        array: [],
    },
    polynomial: {
        array: [],
    },
    poisson: {
        n: 0,
    },
    uniform: {
        n: 0,
        m: 0,
    },
    exponential: {
        n: 0,
    },
    gaussian: {
        mu: 0,
        sigma: 0,
    },
    constant: {
        n: 0,
    },
}

var default_evaluate_config = {
    Lane: {
        // type: ''
    },
    event: {
        duration: {
            type: 'constant',
            n: 0,
        },    
        cost: {
            type: 'constant',
            n: 0,
        },    
        throughput: {
            type: 'constant',
            n: 0,
        },    
        reliability: {
            type: 'constant',
            n: 0,
        },    
    },
    task: {
        duration: {
            type: 'constant',
            n: 0,
        },    
        cost: {
            type: 'constant',
            n: 0,
        },    
        throughput: {
            type: 'constant',
            n: 0,
        },    
        reliability: {
            type: 'constant',
            n: 0,
        },    
    },
    gateway: {
        duration: {
            type: 'constant',
            n: 0,
        },
        cost: {
            type: 'constant',
            n: 0,
        },
        throughput: {
            type: 'constant',
            n: 0,
        },
        reliability: {
            type: 'constant',
            n: 0,
        },        
    },
    dataObject:{
        type:'constant',
        unit:'件',
        amount:{
            type: 'constant',
            n: 0,
        }

    },
    currencyObject:{
        type:'constant',
        unit:'元',
        amount:{
            type: 'constant',
            n: 0,
        }

    },
    resourceObject:{
        type:'constant',
        unit:'件',
        amount:{
            type: 'constant',
            n: 0,
        }

    },
}

export {
    default_evaluate_config,
    distribution,
}
// export default class EvaluateConfig {
//     constructor(pattern_diagram){
//         this.config_id = genUniqueID()
//         this.pattern_diagram = pattern_diagram
//     }

// }