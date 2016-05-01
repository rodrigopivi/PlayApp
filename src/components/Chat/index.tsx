import * as React from 'react'
import * as Relay from 'react-relay'
import { CreateMessageMutation } from '../../client/mutations/createMessage'
const settings = require('../../../config/settings')

// The web and native renderers will extend this class, so methods shared by both should be here.
export class Chat extends React.Component<any, any> {
    protected websocket
    protected pushMessagesToRelayStore

    constructor(props, context) {
        super(props, context)
        this.state = { message: '', wsAlive: false }
    }

    public componentDidMount(): void {
        if (typeof window !== 'undefined') {
            this.pushMessagesToRelayStore = require('../../client/pushMessagesStore').default
            this.setupWebsocketConnection()
        }
    }
    public componentWillUnmount(): void {
        this.websocket.onclose = undefined
        this.websocket.close()
        this.setState({wsAlive: false})
    }

    protected sendMessage() {
        if (this.state.message) {
            Relay.Store.commitUpdate(new CreateMessageMutation({body: this.state.message}))
            this.setState({message: ''})
        }
    }

    protected setupWebsocketConnection() {
        console.log('[WS] Connecting...')
        this.websocket = new WebSocket(`ws://${settings.hostname}:${settings.serverPort}/messages`)
        this.websocket.onopen = () => {
            this.setState({wsAlive: true})
            this.websocket.onmessage = evt => {
                const payload = JSON.parse(evt.data)
                    let newMessage = Object.assign({}, payload.new_val, { user: payload.author })
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

export default Relay.createContainer(require('./ChatRender').default, {
    fragments: {
        root: (): any => Relay.QL`
        fragment on RootQuery {
            recentMessages {
                id
                createdAt
                userId
                body
                user {
                    id
                    name
                    email
                }
            }
        }
        `,
    }
})
