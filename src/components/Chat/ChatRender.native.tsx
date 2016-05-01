import * as React from 'react-native'
import {Chat} from './index'
const { View, Text, StyleSheet, TextInput, ScrollView } = React
const Button = require('apsl-react-native-button')

export default class ChatRender extends Chat {

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
