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
    Button
} from 'react-native';

//noinspection JSUnresolvedVariable
import TabBarComponent from './TabBarComponent';

import { getAccessTokenFromResponse } from './common';


export default class SignUpPersonalProfileComponent extends Component {
    //noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
    static propTypes = {
        title: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired,
        accessToken: PropTypes.string.isRequired
    };

    constructor(props) {
        super(props);
        console.info("SignUpPersonalProfileComponent constructor with accessToken", props.accessToken, "title", props.title);
        this._onForward = this._onForward.bind(this);
        this.state = { code: null, submittingCodeState: 0 };  // 0: Not submitted, 1: Loading, 2: Success, 3: Failure
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
                return [response.json(), getAccessTokenFromResponse(response)]
            })
            .then((responseJsonAndAccessToken) => {
                const responseJson = responseJsonAndAccessToken[0];
                const accessToken = responseJsonAndAccessToken[1];

                if (responseJson['verified'] === true && responseJson['phone']) {
                    // User is not registered: Take to registration

                } else {
                    // User is registered: Take to new jobs
                    this.setState({submittingCodeState: 2});
                    this.props.navigator.push({
                        title: 'New Jobs',
                        component: TabBarComponent,
                        navigator: this.props.navigator,
                        navigationBarHidden: true,
                        passProps: {accessToken: accessToken}
                    });
                }
            })
            .catch((error) => {
                this.setState({submittingCodeState: 3});
                console.error("Error verifying code " + this.state.code, error);
            });
    }

    render() {
        // TODO add states for loading & failed
        return (
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
                <Button
                    onPress={this._onForward}
                    title="Sign In"
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
