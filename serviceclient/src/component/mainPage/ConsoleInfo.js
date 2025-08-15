import React from "react";
import { Button, Item, Input, Card, Message } from "semantic-ui-react";
import { Modal } from "semantic-ui-react/dist/commonjs/modules/Modal";
import { consoleManage } from "../../manager/consoleManage";

export default class ConsoleInfo extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }
    // <Card.Group itemsPerRow={1} style={{width: 500}}>
    render() {
        const { messageList } = consoleManage
        return <div>
        {
            messageList.map((message,key) =>
                // <Card color={message.type.color}>
                //     <Card.Header as='h4'>
                //         {message.title}
                //     </Card.Header>
                //     <Card.Description>
                //         {message.text}
                //     </Card.Description>
                // </Card>
                <Message color={message.type.color} key={key}>
                    <Message.Header>{message.title}</Message.Header>
                    <Message.Content>{message.text}</Message.Content>
                </Message>
            )
        }
        </div>

        // </Card.Group>
    }
}
