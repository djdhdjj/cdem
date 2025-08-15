import os
import random
import threading
import time
import traceback
from collections import defaultdict

from django.core.cache import cache
from mesa import Agent, Model
from mesa.time import RandomActivation

from classes.instance_base import InstanceBase
from classes.nameConfig import name_config
from classes.selector import Selector
from classes.service_pattern import ServicePattern, PatternObject
from tools.common_function import genUniqueId, dict_update
from tools.file_manager import file_manager


# 每个BPMN对应一个story
#   timeCycle:指定定时器的运行周期
#   timeDuration:指定一个时间段之后执行
#   timeDate:指定时间触发

class Simulator:
    def __init__(self, name, workspace):
        self.workspace = workspace

        self.instance_base = InstanceBase(workspace, {})
        self.instance_base.simulator = self

        # self.pattern_instance_base = InstanceBase(workspace, {})
        # self.pattern_instance_base.simulator = self

        self.service_pattern = ServicePattern('', self.workspace)
        self.service_pattern.simulator = self

        self.binding_relations = {}

        self.name = name
        self.config = {}

        self.simulate_model = None
        return

    # 初始化仿真
    def initSimulateModel(self, data=None):
        simulate_model = SimulateModel(self)

        if data is not None:
            simulate_model.loadJson(data)
        else:
            simulate_model.init()

        self.simulate_model = simulate_model
        return simulate_model

    @property
    def json_path(self):
        return os.path.join(self.workspace.simulator_path, self.name) + '.json'

    def loadJson(self, data):
        self.config = data['config']
        self.instance_base.loadJson(data['instance_base'])
        service_pattern = self.service_pattern

        self.binding_relations = data['node2binding_relations']
        self.service_pattern.loadJson(data['service pattern'])

        for d in data['pattern_instance_base']['instances']:

            # todo: 展示用于解决lane没有name的问题
            # todo: start_event怎么还能没有category，绝了
            if 'category' in d and d['category'] == 'Lane':
                #  and 'name' not in d
                d['name'] = d['type']

            if 'name' not in d:
                print('Warning: In ', self.name, ': ', d, '没有对应的name')
                continue

            node = service_pattern.findByName(d['name'])

            try:
                if node is not None:
                    node.loadJson(d)
                elif d['name'] == name_config.Lane:
                    dict_update(service_pattern.data, d)
                else:
                    print('Warning: In ', self.name, ': ', d['name'], '没有对应的node')
            except:
                print('dname:')
                print(d['name'], node)
                print(self.name)


        # 找到模式实例到仿真实例的对应关系
        # 绑定模式的实例到场景实例（以后第二步就叫场景实例吧）
        for i_name, pi_names in self.binding_relations.items():
            for pi_name in pi_names:
                pi = service_pattern.findByName(pi_name)
                pi.sim_instance_classes.add(self.instance_base.findByName(i_name))

        return

    def loadJsonFile(self):
        data = file_manager.readJson(self.json_path)
        self.loadJson(data)
        return

    def save(self):
        file_manager.save_json(self.toJson(), os.path.join(self.workspace.simulator_path, self.name + '.json'))

    def toJson(self):
        return {
            'config': self.config,
            'instance_base': self.instance_base.toJson(),
            # 'pattern_instance_base': self.pattern_instance_base.toJson(),
            'pattern_instance_base': self.service_pattern.super2Json(),
            'node2binding_relations': self.binding_relations,
            'service pattern': self.service_pattern.toJson(),
            'name': self.name,
        }


