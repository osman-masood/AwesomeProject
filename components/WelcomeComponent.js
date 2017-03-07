import React, { Component, PropTypes } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    NavigatorIOS,
    TextInput,
    TouchableHighlight,
    Button
} from 'react-native';

import EnterPhoneNumberComponent from './EnterPhoneNumberComponent';
import SignUpPersonalProfileComponent from './SignUpPersonalProfileComponent';

class  WelcomeComponent extends Component{

    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,

      //  logoutFunction: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            loginOrAccount: this.props.loginOrAccount, // 0 : Not initialized, 1: Login, 2: Create account
            accessToken: this.props.accessToken
        };

        this.resetLoginState = this.resetLoginState.bind(this);
    }

    resetLoginState() {
        this.setState({
            loginOrAccount: 0
        });
    }

    componentWillMount(){

        this.setState({
            loginOrAccount: 0
        });
    }

    openEnterPhoneNumberComponent = (loginOrAccount) => {
        this.setState({
            loginOrAccount: loginOrAccount
        });
    }

    render() {

        console.log(`Welcome Screen:`, this.state);
        // TODO add states for loading & failed
        if(this.state.loginOrAccount != 0) {

            return (
                <EnterPhoneNumberComponent title="Phone Number Component"
                                           navigator={this.props.navigator}
                                           loginOrAccount={this.state.loginOrAccount}
                                           logoutFunction={this.props.logoutFunction}
                                           loginFunction={this.props.loginFunction}
                                           accessToken= {this.state.accessToken}
                                           resetLoginState= {this.resetLoginState}
                />
            );
        }else{
            return (
        <View style={styles.container}>
            <Text style={styles.welcome}>
                Welcome to Stowk!
            </Text>
            <TouchableHighlight style={styles.button} accessibilityLabel="Send code through SMS to log in" onPress={ () => {this.openEnterPhoneNumberComponent(1)}}>
                <Text style={[styles.text, {paddingLeft: 100, paddingRight: 100}]}>Login</Text>
            </TouchableHighlight>
            <TouchableHighlight style={styles.button} accessibilityLabel="Send code through SMS to log in" onPress={ () => {this.openEnterPhoneNumberComponent(2)}}>
                <Text style={[styles.text, {paddingLeft: 55, paddingRight: 55}]}>Create Account</Text>
            </TouchableHighlight>
            <Text style={styles.terms}>
                By signing up, I agree to stowk’s Terms of Service and Payment terms of Service and Privacy Policy.
            </Text>
            {/*<Button*/}
            {/*//  disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}*/}
            {/*onPress={ () => {this.openEnterPhoneNumberComponent(1)}}*/}
            {/*title={"Login"}*/}
            {/*accessibilityLabel="Send code through SMS to log in"*/}
            {/*style={styles.button}*/}
            {/*/>*/}
            {/*<Button*/}
            {/*//  disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}*/}
            {/*onPress={ () => {this.openEnterPhoneNumberComponent(2)}}*/}
            {/*title={"Create Account"}*/}
            {/*accessibilityLabel="Send code through SMS to log in"*/}
            {/*style={styles.button}*/}
            {/*/>*/}
        </View>
            );
            }

        }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6AB0FC',
        flexDirection: 'column',
    },
    welcome: {
        fontSize: 30,
        textAlign: 'center',
        margin: 10,
        marginBottom: 20,
        color: 'white',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    button: {
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        borderColor: 'white',
        margin: 20,
    },
    text: {
        color: '#64B7FF',
        fontSize: 20,
        margin: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    terms: {
        color: 'white',
        justifyContent: 'flex-end',
        fontSize: 12,
        margin: 20,
        textAlign: 'center',
    }
});

export default WelcomeComponent;