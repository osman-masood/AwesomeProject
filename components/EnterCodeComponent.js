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
    NavigatorIOS,
    TextInput,
    Button,
    AsyncStorage,
    Alert
} from 'react-native';

//import { getAccessTokenFromResponse } from './common';

import NavigationBar from 'react-native-navbar';
//noinspection JSUnresolvedVariable
import TabBarComponent from './TabBarComponent';
import WelcomeComponent from './WelcomeComponent';
import EnterPhoneNumberComponent from './EnterPhoneNumberComponent';
import SignUpPersonalProfileComponent from './SignUpPersonalProfileComponent';

import { getAccessTokenFromResponse, ACCESS_TOKEN_STORAGE_KEY} from './common';


export default class EnterCodeComponent extends Component {
    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired,
        loginOrAccount: PropTypes.number.isRequired,
        phone: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        console.info("EnterCodeComponent constructor with accessToken", props.accessToken, "title", props.title);
        this._onForward = this._onForward.bind(this);
        this.state = {
            code: null,
            submittingCodeState: 0,  // 0: Not submitted, 1: Loading, 2: Success, 3: Failure
            loginOrAccount: this.props.loginOrAccount, // 0 : Not initialized, 1: Login, 2: Create account
            phone: this.props.phone
        };
    }

    openSignUpPersonalProfileComponent = (accessToken) => {
        this.props.navigator.push({
            title: 'Sign up details',
            component: SignUpPersonalProfileComponent,
            navigator: this.props.navigator,
            navigationBarHidden: true,
            passProps: {title: 'Sign up details', navigator: this.props.navigator, accessToken: accessToken, phone: this.props.phone}
        });
    }

    openWelcomeComponent = () => {
        this.props.navigator.push({
            title: 'Welcome Screen',
            component: WelcomeComponent,
            navigator: this.props.navigator,
            navigationBarHidden: true,
            passProps: { title: "Welcome Screen", navigator: this.props.navigator}
        });
    }

    resendCode() {
        //Alert.alert("New Code Sent", "Please enter the new code. ");
            let phoneNumber = this.state.phone;
            if (phoneNumber.substring(0, 2) !== "+1") {
                phoneNumber = "+1" + phoneNumber;
            }

            //Send POST to verify the phoneNumber number
            this.setState({submittingCodeState: 0});
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

                    Alert.alert("New Code Sent", "Please enter the new code. ");

                })
                .catch((error) => {
                    this.setState({submittingPhoneNumberState: 3});
                    console.error("Error fetching code for phone number " + phoneNumber, error);
                });
    }

    _onForward() {

        this.setState({submittingCodeState: 1});
        fetch("https://stowkapi-staging.herokuapp.com/auth/carrier/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Accept': 'application/json',
                'Cookie': 'accessToken=' + this.props.accessToken
            },
            body: JSON.stringify({"code": this.state.code})
        })
            .then((response) => {
                return [response.json(), getAccessTokenFromResponse(response), response.status]
            })
            .then((responseTuple) => {
                const responseJson = responseTuple[0];
                const accessToken = responseTuple[1];
                const statusCode = responseTuple[2];

                if (statusCode === 202) {
                    // User is not registered: Take to registration
                  //  console.error("User is not registered. Registration flow not implemented; must create the user first");
                    this.setState({submittingCodeState: 0});

                    if (this.props.loginOrAccount === 1){
                        Alert.alert(
                            'User not found',
                            "User is not registered. Please register or Sign in with a different account",
                            [
                                {
                                    text: 'Sign up',
                                    onPress: () => {this.openWelcomeComponent()}
                                },
                                {
                                    text: 'Sign in',
                                    onPress: () => {
                                    this.props.navigator.push({
                                        title: 'Enter phoneNumber number',
                                        component: EnterPhoneNumberComponent,
                                        navigator: this.props.navigator,
                                        navigationBarHidden: true,
                                        passProps: {title: 'Enter phoneNumber number', navigator: this.props.navigator}
                                    });
                                }
                                },
                            ]
                        );
                    }
                    else if (this.props.loginOrAccount === 2) {
                        this.openSignUpPersonalProfileComponent(accessToken);
                    }

                }
                else if (statusCode === 200) {
                    // User is registered: Take to new jobs

                    if(this.props.loginOrAccount === 2) {
                        Alert.alert("User Already Registered!", "User is already registered with phone entered. Loging in ...");
                    }

                    console.warn(ACCESS_TOKEN_STORAGE_KEY);
                    AsyncStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
                    console.warn(accessToken);
                    this.setState({submittingCodeState: 2});
                    this.props.navigator.push({
                        title: 'New Jobs',
                        component: TabBarComponent,
                        navigator: this.props.navigator,
                        navigationBarHidden: true,
                        passProps: {accessToken: accessToken}
                    });
                    return accessToken;
                }
                else {
                    throw new Error("Response status code was not 200 or 202, was " + statusCode);
                }
            })
            .catch((error) => {
                    this.setState({submittingCodeState: 3});
                    console.error("Error verifying code " + this.state.code, error);
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
                    Enter Code
                </Text>
                <TextInput
                    style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                    onChangeText={(code) => this.setState({code})}
                    value={this.state.code}
                    placeholder="Enter code"
                    multiline={false}
                    autoFocus={true}
                    keyboardType="phone-pad"
                />

            </View>


            <Button
                style={styles.buttonStyle}
                onPress={this._onForward}
                title="Sign In"
                color="#841584"
                accessibilityLabel="Send code through SMS to log in"

            />

            <Button
                style={styles.buttonStyle}
                onPress={ () => {this.resendCode()}}
                title="Resend Code"
                color="#841584"
                accessibilityLabel="Send code again through SMS to log in"

            />
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
