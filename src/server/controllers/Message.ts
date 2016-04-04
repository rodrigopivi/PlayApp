import { logger } from '../config/logger'
import { thinky } from '../models'
// import { restrictWebsocketAccess } from '../lib/authorization'
const WebSocketServer = require('ws').Server

export class MessageController {
    private ws
    private app
    constructor(app) {
        this.app = app
        this.setupWebsocketServer()
    }
    public setupWebsocketServer(): void {
        this.ws = new WebSocketServer({
            server: this.app.server,
            autoAcceptConnections: false,
            path: '/messages',
            keepalive: true,
            keepaliveInterval: 2000,
            keepaliveGracePeriod: 2000
        })
        this.ws.on('connection', clientWS => {
            // console.log(clientWS.upgradeReq.headers)
            // TODO: add origin verification
            // var location = url.parse(clientWS.upgradeReq.url, true)
            // *** IMPORTANT NOTE ***
            // Consider using socket io and https://github.com/kirkness/react-native-swift-socketio
            // until React Native solves the issues with sending cookies on websocket handshake
            // TODO: enable websocket cookie validation when RN websocket fixes WS sending cookies
            // if (!restrictWebsocketAccess(clientWS.upgradeReq)) { return clientWS.close() }
        })
        this.ws.on('close', () => logger.info(`[Main IO] Disconnected from ${arguments}`))
        this.pushChangesToWebsocket()
    }
    public pushChangesToWebsocket(): void {
        try {
            thinky.r.table('Message').changes().map((message) => {
                return message.merge({
                    // IMPORTANT NOTE: this pluck values are hardcoded, and they should
                    // consider at least the graphql fragment for the real time messages component
                    author: thinky.r.table('User').get(message('new_val')('userId')).pluck('name', 'email', 'id')
                })
            }).run().then(changes => {
                changes.on('data', (newMessage) => {
                    this.ws.clients.forEach(client => client.send(JSON.stringify(newMessage)))
                })
            })
        } catch (err) {
            logger.info(`[Setup Main IO] Error: ${err}`)
        }
    }
}
