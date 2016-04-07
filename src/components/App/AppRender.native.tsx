import * as React from 'react-native'
const { Component, Image, Text, StyleSheet } = React
import MainLayout from '../MainLayout'
import * as StateActions from '../../native/actions'
const bindActionCreators = require('redux').bindActionCreators
const connect = require('react-redux').connect
const settings = require('../../../config/settings')

@connect(
    (state) => ({ mainTransitionActive: state.mainTransitionActive }),
    (dispatch) => ({actions: bindActionCreators(StateActions, dispatch)})
)
class AppContainer extends Component<any, any> {
    constructor(props, context) {
        super(props, context)
        this.checkCredentials()
    }
    public render() {
        // TODO: Use a custom component for loading
        if (this.props.mainTransitionActive) { return (
            <Image style={styles.transitionLoader} source={require('../../../public/nativeBG.jpg')} >
                <Text style={{backgroundColor: 'transparent', color: '#fff'}}>Loading...</Text>
            </Image>
        )}
        return <MainLayout />
    }

    private async checkCredentials() {
        this.props.actions.startMainTransition()
        try {
            const response = await fetch(`http://${settings.hostname}:${settings.serverPort}/ping`, {
                method: 'GET', credentials: 'same-origin', headers: { 'Accept': 'application/json' }
            })
            if (response.status !== 200) { throw new Error('Not authenticated') }
            const jsonData = await response.json()
            if (!jsonData || jsonData.status !== 'OK')  { throw new Error('Not authenticated') }
            this.props.actions.setAsAuthenticated()
        } catch (e) {
            this.props.actions.setAsNotAuthenticated()
            if (e && e.message === 'Network request failed') { this.props.actions.setAsOffline() }
        }
        this.props.actions.finishMainTransition()
    }
}

const {Provider} = require('react-redux')
import reducer from '../../native/reducer'
const { createStore, applyMiddleware } = require('redux')
const thunk = require('redux-thunk').default
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore)
const store = createStoreWithMiddleware(reducer)

export default class App extends React.Component<any, any> {
    constructor(props, context) { super(props, context) }
    public render() {
        return(
            <Provider store={store}>
                <AppContainer />
            </Provider>
        )
    }
}
const styles = StyleSheet.create({
    transitionLoader: { flex: 1, alignItems: 'center', justifyContent: 'center', width: null, height: null }
})
