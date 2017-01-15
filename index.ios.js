/**
 *
 *
 * @flow
 */

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
    ActivityIndicator,
    Dimensions
} from 'react-native';
import EnterPhoneNumberComponent from "./components/EnterPhoneNumberComponent";
//noinspection JSUnresolvedVariable
import TabBarComponent from "./components/TabBarComponent";
import {ACCESS_TOKEN_STORAGE_KEY} from "./components/common";


export default class AwesomeProject extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <NavigatorIOS
                initialRoute={{
                    component: MainScreen,
                    title: 'Enter Phone Number',
                    navigationBarHidden: true,
                    passProps: {title: ""}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

class MainScreen extends Component {

    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.setState({
            token: null,
            wait: true
        });
        //AsyncStorage.setItem('stowkAccessToken', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODc1Yjg0YTNmZTZjMzI3NTFmZjg1MGEiLCJlbWFpbCI6IkVyaWNhX1NtaXRoMjZAeWFob28uY29tIiwiZmlyc3ROYW1lIjoiQWxleGlzIiwibGFzdE5hbWUiOiJIZWlkZW5yZWljaCIsInBob25lIjoiKzE2Njk5MDAyODUxIiwicm9sZSI6InVzZXIiLCJwcm9maWxlIjp7InR5cGUiOiJjYXJyaWVyIiwicm9sZSI6Im93bmVyIiwiY2FycmllciI6IjU4NzViODRhM2ZlNmMzMjc1MWZmODU2MiJ9LCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNDg0MTExMzI3LCJleHAiOjE1MTU2NDczMjd9.Iha0A_KhaREkTvWSWrmKwYDvszyoJeHno2H4BYe1RlA');
        this.loadAccessToken().then((result) => {
            this.setState({
                token: result,
                wait: false
            })
        });
    }

    componentWillReceiveProps(nextProps) {

    }

    loadAccessToken = async () => {
        let retVal;
        try {
            retVal = await AsyncStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        } catch (e) {
            console.error("loadAccessToken: Error getting stowkAccessToken", e);
            retVal = null;
        }
        return retVal;
        //eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODc1Yjg0YTNmZTZjMzI3NTFmZjg1MGEiLCJlbWFpbCI6IkVyaWNhX1NtaXRoMjZAeWFob28uY29tIiwiZmlyc3ROYW1lIjoiQWxleGlzIiwibGFzdE5hbWUiOiJIZWlkZW5yZWljaCIsInBob25lIjoiKzE2Njk5MDAyODUxIiwicm9sZSI6InVzZXIiLCJwcm9maWxlIjp7InR5cGUiOiJjYXJyaWVyIiwicm9sZSI6Im93bmVyIiwiY2FycmllciI6IjU4NzViODRhM2ZlNmMzMjc1MWZmODU2MiJ9LCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNDg0MTExMzI3LCJleHAiOjE1MTU2NDczMjd9.Iha0A_KhaREkTvWSWrmKwYDvszyoJeHno2H4BYe1RlA
    };

    render() {
        let retComponent;
        if (this.state.wait) {
            retComponent = <WaitScreen/>;
        } else {
            if (this.state.token == null) {
                retComponent = <EnterPhoneNumberComponent title="Enter phone number" navigator={this.props.navigator}/>;
            } else {
                retComponent = <TabBarComponent accessToken={this.state.token} navigator={this.props.navigator}/>;
            }
        }
        return retComponent;
    }
}

class WaitScreen extends Component {

    render() {
        return <View style={styles.screenOverlay}>
            <Text style={{textAlign:'center'}}>Loading Stowk</Text>
            <ActivityIndicator
                animating={true}
                style={[styles.centering, {height: 80}]}
                size="large"
            />
        </View>
    }
}

const styles = StyleSheet.create({
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    screenOverlay: {
        height: Dimensions.get("window").height,
        width: Dimensions.get("window").width,
        backgroundColor: '#FFFFFF',
        paddingTop: 100
    }
});

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
