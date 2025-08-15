"""servicesysserver URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from servicesysserver import view

simulate_patterns = [
    path('start-simulate', view.start_simulate),
    path('<sim_id>/suspend-simulate', view.suspend_simulate),
    path('<sim_id>/continue-simulate', view.continue_simulate),
    path('<sim_id>/stop-simulate', view.stop_simulate),
    path('<sim_id>/step-over', view.simulate_step_over),
    path('<sim_id>/watcher/add', view.add_simulate_watcher),
    path('<sim_id>/status', view.get_simulate_status),
    path('<sim_id>/step/<int:step_number>', view.get_simulate_step),
    path('query-by-name/<simulator>', view.query_sim_id_by_name)
]

api = [
    path('simulate/', include(simulate_patterns))
]

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('login', view.login),

    path('getWorkspaceList', view.get_workspace_list),
    path('createWorkspace', view.create_workspace),
    path('deleteWorkspace', view.delete_workspace),
    path('readWorkspace', view.read_workspace_json),  # 读一整个工作区
    path('saveWorkspace', view.save_workspace_json),

    path('fusion', view.fusion_pattern),
    path('fusion/final', view.add_fusion_final),
    path('assessment', view.pattern_assessment),
    path('owl', view.owl_convert),
    path('api/', include(api)),

    # 与课题二对接
    path('patternList', view.getPatternList),
    path('patternData', view.getPatternData),
]
