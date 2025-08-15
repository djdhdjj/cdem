import json
import time
import uuid
from queue import Queue

from django.http import HttpResponse


def toJson(_obj):
    return json.dumps(_obj, ensure_ascii=False, sort_keys=True, )


def jsonResponse(data):
    return HttpResponse(toJson(data), content_type="application/json")


count = 0


def genUniqueId():
    global count
    count += 1
    return str(time.time()) + '_' + str(count)


# 深度字典更新
def dict_update(n_d, o_d):
    for o_k, o_v in o_d.items():
        if o_k in n_d:
            n_v = n_d[o_k]
            if isinstance(n_v, dict) and isinstance(o_v, dict):
                dict_update(n_v, o_v)
            else:
                n_d[o_k] = o_v
        else:
            n_d[o_k] = o_v
    return n_d


print_infos = Queue(1000)


def frontEndPrint(s, _type='normal'):
    s = '{}\t{}'.format(time.strftime("%Y-%m-%d %H:%M:%S"), s)
    print(s)
    print_infos.put(s)


# frontEndPrint('hi')

def is_null_or_empty(string: str):
    return string is None or len(string) == 0


def is_null_or_whitespace(string: str):
    return is_null_or_empty(string) or string.isspace()


def get_uuid1():
    uid = str(uuid.uuid1())
    return ''.join(uid.split('-'))


def get_uuid4():
    uid = str(uuid.uuid4())
    return ''.join(uid.split('-'))


# 替换ServicePattern类中defaultdict的lambda默认返回函数，使其可被pickle序列化
def default_none():
    return None
