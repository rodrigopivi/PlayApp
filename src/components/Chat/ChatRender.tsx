import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Card, CardActions, RaisedButton } from 'material-ui'
import {Chat} from './index'
const Helmet = require('react-helmet')
const TextField = require('material-ui/lib/text-field')

export default class ChatRender extends Chat {

    public componentDidMount(): void {
        if (typeof window !== 'undefined') { this.scrollMessagesListToBottom() }
        super.componentDidMount();
    }

    public componentDidUpdate(): void { this.scrollMessagesListToBottom() }

    public render() {
        let recentMessages = this.props.root.recentMessages
        return (
            <div>
                <Helmet title='Chat' />
                <Card style={{ maxWidth: 400, margin: '30px auto' }}>
                    <div style={{ height: 300, overflowY: 'scroll', padding: '0 10px'}} ref='messagesList'>
                    {recentMessages.map(message => (
                        <p key={message.id}>
                            <span style={{fontWeight: 'bold'}}>{message.user.name}: </span>
                            <span>{message.body}</span>
                        </p>
                    ))}
                    </div>
                    <CardActions style={{ textAlign: 'center' }}>
                        <TextField
                            floatingLabelText={'What\'s up!'}
                            multiLine={false}
                            fullWidth={true}
                            value={this.state.message}
                            onChange={ (evt: any) => this.setState({message: evt.target.value}) }
                        />
                        <RaisedButton
                            primary={true}
                            label='SEND'
                            disabled={!this.state.wsAlive}
                            onMouseUp={ this.sendMessage.bind(this) }/>
                    </CardActions>
                </Card>
            </div>
        )
    }

    private scrollMessagesListToBottom() {
        const chatScrollerDomNode = ReactDOM.findDOMNode((this.refs as any).messagesList)
        chatScrollerDomNode.scrollTop = chatScrollerDomNode.scrollHeight
    }

}
