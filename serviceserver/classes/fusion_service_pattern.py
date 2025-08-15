import random
import time
from os.path import join
from typing import List, Dict

import gensim
import networkx as nx
from networkx.classes.reportviews import DiDegreeView
from networkx.readwrite import json_graph

from classes.autoLayout import Calculate
from servicesysserver.settings import DEBUG
from tools import common_function
from tools.common_function import get_uuid4
from tools.file_manager import file_manager

if DEBUG:
    model_name = 'word2vec_wx'
else:
    model_name = 'baike_26g_news_13g_novel_229g.model'
model_path = join(file_manager.root_path, 'word2vec', model_name)
model = gensim.models.Word2Vec.load(model_path)


def generate_key_id():
    return str(time.asctime(time.localtime(time.time())) + str(random.randint(0, 10000)))


def generate_gohashid():
    return get_uuid4()


class PatternGraph:
    def __init__(self, name, workspace):
        self.work_space = workspace
        self.servicePatternJson = workspace.find_service_pattern(name).toJson()
        self.topic = name

    @property
    def constructGraph(self):
        pattern_g = nx.DiGraph(topic=self.topic)
        links_data = self.servicePatternJson["links"]
        nodes_data = self.servicePatternJson["nodes"]
        pattern_g.graph["topic"] = self.topic
        # 在图中加入节点
        for n in range(len(nodes_data)):
            pattern_g.add_node(nodes_data[n]["key"],
                               name=nodes_data[n]["name"],
                               category=nodes_data[n]["category"],
                               __gohashid=nodes_data[n]["__gohashid"],
                               type=(nodes_data[n]["type"] if "type" in nodes_data[n].keys() else None),
                               group=(nodes_data[n]["group"] if "group" in nodes_data[n].keys() else None),
                               goal=(nodes_data[n]["goal"] if "goal" in nodes_data[n].keys() else None),
                               participant=(
                                   nodes_data[n]["participant"] if "participant" in nodes_data[n].keys() else None),
                               props=(nodes_data[n]["props"] if "props" in nodes_data[n].keys() else None),
                               superProps=(
                                   nodes_data[n]["superProps"] if "superProps" in nodes_data[n].keys() else None),
                               stroke=(nodes_data[n]["stroke"] if "stroke" in nodes_data[n].keys() else None),
                               objectProperty=(
                                   nodes_data[n]["objectProperty"] if "objectProperty" in nodes_data[
                                       n].keys() else None)
                               )
        # 在图中加入边
        for i in range(len(links_data)):
            pattern_g.add_edge(links_data[i]["from"], links_data[i]["to"],
                               category=links_data[i]["category"],
                               __gohashid=links_data[i]["__gohashid"],
                               key=(links_data[i]["key"]))

        # 补全原始数据中没有显示表达出来的边
        for i in range(len(nodes_data)):
            # 补全参与者与其他的关系
            if nodes_data[i]["category"] == "Lane":
                for j in range(len(nodes_data)):
                    # 参与者执行任务
                    if nodes_data[j]["category"] == "task" and nodes_data[i]["key"] == nodes_data[j]["group"]:
                        pattern_g.add_edge(nodes_data[i]["key"], nodes_data[j]["key"], category="execute",
                                           __gohashid=generate_gohashid(), key=generate_key_id())
                    if nodes_data[j]["category"] == "start" and nodes_data[i]["key"] == nodes_data[j]["group"]:
                        pattern_g.add_edge(nodes_data[i]["key"], nodes_data[j]["key"], category="execute",
                                           __gohashid=generate_gohashid(), key=generate_key_id())
                    if nodes_data[j]["category"] == "end" and nodes_data[i]["key"] == nodes_data[j]["group"]:
                        pattern_g.add_edge(nodes_data[i]["key"], nodes_data[j]["key"], category="execute",
                                           __gohashid=generate_gohashid(), key=generate_key_id())
                    if nodes_data[j]["category"] == "resourceObject" and nodes_data[i]["key"] == nodes_data[j]["group"]:
                        pattern_g.add_edge(nodes_data[i]["key"], nodes_data[j]["key"], category="has",
                                           __gohashid=generate_gohashid(), key=generate_key_id())
                    if nodes_data[j]["category"] == "dataObject" and nodes_data[i]["key"] == nodes_data[j]["group"]:
                        pattern_g.add_edge(nodes_data[i]["key"], nodes_data[j]["key"], category="has",
                                           __gohashid=generate_gohashid(), key=generate_key_id())
                    if nodes_data[j]["category"] == "currencyObject" and nodes_data[i]["key"] == nodes_data[j]["group"]:
                        pattern_g.add_edge(nodes_data[i]["key"], nodes_data[j]["key"], category="has",
                                           __gohashid=generate_gohashid(), key=generate_key_id())
            # pool 是整个模式 所以删掉,融合结束后再补充
            if nodes_data[i]["category"] == "Pool":
                pattern_g.remove_node(nodes_data[i]["key"])
        return pattern_g


