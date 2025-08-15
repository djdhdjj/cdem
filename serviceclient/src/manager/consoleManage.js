import {arrayRemove} from "./commonFunction";

const MessageType = {
    success : {
        type: "success",
        text: '成功',
        color: 'olive'
    },
    warning : {
        type: "warning",
        text: '警告',
        color: 'yellow'
    },
    error : {
        type: "error",
        text: '错误',
        color: 'red'
    },
    normal: {
        type: "normal",
        text: '普通',
        color: 'teal'
    }
}
class ConsoleMessage {
    type = undefined;
    title = undefined;
    text = undefined;
    constructor(type, title, text) {
        this.type = type;
        this.title = title;
        this.text = text;
    }
}
class ConsoleManage {
    messageList = []

    addMessage(message) {
        this.messageList.push(message)
    }

    removeMessage(message) {
        arrayRemove(this.messageList, message)
    }
}



let error_text = "error 寄件{\"config\": {}, \"graph_data\": {}, \"id\": \"寄件\", \"name\": \"寄件\", \"props\": {}, \"type\": [\"物流概念/货物\"]} 寄件 重名"
let normal_text = "[07/Jul/2020 22:26:59] \"GET \/readWorkspace?workspace=\%E9\%A3\%9E\%E7\%8C\%AA HTTP\/1.1\" 200 9569"
const consoleManage = new ConsoleManage();

let valid_error_text = "概念库 '保险概念/资金' 和 '物流概念' 冲突"
consoleManage.addMessage(new ConsoleMessage(MessageType.error, "Error", valid_error_text))


consoleManage.addMessage(new ConsoleMessage(MessageType.success, "success", "保存成功"))
// consoleManage.addMessage(new ConsoleMessage(MessageType.warning, "warning", "test warning"))
consoleManage.addMessage(new ConsoleMessage(MessageType.error, "Error", error_text))
for (let index = 0; index < 10; index++) {
    consoleManage.addMessage(new ConsoleMessage(MessageType.normal, "", normal_text))
}
consoleManage.addMessage(new ConsoleMessage(MessageType.error, "Error", error_text))

export {
    MessageType,
    ConsoleMessage,
    consoleManage
}
