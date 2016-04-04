import * as React from 'react-native'
import * as Relay from 'react-relay'
import { CreateMessageMutation } from '../../client/mutations/createMessage'
const { Component, View, Text, StyleSheet, TextInput, ScrollView } = React
const Button = require('apsl-react-native-button')
const settings = require('../../../config/settings')

// TODO: Refactor this metods to avoid code duplication with the web version of this component
export default class ChatMessagesRender extends Component<any, any> {
    private websocket
    private pushMessagesToRelayStore

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
    public componentWillUnmount(): void { this.websocket.close() }

    public render() {
        let recentMessages = this.props.root.recentMessages
        return (
            <View style={styles.container}>
                <ScrollView style={styles.body}>
                    {recentMessages.map(message => (
                        <View key={message.id}>
                            <Text style={{fontWeight: 'bold'}}>{message.user.name}: </Text>
                            <Text>{message.body}</Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <TextInput
                            style={styles.input}
                            placeholder={'What\'s up!'}
                            placeholderTextColor='#BBB'
                            value={this.state.message}
                            onChangeText={(message) => this.setState({message})}
                        />
                        <Button
                            style={styles.btnStyle} textStyle={styles.btnTextStyle}
                            isDisabled={!this.state.wsAlive}
                            onPress={this.sendMessage.bind(this)} >
                            SEND
                        </Button>
                    </View>
                </View>
            </View>
        )
    }

    private sendMessage() {
        if (this.state.message) {
            Relay.Store.commitUpdate(new CreateMessageMutation({body: this.state.message}))
            this.setState({message: ''})
        }
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
            // Retry only if the disconnect event was not clean
            setTimeout(() => this.setupWebsocketConnection(), 3000)
            this.setState({wsAlive: false})
        }
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'column' },
    body: {
        paddingTop: 65,
        flex: .9,
        backgroundColor: '#CFD8DC'
    },
    footer: {
        height: 65,
        justifyContent: 'center',
        backgroundColor: '#ebeef0',
        paddingTop: 3,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    footerContent: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
    },
    input: {
        flex: .7,
        height: 40,
        fontSize: 14,
        color: '#444',
        borderRadius: 3,
        backgroundColor: '#DDD',
        padding: 5,
        marginRight: 10
    },
    btnStyle: {
        flex: .3,
        height: 40,
        borderColor: '#4CAF50',
        borderRadius: 3,
        backgroundColor: '#00C853'
    },
    btnTextStyle: { color: '#fff', fontWeight: 'bold', fontSize: 14}
})
