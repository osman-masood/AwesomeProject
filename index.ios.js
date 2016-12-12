/**
 *
 *
 * @flow
 */

import React, { Component, PropTypes } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    NavigatorIOS,
    TextInput,
    Button
} from 'react-native';

import TabBarComponent from './TabBarComponent';

var NavigationBar = require('react-native-navbar');


class LoginPage extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = { phoneNumber: '(408)515-2051' };
    }

    _onForward = () => {
        this.props.navigator.push({
            title: 'New Jobs',
            component: TabBarComponent,
            navigationBarHidden: true,
        });
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Stowk
                </Text>
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(phoneNumber) => this.setState({phoneNumber})}
                    value={this.state.phoneNumber}
                />
                <Button
                    onPress={this._onForward}
                    title="Send Code"
                    color="#841584"
                    accessibilityLabel="Send code through SMS to log in"
                />
            </View>
        );
    }
}

export default class AwesomeProject extends Component {
    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: LoginPage,
                    title: 'Login',
                    navigationBarHidden: true,
                    passProps: {'title': "Login"}
                    }}
                style={{flex: 1}}
            />
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