class SimulateModel(Model):
    def __init__(self, simulator, config=None):
        super().__init__()

        if config is None:
            config = {}
        self.workspace = simulator.workspace
        self.config = config

        self.instance_base = InstanceBase(self.workspace)

        self.simulator = simulator
        self.service_pattern = simulator.service_pattern

        self.step_count = 0

        self.schedule = RandomActivation(self)

        self.process = Selector()

        self.quota = {}

        self.sim_id = self.simulator.name + '_' + genUniqueId()

        return

    @property
    def result_path(self):
        return os.path.join(self.simulator.workspace.sim_result_path, self.simulator.name, self.sim_id)

    def toJson(self):
        return {
            'config': self.config,
            'process': self.process.toJson(),
            'step_count': self.step_count,
            'instance_base': self.instance_base.toJson(),
            'quota': self.quota
        }

    def loadJson(self, data):
        self.config = data['config']
        self.step_count = data['step_count']
        self.instance_base.loadJson(data['instance_base'])
        self.quota = data['quota']

        for p_data in data['process']:
            new_process = BPMNProcess(self, {})
            new_process.loadJson(p_data)
            self.process.add(new_process)

        self.instance_base.checkValid()
        print('加载agent')
        for ag in self.instance_base.instances:
            self.schedule.add(ag)

        print('模型加载JSON完成')

    def init(self):
        instance_base = self.instance_base
        simulator_instance_base = self.simulator.instance_base

        for i in simulator_instance_base.instances:
            new_i = instance_base.createInstance()
            new_i.loadJson(i.data)
            i._init_instances.add(new_i)

        # todo: 之后封装到group里面
        def dfs_create(groups, num):
            for g in groups:
                cur_num = num * g.num
                for cnt in range(cur_num):
                    for i in g.instances:
                        new_i = instance_base.createInstance()
                        new_i.loadJson(i.data)
                        i._init_instances.add(new_i)
                        new_i.name = i.name + '@' + str(cnt)

                dfs_create(g.groups, cur_num)

        sim_groups = simulator_instance_base.groups
        dfs_create(sim_groups, 1)

        for r in simulator_instance_base.obj_properties:
            source = r.source
            target = r.target

            s_g = source.group
            t_g = target.group

            r_d = r.toJson()
            if s_g is None and t_g is None:
                new_r = instance_base.createRelation(r_d)
            elif s_g is None and t_g is not None:
                r_d['source'] = source.name
                for index, sub_i in enumerate(target._init_instances):
                    r_d['target'] = sub_i.name
                    new_r = instance_base.createRelation(r_d)
                    new_r.name = r.name + '@' + str(index)
            elif s_g is not None and t_g is None:
                r_d['target'] = target.name
                for index, sub_i in enumerate(source._init_instances):
                    r_d['source'] = sub_i.name
                    new_r = instance_base.createRelation(r_d)
                    new_r.name = r.name + '@' + str(index)
            # todo: 没有考虑group嵌套的
            elif s_g is not None and t_g is not None:
                if s_g == t_g:
                    num = s_g.num
                    for i in range(num):
                        i = str(i)
                        r_d['source'] = source.name + '@' + i
                        r_d['target'] = target.name + '@' + i
                        r_d['name'] = r.name + '@' + i
                        new_r = instance_base.createRelation(r_d)
                else:
                    print('error: ', r, '不符合规范,在两个不嵌套的group中')

        self.instance_base.checkValid()

        print('加载agent')
        for ag in self.instance_base.instances:
            self.schedule.add(ag)

        # 初始化quota
        quota_instances = self.instance_base.instances.findAll(lambda elm: name_config.Quota in elm.type)
        for q_i in quota_instances:
            try:
                self.quota[q_i.name] = {
                    'name': q_i.name,
                    'text': q_i.props[name_config.QuotaDscp]['text'],
                    'type': q_i.props[name_config.QuotaDscp]['type'],
                    'val': q_i.quota_dscp
                }
            except:
                print('Init Quota')
                print(q_i.name)
                traceback.print_exc()

        # 绑定model
        print('模型init完成')

    def step(self):
        self.step_count += 1

        service_pattern = self.service_pattern

        for se in service_pattern.start_events:
            ps = se.deployed_participant_instances
            pc = se.participant_class
            for p in ps:
                if se.needStart(p, self):
                    role = se.assignRole(p, pc.name)
                    self.startAProcess(role)

        self.schedule.step()

        process = list(self.process)
        random.shuffle(process)
        for p in process:
            p.step()

        # 更新quota值
        quota_instances = self.instance_base.instances.findAll(lambda elm: name_config.Quota in elm.type)

        for q_i in quota_instances:
            self.quota[q_i.name]['val'] = q_i.quota_dscp

        return

    def startAProcess(self, role):
        new_process = BPMNProcess(self, role)  # rec
        self.process.add(new_process)
        return

    def add_quota(self, quota_data):
        n_i = self.instance_base.createInstance()
        data = {
            "config": {},
            "data_properties": {
                name_config.QuotaDscp: {
                    "text": quota_data['code'],
                    "type": quota_data['type']
                }
            },
            "name": quota_data['quotaName'],
            "type": [
                name_config.Quota
            ]
        }
        n_i.loadJson(data)

        self.quota[n_i.name] = {
            'name': n_i.name,
            'text': quota_data['code'],
            'type': quota_data['type'],
            'val': n_i.quota_dscp
        }

    def simulate(self, max_step):
        def run():
            for i in range(max_step):
                status = cache.get(self.sim_id)

                while not status['is_running']:
                    # 结束检查
                    if status['is_stop']:
                        break

                    # quota添加检查
                    if len(status['quotaToAdd']) > 0:
                        for n_q in status['quotaToAdd']:
                            self.add_quota(n_q)

                        status['quotaToAdd'].clear()

                        # 更新当前step的quotaArray
                        if len(status['quotaArray']) > 0:
                            status['quotaArray'][-1] = list(self.quota.values())

                        cache.set(self.sim_id, status)
                        self.save()  # 重新保存快照

                    # 单步执行检查
                    if status['is_one_step']:
                        print('One Step')
                        status['is_one_step'] = False
                        cache.set(self.sim_id, status)
                        break

                    print('Suspend Simulation')
                    time.sleep(1)
                    status = cache.get(self.sim_id)

                if status['is_stop']:
                    print('Stop Simulation')
                    break

                print('Step: ', i)
                self.step()
                self.save()

                # 执行一步后写入process数组和quota数组
                status = cache.get(self.sim_id)
                status['processArray'].append(len(self.process))
                status['quotaArray'].append(list(self.quota.values()))
                cache.set(self.sim_id, status)

                # time.sleep(1)

            # 设置状态为结束
            status = cache.get(self.sim_id)
            status['is_stop'] = True
            cache.set(self.sim_id, status)
            print('Simulation Finished')

        self.save()  # 刚构建好的模型也要保存一次
        threading.Thread(target=run).start()
        return

    def save(self):
        file_manager.save_json(self.toJson(), os.path.join(self.result_path, str(self.step_count) + '.json'))


