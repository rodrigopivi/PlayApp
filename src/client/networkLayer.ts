import pushMessagesStore from './pushMessagesStore'
import * as Relay from 'react-relay'
const settings = require('../../config/settings')

class CustomNetworkLayer extends Relay.DefaultNetworkLayer {
    /* NOTE: IMPORTANT!!! This is a VERY hacky solution of intercepting graphql requests
     *       by creating an intermediate network layer and using a regular expression to
     *       pick which requests to intercept. This also uses a redux store as a temporal
     *       storage for real time messages until we force relay to re-fetch and then flush
     *       the redis store to keep relay as the only source of truth for server-side data.
     *       This should not be needed when Relay supports subscriptions.
     */
    public _sendQuery(request) {
        const currentQueryString = request.getQueryString()
        const queryRegexp = /^query [^\s]+{root{...F0}} fragment F0 on RootQuery{recentMessages{id,createdAt,userId,body,user{id,name,email}}}$/i
        if (queryRegexp.test(currentQueryString)) {
            return this.sendInterceptedRecentMessagesResponse(request)
        }
        return super._sendQuery(request)
    }

    private sendInterceptedRecentMessagesResponse(request) {
        return new Promise((resolve, reject) => {
            // Note: tried to use primeCache, works fine for the first req, but fails for the 2nd
            // (Relay.Store as any).primeCache({query: request._query}, readyState => {
            let data: any[] = []
            let cachedData = (Relay.Store as any).readQuery(request._query)
            if (cachedData && cachedData.length && cachedData[0] && cachedData[0].recentMessages) {
                const messagesToPush = pushMessagesStore.getState().messagesToPush
                data = data.concat(cachedData[0].recentMessages).concat(messagesToPush)
                pushMessagesStore.dispatch({ type: 'CLEAR_MESSAGES'})
                const response = { 'data': { 'root': { 'recentMessages': data } } }
                const jsonResponsePromise = new Promise((res) => {
                    res({ json: () => { return response } })
                })
                resolve(jsonResponsePromise)
            } else {
                resolve(super._sendQuery(request))
            }
        })
    }
}
const customNetworkLayer = new CustomNetworkLayer(
    `http://${settings.hostname}:${settings.mainEntryPort}/graphql`,
    { credentials: 'same-origin' }
)
export default customNetworkLayer
