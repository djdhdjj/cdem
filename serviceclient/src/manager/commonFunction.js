import * as d3 from 'd3'

// 越靠后越重要,可以用Object.assign代替
const propCombine = pro_array => {
    const props = {}
    pro_array.forEach(pro => {
        for(let key in pro){
            props[key] = pro[key]
        }
    });
    return props
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// 数组中随机选取一个
function randomChoice(array){
    const len = array.length
    const random_index = Math.floor(Math.random() * len)
    return array[random_index]
}

function parseLoc(loc){
    return loc.split(' ').map(elm=> parseFloat(elm))
}
function toLoc(obj){
    return obj.x + ' ' + obj.y
}

function strSimply(str, max_length){
    const str_lentgh = str.length
    if(str_lentgh>max_length){
        return str.substring(0, max_length) + '...'
    }else{
        return str
    }
}

function typeOf(obj) {
    var typeList = {
        '[object Boolean]'  : 'boolean',
        '[object Number]'   : 'number',
        '[object String]'   : 'string',
        '[object Function]' : 'function',
        '[object Array]'    : 'array',
        '[object Date]'     : 'date',
        '[object RegExp]'   : 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]'     : 'null',
        '[object Object]'   : 'object',
    };
    return typeList [Object.prototype.toString.call(obj)];
}

function dict2array(dict){
    return Object.keys(dict).map(key => dict[key])
}

const normalLiner = d3.line()
.x(d => d.x)
.y(d => d.y)

var id_count = -1
const genUniqueID = () =>　{
    id_count++
    return (new Date()).toLocaleDateString() + " " + (new Date()).toLocaleTimeString() + id_count
}

const arrayRemove = (array, item) => {
    array.forEach((it, index) => {
        if (it === item) {
            array.splice(index, 1)
        }
    })
}

export {
    propCombine,
    download,
    randomChoice,
    parseLoc,
    toLoc,
    strSimply,
    typeOf,
    dict2array,
    normalLiner,
    genUniqueID,
    arrayRemove
}
