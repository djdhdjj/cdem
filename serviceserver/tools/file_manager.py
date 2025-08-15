import json
import os
import shutil
import traceback


class FileManager:  # 存路径
    def __init__(self):
        self._root = os.path.dirname(os.path.dirname(__file__))
        return

    @property
    def root_path(self):
        return self._root

    def listdir(self, path):
        self.makeDir(path)
        return os.listdir(path)

    def is_file_exist(self, path):
        return os.path.exists(path)

    @staticmethod
    def readJson(path):
        # print(path)
        f = open(path, 'r', encoding='utf-8')
        data = f.read()
        f.close()

        return json.loads(data)

    @staticmethod
    def save_json(json_data, path: str, pretty=True):
        """
        保存json字符串
        :param pretty: pretty输出
        :param json_data: json原始数据
        :param path: 保存json文件完整路径
        """
        _dir = os.path.dirname(path)
        file_manager.makeDir(_dir)
        with open(path, 'w', encoding='utf-8') as fp:
            json.dump(json_data, fp,
                      sort_keys=True,
                      indent=4 if pretty else None,
                      ensure_ascii=False)

    @staticmethod
    def readFile(path):
        with open(path, 'r', encoding='utf-8') as f:
            data = f.read()
        return data

    @staticmethod
    def makeDir(path):
        if os.path.exists(path):
            return
        try:
            os.makedirs(path)
        except Exception as err:
            traceback.print_exc()

    @staticmethod
    def cleanDir(path):
        if os.path.exists(path):
            shutil.rmtree(path, ignore_errors=True)  # 能删除该文件夹和文件夹下所有文件
        os.makedirs(path, exist_ok=True)

    @DeprecationWarning
    def openFile(self, _dir, file='', mode='r'):
        if mode == 'w':
            self.makeDir(_dir)
        return open(os.path.join(_dir, file), mode, encoding='utf-8')


file_manager = FileManager()