class ProcessToken:
    def __init__(self, process, node):
        self.id = genUniqueId()
        self.data = {}
        self.process = process
        self.BPMN_node = node
        self.now_duration = 1
        self.node_duration = self.BPMN_node.duration if self.BPMN_node.duration is not None else 1

        self.is_fail = False
        self.has_gen_next = False  # 已经到下一步了

        self.is_executed = False
        return

    def toJson(self):
        return {
            'id': self.id,
            'data': self.data,
            'BPMN_node': self.BPMN_node.name,
            'now_duration': self.now_duration,
            'is_fail': self.is_fail,
            'has_gen_next': self.has_gen_next,
            'is_executed': self.is_executed,
        }

    def loadJson(self, data):
        self.id = data['id']
        self.data = data['data']
        self.now_duration = data['now_duration']
        self.is_fail = data['is_fail']
        self.has_gen_next = data['has_gen_next']
        self.is_executed = data['is_executed']

        self.BPMN_node = self.process.service_pattern.findByName(data['BPMN_node'])

    def clone(self, node):
        new_token = ProcessToken(self.process, node)
        new_token.data = self.data
        return new_token

    # @property
    # def is_merge(self):
    #     return True

    @property
    def is_finish(self):
        if self.now_duration == 1 and self.node_duration == 0:
            return False
        return self.is_fail or self.now_duration > self.node_duration

    def __str__(self):
        return 'Token:[{}@{}@{}@{}]'.format(self.BPMN_node, self.is_finish, self.now_duration, self.node_duration)

    def step(self):
        if self.is_finish:
            return

        BPMN_node = self.BPMN_node

        if not self.is_executed:
            try:
                print(BPMN_node.name, ' now: ', self.now_duration, ' duration: ', self.node_duration)

                # 最后一个duration运行代码
                if self.now_duration == self.node_duration:
                    print('--- before exec ---')
                    process = self.process
                    BPMN_node.execution({
                        'model': process.simulate_model,
                        'process': process,
                        'role': process.role,
                        'token': self,
                        'exec_duration': self.now_duration,
                    })
                    print('--- after exec ---')

                self.now_duration += 1
            except:
                print('Exception')
                print(BPMN_node)
                traceback.print_exc()
                self.is_fail = True

            if self.is_finish:
                self.selfDelete()

            if self.node_duration == 0:
                nexts = self.nexts()
                print('nexts: ', nexts)
                self.process.tokens += nexts
                nexts.all(lambda n: n.step())
                self.is_executed = True
        return

    def selfDelete(self):
        return

    def nexts(self):
        if self.has_gen_next:
            return Selector()

        if not self.is_finish:
            return Selector([self])

        self.has_gen_next = True
        return self.BPMN_node.getProcessNexts(self.process, self).map(lambda elm: self.clone(elm))


