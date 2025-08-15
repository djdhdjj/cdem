from classes.workspace import WorkSpace
from classes.simulator import Simulator
from classes.selector import Selector
import random

work_space = WorkSpace('飞猪', {})
work_space.loadJsonFile()

# work_space.name = 'new'
# work_space.save()

t_simulator = work_space.simulators['单物2仿真']
# print(t_simulator.instance_base.instances, t_simulator.instance_base.groups)
simulate_model = t_simulator.initSimulateModel()
t_service_pattern = t_simulator.service_pattern

# print(123, t_service_pattern.start_event)
# print(446, t_service_pattern.findNodeByCategory('Lane').map(lambda elm: elm.participant))
sim_instance_base = t_simulator.instance_base
senders = t_simulator.instance_base.findByName('发1')._init_instances
receivers = t_simulator.instance_base.findByName('收1')._init_instances
# print([ for i in t_simulator.instance_base.instance])
# print(simulate_model.instance_base, senders)
# print(senders[0].own_resource, senders[0].all_relations)

# print(receivers)
# senders[0].own_resource[0].giveTo(receivers[0])
# print(receivers[0].own_resource, senders[0].own_resource)

# print(123, t_service_pattern.participant_classes)


role = {
    '物流概念/发货人': random.choice(senders),
    '物流概念/收货人': random.choice(receivers),
}
simulate_model.startAProcess(role)
# print(simulate_model.toJson())

# print(simulate_model.toJson())
# print(simulate_model.toJson())
for i in range(10):
    print(i)
    simulate_model.step()
    # simulate_model
    # print(simulate_model.toJson())


# instance_base = work_space.simulators['test'].instance_base
# for i in instance_base.instances:
#     print(i.all_relations)
# t_node = list(instance_base.instances)[0]

# new_i = instance_base.createInstance()
# new_i.data['type'] = ["物流概念/currencyObject"]
# print(new_i.belongTo("Thing"))


# pattern_nodes = work_space.simulators['test'].pattern_instance_base.instances
# print([str(i) for i in pattern_nodes])

# task_node = list(pattern_nodes)[0]
# print(task_node.belongTo("物流概念/currencyObject"))

# print(work_space.service_patterns['test1'].toJson())
# print(work_space.findByName('默认概念库/Resource').father_classes)
