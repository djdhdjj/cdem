import json
import os
from os.path import join

from django.core.cache import cache
from django.http import HttpRequest

from classes.fusion_service_pattern import FusionServicePattern
from classes.pattern_assessment import PatternAssessment
from classes.workspace import WorkSpace
from tools.common_function import jsonResponse, genUniqueId
from tools.file_manager import file_manager
from tools.owl_convert.rdf_converter import RDFConverter
from .model import FusionRequest


dataset_path = 'dataset'


def login(request):
    data = json.loads(request.body)
    username = data['username']
    password = data['password']

    ret = {'status': username == 'admin' and password == 'service123'}
    return jsonResponse(ret)


def get_workspace_list(request):
    workspace_names = file_manager.listdir(dataset_path)
    ret = [name for name in workspace_names if os.path.isdir(os.path.join('dataset', name))]
    return jsonResponse(ret)


def create_workspace(request):
    name = request.GET.get('workspace')
    workspace_path = os.path.join(dataset_path, name)
    if file_manager.is_file_exist(workspace_path):
        ret = {'status': 1, 'message': 'workspace {} exists!'.format(name)}
    else:
        file_manager.makeDir(workspace_path)
        workspace = WorkSpace(name=name)

        # 在概念库中加入默认的BPMN概念和基础领域术语库
        file_manager.makeDir(workspace.concept_path)

        bpmn_concept_path = os.path.join(workspace.concept_path, 'BPMN概念.json')
        basic_terms_path = os.path.join(workspace.concept_path, '基础领域术语库.json')

        bpmn_concept_data = file_manager.readJson(os.path.join(dataset_path, 'Template_BPMN概念.json'))
        basic_terms_data = file_manager.readJson(os.path.join(dataset_path, 'Template_基础领域术语库.json'))

        file_manager.save_json(bpmn_concept_data, bpmn_concept_path)
        file_manager.save_json(basic_terms_data, basic_terms_path)

        ret = {'status': 0, 'message': 'success!'}
    return jsonResponse(ret)


def delete_workspace(request):
    name = request.GET.get('workspace')
    workspace_path = os.path.join(dataset_path, name)
    if file_manager.is_file_exist(workspace_path):
        import shutil
        shutil.rmtree(workspace_path, ignore_errors=True)
        ret = {'status': 0, 'message': 'success!'}
    else:
        ret = {'status': 1, 'message': 'invalid workspace name!'}
    return jsonResponse(ret)


def read_workspace_json(request):
    name = request.GET.get('workspace')
    workspace_path = os.path.join(dataset_path, name)

    if file_manager.is_file_exist(workspace_path):
        workspace = WorkSpace(name=name)
        workspace.loadJsonFile()
        return jsonResponse(workspace.toJson())
    return jsonResponse({})


def save_workspace_json(request):
    workspace_data = json.loads(request.body)
    workspace = WorkSpace()

    workspace.loadByJsonData(workspace_data)
    workspace.save()

    # 保存评估结果
    file_manager.cleanDir(workspace.assess_result_path)
    assessed_results = workspace_data['assessedResults']
    for assessed_id, data in assessed_results.items():
        _save_assessment_results(assessed_id, data, workspace)

    return jsonResponse({'succeed': True})


def _save_fusion_graph(graph_data: dict, fusion_pattern_path):
    fusions_path = join(fusion_pattern_path, 'intermediate')
    file_manager.makeDir(fusions_path)
    file_manager.save_json(graph_data,
                           join(fusions_path, '{}.json'.format(graph_data['config']['name'])),
                           pretty=True)


def fusion_pattern(request: HttpRequest):
    if request.method == 'POST':
        request_dict = json.loads(request.body)
        fusion_request = FusionRequest(request_dict)

        # todo pool.map ??
        response_json = {
            fusion_request.fusion_name: {
                'intermediate': {},
                'final': {}
            }
        }
        kwargs = fusion_request.kwargs()
        if kwargs is None:
            return jsonResponse({'error: Invalid input'})

        request_args = fusion_request.request_args()

        cnt = 1
        for k in kwargs:
            fusion_graph = FusionServicePattern(**k)

            nodes_and_links = fusion_graph.merge()

            name = '{}_推荐_{}'.format(fusion_request.fusion_name, cnt)
            cnt += 1

            request_args['theta'] = k['theta']

            graph_json = {
                'config': {
                    'id': genUniqueId(),
                    'name': name
                },
                'evaluate_config': {},
                'nodes': nodes_and_links['nodes'],
                'links': nodes_and_links['links'],
                'resource_config': {},
                'fusion_args': request_args.copy()
            }

            _save_fusion_graph(graph_json,
                               join(fusion_request.workspace.fusion_pattern_path,
                                    fusion_request.fusion_name))
            response_json[fusion_request.fusion_name]['intermediate'][name] = graph_json
        return jsonResponse(response_json)


