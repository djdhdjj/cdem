import test_owl_txt from '../data/owl_txt'
import rdf from 'rdf'

// 尝试了转为rdf,有bug
console.log(test_owl_txt)
// const parse = rdf.TurtleParser.parse('<> a <Page> .', 'http://example.com/');
const parse = rdf.TurtleParser.parse(test_owl_txt, 'http://example.com/');
console.log(parse.graph.toArray().join("\n"))

export default undefined