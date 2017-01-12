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
    Button
} from 'react-native';
import EnterPhoneNumberComponent from "./components/EnterPhoneNumberComponent";
import TabBarComponent from "./components/TabBarComponent";

export default class AwesomeProject extends Component {
    render() {
        console.info("Rendering AwesomeProject with props ", this.props);
        return (
            <NavigatorIOS
                initialRoute={{
                    component: TabBarComponent,  // TabBarComponent, // EnterPhoneNumberComponent,
                    title: 'Enter Phone Number',
                    navigationBarHidden: true,
                    passProps: {title: "Enter Phone Number", accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODc1Yjg0YTNmZTZjMzI3NTFmZjg1MGEiLCJlbWFpbCI6IkVyaWNhX1NtaXRoMjZAeWFob28uY29tIiwiZmlyc3ROYW1lIjoiQWxleGlzIiwibGFzdE5hbWUiOiJIZWlkZW5yZWljaCIsInBob25lIjoiKzE2Njk5MDAyODUxIiwicm9sZSI6InVzZXIiLCJwcm9maWxlIjp7InR5cGUiOiJjYXJyaWVyIiwicm9sZSI6Im93bmVyIiwiY2FycmllciI6IjU4NzViODRhM2ZlNmMzMjc1MWZmODU2MiJ9LCJ2ZXJpZmllZCI6dHJ1ZSwiaWF0IjoxNDg0MTExMzI3LCJleHAiOjE1MTU2NDczMjd9.Iha0A_KhaREkTvWSWrmKwYDvszyoJeHno2H4BYe1RlA'}
                    }}
                style={{flex: 1}}
            />
        );
    }
}

AppRegistry.registerComponent('AwesomeProject', () => AwesomeProject);
