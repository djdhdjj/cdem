import * as d3 from 'd3';
import deepcopy from "deepcopy";
import COLOR from "../../../data/Color";
const WIDTH = 1000;
const HEIGHT = 1000;

export default class ForceSimulation{
    constructor(nodes, links,type){
        const set = new Set();
        const sim_nodes=[];
        nodes.concept.map((elm)=>{
          if(!set.has(elm.key)){
            set.add(elm.key);
            sim_nodes.push({
              name: elm.key,
              type:"concept"
            });
          }
 
        })
        nodes.relation.map((elm)=>{
          if(!set.has(elm.key)){
              set.add(elm.key);
              sim_nodes.push({
                name: elm.key,
                type:"relation"
              });
          }
        })
        nodes.relation.map((elm)=>{
          if(!set.has(elm.key)){
            set.add(elm.key);
            sim_nodes.push({
              name: elm.key,
              type:"property"
            });
        }
        })
        const sim_links = links.map(elm=>{
            return {
                source: elm.from,
                target: elm.to,
                tag:elm.text,
            }
        })
        for(let k in sim_links){
            if(!set.has(sim_links[k].source)){
                set.add(sim_links[k].source);
                sim_nodes.push({name:sim_links[k].source,type:"property"})
            }
            if(!set.has(sim_links[k].target)){
                set.add(sim_links[k].target);
                sim_nodes.push({name:sim_links[k].target,type:"property"})
            }
        }
    
        this.init(sim_nodes,sim_links,type);

    }
    removeold(){
      d3.select('#dialigramDiv').select('svg').remove();
    }
    init = (nodes, edges,type) => {
        //定义力模型
        //定义力模型，force函数可以设置议以下几种力的类型
        //Center：重力点，设置力导向图的力重心位置。设置之后无论怎么拖拽，
        //力的重心都不会变；不设置的话力重心会改变，但力重心的初始位置会在原点，
        //这意味着刚进入页面你只能看到1/4的图，很影响体验。
        //Collision：节点碰撞作用力，.strength参数范围为[0，1]。
        // Links：连线的作用力；.distance设置连线两端节点的距离。
        // Many-Body：.strength的参数为正时，模拟重力，为负时，模拟电荷力；.distanceMax的参数设置最大距离。
        // Positioning：给定向某个方向的力
        const simulation = d3.forceSimulation(nodes)
        // .force("charge", d3.forceManyBody().distanceMin([100]) )
        .force("charge", d3.forceManyBody().strength(50))
        .force("link", d3.forceLink(edges)
            .id((d) => {return d.name})
            .strength(1)
            .distance(200)
        )
        .force("center", d3.forceCenter(WIDTH / 2, HEIGHT / 2-100))
        //.force("center", d3.forceCenter().x(-300).y(0))
        .force("collision",d3.forceCollide(100).strength(0.5))//.iterations(15)
    
        //缩放
        function onZoomStart(d) {
          // console.log('start zoom');
        }
        function zooming(d) {
          // 缩放和拖拽整个g
          // console.log('zoom ing', d3.event.transform, d3.zoomTransform(this));
          g.attr('transform', d3.event.transform); // 获取g的缩放系数和平移的坐标值。
        }
        function onZoomEnd() {
          // console.log('zoom end');
        }
        const zoom = d3.zoom()
          // .translateExtent([[0, 0], [WIDTH, HEIGHT]]) // 设置或获取平移区间, 默认为[[-∞, -∞], [+∞, +∞]]
          .scaleExtent([1 / 10, 10]) // 设置最大缩放比例
          .on('start', onZoomStart)
          .on('zoom', zooming)
          .on('end', onZoomEnd);
    
        //绘制svg
        const svg = d3.select('#dialigramDiv').append('svg') // 在id为‘theChart’的标签内创建svg
          .style('width', WIDTH)
          .style('height', HEIGHT)
          .on('click', () => {
            console.log('click', d3.event.target.tagName);
          })
          .call(zoom); // 缩放
        const g = svg.append('g'); // 则svg中创建g
    
        //绘制连线
        const edgesLine = svg.select('g')
          .selectAll('line')
          .data(edges) // 绑定数据
          .enter() // 为数据添加对应数量的占位符
          .append('path') // 在占位符上面生成折线（用path画）
          .attr('d', (d) => { return d && 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y; }) //遍历所有数据。d表示当前遍历到的数据，返回绘制的贝塞尔曲线
          .attr('id', (d, i) => { return 'edgepath' + i; }) // 设置id，用于连线文字
          .attr('marker-end', 'url(#arrow)') // 根据箭头标记的id号标记箭头
          .style('stroke', '#fff') // 颜色
          .style('stroke-width', 1); // 粗细
    
        //连线名称
        const edgesText = svg.select('g').selectAll('.edgelabel')
          .data(edges)
          .enter()
          .append('text') // 为每一条连线创建文字区域
          .attr('class', '.edgelabel')
          .attr('dx',80)
          .attr('dy',-10);
        edgesText.append('textPath')
          .attr('xlink:href', (d, i) => { return '#edgepath' + i; }) // 文字布置在对应id的连线上
          .style('pointer-events', 'none') // 禁止鼠标事件
          .attr('fill', '#fff')// 填充颜色
          .text((d) => { return d && d.tag; }); // 设置文字内容
    
        //绘制连线上的箭头
        const defs = g.append('defs'); // defs定义可重复使用的元素
        const arrowheads = defs.append('marker') // 创建箭头
          .attr('id', 'arrow')
          // .attr('markerUnits', 'strokeWidth') // 设置为strokeWidth箭头会随着线的粗细进行缩放
          .attr('markerUnits', 'userSpaceOnUse') // 设置为userSpaceOnUse箭头不受连接元素的影响
          .attr('class', 'arrowhead')
          .attr('markerWidth', 20) // viewport
          .attr('markerHeight', 20) // viewport
          .attr('viewBox', '0 0 20 20') // viewBox
          .attr('refX', 9.3 + 40) // 偏离圆心距离
          .attr('refY', 5) // 偏离圆心距离
          .attr('orient', 'auto'); // 绘制方向，可设定为：auto（自动确认方向）和 角度值
        arrowheads.append('path')
          .attr('d', 'M0,0 L0,10 L10,5 z') // d: 路径描述，贝塞尔曲线
          .attr('fill', '#fff'); // 填充颜色
    
        //拖拽
        function onDragStart(d) {
          // console.log('start');
          // console.log(d3.event.active);
          if (!d3.event.active) {
            simulation.alphaTarget(1) // 设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0，1]
              .restart();  // 拖拽节点后，重新启动模拟
          }
          d.fx = d.x;    // d.x是当前位置，d.fx是静止时位置
          d.fy = d.y;
        }
        function dragging(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }
        function onDragEnd(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
          d.fx = null;       // 解除dragged中固定的坐标
          d.fy = null;
        }
        const drag = d3.drag()
          .on('start', onDragStart)
          .on('drag', dragging) // 拖拽过程
          .on('end', onDragEnd);
    
        //绘制节点
        const nodesCircle = svg.select('g')
          .selectAll('circle')
          .data(nodes)
          .enter()
          .append('circle') // 创建圆
          .attr('r', 40) // 半径
          .style('fill', "#506273") // 填充颜色
          .style('stroke', (data)=>{
            if(data.type=="concept")return "#BA55D3";
            if(data.type=="relation")return '#00ff00';
            if(data.type=="property")return '#00FFFF'}) // 边框颜色
          .style('stroke-width', 1) // 边框粗细
          .on('click', (node) => { // 点击事件
            console.log('click');
          })

          //.call(drag); // 拖拽单个节点带动整个图

          if(type){
            nodesCircle.call(drag)
          }
          
        //节点名称
        const nodesTexts = svg.select('g')
          .selectAll('.jdtext')
          .data(nodes)
          .enter()
          .append('text')
          .attr('class', '.jdtext')//bug修复
          .attr('dy', '.3em') // 偏移量
          .attr('text-anchor', 'middle') // 节点名称放在圆圈中间位置
          .style('fill', 'white') // 颜色
          .style('pointer-events', 'none') // 禁止鼠标事件
          .text((d) => { // 文字内容
            return d && d.name; // 遍历nodes每一项，获取对应的name
          });
    
        //鼠标移到节点上有气泡提示
        nodesCircle.append('title')
          .text((node) => { // .text设置气泡提示内容
            return node.name; // 气泡提示为node的名称
          });
    
        //监听图元素的位置变化
        simulation.on('tick', () => {
          // 更新节点坐标
          nodesCircle.attr('transform', (d) => {
            return d && 'translate(' + d.x + ',' + d.y + ')';
          });
          // 更新节点文字坐标
          nodesTexts.attr('transform', (d) => {
            return 'translate(' + (d.x) + ',' + d.y + ')';
          });
          // 更新连线位置
          edgesLine.attr('d', (d) => {
            const path = 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
            return path;
          });
          // 更新连线文字位置
          edgesText.attr('transform', (d, i) => {
            return 'rotate(0)';
          });
        });
        //点击选中节点事件
        nodesCircle.on('click', (node) => {
            nodesCircle.style('stroke', (nodeOfSelected) => { // nodeOfSelected：所有节点, node: 选中的节点
            if (nodeOfSelected.name === node.name) { // 被点击的节点变色
                console.log('node')
                    return '#FFDAB9';
                } else {
                    if(nodeOfSelected.type=="concept")return "#BA55D3";
                    if(nodeOfSelected.type=="relation")return '#00ff00';
                    if(nodeOfSelected.type=="property")return '#00FFFF'};
                }
            );
            edgesLine.style("stroke-width",function(line){
                if(line.source.name==node.name || line.target.name==node.name){
                    return 4;
                }else{
                    return 0.5;
                }
            });
            edgesLine.style("stroke",function(line){
                if(line.source.name==node.name || line.target.name==node.name){
                    return '#DAA520';
                }else{
                    return '#fff';
                }
            });
        })

      }
}
