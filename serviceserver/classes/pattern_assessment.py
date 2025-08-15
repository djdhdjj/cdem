# -*- coding: utf-8 -*-
# !/usr/bin/python
import random
import sys
import logging

import numpy as np
from tqdm import tqdm

sys.setrecursionlimit(1000000)

TAG2CATEGORY = {
    'startEvent': 'start',
    'endEvent': 'end',
    'parallelGateway': 'parallel',
    'exclusiveGateway': 'exclusive',
    'inclusiveGateway': 'inclusive',
    'complexGateway': 'complex',
}


class random_generator(object):
    def __init__(self, distribution, param_list, ratio=1, precision=3):
        if hasattr(self, distribution):
            distribution_func = getattr(self, distribution)
        else:
            exit('>>>分布名称传参有误<<<')
        try:
            self.result = round(distribution_func(param_list) * ratio, precision)
        except:
            # as the binomial and polynomial might have non-digital results
            self.result = distribution_func(param_list)
        self.result_str = str(self.result)

    def _checker(self, val):
        return val if val > 0 else 1

    def binomial(self, param_list):
        return self._checker(random.sample(param_list, 1)[0])

    def polynomial(self, param_list):
        return self._checker(random.sample(param_list, 1)[0])

    def poisson(self, param_list):
        return self._checker(np.random.poisson(param_list[0] - 1) + 1)

    def uniform(self, param_list):
        return self._checker(random.uniform(param_list[0], param_list[1]))

    def exponential(self, param_list):
        return self._checker(random.expovariate(param_list[0]))

    def constant(self, param_list):
        return self._checker(param_list[0])

    def gaussian(self, param_list):
        return self._checker(random.gauss(param_list[0], param_list[1]))


