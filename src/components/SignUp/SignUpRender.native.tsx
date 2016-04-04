import * as React from 'react-native'
const { Alert, Component, StyleSheet, Text, View, TextInput, Image, ScrollView } = React
import * as StateActions from '../../native/actions'
const bindActionCreators = require('redux').bindActionCreators
const connect = require('react-redux').connect
const Button = require('apsl-react-native-button')
const settings = require('../../../config/settings')

@connect(
    undefined,
    (dispatch) => ({ actions: bindActionCreators(StateActions, dispatch) })
)
export default class SignUpRender extends Component<any, any> {
    constructor(props, context) {
        super(props, context)
        this.state = {name: '', email: '', password: '', passwordConfirmation: ''}
    }
    public render() {
        return (
            <Image
                style={styles.container}
                source={require('../../../public/nativeBG.jpg')} >
                <ScrollView style={styles.inputs}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder='Name'
                            placeholderTextColor='#BBB'
                            autoCorrect={false}
                            onChangeText={(text) => this.setState({name: text})}
                            value={this.state.name}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Email'
                            autoCapitalize='none'
                            autoCorrect={false}
                            keyboardType='email-address'
                            placeholderTextColor='#BBB'
                            onChangeText={(text) => this.setState({email: text})}
                            value={this.state.email}
                        />
                        <TextInput
                            style={styles.input}
                            password={true}
                            secureTextEntry={true}
                            placeholder='Password'
                            placeholderTextColor='#BBB'
                            onChangeText={(text) => this.setState({password: text})}
                            value={this.state.password}
                        />
                        <TextInput
                            style={styles.input}
                            password={true}
                            secureTextEntry={true}
                            placeholder='Password confirmation'
                            placeholderTextColor='#BBB'
                            onChangeText={(text) => this.setState({confirmation: text})}
                            value={this.state.confirmation}
                        />
                        <Button
                            style={styles.buttonStyle} textStyle={styles.textStyle}
                            onPress={this.signUp.bind(this)}>
                            SIGN UP
                        </Button>
                    </View>
                    <Text style={styles.extraText} onPress={() => this.props.actions.navigateBack()}>
                        Already a member?
                    </Text>
                </ScrollView>
            </Image>
        )
    }

    private async signUp() {
        const {name, email, password, confirmation} = this.state
        if (name && email && password && confirmation && password === confirmation) {
            const formData = new FormData();
            formData.append('name', name)
            formData.append('email', email)
            formData.append('password', password)
            this.props.actions.startMainTransition()
            try {
                const response = await fetch(`http://${settings.hostname}:${settings.serverPort}/sign_up`, {
                  method: 'POST', body: formData, credentials: 'same-origin'
                })
                if (response.status !== 200 && response.statusText !== 'OK') {
                    throw new Error('Invalid credentials.')
                }
                this.props.actions.setAsAuthenticated()
            } catch (e) {
                if (e && e.message === 'Network request failed') { this.props.actions.setAsOffline() }
                Alert.alert(e.message)
            }
            this.props.actions.finishMainTransition()
        } else { Alert.alert('Invalid data.') }
    }
}
const styles = StyleSheet.create({
    buttonStyle: {
        marginTop: 10,
        height: 40,
        borderColor: '#4CAF50',
        borderRadius: 3,
        backgroundColor: '#00C853'
    },
    textStyle: { color: '#fff', fontWeight: 'bold', fontSize: 14, },
    inputUsername: {
      marginLeft: 15,
      width: 20,
      height: 20
    },
    extraText: { color: '#fff', textAlign: 'center', backgroundColor: 'transparent', paddingBottom: 20},
    container: { flex: 1, width: null, height: null },
    inputs: { paddingTop: 40 },
    input: {
        height: 40,
        fontSize: 14,
        color: '#444',
        borderRadius: 3,
        backgroundColor: '#DDD',
        padding: 10,
        marginBottom: 5,
        marginTop: 5,
    },
    inputContainer: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        margin: 20,
        borderWidth: 0
    }
})
