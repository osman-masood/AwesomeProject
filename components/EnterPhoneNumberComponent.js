/**
 * @flow
 */

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
//noinspection JSUnresolvedVariable
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Navigator,
    TextInput,
    Button
} from 'react-native';

import { getAccessTokenFromResponse } from './common';

import EnterCodeComponent from "./EnterCodeComponent";
import { Actions } from 'react-native-router-flux';

import NavigationBar from 'react-native-navbar';


export default class EnterPhoneNumberComponent extends Component {
    //noinspection JSUnusedGlobalSymbols,JSUnresolvedVariable
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        loginOrAccount: PropTypes.number.isRequired

    };

    constructor(props) {
        super(props);
        console.log("EnterPhoneNumberComponent constructor with accessToken", props.accessToken, "title", props.title);
        this._onForward = this._onForward.bind(this);
        this.state = {
            phone: null,
            submittingPhoneNumberState: 0, // 0: Not submitted, 1: Loading, 2: Success, 3: Failure
            loginOrAccount: this.props.loginOrAccount, // 0 : Not initialized, 1: Login, 2: Create account
        };
    }

    verifyPhone() {

    }


    _onForward() { // convention: _ = private
        // Prepend +1 to phone number if not there


        let phoneNumber = this.state.phone;
        if (phoneNumber.substring(0, 2) !== "+1") {
            phoneNumber = "+1" + phoneNumber;
        }

        // Send POST to verify the phoneNumber number
        this.setState({submittingPhoneNumberState: 1});
        fetch("https://stowkapi-staging.herokuapp.com/auth/carrier/code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8"
            },
            body: JSON.stringify({"phone": phoneNumber})
        })
            .then((response) => {
                console.log("Response from /auth/carrier/code for phone ", phoneNumber, ": ", response);
                return [response.json(), getAccessTokenFromResponse(response)];
            })
            .then((responseJsonAndAccessToken) => {
                const responseJson = responseJsonAndAccessToken[0];
                const accessToken = responseJsonAndAccessToken[1];

                this.setState({submittingPhoneNumberState: 2, phone: phoneNumber});


                this.props.navigator.push({
                    id: 'EnterCode',
                    title: 'Enter Code',
                    accessToken: accessToken,
                    component: EnterCodeComponent,
                    navigator: this.props.navigator,
                    navigationBarHidden: true,
                    passProps: {title: 'Enter Code', navigator: this.props.navigator, accessToken: accessToken, loginOrAccount: this.state.loginOrAccount,  phone: this.state.phone}
                });
                // this.props.navigator.push({
                //     title: 'Enter Code',
                //     component: EnterCodeComponent,
                //     navigator: this.props.navigator,
                //     navigationBarHidden: true,
                //     passProps: {accessToken: accessToken, title: 'Enter Code'},
                //
                // });
            })
            .catch((error) => {
                this.setState({submittingPhoneNumberState: 3});
                console.error("Error fetching code for phone number " + phoneNumber, error);
            });
    }

    render() {
        // TODO add states for loading & failed
        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.props.navigator.pop()
        };

        return (


            <View style={{backgroundColor: '#F5FCFF', flex: 1}}>

                <NavigationBar
                    style={{backgroundColor: '#F5FCFF'}}
                    leftButton={leftButtonConfig}

                />
            <View style={styles.container}>
                <Text style={styles.welcome}>
                    Enter Phone Number
                </Text>
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(phone) => this.setState({phone})}
                    value={this.state.phone}
                    placeholder="(510)555-1234"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="phone-pad"
                />
                <Button
                    style={styles.buttonStyle}
                    disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}
                    onPress={this._onForward}
                    title={this.state.submittingPhoneNumberState > 0 ? "Getting SMS code..." : "Next"}
                    color="#841584"
                    accessibilityLabel="Send code through SMS to log in"
                />
            </View>

            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        marginTop: 150,
        height: 100
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 10,
        backgroundColor: '#F5FCFF',
        height: 40
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    buttonStyle: {
        textAlign: 'center',
        height: 40
    }
});