class PatternAssessment(object):
    def __init__(self, sp):

        self.sp = sp
        self.startEvent = self.sp.findNodeByCategory(TAG2CATEGORY['startEvent'])[0]  # find the only startEvent
        # self.endEventList = self.sp.findNodeByCategory(TAG2CATEGORY['endEvent']) #find the endEvents
        self.lastNodeList = self.sp.findNodeByOrder()  # find the nodes with no subsequent nodes

        for k, v in self.sp.key2node.items():
            print(f'{k}: {v}')

        self.all_nodes = [i for i in self.sp.key2node.values()
                          if i.category != 'Pool' and i.category != 'Lane' and
                          i.category != 'dataObject' and i.category != 'resourceObject' and i.category != 'currencyObject']

        self.node_num = len(self.all_nodes)

        self.to_list = lambda x, num: [x for i in range(num)]

        self.alpha_dict = {}  # 表示每个节点执行的次数期望
        self.init_alpha_dict()
        self.calculate_alpha(self.startEvent)

        self.key2reliability = {}
        self.key2cost = {}
        self.key2duration = {}
        self.key2volume = {}
        # self.init_cost_duration_reliability(self.all_nodes)

        # self.resource_config = sp.resource_config  # 表示每一类参与者对于每一类资源的资源价值转换比
        self.evaluate_config = sp.evaluate_config # all quantitative parameters

        self.display_dict = {
            'P_entropy': [],
            'duration': [],
            'cost': [],
            'reliability': [],
            'data_efficiency': [],
            'resource_efficiency': [],
            'currency_efficiency': [],
            'value': []
        }
        self.metric_name_list = list(self.display_dict.keys())

        self.node2node_time_dict = {}
        self.assess()

    # calculate the time length of each node from start event
    def calculate_node2node_time_dict(self):
        for node in self.sp.key2node.values():
            self.node2node_time_dict[node.key] = self.calculate_time_length(self.startEvent, node)
        return True

    # initiate alpha dictionary with node_id as key and init_num as value
    def init_alpha_dict(self, init_num=0):
        key_list = list(self.sp.key2node.keys())
        for key in key_list:
            self.alpha_dict[key] = init_num
        return True

    # calculate the expect of each node
    #### @functools.lru_cache()
    def calculate_alpha(self, node, ratio=1.0, threshold=1e-5):
        self.alpha_dict[node.key] += ratio  # add the expect of this node

        if node in self.lastNodeList or ratio < threshold:  # determine whether to end the recursion
            return True
        else:
            subnode_list = node.nextNodes
            sub_num = len(subnode_list)
            next_ratio = ratio if node.category == TAG2CATEGORY['parallelGateway'] else float(ratio / sub_num)

            param_list = [next_ratio, threshold]
            [next_ratio_list, threshold_list] = list(
                map(self.to_list, param_list, self.to_list(sub_num, len(param_list))))
            return list(map(self.calculate_alpha, subnode_list, next_ratio_list, threshold_list))

    # initiate cost, duration, and reliability according to the distributions
    def init_cost_duration_reliability(self, nodes):
        for node in nodes:
            if node.category == 'Pool':
                continue
            cost_params = node.cost_params
            duration_params = node.duration_params
            reliability_params = node.reliability_params

            self.key2cost[node.key] = random_generator(cost_params['distribution'], cost_params['param_list'],
                                                       cost_params['ratio']).result
            self.key2duration[node.key] = random_generator(duration_params['distribution'],
                                                           duration_params['param_list'],
                                                           duration_params['ratio']).result
            self.key2reliability[node.key] = random_generator(reliability_params['distribution'],
                                                              reliability_params['param_list'],
                                                              reliability_params['ratio']).result
            # in case that the default reliability is 0
            if self.key2reliability[node.key] == 0:
                self.key2reliability[node.key] = 1
        return 1

    # initiate data object volume according to the distributions
    def init_dataobject_volume(self, nodes):
        for node in nodes:
            volume_params = node.volume_params

            self.key2volume[node.key] = random_generator(volume_params['distribution'], volume_params['param_list'],
                                                         volume_params['ratio']).result
        return 1

    # judge whether node b would be executed after node a
    #### @functools.lru_cache()
    def nodea_before_nodeb(self, nodea, nodeb):
        subnode_list = nodea.nextNodes
        sub_num = len(subnode_list)
        if nodeb in subnode_list:
            return 1
        elif nodea in self.lastNodeList:
            return 0
        else:
            # 准备递归的参数
            param_list = [nodeb]
            [nodeb_list] = list(map(self.to_list, param_list, self.to_list(sub_num, len(param_list))))
            return sum(list(map(self.nodea_before_nodeb, subnode_list, nodeb_list)))

    # 计算node到end_node的时间长度（包含头尾）
    #### @functools.lru_cache()
    def calculate_time_length(self, node, end_node, ratio=1.0, threshold=1e-5, is_duration=False):
        node_expend = float(self.key2duration[node.key]) * ratio / float(self.key2reliability[node.key])

        if node is end_node or node in self.lastNodeList or node_expend < threshold:
            return node_expend
        else:
            subnode_list = node.nextNodes
            sub_num = len(subnode_list)
            next_ratio = ratio if node.category == TAG2CATEGORY['parallelGateway'] else float(ratio / sub_num)

            carrier = node.carrier
            subcarrier_list = [i.carrier for i in subnode_list]

            participant_key = node.group
            subparticipant_key_list = [i.group for i in subnode_list]

            participant_types = node.laneTypes
            subparticipant_types_list = [i.laneTypes for i in subnode_list]

            # 判断carrier还有paticipant带来的额外时间
            for i in range(sub_num):
                extra_expend = random_generator('poisson', [120]).result if (not list(
                    set(participant_types) & set(subparticipant_types_list[i]))) or (
                                                                                    'individual' in participant_types and participant_key !=
                                                                                    subparticipant_key_list[
                                                                                        i]) else random_generator(
                    'uniform', [0.5, 2.0]).result if carrier != subcarrier_list[i] else random_generator('poisson', [
                    50]).result / 1000
                node_expend += extra_expend * next_ratio

            # 准备递归的参数
            param_list = [end_node, next_ratio, threshold, is_duration]
            [end_node_list, next_ratio_list, threshold_list, is_duration_list] = list(
                map(self.to_list, param_list, self.to_list(sub_num, len(param_list))))
            # start recursion
            if node.category == TAG2CATEGORY['parallelGateway']:
                if is_duration:
                    return node_expend + max(list(
                        map(self.calculate_time_length, subnode_list, end_node_list, next_ratio_list, threshold_list,
                            is_duration_list)))  # to calculate operation duration, the longest path in parallel matters
                else:
                    tl_candidate_list = []
                    for subnode in subnode_list:
                        if self.nodea_before_nodeb(subnode, end_node):
                            tl_candidate_list.append(
                                self.calculate_time_length(subnode, end_node, next_ratio, threshold, is_duration))
                    if tl_candidate_list:
                        return node_expend + min(list(
                            map(self.calculate_time_length, subnode_list, end_node_list, next_ratio_list,
                                threshold_list, is_duration_list)))
                    else:
                        return node_expend + max(list(
                            map(self.calculate_time_length, subnode_list, end_node_list, next_ratio_list,
                                threshold_list, is_duration_list)))
            else:
                return node_expend + sum(list(
                    map(self.calculate_time_length, subnode_list, end_node_list, next_ratio_list, threshold_list,
                        is_duration_list)))

    # calculate the run time expect of the pattern
    #### @functools.lru_cache()
    def calculate_duration(self, node, end_node=None, ratio=1.0, threshold=1e-5):
        return self.calculate_time_length(node, end_node, ratio, threshold, True)

    # calculate the cost expect of the pattern
    def calculate_cost(self, nodes):
        cost = 0
        for node in nodes:
            if node.category == 'Pool':
                continue
            node_cost = self.key2cost[node.key]
            cost += node_cost * self.alpha_dict[node.key]  # calculate the operation cost
            unit_wait_cost = random_generator('uniform',
                                              [1.5, 2.0]).result / 86400  # TODO:the unit_wait cost could be customized
            cost += unit_wait_cost * self.node2node_time_dict[node.key]  # calculate the waiting cost
        return cost

    # calculate the reliability from startEvent to end_node
    #### @functools.lru_cache()
    def calculate_reliability(self, node, end_node=None, ratio=1.0, threshold=1e-5):
        node_reliability = self.key2reliability[node.key]
        if node is end_node or node in self.lastNodeList or node_reliability < threshold:
            return node_reliability
        else:
            subnode_list = node.nextNodes
            sub_num = len(subnode_list)
            next_ratio = ratio if node.category == TAG2CATEGORY['parallelGateway'] else float(ratio / sub_num)

            param_list = [end_node, next_ratio, threshold]
            [end_node_list, next_ratio_list, threshold_list] = list(
                map(self.to_list, param_list, self.to_list(sub_num, len(param_list))))
            if node.category == TAG2CATEGORY['parallelGateway']:
                return node_reliability * min(
                    list(map(self.calculate_reliability, subnode_list, end_node_list, next_ratio_list, threshold_list)))
            else:
                return node_reliability * sum(list(
                    map(self.calculate_reliability, subnode_list, end_node_list, next_ratio_list,
                        threshold_list))) / sub_num

    # TODO: add function to calculate the value for each participant
    def calculate_value(self):
        currency_object_list = self.sp.findNodeByCategory('currencyObject')
        resource_object_list = self.sp.findNodeByCategory('resourceObject')

        surplus_value = 0
        for data_object in currency_object_list:
            try:
                temp_source = data_object.sourceNodes[0]
                temp_target = data_object.targetNodes[0]

                surplus_value -= self.alpha_dict[temp_source.key] * self.key2volume[data_object.key]
                surplus_value += self.alpha_dict[temp_target.key] * self.key2volume[data_object.key]
            except:
                pass

        for data_object in resource_object_list:
            try:
                data_object_key = data_object.key
                temp_source = data_object.sourceNodes[0]
                temp_target = data_object.targetNodes[0]

                ts_name = str(temp_source.participant.key)
                tt_name = str(temp_target.participant.key)

                try:
                    ts_psi = self.evaluate_config[ts_name][data_object_key]
                except:
                    ts_psi = 1.0
                try:
                    tt_psi = self.evaluate_config[tt_name][data_object_key]
                except:
                    tt_psi = 1.0

                # if ts_name not in self.evaluate_config or data_object_key not in self.evaluate_config[ts_name]:
                #     ts_psi = 1.0
                # else:
                #     ts_psi = self.evaluate_config[ts_name][data_object_key]
                # if tt_name not in self.evaluate_config or data_object_key not in self.evaluate_config[tt_name]:
                #     tt_psi = 1.0
                # else:
                #     tt_psi = self.evaluate_config[tt_name][data_object_key]

                surplus_value -= self.alpha_dict[temp_source.key] * ts_psi * self.key2volume[data_object.key]
                surplus_value += self.alpha_dict[temp_target.key] * tt_psi * self.key2volume[data_object.key]
            except:
                pass

        return surplus_value

    # 计算data value resource 的 mean efficiency
    # @threshold 应与计算时间的最小单位一致
    def calculate_data_object(self, attr_name='currencyObject', threshold=1e-5):
        data_object_list = self.sp.findNodeByCategory(attr_name)
        # if len(data_object_list) == 0:
        #     return 0
        result = []
        for data_object in data_object_list:
            try:
                temp_volume = float(self.key2volume[data_object.key])

                temp_source = data_object.sourceNodes[0]
                temp_target = data_object.targetNodes[0]

                source_tl = self.node2node_time_dict[temp_source.key]
                target_tl = self.node2node_time_dict[temp_target.key]

                temp_duration = abs(target_tl - source_tl) if target_tl != source_tl else random_generator('poisson', [
                    50]).result / 1000.0
                temp_efficiency = temp_volume / temp_duration
                result.append(temp_efficiency)
            except:
                pass
        if len(result) == 0:
            return 0
        else:
            return sum(result) / len(result)

    # main function to assess the pattern
    def assessment_func(self):
        self.init_cost_duration_reliability(self.all_nodes)
        self.init_dataobject_volume(self.sp.findNodeByCategory('resourceObject'))
        self.init_dataobject_volume(self.sp.findNodeByCategory('dataObject'))
        self.init_dataobject_volume(self.sp.findNodeByCategory('currencyObject'))
        self.calculate_node2node_time_dict()

        duration = self.calculate_duration(self.startEvent, None)
        cost = self.calculate_cost(self.all_nodes)

        # # test 0 for log
        # if duration == 0:
        #     duration = 1e-3
        # if cost == 0:
        #     cost = 1e-3

        reliability = self.calculate_reliability(self.startEvent, None)
        data_efficiency = self.calculate_data_object('dataObject')
        resource_efficiency = self.calculate_data_object('resourceObject')
        currency_efficiency = self.calculate_data_object('currencyObject')
        value = self.calculate_value()

        efficiency_list = [data_efficiency, resource_efficiency, currency_efficiency]

        sigmoid = lambda x: 1.0 / (1.0 + np.exp(-x))
        sigmoid2 = lambda x: (3 + np.exp(-x)) / (1 + np.exp(-x))
        result = (np.log(duration) + np.log(cost)) / \
                 (self.node_num * reliability * sigmoid(value) * sigmoid(np.mean(efficiency_list)))
        return [float(result), duration, cost, reliability, data_efficiency, resource_efficiency, currency_efficiency,
                value]

    def assess(self, iter_num=100):
        for i in tqdm(range(iter_num)):
            metrics = self.assessment_func()
            for j in range(len(metrics)):
                self.display_dict[self.metric_name_list[j]].append(metrics[j])
        return True
