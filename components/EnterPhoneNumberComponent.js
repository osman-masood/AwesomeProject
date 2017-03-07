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
    TouchableHighlight,
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
        loginOrAccount: PropTypes.number.isRequired,

      //  logoutFunction: PropTypes.object.isRequired
    };

    constructor(props) {
        super(props);
        console.log("EnterPhoneNumberComponent constructor with accessToken", props.accessToken, "title", props.title);
        this._onForward = this._onForward.bind(this);
        this.state = {
            phone: null,
            submittingPhoneNumberState: 0, // 0: Not submitted, 1: Loading, 2: Success, 3: Failure
            loginOrAccount: this.props.loginOrAccount, // 0 : Not initialized, 1: Login, 2: Create account
            accessToken: this.props.accessToken
        };

        this.resetPhoneSubmission =this.resetPhoneSubmission.bind(this);
    }


    resetPhoneSubmission(){
        this.setState({
            submittingPhoneNumberState: 0
        });
    }

    _onForward() {

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

                this.setState({submittingPhoneNumberState: 2, phone: phoneNumber, accessToken: accessToken});

            })
            .catch((error) => {
                this.setState({submittingPhoneNumberState: 3});
                console.error("Error fetching code for phone number " + phoneNumber, error);
            });
    }

    render() {
        // TODO add states for loading & failed
        console.log(`Phone Number Component:`, this.state);

        const leftButtonConfig = {
            title: 'Back',
            handler: () => this.props.resetLoginState()
        };

        let returnComponent;

        if (this.state.submittingPhoneNumberState === 2) {
            returnComponent = <EnterCodeComponent title="Enter Code Component"
                                                  navigator={this.props.navigator}
                                                  accessToken={this.state.accessToken}
                                                  loginOrAccount={this.props.loginOrAccount}
                                                  phone={this.state.phone}
                                                  loginFunction={this.props.loginFunction}
                                                  logoutFunction={this.props.logoutFunction}
                                                  resetPhoneSubmission={this.resetPhoneSubmission}
                                                  resetLoginState={this.props.resetLoginState}

            />
        }
        else {
            returnComponent = (


                <View style={{backgroundColor: '#6AB0FC', flex: 1}}>

                    <NavigationBar
                        style={{backgroundColor: '#6AB0FC'}}
                        leftButton={leftButtonConfig}
                    />
                    <View style={styles.container}>
                        <Text style={styles.welcome}>
                            Enter Phone Number
                        </Text>
                        <TextInput
                            style={styles.textInput}
                            onChangeText={(phone) => this.setState({phone})}
                            value={this.state.phone}
                            placeholder="(510)555-1234"
                            multiline={false}
                            autoFocus={true}
                            keyboardType="phone-pad"
                        />
                        <TouchableHighlight
                            style={styles.button}
                            disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}
                            onPress={this._onForward}
                            accessibilityLabel="Send code through SMS to log in" >
                            <Text style={[styles.text, {paddingLeft: 55, paddingRight: 55}]}>{this.state.submittingPhoneNumberState > 0 ? "Getting SMS code..." : "Next"}</Text>
                        </TouchableHighlight>
                        {/*<Button*/}
                            {/*style={styles.buttonStyle}*/}
                            {/*disabled={!this.state.phone || this.state.phone.length < 10 || this.state.submittingPhoneNumberState > 0}*/}
                            {/*onPress={this._onForward}*/}
                            {/*title={this.state.submittingPhoneNumberState > 0 ? "Getting SMS code..." : "Next"}*/}
                            {/*color="#841584"*/}
                            {/*accessibilityLabel="Send code through SMS to log in"*/}
                        {/*/>*/}
                    </View>

                </View>
            );
        }

        return returnComponent;
    }
}



const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 150,
        height: 100,
        backgroundColor: '#6AB0FC',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        marginTop: 10,
        height: 40,
        color: 'white',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    buttonStyle: {
        //textAlign: 'center',
        height: 40
    },
    textInput: {
        height: 40,
        borderColor: 'white',
        borderWidth: 1,
        // borderBottomWidth: 2,
        // borderTopWidth: 0,
        // borderRightWidth: 0,
        // borderLeftWidth: 0,
        marginLeft: 20,
        marginRight: 20,
        padding: 10,

    },
    text: {
        color: '#64B7FF',
        fontSize: 20,
        margin: 5,
        paddingTop: 5,
        paddingBottom: 5,
    },
    button: {
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'white',
        borderColor: 'white',
        margin: 20,
    },
});