class FusionServicePattern:
    def __init__(self, pattern_name1, pattern_name2, workspace, newName, participant_dic, seq, rel, topic=None,
                 theta=None):
        self.p_dic = participant_dic
        self.seq = seq
        self.rel = rel
        self.topic = topic
        self.theta = theta
        self.name = newName
        self.G1 = PatternGraph(pattern_name1, workspace).constructGraph
        self.G2 = PatternGraph(pattern_name2, workspace).constructGraph
        self.G = nx.DiGraph()
        self.workspace = workspace
        self.pattern_name1 = pattern_name1
        self.pattern_name2 = pattern_name2
        self.G = nx.compose(self.G1, self.G2)
        self.model = model

    @staticmethod
    def text_cut(stringText):
        result_list = []
        cut_len = [2, 3, 4, 5]
        for i in range(len(stringText)):
            result_list.append(stringText[i])
            result_list.append(' ')
        result_string = ''.join(result_list)
        res_list = result_string.split()
        for item in cut_len:
            for i in range(len(stringText)):
                if i + item <= len(stringText):
                    res_list.append(stringText[i:i + item])
        return res_list

    def similarityCalculate(self, text1, text2):
        text_list1 = self.text_cut(text1)
        text_list2 = self.text_cut(text2)
        t1 = []
        t2 = []
        for item in text_list1:
            if item in self.model:
                t1.append(item)
        for item in text_list2:
            if item in self.model:
                t2.append(item)
        sim = 0
        for x in t1:
            for y in t2:
                sim = sim + self.model.similarity(x, y)
        similarity = sim / (len(t1) * len(t2))
        return similarity

    # 两个节点合并为一个（同时考虑了group属性）,多余节点已删除
    def nodeMerge(self, node1, node2):
        graph = self.G
        if node1 in graph.nodes() and node2 in graph.nodes():
            for n in graph.successors(node2):
                s = graph[node2][n]["category"]
                if graph.nodes[n]["group"] == node2:
                    graph.nodes[n]["group"] = node1
                graph.add_edge(node1, n, category=s, __gohashid=generate_gohashid(), key=generate_key_id())
            for n in graph.predecessors(node2):
                s = graph[n][node2]["category"]
                if graph.nodes[n]["group"] == node2:
                    graph.nodes[n]["group"] = node1
                graph.add_edge(n, node1, category=s, __gohashid=generate_gohashid(), key=generate_key_id())
            graph.remove_node(node2)

    # node2插入到node1之后G.add_edge
    def nodeAfterInsert(self, node1, node2, category):
        del_links = []
        if node1 in self.G.nodes() and node2 in self.G.nodes():
            for n in self.G.successors(node1):
                self.G.add_edge(node2, n, category="controlFlow", key=generate_key_id(),
                                __gohashid=generate_gohashid())
                del_links.append(n)
        self.G.add_edge(node1, node2, category=category, key=generate_key_id(), __gohashid=generate_gohashid())
        for x in del_links:
            self.G.remove_edge(node1, x)

    def merge_participant(self, G):
        for k in self.p_dic.keys():
            for n in G.nodes(data=True):
                if n[1].get("group") == self.p_dic[k]:
                    n[1]["group"] = k
            self.nodeMerge(k, self.p_dic[k])

    @staticmethod
    def orderDict(dicts, n):
        result = []
        result1 = []
        p = sorted([(k, v) for k, v in dicts.items()], reverse=True)
        s = set()
        for i in p:
            s.add(i[1])
        for i in sorted(s, reverse=True)[:n]:
            for j in p:
                if j[1] == i:
                    result.append(j)
        for r in result:
            result1.append(r[0])
        return result1

    # 现有的数据界面缺乏载体与载体之间的联系，看要不要 要的话可以再加
    # 资源融合：1）同一个参与者的资源融合   2）不同模式之间的资源的链接预测（specific_type指子要素，目前主要针对平台）
    # def merge_resource(self):
    #     G1_platform_dict = {}
    #     G2_platform_dict = {}
    #     for n in self.G1.nodes(data=True):
    #         if n[1].get("category") == "task":
    #             G1_platform_dict[n[0]] = self.G1.degree(n[0])
    #     for n in self.G2.nodes(data=True):
    #         if n[1].get("category") == "":
    #             G2_platform_dict[n[0]] = self.G2.degree(n[0])
    #     res1 = self.order_dict(G1_platform_dict, len(G1_platform_dict))
    #     res2 = self.order_dict(G2_platform_dict, len(G2_platform_dict))
    #     self.G.add_edge(res1[0], res2[0], type="support")
    #
    #     # 完成资金融合
    #     nodelist = []
    #     for n in self.G.nodes(data=True):
    #         # 采用了测试数据的说法：lane (particiant)
    #         if n[1].get("specificCategory") == "Lane":
    #             money_node = []
    #             money = 0
    #             for mn in self.G.successors(n[0]):
    #                 if self.G.nodes[mn]["specificCategory"] == "money":
    #                     money_node.append(mn)
    #                     money = money + int(self.G.nodes[mn]["number"])
    #             for index, node in enumerate(money_node):
    #                 if index == 0:
    #                     self.G.nodes[node]["number"] = money
    #                 else:
    #                     nodelist.append(node)
    #     for i in nodelist:
    #         self.G.remove_node(i)

    # 模式1调用模式2
    def call_patten(self):
        sim = self.theta
        for n in self.G1.nodes(data=True):
            if n[1]["category"] == "task":
                sim_res = self.similarityCalculate(n[1]["name"], self.G2.graph["topic"])
                # sim_res = Levenshtein.ratio(n[1]["type"], self.G2.graph["topic"])
                if sim_res > sim:
                    sim = sim_res
                    for node in self.G2.nodes(data=True):
                        if node[1]["category"] == "start":
                            self.G.add_edge(n[0], node[0], category="controlFlow", key=generate_key_id(),
                                            __gohashid=generate_gohashid())
                            self.nodeMerge(n[0], node[0])
                            break
                    for node in self.G2.nodes(data=True):
                        if node[1]["category"] == "end":
                            self.G.add_edge(node[0], n[0], category="controlFlow", key=generate_key_id(),
                                            __gohashid=generate_gohashid())
                            self.nodeMerge(n[0], node[0])
                            break

    # 模式1与模式2在同一阶段且互斥
    def exclusive_pattern(self):
        node = generate_key_id()
        for n in self.G1.nodes(data=True):
            if n[1]["category"] == "start":
                for n2 in self.G2.nodes(data=True):
                    if n2[1]["category"] == "start":
                        self.G.add_node(node, name="exclusive",
                                        category="exclusive",
                                        __gohashid=generate_gohashid(),
                                        type="BPMN概念/ExclusiveGateWay",
                                        group=n[1]["group"])
                        self.nodeMerge(node, n2[0])
                        self.nodeAfterInsert(n[0], node, "controlFlow")

    # 完全并行
    def full_parallel(self):
        node = generate_key_id()
        for n in self.G1.nodes(data=True):
            if n[1]["category"] == "start":
                for n2 in self.G2.nodes(data=True):
                    if n2[1]["category"] == "start":
                        self.G.add_node(node, name="parallel",
                                        category="parallel",
                                        __gohashid=generate_gohashid(),
                                        type="BPMN概念/ParallelGateWay",
                                        group=n[1]["group"])
                        self.nodeMerge(node, n2[0])
                        self.nodeAfterInsert(n[0], node, "controlFlow")

    def semi_parallel(self):
        for n1 in self.G1.nodes(data=True):
            if n1[1].get("category") == "task":
                for n2 in self.G2.nodes(data=True):
                    if (n2[1].get("category") != "start" and
                            n2[1].get("category") != "end" and
                            self.similarityCalculate(n1[1].get("name"), n2[1].get("name")) > self.theta):
                        g1_degree = DiDegreeView(self.G1)(n1[0])
                        g2_degree = DiDegreeView(self.G2)(n2[0])
                        if abs(g1_degree - g2_degree) == 0:
                            self.nodeMerge(n1[0], n2[0])
            if n1[1].get("category") == "start":
                for n2 in self.G2.nodes(data=True):
                    if n2[1].get("category") == "start":
                        self.nodeMerge(n1[0], n2[0])
            if n1[1].get("category") == "end":
                for n2 in self.G2.nodes(data=True):
                    if n2[1].get("category") == "end":
                        self.nodeMerge(n1[0], n2[0])

    def sequence(self):
        graph_first = None
        graph_second = None

        if self.seq == 1:
            graph_first, graph_second = self.G1, self.G2
        if self.seq == 2:
            graph_first, graph_second = self.G2, self.G1
        if graph_first is None or graph_second is None:
            return

        for n1 in graph_first.nodes(data=True):
            if n1[1].get("category") == "end":
                for n2 in graph_second.nodes(data=True):
                    if n2[1].get("category") == "start":
                        self.nodeMerge(n1[0], n2[0])
                        self.G.nodes[n1[0]]["name"] = "connectNode"
                        self.G.nodes[n1[0]]["category"] = "task"
                        self.G.nodes[n1[0]]["type"] = "BPMN概念/task"

    # 过程融合  seq: G1，G2的顺序， seq=1，G1在前；seq=2，G2在前; seq=0表示同一阶段
    # rel（seq=0） : exclusive  full-parallel semi-parallel  call  完全并行 半并行 互斥  调用(默认被调用的模式为G2)
    # rel (seq!=0): sequencial
    def process_merge(self):
        if self.seq == 0:
            if self.rel == "call":
                self.call_patten()
            if self.rel == "exclusive":
                self.exclusive_pattern()
            if self.rel == "full_parallel":
                self.full_parallel()
            if self.rel == "semi_parallel":
                self.semi_parallel()
        if self.seq == 1 or self.seq == 2:
            self.sequence()

    def config_merge(self, resultJson):
        config_dict = {"name": self.name, "id": generate_key_id()}
        resultJson["config"] = config_dict

        pattern1 = self.workspace.find_service_pattern(self.pattern_name1).toJson()
        pattern2 = self.workspace.find_service_pattern(self.pattern_name2).toJson()
        resultJson["evaluate_config"] = common_function.dict_update(pattern1["evaluate_config"],
                                                                    pattern2["evaluate_config"])
        resultJson["resource_config"] = common_function.dict_update(pattern1["resource_config"],
                                                                    pattern2["resource_config"])

    def merge(self):
        self.merge_participant(self.G)
        # self.merge_resource()
        self.process_merge()
        res_json = json_graph.node_link_data(self.G)

        res_json.pop('directed')
        res_json.pop('multigraph')
        res_json.pop('graph')

        # 补上poolNode
        pool_node = {
            "isGroup": "true",
            "category": "Pool",
            "type": "BPMN概念/LaneSet",
            "name": self.name,
            "key": generate_key_id(),
            "__gohashid": generate_gohashid()
        }

        # 处理边
        links: List[Dict] = res_json['links']
        for link in links:
            link['from'] = link.pop("source")
            link['to'] = link.pop("target")
            link['category'] = link.pop("category")
            link['__gohashid'] = link.pop("__gohashid")
            link['key'] = link.pop("key")

        # 处理节点
        nodes: List[Dict] = res_json['nodes']
        for item in nodes[:]:
            if len(item.keys()) < 3:
                nodes.remove(item)
        for item in nodes[:]:
            item["key"] = item.pop("id")
            if "category" not in item.keys():
                nodes.remove(item)
                continue

            if item["category"] == "Lane":
                item["isGroup"] = "true"
                item["group"] = pool_node["key"]

            if item["category"] == "task" or \
                    item["category"] == "parallel" or \
                    item["category"] == "start" or \
                    item["category"] == "exclusive" or \
                    item["category"] == "end":
                # link 补全
                for link in links[:]:
                    if link["category"] == "has":
                        links.remove(link)
                    if link["to"] == item["key"] and \
                            link["category"] == "execute":
                        item["group"] = link["from"]
                        links.remove(link)

        res_json["nodes"].append(pool_node)

        res = Calculate(res_json).nodeLoc()
        self.config_merge(res)
        res['nodes'] = list(map(lambda d: {k: d for k, d in filter(lambda x: x[1] is not None, d.items())},
                                res['nodes']))
        return res
