import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as Relay from 'react-relay'
import { Card, CardActions, RaisedButton } from 'material-ui'
import { CreateMessageMutation } from '../../client/mutations/createMessage'
const Helmet = require('react-helmet')
const settings = require('../../../config/settings')
const TextField = require('material-ui/lib/text-field')

export default class ChatMessagesRender extends React.Component<any, any> {
    private websocket
    private pushMessagesToRelayStore
    constructor(props, context) {
        super(props, context)
        this.state = { message: '', wsAlive: false }
    }

    public componentDidMount(): void {
        if (typeof window !== 'undefined') {
            this.pushMessagesToRelayStore = require('../../client/pushMessagesStore').default
            this.scrollMessagesListToBottom()
            this.setupWebsocketConnection()
        }
    }
    public componentWillUnmount(): void { this.websocket.close() }
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

    private sendMessage() {
        if (this.state.message) {
            Relay.Store.commitUpdate(new CreateMessageMutation({body: this.state.message}))
            this.setState({message: ''})
        }
    }

    private scrollMessagesListToBottom() {
        const chatScrollerDomNode = ReactDOM.findDOMNode((this.refs as any).messagesList)
        chatScrollerDomNode.scrollTop = chatScrollerDomNode.scrollHeight
    }

    private setupWebsocketConnection() {
        console.log('[WS] Connecting...')
        this.websocket = new WebSocket(`ws://${settings.hostname}:${settings.serverPort}/messages`)
        this.websocket.onopen = () => {
            this.setState({wsAlive: true})
            this.websocket.onmessage = evt => {
                const payload = JSON.parse(evt.data)
                    let newMessage = Object.assign({}, payload.new_val, { user: payload.author });
                    this.pushMessagesToRelayStore.dispatch({ type: 'ADD_MESSAGE', newMessage })
                    this.props.relay.forceFetch()
            }
        }
        this.websocket.onerror = evt => { console.log('[WS ERROR]', evt.message) }
        this.websocket.onclose = (evt) => {
            setTimeout(() => this.setupWebsocketConnection(), 3000)
            this.setState({wsAlive: false})
        }
    }

}