class BPMNProcess(Agent):
    def __init__(self, simulate_model, role):
        super().__init__(genUniqueId(), None)

        _role = defaultdict(lambda **arg: None)
        for r, p in role.items():
            _role[r] = p

        self.role = _role
        self.simulate_model = simulate_model
        self.service_pattern = simulate_model.service_pattern  # .clone()

        # 创建时为Pattern中所有start event创建token
        self.tokens = self.service_pattern.start_events.map(lambda elm: ProcessToken(self, elm))

        return

    def lock(self, rec):
        return rec.lock(self)

    def unlock(self, rec):
        return rec.unlock(self)

    def step(self):
        print()
        print('-------------------')
        print('In Process: ', self)
        if len(self.tokens) == 0:
            self.selfDelete()
            return

        print('Now Tokens')
        for t in self.tokens:
            print(t)
        print()

        for token in self.tokens:
            token.step()

        if self.tokens.find(lambda elm: name_config.EndEvent in elm.BPMN_node.type) is not None:
            self.selfDelete()

        self.loadNextPointers()
        print('-------------------')
        return

    def selfDelete(self):
        self.simulate_model.process.remove(self)
        print(self, 'end')
        return

    def loadNextPointers(self):
        next_tokens = Selector()
        for token in self.tokens:
            next_tokens += token.nexts()

        # todo: 还有一个merge的操作
        self.tokens = next_tokens

        print()
        print('Next Tokens')
        for t in self.tokens:
            print(t)

        return self.tokens

    def toJson(self):
        return {
            'tokens': self.tokens.toJson(),
            'role': {
                r: p.name
                for r, p in self.role.items()
            }
        }

    def loadJson(self, data):
        _role = defaultdict(lambda **arg: None)
        for r_name, p_name in data['role'].items():
            _role[r_name] = self.simulate_model.instance_base.findByName(p_name)
        self.role = _role

        self.tokens = Selector()
        for t_data in data['tokens']:
            new_token = ProcessToken(self, None)
            new_token.loadJson(t_data)
            self.tokens.add(new_token)
