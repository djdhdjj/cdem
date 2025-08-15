class Calculate:
    def __init__(self, resData):
        self.data = resData
        # self.data["nodes"] = self.data["nodes"]
        # self.data["links"] = resData["links"]

    @property
    def LaneNumber(self):
        laneNum = 0
        for n in self.data["nodes"]:
            if n["category"] == "Lane":
                laneNum = laneNum + 1
        return laneNum

    @property
    def NodeNumber(self):
        total = len(self.data["nodes"])
        return total - self.LaneNumber - 1  # 返回除了lane和pool的个数

    def LaneCoordinate(self):
        lane = self.LaneNumber
        nodeNo = self.nodeCoordinate()
        LN = 0
        for k in nodeNo.keys():
            x = int(nodeNo[k])
            if x > LN:
                LN = x
        for n in self.data["nodes"]:
            if n["category"] == "Pool":
                n["loc"] = "0 0"
            if n["category"] == "Lane":
                x = str(40)
                y = str(0 + lane * 300)
                size = str(LN * 350) + " " + "300"
                n["loc"] = x + " " + y
                n["size"] = size  # lane的长宽先定死了
                lane = lane - 1

    # 计算每个泳道有几个节点
    def laneNode(self, key):
        num = 0
        for n in self.data["nodes"]:
            if n["category"] != "Pool" and n["group"] == key:
                num = num + 1
        return num

    def nodeCoordinate(self):
        dict = {}  # 存储每个泳道有多少节点
        for node in self.data["nodes"]:
            if node["category"] == "Lane":
                dict[node["key"]] = self.laneNode(node["key"])
        return dict

    def nodeSequence(self, fromNode):
        toNode = []
        for f in fromNode:
            for l in self.data["links"]:
                if l["from"] == f:
                    toNode.append(l["to"])
        return toNode

    # 计算节点相对顺序
    def nodeSeq(self):
        nodeSeq = []
        for n in self.data["nodes"]:
            if n["category"] == "start":
                nodeSeq.append(n["key"])
        for l in self.data["links"]:
            if l["from"] not in nodeSeq and l["to"] not in nodeSeq:
                nodeSeq.append(l["from"])
                nodeSeq.append(l["to"])
            elif l["from"] not in nodeSeq and l["to"] in nodeSeq:
                i = nodeSeq.index(l["to"])
                nodeSeq.insert(i, l["from"])
            elif l["from"] in nodeSeq and l["to"] not in nodeSeq:
                nodeSeq.append(l["to"])
        return nodeSeq

    def LaneY(self):
        LaneYDict = {}
        for n in self.data["nodes"]:
            if n["category"] == "Lane" and n["key"] not in LaneYDict:
                y = int(n["loc"].split()[1])
                LaneYDict[n["key"]] = y
        return LaneYDict

    # def findNode(self,key):
    #     for n in self.data["nodes"]:
    #         if n["key"] == key:
    #             return n

    def nodeLoc(self):
        self.LaneCoordinate()
        nodeList = self.nodeSeq()
        nodeLane1 = self.nodeCoordinate()
        print(nodeLane1)
        nodeLane2 = nodeLane1
        LaneY = self.LaneY()
        for k in nodeLane2.keys():
            nodeLane2[k] = 0
        print(type(nodeLane2))
        print(nodeLane2)

        for n in nodeList:
            for node in self.data["nodes"]:
                if node["key"] == n and node["group"] in nodeLane2.keys():
                    a = nodeLane2[node["group"]]
                    if node["category"] != "task":
                        x = 80 + a * 250
                    else:
                        x = 80 + a * 250

                    y = LaneY[node["group"]] - 150
                    nodeLane2[node["group"]] = nodeLane2[node["group"]] + 1
                    node["loc"] = str(x) + " " + str(y)

        return self.data
