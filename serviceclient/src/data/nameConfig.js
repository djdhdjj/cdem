// 整理存儲元數據
const META = {
    id: 'id',
    name: 'name',
    Default: 'Default',
    
    OBJECT: 'OBJECT',   //字典类型
    // VALUE: 'VALUE',
    SCRIPT: 'SCRIPT',
    // ANNOTATION: 'ANNOTATION',
    NUMERICAL: 'NUMERICAL',
    ENUM: 'ENUM',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    INT: 'INT',
    ARRAY: 'ARRAY',
    ARRAYTEXT: 'ARRAYTEXT',

    CarrierIs: 'CarrierIs',
    FUNC: 'FUNC',
    INVERSE_FUNC: 'INVERSE_FUNC',
    TRANS: 'TRANS',
    SYMMETRIC: 'SYMMETRIC',

    Participant: 'Participant',
    ParticipantConcept: 'ParticipantConcept',
    Resource: 'Resource',
    ResourceConcept: 'ResourceConcept',
    ResourceSet: 'ResourceSet',
    Quota: 'Quota',
    QuotaConcept: 'QuotaConcept',
    Carrier: 'Carrier',
    CarrierConcept: 'CarrierConcept',

    Concept: 'Concept',
    Instance: 'Instance',

    Goal: 'Goal',
    GoalConcept: 'GoalConcept',

    Ability: 'Ability',
    AbilityConcept: 'AbilityConcept',

    Environment: 'Environment',

    ALL: 'ALL',   //所有
    Task: 'Task',

    Possess: 'Possess',
    PartOf: 'PartOf',
    GoalIs: 'GoalIs',
    Input: 'Input',
    Output: 'Output',
    Implement: 'Implement',
    CanUse: 'CanUse',
    Involve: 'Involve',

    step: 'step',

    unit: 'unit',
    goal_dscp: 'goal_dscp',
    is_global: 'is_global',
    priority: 'priority',
    weight: 'weight',
    quota_dscp: 'quota_dscp',

    divisible: 'divisible',
    has_lock: 'has_lock',
    amount: 'amount',

    Thing: 'Thing', //顶层元素
    topObjectProperty: 'topObjectProperty', //顶层关系
    topDataProperty: 'topDataProperty', //顶层属性
    // 本体的属性
    Equivalent: 'equivalentClass',
    SubClassOf: 'subClassOf',
    GeneralClassAxioms: 'General class axioms',
    SubclassOfAnonymousAncestor: 'subClassOf',
    // Instance: 'Instance'
    TargetForKey: 'Target for Key',
    DisjointUnionOf: 'Disjoint Union Of',

    Characteristics: 'Characteristics',

    // 边的
    Functional: 'Functional',
    InverseFunctional: 'InverseFunctional',
    Transitive: 'Transitive',
    Symmetric: 'Symmetric',
    Asymmetric: 'Asymmetric',
    Reflexive: 'Reflexive',
    Irreflexive: 'Irreflexive',

    equivalentClass: 'equivalentClass',
    InverseOf: 'Inverse Of',
    DomainIntersection: 'Domain(Intersection)',
    RangeIntersection: 'Range',
    disjointWith: 'disjointWith',
    subPropertyOfChain: 'subPropertyOf (Chain)',
    subPropertyOf: 'subPropertyOf',

    BPMN_element: 'BPMN_element',

    ExclusiveGateWay: 'ExclusiveGateWay',
    ParallelGateway: 'ParallelGateway',
    Gateway: 'Gateway',


    dataObject: 'dataObject',
    currencyObject: 'currencyObject',
    // dataObject: 'dataObject',

    dataFlow: 'dataFlow',
    valueFlow: 'valueFlow',

    SequenceFlow: 'SequenceFlow',
}


export default META