def add_fusion_final(request: HttpRequest):
    if request.method == 'POST':
        request_dict = json.loads(request.body)
        workspace_data = request_dict['workspace']
        final_key = str(request_dict['final_key'])

        workspace = WorkSpace()
        workspace.loadByJsonData(workspace_data)
        if final_key in workspace.fusion_patterns:
            workspace.fusion_patterns[final_key].final = True
            resp = {'message': 'success', 'error': ''}
        else:
            resp = {'message': 'failure',
                    'error': 'cannot find {}'.format(final_key)}
        workspace.save()
        return jsonResponse(resp)


def _one_pattern_assessment(lib, name, workspace):
    data = None
    if lib == 'pattern' and name in workspace.service_patterns:
        data = PatternAssessment(sp=workspace.service_patterns[name]).display_dict
    elif lib == 'fusion' and name in workspace.fusion_patterns:
        data = PatternAssessment(sp=workspace.fusion_patterns[name]).display_dict
    return {
        'lib': lib,
        'name': name,
        'data': data if data else 'cannot find pattern'
    }


def _save_assessment_results(assess_id, assessed_data, workspace):
    data = [{
        'data': item['data'],
        'lib': item['lib'],
        'name': item['name']
    } for item in assessed_data]
    data_path = os.path.join(workspace.assess_result_path, assess_id + '.json')
    file_manager.save_json(data, data_path)


def pattern_assessment(request: HttpRequest):
    if request.method == 'POST':
        request_dict = json.loads(request.body)
        workspace_data = request_dict['workspace']
        service_pattern: list = request_dict['patterns']

        workspace = WorkSpace()
        workspace.loadByJsonData(workspace_data)
        # workspace.save()

        data = map(lambda sp: _one_pattern_assessment(sp['lib'], sp['name'], workspace), service_pattern)
        list_data = list(data)
        for item in list_data:
            print(item)
        return jsonResponse({genUniqueId(): list_data})


def owl_convert(request: HttpRequest):
    if request.method == 'POST':
        rdf = request.body
        converter = RDFConverter()
        converter.parse_data(rdf)
        converter.convert()
        return jsonResponse(converter.json_raw_data())


def start_simulate(request):
    if request.method == 'POST':
        req_data = json.loads(request.body)
        work_space_name = req_data['work_space']
        sim_name = req_data['simulator']

        work_space = WorkSpace(work_space_name, {})
        work_space.loadJsonFile()

        simulator = work_space.simulators[sim_name]
        sim_model = simulator.initSimulateModel()
        max_step = int(simulator.config['maxStep'])

        pre_id = cache.get(sim_name)
        cache.set(sim_name, sim_model.sim_id)  # 设置当前simulator对应的sim_id

        if pre_id is not None:
            # 将前一次仿真停止
            status = cache.get(pre_id)
            status['is_running'] = False
            cache.set(pre_id, status)

            # 删除该simulator之前仿真的缓存
            cache.delete(pre_id)

        status = {
            'result_path': sim_model.result_path,
            'processArray': [0],  # Step 0时process数为0
            'quotaArray': [list(sim_model.quota.values())],
            'quotaToAdd': [],
            'is_running': True,
            'is_stop': False,
            'is_one_step': False
        }
        cache.set(sim_model.sim_id, status)
        print('Start ', sim_model.sim_id)

        sim_model.simulate(max_step)

        ret = {'sim_id': sim_model.sim_id}
        return jsonResponse(ret)


def suspend_simulate(request, sim_id):
    if request.method == 'GET':
        print('Suspend ', sim_id)

        status = cache.get(sim_id)
        ret = {}

        if status is None:
            ret['status'] = False
            ret['message'] = 'Failed! Nonexistent sim id!'
        else:
            status['is_running'] = False
            cache.set(sim_id, status)

            ret['status'] = True
            ret['message'] = 'Success!'

        return jsonResponse(ret)


def continue_simulate(request, sim_id):
    if request.method == 'GET':
        print('Continue ', sim_id)

        status = cache.get(sim_id)
        ret = {}

        if status is None:
            ret['status'] = False
            ret['message'] = 'Failed! Nonexistent sim id!'
        else:
            status['is_running'] = True
            cache.set(sim_id, status)

            ret['status'] = True
            ret['message'] = 'Success!'

        return jsonResponse(ret)


def stop_simulate(request, sim_id):
    if request.method == 'GET':
        print('Stop ', sim_id)

        status = cache.get(sim_id)
        ret = {}

        if status is None:
            ret['status'] = False
            ret['message'] = 'Failed! Nonexistent sim id!'
        else:
            status['is_stop'] = True
            cache.set(sim_id, status)

            ret['status'] = True
            ret['message'] = 'Success!'

        return jsonResponse(ret)


