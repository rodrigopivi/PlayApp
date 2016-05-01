import * as React from 'react'
import * as Relay from 'react-relay'
import AppRender from './AppRender'
import customNetworkLayer from '../../client/networkLayer'

Relay.injectNetworkLayer(customNetworkLayer)

export default class App extends React.Component<any, any> {
    public render() {
        return(<AppRender />)
    }
}
