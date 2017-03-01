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

import EnterPhoneNumberComponent from './EnterPhoneNumberComponent';
import SignUpPersonalProfileComponent from './SignUpPersonalProfileComponent';

class  WelcomeComponent extends Component{

    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = { loginOrAccount: 0 }; // 0 : Not initialized, 1: Login, 2: Create account
    }

    openEnterPhoneNumberComponent = (loginOrAccount) => {
        this.props.navigator.push({
            title: 'Enter phoneNumber number',
            component: EnterPhoneNumberComponent,
            navigator: this.props.navigator,
            navigationBarHidden: true,
            passProps: {title: 'Enter phoneNumber number', navigator: this.props.navigator, loginOrAccount: loginOrAccount}
        });
    }


    render() {
        // TODO add states for loading & failed
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Welcome to Stowk!
                </Text>
                <Button
                    //  disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}
                    onPress={ () => {this.openEnterPhoneNumberComponent(1)}}
                    title={"Login"}
                    color="#841584"
                    accessibilityLabel="Send code through SMS to log in"
                />
                <Button
                    //  disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}
                    onPress={ () => {this.openEnterPhoneNumberComponent(2)}}
                    title={"Create Account"}
                    color="#841584"
                    accessibilityLabel="Send code through SMS to log in"
                />
            </View>
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

export default WelcomeComponent;
