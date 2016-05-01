import * as React from 'react-native'
import * as Relay from 'react-relay'
import * as stateActions from '../../native/actions'
import Login from '../Login'
import SignUp from '../SignUp'
import Chat from '../Chat'
const { Component, NavigationExperimental, View, Text, Platform, DeviceEventEmitter } = React
const { AnimatedView, Card, Header } = NavigationExperimental
const bindActionCreators = require('redux').bindActionCreators
const connect = require('react-redux').connect
const settings = require('../../../config/settings')

class PlayAppRoute extends Relay.Route {
    constructor() { super() }
    public static queries: any = { root: () => Relay.QL`query { root }` }
    public static routeName: any = 'PlayAppRoute'
}

@connect(
    (state) => ({
        navigationState: state.navigationState,
        isAuthenticated: state.isAuthenticated,
        windowDimensions: state.windowDimensions
    }),
    (dispatch) => ({actions: bindActionCreators(stateActions, dispatch)})
)
export default class MainLayoutRender extends Component<any, any> {
    constructor(props, context) {
        super(props, context)
    }

    public componentWillMount () {
        if (Platform.OS === 'ios') { // Android handles keyboard layout adjustment by default
            DeviceEventEmitter.addListener('keyboardWillShow', this.props.actions.keyboardWillShow)
            DeviceEventEmitter.addListener('keyboardWillHide', this.props.actions.keyboardWillHide)
        }
    }

    public render() {
        const {navigationState, actions, isAuthenticated, windowDimensions: wd } = this.props
        const wrapperStyle = Platform.OS === 'ios' ? { height: wd.visibleHeight } : { flex: 1 }
        return (
            <View
                style={wrapperStyle}
                onLayout={() => { this.props.actions.updateDimensions() }} >
                <AnimatedView
                    navigationState={navigationState}
                    style={{flex: 1}}
                    onNavigate={(action) => { if (action.type === 'back') { actions.navigateBack() }}}
                    renderOverlay={props => {
                        if (!isAuthenticated) { return }
                        return <Header
                            {...props}
                            style={{backgroundColor: '#E65100'}}
                            renderTitleComponent={(headerProps) => {
                                return (
                                    <Header.Title textStyle={{ color: '#fff' }}>
                                        {headerProps.scene.navigationState.key}
                                    </Header.Title>
                                )
                            }}
                            renderRightComponent={() => {
                                return (
                                    <Text
                                        style={{ color: '#fff', marginTop: 15, marginRight: 10 }}
                                        onPress={this.signOut.bind(this)}>
                                        Exit
                                    </Text>
                                )
                            }}
                            onNavigate={actions.navigateBack}
                        />
                    }}
                    renderScene={props => (
                        <Card {...props}
                            key={props.scene.navigationState.key}
                            renderScene={this.renderScene.bind(this)}
                        />
                    )}
                />
            </View>
        )
    }

    private async signOut() {
        this.props.actions.startMainTransition()
        try {
            const response = await fetch(`http://${settings.hostname}:${settings.serverPort}/logout`, {
              method: 'GET', credentials: 'same-origin', headers: { 'Accept': 'application/json' }
            })
            if (response.status !== 200) { throw new Error('Logout fail.') }
            this.props.actions.setAsNotAuthenticated()
        } catch (e) {
            if (e && e.message === 'Network request failed') { this.props.actions.setAsOffline() }
            this.props.actions.setAsNotAuthenticated()
        }
        this.props.actions.finishMainTransition()
    }

    private renderScene({scene}) {
        switch (scene.navigationState.key) {
            case 'Login':
                return <Login />
            case 'SignUp':
                return <SignUp />
            case 'Chat':
                return <Relay.RootContainer
                            Component={Chat}
                            route={new PlayAppRoute()}
                            forceFetch={true}
                        />
            default:
                return <Login />
        }
    }
}
