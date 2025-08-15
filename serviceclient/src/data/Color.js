
const COLOR = {
    YELLOW:  '#eda222',
    LIGHT_YELLOW: '#FFEB3B',
    LIGHT_GOLDEN: '#f6f2cf',

    LIGHT_BLUE: '#128fec',
    DARK_BLUE: '#03415a',

    DARK_GREEN: '#13634e',
    LIGHT_DARK_GREEN: '#56b499',

    DARK_RED: '#cf5b28',
    LIGHT_DARK_RED: '#cf8768',

    BROWN: '#8a4d30',

    GRIEGE: '#e6e1c7',  //米灰色
    ORANGE: "#ea2857",
    WHITE: '#fff',
    DIRTY_WHITE: '#e0dfe8',

    // UI背景底色
    PURE_BLACK: '#15191b',
    LIGHT_BLACK: '#2d2d2d',
    MAIN_DARK_GRAY: '#22252a',

}


// 属性类型=》颜色
const elmType2Color = {
    Participant: COLOR.DARK_BLUE,
    ParticipantConcept: COLOR.LIGHT_BLUE,

    Resource: COLOR.YELLOW,
    ResourceConcept: COLOR.LIGHT_YELLOW,
    ResourceSet: COLOR.YELLOW,

    Goal: COLOR.DARK_GREEN,
    GoalConcept: COLOR.LIGHT_DARK_GREEN,

    Ability: COLOR.DARK_RED,
    AbilityConcept: COLOR.LIGHT_DARK_RED,

    Environment: COLOR.BROWN,

}
const index2Color = [
    COLOR.DARK_BLUE,
    COLOR.LIGHT_BLUE,
    COLOR.YELLOW,
    COLOR.LIGHT_YELLOW,
    COLOR.YELLOW,
    COLOR.DARK_GREEN,
    COLOR.DARK_RED,
    COLOR.BROWN,
]

const carrier2Color = {
    Default: COLOR.DARK_RED,
    Test: COLOR.DARK_BLUE
}

export default COLOR
export {
    elmType2Color,
    index2Color,
    carrier2Color

}