def simulate_step_over(request, sim_id):
    if request.method == 'GET':
        print('Step Over ', sim_id)

        status = cache.get(sim_id)
        ret = {}

        if status is None:
            ret['status'] = False
            ret['message'] = 'Failed! Nonexistent sim id!'
        elif status['is_running']:
            ret['status'] = False
            ret['message'] = 'Failed! Simulation is running!'
        else:
            status['is_one_step'] = True
            cache.set(sim_id, status)

            ret['status'] = True
            ret['message'] = 'Success!'

        return jsonResponse(ret)


def add_simulate_watcher(request, sim_id):
    if request.method == 'POST':
        print('Add Watcher ', sim_id)

        status = cache.get(sim_id)
        ret = {}

        if status is None:
            ret['status'] = False
            ret['message'] = 'Failed! Nonexistent sim id!'
        elif status['is_running']:
            ret['status'] = False
            ret['message'] = 'Failed! Simulation is running!'
        else:
            req_data = json.loads(request.body)
            status['quotaToAdd'].append(req_data)
            cache.set(sim_id, status)

            ret['status'] = True
            ret['message'] = 'Success!'

        return jsonResponse(ret)


def get_simulate_status(request, sim_id):
    if request.method == 'GET':
        print('Status ', sim_id)

        status = cache.get(sim_id)
        ret = {}

        if status is None:
            ret['completeStep'] = 0
            ret['status'] = 'failed'
            ret['processArray'] = []
        else:
            file_name = len(file_manager.listdir(status['result_path'])) - 1  # 取结果文件夹下最后一个文件
            data = file_manager.readJson(join(status['result_path'], str(file_name) + '.json'))

            if status['is_stop']:
                running_status = 'stop'
            elif status['is_running']:
                running_status = 'running'
            else:
                running_status = 'suspend'

            ret['completeStep'] = data['step_count']
            ret['status'] = running_status
            ret['processArray'] = status['processArray']

        return jsonResponse(ret)


def get_simulate_step(request, sim_id, step_number):
    if request.method == 'GET':
        print('Get Step ', step_number, ' ', sim_id)

        status = cache.get(sim_id)
        ret = {
            'step': step_number,
            'data': {}
        }

        if status is None:
            ret['status'] = False
            ret['message'] = 'Failed! Nonexistent sim id!'
            return jsonResponse(ret)

        finished_step = len(file_manager.listdir(status['result_path'])) - 1
        if step_number > finished_step:
            ret['status'] = False
            ret['message'] = 'Failed! Unreached step!'
            return jsonResponse(ret)
        else:
            data = file_manager.readJson(join(status['result_path'], str(step_number) + '.json'))

            ret['data']['quota'] = status['quotaArray']
            ret['data']['instance_base'] = data['instance_base']
            ret['data']['process'] = data['process']

            ret['status'] = True
            ret['message'] = 'Success!'

        return jsonResponse(ret)


def query_sim_id_by_name(request, simulator):
    if request.method == 'GET':
        ret = {}

        sim_id = cache.get(simulator)

        if sim_id is None:
            ret['status'] = 'none'
            ret['sim_id'] = ''
        else:
            status = cache.get(sim_id)

            if status['is_stop']:
                running_status = 'stop'
            elif status['is_running']:
                running_status = 'running'
            else:
                running_status = 'suspend'

            ret['status'] = running_status
            ret['sim_id'] = sim_id

        return jsonResponse(ret)


default_workspace_name = '阿里巴巴'
def loadWorkspace(request):
    workspace_name = request.GET.get('workspace')
    if workspace_name is None:
        workspace_name = default_workspace_name
    
    work_space = WorkSpace(workspace_name)
    work_space.loadJsonFile()
    return work_space


def getPatternList(request):
    work_space = loadWorkspace(request)
    service_patterns = [name for name in work_space.service_patterns]
    fusion_patterns = [name for name, pattern in work_space.fusion_patterns.items() if pattern.final]

    return jsonResponse(service_patterns + fusion_patterns)


def getPatternData(request):
    pattern_name = request.GET.get('pattern')
    work_space = loadWorkspace(request)

    pattern = None
    if pattern_name in work_space.service_patterns:
        pattern = work_space.service_patterns[pattern_name]
    if pattern_name in work_space.fusion_patterns: 
        pattern = work_space.fusion_patterns[pattern_name]
        # print(pattern)

    if pattern is None:
        return jsonResponse({'msg': 'pattern does not exist'})

    return jsonResponse(pattern.toJson())
