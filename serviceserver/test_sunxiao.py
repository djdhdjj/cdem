from classes.workspace import WorkSpace
from classes.simulator import Simulator
from classes.nameConfig import name_config
import time

work_space = WorkSpace('阿里巴巴', {})
work_space.loadJsonFile()

simulator = work_space.simulators['村淘下行仿真']

sim_model = simulator.initSimulateModel()

max_step = int(simulator.config['maxStep'])

# sim_model.save()
for i in range(max_step):
    print('Step ', i)
    sim_model.step()
    # sim_model.save()
    print()
    # time.sleep(3) 
    
